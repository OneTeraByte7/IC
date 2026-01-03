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

# Initialize FastAPI app
app = FastAPI(
    title="NeuroPath AI API",
    description="AI-Powered Stroke Rehabilitation Platform",
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

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "NeuroPath AI - Stroke Rehabilitation API",
        "version": "2.0.0",
        "status": "operational",
        "docs": "/api/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "NeuroPath AI Backend"
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
