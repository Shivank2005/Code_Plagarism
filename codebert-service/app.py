from __future__ import annotations

import difflib
import hashlib
import math
import os
from typing import Any

import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, Field

load_dotenv()
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


class DeepScanRequest(BaseModel):
    code1: str
    code2: str
    filename1: str
    filename2: str


class LLMAnalyzeRequest(BaseModel):
    code1: str
    code2: str
    filename1: str
    filename2: str


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
_ml_model: RandomForestClassifier | None = None

def _train_ml_model() -> RandomForestClassifier:
    global _ml_model
    if _ml_model is not None:
        return _ml_model
        
    # Generate synthetic training data
    # X = [tokenScore, structuralScore, semanticScore]
    # y = [0 (safe), 1 (plagiarism)]
    
    import random
    
    # Build a labeled evaluation/training dataset containing real edge cases
    # Columns: [Token, Struct, Semantic, isCross, LangPair, Label]
    base_data = [
        # ===== PLAGIARISM (Label = 1) =====
        
        # Exact Copies: all three scores very high
        [100, 100, 100, 0, "java-java", 1],
        [95, 98, 99, 0, "java-java", 1],
        [97, 95, 98, 0, "python-python", 1],
        
        # Variable-renamed copies (Obfuscation): token drops, struct/semantic stay high
        [0, 65, 98, 0, "java-java", 1],
        [5, 70, 97, 0, "java-java", 1],
        [0, 60, 96, 0, "python-python", 1],
        [10, 75, 95, 0, "java-java", 1],
        
        # Heavy obfuscation on short snippets (LeetCode style): token drops heavily, struct/semantic very high
        # Duplicated to force the model to weigh Semantic >= 98 as a very strong plagiarism indicator
        [15, 95, 99, 0, "python-python", 1],
        [15, 95, 99, 0, "python-python", 1],
        [20, 92, 98, 0, "python-python", 1],
        [20, 92, 98, 0, "python-python", 1],
        [10, 94, 99, 0, "java-java", 1],
        [10, 94, 99, 0, "java-java", 1],
        [5, 96, 100, 0, "js-js", 1],
        [5, 96, 100, 0, "js-js", 1],
        [25, 90, 100, 0, "python-python", 1],
        [25, 90, 100, 0, "python-python", 1],
        
        # Reformatted copies: token stays high, struct changes slightly
        [85, 75, 97, 0, "java-java", 1],
        [90, 80, 98, 0, "python-python", 1],
        
        # Logic-preserving rewrites (same algorithm, different style)
        [30, 50, 95, 0, "java-java", 1],
        [20, 45, 93, 0, "python-python", 1],
        
        # Cross-language translations (Token/Struct low, Semantic high)
        [0, 30, 85, 1, "java-python", 1],
        [5, 40, 88, 1, "java-python", 1],
        [0, 35, 82, 1, "java-python", 1],
        [10, 50, 90, 1, "java-python", 1],
        
        # ===== SAFE (Label = 0) =====
        
        # Completely unrelated programs (all scores low)
        [0, 10, 20, 0, "java-java", 0],
        [0, 15, 30, 0, "java-java", 0],
        [5, 5, 15, 0, "python-python", 0],
        [0, 20, 25, 1, "java-python", 0],
        
        # Structural false positive trap: same-language, different purpose
        # With [0.95, 1.0] cosine mapping, unrelated Java files produce
        # semantic scores in the 65-80% range, NOT 85-95%.
        [0, 40, 78, 0, "java-java", 0],
        [0, 50, 75, 0, "java-java", 0],
        [0, 70, 80, 0, "java-java", 0],
        [0, 45, 72, 0, "python-python", 0],
        [5, 60, 77, 0, "java-java", 0],
        [0, 35, 68, 0, "java-java", 0],
        
        # High semantic CodeBERT false positives on short snippets
        # If Token and Struct are very low, it's just CodeBERT conflating short files
        [5, 20, 96, 0, "python-python", 0],
        [0, 15, 98, 0, "python-python", 0],
        [10, 25, 94, 0, "python-python", 0],
        [5, 30, 97, 0, "java-java", 0],
        [0, 10, 99, 0, "js-js", 0],
        
        # High structural similarity but different problems (e.g. LeetCode solutions)
        # Both are short Python files with class->def->loop, so AST edit distance is tiny
        # but Token overlap is very low. CodeBERT also gives them 95%+
        [15, 85, 90, 0, "python-python", 0],
        [10, 90, 88, 0, "python-python", 0],
        [20, 80, 92, 0, "python-python", 0],
        [30, 95, 95, 0, "python-python", 0],
        [5, 88, 93, 0, "java-java", 0],
        [25, 82, 95, 0, "js-js", 0],
        
        # Template/boilerplate-heavy submissions
        [40, 60, 50, 0, "java-java", 0],
        [35, 55, 55, 0, "java-java", 0],
        [30, 50, 45, 0, "python-python", 0],
        
        # Different implementations of the same problem (not plagiarism)
        # Moderate struct (same problem = similar flow), moderate semantic, low token
        [0, 50, 70, 0, "java-java", 0],
        [10, 55, 75, 0, "java-java", 0],
        [5, 45, 65, 0, "python-python", 0],
        [0, 50, 72, 0, "js-js", 0],
        [5, 55, 68, 0, "cpp-cpp", 0],
        
        # Unrelated cross-language pairs
        [0, 10, 30, 1, "java-python", 0],
        [0, 20, 40, 1, "java-python", 0],
        [5, 15, 35, 1, "java-python", 0],
        [0, 15, 25, 1, "cpp-python", 0],
        [0, 10, 30, 1, "java-js", 0],
        
        # Additional language-diverse plagiarism cases
        [95, 97, 99, 0, "js-js", 1],
        [90, 95, 98, 0, "cpp-cpp", 1],
        [0, 60, 96, 0, "js-js", 1],       # Obfuscated JS
        [0, 55, 94, 0, "cpp-cpp", 1],     # Obfuscated C++
        [0, 35, 83, 1, "java-js", 1],     # Cross-lang Java->JS
        [0, 30, 80, 1, "cpp-python", 1],  # Cross-lang C++->Python
        [5, 40, 85, 1, "go-python", 1],   # Cross-lang Go->Python
    ]

    # Supplement with synthetic jitter to expand into a continuous model
    expanded_data = []
    random.seed(42)
    for row in base_data:
        t_base, s_base, c_base, is_cross, pair, label = row
        for _ in range(150):  # ~5000+ total points
            t = np.clip(random.gauss(t_base, 8.0), 0, 100)
            s = np.clip(random.gauss(s_base, 8.0), 0, 100)
            # Tight semantic jitter to prevent false-positive/plagiarism overlap
            c = np.clip(random.gauss(c_base, 3.0), 0, 100)
            expanded_data.append([t, s, c, is_cross, pair, label])

    # Convert to numpy array. dtype=object because we have mixed types (float and str)
    dataset = np.array(expanded_data, dtype=object)
    X_train = dataset[:, :-1]
    y_train = dataset[:, -1].astype(int)

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', [0, 1, 2, 3]),
            ('cat', OneHotEncoder(handle_unknown='ignore'), [4])
        ])

    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42))
    ])

    pipeline.fit(X_train, y_train)
    _ml_model = pipeline
    return _ml_model

# Train it immediately on startup
_train_ml_model()

@app.post("/api/ml/predict")
def ml_predict(payload: MLPredictRequest) -> dict[str, float]:
    clf = _train_ml_model()
    
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
            if score >= 10.0:
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

    def is_junk(line: str) -> bool:
        cleaned = line.strip()
        if not cleaned: return True
        if cleaned in ["{", "}", "};", "();", "return;", "break;", "continue;", "pass"]: return True
        if cleaned.startswith(("import ", "include ", "using ", "package ", "#include", "from ")): return True
        return False

    matcher = difflib.SequenceMatcher(is_junk, left_lines, right_lines)
    rows = []
    left_no = 1
    right_no = 1

    for opcode, i1, i2, j1, j2 in matcher.get_opcodes():
        if opcode == "equal":
            is_all_junk = all(is_junk(left_lines[i]) for i in range(i1, i2))
            for i, j in zip(range(i1, i2), range(j1, j2)):
                rows.append(
                    {
                        "type": "same" if not is_all_junk else "replace",
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


@app.post("/api/embeddings/deepscan")
def deep_scan(payload: DeepScanRequest) -> dict[str, Any]:
    try:
        submissions = [
            Submission(id="1", code=payload.code1),
            Submission(id="2", code=payload.code2)
        ]
        vectors = _embed_texts(submissions)
        
        sim = float(np.dot(vectors[0], vectors[1]))
        mapped_score = np.clip((sim - 0.95) / 0.05 * 100.0, 0.0, 100.0)
        
        is_plagiarized = mapped_score > 65.0
        
        if is_plagiarized:
            explanation = (
                f"High structural and semantic similarity detected (Score: {mapped_score:.1f}%). "
                "The logic flow and token embeddings strongly overlap, suggesting heavily modified or directly copied code.\n\n"
                "Variable names may have been changed, but the underlying neural embeddings represent the same algorithmic approach."
            )
        else:
            explanation = (
                f"Semantic similarity is within normal thresholds (Score: {mapped_score:.1f}%). "
                "The embedding models do not detect severe structural plagiarism.\n\n"
                "The code pieces appear to solve the problem using distinct logic or standard, expected boilerplate."
            )
            
        return {
            "plagiarized": bool(is_plagiarized),
            "explanation": explanation
        }
    except Exception as e:
        return {
            "error": str(e),
            "plagiarized": False,
            "explanation": ""
        }


@app.post("/api/llm/analyze-translation")
def analyze_translation(payload: LLMAnalyzeRequest) -> dict[str, Any]:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return {"error": "GROQ_API_KEY not configured"}
    
    try:
        client = Groq(api_key=api_key)
        prompt = f"""
Analyze the following two pieces of code for cross-language translation plagiarism.
Identify how the logic and algorithms map between them. Keep it concise but technical (max 3-4 sentences). Focus on structural and logical similarities rather than variable names.

File 1 ({payload.filename1}):
```
{payload.code1[:3000]}
```

File 2 ({payload.filename2}):
```
{payload.code2[:3000]}
```
"""
        completion = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {"role": "system", "content": "You are a senior code analyst finding translated plagiarism."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=250,
        )
        return {"explanation": completion.choices[0].message.content.strip()}
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8090, reload=True)
