from __future__ import annotations

import difflib
import hashlib
import math
from typing import Any

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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


def _hashed_embedding(text: str, dims: int = 384) -> np.ndarray:
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
    texts = [item.code or "" for item in submissions]

    if model:
        embeddings = model.encode(texts, normalize_embeddings=True)
        return np.array(embeddings, dtype=np.float32)

    fallback = [_hashed_embedding(text) for text in texts]
    return np.array(fallback, dtype=np.float32)


@app.get("/health")
def health() -> dict[str, Any]:
    model = _load_model()
    return {
        "status": "ok",
        "engine": "codebert" if model else "hash-fallback",
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
    sim = np.clip(np.matmul(vectors, vectors.T), -1.0, 1.0)
    matrix = ((sim + 1.0) / 2.0) * 100.0

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
