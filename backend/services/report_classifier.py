import re
from typing import Dict, Any

REPORT_PATTERNS = {
    "CBC": [
        "hemoglobin", "haemoglobin", "wbc", "rbc", "platelet", "mcv", "mch",
        "mchc", "hematocrit", "pcv", "neutrophil", "lymphocyte", "leucocyte",
        "complete blood count", "cbc"
    ],
    "LFT": [
        "bilirubin", "sgot", "sgpt", "ast", "alt", "albumin", "alkaline phosphatase",
        "alp", "globulin", "liver function test", "lft", "hepatic", "ggt"
    ],
    "KFT": [
        "creatinine", "urea", "bun", "uric acid", "egfr", "kidney function test",
        "renal function test", "kft", "rft", "blood urea nitrogen"
    ],
    "LIPID": [
        "cholesterol", "hdl", "ldl", "vldl", "triglycerides", "lipid profile",
        "lipid panel", "total cholesterol"
    ],
    "THYROID": [
        "tsh", "t3", "t4", "free t3", "free t4", "thyroid", "thyroid profile",
        "thyroxine", "triiodothyronine"
    ],
    "DIABETES": [
        "hba1c", "fasting glucose", "blood sugar", "ppbs", "fbs", "glucose",
        "glycated hemoglobin", "diabetes", "random blood sugar", "rbs"
    ],
    "VITAMIN": [
        "vitamin d", "vitamin b12", "folate", "vit d", "25-oh vitamin d",
        "vitamin", "cobalamin"
    ],
    "ELECTROLYTES": [
        "sodium", "potassium", "chloride", "bicarbonate", "electrolyte", "serum electrolytes"
    ],
    "URINE": [
        "urine", "pus cells", "epithelial cells", "urine protein", "urine glucose",
        "ketones", "specific gravity", "urine routine"
    ],
    "CARDIAC": [
        "crp", "hs-crp", "troponin", "c-reactive protein", "cardiac"
    ]
}


def classify_report(text: str) -> Dict[str, Any]:
    """
    Classifies a medical report into its clinical panel category.
    Returns: { "report_type": str, "confidence": float, "detected_panels": list, "scores": dict }
    """
    text_lower = text.lower()
    scores = {}

    for report_type, keywords in REPORT_PATTERNS.items():
        score = 0
        for keyword in keywords:
            if re.search(rf"\b{re.escape(keyword)}\b", text_lower):
                score += 1
        scores[report_type] = score

    # Find panels with non-zero match scores
    detected_panels = [k for k, v in scores.items() if v >= 2]
    best_report = max(scores, key=scores.get)

    if scores[best_report] == 0:
        return {
            "report_type": "GENERAL_PATHOLOGY",
            "confidence": 0.5,
            "detected_panels": ["GENERAL_PATHOLOGY"],
            "scores": scores,
        }

    # If multiple panels have high scores, it's a comprehensive health check
    if len(detected_panels) >= 3:
        panel_name = "COMPREHENSIVE_PANEL"
    else:
        panel_name = best_report

    confidence = min(1.0, scores[best_report] / max(len(REPORT_PATTERNS[best_report]) * 0.4, 1))

    return {
        "report_type": panel_name,
        "confidence": round(confidence, 2),
        "detected_panels": detected_panels if detected_panels else [best_report],
        "scores": scores,
    }