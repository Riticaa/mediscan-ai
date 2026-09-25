import os
import json
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

# Ensure .env is loaded regardless of current working directory
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if _ENV_PATH.exists():
    load_dotenv(dotenv_path=_ENV_PATH)
load_dotenv()

router = APIRouter(tags=["Chat"])

def get_groq_client():
    key = os.getenv("GROQ_API_KEY")
    if not key and _ENV_PATH.exists():
        load_dotenv(dotenv_path=_ENV_PATH)
        key = os.getenv("GROQ_API_KEY")
    if key and key.strip():
        try:
            return Groq(api_key=key.strip())
        except Exception as e:
            print(f"[Chat] Groq client init warning: {e}")
            return None
    return None

CHAT_SYSTEM_PROMPT = """
You are MediScan AI, an intelligent, empathetic medical report analyzer and healthcare assistant.
You help patients understand lab results, biomarkers, medical terms, and healthy living guidelines in simple, warm, accessible language.

CLINICAL BOUNDARIES & GUIDELINES:
1. You are NOT a doctor. You do NOT make definitive clinical diagnoses or prescribe prescription medications.
2. When Patient Report Context is provided, ground your answers in the user's specific laboratory results, reference ranges, and abnormal findings.
3. When NO report is provided or the user asks general health/medical questions, explain clearly and educationally using standard clinical knowledge and RAG context.
4. Format your responses with clear spacing, concise bullet points, and bold terms where helpful to make reading effortless.
5. If the user asks in Hindi, reply in natural, fluent Hindi while keeping medical biomarker names (e.g., Hemoglobin, Creatinine, SGOT, TSH) and units in English.
6. Keep responses friendly, factual, reassuring, and concise (typically 2 to 4 short paragraphs or bullet points).
7. Always include a gentle closing reminder to consult a qualified medical professional for individualized clinical decisions.
"""


class ChatMessage(BaseModel):
    role: str        # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    report_context: Optional[dict] = None   # The analysis object from the report
    language: Optional[str] = "english"


class ChatResponse(BaseModel):
    reply: str
    language: str


def _build_report_summary(report_context: dict) -> str:
    """Builds a concise text summary of the report to inject into the system context."""
    if not report_context:
        return "No specific patient report uploaded yet. Answer user questions with general medical guidelines."

    lines = []
    analysis = report_context.get("analysis", report_context)

    # Risk summary
    risk = analysis.get("risk_badge", "Unknown")
    score = analysis.get("risk_score", "-")
    health = analysis.get("health_score", "-")
    lines.append(f"Risk Assessment: {risk} (Risk Score: {score}/100, Health Score: {health}/100)")

    # Patient info
    pi = analysis.get("patient_info", {})
    if pi.get("patient_name"):
        lines.append(f"Patient: {pi['patient_name']}, Age: {pi.get('age', 'Unknown')}, Gender: {pi.get('gender', 'Unknown')}")

    # Report type
    lines.append(f"Report Type: {analysis.get('report_type', 'General Pathology')}")

    # Parameters
    params = analysis.get("parameters", [])
    if params:
        lines.append("\nBiomarker Results:")
        for p in params:
            status = p.get("status", "Normal")
            lines.append(f"  • {p['name']}: {p['value']} {p.get('unit','')} (Ref: {p.get('normal_range','N/A')}) — {status}")

    # Abnormal findings
    abnormal = analysis.get("abnormal_findings", [])
    if abnormal:
        lines.append(f"\nAbnormal Findings: {'; '.join(abnormal)}")

    # Recommended specialists
    specs = analysis.get("recommended_specialists", [])
    if specs:
        spec_text = ", ".join(specs) if isinstance(specs, list) else str(specs)
        lines.append(f"Recommended Specialist: {spec_text}")

    # Summary
    summary = analysis.get("summary", "")
    if summary:
        lines.append(f"\nOverall Clinical Summary: {summary}")

    return "\n".join(lines)


def _generate_fallback_chat_reply(
    last_user_msg: str,
    report_context: Optional[dict],
    language: str,
    rag_snippet: str = ""
) -> str:
    """
    Intelligent, deterministic fallback reply when LLM service is temporarily unreachable.
    Uses RAG medical knowledge and report context to ensure 100% smooth uptime.
    """
    is_hindi = (language or "english").lower() == "hindi"
    msg_lower = last_user_msg.lower()
    ctx = report_context.get("analysis", report_context) if report_context else {}

    # 1. Greetings
    if any(k in msg_lower for k in ["hello", "hi", "hey", "namaste", "नमस्ते", "help"]):
        if ctx and ctx.get("parameters"):
            report_name = ctx.get("report_type", "Medical Report")
            risk = ctx.get("risk_badge", "Analyzed")
            if is_hindi:
                return (
                    f"नमस्ते! मैं MediScan AI Chat हूँ। आपकी **{report_name}** ({risk}) मेरे पास लोड है।\n\n"
                    "आप किसी भी पैरामीटर (जैसे Hemoglobin, Sugar, Thyroid), असामान्य मानों या परामर्श के बारे में पूछ सकते हैं।"
                )
            return (
                f"Hello! I am MediScan AI Chat. Your **{report_name}** ({risk}) is loaded in our session.\n\n"
                "Feel free to ask about any specific biomarker, abnormal findings, reference ranges, or questions to ask your doctor!"
            )
        else:
            if is_hindi:
                return (
                    "नमस्ते! मैं MediScan AI Chat हूँ।\n\n"
                    "आप किसी भी मेडिकल टेस्ट (जैसे CBC, Lipid Profile, LFT, KFT, Thyroid), सामान्य रेंज या स्वास्थ्य सलाह के बारे में पूछ सकते हैं।"
                )
            return (
                "Hello! I am MediScan AI Chat, your medical assistant.\n\n"
                "You can ask me about lab tests (like CBC, Lipid Profile, LFT, KFT, Thyroid), normal biomarker ranges, or general health guidelines. If you have a report, upload it for a tailored review!"
            )

    # 2. Doctor / Specialist inquiry
    if any(k in msg_lower for k in ["doctor", "specialist", "consult", "physician", "hospital", "डॉक्टर", "परामर्श"]):
        specs = ctx.get("recommended_specialists", []) or ["General Physician"]
        spec_str = ", ".join(specs) if isinstance(specs, list) else str(specs)
        if is_hindi:
            return (
                f"आपकी स्थिति व जांच के आधार पर, **{spec_str}** से परामर्श करना सबसे उचित रहेगा।\n\n"
                "वे आपके पूरे चिकित्सीय इतिहास और लक्षणों के संदर्भ में इन परिणामों का मूल्यांकन कर सही उपचार योजना बता सकते हैं।"
            )
        return (
            f"Based on clinical evaluation, consulting a **{spec_str}** is recommended.\n\n"
            "A physician will evaluate your lab results alongside your physical symptoms and history to recommend appropriate next steps."
        )

    # 3. Abnormalities / High / Low inquiry
    if any(k in msg_lower for k in ["abnormal", "high", "low", "issue", "problem", "असामान्य", "खराब", "कम", "ज्यादा"]):
        if ctx:
            abnormal_params = [
                f"• **{p.get('name', '')}**: {p.get('value', '')} {p.get('unit', '')} (Ref: {p.get('normal_range', 'Standard')}) — *{p.get('status', 'Abnormal')}*"
                for p in ctx.get("parameters", [])
                if str(p.get("status", "")).upper() in ["HIGH", "LOW", "CRITICAL"]
            ]
            if abnormal_params:
                items_str = "\n".join(abnormal_params[:6])
                if is_hindi:
                    return (
                        f"आपकी रिपोर्ट में निम्नलिखित पैरामीटर सामान्य सीमा से बाहर हैं:\n\n{items_str}\n\n"
                        "कृपया इन विशिष्ट परिणामों पर अपने चिकित्सक से चर्चा करें ताकि आवश्यक सुधार किए जा सकें।"
                    )
                return (
                    f"The following biomarkers in your report are outside normal standard ranges:\n\n{items_str}\n\n"
                    "We recommend sharing these findings with your doctor for clinical correlation."
                )
            else:
                if is_hindi:
                    return "आपकी रिपोर्ट के सभी विश्लेषित पैरामीटर सामान्य सीमा (Normal Range) के भीतर प्रतीत होते हैं।"
                return "All analyzed parameters in your report appear to be within their standard reference intervals."
        elif rag_snippet:
            return rag_snippet

    # 4. RAG-grounded response if knowledge matched
    if rag_snippet:
        if is_hindi:
            return (
                f"{rag_snippet}\n\n"
                "*नोट: यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। व्यक्तिगत सलाह के लिए अपने चिकित्सक से संपर्क करें।*"
            )
        return (
            f"{rag_snippet}\n\n"
            "*Note: This information is for educational guidance only. Please consult a qualified medical professional for diagnosis.*"
        )

    # 5. Report summary inquiry
    if ctx and ctx.get("summary"):
        summary = ctx.get("summary")
        risk = ctx.get("risk_badge", "Normal")
        score = ctx.get("health_score", "-")
        if is_hindi:
            return (
                f"**रिपोर्ट विश्लेषण सारांश** (स्वास्थ्य स्कोर: {score}/100, जोखिम: {risk}):\n\n{summary}\n\n"
                "क्या आप किसी विशिष्ट टेस्ट या मान के बारे में और जानना चाहते हैं?"
            )
        return (
            f"**Report Analysis Summary** (Health Score: {score}/100, Risk: {risk}):\n\n{summary}\n\n"
            "Would you like more details on any particular biomarker or next steps?"
        )

    # 6. Default graceful medical guidance
    if is_hindi:
        return (
            "मैं आपकी मेडिकल रिपोर्ट और प्रयोगशाला परीक्षणों से संबंधित प्रश्नों में मदद के लिए उपलब्ध हूँ। "
            "आप अपने किसी विशेष टेस्ट (जैसे Sugar, Hemoglobin, Cholesterol) या डॉक्टर से परामर्श के बारे में पूछ सकते हैं। "
            "कृपया किसी भी नैदानिक निर्णय के लिए योग्य चिकित्सक से संपर्क करें।"
        )
    return (
        "I am here to help you understand your medical reports and lab tests. "
        "You can ask about any specific biomarker (e.g., Hemoglobin, Cholesterol, Blood Sugar, Thyroid), "
        "what your results mean, or what to ask your physician. "
        "Always consult a licensed doctor for definitive diagnosis and treatment."
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_report(request: ChatRequest):
    """
    Conversational AI endpoint — answers questions about the medical report or general lab tests.
    Ensures 100% uptime with Groq LLM and instant medical RAG fallback.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided.")

    last_user_msg = request.messages[-1].content.strip() if request.messages else ""
    user_language = (request.language or "english").lower()

    # 1. Retrieve RAG semantic knowledge for the user query
    rag_context_text = ""
    rag_snippet_for_fallback = ""
    try:
        from services.embeddings import semantic_search
        if last_user_msg:
            hits = semantic_search(last_user_msg, top_k=2)
            snippets = []
            for score, item in hits:
                if score >= 0.07:
                    b_name = item.get("biomarker", "")
                    desc = item.get("description", "")
                    norm = item.get("normal_range_reference", "Standard Range")
                    high_imp = item.get("high_implication", "")
                    low_imp = item.get("low_implication", "")
                    life = item.get("lifestyle_guidance", "")
                    spec = item.get("specialist", "General Physician")

                    snippet = (
                        f"Biomarker: {b_name}\n"
                        f"Description: {desc}\n"
                        f"Reference Interval: {norm}\n"
                        f"Clinical Implications: High: {high_imp} | Low: {low_imp}\n"
                        f"Lifestyle & Dietary Advice: {life}\n"
                        f"Recommended Specialist: {spec}"
                    )
                    snippets.append(snippet)
                    if not rag_snippet_for_fallback:
                        rag_snippet_for_fallback = (
                            f"**{b_name} Overview**\n\n"
                            f"{desc}\n\n"
                            f"• **Typical Reference Range**: {norm}\n"
                            f"• **Clinical Significance**: {high_imp or low_imp}\n"
                            f"• **Lifestyle / Dietary Advice**: {life}\n"
                            f"• **Specialist to Consult**: {spec}"
                        )

            if snippets:
                rag_context_text = "\n\n[RELEVANT MEDICAL KNOWLEDGE (RAG)]:\n" + "\n---\n".join(snippets)
    except Exception as rag_err:
        print(f"[Chat] RAG retrieval notice: {rag_err}")

    # 2. Build system context with injected report summary and RAG
    report_summary = _build_report_summary(request.report_context or {})
    system_content = (
        CHAT_SYSTEM_PROMPT.strip()
        + f"\n\n[PATIENT REPORT CONTEXT]\n{report_summary}"
        + rag_context_text
    )

    # 3. Assemble message history
    groq_messages = [{"role": "system", "content": system_content}]
    for msg in request.messages[-12:]:
        groq_messages.append({
            "role": msg.role,
            "content": msg.content
        })

    if user_language == "hindi":
        groq_messages.append({
            "role": "system",
            "content": "The user requested Hindi. Respond in warm, natural Hindi. Keep biomarker names and numerical units in English."
        })

    # 4. Attempt Groq API completion
    current_client = get_groq_client()
    response = None

    if current_client:
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

        for model in candidate_models:
            try:
                response = current_client.chat.completions.create(
                    model=model,
                    temperature=0.35,
                    max_tokens=600,
                    messages=groq_messages,
                )
                if response and response.choices and response.choices[0].message.content.strip():
                    break
            except Exception as e:
                # Log model attempt and try next candidate
                print(f"[Chat] Model {model} attempt: {e}")
                continue

    # 5. Return LLM reply if successful
    if response and response.choices and response.choices[0].message.content.strip():
        reply_text = response.choices[0].message.content.strip()
        return ChatResponse(reply=reply_text, language=request.language or "english")

    # 6. Fallback to resilient clinical generator (100% smooth uptime)
    fallback_reply = _generate_fallback_chat_reply(
        last_user_msg=last_user_msg,
        report_context=request.report_context,
        language=user_language,
        rag_snippet=rag_snippet_for_fallback
    )
    return ChatResponse(reply=fallback_reply, language=request.language or "english")

