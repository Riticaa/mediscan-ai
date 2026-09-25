# 🚀 MediScan AI — Railway Deployment Guide

This guide walks you through deploying both the **FastAPI Backend** and the **React Vite Frontend** on [Railway](https://railway.app) from your GitHub repository: [`https://github.com/Riticaa/mediscan-ai`](https://github.com/Riticaa/mediscan-ai).

---

## 🏗️ Architecture Overview

```
[ Your GitHub Repo: Riticaa/mediscan-ai ]
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 [ Service 1: Backend ]    [ Service 2: Frontend ]
  • Dockerfile (with OCR)   • Vite Preview
  • FastAPI + PyMuPDF       • React + Tailwind
  • RAG + Groq AI Chat      • Global Chat Widget
        ▲                   │
        └────── HTTPS ──────┘
         (VITE_API_URL proxy)
```

---

## 📋 Prerequisites

1. A [Railway.app](https://railway.app) account (Log in with your GitHub account: `Riticaa`).
2. Your **Groq API Key** (from [console.groq.com](https://console.groq.com)).

---

## Step 1: Deploy the Backend Service

1. Go to your **[Railway Dashboard](https://railway.app/dashboard)**.
2. Click **"+ New Project"** → Select **"Deploy from GitHub repo"**.
3. Choose your repository: **`Riticaa/mediscan-ai`**.
4. Railway will create a service. Click on the newly created service tile, then go to the **"Settings"** tab:
   - **Service Name**: Rename it to `mediscan-backend` (optional, for clarity).
   - **Root Directory**: Set to `/backend` and click **Save**.
   - **Builder**: Railway will automatically detect the `Dockerfile` inside `/backend`.
5. Go to the **"Variables"** tab and add the following environment variables:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `GROQ_API_KEY` | `gsk_...` | Your Groq API Key |
   | `SECRET_KEY` | *(any random 32+ char secret string)* | JWT auth secret |
   | `DATABASE_URL` | `sqlite:///./mediscan.db` | SQLite database |
   | `GROQ_MODEL` | `qwen/qwen3.8-27b` | Primary AI model |
6. Go back to the **"Settings"** tab:
   - Scroll down to the **"Networking"** section.
   - Click **"Generate Domain"** (e.g., `https://mediscan-backend-production.up.railway.app`).
   - 📋 **Copy this domain** — you will need it in Step 2 for the frontend!

---

## Step 2: Deploy the Frontend Service

1. In the **same Railway project canvas**, click the **"+ New"** button (or right-click canvas).
2. Select **"GitHub Repo"** → Select **`Riticaa/mediscan-ai`** again.
3. Click on the new service, then go to the **"Settings"** tab:
   - **Service Name**: Rename it to `mediscan-frontend`.
   - **Root Directory**: Set to `/frontend` and click **Save**.
4. Go to the **"Variables"** tab and add:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://your-backend-domain.up.railway.app` | The backend domain generated in Step 1 |
5. Go to the **"Settings"** tab:
   - Scroll down to **"Networking"** → Click **"Generate Domain"** (e.g., `https://mediscan-production.up.railway.app`).
6. Click **"Deploy"** (or trigger redeploy if variables were just added).

---

## Step 3: Verify the Live Deployment

1. **Backend Health Check**:
   Open: `https://your-backend-domain.up.railway.app/health`
   You should see:
   ```json
   {"status": "healthy", "version": "1.1.0"}
   ```

2. **Frontend App & AI Chatbot**:
   Open: `https://your-frontend-domain.up.railway.app`
   - Test the floating **"Ask MediScan AI"** button at the bottom-right.
   - Ask a question (e.g., *"What is a normal hemoglobin range?"* or in Hindi *"नमस्ते"*).
   - Upload a test medical report PDF/JPG to test the generalized parser, 5-level risk score, and report-synced chat.

---

## 🔄 Automatic Continuous Deployment (CI/CD)

Whenever you push new commits to your GitHub branch (`main` or `mediscan-v2`), Railway will automatically detect the changes, rebuild, and redeploy both services without downtime!
