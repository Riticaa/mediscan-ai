"""
rag.py — Retrieval-Augmented Generation for medical knowledge context.

Uses the TF-IDF semantic search from embeddings.py to find the most
relevant knowledge-base entries for each biomarker in the report.
"""
from typing import Dict, Any, List, Tuple
from services.embeddings import semantic_search, load_embeddings, load_knowledge_base


def retrieve_medical_knowledge(
    validated_biomarkers: Dict[str, Any]
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Retrieves clinical knowledge context for all biomarkers in the report.
    Prioritises abnormal (LOW, HIGH, CRITICAL) biomarkers.

    Returns:
    - context_str: Formatted clinical context string for LLM injection
    - citations:   Structured list of citations for frontend display
    """
    # Ensure index is ready (no-op if already built)
    load_embeddings()

    retrieved_items: List[str] = []
    citations: List[Dict[str, Any]] = []
    seen_biomarkers: set = set()

    # Sort so abnormal biomarkers appear first in context
    sorted_biomarkers = sorted(
        validated_biomarkers.items(),
        key=lambda kv: 0 if kv[1].get("status") in {"CRITICAL", "LOW", "HIGH"} else 1,
    )

    for name, data in sorted_biomarkers:
        status = data.get("status", "NORMAL")

        # Use semantic search to find the best knowledge-base match
        hits = semantic_search(name, top_k=1)
        if not hits:
            continue

        _score, matched_item = hits[0]
        biomarker_key = matched_item.get("biomarker", "").lower()

        # De-duplicate (same KB entry matched by multiple aliases)
        if biomarker_key in seen_biomarkers:
            continue
        seen_biomarkers.add(biomarker_key)

        # Choose clinically relevant text section based on status
        if status == "LOW":
            clinical_relevance = matched_item.get("low_implication", "")
        elif status in {"HIGH", "CRITICAL"}:
            clinical_relevance = matched_item.get("high_implication", "")
        else:
            clinical_relevance = (
                f"Normal finding. Maintains healthy physiological role: "
                f"{matched_item.get('description', '')}"
            )

        entry_text = (
            f"Biomarker: {matched_item['biomarker']} (Status: {status})\n"
            f"Description: {matched_item.get('description', '')}\n"
            f"Clinical Context: {clinical_relevance}\n"
            f"Lifestyle & Diet: {matched_item.get('lifestyle_guidance', '')}\n"
            f"Recommended Follow-up: {matched_item.get('clinical_follow_up', '')}\n"
            f"Specialist: {matched_item.get('specialist', '')}\n"
            f"Authoritative Source: {matched_item.get('source', 'Medical Guidelines')}"
        )

        retrieved_items.append(entry_text)

        citations.append({
            "biomarker": matched_item["biomarker"],
            "status": status,
            "source": matched_item.get("source", "WHO / NIH / Mayo Clinic"),
            "clinical_significance": clinical_relevance,
            "lifestyle": matched_item.get("lifestyle_guidance", ""),
            "follow_up": matched_item.get("clinical_follow_up", ""),
            "specialist": matched_item.get("specialist", "General Physician"),
        })

    context_str = "\n\n---\n\n".join(retrieved_items)
    return context_str, citations
