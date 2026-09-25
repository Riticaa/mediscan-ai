import fitz  # PyMuPDF
import os
import io
import shutil
from PIL import Image

import subprocess
from pathlib import Path

# Locate tesseract binary on the system
TESSERACT_BIN = None
for candidate in [
    os.getenv("TESSERACT_CMD"),
    shutil.which("tesseract"),
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"),
]:
    if candidate and os.path.exists(candidate):
        TESSERACT_BIN = candidate
        break

try:
    import pytesseract
    if TESSERACT_BIN:
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_BIN
except ImportError:
    pytesseract = None


def run_ocr(image: Image.Image) -> str:
    """
    Runs OCR on a PIL Image object using pytesseract if available,
    or directly executes the tesseract binary via subprocess.
    """
    # 1. Try pytesseract if library is installed
    if pytesseract is not None:
        try:
            return pytesseract.image_to_string(image, lang="eng").strip()
        except Exception as e:
            print(f"[OCR] pytesseract call failed, attempting CLI fallback: {e}")

    # 2. Direct CLI fallback using tesseract binary
    if TESSERACT_BIN and os.path.exists(TESSERACT_BIN):
        try:
            buf = io.BytesIO()
            if image.mode != "RGB":
                image = image.convert("RGB")
            image.save(buf, format="PNG")
            img_bytes = buf.getvalue()

            res = subprocess.run(
                [TESSERACT_BIN, "stdin", "stdout", "-l", "eng"],
                input=img_bytes,
                capture_output=True,
                check=True,
                timeout=30,
            )
            return res.stdout.decode("utf-8", errors="replace").strip()
        except Exception as cli_err:
            print(f"[OCR] Direct tesseract CLI failed: {cli_err}")

    return ""


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a PDF file.
    - If PDF has selectable text (digital) → use PyMuPDF directly (fast & accurate)
    - If PDF is scanned (image-based) → use OCR on each page
    """
    text = ""
    doc = fitz.open(file_path)

    for page_num, page in enumerate(doc):
        page_text = page.get_text().strip()

        if len(page_text) > 20:
            # Digital text exists on this page
            text += f"\n--- Page {page_num + 1} ---\n{page_text}"
        else:
            # Scanned or image-only page: render as image and OCR
            try:
                pix = page.get_pixmap(dpi=200)
                img_bytes = pix.tobytes("png")
                image = Image.open(io.BytesIO(img_bytes))
                ocr_text = run_ocr(image)
                if ocr_text:
                    text += f"\n--- Page {page_num + 1} (OCR) ---\n{ocr_text}"
                elif page_text:
                    text += f"\n--- Page {page_num + 1} ---\n{page_text}"
            except Exception as ocr_err:
                print(f"Warning: OCR page {page_num + 1} failed: {ocr_err}")
                if page_text:
                    text += f"\n--- Page {page_num + 1} ---\n{page_text}"

    doc.close()
    return text.strip()


def extract_text_from_image(file_path: str) -> str:
    """
    Extract text from a JPG/PNG image using OCR.
    """
    image = Image.open(file_path)
    if image.mode != "RGB":
        image = image.convert("RGB")
    return run_ocr(image)


def clean_extracted_text(text: str) -> str:
    """
    Clean up common OCR artifacts and redundant whitespace from medical reports.
    """
    lines = text.split("\n")
    cleaned = []

    for line in lines:
        line = line.strip()
        # Skip empty lines and trivial stray symbols
        if len(line) > 1 and not line.startswith("--- Page"):
            cleaned.append(line)
        elif line.startswith("--- Page"):
            cleaned.append(line)

    return "\n".join(cleaned)