import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

from services.extractor import extract_biomarkers
from services.reference_ranges import check_reference_ranges

sample = """
Hemoglobin : 11.2 g/dL
WBC : 7800
Platelet Count : 250000
Vitamin D : 18
Creatinine : 0.9
TSH : 2.8
"""

biomarkers = extract_biomarkers(sample)

results = check_reference_ranges(biomarkers, gender="female")

for k, v in results.items():
    print(k, v)