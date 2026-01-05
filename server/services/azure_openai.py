import os
from openai import AzureOpenAI
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import json

load_dotenv()

router = APIRouter(prefix = "/api/openai", tag = ['Azure OpenAI'])

class CharRequest(BaseModel):
    patient_id: str
    message: str
    context: Optional[dict] = None

class CoachRequest(BaseModel):
    patient_id: str
    total_sessions: int   
    current_angle: float
    baseline_angle: float
    request_type: str
    
    
class AzureOpenAIService:
     #Azure OpenAI GPT-4 for AI Physical Therapist
     
     def __init__(self):
        self.api_key = os.getenv("AZURE_OPEAI_KEY")
        self.endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.deployment = os.getenv("AZURE_OPENAI_DEPLOYMWNT", "gpt-4")
        self.api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
                                     
        if not self.api_key or not self.endpoint:
            print("Azure OpenAI not configured, Running in mock mode")
            self.available = False
            self.client = None
        else:
            try:
                self.client = AzureOpenAI(
                    api_key = self.api_key,
                    api_version = self.api_version,
                    azure_endpoint = self.endpoint
                )
                self.available = True
                
                print("Azure OpenAI initiated successfully")
                
            except Exception as e:
                print(f" Azure OpenAI initialization failed: {e}")
                self.available = False
                self.client = None
                
                
        self.system_prompt = """You are an expert physical therapist specializing in stroke rehabilitation.
        
        Your Role:
        - Provide clear, encouraging guidance on experience
        - Explain why exercise matter for recovery in simple terms
        - Offer motivation and celebrate progress
        - Give safety adive and recognize when patient should rest
        - Answer questions about stroke recovery with empathy
        
        Your Style:
        - Keep responses concise (2-4 sentences unless asked for detail)
        - Be warm, empathetic, and encouraging
        - Focus on small wins, avoid medical jargon
        - Always end on positive, actionable note
        
        Importnat:
        - Never diagnose medical conditions
        - Always recommed consulting healthcare providers fro concers
        - Acknowledge pain serioulsy and advise stopping if severe
        - Emphasize that recovery is a marathon, not sprint"""