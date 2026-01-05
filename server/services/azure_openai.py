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
        
    def get_motivation(self, sessions: int, current_angle: float, baseline_angle: float):
        improvement = current_angle - baseline_angle
        
        prompt = f"""The Patient has completed {sessions} rehabilition sessions.
        
        Their Shoulder range has improved from {baseline_angle:.1f} degree to {current_angle:.1f} degree (change of {improvement:+.1f}degree).
        
        Give then encouraging, personalized motivation for their next session. Focus on their specific progress and what it means functionality."""
        
        if not self.available:
            if improvement > 20:
                return f"Incredible progress! Yov've gained {improvement:.1f} degree  - that's life-changind improvement, Your dedication is truely paying off"
            
            elif improvement > 10:
                return f"Excellent work! {improvement:.1f}degree improvement means you're regaining real function. Keep this momentum going"
            
            elif improvement > 0:
                return f"Steady progress! Every degree matters. You've improved {improvement:.1f} degree and you're building a strong foundation"
            
            else:
                 return f"You've completed {sessions} sessions -  that consistency alone is victory! Progress takes time, and you're showing up. Keep Going"
             
        return self.chat(prompt)
    
    def get_exercise_feedback(self, reps: int, max_angle: float, target_angle: float = 160) -> str:
        
        prompt = f"""The patient just completed {reps} shoulder raise repetitions with a maximum angle of {max_angle:.1f} degree.
        Target range is {target_angle} degree.
        
        Give brief, encouraging feedback on their performance nad one specific tip for improvement."""
        
        if not self.available:
            if max_angle >= target_angle:
                return f"Outstanding! You achieved {max_angle:.1f} degree - that's full range! Yor'r form is Excellent"
            
            elif max_angle >= 140:
                return f"Great work ! You reached {max_angle:.1f}degree. Try to push for those last {target_angle - max_angle:.0f} degree slowly"
            
            elif max_angle >= 120:
                return f"Good effort! {max_angle:.1f} degree is solid progress. Focus on slow, controled movement to gain those extreme degrees"
            
            else:
                return f"Nice consistency with {reps} reps! Work on gradually increasing your range. Even 5 degree morenext time is progress !"
            
        return self.chat(prompt)
    
    def generate_weekly_summary(self, weekly_data: dict) -> str:
        prompt = f"""Generate a weekly progress summary for this patient:
    Sessions completed: {weekly_data.get('sessions', 0)}
    Average shoulder range: {weekly_data.get('avg_angle', 0):.1f} degree
    Improvement this week: {weekly_data.get('improvement', 0):+.1f} degree
    Total reps: {weekly_data.get('total_reps', 0)}
    
    Include:
    1. Celebration of ehat they accomplished
    2. Functional meaning of theri progress (what can they do now?)
    3. One specific tip for the next week
    4. Encouragement to maintain consistency"""
    
        if not self.available:
            sessions = weekly_data.get("sessions", 0)
            improvement = weekly_data.get('improvement', 0)
            
            summary = f"This week: {sessions} sesssions completed"
            
            if improvement > 10:
                summary += f" with {improvement:.1f} degree improvement - exeptional"
                
            elif improvement > 5:
                summary += f" with {improvement:.1f} degree gain -  excellent work !"
                
            elif improvement > 0:
                summary += f"with {improvement:.1f} degree progress - steady advancement"
                
            summary += "Your consistency is they key to lasting recovery. Next week, try adding 2-4 more reps per session. You're on the right path"
            
            return summary
        
        return self.chat(prompt)