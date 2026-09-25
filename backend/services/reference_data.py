"""
Comprehensive Reference Ranges and Critical Thresholds for Medical Biomarkers.
Covers CBC, LFT, KFT, Lipid, Thyroid, Diabetes, Vitamins, Electrolytes, Urine, and Cardiac/Inflammatory panels.
"""

REFERENCE_RANGES = {
    # ---------------------------------------------------------
    # Complete Blood Count (CBC)
    # ---------------------------------------------------------
    "Hemoglobin": {
        "male": (13.5, 17.5),
        "female": (12.0, 15.5),
        "unit": "g/dL",
        "critical_low": 7.0,
        "critical_high": 20.0
    },
    "RBC": {
        "male": (4.5, 5.9),
        "female": (4.1, 5.1),
        "all": (4.0, 5.5),
        "unit": "million/uL",
        "critical_low": 2.5,
        "critical_high": 7.0
    },
    "WBC": {
        "all": (4000, 11000),
        "unit": "/uL",
        "critical_low": 2000,
        "critical_high": 30000
    },
    "Platelets": {
        "all": (150000, 450000),
        "unit": "/uL",
        "critical_low": 50000,
        "critical_high": 1000000
    },
    "Hematocrit": {
        "male": (40.0, 52.0),
        "female": (36.0, 48.0),
        "all": (36.0, 50.0),
        "unit": "%",
        "critical_low": 20.0,
        "critical_high": 60.0
    },
    "MCV": {
        "all": (80.0, 100.0),
        "unit": "fL"
    },
    "MCH": {
        "all": (27.0, 33.0),
        "unit": "pg"
    },
    "MCHC": {
        "all": (32.0, 36.0),
        "unit": "g/dL"
    },
    "RDW": {
        "all": (11.5, 14.5),
        "unit": "%"
    },
    "MPV": {
        "all": (7.4, 10.4),
        "unit": "fL"
    },
    "Neutrophils": {
        "all": (40.0, 75.0),
        "unit": "%"
    },
    "Lymphocytes": {
        "all": (20.0, 45.0),
        "unit": "%"
    },
    "Monocytes": {
        "all": (2.0, 10.0),
        "unit": "%"
    },
    "Eosinophils": {
        "all": (1.0, 6.0),
        "unit": "%"
    },
    "Basophils": {
        "all": (0.0, 2.0),
        "unit": "%"
    },
    "ESR": {
        "male": (0.0, 15.0),
        "female": (0.0, 20.0),
        "all": (0.0, 20.0),
        "unit": "mm/hr"
    },

    # ---------------------------------------------------------
    # Liver Function Test (LFT)
    # ---------------------------------------------------------
    "Total Bilirubin": {
        "all": (0.2, 1.2),
        "unit": "mg/dL",
        "critical_high": 5.0
    },
    "Direct Bilirubin": {
        "all": (0.0, 0.3),
        "unit": "mg/dL"
    },
    "Indirect Bilirubin": {
        "all": (0.2, 0.9),
        "unit": "mg/dL"
    },
    "SGPT (ALT)": {
        "male": (10.0, 45.0),
        "female": (7.0, 35.0),
        "all": (7.0, 45.0),
        "unit": "U/L",
        "critical_high": 300.0
    },
    "SGOT (AST)": {
        "male": (10.0, 40.0),
        "female": (9.0, 32.0),
        "all": (9.0, 40.0),
        "unit": "U/L",
        "critical_high": 300.0
    },
    "Alkaline Phosphatase": {
        "all": (44.0, 147.0),
        "unit": "U/L"
    },
    "Total Protein": {
        "all": (6.0, 8.3),
        "unit": "g/dL"
    },
    "Albumin": {
        "all": (3.5, 5.0),
        "unit": "g/dL"
    },
    "Globulin": {
        "all": (2.0, 3.5),
        "unit": "g/dL"
    },
    "A/G Ratio": {
        "all": (1.0, 2.2),
        "unit": ""
    },
    "GGT": {
        "male": (9.0, 48.0),
        "female": (9.0, 38.0),
        "all": (9.0, 48.0),
        "unit": "U/L"
    },

    # ---------------------------------------------------------
    # Kidney Function Test (KFT / RFT)
    # ---------------------------------------------------------
    "Creatinine": {
        "male": (0.74, 1.35),
        "female": (0.59, 1.04),
        "all": (0.6, 1.2),
        "unit": "mg/dL",
        "critical_high": 3.5
    },
    "Urea": {
        "all": (15.0, 45.0),
        "unit": "mg/dL",
        "critical_high": 100.0
    },
    "BUN": {
        "all": (7.0, 20.0),
        "unit": "mg/dL",
        "critical_high": 60.0
    },
    "Uric Acid": {
        "male": (3.4, 7.0),
        "female": (2.4, 6.0),
        "all": (3.0, 7.0),
        "unit": "mg/dL"
    },
    "eGFR": {
        "all": (90.0, 120.0),
        "unit": "mL/min/1.73m²",
        "critical_low": 30.0
    },

    # ---------------------------------------------------------
    # Lipid Profile
    # ---------------------------------------------------------
    "Total Cholesterol": {
        "all": (125.0, 200.0),
        "unit": "mg/dL",
        "critical_high": 300.0
    },
    "HDL": {
        "male": (40.0, 60.0),
        "female": (50.0, 70.0),
        "all": (40.0, 60.0),
        "unit": "mg/dL",
        "critical_low": 25.0
    },
    "LDL": {
        "all": (0.0, 100.0),
        "unit": "mg/dL",
        "critical_high": 190.0
    },
    "VLDL": {
        "all": (5.0, 30.0),
        "unit": "mg/dL"
    },
    "Triglycerides": {
        "all": (0.0, 150.0),
        "unit": "mg/dL",
        "critical_high": 500.0
    },
    "Total Cholesterol / HDL Ratio": {
        "all": (0.0, 5.0),
        "unit": ""
    },

    # ---------------------------------------------------------
    # Thyroid Profile
    # ---------------------------------------------------------
    "TSH": {
        "all": (0.4, 4.0),
        "unit": "uIU/mL",
        "critical_low": 0.05,
        "critical_high": 15.0
    },
    "T3": {
        "all": (0.8, 2.0),
        "unit": "ng/mL"
    },
    "T4": {
        "all": (5.0, 12.0),
        "unit": "ug/dL"
    },
    "Free T3": {
        "all": (2.3, 4.2),
        "unit": "pg/mL"
    },
    "Free T4": {
        "all": (0.8, 1.8),
        "unit": "ng/dL"
    },

    # ---------------------------------------------------------
    # Diabetes & Glycemic Control
    # ---------------------------------------------------------
    "Glucose": {
        "all": (70.0, 99.0),
        "unit": "mg/dL",
        "critical_low": 50.0,
        "critical_high": 300.0
    },
    "Fasting Blood Sugar": {
        "all": (70.0, 99.0),
        "unit": "mg/dL",
        "critical_low": 50.0,
        "critical_high": 300.0
    },
    "Postprandial Blood Sugar": {
        "all": (70.0, 140.0),
        "unit": "mg/dL",
        "critical_high": 300.0
    },
    "HbA1c": {
        "all": (4.0, 5.6),
        "unit": "%",
        "critical_high": 10.0
    },
    "Average Blood Glucose": {
        "all": (70.0, 126.0),
        "unit": "mg/dL"
    },

    # ---------------------------------------------------------
    # Vitamins & Minerals
    # ---------------------------------------------------------
    "Vitamin D": {
        "all": (30.0, 100.0),
        "unit": "ng/mL",
        "critical_low": 10.0
    },
    "Vitamin B12": {
        "all": (200.0, 900.0),
        "unit": "pg/mL",
        "critical_low": 100.0
    },
    "Serum Iron": {
        "male": (65.0, 175.0),
        "female": (50.0, 170.0),
        "all": (60.0, 170.0),
        "unit": "ug/dL"
    },
    "Ferritin": {
        "male": (24.0, 336.0),
        "female": (11.0, 307.0),
        "all": (15.0, 300.0),
        "unit": "ng/mL"
    },
    "Calcium": {
        "all": (8.5, 10.5),
        "unit": "mg/dL",
        "critical_low": 6.5,
        "critical_high": 13.0
    },
    "Phosphorus": {
        "all": (2.5, 4.5),
        "unit": "mg/dL"
    },
    "Magnesium": {
        "all": (1.7, 2.2),
        "unit": "mg/dL"
    },

    # ---------------------------------------------------------
    # Electrolytes
    # ---------------------------------------------------------
    "Sodium": {
        "all": (135.0, 145.0),
        "unit": "mEq/L",
        "critical_low": 120.0,
        "critical_high": 160.0
    },
    "Potassium": {
        "all": (3.5, 5.0),
        "unit": "mEq/L",
        "critical_low": 2.8,
        "critical_high": 6.2
    },
    "Chloride": {
        "all": (96.0, 106.0),
        "unit": "mEq/L"
    },
    "Bicarbonate": {
        "all": (22.0, 29.0),
        "unit": "mEq/L"
    },

    # ---------------------------------------------------------
    # Cardiac & Inflammatory Markers
    # ---------------------------------------------------------
    "CRP": {
        "all": (0.0, 5.0),
        "unit": "mg/L",
        "critical_high": 50.0
    },
    "hs-CRP": {
        "all": (0.0, 3.0),
        "unit": "mg/L"
    },

    # ---------------------------------------------------------
    # Urine Routine (Quantitative / Semi-quantitative)
    # ---------------------------------------------------------
    "Urine Specific Gravity": {
        "all": (1.005, 1.030),
        "unit": ""
    },
    "Urine pH": {
        "all": (4.5, 8.0),
        "unit": ""
    },
    "Urine Pus Cells": {
        "all": (0.0, 5.0),
        "unit": "HPF"
    },
    "Urine RBC": {
        "all": (0.0, 2.0),
        "unit": "HPF"
    }
}
