# 🚀 MediScan AI — Deployment Guide (Render + Vercel)

This guide walks you through deploying MediScan AI with:
- **Backend on [Render](https://render.com)** (Free Web Service with Docker & OCR)
- **Frontend on [Vercel](https://vercel.com)** (Free high-speed CDN hosting for React + Vite)

Repository: [`https://github.com/Riticaa/mediscan-ai`](https://github.com/Riticaa/mediscan-ai)

---

## 🏗️ Architecture Overview

```
[ User Browser ]
       │
       ▼
 [ Vercel Frontend ] ── (HTTPS API Requests) ──► [ Render Backend ]
 • React 19 + Vite                                • FastAPI + PyMuPDF
 • TailwindCSS & Framer Motion                    • Tesseract OCR
 • Global AI Chat Floating Widget                 • Groq AI LLM + RAG
 • Automatic SPA Routing                          • SQLite / History DB
```

---

## Part 1: Deploy Backend on Render

Render provides free hosting for containerized Web Services with full Docker support (needed for Tesseract OCR).

### Method A: Automatic via Render Blueprint (Recommended)
1. Go to **[dashboard.render.com](https://dashboard.render.com)** and log in with GitHub (`Riticaa`).
2. Click **"New +"** (top right) → Select **"Blueprint"**.
3. Connect your GitHub repository: **`Riticaa/mediscan-ai`**.
4. Render will automatically read `render.yaml`:
   - It configures `mediscan-backend` using `backend/Dockerfile`.
   - It sets the health check endpoint to `/health`.
5. Under Environment Variables:
   - For **`GROQ_API_KEY`**, enter your key from [console.groq.com](https://console.groq.com) (`gsk_...`).
6. Click **"Apply"**. Render will build and deploy the Docker image.

### Method B: Manual Setup on Render
1. In Render Dashboard, click **"New +"** → **"Web Service"**.
2. Select your repository: **`Riticaa/mediscan-ai`**.
3. Fill in the service configuration:
   - **Name**: `mediscan-backend`
   - **Region**: Oregon (US West) or closest to you
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Plan**: `Free`
4. Expand **"Advanced"** and add Environment Variables:
   | Key | Value |
   | :--- | :--- |
   | `GROQ_API_KEY` | Your Groq API key (`gsk_...`) |
   | `GROQ_MODEL` | `qwen/qwen3.8-27b` |
   | `SECRET_KEY` | *(A random 32+ character string)* |
   | `DATABASE_URL` | `sqlite:///./mediscan.db` |
5. Click **"Create Web Service"**.
6. When deployment finishes, copy your live backend URL from the top of the page (e.g. `https://mediscan-backend.onrender.com`).

> [!NOTE]
> Free Render instances spin down after inactivity and take ~45 seconds to wake up on the first request.

---

## Part 2: Deploy Frontend on Vercel

Vercel provides edge caching, instant preview deployments, and zero-config builds for Vite.

1. Go to **[vercel.com](https://vercel.com)** and log in with your GitHub account (`Riticaa`).
2. Click **"Add New..."** → Select **"Project"**.
3. Import your GitHub repository: **`mediscan-ai`**.
4. In the **Configure Project** screen:
   - **Project Name**: `mediscan-ai` (or customize)
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Click **"Edit"** → Select **`frontend`** → Click **"Continue"**.
5. Expand the **Environment Variables** section:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Render Backend URL from Part 1 (e.g. `https://mediscan-backend.onrender.com`)
   *(Make sure there is no trailing slash)*
6. Click **"Deploy"**.

Vercel will build the frontend in ~20 seconds and assign you a production URL (e.g. `https://mediscan-ai.vercel.app`).

---

## Part 3: Verify Your Live Deployment

1. **Verify Backend Health**:
   Open: `https://your-backend-name.onrender.com/health`
   Expected response:
   ```json
   {"status": "healthy", "version": "1.1.0"}
   ```

2. **Verify Frontend & Chat**:
   Open your Vercel URL (`https://your-project.vercel.app`):
   - Click the floating **"Ask MediScan AI"** button at the bottom-right corner.
   - Send a message (*"What does an elevated ESR mean?"* or in Hindi *"हीमोग्लोबिन क्या है?"*).
   - Test audio dictation or Text-to-Speech.
   - Upload a test medical lab report (PDF/JPG) to test OCR extraction, biomarker classification, and synchronized chat.

---

## 🔄 Automatic Continuous Deployment (CI/CD)

Whenever you push any updates to GitHub (`git push origin main`), both **Render** and **Vercel** will automatically rebuild and deploy your changes with zero manual intervention.
