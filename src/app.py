"""
NeuroPath AI - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime, date
import numpy as np
from pathlib import Path

# Initialize FastAPI app
app = FastAPI(
    title="NeuroPath AI API",
    description="AI-Powered Stroke Rehabilitation Platform",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI at /docs
    redoc_url="/redoc"  # ReDoc at /redoc
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data directory
DATA_DIR = Path("../data/patients")
DATA_DIR.mkdir(parents=True, exist_ok=True)

# =====================
# PYDANTIC MODELS (API Schemas)
# =====================

class PatientCreate(BaseModel):
    patient_id: str
    name: str
    age: Optional[int] = None
    stroke_date: Optional[str] = None

class BaselineMeasurement(BaseModel):
    shoulder_range: float
    elbow_range: float
    wrist_strength: Optional[float] = 5.0

class ExerciseSession(BaseModel):
    exercise_type: str
    reps: int
    max_angle: float
    duration_mins: int
    pain_level: Optional[int] = 0

class PatientResponse(BaseModel):
    patient_id: str
    name: str
    created_date: str
    total_sessions: int
    baseline: Optional[dict] = None

class ProgressResponse(BaseModel):
    session_number: int
    date: str
    exercise_type: str
    reps: int
    max_angle: float
    improvement_from_baseline: float

class PredictionResponse(BaseModel):
    current_recovery_pct: float
    predicted_recovery_pct: float
    expected_improvement_pct: float
    on_track: bool
    message: str

# =====================
# UTILITY FUNCTIONS
# =====================

def load_patient_data(patient_id: str):
    """Load patient data from JSON file"""
    filepath = DATA_DIR / f"{patient_id}.json"
    if filepath.exists():
        with open(filepath, 'r') as f:
            return json.load(f)
    return None

def save_patient_data(patient_id: str, data: dict):
    """Save patient data to JSON file"""
    filepath = DATA_DIR / f"{patient_id}.json"
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def calculate_improvement(baseline: dict, current: dict) -> float:
    """Calculate improvement from baseline"""
    if not baseline:
        return 0.0
    baseline_angle = baseline.get("shoulder_range", 0)
    current_angle = current.get("max_angle", 0)
    return current_angle - baseline_angle

# =====================
# API ENDPOINTS
# =====================

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "NeuroPath AI - Stroke Rehabilitation API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# =====================
# PATIENT ENDPOINTS
# =====================

@app.post("/api/patients", response_model=PatientResponse)
async def create_patient(patient: PatientCreate):
    """Create new patient account"""
    
    # Check if patient already exists
    existing = load_patient_data(patient.patient_id)
    if existing:
        raise HTTPException(status_code=400, detail="Patient ID already exists")
    
    # Create new patient record
    patient_data = {
        "patient_id": patient.patient_id,
        "name": patient.name,
        "age": patient.age,
        "stroke_date": patient.stroke_date,
        "created_date": str(date.today()),
        "baseline": {},
        "sessions": []
    }
    
    save_patient_data(patient.patient_id, patient_data)
    
    return PatientResponse(
        patient_id=patient.patient_id,
        name=patient.name,
        created_date=patient_data["created_date"],
        total_sessions=0,
        baseline=None
    )

@app.get("/api/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: str):
    """Get patient information"""
    
    data = load_patient_data(patient_id)
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return PatientResponse(
        patient_id=data["patient_id"],
        name=data["name"],
        created_date=data["created_date"],
        total_sessions=len(data["sessions"]),
        baseline=data.get("baseline")
    )

@app.get("/api/patients")
async def list_patients():
    """List all patients"""
    
    patients = []
    for filepath in DATA_DIR.glob("*.json"):
        with open(filepath, 'r') as f:
            data = json.load(f)
            patients.append({
                "patient_id": data["patient_id"],
                "name": data["name"],
                "total_sessions": len(data["sessions"]),
                "created_date": data["created_date"]
            })
    
    return {"patients": patients, "count": len(patients)}

@app.delete("/api/patients/{patient_id}")
async def delete_patient(patient_id: str):
    """Delete patient account"""
    
    filepath = DATA_DIR / f"{patient_id}.json"
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Patient not found")
    
    filepath.unlink()
    return {"message": f"Patient {patient_id} deleted successfully"}

# =====================
# BASELINE ENDPOINTS
# =====================

@app.post("/api/patients/{patient_id}/baseline")
async def set_baseline(patient_id: str, baseline: BaselineMeasurement):
    """Set patient baseline measurements"""
    
    data = load_patient_data(patient_id)
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    data["baseline"] = {
        "date": str(date.today()),
        "shoulder_range": baseline.shoulder_range,
        "elbow_range": baseline.elbow_range,
        "wrist_strength": baseline.wrist_strength
    }
    
    save_patient_data(patient_id, data)
    
    return {
        "message": "Baseline set successfully",
        "baseline": data["baseline"]
    }

@app.get("/api/patients/{patient_id}/baseline")
async def get_baseline(patient_id: str):
    """Get patient baseline measurements"""
    
    data = load_patient_data(patient_id)
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if not data.get("baseline"):
        raise HTTPException(status_code=404, detail="Baseline not set")
    
    return data["baseline"]

# =====================
# EXERCISE SESSION ENDPOINTS
# =====================

@app.post("/api/patients/{patient_id}/sessions", response_model=ProgressResponse)
async def log_session(patient_id: str, session: ExerciseSession):
    """Log an exercise session"""
    
    data = load_patient_data(patient_id)
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Create session record
    session_record = {
        "date": str(date.today()),
        "timestamp": datetime.now().isoformat(),
        "session_number": len(data["sessions"]) + 1,
        "exercise_type": session.exercise_type,
        "reps": session.reps,
        "max_angle": session.max_angle,
        "duration_mins": session.duration_mins,
        "pain_level": session.pain_level
    }
    
    # Calculate improvement
    improvement = calculate_improvement(
        data.get("baseline", {}),
        {"max_angle": session.max_angle}
    )
    
    data["sessions"].append(session_record)
    save_patient_data(patient_id, data)
    
    return ProgressResponse(
        session_number=session_record["session_number"],
        date=session_record["date"],
        exercise_type=session_record["exercise_type"],
        reps=session_record["reps"],
        max_angle=session_record["max_angle"],
        improvement_from_baseline=improvement
    )

@app.get("/api/patients/{patient_id}/sessions")
async def get_sessions(patient_id: str, limit: int = 10):
    """Get patient exercise sessions"""
    
    data = load_patient_data(patient_id)
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    sessions = data.get("sessions", [])
    
    # Return last N sessions
    return {
        "patient_id": patient_id,
        "total_sessions": len(sessions),
        "sessions": sessions[-limit:] if limit else sessions
    }

@app.get("/api/patients/{patient_id}/sessions/{session_number}")
async def get_session(patient_id: str, session_number: int):
    """Get specific session details"""
    
    data = load_patient_data(patient_id)
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    sessions = data.get("sessions", [])
    
    if session_number < 1 or session_number > len(sessions):
        raise HTTPException(status_code=404, detail="Session not found")
    
    return sessions[session_number - 1]

# =====================
# PROGRESS & ANALYTICS ENDPOINTS
# =====================

@app.get("/api/patients/{patient_id}/progress")
async def get_progress(patient_id: str):
    """Get comprehensive progress analytics"""
    
    data = load_patient_data(patient_id)
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    sessions = data.get("sessions", [])
    
    if not sessions:
        return {
            "patient_id": patient_id,
            "message": "No sessions recorded yet",
            "stats": None
        }
    
    # Calculate statistics
    total_sessions = len(sessions)
    total_reps = sum(s.get("reps", 0) for s in sessions)
    avg_reps = total_reps / total_sessions if total_sessions > 0 else 0
    
    angles = [s.get("max_angle", 0) for s in sessions]
    current_angle = angles[-1]
    avg_angle = np.mean(angles)
    max_angle = max(angles)
    
    baseline_angle = data.get("baseline", {}).get("shoulder_range", 0)
    improvement = current_angle - baseline_angle if baseline_angle else 0
    improvement_pct = (improvement / baseline_angle * 100) if baseline_angle else 0
    
    return {
        "patient_id": patient_id,
        "stats": {
            "total_sessions": total_sessions,
            "total_reps": total_reps,
            "avg_reps_per_session": round(avg_reps, 1),
            "current_angle": round(current_angle, 1),
            "avg_angle": round(avg_angle, 1),
            "max_angle": round(max_angle, 1),
            "baseline_angle": round(baseline_angle, 1),
            "improvement_degrees": round(improvement, 1),
            "improvement_percent": round(improvement_pct, 1)
        },
        "progress_data": [
            {
                "session": s["session_number"],
                "date": s["date"],
                "angle": s["max_angle"],
                "reps": s["reps"]
            }
            for s in sessions
        ]
    }

@app.get("/api/patients/{patient_id}/predict", response_model=PredictionResponse)
async def predict_recovery(patient_id: str, weeks_ahead: int = 12):
    """Predict recovery trajectory using ML"""
    
    data = load_patient_data(patient_id)
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    sessions = data.get("sessions", [])
    
    if len(sessions) < 3:
        raise HTTPException(
            status_code=400,
            detail=f"Need at least 3 sessions for prediction. Current: {len(sessions)}"
        )
    
    # Extract data for ML
    from sklearn.linear_model import LinearRegression
    
    X = np.array([[i+1] for i in range(len(sessions))])
    y = np.array([s["max_angle"] for s in sessions])
    
    # Train model
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict future (assuming 3 sessions per week)
    future_sessions = weeks_ahead * 3
    future_X = np.array([[len(sessions) + i] for i in range(1, future_sessions + 1)])
    predictions = model.predict(future_X)
    
    # Calculate recovery percentages
    current_recovery = (y[-1] / 180) * 100
    predicted_recovery = min((predictions[-1] / 180) * 100, 100)
    expected_improvement = predicted_recovery - current_recovery
    
    # Determine if on track
    on_track = predicted_recovery >= 70
    
    # Generate message
    if predicted_recovery >= 85:
        message = "Excellent! On track for independent living!"
    elif predicted_recovery >= 70:
        message = "Good progress! Keep up the consistent effort."
    else:
        message = "Consider increasing exercise frequency for better outcomes."
    
    return PredictionResponse(
        current_recovery_pct=round(current_recovery, 1),
        predicted_recovery_pct=round(predicted_recovery, 1),
        expected_improvement_pct=round(expected_improvement, 1),
        on_track=on_track,
        message=message
    )

# =====================
# STATISTICS ENDPOINT
# =====================

@app.get("/api/stats")
async def get_system_stats():
    """Get system-wide statistics"""
    
    total_patients = len(list(DATA_DIR.glob("*.json")))
    total_sessions = 0
    total_reps = 0
    
    for filepath in DATA_DIR.glob("*.json"):
        with open(filepath, 'r') as f:
            data = json.load(f)
            sessions = data.get("sessions", [])
            total_sessions += len(sessions)
            total_reps += sum(s.get("reps", 0) for s in sessions)
    
    return {
        "total_patients": total_patients,
        "total_sessions": total_sessions,
        "total_reps": total_reps,
        "avg_sessions_per_patient": round(total_sessions / total_patients, 1) if total_patients > 0 else 0
    }

# =====================
# RUN SERVER
# =====================

if __name__ == "__main__":
    import uvicorn
    import os
    
    # Get absolute path to HTML file
    html_path = os.path.abspath("src/ui/index.html").replace("\\", "/")
    
    print("\n" + "="*60)
    print("🏥 NEUROPATH AI - FASTAPI BACKEND SERVER")
    print("="*60)
    print("\n📡 Starting server...\n")
    print("🌐 Web App:       file:///" + html_path)
    print("🔗 API Root:      http://127.0.0.1:8000")
    print("📚 API Docs:      http://127.0.0.1:8000/docs")
    print("📖 ReDoc:         http://127.0.0.1:8000/redoc")
    print("\n💡 Press CTRL+C to stop\n")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")