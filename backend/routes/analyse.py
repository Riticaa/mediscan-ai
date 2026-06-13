import os
import base64
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from services.ocr import extract_text_from_pdf, extract_text_from_image, clean_extracted_text
from services.llm import explain_report, explain_report_with_image
from services.risk_scorer import calculate_risk_score

router = APIRouter(prefix="/analyse", tags=["Analyse"])

ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"]
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/report")
async def analyse_report(
    file: UploadFile = File(...),
    language: str = Form(default="english"),
    use_vision: bool = Form(default=False)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, PNG allowed.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Step 1: Extract text
    if file.content_type == "application/pdf":
        raw_text = extract_text_from_pdf(file_path)
    else:
        raw_text = extract_text_from_image(file_path)

    cleaned_text = clean_extracted_text(raw_text)

    if len(cleaned_text) < 50:
        raise HTTPException(status_code=422, detail="Not enough text extracted.")

    # Step 2: LLM analysis
    llm_result = explain_report(cleaned_text, language)

    if not llm_result:
        raise HTTPException(status_code=500, detail="LLM returned empty result.")

    if "error" in llm_result:
        return {
            "filename": file.filename,
            "language": language,
            "error": llm_result["error"],
            "analysis": None
        }

    # Step 3: Risk scoring
    scored = calculate_risk_score(llm_result)

    return {
        "filename": file.filename,
        "language": language,
        "analysis": scored
    }