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