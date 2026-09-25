import os
import json
from pathlib import Path
from typing import Dict, Any, List
from groq import Groq
from dotenv import load_dotenv

_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if _ENV_PATH.exists():
    load_dotenv(dotenv_path=_ENV_PATH)
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize Groq client: {e}")
        client = None

SYSTEM_PROMPT = """
You are MediScan AI, an empathetic, educational medical report analyzer.
You are NOT a doctor and you DO NOT diagnose conditions or prescribe medications.

CRITICAL INSTRUCTIONS:
1. Explain findings in plain, reassuring, patient-friendly language.
2. Rely strictly on the supplied laboratory findings, reference ranges, and verified medical context (RAG). Do NOT invent or contradict values.
3. For abnormal biomarkers (LOW, HIGH, CRITICAL), explain what this generally reflects physiologically.
4. Avoid alarming language; emphasize clinical correlation and consulting a licensed healthcare provider.
5. If the requested language is Hindi, respond in natural, accessible Hindi while keeping medical parameter names and standard units in English.
6. Return ONLY valid JSON matching the exact schema requested without any extra text or code fences.
"""


def generate_fallback_summary(
    validated_report: Dict[str, Any],
    risk_data: Dict[str, Any],
    language: str = "english"
) -> Dict[str, Any]:
    """
    Deterministic rule-based fallback summary if the LLM API is unavailable.
    Guarantees 100% uptime without crashing.
    """
    abnormal_items = [
        f"{k} is {v['status'].lower()} ({v['value']} {v.get('unit', '')})"
        for k, v in validated_report.items()
        if v.get("status") in ["LOW", "HIGH", "CRITICAL"]
    ]

    is_hindi = language.lower() == "hindi"

    if is_hindi:
        if not abnormal_items:
            summary = "आपकी मेडिकल रिपोर्ट के सभी जाँचे गए पैरामीटर सामान्य सीमा (Normal Range) में हैं। अपनी सेहत को बनाए रखने के लिए संतुलित आहार और नियमित दिनचर्या का पालन करें।"
        else:
            summary = f"आपकी रिपोर्ट में कुछ पैरामीटर सामान्य सीमा से बाहर हैं: {', '.join(abnormal_items[:3])}। कृपया विस्तृत सलाह और मार्गदर्शन के लिए अपने डॉक्टर से संपर्क करें।"
        
        disclaimer = "अस्वीकरण: यह विश्लेषण केवल शैक्षिक और सूचनात्मक उद्देश्यों के लिए है और यह किसी योग्य चिकित्सक के चिकित्सकीय परामर्श, निदान या उपचार का विकल्प नहीं है।"
    else:
        if not abnormal_items:
            summary = "All analyzed biomarkers are within their expected biological reference ranges. Continue maintaining healthy lifestyle habits and routine wellness screenings."
        else:
            summary = f"The analysis identified variations in: {', '.join(abnormal_items[:3])}. These findings should be discussed with a healthcare professional to understand their clinical context."

        disclaimer = "Disclaimer: MediScan AI is an educational tool and does not provide medical diagnosis or treatment advice. Always consult a qualified healthcare professional."

    param_exps = {}
    for k, v in validated_report.items():
        st = v.get("status", "NORMAL")
        val = v.get("value")
        u = v.get("unit", "")
        if st == "NORMAL":
            param_exps[k] = f"{k} is {val} {u}, which falls within the healthy reference range." if not is_hindi else f"{k} का स्तर {val} {u} है, जो सामान्य सीमा के भीतर है।"
        elif st == "LOW":
            param_exps[k] = f"{k} is below the expected reference interval. Consider discussing potential nutritional or physiological factors with your doctor." if not is_hindi else f"{k} का स्तर सामान्य से कम है। कृपया चिकित्सक से परामर्श लें।"
        else:
            param_exps[k] = f"{k} is elevated above the normal range. Further clinical evaluation is recommended." if not is_hindi else f"{k} का स्तर सामान्य सीमा से अधिक है। चिकित्सक से समीक्षा की सलाह दी जाती है।"

    return {
        "summary": summary,
        "patient_friendly_explanation": summary,
        "abnormal_findings": abnormal_items,
        "parameter_explanations": param_exps,
        "questions_to_discuss_with_doctor": [
            f"What could be contributing to my {item.split(' ')[0]} level?" for item in abnormal_items[:3]
        ] if abnormal_items else ["Are there any preventive checkups recommended for my age group?"],
        "disclaimer": disclaimer
    }


def explain_report(
    validated_report: Dict[str, Any],
    rag_context: str = "",
    risk_data: Dict[str, Any] = None,
    language: str = "english"
) -> Dict[str, Any]:
    """
    Generates plain-language medical explanations using Groq/Llama with RAG grounding.
    Supports English and Hindi.
    """
    if not client:
        return generate_fallback_summary(validated_report, risk_data or {}, language)

    try:
        # Prepare structured data for prompt
        biomarker_summary = []
        for name, data in validated_report.items():
            biomarker_summary.append({
                "biomarker": name,
                "value": data.get("value"),
                "unit": data.get("unit", ""),
                "status": data.get("status", "NORMAL"),
                "normal_range": data.get("reference_range", {}).get("display", "Not specified")
            })

        user_prompt = f"""
Analyze this validated medical report data:

[REPORT PARAMETERS]:
{json.dumps(biomarker_summary, indent=2)}

[RETRIEVED MEDICAL KNOWLEDGE (RAG CONTEXT)]:
{rag_context if rag_context else "No specific guidelines retrieved; apply standard clinical knowledge."}

[OVERALL RISK ASSESSMENT]:
{json.dumps(risk_data or {}, indent=2)}

[TARGET LANGUAGE]: {language.upper()}

Please respond with ONLY a JSON object formatted as follows:
{{
  "summary": "2-3 clear sentences summarizing the overall report findings",
  "patient_friendly_explanation": "Comprehensive paragraph explaining abnormal findings and reassurance",
  "abnormal_findings": ["Brief bullet sentence for abnormal parameter 1", "Brief bullet sentence for abnormal parameter 2"],
  "parameter_explanations": {{
    "BiomarkerName": "1-2 friendly sentences explaining what this result means"
  }},
  "questions_to_discuss_with_doctor": [
    "Question 1 for doctor",
    "Question 2 for doctor"
  ],
  "disclaimer": "Clear medical disclaimer"
}}
"""
        if language.lower() == "hindi":
            user_prompt += "\nIMPORTANT: Provide the 'summary', 'patient_friendly_explanation', 'abnormal_findings', 'parameter_explanations', and 'questions_to_discuss_with_doctor' in natural Hindi. Keep biomarker names (e.g. Hemoglobin, Creatinine) and units in English."

        candidate_models = []
        env_model = os.getenv("GROQ_MODEL")
        if env_model:
            candidate_models.append(env_model)
        candidate_models.extend([
            "qwen/qwen3.8-27b",
            "openai/gpt-oss-120b",
            "allam-2-7b",
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
        ])
        candidate_models = list(dict.fromkeys(candidate_models))

        response = None
        for model_name in candidate_models:
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    temperature=0.2,
                    max_tokens=1500,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt}
                    ]
                )
                if response and response.choices:
                    break
            except Exception as model_err:
                continue

        if not response or not response.choices:
            raise RuntimeError("All Groq candidate models failed or returned empty.")

        content = response.choices[0].message.content.strip()

        # Clean JSON fences if present
        if content.startswith("```"):
            lines = content.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()

        parsed = json.loads(content)

        # Verify essential keys exist
        if "summary" not in parsed or not parsed["summary"]:
            fallback = generate_fallback_summary(validated_report, risk_data or {}, language)
            parsed["summary"] = fallback["summary"]

        if "parameter_explanations" not in parsed:
            parsed["parameter_explanations"] = {}

        return parsed

    except Exception as e:
        print(f"LLM generation warning ({e}), engaging intelligent clinical fallback.")
        return generate_fallback_summary(validated_report, risk_data or {}, language)