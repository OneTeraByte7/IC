"""
NeuroPath AI - FastAPI Backend Server
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
from pathlib import Path

# Import routers
from routers import exercise_session, patients
from api.exercise_session import router as api_exercise_router
from services.azure_speech import router as speech_router
from services.azure_openai import router as openai_router
from services.azure_vision import router as vision_router

# Initialize FastAPI app
app = FastAPI(
    title="NeuroPath AI API - Azure Powered",
    description="AI-Powered Stroke Rehabilitation with Microsoft Azure",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create data directories
DATA_DIR = Path("data/patients")
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Include routers
app.include_router(exercise_session.router, prefix="/api", tags=["Exercise"])
app.include_router(patients.router, prefix="/api", tags=["Patients"])
app.include_router(api_exercise_router, tags=["Exercise API"])
app.include_router(speech_router, tags=["Azure Speech"])
app.include_router(openai_router, tags=["Azure OpenAI"])
app.include_router(vision_router, tags=["Azure Vision"])

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "NeuroPath AI - Powered by Microsoft Azure",
        "version": "2.0.0",
        "status": "operational",
        "services": {
            "azure_openai": "GPT-4 AI Coach",
            "azure_speech": "Voice Guidance & Commands",
            "azure_vision": "Exercise Form Analysis"
        },
        "docs": "/api/docs",
        "health": "/api/health",
        "azure_status": "/azure-status"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "NeuroPath AI Backend"
    }

@app.get("/azure-status")
async def azure_status():
    """Check status of all Azure services"""
    
    # Import services
    from services.azure_speech import speech_service
    from services.azure_openai import openai_service
    from services.azure_vision import vision_service
    
    return {
        "azure_openai": {
            "available": openai_service.available,
            "status": "✅ Ready" if openai_service.available else "⚠️  Mock Mode"
        },
        "azure_speech": {
            "available": speech_service.available,
            "status": "✅ Ready" if speech_service.available else "⚠️  Mock Mode"
        },
        "azure_vision": {
            "available": vision_service.available,
            "status": "✅ Ready" if vision_service.available else "⚠️  Mock Mode"
        },
        "message": "Add Azure credentials to .env to enable all features"
    }

if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "="*60)
    print("🏥 NEUROPATH AI - BACKEND SERVER")
    print("="*60)
    print("\n📡 Starting server...\n")
    print("🔗 API Root:      http://127.0.0.1:8000")
    print("📚 API Docs:      http://127.0.0.1:8000/api/docs")
    print("🏥 Health Check:  http://127.0.0.1:8000/api/health")
    print("\n💡 Press CTRL+C to stop\n")
    print("="*60 + "\n")
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
