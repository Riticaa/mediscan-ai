import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are MediScan AI. Analyze medical reports and return ONLY a valid JSON object.
No markdown, no code blocks, no extra text. Just the raw JSON.

Return exactly this structure:
{
  "report_type": "Blood Test",
  "summary": "plain language summary here",
  "parameters": [
    {
      "name": "parameter name",
      "value": "value with unit",
      "normal_range": "reference range",
      "status": "Normal or High or Low or Critical",
      "explanation": "plain language explanation"
    }
  ],
  "abnormal_findings": ["list", "of", "abnormal", "parameter", "names"],
  "risk_level": "Low or Medium or High or Critical",
  "risk_reason": "one sentence explanation",
  "doctor_referral": "specialist name",
  "disclaimer": "This report is for informational purposes only."
}"""


def explain_report(extracted_text: str, language: str = "english") -> dict:
    try:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this medical report:\n\n{extracted_text}"}
        ]

        if language.lower() == "hindi":
            messages[1]["content"] += "\n\nRespond in Hindi. Keep medical terms in English."

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.3,
            max_tokens=2000
        )

        content = response.choices[0].message.content
        if not content:
            return {"error": "Empty response from Groq"}

        # Remove any markdown if present
        content = content.strip()
        if "```" in content:
            lines = content.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            content = "\n".join(lines).strip()

        # Find JSON object
        start = content.find("{")
        end = content.rfind("}") + 1
        if start == -1 or end == 0:
            return {"error": "No JSON found in response", "raw": content}

        json_str = content[start:end]
        return json.loads(json_str)

    except json.JSONDecodeError as e:
        return {"error": f"JSON parse failed: {str(e)}"}
    except Exception as e:
        return {"error": str(e)}


def explain_report_with_image(image_base64: str, language: str = "english") -> dict:
    return {"error": "Vision mode not supported with Groq. Use OCR mode."}