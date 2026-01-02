"""
Azure OpenAI AI Physical Therapist Coach API
Provides personalized guidance and motivation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

# Uncomment when you have Azure OpenAI credentials
# from openai import AzureOpenAI

load_dotenv()

router = APIRouter(prefix="/api/ai-coach", tags=["AI Coach"])

# =====================
# REQUEST/RESPONSE MODELS
# =====================

class MotivationRequest(BaseModel):
    patient_id: str
    total_sessions: int
    current_streak: Optional[int] = 0

class ExerciseQuestion(BaseModel):
    question: str
    patient_context: Optional[str] = ""

class MilestoneRequest(BaseModel):
    milestone_type: str  # "reps", "angle", "streak", "sessions"
    value: int

class WeeklySummaryRequest(BaseModel):
    sessions_completed: int
    avg_angle: float
    improvement: float

# =====================
# AI COACH CLASS (Mock Mode for Demo)
# =====================

class AICoach:
    """AI Physical Therapist Coach - Works in mock mode without Azure keys"""
    
    def __init__(self):
        self.azure_key = os.getenv("AZURE_OPENAI_KEY")
        self.azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        
        # Check if Azure is configured
        self.azure_available = bool(self.azure_key and self.azure_endpoint)
        
        if self.azure_available:
            # Uncomment when you add Azure credentials
            # self.client = AzureOpenAI(
            #     api_key=self.azure_key,
            #     api_version="2024-02-01",
            #     azure_endpoint=self.azure_endpoint
            # )
            pass
        
        self.system_prompt = """You are an expert physical therapist specializing in stroke rehabilitation.
You provide clear, encouraging guidance on exercises, motivation, and recovery insights.
Keep responses concise (2-3 sentences), empathetic, and action-oriented."""
    
    def get_motivation(self, total_sessions: int, current_streak: int = 0) -> str:
        """Generate motivation message"""
        
        # Mock responses (replace with Azure OpenAI call when configured)
        if not self.azure_available:
            if total_sessions == 0:
                return "Welcome to NeuroPath AI! Every journey begins with a single step. Let's start building your recovery path today! 💪"
            elif total_sessions < 5:
                return f"Great progress! You've completed {total_sessions} sessions. Consistency is key - keep showing up and your body will respond!"
            elif total_sessions < 10:
                return f"Amazing dedication! {total_sessions} sessions completed. You're building a strong foundation for recovery. Each rep brings you closer to your goals!"
            elif current_streak >= 7:
                return f"Incredible! {current_streak} day streak! Your consistency is inspiring. This is exactly how lasting recovery happens!"
            else:
                return f"Outstanding work! {total_sessions} sessions completed. You're proving that dedication pays off. Keep pushing forward!"
        
        # Azure OpenAI call (uncomment when configured)
        # try:
        #     response = self.client.chat.completions.create(
        #         model="gpt-4",
        #         messages=[
        #             {"role": "system", "content": self.system_prompt},
        #             {"role": "user", "content": f"Patient has completed {total_sessions} sessions with {current_streak} day streak. Give encouragement."}
        #         ],
        #         max_tokens=100,
        #         temperature=0.7
        #     )
        #     return response.choices[0].message.content
        # except Exception as e:
        #     return "Keep up the great work! Every session counts!"
    
    def explain_exercise(self, exercise_name: str) -> str:
        """Explain exercise technique"""
        
        if not self.azure_available:
            explanations = {
                "shoulder_raise": "Stand tall with feet shoulder-width apart. Slowly raise your affected arm out to the side and up toward the ceiling, keeping your elbow straight. Hold for 2 seconds at the top, then lower slowly. Focus on controlled, smooth movements rather than speed.",
                "elbow_bend": "Sit or stand comfortably. Start with your arm at your side. Slowly bend your elbow, bringing your hand toward your shoulder. Hold briefly, then lower with control. Keep your upper arm still.",
                "arm_reach": "Sit in a chair. Reach forward with your affected arm toward an object at shoulder height. Extend fully, hold for 2 seconds, then return. Practice reaching in different directions."
            }
            return explanations.get(exercise_name.lower(), "Follow your physical therapist's instructions for this exercise. Focus on proper form and controlled movements.")
        
        # Azure OpenAI call here
        return "Exercise explanation would come from Azure OpenAI here"
    
    def celebrate_milestone(self, milestone_type: str, value: int) -> str:
        """Celebrate achievements"""
        
        if not self.azure_available:
            celebrations = {
                "reps": [
                    f"Fantastic! {value} reps completed! You're getting stronger with each session! 🎉",
                    f"Wow! {value} reps - that's impressive dedication! Keep this momentum going! 💪",
                    f"{value} reps done! Your hard work is paying off. You should be proud! ⭐"
                ],
                "angle": [
                    f"Amazing progress! {value}° range achieved - that's a huge milestone! 🎯",
                    f"Incredible! {value}° - you're regaining function beautifully! Keep going! 🌟",
                    f"Outstanding! {value}° is fantastic progress. Your dedication shows! 🏆"
                ],
                "streak": [
                    f"{value} days in a row! Your consistency is remarkable! This is how recovery happens! 🔥",
                    f"Incredible {value}-day streak! You're building an unstoppable habit! 💫",
                    f"{value} consecutive days! Your commitment is truly inspiring! 🌟"
                ],
                "sessions": [
                    f"Milestone reached: {value} sessions completed! You're making this happen! 🎊",
                    f"Session {value} done! Each one brings you closer to your goals! 🎯",
                    f"Amazing! {value} sessions - your journey is truly inspiring! 🏅"
                ]
            }
            
            import random
            messages = celebrations.get(milestone_type, [f"Great job! {value} is fantastic!"])
            return random.choice(messages)
        
        return "Celebration message from Azure OpenAI"
    
    def answer_question(self, question: str, context: str = "") -> str:
        """Answer patient questions"""
        
        if not self.azure_available:
            # Simple keyword-based responses
            question_lower = question.lower()
            
            if "how often" in question_lower or "frequency" in question_lower:
                return "For optimal recovery, aim for 3-4 sessions per week with rest days in between. Consistency matters more than intensity. Listen to your body and don't push through pain."
            
            elif "pain" in question_lower:
                return "Mild discomfort during stretching is normal, but sharp or increasing pain means stop immediately. Always work within your pain-free range and consult your doctor if pain persists."
            
            elif "improve" in question_lower or "better" in question_lower:
                return "Recovery takes time - most patients see noticeable improvements after 4-6 weeks of consistent practice. Track your progress with our charts to see how far you've come!"
            
            elif "rest" in question_lower:
                return "Rest is crucial for recovery! Take at least 1-2 rest days per week. If you feel unusually tired or sore, take an extra rest day. Recovery happens during rest, not just exercise."
            
            else:
                return "That's a great question! While I can provide general guidance, please consult your physical therapist or doctor for personalized advice about your specific recovery."
        
        return "Answer from Azure OpenAI"
    
    def generate_weekly_summary(self, sessions: int, avg_angle: float, improvement: float) -> str:
        """Generate weekly progress summary"""
        
        if not self.azure_available:
            summary = f"🎉 This week you completed {sessions} sessions"
            
            if sessions >= 3:
                summary += " - excellent consistency! "
            elif sessions >= 1:
                summary += " - good start! "
            else:
                summary += ". "
            
            if improvement > 10:
                summary += f"Your shoulder range improved by {improvement:.1f}° - that's outstanding progress! "
            elif improvement > 0:
                summary += f"You gained {improvement:.1f}° this week - steady progress! "
            
            summary += f"Your average range is now {avg_angle:.1f}°. "
            
            # Add tip
            tips = [
                "Next week: Try adding 2 more reps to each session.",
                "Focus on slow, controlled movements for better form.",
                "Remember to celebrate small wins along the way!",
                "Consistency is key - keep showing up!"
            ]
            import random
            summary += random.choice(tips)
            
            return summary
        
        return "Summary from Azure OpenAI"

# Global coach instance
coach = AICoach()

# =====================
# API ENDPOINTS
# =====================

@router.get("/status")
async def get_coach_status():
    """Check if Azure OpenAI is configured"""
    return {
        "azure_configured": coach.azure_available,
        "mode": "Azure OpenAI" if coach.azure_available else "Mock Mode (Demo)",
        "message": "Azure OpenAI ready" if coach.azure_available else "Running in demo mode. Add Azure credentials to .env for full AI features."
    }

@router.post("/motivation")
async def get_motivation(request: MotivationRequest):
    """Get personalized motivation message"""
    
    message = coach.get_motivation(request.total_sessions, request.current_streak)
    
    return {
        "patient_id": request.patient_id,
        "message": message,
        "type": "motivation"
    }

@router.get("/exercise-explanation/{exercise_name}")
async def explain_exercise(exercise_name: str):
    """Get exercise explanation"""
    
    explanation = coach.explain_exercise(exercise_name)
    
    return {
        "exercise": exercise_name,
        "explanation": explanation
    }

@router.post("/celebrate")
async def celebrate_milestone(request: MilestoneRequest):
    """Celebrate patient milestone"""
    
    message = coach.celebrate_milestone(request.milestone_type, request.value)
    
    return {
        "milestone": request.milestone_type,
        "value": request.value,
        "message": message
    }

@router.post("/ask")
async def ask_question(request: ExerciseQuestion):
    """Ask the AI coach a question"""
    
    answer = coach.answer_question(request.question, request.patient_context)
    
    return {
        "question": request.question,
        "answer": answer
    }

@router.post("/weekly-summary")
async def get_weekly_summary(request: WeeklySummaryRequest):
    """Generate weekly progress summary"""
    
    summary = coach.generate_weekly_summary(
        request.sessions_completed,
        request.avg_angle,
        request.improvement
    )
    
    return {
        "summary": summary,
        "sessions": request.sessions_completed,
        "avg_angle": request.avg_angle,
        "improvement": request.improvement
    }

# Demo endpoint to test all features
@router.get("/demo")
async def demo_all_features():
    """Demonstrate all AI coach features"""
    
    return {
        "motivation": coach.get_motivation(5, 3),
        "exercise_explanation": coach.explain_exercise("shoulder_raise"),
        "celebration": coach.celebrate_milestone("reps", 10),
        "question_answer": coach.answer_question("How often should I exercise?"),
        "weekly_summary": coach.generate_weekly_summary(3, 120, 12.5)
    }