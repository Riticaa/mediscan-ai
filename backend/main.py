from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.upload import router as upload_router
from routes.analyze import router as analyze_router
from routes.chat import router as chat_router
from routes.history import router as history_router
from routes.auth import router as auth_router
from services.embeddings import load_embeddings


app = FastAPI(
    title="MediScan AI",
    description="GenAI Medical Report Analyzer with Generalized Parsing, RAG, 5-Level Risk Classification & Chat",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ──────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(analyze_router)
app.include_router(chat_router)
app.include_router(history_router)


# ─── Startup: pre-warm the TF-IDF semantic search index ──────────────────────
@app.on_event("startup")
async def startup_event():
    load_embeddings()
    print("✅ MediScan AI started — RAG semantic index ready.")


@app.get("/")
def root():
    return {
        "message": "MediScan AI API is running ✅",
        "version": "1.1.0",
        "features": [
            "Generalized multi-panel medical report parsing",
            "Report-first reference range validation",
            "TF-IDF semantic RAG knowledge retrieval",
            "5-level clinical risk classification",
            "Bilingual explanations (English / Hindi)",
            "Conversational report chat (/chat)",
            "Report history with SQLite (/history)",
            "JWT authentication (/auth/register, /auth/login)",
        ]
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.1.0"}