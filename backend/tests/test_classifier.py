import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

from services.report_classifier import classify_report

sample = """
Hemoglobin : 12.1
WBC : 7200
Platelets : 250000
Vitamin D : 18
"""

print(classify_report(sample))