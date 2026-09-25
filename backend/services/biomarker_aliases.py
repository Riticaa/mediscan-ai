"""
Biomarker Aliases and Normalization Mapping.
Maps naming variations, abbreviations, typos, and medical jargon to canonical standard names.
"""

ALIASES = {
    # ---------------------------------------------------------
    # Complete Blood Count (CBC)
    # ---------------------------------------------------------
    "Hemoglobin": [
        "Hemoglobin", "Haemoglobin", "HB", "Hb", "Hgb", "Total Hemoglobin"
    ],
    "RBC": [
        "RBC", "RBC Count", "Red Blood Cell Count", "Red Blood Cells",
        "Total RBC", "Total Red Blood Cell Count", "Erythrocyte Count"
    ],
    "WBC": [
        "WBC", "Total WBC Count", "White Blood Cell Count", "White Blood Cells",
        "Total Leucocyte Count", "Total Leukocyte Count", "Leucocyte Count",
        "Leukocyte Count", "TLC", "Total WBC"
    ],
    "Platelets": [
        "Platelets", "Platelet Count", "PLT", "Total Platelet Count",
        "Thrombocyte Count"
    ],
    "Hematocrit": [
        "Hematocrit", "Haematocrit", "PCV", "Packed Cell Volume", "Hct"
    ],
    "MCV": [
        "MCV", "Mean Corpuscular Volume", "Mean Cell Volume"
    ],
    "MCH": [
        "MCH", "Mean Corpuscular Hemoglobin", "Mean Cell Hemoglobin"
    ],
    "MCHC": [
        "MCHC", "Mean Corpuscular Hemoglobin Concentration",
        "Mean Cell Hemoglobin Concentration"
    ],
    "RDW": [
        "RDW", "RDW-CV", "RDW-SD", "Red Cell Distribution Width"
    ],
    "MPV": [
        "MPV", "Mean Platelet Volume"
    ],
    "Neutrophils": [
        "Neutrophils", "Neutrophil", "Polymorphs", "Segmented Neutrophils",
        "Absolute Neutrophil Count", "ANC"
    ],
    "Lymphocytes": [
        "Lymphocytes", "Lymphocyte", "Total Lymphocytes"
    ],
    "Monocytes": [
        "Monocytes", "Monocyte"
    ],
    "Eosinophils": [
        "Eosinophils", "Eosinophil"
    ],
    "Basophils": [
        "Basophils", "Basophil"
    ],
    "ESR": [
        "ESR", "Erythrocyte Sedimentation Rate", "Sed Rate"
    ],

    # ---------------------------------------------------------
    # Liver Function Test (LFT)
    # ---------------------------------------------------------
    "Total Bilirubin": [
        "Total Bilirubin", "Bilirubin Total", "Bilirubin (Total)", "S. Bilirubin (Total)",
        "Serum Bilirubin Total"
    ],
    "Direct Bilirubin": [
        "Direct Bilirubin", "Bilirubin Direct", "Conjugated Bilirubin",
        "Bilirubin (Direct)"
    ],
    "Indirect Bilirubin": [
        "Indirect Bilirubin", "Bilirubin Indirect", "Unconjugated Bilirubin",
        "Bilirubin (Indirect)"
    ],
    "SGPT (ALT)": [
        "SGPT", "ALT", "SGPT (ALT)", "Alanine Aminotransferase", "Alanine Transaminase",
        "SGPT / ALT", "ALT (SGPT)"
    ],
    "SGOT (AST)": [
        "SGOT", "AST", "SGOT (AST)", "Aspartate Aminotransferase", "Aspartate Transaminase",
        "SGOT / AST", "AST (SGOT)"
    ],
    "Alkaline Phosphatase": [
        "Alkaline Phosphatase", "ALP", "Alk Phos", "S. Alkaline Phosphatase"
    ],
    "Total Protein": [
        "Total Protein", "Protein Total", "Serum Total Protein", "S. Protein"
    ],
    "Albumin": [
        "Albumin", "Serum Albumin", "S. Albumin"
    ],
    "Globulin": [
        "Globulin", "Serum Globulin", "S. Globulin"
    ],
    "A/G Ratio": [
        "A/G Ratio", "Albumin/Globulin Ratio", "A:G Ratio"
    ],
    "GGT": [
        "GGT", "Gamma GT", "Gamma-Glutamyl Transferase", "GGTP"
    ],

    # ---------------------------------------------------------
    # Kidney Function Test (KFT / RFT)
    # ---------------------------------------------------------
    "Creatinine": [
        "Creatinine", "Serum Creatinine", "S. Creatinine", "Creatinine (Serum)"
    ],
    "Urea": [
        "Urea", "Blood Urea", "Serum Urea", "S. Urea"
    ],
    "BUN": [
        "Blood Urea Nitrogen", "BUN", "Serum BUN"
    ],
    "Uric Acid": [
        "Uric Acid", "Serum Uric Acid", "S. Uric Acid"
    ],
    "eGFR": [
        "eGFR", "GFR", "Estimated Glomerular Filtration Rate"
    ],

    # ---------------------------------------------------------
    # Lipid Profile
    # ---------------------------------------------------------
    "Total Cholesterol": [
        "Total Cholesterol", "Cholesterol", "Cholesterol Total", "Serum Cholesterol",
        "S. Cholesterol", "Total Chol"
    ],
    "HDL": [
        "HDL", "HDL Cholesterol", "HDL-C", "High Density Lipoprotein"
    ],
    "LDL": [
        "LDL", "LDL Cholesterol", "LDL-C", "Low Density Lipoprotein"
    ],
    "VLDL": [
        "VLDL", "VLDL Cholesterol", "Very Low Density Lipoprotein"
    ],
    "Triglycerides": [
        "Triglycerides", "TG", "Serum Triglycerides", "S. Triglycerides"
    ],
    "Total Cholesterol / HDL Ratio": [
        "Total Cholesterol / HDL Ratio", "TC/HDL Ratio", "Chol/HDL Ratio",
        "TC:HDL Ratio"
    ],

    # ---------------------------------------------------------
    # Thyroid Profile
    # ---------------------------------------------------------
    "TSH": [
        "TSH", "Thyroid Stimulating Hormone", "Ultrasensitive TSH", "S. TSH"
    ],
    "T3": [
        "T3", "Triiodothyronine", "Total T3", "Serum T3"
    ],
    "T4": [
        "T4", "Thyroxine", "Total T4", "Serum T4"
    ],
    "Free T3": [
        "Free T3", "FT3", "Free Triiodothyronine"
    ],
    "Free T4": [
        "Free T4", "FT4", "Free Thyroxine"
    ],

    # ---------------------------------------------------------
    # Diabetes & Glycemic Control
    # ---------------------------------------------------------
    "Glucose": [
        "Glucose", "Blood Sugar", "Blood Glucose", "Random Blood Sugar", "RBS",
        "Glucose (Random)", "Serum Glucose"
    ],
    "Fasting Blood Sugar": [
        "Fasting Blood Sugar", "FBS", "Fasting Glucose", "Glucose Fasting",
        "Blood Sugar Fasting", "Fasting Blood Glucose"
    ],
    "Postprandial Blood Sugar": [
        "Postprandial Blood Sugar", "PPBS", "Post Prandial Blood Sugar",
        "PP Blood Sugar", "Glucose PP", "Blood Sugar PP"
    ],
    "HbA1c": [
        "HbA1c", "Glycated Hemoglobin", "Hb A1c", "Glycosylated Hemoglobin",
        "A1C", "Hemoglobin A1c"
    ],
    "Average Blood Glucose": [
        "Average Blood Glucose", "eAG", "Estimated Average Glucose"
    ],

    # ---------------------------------------------------------
    # Vitamins & Minerals
    # ---------------------------------------------------------
    "Vitamin D": [
        "Vitamin D", "25 OH Vitamin D", "25-Hydroxy Vitamin D", "Vit D",
        "Vitamin D (25-OH)", "25-OH-Vit-D", "Total 25-OH Vitamin D"
    ],
    "Vitamin B12": [
        "Vitamin B12", "Vit B12", "Cyanocobalamin", "Serum Vitamin B12"
    ],
    "Serum Iron": [
        "Serum Iron", "Iron", "Total Iron"
    ],
    "Ferritin": [
        "Ferritin", "Serum Ferritin", "S. Ferritin"
    ],
    "Calcium": [
        "Calcium", "Serum Calcium", "Total Calcium", "S. Calcium", "Ca"
    ],
    "Phosphorus": [
        "Phosphorus", "Serum Phosphorus", "Phosphate", "Inorganic Phosphorus"
    ],
    "Magnesium": [
        "Magnesium", "Serum Magnesium", "Mg"
    ],

    # ---------------------------------------------------------
    # Electrolytes
    # ---------------------------------------------------------
    "Sodium": [
        "Sodium", "Serum Sodium", "Na", "Na+", "S. Sodium"
    ],
    "Potassium": [
        "Potassium", "Serum Potassium", "K", "K+", "S. Potassium"
    ],
    "Chloride": [
        "Chloride", "Serum Chloride", "Cl", "Cl-", "S. Chloride"
    ],
    "Bicarbonate": [
        "Bicarbonate", "Serum Bicarbonate", "HCO3", "HCO3-"
    ],

    # ---------------------------------------------------------
    # Cardiac & Inflammatory Markers
    # ---------------------------------------------------------
    "CRP": [
        "CRP", "C-Reactive Protein", "C Reactive Protein", "Serum CRP"
    ],
    "hs-CRP": [
        "hs-CRP", "High Sensitivity CRP", "hsCRP", "Cardiac CRP"
    ],

    # ---------------------------------------------------------
    # Urine Routine
    # ---------------------------------------------------------
    "Urine Specific Gravity": [
        "Specific Gravity", "Urine Specific Gravity", "Sp. Gravity"
    ],
    "Urine pH": [
        "Urine pH", "pH (Urine)", "pH"
    ],
    "Urine Pus Cells": [
        "Pus Cells", "Urine Pus Cells", "Leukocytes (Urine)", "WBC (Urine)"
    ],
    "Urine RBC": [
        "RBC (Urine)", "Red Blood Cells (Urine)", "Urine RBC"
    ]
}