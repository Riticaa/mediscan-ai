import re
from typing import Dict, Any, Tuple, Optional
from services.reference_data import REFERENCE_RANGES


def parse_range_string(range_str: Any) -> Tuple[Optional[float], Optional[float], str]:
    """
    Safely parse various reference range string formats:
    - '12.0 - 15.5' or '12-15' or '12.0 to 15.5'
    - '< 200' or '<= 100' or 'Up to 1.2'
    - '> 40' or '>= 60'
    - Tuples or lists like (12.0, 15.5)
    Returns: (low, high, raw_string)
    """
    if range_str is None:
        return None, None, ""

    # If it's already a tuple or list
    if isinstance(range_str, (list, tuple)):
        try:
            low = float(range_str[0]) if len(range_str) > 0 and range_str[0] is not None else None
            high = float(range_str[1]) if len(range_str) > 1 and range_str[1] is not None else None
            raw = f"{low} - {high}" if low is not None and high is not None else str(range_str)
            return low, high, raw
        except (ValueError, TypeError):
            return None, None, str(range_str)

    # If it's a dict like {"low": 12.0, "high": 15.5}
    if isinstance(range_str, dict):
        low = range_str.get("low")
        high = range_str.get("high")
        try:
            l_val = float(low) if low is not None else None
            h_val = float(high) if high is not None else None
            return l_val, h_val, range_str.get("raw", f"{l_val} - {h_val}")
        except (ValueError, TypeError):
            return None, None, str(range_str)

    s = str(range_str).strip()
    if not s:
        return None, None, ""

    # Pattern: '< 200' or '<= 100' or 'Up to 1.2' or 'upto 1.2'
    lt_match = re.search(r"(?:<|<=|up\s*to\s*|upto\s*)\s*(-?\d+(?:\.\d+)?)", s, re.IGNORECASE)
    if lt_match:
        try:
            high_val = float(lt_match.group(1))
            return 0.0, high_val, s
        except ValueError:
            pass

    # Pattern: '> 40' or '>= 60'
    gt_match = re.search(r"(?:>|>=)\s*(-?\d+(?:\.\d+)?)", s, re.IGNORECASE)
    if gt_match:
        try:
            low_val = float(gt_match.group(1))
            return low_val, None, s
        except ValueError:
            pass

    # Pattern: '12.0 - 15.5' or '12 - 15' or '12.0 to 15.5' or '0.5:1.5'
    range_match = re.search(
        r"(-?\d+(?:\.\d+)?)\s*(?:-|–|—|to|:)\s*(-?\d+(?:\.\d+)?)",
        s,
        re.IGNORECASE
    )
    if range_match:
        try:
            low_val = float(range_match.group(1))
            high_val = float(range_match.group(2))
            return low_val, high_val, s
        except ValueError:
            pass

    # Single number fallback
    num_match = re.search(r"(-?\d+(?:\.\d+)?)", s)
    if num_match:
        try:
            val = float(num_match.group(1))
            return 0.0, val, s
        except ValueError:
            pass

    return None, None, s


from services.biomarker_aliases import ALIASES


def resolve_reference_from_db(
    biomarker: str,
    gender: str = "female"
) -> Tuple[Optional[float], Optional[float], str, Optional[float], Optional[float], str]:
    """
    Look up standard reference range and critical bounds in REFERENCE_RANGES database.
    Safely handles dicts, tuples, missing keys, and alias normalization.
    Returns: (low, high, raw_string, critical_low, critical_high, unit)
    """
    target_key = biomarker
    if target_key not in REFERENCE_RANGES:
        for std_name, aliases in ALIASES.items():
            if target_key.lower() == std_name.lower() or any(target_key.lower() == a.lower() for a in aliases):
                target_key = std_name
                break

    if target_key not in REFERENCE_RANGES:
        return None, None, "", None, None, ""

    entry = REFERENCE_RANGES[target_key]

    # Handle case where entry is directly a tuple e.g. (12.0, 15.5)
    if isinstance(entry, (tuple, list)):
        low = float(entry[0]) if len(entry) > 0 else None
        high = float(entry[1]) if len(entry) > 1 else None
        return low, high, f"{low} - {high}", None, None, ""

    # If entry is a dict
    if isinstance(entry, dict):
        unit = entry.get("unit", "")
        critical_low = entry.get("critical_low")
        critical_high = entry.get("critical_high")

        # Select gender-specific or 'all'
        g_key = gender.lower() if gender else "female"
        target_range = None

        if g_key in entry and isinstance(entry[g_key], (tuple, list)):
            target_range = entry[g_key]
        elif "all" in entry and isinstance(entry["all"], (tuple, list)):
            target_range = entry["all"]
        else:
            # Check if any tuple exists in dict
            for v in entry.values():
                if isinstance(v, (tuple, list)):
                    target_range = v
                    break

        if target_range:
            low = float(target_range[0]) if len(target_range) > 0 else None
            high = float(target_range[1]) if len(target_range) > 1 else None
            return low, high, f"{low} - {high}", critical_low, critical_high, unit

        return None, None, "", critical_low, critical_high, unit

    return None, None, "", None, None, ""


def evaluate_status(
    value: float,
    low: Optional[float],
    high: Optional[float],
    critical_low: Optional[float] = None,
    critical_high: Optional[float] = None
) -> str:
    """
    Classifies a biomarker value into:
    - CRITICAL: extreme deviation posing immediate clinical risk
    - LOW: below reference range
    - HIGH: above reference range
    - NORMAL: within reference range (or unclassified)
    """
    # Check critical thresholds first
    if critical_low is not None and value < critical_low:
        return "CRITICAL"
    if critical_high is not None and value > critical_high:
        return "CRITICAL"

    # Extreme deviation heuristics if critical bounds not explicitly defined
    if low is not None and high is not None:
        span = max(high - low, 1.0)
        if value < (low - 1.5 * span):
            return "CRITICAL"
        if value > (high + 2.0 * span):
            return "CRITICAL"

    if low is not None and value < low:
        return "LOW"
    if high is not None and value > high:
        return "HIGH"

    return "NORMAL"


def check_reference_ranges(biomarkers: Dict[str, Any], gender: str = "female") -> Dict[str, Any]:
    """
    Validates all extracted biomarkers against:
    1. Report-provided reference ranges (highest priority)
    2. Medical reference database (fallback)
    
    Guarantees:
    - NEVER crashes on unexpected data types or malformed tuples/strings
    - NEVER discards uncataloged biomarkers (retains them with SAFE/NORMAL status)
    - Returns standardized, frontend-ready structure
    """
    results = {}

    for biomarker, data in biomarkers.items():
        if not isinstance(data, dict):
            continue

        raw_val = data.get("value")
        if raw_val is None:
            continue

        try:
            value = float(raw_val)
        except (ValueError, TypeError):
            continue

        original_name = data.get("original_name") or data.get("parameter") or biomarker
        unit = data.get("unit", "")
        extracted_ref = data.get("reference_range")

        low, high, raw_range = None, None, ""
        critical_low, critical_high = None, None

        # 1. Try to use extracted reference range from report
        if extracted_ref:
            low, high, raw_range = parse_range_string(extracted_ref)

        # 2. If report did not supply a parseable range, fall back to our DB
        db_low, db_high, db_raw, c_low, c_high, db_unit = resolve_reference_from_db(biomarker, gender)
        critical_low, critical_high = c_low, c_high

        if low is None and high is None:
            low, high, raw_range = db_low, db_high, db_raw

        if not unit and db_unit:
            unit = db_unit

        # 3. Determine status
        status = evaluate_status(value, low, high, critical_low, critical_high)

        # Format normal range for human display
        if low is not None and high is not None:
            display_range = f"{low} - {high}"
        elif low is not None:
            display_range = f"> {low}"
        elif high is not None:
            display_range = f"< {high}"
        else:
            display_range = raw_range if raw_range else "Not Specified"

        results[biomarker] = {
            "parameter": biomarker,
            "original_name": original_name,
            "value": value,
            "unit": unit,
            "reference_range": {
                "low": low,
                "high": high,
                "display": display_range,
                "raw": raw_range
            },
            "status": status
        }

    return results