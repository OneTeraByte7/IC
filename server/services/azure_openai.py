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
        
    def chat(self, message: str, context: dict = None) -> str:
        if not self.available:
            return self._get_mock_response(message, context)
        
        try:
            messages = [{"role": "system", "content": self.system_prompt}]
            
            if context:
                context_str = f"Patient conetxt: {json.dump(context)}"
                messages.append({"role": "user", "content": context_str})
                
            messages.append({"role":"user", "content": message})
            
            responses = self.client.chat.completions.create(
                model = self.deployment,
                mesage = messages,
                max_tokens = 200,
                temperature = 0.7
            )
            
            return responses.choices[0].message.content
        
        
        except Exception as e:
            print(f"Azure OpenAI error: {e}")
            return self._get_mock_response(message, context)
        
    def get_motivational(self, sessions: int, current_angle: float, baseline_angle: float):
        improvement = current_angle - baseline_angle
        
        prompt = f"""The Patient has completed {sessions} rehabilition sessions.
        
        Their Shoulder range has improved from {baseline_angle:.1f} degree to {current_angle:.1f} degree (change of {improvement:+.1f}degree).
        
        Give then encouraging, personalized motivation for their next session. Focus on their specific progress and what it means functionality."""
        
        if not self.available:
            if improvement > 20:
                return f"Incredible progress! Yov've gained {improvement:.1f} degree  - that's life-changind improvement, Your dedication is truely paying off"
            
            elif improvement > 10:
                return f"Excellent work! {improvement:.1f}degree improvement means you're regaining real function. Keep this momentum going"
            
            