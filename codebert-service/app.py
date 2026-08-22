from __future__ import annotations

import difflib
import hashlib
import math
from typing import Any

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None


app = FastAPI(title="CodeBERT Embedding Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Submission(BaseModel):
    id: str
    code: str = Field(default="")


class EmbeddingsRequest(BaseModel):
    submissions: list[Submission]


class DiffRequest(BaseModel):
    leftId: str
    rightId: str
    leftCode: str
    rightCode: str


class MLPredictRequest(BaseModel):
    tokenScore: float
    structuralScore: float
    semanticScore: float
    isCrossLanguage: int = 0
    languagePair: str = "txt-txt"


_model: Any = None


def _load_model() -> Any:
    global _model
    if _model is not None:
        return _model

    if SentenceTransformer is None:
        _model = False
        return _model

    try:
        # CodeBERT model via sentence-transformers adapter
        _model = SentenceTransformer("microsoft/codebert-base")
    except Exception:
        # Fallback mode keeps API available when model download is blocked.
        _model = False
    return _model


def _hashed_embedding(text: str, dims: int = 10000) -> np.ndarray:
    vec = np.zeros(dims, dtype=np.float32)
    if not text:
        return vec

    chars = text.lower()
    if len(chars) < 3:
        chars = chars + " " * (3 - len(chars))

    for i in range(len(chars) - 2):
        trigram = chars[i : i + 3]
        digest = hashlib.blake2b(trigram.encode("utf-8", errors="ignore"), digest_size=8).digest()
        idx = int.from_bytes(digest, byteorder="little") % dims
        vec[idx] += 1.0

    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec


def _embed_texts(submissions: list[Submission]) -> np.ndarray:
    model = _load_model()
    embeddings_list = []

    for item in submissions:
        text = item.code or ""
        lines = text.splitlines()
        chunks = []
        chunk_size = 50
        
        for i in range(0, max(1, len(lines)), chunk_size):
            chunk = "\n".join(lines[i:i+chunk_size])
            chunks.append(chunk if chunk else " ")

        if model:
            chunk_embs = model.encode(chunks, normalize_embeddings=True)
            doc_emb = np.mean(chunk_embs, axis=0)
            norm = np.linalg.norm(doc_emb)
            if norm > 0:
                doc_emb = doc_emb / norm
            embeddings_list.append(doc_emb)
        else:
            chunk_embs = [_hashed_embedding(c) for c in chunks]
            doc_emb = np.mean(chunk_embs, axis=0)
            norm = np.linalg.norm(doc_emb)
            if norm > 0:
                doc_emb = doc_emb / norm
            embeddings_list.append(doc_emb)

    return np.array(embeddings_list, dtype=np.float32)


@app.get("/health")
def health() -> dict[str, Any]:
    model = _load_model()
    return {
        "status": "ok",
        "engine": "codebert" if model else "hash-fallback",
        "ml_classifier": "ready" if _ml_model else "unavailable"
    }


# ── Machine Learning Classifier ──
_ml_model: Any = None

def _train_ml_model() -> Any:
    global _ml_model
    if _ml_model is not None:
        return _ml_model
        
    import os
    from joblib import load
    
    model_path = os.path.join(os.path.dirname(__file__), "model.joblib")
    if os.path.exists(model_path):
        _ml_model = load(model_path)
    else:
        print("Warning: model.joblib not found. Please run train_model.py first.")
        _ml_model = None
    
    return _ml_model

# Load it immediately on startup
_train_ml_model()

@app.post("/api/ml/predict")
def ml_predict(payload: MLPredictRequest) -> dict[str, float]:
    clf = _train_ml_model()
    if clf is None:
        return {"riskScore": 0.0, "confidence": 0.0}
        
    X = np.array([[
        payload.tokenScore, 
        payload.structuralScore, 
        payload.semanticScore, 
        payload.isCrossLanguage, 
        payload.languagePair
    ]], dtype=object)
    
    # Get probability of class 1 (plagiarism)
    prob = clf.predict_proba(X)[0][1]
    
    # Confidence is how far the probability is from 0.5
    confidence = abs(prob - 0.5) * 2.0 * 100.0
    
    # Convert to percentage
    score = float(prob) * 100.0
    return {
        "riskScore": round(score, 2),
        "confidence": round(confidence, 2)
    }


@app.post("/api/embeddings/similarity-matrix")
def similarity_matrix(payload: EmbeddingsRequest) -> dict[str, Any]:
    submissions = payload.submissions
    if len(submissions) < 2:
        return {
            "students": [s.id for s in submissions],
            "matrix": [[100.0] for _ in submissions],
            "nodes": [],
            "links": [],
        }

    vectors = _embed_texts(submissions)

    # Calculate raw cosine similarity (since embeddings are normalized, dot product = cosine)
    raw_sim = np.matmul(vectors, vectors.T)
    
    # CodeBERT's raw cosine similarities for code occupy a very narrow cone.
    # Empirically observed:
    #   - Unrelated Java: 0.97 - 0.99
    #   - Plagiarized Java: 0.995 - 1.0
    #   - Cross-language plagiarism: 0.98 - 0.985
    # We map [0.95, 1.0] to [0, 100] to spread this discriminative range.
    matrix = np.clip((raw_sim - 0.95) / 0.05 * 100.0, 0.0, 100.0)

    # Force diagonal to 100
    np.fill_diagonal(matrix, 100.0)

    ids = [s.id for s in submissions]
    nodes = []
    links = []

    for i, node_id in enumerate(ids):
        row = matrix[i]
        avg_sim = float((np.sum(row) - 100.0) / max(1, (len(ids) - 1)))
        nodes.append({
            "id": node_id,
            "avgSimilarity": round(avg_sim, 2),
        })

    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            score = float(matrix[i][j])
            if score >= 55.0:
                links.append({
                    "source": ids[i],
                    "target": ids[j],
                    "weight": round(score, 2),
                })

    return {
        "students": ids,
        "matrix": np.round(matrix, 2).tolist(),
        "nodes": nodes,
        "links": sorted(links, key=lambda item: item["weight"], reverse=True),
    }


@app.post("/api/embeddings/diff")
def code_diff(payload: DiffRequest) -> dict[str, Any]:
    left_lines = payload.leftCode.splitlines()
    right_lines = payload.rightCode.splitlines()

    matcher = difflib.SequenceMatcher(None, left_lines, right_lines)
    rows = []
    left_no = 1
    right_no = 1

    for opcode, i1, i2, j1, j2 in matcher.get_opcodes():
        if opcode == "equal":
            for i, j in zip(range(i1, i2), range(j1, j2)):
                rows.append(
                    {
                        "type": "same",
                        "leftNo": left_no,
                        "rightNo": right_no,
                        "left": left_lines[i],
                        "right": right_lines[j],
                    }
                )
                left_no += 1
                right_no += 1
        elif opcode == "replace":
            left_chunk = left_lines[i1:i2]
            right_chunk = right_lines[j1:j2]
            max_len = max(len(left_chunk), len(right_chunk))
            for idx in range(max_len):
                left_text = left_chunk[idx] if idx < len(left_chunk) else ""
                right_text = right_chunk[idx] if idx < len(right_chunk) else ""
                rows.append(
                    {
                        "type": "replace",
                        "leftNo": left_no if left_text != "" else None,
                        "rightNo": right_no if right_text != "" else None,
                        "left": left_text,
                        "right": right_text,
                    }
                )
                if left_text != "":
                    left_no += 1
                if right_text != "":
                    right_no += 1
        elif opcode == "delete":
            for i in range(i1, i2):
                rows.append(
                    {
                        "type": "delete",
                        "leftNo": left_no,
                        "rightNo": None,
                        "left": left_lines[i],
                        "right": "",
                    }
                )
                left_no += 1
        elif opcode == "insert":
            for j in range(j1, j2):
                rows.append(
                    {
                        "type": "insert",
                        "leftNo": None,
                        "rightNo": right_no,
                        "left": "",
                        "right": right_lines[j],
                    }
                )
                right_no += 1

    changed = sum(1 for row in rows if row["type"] != "same")
    total = max(1, len(rows))
    overlap = round((1.0 - (changed / total)) * 100.0, 2)

    return {
        "leftId": payload.leftId,
        "rightId": payload.rightId,
        "rows": rows,
        "summary": {
            "lineCount": len(rows),
            "changedLines": changed,
            "overlapPercent": max(0.0, overlap),
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8090, reload=True)

import requests
import os

class DeepScanRequest(BaseModel):
    code1: str
    code2: str
    filename1: str = "file1"
    filename2: str = "file2"

from dotenv import load_dotenv
load_dotenv()

@app.post("/api/embeddings/deepscan")
def deep_scan(payload: DeepScanRequest) -> dict[str, Any]:
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        return {"error": "GROQ_API_KEY not found in backend environment (.env).", "plagiarized": False, "explanation": "API Key Missing."}
    
    prompt = f"""You are an expert Computer Science professor evaluating two student submissions for plagiarism.
Ignore standard framework boilerplate (like Spring Boot annotations, standard imports, getter/setters).
Focus on the core algorithmic logic, variable structures, and edge cases. Watch out for cross-language translation (e.g. Java to Python).

File 1 ({payload.filename1}):
{payload.code1[:2000]}

File 2 ({payload.filename2}):
{payload.code2[:2000]}

Are these two files plagiarized from each other? 
Respond with EXACTLY the word YES or NO on the first line. 
On the next lines, provide a 2-3 sentence explanation of why."""

    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "openai/gpt-oss-20b",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1
        }
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data, timeout=10)
        response.raise_for_status()
        
        result = response.json()["choices"][0]["message"]["content"].strip()
        lines = result.split('\n')
        is_plagiarized = 'YES' in lines[0].upper()
        explanation = '\n'.join(lines[1:]).strip()
        
        if not explanation:
            explanation = lines[0]
            
        return {
            "plagiarized": is_plagiarized,
            "explanation": explanation
        }
    except Exception as e:
        return {"error": str(e), "plagiarized": False, "explanation": f"LLM Error: {str(e)}"}
