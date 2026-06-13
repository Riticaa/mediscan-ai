from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MediScan AI",
    description="Medical report explanation API powered by GPT-4o",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "MediScan AI backend is running ✅"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}