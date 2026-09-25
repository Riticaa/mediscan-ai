# 🏥 MediScan AI — GenAI Medical Report Analyzer

### *Generalized Multi-Panel Medical Report Extraction, RAG Knowledge Retrieval & 5-Level Clinical Risk Assessment*

![Status](https://img.shields.io/badge/status-live-brightgreen)
![Stack](https://img.shields.io/badge/stack-React%2019%20%2B%20FastAPI%20%2B%20Groq%20Llama%203%20%2B%20RAG-blue)
![License](https://img.shields.io/badge/license-MIT-green)

🔗 **Live App:** [mediscan-ai-git-main-ritica-s-projects.vercel.app](https://mediscan-ai-git-main-ritica-s-projects.vercel.app/)
⚙️ **Live API:** [mediscan-ai-backend-4t47.onrender.com](https://mediscan-ai-backend-4t47.onrender.com)
💻 **Source Code:** [github.com/Riticaa/mediscan-ai](https://github.com/Riticaa/mediscan-ai)

> ⚠️ The backend is hosted on Render's free tier and spins down after periods of inactivity. The **first** request after idle time can take ~30–50 seconds to wake up — please be patient on your first upload.

---

## 🧬 Project Overview

**MediScan AI** is a full-stack, AI-powered clinical report analysis platform. Upload a lab report (PDF or image) and it will:

1. **Extract** text via OCR/PDF parsing
2. **Parse** patient demographics and every biomarker in the report — regardless of panel type
3. **Validate** each value against the report's own reference range (falling back to a standard clinical database when needed)
4. **Retrieve** grounded medical context using Retrieval-Augmented Generation (RAG) from WHO, NIH, and Mayo Clinic sources
5. **Classify** overall risk into 5 clinical tiers and compute a health score
6. **Explain** the results in plain, empathetic language — in **English or Hindi** — with follow-up questions to ask a doctor
7. **Chat** with an AI assistant grounded in your specific report

Unlike prototypes hardcoded for a single test type, MediScan AI runs a **generalized pipeline** that handles:

- Complete Blood Count (CBC / Hemogram)
- Liver Function Test (LFT / Hepatic Panel)
- Kidney Function Test (KFT / RFT / Renal Panel)
- Lipid Profile (Cholesterol, Triglycerides, HDL, LDL)
- Thyroid Profile (TSH, Total & Free T3/T4)
- Diabetes & Glycemic Profile (Fasting/PP Glucose, HbA1c)
- Electrolyte Panel (Sodium, Potassium, Chloride)
- Vitamins & Minerals (Vitamin D 25-OH, B12, Iron, Calcium)
- Urine Routine & Microscopy

---

## 🏗️ Architecture & Data Flow

```
UPLOAD REPORT (PDF / Image)
           ↓
   OCR & PDF Engine (PyMuPDF + Tesseract)
           ↓
   Generalized Parser & Header Extractor
   (Extracts: Patient Name, Age, Gender, Lab, Doctor, Raw Biomarkers)
           ↓
   Biomarker Normalizer & Alias Mapper
           ↓
   Reference Range Validation Engine
   (Report-provided range has priority → Database fallback)
   (Status: LOW | NORMAL | HIGH | CRITICAL)
           ↓
   RAG Medical Knowledge Retrieval (WHO, NIH, Mayo Clinic — TF-IDF semantic search)
           ↓
   5-Level Risk Classification & Health Scorer
   (All Normal | Low Risk | Medium Risk | High Risk | Critical Risk)
           ↓
   LLM Clinical Generator (Groq / Llama 3)
   (Bilingual explanations in English / Hindi + Doctor Questions)
           ↓
   Structured API Response
           ↓
   React Frontend (Dashboard, History, Floating AI Chat)
```

**Deployment topology:**

```
[ User Browser ]
       │
       ▼
 [ Vercel Frontend ] ── HTTPS API Requests ──► [ Render Backend (Docker) ]
 • React 19 + Vite                              • FastAPI + PyMuPDF + Tesseract OCR
 • Tailwind CSS + Framer Motion                  • Groq LLM (Llama 3) + RAG engine
 • Floating AI Chat Widget                       • SQLite history + JWT auth
```

---

## 🌟 Key Features

- **Generalized multi-format parser** — handles tabular rows, space-delimited text, key-value colon pairs, and multi-line OCR blocks, and auto-detects patient Name/Age/Gender to apply gender-specific reference ranges.
- **Type-safe reference range engine** — parses varied range syntax (`"12.0 - 15.5"`, `"< 200"`, `"> 40"`, `"<= 100"`, `"Up to 1.2"`) and prioritizes the report's own range over the built-in database, keeping uncatalogued biomarkers instead of dropping them.
- **Retrieval-Augmented Generation (RAG)** — grounds LLM output in a curated medical knowledge base (WHO / NIH MedlinePlus / Mayo Clinic) via TF-IDF semantic search to reduce hallucination.
- **5-level clinical risk classification** — `All Normal → Low → Medium → High → Critical`, with suggested specialists (Hematologist, Nephrologist, Cardiologist, Endocrinologist, Gastroenterologist, General Physician).
- **Bilingual explanations** — patient-friendly summaries and doctor-discussion questions in **English and Hindi**.
- **Conversational report chat** — a floating AI assistant that answers questions grounded in the user's uploaded report (or general health questions when no report is loaded).
- **Report history & accounts** — JWT-based authentication with saved report history per user (SQLite).
- **Polished UI** — interactive risk gauges, biomarker breakdown badges, filter tabs (All / Abnormal / Normal), and citation cards for source transparency.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router, Axios, Tailwind CSS 4, Framer Motion, Lucide Icons, react-dropzone |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic |
| **OCR / PDF** | PyMuPDF (fitz), Tesseract OCR, Pillow |
| **LLM & AI** | Groq Cloud (Llama 3 family) with rule-based clinical fallback |
| **RAG Engine** | TF-IDF semantic search over an authoritative medical knowledge base (WHO, NIH, Mayo Clinic) |
| **Auth & Data** | JWT (python-jose), bcrypt, SQLAlchemy + SQLite |
| **Containerization** | Docker |
| **Hosting** | Frontend → Vercel · Backend → Render (Docker Web Service) |

---

## 📁 Project Structure

```
mediscan-ai/
├── backend/
│   ├── main.py                  # FastAPI app entrypoint
│   ├── database.py              # SQLAlchemy engine/session setup
│   ├── routes/                  # API route handlers
│   │   ├── auth.py              # Register / login / JWT session
│   │   ├── upload.py            # Raw OCR text extraction
│   │   ├── analyze.py           # Full report analysis pipeline
│   │   ├── chat.py              # Report-grounded AI chat
│   │   └── history.py           # Saved report history (CRUD)
│   ├── services/                # OCR, parsing, RAG, LLM, scoring logic
│   ├── models/                  # Pydantic data models
│   ├── knowledge/                # Medical knowledge base (JSON)
│   ├── tests/                   # Automated pipeline & unit tests
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component & routing
│   │   └── api.js               # Axios client for the backend API
│   └── vercel.json
├── render.yaml                  # Render Blueprint (backend)
└── DEPLOYMENT.md                # Step-by-step deployment guide
```

---

## 📡 API Reference

Base URL (production): `https://mediscan-ai-backend-4t47.onrender.com`
Interactive Swagger docs: `https://mediscan-ai-backend-4t47.onrender.com/docs`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and feature list |
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | Create a new user account |
| `POST` | `/auth/login` | Log in (form) and receive a JWT |
| `POST` | `/auth/login/json` | Log in (JSON body) and receive a JWT |
| `GET` | `/auth/me` | Get the current authenticated user |
| `POST` | `/auth/logout` | Log out |
| `POST` | `/report` | Upload a file and get raw extracted OCR text |
| `POST` | `/analyze/report` | Full pipeline: upload → parse → classify → explain (also aliased as `/analyse/report`) |
| `POST` | `/chat` | Send a chat message, optionally grounded in a report's analysis context |
| `POST` | `/history/save` | Save an analyzed report to history |
| `GET` | `/history` | List a user's saved reports |
| `GET` | `/history/{report_id}` | Get full detail of one saved report |
| `DELETE` | `/history/{report_id}` | Delete one saved report |
| `DELETE` | `/history` | Clear all saved report history |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) installed locally (or use the provided Dockerfile)
- A free [Groq API key](https://console.groq.com)

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to .env

uvicorn main:app --reload --port 8000
```

Backend runs at `http://127.0.0.1:8000` — interactive docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://127.0.0.1:8000

npm run dev
```

Frontend runs at `http://localhost:5173`.

### 3. Running Automated Tests

```bash
cd backend
python -u tests/test_pipeline_comprehensive.py
python -u tests/test_real_pdf_pipeline.py
```

---

## 🔑 Environment Variables

**Backend (`backend/.env`)**

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | API key from [console.groq.com](https://console.groq.com) |
| `DATABASE_URL` | SQLite (default) or PostgreSQL connection string |
| `SECRET_KEY` | Random secret for JWT signing |
| `TESSERACT_CMD` | *(optional)* Custom path to the Tesseract binary on Windows |

**Frontend (`frontend/.env`)**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

---

## 🐳 Docker Deployment (Backend)

```bash
cd backend
docker build -t mediscan-backend .
docker run -p 8000:8000 -e GROQ_API_KEY="your_api_key" mediscan-backend
```

---

## ☁️ Production Deployment

This project is deployed as two independent services:

- **Backend → [Render](https://render.com)**: Dockerized FastAPI web service (`render.yaml` blueprint included), OCR-ready with Tesseract baked into the image.
- **Frontend → [Vercel](https://vercel.com)**: Zero-config Vite build, connected to the backend via the `VITE_API_URL` environment variable.

Full step-by-step instructions (including screenshots of each dashboard step) are in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

Pushing to `main` on GitHub triggers automatic redeploys on both Render and Vercel.

---

## ⚖️ Clinical Disclaimer

> **Medical Disclaimer**: MediScan AI is developed strictly for educational and informational purposes. It does not provide medical diagnosis, clinical prognosis, or treatment plans. Always consult a licensed medical professional for personal health concerns.

---

## 📄 License

MIT
