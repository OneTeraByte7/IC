"""
Patient Management Router
Handles CRUD operations for patients
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import date, datetime
from pathlib import Path

router = APIRouter(prefix="/patients", tags=["Patients"])

# Data directory
DATA_DIR = Path("data/patients")
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Pydantic Models
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

# Utility Functions
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

# API Endpoints
@router.post("", response_model=PatientResponse)
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

@router.get("", response_model=List[PatientResponse])
async def list_patients():
    """List all patients"""
    
    patients = []
    for filepath in DATA_DIR.glob("*.json"):
        with open(filepath, 'r') as f:
            data = json.load(f)
            patients.append(PatientResponse(
                patient_id=data["patient_id"],
                name=data["name"],
                created_date=data["created_date"],
                total_sessions=len(data["sessions"]),
                baseline=data.get("baseline")
            ))
    
    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
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

@router.delete("/{patient_id}")
async def delete_patient(patient_id: str):
    """Delete patient account"""
    
    filepath = DATA_DIR / f"{patient_id}.json"
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Patient not found")
    
    filepath.unlink()
    return {"message": f"Patient {patient_id} deleted successfully"}

@router.post("/{patient_id}/baseline")
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

@router.get("/{patient_id}/baseline")
async def get_baseline(patient_id: str):
    """Get patient baseline measurements"""
    
    data = load_patient_data(patient_id)
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if not data.get("baseline"):
        raise HTTPException(status_code=404, detail="Baseline not set")
    
    return data["baseline"]

@router.post("/{patient_id}/sessions")
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
    
    data["sessions"].append(session_record)
    save_patient_data(patient_id, data)
    
    return {
        "message": "Session logged successfully",
        "session": session_record
    }

@router.get("/{patient_id}/sessions")
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

@router.get("/{patient_id}/progress")
async def get_patient_progress(patient_id: str):
    """Get patient progress data"""
    
    data = load_patient_data(patient_id)
    if not data:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    sessions = data.get("sessions", [])
    
    # Calculate progress metrics
    total_reps = sum(s.get("reps", 0) for s in sessions)
    avg_angle = sum(s.get("max_angle", 0) for s in sessions) / len(sessions) if sessions else 0
    
    return {
        "patient_id": patient_id,
        "total_sessions": len(sessions),
        "total_reps": total_reps,
        "avg_max_angle": round(avg_angle, 1),
        "progress_percentage": min(100, len(sessions) * 10),
        "last_session_date": sessions[-1]["date"] if sessions else None,
        "next_goal": "Complete 10 sessions"
    }
