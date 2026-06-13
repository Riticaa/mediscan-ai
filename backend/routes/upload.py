from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ocr import extract_text_from_pdf, extract_text_from_image
import shutil
import os

router = APIRouter(prefix="/upload", tags=["Upload"])

ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"]
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/report")
async def upload_report(file: UploadFile = File(...)):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Only PDF, JPG, PNG allowed."
        )

    # Save file temporarily
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text based on type
    try:
        if file.content_type == "application/pdf":
            extracted_text = extract_text_from_pdf(file_path)
        else:
            extracted_text = extract_text_from_image(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

    return {
        "filename": file.filename,
        "file_type": file.content_type,
        "extracted_text": extracted_text,
        "char_count": len(extracted_text),
        "status": "success"
    }