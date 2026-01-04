"""
Azure Speech Services Integration
Text-to-Speech for exercise guidance and voice commands
"""

import os
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import base64

load_dotenv()

router = APIRouter(prefix="/api/speech", tags=["Azure Speech"])

class TextToSpeechRequest(BaseModel):
    text: str
    voice: Optional[str] = "en-US-JennyNeural"  # Friendly female voice
    rate: Optional[str] = "medium"  # slow, medium, fast

class VoiceCommandResponse(BaseModel):
    command: str
    confidence: float
    action: str

# =====================
# AZURE SPEECH SERVICE
# =====================

class AzureSpeechService:
    """Azure Speech Services for TTS and voice commands"""
    
    def __init__(self):
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.speech_region = os.getenv("AZURE_SPEECH_REGION")
        
        if not self.speech_key or not self.speech_region:
            print("⚠️  Azure Speech not configured. Running in mock mode.")
            self.available = False
        else:
            self.speech_config = speechsdk.SpeechConfig(
                subscription=self.speech_key,
                region=self.speech_region
            )
            self.available = True
    
    def text_to_speech(self, text: str, voice: str = "en-US-JennyNeural", rate: str = "medium") -> bytes:
        """Convert text to speech audio"""
        
        if not self.available:
            # Return mock response for demo
            return b"Mock audio data - Azure Speech not configured"
        
        try:
            # Configure voice
            self.speech_config.speech_synthesis_voice_name = voice
            
            # Rate adjustment
            rate_map = {
                "slow": "-20%",
                "medium": "+0%",
                "fast": "+20%"
            }
            rate_adjust = rate_map.get(rate, "+0%")
            
            # SSML for better control
            ssml = f"""
            <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
                <voice name='{voice}'>
                    <prosody rate='{rate_adjust}'>
                        {text}
                    </prosody>
                </voice>
            </speak>
            """
            
            # Synthesize to memory
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=self.speech_config,
                audio_config=None  # Output to memory
            )
            
            result = synthesizer.speak_ssml_async(ssml).get()
            
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                return result.audio_data
            else:
                raise Exception(f"Speech synthesis failed: {result.reason}")
                
        except Exception as e:
            print(f"Azure Speech error: {e}")
            return b"Error generating speech"
    
    def recognize_command(self, audio_data: bytes) -> dict:
        """Recognize voice command from audio"""
        
        if not self.available:
            return {
                "command": "start",
                "confidence": 0.95,
                "text": "Mock recognition - Azure Speech not configured"
            }
        
        try:
            # Configure recognizer
            audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
            recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )
            
            # Recognize speech
            result = recognizer.recognize_once()
            
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                text = result.text.lower()
                
                # Map to commands
                command_map = {
                    "start": ["start", "begin", "go", "let's start"],
                    "stop": ["stop", "pause", "halt", "wait"],
                    "next": ["next", "continue", "skip"],
                    "help": ["help", "assist", "support"]
                }
                
                recognized_command = "unknown"
                for cmd, keywords in command_map.items():
                    if any(keyword in text for keyword in keywords):
                        recognized_command = cmd
                        break
                
                return {
                    "command": recognized_command,
                    "confidence": 0.95,
                    "text": result.text
                }
            else:
                return {
                    "command": "unknown",
                    "confidence": 0.0,
                    "text": "Not recognized"
                }
                
        except Exception as e:
            print(f"Voice recognition error: {e}")
            return {
                "command": "error",
                "confidence": 0.0,
                "text": str(e)
            }

# Global instance
speech_service = AzureSpeechService()

# =====================
# PREDEFINED EXERCISE PHRASES
# =====================

EXERCISE_PHRASES = {
    "welcome": "Welcome to NeuroPath AI. I'm your virtual physical therapist, here to guide you through your rehabilitation exercises.",
    
    "shoulder_raise_intro": "Let's begin with shoulder raises. This exercise helps restore your shoulder range of motion and strength.",
    
    "shoulder_raise_instructions": "Stand tall with your feet shoulder-width apart. Slowly raise your affected arm out to the side and up toward the ceiling. Keep your elbow straight. Hold for two seconds at the top, then lower slowly.",
    
    "start_exercise": "Great! Let's start your exercise session. I'll count your repetitions and give you feedback in real-time.",
    
    "good_form": "Excellent form! Keep it up!",
    
    "lift_higher": "Good effort! Try to lift your arm about 10 degrees higher.",
    
    "perfect_rep": "Perfect! That's a full range repetition!",
    
    "halfway": "You're halfway there! Keep going strong!",
    
    "almost_done": "Almost done! Just a few more repetitions!",
    
    "session_complete": "Fantastic work! You've completed your exercise session. Your dedication to recovery is truly inspiring!",
    
    "rest_reminder": "Remember to take short breaks if you need them. Recovery happens when we rest, not just when we work.",
    
    "pain_check": "If you feel any sharp pain, stop immediately and rest. Mild discomfort is normal, but pain is not.",
    
    "motivation_1": "Every repetition brings you closer to independence. You're doing great!",
    
    "motivation_2": "Your progress today is building the foundation for tomorrow's success.",
    
    "motivation_3": "Recovery isn't about speed, it's about consistency. And you're showing up!",
    
    "celebration": "Congratulations! You've reached a new milestone in your recovery journey!"
}

# =====================
# API ENDPOINTS
# =====================

@router.get("/status")
async def get_speech_status():
    """Check Azure Speech service status"""
    return {
        "available": speech_service.available,
        "message": "Azure Speech ready" if speech_service.available else "Running in mock mode"
    }

@router.post("/speak")
async def text_to_speech(request: TextToSpeechRequest):
    """Convert text to speech"""
    
    try:
        audio_data = speech_service.text_to_speech(
            request.text,
            request.voice,
            request.rate
        )
        
        # Convert to base64 for JSON response
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return {
            "text": request.text,
            "audio_base64": audio_base64,
            "voice": request.voice,
            "format": "wav"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/speak/{phrase_key}")
async def speak_predefined_phrase(phrase_key: str):
    """Speak a predefined exercise phrase"""
    
    if phrase_key not in EXERCISE_PHRASES:
        raise HTTPException(status_code=404, detail="Phrase not found")
    
    text = EXERCISE_PHRASES[phrase_key]
    
    try:
        audio_data = speech_service.text_to_speech(text)
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return {
            "phrase_key": phrase_key,
            "text": text,
            "audio_base64": audio_base64
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/phrases")
async def list_phrases():
    """List all available predefined phrases"""
    return {
        "phrases": list(EXERCISE_PHRASES.keys()),
        "count": len(EXERCISE_PHRASES)
    }

@router.post("/recognize")
async def recognize_voice_command():
    """Recognize voice command from microphone"""
    
    try:
        result = speech_service.recognize_command(None)
        
        # Map command to action
        action_map = {
            "start": "start_exercise",
            "stop": "pause_exercise",
            "next": "next_exercise",
            "help": "show_help",
            "unknown": "no_action"
        }
        
        return VoiceCommandResponse(
            command=result["command"],
            confidence=result["confidence"],
            action=action_map.get(result["command"], "no_action")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/demo")
async def demo_speech():
    """Demo endpoint to test speech synthesis"""
    
    demo_text = "Hello! I'm your AI physical therapist from NeuroPath AI. Let's work together on your recovery!"
    
    try:
        audio_data = speech_service.text_to_speech(demo_text)
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return {
            "demo_text": demo_text,
            "audio_base64": audio_base64,
            "available": speech_service.available,
            "message": "Play the audio to test Azure Speech!" if speech_service.available else "Azure Speech not configured - this is mock data"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))