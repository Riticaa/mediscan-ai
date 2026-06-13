from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.upload import router as upload_router
from routes.analyse import router as analyse_router
from routes.risk import router as risk_router

app = FastAPI(
    title="MediScan AI",
    description="Medical report explanation API powered by Groq/Llama",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(analyse_router)
app.include_router(risk_router)

@app.get("/")
def root():
    return {"message": "MediScan AI backend is running ✅"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}