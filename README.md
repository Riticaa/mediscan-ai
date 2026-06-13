# 🏥 MediScan AI
### *Your medical reports, explained in plain language*

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20FastAPI%20%2B%20GPT--4o-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🧬 What is MediScan AI?

Patients receive lab reports, blood tests, and radiology findings written in dense 
medical language — and most can't decode them without a doctor's visit.

**MediScan AI** is an AI-powered pipeline that:
- 📄 Accepts PDF and scanned image reports (including handwritten ones via OCR)
- 🔬 Extracts values, reference ranges, and flags abnormal findings
- 🗣️ Explains results in plain English *or* Hindi
- ⚠️ Assigns a severity risk score to each report
- 📈 Tracks your health metrics over time across multiple uploads
- 🩺 Recommends which specialist to consult based on findings
- 💬 Lets you ask follow-up questions in a chat interface

> ⚕️ **Disclaimer:** MediScan AI is an educational tool. It does not replace 
> professional medical advice, diagnosis, or treatment.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | FastAPI (Python) |
| LLM | OpenAI GPT-4o (vision + text) |
| OCR | Tesseract + PyMuPDF |
| Database | SQLite → PostgreSQL |
| Auth | JWT |
| Storage | Local → AWS S3 |
| Deploy | Vercel (FE) + Render (BE) |

---

## 📁 Project Structure

\`\`\`
mediscan-ai/
├── frontend/          ← React app (Vite + Tailwind)
│   └── src/
│       ├── components/
│       ├── pages/
│       └── App.jsx
├── backend/           ← FastAPI app
│   ├── main.py
│   ├── routes/
│   ├── services/
│   │   ├── ocr.py        ← PDF + image text extraction
│   │   ├── llm.py        ← GPT-4o integration
│   │   ├── extractor.py  ← Structured data extraction
│   │   └── risk_scorer.py
│   └── database.py
└── .github/workflows/ ← CI pipeline
\`\`\`

---

## 🚀 Getting Started

### Backend
\`\`\`bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

---

## 🗺️ Roadmap

- [x] Phase 1 — Project setup & repo structure
- [ ] Phase 2 — PDF/image ingestion + OCR pipeline
- [ ] Phase 3 — GPT-4o report explanation engine
- [ ] Phase 4 — Risk scorer + structured extraction
- [ ] Phase 5 — Upload page + report display UI
- [ ] Phase 6 — Chat interface
- [ ] Phase 7 — Health timeline dashboard
- [ ] Phase 8 — Auth (JWT)
- [ ] Phase 9 — Hindi language support
- [ ] Phase 10 — Production deployment

---

*Built with ❤️ as a real-world AI portfolio project*