import os
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import cv2
import numpy as np
from typing import Optional
import base64

load_dotenv()

router = APIRouter(prefix = "/api/vision", tags = ["Azure Vision"])

class FormAnalysisResult(BaseModel):
    detected: bool
    confidence: float
    feedback: str
    posture_score: int
    recommedations: list
    
class AzureVisionService:
    def __init__(self):
        self.api_key = os.getenv("AZURE_VISION_KEY")
        self.endpoint = os.getenv("AZURE_VISION_ENDPOINT")
        
        if not self.api_key or not self.endpoint:
            print("Azure Vision not configured. Running in mock mode")
            self.available = False
            self.client = None
        else:
            try:
                self.client = ImageAnalysisClient(
                    endpoint = self.endpoint,
                    credential = AzureKeyCredential(self.api_key)
                )
                self.available = True
                print("Azure Computer Vision initialized successfully")
                
            except Exception as e:
                print("Azure Vision inotialization failed: {e}")
                self.available = False
                self.client = None
        
        def analyze_exercise_form(self, image_data: bytes) -> dict:
            if not self.available:
                return self._get_mock_analysis()
            
            try:
                result = self.client.analyze(
                    image_data = image_data,
                    visula_features = [
                        VisualFeatures.CAPTION,
                        VisualFeatures.PEOPLE,
                        VisualFeatures.OBJECTS
                        
                    ]
                )
                
                detected_person = False
                confidence = 0.0
                feedback = []
                posture_score = 0
                
                if result.people and len(result.people.list) > 0:
                    detected_person = True
                    person = result.people.list[0]
                    confidence = person.confidence
                    
                    
                    bbox = person.bounding_box
                    aspect_ratio = bbox.height / bbox.width if bbox.width > 0 else 0
                    
                    if 1.5 <= aspect_ratio <= 2.5:
                        posture_score = 85
                        feedback.append("Good upright posture detected")
                        
                    elif 1.0 <= aspect_ratio < 1.5:
                        posture_score = 70
                        feedback.append("Slight slouch detected - stand taller")
                        
                    else:
                        posture_score = 60
                        feedback.append("Posture needs adjustment")
                        
                
                recommendations = []
                if posture_score < 70:
                    recommendations.append("Focus on standing tall with shoulders back")
                    
                if posture_score >= 80:
                    recommendations.append("Excellent posture! Maintain this form")
                    
                return{
                    "detected": detected_person,
                    "confidence": confidence,
                    "feedback": "-".join(feedback) if feedback else "Position yourself clear in frame",
                    "posture_score": posture_score,
                    "recommendations": recommendations
                }
                
            except Exception as e:
                print(f"Azure Vision error: {e}")
                return self._get_mock_analysis()
            
        def verify_camera_setup(self, image_data: bytes) -> dict:
        
            if not self.available:
                return {
                    "setup_ok": True,
                    "message": "Camera setup looks good (mock mode)",
                    "issues": []
                }
            
            try:
                result = self.client.analyze(
                    image_data=image_data,
                    visual_features=[VisualFeatures.PEOPLE]
                )
                
                issues = []
                
                if not result.people or len(result.people.list) == 0:
                    issues.append("No person detected - position yourself in frame")
                elif len(result.people.list) > 1:
                    issues.append("Multiple people detected - ensure you're alone in frame")
                else:
                    person = result.people.list[0]
                    bbox = person.bounding_box
                    
                    center_x = (bbox.x + bbox.width / 2) / result.metadata.width
                    if center_x < 0.3 or center_x > 0.7:
                        issues.append("Position yourself in the center of the frame")
                    
                    if bbox.height / result.metadata.height < 0.6:
                        issues.append("Move back - we need to see your full body")
                    elif bbox.height / result.metadata.height > 0.95:
                        issues.append("Move back a bit - you're too close to camera")
                
                setup_ok = len(issues) == 0
                message = "Camera setup is perfect!" if setup_ok else "Please adjust camera positioning"
                
                return {
                    "setup_ok": setup_ok,
                    "message": message,
                    "issues": issues
                }
                
            except Exception as e:
                print(f"Azure Vision error: {e}")
                return {
                    "setup_ok": False,
                    "message": "Could not verify setup",
                    "issues": [str(e)]
                }
                
        def _get_mock_analysis(self) -> dict:
            return {
                "detected": True,
                "confidence": 0.92,
                "feedback": "Good form detected (mock mode - add Azure credentials for real analysis)",
                "posture_score": 85,
                "recommendations": [
                    "Maintain steady breathing",
                    "Keep movements slow and controlled"
                ]
            }
            
vision_service = AzureVisionService()
            
@router.get("/status")
async def get_vision_status():
    """Check Azure Vision service status"""
    return {
        "available": vision_service.available,
        "message": "Azure Computer Vision ready" if vision_service.available else "Running in mock mode"
    }

@router.post("/analyze-form")
async def analyze_form(file: UploadFile = File(...)):
    """Analyze exercise form from uploaded image"""
    
    try:
        # Read image data
        image_data = await file.read()
        
        # Analyze with Azure Vision
        result = vision_service.analyze_exercise_form(image_data)
        
        return FormAnalysisResult(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-camera")
async def verify_camera(file: UploadFile = File(...)):
    """Verify camera positioning"""
    
    try:
        image_data = await file.read()
        result = vision_service.verify_camera_setup(image_data)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-frame")
async def analyze_frame_base64(frame_base64: str):
    """Analyze form from base64 encoded frame"""
    
    try:
        # Decode base64
        image_data = base64.b64decode(frame_base64)
        
        # Analyze
        result = vision_service.analyze_exercise_form(image_data)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/demo")
async def demo_vision():
    """Demo Azure Vision features"""
    
    return {
        "service": "Azure Computer Vision",
        "available": vision_service.available,
        "features": [
            "Exercise form analysis",
            "Posture scoring",
            "Camera positioning verification",
            "Person detection",
            "Real-time feedback"
        ],
        "message": "Upload an image to /analyze-form endpoint to test" if vision_service.available else "Running in mock mode - add Azure credentials for real analysis"
    }