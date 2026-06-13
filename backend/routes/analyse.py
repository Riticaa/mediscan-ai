from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from services.ocr import extract_text_from_pdf, extract_text_from_image, clean_extracted_text
from services.llm import explain_report, explain_report_with_image
import shutil
import os
import base64

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
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Only PDF, JPG, PNG allowed."
        )

    # Save file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # If vision mode — send image directly to GPT-4o
        if use_vision and file.content_type in ["image/jpeg", "image/png"]:
            with open(file_path, "rb") as img_file:
                image_base64 = base64.b64encode(img_file.read()).decode("utf-8")
            result = explain_report_with_image(image_base64, language)

        else:
            # OCR first, then explain
            if file.content_type == "application/pdf":
                raw_text = extract_text_from_pdf(file_path)
            else:
                raw_text = extract_text_from_image(file_path)

            cleaned_text = clean_extracted_text(raw_text)

            if len(cleaned_text) < 50:
                raise HTTPException(
                    status_code=422,
                    detail="Could not extract enough text. Try enabling vision mode."
                )

            result = explain_report(cleaned_text, language)

        return {
            "filename": file.filename,
            "language": language,
            "analysis": result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))