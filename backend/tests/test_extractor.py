import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

from services.extractor import extract_biomarkers

sample = """
Hemoglobin : 11.2 g/dL
WBC : 7800
Platelet Count : 250000
Vitamin D : 18
Creatinine : 0.9
TSH : 2.8
"""

result = extract_biomarkers(sample)

for k, v in result.items():
    print(k, ":", v)