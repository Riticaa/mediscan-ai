import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import os

# Point to Tesseract installation on Windows
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a PDF file.
    - If PDF has selectable text (digital) → use PyMuPDF directly
    - If PDF is scanned (image-based) → use Tesseract OCR on each page
    """
    text = ""
    doc = fitz.open(file_path)

    for page_num, page in enumerate(doc):
        # Try direct text extraction first
        page_text = page.get_text().strip()

        if page_text:
            # Digital PDF — text is directly extractable
            text += f"\n--- Page {page_num + 1} ---\n{page_text}"
        else:
            # Scanned PDF — render page as image, then OCR it
            pix = page.get_pixmap(dpi=300)
            img_bytes = pix.tobytes("png")
            image = Image.open(io.BytesIO(img_bytes))
            ocr_text = pytesseract.image_to_string(image, lang="eng")
            text += f"\n--- Page {page_num + 1} (OCR) ---\n{ocr_text}"

    doc.close()
    return text.strip()


def extract_text_from_image(file_path: str) -> str:
    """
    Extract text from a JPG/PNG image using Tesseract OCR.
    Preprocesses image for better accuracy.
    """
    image = Image.open(file_path)

    # Convert to RGB if needed (handles RGBA PNGs)
    if image.mode != "RGB":
        image = image.convert("RGB")

    # OCR with English language
    text = pytesseract.image_to_string(image, lang="eng")
    return text.strip()


def clean_extracted_text(text: str) -> str:
    """
    Clean up common OCR artifacts from medical reports.
    """
    lines = text.split("\n")
    cleaned = []

    for line in lines:
        line = line.strip()
        # Skip empty lines and lines with just special characters
        if len(line) > 2:
            cleaned.append(line)

    return "\n".join(cleaned)