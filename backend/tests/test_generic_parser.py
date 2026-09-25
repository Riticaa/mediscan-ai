from services.ocr import extract_text_from_pdf
from services.generic_parser import parse_report

pdf = "uploads/sample.pdf"

text = extract_text_from_pdf(pdf)

print("=" * 80)
print(text)
print("=" * 80)

result = parse_report(text)

print()

for k, v in result.items():
    print(v)