"""
embeddings.py — Lightweight semantic search for the RAG knowledge base.

Uses TF-IDF cosine similarity to find the most relevant knowledge-base
entries for a given biomarker query, without requiring external vector DBs
or heavy ML frameworks (numpy-only, ships with Python scientific stack).

For a production upgrade, swap `_tfidf_search` with a FAISS/ChromaDB call.
"""
from __future__ import annotations

import math
import re
import os
import json
from typing import List, Dict, Any, Tuple

# ─── Knowledge base path (mirrors rag.py) ────────────────────────────────────
_KB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "knowledge",
    "medical_knowledge_base.json",
)

# ─── Module-level cache ──────────────────────────────────────────────────────
_KB_DOCS: List[Dict[str, Any]] = []
_TF_IDF_INDEX: Dict[str, Dict[str, float]] = {}   # {doc_id: {term: tfidf}}
_IDF: Dict[str, float] = {}                         # {term: idf}


# ─── Tokenizer ───────────────────────────────────────────────────────────────
def _tokenize(text: str) -> List[str]:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return [t for t in text.split() if len(t) > 1]


# ─── Build index ─────────────────────────────────────────────────────────────
def _build_index(docs: List[Dict[str, Any]]) -> None:
    global _TF_IDF_INDEX, _IDF

    if not docs:
        return

    # Concatenate all text fields into a document string per entry
    doc_tokens: List[List[str]] = []
    for doc in docs:
        fields = [
            doc.get("biomarker", ""),
            doc.get("description", ""),
            doc.get("low_implication", ""),
            doc.get("high_implication", ""),
            doc.get("lifestyle_guidance", ""),
            doc.get("clinical_follow_up", ""),
            doc.get("specialist", ""),
            " ".join(doc.get("aliases", [])),
        ]
        tokens = _tokenize(" ".join(fields))
        doc_tokens.append(tokens)

    N = len(doc_tokens)

    # Compute DF
    df: Dict[str, int] = {}
    for tokens in doc_tokens:
        for term in set(tokens):
            df[term] = df.get(term, 0) + 1

    # Compute IDF (log-smoothed)
    _IDF = {term: math.log((N + 1) / (count + 1)) + 1.0 for term, count in df.items()}

    # Compute TF-IDF per document
    _TF_IDF_INDEX = {}
    for idx, tokens in enumerate(doc_tokens):
        tf: Dict[str, float] = {}
        total = len(tokens) or 1
        for term in tokens:
            tf[term] = tf.get(term, 0) + 1
        tfidf_vec: Dict[str, float] = {
            term: (count / total) * _IDF.get(term, 1.0)
            for term, count in tf.items()
        }
        _TF_IDF_INDEX[str(idx)] = tfidf_vec


def _cosine(vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
    """Cosine similarity between two sparse TF-IDF vectors."""
    dot = sum(vec_a.get(t, 0.0) * v for t, v in vec_b.items())
    mag_a = math.sqrt(sum(v * v for v in vec_a.values())) or 1.0
    mag_b = math.sqrt(sum(v * v for v in vec_b.values())) or 1.0
    return dot / (mag_a * mag_b)


# ─── Public API ──────────────────────────────────────────────────────────────
def load_embeddings() -> None:
    """Loads the knowledge base and builds the TF-IDF index (called once at startup)."""
    global _KB_DOCS
    if _KB_DOCS:
        return   # Already loaded

    if not os.path.exists(_KB_PATH):
        print(f"[Embeddings] Knowledge base not found at {_KB_PATH}. Semantic search disabled.")
        return

    try:
        with open(_KB_PATH, "r", encoding="utf-8") as f:
            _KB_DOCS = json.load(f)
        _build_index(_KB_DOCS)
        print(f"[Embeddings] TF-IDF index built for {len(_KB_DOCS)} medical knowledge entries.")
    except Exception as e:
        print(f"[Embeddings] Failed to load knowledge base: {e}")


def load_knowledge_base() -> List[Dict[str, Any]]:
    """Returns the full list of medical knowledge base document records."""
    load_embeddings()
    return _KB_DOCS


def semantic_search(query: str, top_k: int = 5) -> List[Tuple[float, Dict[str, Any]]]:
    """
    Returns the top-k most semantically relevant knowledge-base entries for `query`.

    Returns list of (score, entry_dict) sorted by score descending.
    Falls back to keyword substring matching if TF-IDF index is empty.
    """
    if not _KB_DOCS:
        load_embeddings()

    if not _KB_DOCS:
        return []

    query_tokens = _tokenize(query)
    if not query_tokens:
        return []

    # Build query TF-IDF vector
    query_tf: Dict[str, float] = {}
    for term in query_tokens:
        query_tf[term] = query_tf.get(term, 0) + 1
    total = len(query_tokens)
    query_vec = {
        term: (count / total) * _IDF.get(term, 0.5)
        for term, count in query_tf.items()
    }

    # Score all documents
    scores: List[Tuple[float, int]] = []
    for idx_str, doc_vec in _TF_IDF_INDEX.items():
        score = _cosine(query_vec, doc_vec)
        if score > 0:
            scores.append((score, int(idx_str)))

    scores.sort(key=lambda x: x[0], reverse=True)

    results = []
    for score, idx in scores[:top_k]:
        results.append((score, _KB_DOCS[idx]))

    # Fallback: if no cosine hits, do simple substring match
    if not results:
        q_lower = query.lower()
        for doc in _KB_DOCS:
            biomarker = doc.get("biomarker", "").lower()
            aliases = [a.lower() for a in doc.get("aliases", [])]
            if q_lower in biomarker or any(q_lower in a for a in aliases):
                results.append((1.0, doc))
            if len(results) >= top_k:
                break

    return results


def find_relevant_for_biomarkers(biomarkers: List[str], top_k: int = 3) -> List[Dict[str, Any]]:
    """
    For a list of biomarker names, returns the most relevant knowledge-base
    entries using semantic search, de-duplicated by biomarker name.
    """
    if not _KB_DOCS:
        load_embeddings()

    seen: set = set()
    results: List[Dict[str, Any]] = []

    for bm in biomarkers:
        hits = semantic_search(bm, top_k=top_k)
        for _score, entry in hits:
            key = entry.get("biomarker", "").lower()
            if key not in seen:
                seen.add(key)
                results.append(entry)

    return results
