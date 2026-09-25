from typing import Dict, Any, List
from services.rag import load_knowledge_base


def generate_clinical_insights(
    validated_results: Dict[str, Any],
    rag_citations: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates actionable clinical insights, lifestyle guidance, and
    physician discussion questions grounded in the medical knowledge base.
    """
    kb = load_knowledge_base()
    kb_map = {item["biomarker"].lower(): item for item in kb}

    insights = []
    recommendations = set()
    lifestyle_tips = set()
    questions = []

    for biomarker, data in validated_results.items():
        status = data.get("status", "NORMAL").upper()
        if status == "NORMAL":
            continue

        norm_name = biomarker.lower()
        info = kb_map.get(norm_name)

        if not info:
            # Fallback heuristic if not in KB
            urgency = "Priority" if status == "CRITICAL" else "Routine"
            insight_item = {
                "biomarker": biomarker,
                "status": status,
                "clinical_significance": f"{biomarker} is {status.lower()} compared to the reference interval. Clinical correlation with a physician is recommended.",
                "follow_up": [f"Discuss {biomarker} with a doctor", f"Repeat {biomarker} if advised"],
                "lifestyle": ["Maintain a balanced diet and proper hydration"],
                "urgency": urgency
            }
            insights.append(insight_item)
            recommendations.add(f"Discuss {biomarker} ({status}) with a physician")
            questions.append(f"What could be causing my {biomarker} to be {status.lower()}?")
            continue

        # Use KB entry
        if status == "LOW":
            significance = info.get("low_implication", "")
        else:
            significance = info.get("high_implication", "")

        urgency = "Urgent" if status == "CRITICAL" else "Priority" if status in ["HIGH", "LOW"] and info.get("panel") in ["KFT", "LFT", "CARDIAC"] else "Routine"

        follow_up_raw = info.get("clinical_follow_up", "")
        follow_up_list = [item.strip() for item in follow_up_raw.split(";") if item.strip()] if ";" in follow_up_raw else [follow_up_raw] if follow_up_raw else ["Consult a physician"]

        lifestyle_raw = info.get("lifestyle_guidance", "")
        lifestyle_list = [item.strip() for item in lifestyle_raw.split(".") if item.strip()] if lifestyle_raw else []

        insights.append({
            "biomarker": biomarker,
            "status": status,
            "clinical_significance": significance,
            "follow_up": follow_up_list,
            "lifestyle": lifestyle_list,
            "urgency": urgency,
            "specialist": info.get("specialist", "General Physician")
        })

        for f in follow_up_list:
            if len(f) > 3:
                recommendations.add(f)

        for l in lifestyle_list:
            if len(l) > 3:
                lifestyle_tips.add(l)

        questions.append(f"My {biomarker} level is {status.lower()} ({data.get('value')} {data.get('unit', '')}). What does this mean for my overall health?")

    # Add general checkups if all normal
    if not insights:
        recommendations.add("Continue routine annual wellness checkups")
        lifestyle_tips.add("Maintain regular physical activity and a balanced diet")
        questions.append("Are there any preventive screenings recommended for my age and profile?")

    return {
        "clinical_insights": insights,
        "recommendations": sorted(list(recommendations)),
        "lifestyle_tips": sorted(list(lifestyle_tips)),
        "questions_to_discuss_with_doctor": questions[:5]
    }