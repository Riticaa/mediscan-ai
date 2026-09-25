# 🏥 MediScan AI — GenAI Medical Report Analyzer

### *Generalized Multi-Panel Medical Report Extraction, RAG Knowledge Retrieval & 5-Level Clinical Risk Assessment*

![Status](https://img.shields.io/badge/status-placement--ready-brightgreen)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20FastAPI%20%2B%20Groq%20Llama%203%20%2B%20RAG-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🧬 Project Overview

**MediScan AI** is an intelligent full-stack clinical report analysis platform that accepts diverse medical laboratory reports (PDFs and images), automatically parses patient demographics and multi-panel biomarkers, validates values against in-report and standard reference ranges, retrieves grounded medical knowledge via RAG, and generates empathetic, bilingual plain-language explanations with a 5-level risk classification.

Unlike naive prototypes hardcoded for a single CBC test, MediScan AI features a **generalized clinical pipeline** capable of parsing:
- **Complete Blood Count (CBC / Hemogram)**
- **Liver Function Test (LFT / Hepatic Panel)**
- **Kidney Function Test (KFT / RFT / Renal Panel)**
- **Lipid Profile (Cholesterol, Triglycerides, HDL, LDL)**
- **Thyroid Profile (TSH, Total & Free T3/T4)**
- **Diabetes & Glycemic Profile (Fasting/PP Glucose, HbA1c)**
- **Electrolyte Panel (Sodium, Potassium, Chloride)**
- **Vitamins & Minerals (Vitamin D 25-OH, B12, Iron, Calcium)**
- **Urine Routine & Microscopy**

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
   RAG Medical Knowledge Retrieval (WHO, NIH, Mayo Clinic)
           ↓
   5-Level Risk Classification & Health Scorer
   (All Normal | Low Risk | Medium Risk | High Risk | Critical Risk)
           ↓
   LLM Clinical Generator (Groq / Llama 3)
   (Bilingual explanations in English / Hindi + Doctor Questions)
           ↓
   Structured API Response (Dual endpoint: /analyze/report & /analyse/report)
           ↓
   Placement-Ready React Frontend
```

---

## 🌟 Key Features

1. **Generalized Multi-Format Parser**:
   - Accurately parses tabular single-line rows, space-delimited text, key-value colon pairs, and multi-line OCR output blocks.
   - Automatically detects patient demographics (Name, Age, Gender) from report headers and uses the patient's gender for reference range evaluation.
2. **Type-Safe Reference Range Engine**:
   - Parses diverse range syntax (`"12.0 - 15.5"`, `"< 200"`, `"> 40"`, `"<= 100"`, `"Up to 1.2"`, `(12.0, 15.5)`).
   - Prioritizes report-provided ranges over hardcoded databases.
   - Retains uncataloged biomarkers gracefully with clean values and units without dropping them or crashing.
3. **Retrieval-Augmented Generation (RAG)**:
   - Grounded in clinically verified guidelines from WHO, NIH (MedlinePlus), and Mayo Clinic.
   - Prevents AI hallucinations by supplying factual clinical context directly into the LLM prompt.
4. **5-Level Clinical Risk Classification**:
   - Classifies reports into: `All Normal`, `Low Risk`, `Medium Risk`, `High Risk`, and `Critical Risk`.
   - Recommends appropriate medical specialists (Hematologist, Nephrologist, Cardiologist, Endocrinologist, Gastroenterologist, General Physician).
5. **Bilingual Explanations**:
   - Full support for both **English** and **Hindi** explanations with patient-friendly summaries and questions to discuss with a physician.
6. **Production & Placement-Ready UI**:
   - Built with modern React and Vite featuring interactive risk score gauges, parameter breakdown badges, filtering tabs (All, Abnormal, Normal), and authoritative citation cards.

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 19, Vite, Axios, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic |
| **OCR / PDF** | PyMuPDF (fitz), Tesseract OCR, Pillow |
| **LLM & AI** | Groq Cloud (Llama 3.3 / 3.1) with rule-based clinical fallback |
| **RAG Engine** | Authoritative Medical Knowledge Base (WHO, NIH, Mayo Clinic) |
| **Containerization**| Docker, Docker Compose |

---

## 🚀 Getting Started

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
# Add your GROQ_API_KEY to .env (Get free key at https://console.groq.com)

uvicorn main:app --reload --port 8000
```
Backend API will be accessible at `http://127.0.0.1:8000`. Interactive documentation at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

### 3. Running Automated Tests

```bash
cd backend
python -u tests/test_pipeline_comprehensive.py
python -u tests/test_real_pdf_pipeline.py
```

---

## 🐳 Docker Deployment

To build and run the entire backend with pre-configured Tesseract OCR in a container:

```bash
cd backend
docker build -t mediscan-backend .
docker run -p 8000:8000 -e GROQ_API_KEY="your_api_key" mediscan-backend
```

---

## ⚖️ Clinical Disclaimer

> **Medical Disclaimer**: MediScan AI is developed strictly for educational and informational demonstration purposes. It does not provide medical diagnosis, clinical prognosis, or treatment plans. Users should always consult a licensed medical professional for personal health concerns.