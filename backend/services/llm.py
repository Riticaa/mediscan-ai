from groq import Groq
from dotenv import load_dotenv
import os
import json
import base64

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are MediScan AI, a medical report analysis assistant.
Your job is to help patients understand their medical reports in simple,
clear language — without replacing their doctor.

When given raw text from a medical report, you must return a JSON object
with EXACTLY this structure (no extra text, no markdown, just pure JSON):

{
  "report_type": "Blood Test / Radiology / Urine Test / Unknown",
  "summary": "2-3 sentence plain language overview of the report",
  "parameters": [
    {
      "name": "Parameter name (e.g. Hemoglobin)",
      "value": "Patient's value with unit (e.g. 10.2 g/dL)",
      "normal_range": "Reference range (e.g. 13.5-17.5 g/dL)",
      "status": "Normal / High / Low / Critical",
      "explanation": "1-2 sentence plain language explanation of what this means"
    }
  ],
  "abnormal_findings": ["List of abnormal parameter names only"],
  "risk_level": "Low / Medium / High / Critical",
  "risk_reason": "One sentence explaining why this risk level was assigned",
  "doctor_referral": "Which type of specialist to see if any",
  "disclaimer": "This report analysis is for informational purposes only and does not replace professional medical advice."
}

Rules:
- If the text is NOT a medical report, set report_type to "Unknown" and explain in summary
- Always be empathetic and avoid alarming language
- If a value is missing or unclear due to OCR, mention it in the explanation
- Never make a diagnosis
- Return ONLY the JSON object, no markdown, no extra text
"""

def clean_response(raw: str) -> str:
    """Strip markdown code fences if model wraps response in them."""
    raw = raw.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        raw = "\n".join(lines)
    return raw.strip()


def explain_report(extracted_text: str, language: str = "english") -> dict:
    """
    Send extracted report text to Groq and get structured explanation.
    """
    language_instruction = ""
    if language.lower() == "hindi":
        language_instruction = "Respond in Hindi language. Keep medical terms in English but explain them in Hindi."

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Analyze this medical report text:\n\n{extracted_text}\n\n{language_instruction}"
                }
            ],
            temperature=0.3,
            max_tokens=2000
        )

        raw = clean_response(response.choices[0].message.content)
        return json.loads(raw)

    except json.JSONDecodeError:
        return {
            "error": "Failed to parse response as JSON",
            "raw_response": response.choices[0].message.content
        }
    except Exception as e:
        return {"error": str(e)}


def explain_report_with_image(image_base64: str, language: str = "english") -> dict:
    """
    For image reports — extract text first via OCR then explain.
    Groq doesn't support vision so we use the text explanation pipeline.
    """
    language_instruction = ""
    if language.lower() == "hindi":
        language_instruction = "Respond in Hindi. Keep medical terms in English."

    # Groq doesn't support vision, so we return a helpful message
    # In Phase 4 we'll handle this with OCR fallback
    return {
        "error": "Vision mode not supported with Groq. Please use OCR mode (use_vision=false)."
    }