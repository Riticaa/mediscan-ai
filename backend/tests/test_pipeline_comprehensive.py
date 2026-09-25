import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

from services.reference_ranges import check_reference_ranges, parse_range_string
from services.generic_parser import parse_report, extract_patient_info, normalize_parameter
from services.report_classifier import classify_report
from services.rag import retrieve_medical_knowledge
from services.health_score import HealthScore
from services.clinical_insights import generate_clinical_insights


def test_reference_range_parser():
    print("Testing parse_range_string...")
    # Range formats
    assert parse_range_string("12.0 - 15.5")[:2] == (12.0, 15.5), "Failed on standard range"
    assert parse_range_string("12-15")[:2] == (12.0, 15.0), "Failed on integer range"
    assert parse_range_string("< 200")[:2] == (0.0, 200.0), "Failed on less than"
    assert parse_range_string("<= 100")[:2] == (0.0, 100.0), "Failed on less than or equal"
    assert parse_range_string("> 40")[:2] == (40.0, None), "Failed on greater than"
    assert parse_range_string("Up to 1.2")[:2] == (0.0, 1.2), "Failed on up to"
    assert parse_range_string((12.0, 15.5))[:2] == (12.0, 15.5), "Failed on tuple"
    assert parse_range_string({"low": 10, "high": 20})[:2] == (10.0, 20.0), "Failed on dict"
    # Malformed / None shouldn't crash
    assert parse_range_string(None)[:2] == (None, None), "Failed on None"
    assert parse_range_string("invalid text")[:2] == (None, None), "Failed on invalid string"
    print("[PASS] parse_range_string passed all checks!")


def test_validation_type_safety():
    print("\nTesting check_reference_ranges type safety and report precedence...")
    biomarkers = {
        # Report provided range that differs from DB
        "Hemoglobin": {
            "value": 11.2,
            "unit": "g/dL",
            "reference_range": "12.0 - 15.5"
        },
        # Normal value with report range
        "RBC": {
            "value": 4.5,
            "unit": "million/uL",
            "reference_range": "4.0 - 5.5"
        },
        # Upper bound format '< 200'
        "Total Cholesterol": {
            "value": 215.0,
            "unit": "mg/dL",
            "reference_range": "< 200"
        },
        # Lower bound format '> 40'
        "HDL": {
            "value": 35.0,
            "unit": "mg/dL",
            "reference_range": "> 40"
        },
        # Biomarker NOT in standard DB — must NOT be dropped!
        "Custom Experimental Marker": {
            "value": 42.0,
            "unit": "ng/mL",
            "reference_range": "10 - 50"
        },
        # Biomarker with malformed range — must NOT crash!
        "Serum Creatinine": {
            "value": 1.5,
            "unit": "mg/dL",
            "reference_range": "malformed_range_data"
        }
    }

    validated = check_reference_ranges(biomarkers, gender="female")

    assert "Hemoglobin" in validated and validated["Hemoglobin"]["status"] == "LOW"
    assert "RBC" in validated and validated["RBC"]["status"] == "NORMAL"
    assert "Total Cholesterol" in validated and validated["Total Cholesterol"]["status"] == "HIGH"
    assert "HDL" in validated and validated["HDL"]["status"] == "LOW"
    assert "Custom Experimental Marker" in validated, "Uncataloged biomarker was incorrectly dropped!"
    assert validated["Custom Experimental Marker"]["status"] == "NORMAL"
    assert "Serum Creatinine" in validated, "Malformed range caused crash or drop!"
    assert validated["Serum Creatinine"]["status"] == "HIGH"  # Fallback to DB range for female (0.59 - 1.04)

    print("[PASS] check_reference_ranges passed all tests!")


def test_multi_panel_parsing():
    print("\nTesting multi-panel report parsing...")

    # Synthetic LFT Report
    lft_sample = """
    METROPOLIS PATHOLOGY LAB
    Patient Name: Suresh Verma
    Age: 42 Years
    Gender: Male
    Date: 12/08/2026

    LIVER FUNCTION TEST
    Total Bilirubin : 1.8 mg/dL (0.2 - 1.2)
    Direct Bilirubin : 0.6 mg/dL (0.0 - 0.3)
    SGPT (ALT) : 65 U/L (10 - 45)
    SGOT (AST) : 55 U/L (10 - 40)
    Alkaline Phosphatase : 110 U/L (44 - 147)
    Serum Albumin : 4.2 g/dL (3.5 - 5.0)
    """

    patient = extract_patient_info(lft_sample)
    print("Patient info:", patient)
    assert "Suresh Verma" in patient["patient_name"]
    assert patient["age"] == 42
    assert patient["gender"] == "male"
    assert "METROPOLIS PATHOLOGY LAB" in patient["lab_name"]

    parsed = parse_report(lft_sample)
    assert "Total Bilirubin" in parsed
    assert "SGPT (ALT)" in parsed
    assert "SGOT (AST)" in parsed
    assert parsed["Total Bilirubin"]["value"] == 1.8
    assert parsed["SGPT (ALT)"]["value"] == 65.0

    classification = classify_report(lft_sample)
    assert classification["report_type"] == "LFT"

    # Synthetic KFT Report
    kft_sample = """
    APOLLO DIAGNOSTICS
    Patient Name: Anita Roy
    Age: 55 Y
    Gender: Female

    KIDNEY FUNCTION TEST (KFT)
    Serum Creatinine 1.6 mg/dL 0.6 - 1.2
    Blood Urea 52.0 mg/dL 15.0 - 45.0
    Serum Uric Acid 6.2 mg/dL 2.4 - 6.0
    """
    kft_parsed = parse_report(kft_sample)
    assert "Creatinine" in kft_parsed
    assert "Urea" in kft_parsed
    assert "Uric Acid" in kft_parsed
    assert kft_parsed["Creatinine"]["value"] == 1.6

    print("[PASS] Multi-panel extraction and patient header parsing passed!")


def test_rag_and_risk_scoring():
    print("\nTesting RAG medical knowledge retrieval & 5-level risk classification...")

    # Abnormal report
    abnormal_biomarkers = {
        "Creatinine": {
            "value": 2.8,
            "unit": "mg/dL",
            "status": "HIGH",
            "reference_range": {"low": 0.6, "high": 1.2, "display": "0.6 - 1.2"}
        },
        "Hemoglobin": {
            "value": 6.8,  # Critical low
            "unit": "g/dL",
            "status": "CRITICAL",
            "reference_range": {"low": 12.0, "high": 15.5, "display": "12.0 - 15.5"}
        },
        "SGPT (ALT)": {
            "value": 75.0,
            "unit": "U/L",
            "status": "HIGH",
            "reference_range": {"low": 10.0, "high": 45.0, "display": "10 - 45"}
        }
    }

    # RAG Retrieval
    context, citations = retrieve_medical_knowledge(abnormal_biomarkers)
    assert len(citations) >= 2, "Failed to retrieve citations for abnormal biomarkers"
    assert any("Creatinine" in c["biomarker"] for c in citations)
    assert any("Hemoglobin" in c["biomarker"] for c in citations)
    assert "National Kidney Foundation" in context or "WHO" in context

    # 5-Level Risk Classification
    health_engine = HealthScore()
    risk_data = health_engine.calculate(abnormal_biomarkers)

    assert risk_data["risk_badge"] == "Critical Risk", f"Expected Critical Risk, got {risk_data['risk_badge']}"
    assert risk_data["score_breakdown"]["critical"] == 1
    assert risk_data["score_breakdown"]["high"] == 2
    assert risk_data["score_breakdown"]["total_parameters"] == 3

    # Normal report
    normal_biomarkers = {
        "Hemoglobin": {"value": 13.5, "status": "NORMAL"},
        "WBC": {"value": 7000, "status": "NORMAL"},
        "Platelets": {"value": 250000, "status": "NORMAL"}
    }
    normal_risk = health_engine.calculate(normal_biomarkers)
    assert normal_risk["risk_badge"] == "All Normal"
    assert normal_risk["risk_score"] <= 10

    # Clinical Insights
    insights = generate_clinical_insights(abnormal_biomarkers, citations)
    assert len(insights["clinical_insights"]) > 0
    assert len(insights["questions_to_discuss_with_doctor"]) > 0

    print("[PASS] RAG and 5-Level Risk Classification passed all tests!")


if __name__ == "__main__":
    test_reference_range_parser()
    test_validation_type_safety()
    test_multi_panel_parsing()
    test_rag_and_risk_scoring()
    print("\n==========================================")
    print("ALL COMPREHENSIVE PIPELINE TESTS PASSED [OK]")
    print("==========================================")
