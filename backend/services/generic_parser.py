import re
from typing import Dict, Any, Tuple, Optional
from services.biomarker_aliases import ALIASES


def normalize_parameter(parameter: str) -> str:
    """
    Normalizes parameter name to canonical medical name using ALIASES dictionary.
    If no alias matches, returns cleaned parameter name.
    """
    if not parameter:
        return ""

    clean_param = parameter.strip().strip(":-").strip()

    # Exact or case-insensitive match against aliases
    for standard_name, aliases in ALIASES.items():
        if standard_name.lower() == clean_param.lower():
            return standard_name
        for alias in aliases:
            if alias.lower() == clean_param.lower():
                return standard_name

    # Substring / partial match heuristic for common prefixes
    for standard_name, aliases in ALIASES.items():
        for alias in aliases:
            # Word boundary search
            if re.search(rf"\b{re.escape(alias)}\b", clean_param, re.IGNORECASE):
                return standard_name

    return clean_param


def extract_patient_info(text: str) -> Dict[str, Any]:
    """
    Extracts patient demographics and metadata from report text.
    """
    info = {
        "patient_name": "",
        "age": None,
        "gender": "female",  # Safe default
        "gender_detected": False,
        "report_date": "",
        "referring_doctor": "",
        "lab_name": ""
    }

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    header_lines = lines[:25]  # First 25 lines usually contain metadata
    header_text = "\n".join(header_lines)

    # 1. Lab name heuristic (usually 1st or 2nd non-empty line)
    for line in header_lines[:4]:
        if any(w in line.lower() for w in ["diagnostic", "lab", "hospital", "clinic", "pathology", "centre", "center"]):
            info["lab_name"] = line
            break

    # 2. Line-by-line header extraction
    for idx, line in enumerate(header_lines):
        line_clean = line.strip()

        # Patient Name
        if not info["patient_name"]:
            nm = re.search(r"(?:patient\s*name|pt\.?\s*name)\s*[:\-]?\s*(.*)", line_clean, re.IGNORECASE)
            if nm:
                cand = nm.group(1).strip()
                # If label was alone on line, check next line
                if (not cand or len(cand) < 2) and idx + 1 < len(header_lines):
                    next_cand = header_lines[idx + 1].strip()
                    if not any(k in next_cand.lower() for k in ["age", "sex", "gender", "id", "date", "sample", "ref", "doctor"]):
                        cand = next_cand

                cand = cand.split("Age")[0].split("Sex")[0].split("Gender")[0].split("Patient ID")[0].strip()
                if len(cand) > 2 and not any(w in cand.lower() for w in ["test", "report", "blood", "complete", "cbc", "information"]):
                    info["patient_name"] = cand

        # Age and Gender (same line or next line)
        if not info["gender_detected"] or info["age"] is None:
            target_str = line_clean
            if (line_clean.lower().startswith("age") or "age/sex" in line_clean.lower()) and idx + 1 < len(header_lines):
                target_str += " " + header_lines[idx + 1].strip()

            gm = re.search(r"(?:gender|sex)\s*[:\-/\s]\s*(female|male|f|m)\b", target_str, re.IGNORECASE)
            if not gm and "/" in target_str:
                gm = re.search(r"/\s*(female|male|f|m)\b", target_str, re.IGNORECASE)
            if gm:
                g = gm.group(1).lower()
                if g in ["female", "f"]:
                    info["gender"] = "female"
                    info["gender_detected"] = True
                elif g in ["male", "m"]:
                    info["gender"] = "male"
                    info["gender_detected"] = True

            am = re.search(r"\b(\d{1,3})\s*(?:years?|yrs?|y)\b", target_str, re.IGNORECASE)
            if not am:
                am = re.search(r"(?:age|age/sex)\s*[:\-]?\s*(\d{1,3})", target_str, re.IGNORECASE)
            if am:
                try:
                    info["age"] = int(am.group(1))
                except ValueError:
                    pass

        # Date
        if not info["report_date"]:
            dm = re.search(r"(?:date|report\s*date|collection\s*date)\s*[:\-]?\s*([0-9A-Za-z\s\-/]+)", line_clean, re.IGNORECASE)
            if dm:
                d_cand = dm.group(1).strip()
                if not d_cand and idx + 1 < len(header_lines):
                    d_cand = header_lines[idx + 1].strip()
                if re.search(r"\d", d_cand):
                    info["report_date"] = d_cand.split("Time")[0].strip()

        # Doctor
        if not info["referring_doctor"]:
            doc_m = re.search(r"(?:ref\.?\s*doctor|referred\s*by|dr\.?)\s*[:\-]?\s*(.*)", line_clean, re.IGNORECASE)
            if doc_m:
                doc = doc_m.group(1).strip()
                if not doc and idx + 1 < len(header_lines):
                    doc = header_lines[idx + 1].strip()
                doc = doc.split("Date")[0].split("Sample")[0].split("Report")[0].strip()
                if len(doc) > 2 and not any(w in doc.lower() for w in ["centre", "center", "lab", "hospital"]):
                    info["referring_doctor"] = doc

    return info


def parse_report(text: str) -> Dict[str, Any]:
    """
    Generalized multi-format medical report parser.
    Extracts patient info and tests across CBC, LFT, KFT, Lipid, Thyroid, Diabetes, etc.
    """
    biomarkers = {}
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # Skip header words that look like parameters
    HEADER_IGNORE = {
        "parameter", "test", "investigation", "test name", "result", "value",
        "unit", "units", "reference range", "normal range", "ref range",
        "biological reference interval", "flag", "status", "end of report",
        "page", "nabl accredited", "patient information"
    }

    # -------------------------------------------------------------------------
    # Pattern 1: Single-line row with parameter, value, optional unit, optional range
    # e.g.:
    # "Hemoglobin 11.2 g/dL 12.0-15.5"
    # "Total Cholesterol 210 mg/dL < 200"
    # "Blood Urea 25.4 mg/dl 15.0 - 45.0"
    # "SGPT (ALT) 45 U/L 10 - 40"
    # "Platelets 250000 /uL 150000-450000"
    # -------------------------------------------------------------------------
    row_pattern = re.compile(
        r"""
        ^
        (?P<param>[A-Za-z][A-Za-z0-9\s()/%+\-,\.]{1,60}?)
        \s*[:=\t]\s*
        (?P<val>-?\d+(?:\.\d+)?)
        (?:\s+(?P<unit>[A-Za-z/%µμ0-9\^\-\*]+))?
        (?:\s*(?:[\(\[]?(?:ref|range|normal)?[:\s]*)?(?P<ref>(?:<|<=|>|>=)?\s*\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?))?
        """,
        re.VERBOSE | re.IGNORECASE
    )

    # Tabular single line without colons: "Hemoglobin 11.2 g/dL 12.0-15.5"
    table_pattern = re.compile(
        r"""
        ^
        (?P<param>[A-Za-z][A-Za-z0-9\s()/%+\-,\.]{2,50}?)
        \s{1,8}
        (?P<val>-?\d+(?:\.\d+)?)
        (?:\s+(?P<flag>[HL\*]|High|Low))?
        (?:\s+(?P<unit>[A-Za-z/%µμ0-9\^\-\*]{1,15}))?
        (?:\s+(?P<ref>(?:<|<=|>|>=|up\s*to\s*)?\s*\d+(?:\.\d+)?(?:\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?)?))?
        $
        """,
        re.VERBOSE | re.IGNORECASE
    )

    for line in lines:
        cleaned_line = " ".join(line.split())
        if cleaned_line.lower() in HEADER_IGNORE:
            continue

        # Try colon/equals pattern first
        m = row_pattern.search(cleaned_line)
        if m:
            raw_param = m.group("param").strip()
            if raw_param.lower() in HEADER_IGNORE or len(raw_param) < 2:
                continue

            val_str = m.group("val")
            try:
                val = float(val_str)
            except ValueError:
                continue

            norm_name = normalize_parameter(raw_param)
            unit = m.group("unit") or ""
            ref = m.group("ref") or ""

            biomarkers[norm_name] = {
                "parameter": norm_name,
                "original_name": raw_param,
                "value": val,
                "unit": unit.strip(),
                "reference_range": ref.strip(),
            }
            continue

        # Try space-delimited table row
        tm = table_pattern.match(cleaned_line)
        if tm:
            raw_param = tm.group("param").strip()
            if raw_param.lower() in HEADER_IGNORE or len(raw_param) < 2:
                continue

            val_str = tm.group("val")
            try:
                val = float(val_str)
            except ValueError:
                continue

            norm_name = normalize_parameter(raw_param)
            unit = tm.group("unit") or ""
            ref = tm.group("ref") or ""

            biomarkers[norm_name] = {
                "parameter": norm_name,
                "original_name": raw_param,
                "value": val,
                "unit": unit.strip(),
                "reference_range": ref.strip(),
            }

    # -------------------------------------------------------------------------
    # Pattern 2: Multi-line OCR block parser
    # Handles reports where OCR or PDF stream outputs columns sequentially:
    # Line i: Parameter Name
    # Line i+1: Numeric Value
    # Line i+2: Unit (optional)
    # Line i+3: Reference Range (optional)
    # -------------------------------------------------------------------------
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.lower() in HEADER_IGNORE or len(line) < 2:
            i += 1
            continue

        norm_name = normalize_parameter(line)

        # Check if next line is a numeric value
        if i + 1 < len(lines):
            next_line = lines[i + 1].strip()
            val_match = re.fullmatch(r"(-?\d+(?:\.\d+)?)", next_line)

            if val_match and norm_name not in biomarkers:
                val = float(val_match.group(1))
                unit = ""
                ref = ""
                step = 2

                # Look ahead for unit and reference range in lines i+2 and i+3
                if i + 2 < len(lines):
                    l2 = lines[i + 2].strip()
                    # Check if line i+2 is a reference range directly
                    if re.search(r"\d+\s*[-–—to]\s*\d+|<|>|up\s*to", l2, re.IGNORECASE):
                        ref = l2
                        step = 3
                    elif re.fullmatch(r"[A-Za-z/%µμ0-9\^\-]+", l2):
                        unit = l2
                        step = 3
                        # Then check line i+3 for range
                        if i + 3 < len(lines):
                            l3 = lines[i + 3].strip()
                            if re.search(r"\d+\s*[-–—to]\s*\d+|<|>|up\s*to", l3, re.IGNORECASE):
                                ref = l3
                                step = 4

                biomarkers[norm_name] = {
                    "parameter": norm_name,
                    "original_name": line,
                    "value": val,
                    "unit": unit,
                    "reference_range": ref,
                }
                i += step
                continue

        i += 1

    return biomarkers