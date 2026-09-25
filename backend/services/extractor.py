import re

BIOMARKERS = {
    "Hemoglobin": [
        r"hemoglobin[:\s]*([\d.]+)\s*(g/dl|gm/dl|g/dL)?"
    ],

    "WBC": [
        r"(?:wbc|white blood cells?)[:\s]*([\d,]+)"
    ],

    "RBC": [
        r"(?:rbc|red blood cells?)[:\s]*([\d.]+)"
    ],

    "Platelets": [
        r"(?:platelet(?: count)?)[:\s]*([\d,]+)"
    ],

    "Vitamin D": [
        r"vitamin\s*d[:\s]*([\d.]+)"
    ],

    "Vitamin B12": [
        r"vitamin\s*b12[:\s]*([\d.]+)"
    ],

    "Glucose": [
        r"(?:glucose|blood sugar|fasting glucose)[:\s]*([\d.]+)"
    ],

    "HbA1c": [
        r"hba1c[:\s]*([\d.]+)"
    ],

    "TSH": [
        r"tsh[:\s]*([\d.]+)"
    ],

    "Creatinine": [
        r"creatinine[:\s]*([\d.]+)"
    ],

    "Urea": [
        r"urea[:\s]*([\d.]+)"
    ],

    "Cholesterol": [
        r"cholesterol[:\s]*([\d.]+)"
    ],

    "HDL": [
        r"hdl[:\s]*([\d.]+)"
    ],

    "LDL": [
        r"ldl[:\s]*([\d.]+)"
    ],

    "Triglycerides": [
        r"triglycerides[:\s]*([\d.]+)"
    ],

    "ALT": [
        r"(?:alt|sgpt)[:\s]*([\d.]+)"
    ],

    "AST": [
        r"(?:ast|sgot)[:\s]*([\d.]+)"
    ]
}


def extract_biomarkers(text):

    results = {}

    text = text.lower()

    for biomarker, patterns in BIOMARKERS.items():

        for pattern in patterns:

            match = re.search(pattern, text, re.IGNORECASE)

            if match:

                value = match.group(1).replace(",", "")

                try:
                    value = float(value)
                except:
                    pass

                unit = ""

                if len(match.groups()) > 1:

                    unit = match.group(2) or ""

                results[biomarker] = {
                    "value": value,
                    "unit": unit
                }

                break

    return results