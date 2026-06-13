from typing import List

SPECIALIST_MAP = {
    "haemoglobin": "Haematologist",
    "hemoglobin": "Haematologist",
    "rbc": "Haematologist",
    "wbc": "Haematologist",
    "platelet": "Haematologist",
    "glucose": "Endocrinologist",
    "hba1c": "Endocrinologist",
    "cholesterol": "Cardiologist",
    "ldl": "Cardiologist",
    "hdl": "Cardiologist",
    "triglycerides": "Cardiologist",
    "sgpt": "Gastroenterologist",
    "sgot": "Gastroenterologist",
    "creatinine": "Nephrologist",
    "urea": "Nephrologist",
    "tsh": "Endocrinologist",
    "vitamin": "General Physician",
    "iron": "Haematologist",
}


def determine_specialist(abnormal_findings: List[str], parameters: list) -> str:
    votes = {}
    for finding in abnormal_findings:
        f = finding.lower()
        for keyword, specialist in SPECIALIST_MAP.items():
            if keyword in f:
                votes[specialist] = votes.get(specialist, 0) + 1
    for param in parameters:
        if param.get("status") in ["High", "Low", "Critical"]:
            n = param.get("name", "").lower()
            for keyword, specialist in SPECIALIST_MAP.items():
                if keyword in n:
                    votes[specialist] = votes.get(specialist, 0) + 1
    return max(votes, key=votes.get) if votes else "General Physician"


def calculate_risk_score(analysis: dict) -> dict:
    parameters = analysis.get("parameters", [])
    abnormal_findings = analysis.get("abnormal_findings", [])

    total = len(parameters)
    critical = sum(1 for p in parameters if p.get("status") == "Critical")
    high = sum(1 for p in parameters if p.get("status") == "High")
    low = sum(1 for p in parameters if p.get("status") == "Low")
    normal = sum(1 for p in parameters if p.get("status") == "Normal")

    score = min((critical * 30) + (high * 15) + (low * 10), 100)

    if score == 0:
        badge, color = "All Normal", "green"
    elif score <= 20:
        badge, color = "Low Risk", "green"
    elif score <= 45:
        badge, color = "Medium Risk", "yellow"
    elif score <= 70:
        badge, color = "High Risk", "orange"
    else:
        badge, color = "Critical Risk", "red"

    return {
        **analysis,
        "risk_score": score,
        "risk_badge": badge,
        "risk_color": color,
        "specialist": determine_specialist(abnormal_findings, parameters),
        "score_breakdown": {
            "total_parameters": total,
            "normal": normal,
            "low": low,
            "high": high,
            "critical": critical,
            "abnormal_total": critical + high + low
        }
    }