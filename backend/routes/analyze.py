import os
import shutil
import traceback

from fastapi import APIRouter, UploadFile, File, HTTPException, Form

from services.ocr import (
    extract_text_from_pdf,
    extract_text_from_image,
    clean_extracted_text,
)
from services.report_pipeline import ReportPipeline

router = APIRouter(
    tags=["Analyze"],
)

ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
]

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

pipeline = ReportPipeline()


async def process_report_upload(
    file: UploadFile,
    language: str,
    gender: str,
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, PNG, and WEBP files are allowed."
        )

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # OCR / PDF Text Extraction
        if file.content_type == "application/pdf":
            raw_text = extract_text_from_pdf(file_path)
        else:
            raw_text = extract_text_from_image(file_path)

        cleaned_text = clean_extracted_text(raw_text)

        if len(cleaned_text.strip()) < 30:
            raise HTTPException(
                status_code=422,
                detail="Insufficient text extracted from the report. Please provide a clearer scan or document."
            )

        # Process through clinical pipeline (RAG + Validation + Risk + LLM)
        report_output = pipeline.process(
            cleaned_text,
            gender=gender,
            language=language
        )

        return {
            "success": True,
            "filename": file.filename,
            "language": language,
            "analysis": report_output["analysis"],
            "report": report_output
        }

    except HTTPException:
        raise

    except Exception as e:
        print("\n" + "=" * 80)
        print("PIPELINE ERROR TRACEBACK")
        print("=" * 80)
        traceback.print_exc()
        print("=" * 80)

        raise HTTPException(
            status_code=500,
            detail=f"Report analysis failed: {str(e)}"
        )

    finally:
        # File can be cleaned up or retained for reference
        pass


# Support both /analyze/report and /analyse/report endpoints
@router.post("/analyze/report")
async def analyze_report_z(
    file: UploadFile = File(...),
    language: str = Form(default="english"),
    gender: str = Form(default="female"),
):
    return await process_report_upload(file, language, gender)


@router.post("/analyse/report")
async def analyze_report_s(
    file: UploadFile = File(...),
    language: str = Form(default="english"),
    gender: str = Form(default="female"),
):
    return await process_report_upload(file, language, gender)