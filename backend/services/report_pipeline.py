from typing import Dict, Any
from services.report_classifier import classify_report
from services.generic_parser import parse_report, extract_patient_info
from services.reference_ranges import check_reference_ranges
from services.health_score import HealthScore
from services.clinical_insights import generate_clinical_insights
from services.rag import retrieve_medical_knowledge
from services.llm import explain_report


class ReportPipeline:
    """
    End-to-end clinical pipeline connecting OCR extraction, generalized parsing,
    reference range validation, RAG retrieval, risk scoring, and LLM explanation.
    """

    def __init__(self):
        self.health = HealthScore()

    def process(self, text: str, gender: str = "female", language: str = "english") -> Dict[str, Any]:
        # ---------------------------------------------------------
        # Step 1: Patient Demographic & Header Extraction
        # ---------------------------------------------------------
        patient_info = extract_patient_info(text)

        # If gender was detected in report header, prioritize it over form default
        effective_gender = patient_info["gender"] if patient_info.get("gender_detected") else gender

        # ---------------------------------------------------------
        # Step 2: Classify Report & Detect Panels
        # ---------------------------------------------------------
        report_info = classify_report(text)
        report_type = report_info.get("report_type", "GENERAL_PATHOLOGY")
        confidence = report_info.get("confidence", 0.8)

        # ---------------------------------------------------------
        # Step 3: Extract Biomarkers & Reference Ranges
        # ---------------------------------------------------------
        raw_biomarkers = parse_report(text)

        # ---------------------------------------------------------
        # Step 4: Validate Reference Ranges (Report-first, then DB fallback)
        # ---------------------------------------------------------
        validated_biomarkers = check_reference_ranges(raw_biomarkers, gender=effective_gender)

        # ---------------------------------------------------------
        # Step 5: RAG Medical Knowledge Retrieval
        # ---------------------------------------------------------
        rag_context, citations = retrieve_medical_knowledge(validated_biomarkers)

        # ---------------------------------------------------------
        # Step 6: 5-Level Risk Classification & Health Scoring
        # ---------------------------------------------------------
        risk_data = self.health.calculate(validated_biomarkers)

        # ---------------------------------------------------------
        # Step 7: Clinical Insights & Recommendations
        # ---------------------------------------------------------
        insights_data = generate_clinical_insights(validated_biomarkers, citations)

        # ---------------------------------------------------------
        # Step 8: LLM Bilingual Explanation
        # ---------------------------------------------------------
        llm_result = explain_report(
            validated_report=validated_biomarkers,
            rag_context=rag_context,
            risk_data=risk_data,
            language=language
        )

        # Format parameter cards for frontend consumption
        parameter_explanations = llm_result.get("parameter_explanations", {})
        frontend_parameters = []

        for name, data in validated_biomarkers.items():
            status = data.get("status", "NORMAL")
            # Map status to Capitalized ('Normal', 'High', 'Low', 'Critical') for frontend styling
            status_display = "Normal" if status == "NORMAL" else "High" if status == "HIGH" else "Low" if status == "LOW" else "Critical"

            explanation = parameter_explanations.get(name)
            if not explanation:
                if status == "NORMAL":
                    explanation = f"{name} is within healthy clinical reference limits."
                elif status == "LOW":
                    explanation = f"{name} is lower than the recommended reference range."
                elif status == "CRITICAL":
                    explanation = f"{name} is critically abnormal and requires urgent review."
                else:
                    explanation = f"{name} is elevated above the recommended reference range."

            val_display = f"{data['value']} {data.get('unit', '')}".strip()
            norm_range_display = data.get("reference_range", {}).get("display", "Not specified")

            frontend_parameters.append({
                "name": name,
                "original_name": data.get("original_name", name),
                "value": val_display,
                "raw_value": data["value"],
                "unit": data.get("unit", ""),
                "normal_range": norm_range_display,
                "status": status_display,
                "explanation": explanation
            })

        # Assemble unified analysis object matching frontend expectations
        analysis_payload = {
            "report_type": report_type,
            "classification_confidence": confidence,
            "risk_badge": risk_data["risk_badge"],
            "risk_level": risk_data["risk_level"],
            "risk_score": risk_data["risk_score"],
            "health_score": risk_data["health_score"],
            "risk_reason": risk_data["risk_reason"],
            "specialist": risk_data["specialist"],
            "score_breakdown": risk_data["score_breakdown"],
            "summary": llm_result.get("summary", ""),
            "patient_friendly_explanation": llm_result.get("patient_friendly_explanation", ""),
            "abnormal_findings": llm_result.get("abnormal_findings", []),
            "parameters": frontend_parameters,
            "patient_info": patient_info,
            "clinical_insights": insights_data.get("clinical_insights", []),
            "recommendations": insights_data.get("recommendations", []),
            "lifestyle_tips": insights_data.get("lifestyle_tips", []),
            "questions_to_discuss_with_doctor": (
                llm_result.get("questions_to_discuss_with_doctor")
                or insights_data.get("questions_to_discuss_with_doctor", [])
            ),
            "citations": citations,
            "disclaimer": llm_result.get(
                "disclaimer",
                "Disclaimer: MediScan AI is an educational analysis platform and does not provide medical diagnoses. Please consult a qualified healthcare professional."
            )
        }

        return {
            "metadata": {
                "report_type": report_type,
                "confidence": confidence,
                "gender": effective_gender,
                "patient_info": patient_info
            },
            "biomarkers": validated_biomarkers,
            "health_score": risk_data,
            "clinical_insights": insights_data["clinical_insights"],
            "recommendations": insights_data["recommendations"],
            "citations": citations,
            "analysis": analysis_payload
        }