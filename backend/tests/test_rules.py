import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

from services.extractor import extract_biomarkers
from services.reference_ranges import check_reference_ranges
from services.clinical_insights import generate_clinical_insights


def test_clinical_rules_and_insights():
    sample = """
    Hemoglobin : 11.2
    Vitamin D : 18
    WBC : 7800
    Platelet Count : 250000
    TSH : 2.8
    Creatinine : 0.9
    """

    biomarkers = extract_biomarkers(sample)
    assert "Hemoglobin" in biomarkers

    ranges = check_reference_ranges(biomarkers, gender="female")
    assert "Hemoglobin" in ranges

    insights = generate_clinical_insights(ranges)
    assert "clinical_insights" in insights
    assert "recommendations" in insights
    assert "lifestyle_tips" in insights
    assert "questions_to_discuss_with_doctor" in insights
    assert len(insights["clinical_insights"]) > 0