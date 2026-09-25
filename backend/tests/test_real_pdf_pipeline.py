import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

from services.ocr import extract_text_from_pdf, clean_extracted_text
from services.report_pipeline import ReportPipeline


def test_pdf_pipeline():
    pipeline = ReportPipeline()
    sample_pdf = os.path.join(ROOT, "uploads", "sample.pdf")

    if not os.path.exists(sample_pdf):
        print(f"File not found: {sample_pdf}")
        return

    print("Extracting text from sample.pdf...")
    raw_text = extract_text_from_pdf(sample_pdf)
    cleaned = clean_extracted_text(raw_text)
    print("Text extracted length:", len(cleaned))

    print("Running pipeline.process...")
    res = pipeline.process(cleaned, gender="female", language="english")

    analysis = res["analysis"]
    print("Report Type:", analysis["report_type"])
    print("Patient Info:", analysis["patient_info"])
    print("Risk Badge:", analysis["risk_badge"])
    print("Risk Score:", analysis["risk_score"])
    print("Parameters extracted count:", len(analysis["parameters"]))
    print("Abnormal findings:", analysis["abnormal_findings"])
    print("Citations retrieved:", len(analysis["citations"]))
    print("Summary:", analysis["summary"])

    assert len(analysis["parameters"]) >= 5, "Fewer than 5 parameters extracted!"
    assert analysis["risk_badge"] in ["All Normal", "Low Risk", "Medium Risk", "High Risk", "Critical Risk"]
    print("\n[PASS] Real PDF end-to-end pipeline test succeeded!")


if __name__ == "__main__":
    test_pdf_pipeline()
