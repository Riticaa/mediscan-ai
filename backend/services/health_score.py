from typing import Dict, Any, List


class HealthScore:
    """
    Calculates comprehensive clinical health metrics, 5-level risk classification,
    and parameter score breakdown.
    """

    def __init__(self):
        # Clinical importance weights
        self.biomarker_weights = {
            # Vital Renal
            "Creatinine": 25,
            "Urea": 15,
            "BUN": 15,
            "eGFR": 25,
            "Uric Acid": 10,

            # Vital Liver
            "Total Bilirubin": 20,
            "SGPT (ALT)": 20,
            "SGOT (AST)": 20,
            "Alkaline Phosphatase": 15,

            # Vital Hematology
            "Hemoglobin": 20,
            "Platelets": 25,
            "WBC": 20,
            "RBC": 15,

            # Vital Electrolytes & Cardiac
            "Potassium": 30,
            "Sodium": 25,
            "Calcium": 20,
            "CRP": 15,

            # Glycemic & Metabolic
            "HbA1c": 25,
            "Glucose": 20,
            "Fasting Blood Sugar": 20,
            "Postprandial Blood Sugar": 20,

            # Thyroid
            "TSH": 15,
            "Free T4": 15,

            # Lipids
            "Total Cholesterol": 10,
            "LDL": 15,
            "Triglycerides": 15,
            "HDL": 10,

            # Vitamins
            "Vitamin D": 5,
            "Vitamin B12": 5,
            "Serum Iron": 10,
            "Ferritin": 10
        }

    def calculate(self, validated_report: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates:
        - risk_badge: 'All Normal' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Risk'
        - risk_score: 0 to 100
        - health_score: 100 to 0 (inverse)
        - risk_reason: Explanation of why this risk was assigned
        - score_breakdown: total, normal, high, low, critical, abnormal_total
        - recommended_specialist: Recommended medical specialist
        """
        total = len(validated_report)
        normal = 0
        high = 0
        low = 0
        critical = 0

        risk_accum = 0
        abnormal_names = []
        critical_names = []
        specialists = []

        for biomarker, data in validated_report.items():
            status = data.get("status", "NORMAL").upper()
            weight = self.biomarker_weights.get(biomarker, 10)

            if status == "NORMAL":
                normal += 1
            elif status == "LOW":
                low += 1
                risk_accum += weight
                abnormal_names.append(f"Low {biomarker}")
            elif status == "HIGH":
                high += 1
                risk_accum += weight
                abnormal_names.append(f"High {biomarker}")
            elif status == "CRITICAL":
                critical += 1
                risk_accum += weight + 30
                critical_names.append(f"Critically Abnormal {biomarker}")
                abnormal_names.append(f"Critical {biomarker}")

            # Assign specialist recommendations based on abnormal categories
            if status != "NORMAL":
                if biomarker in ["Creatinine", "Urea", "BUN", "eGFR", "Uric Acid"]:
                    specialists.append("Nephrologist")
                elif biomarker in ["SGPT (ALT)", "SGOT (AST)", "Total Bilirubin", "Alkaline Phosphatase"]:
                    specialists.append("Gastroenterologist / Hepatologist")
                elif biomarker in ["Hemoglobin", "Platelets", "WBC", "RBC"]:
                    specialists.append("Hematologist")
                elif biomarker in ["HbA1c", "Glucose", "Fasting Blood Sugar", "TSH"]:
                    specialists.append("Endocrinologist")
                elif biomarker in ["Total Cholesterol", "LDL", "Triglycerides", "Potassium", "CRP"]:
                    specialists.append("Cardiologist")
                else:
                    specialists.append("General Physician")

        abnormal_total = low + high + critical

        # 5-Level Risk Classification
        if critical > 0:
            risk_badge = "Critical Risk"
            risk_score = min(100, max(85, 75 + risk_accum // 2))
            risk_reason = f"Urgent clinical attention recommended due to {', '.join(critical_names[:2])}."
        elif abnormal_total == 0:
            risk_badge = "All Normal"
            risk_score = 5
            risk_reason = "All extracted parameters are within expected biological reference intervals."
        elif abnormal_total <= 2 and risk_accum < 30:
            risk_badge = "Low Risk"
            risk_score = min(30, max(12, risk_accum))
            risk_reason = f"Mild deviations noted in {', '.join(abnormal_names[:2])}. Generally manageable with routine lifestyle or medical follow-up."
        elif abnormal_total <= 4 and risk_accum < 65:
            risk_badge = "Medium Risk"
            risk_score = min(65, max(35, risk_accum))
            risk_reason = f"Moderate abnormalities detected across {', '.join(abnormal_names[:3])}. Physician consultation advised."
        else:
            risk_badge = "High Risk"
            risk_score = min(84, max(68, risk_accum))
            risk_reason = f"Significant abnormalities in key clinical markers ({', '.join(abnormal_names[:3])}) warranting prompt professional evaluation."

        health_score = max(0, min(100, 100 - risk_score))

        # Determine primary recommended specialist
        if specialists:
            # Pick most frequent or highest priority
            primary_specialist = max(set(specialists), key=specialists.count)
        else:
            primary_specialist = "General Physician"

        return {
            "risk_badge": risk_badge,
            "risk_level": risk_badge,
            "risk_score": risk_score,
            "health_score": health_score,
            "risk_reason": risk_reason,
            "specialist": primary_specialist,
            "score_breakdown": {
                "total_parameters": total,
                "normal": normal,
                "high": high,
                "low": low,
                "critical": critical,
                "abnormal_total": abnormal_total
            }
        }