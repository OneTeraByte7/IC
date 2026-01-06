import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
import json
import asyncio
from datetime import datetime
import base64
import os
from pathlib import Path

router = APIRouter(prefix="/api/exercise",tags = ['Exercise Session'])

# Get the correct path to the model file
PROJECT_ROOT = Path(__file__).parent.parent.parent
MODEL_PATH = PROJECT_ROOT / 'pose_landmarker_lite.task'

# Fallback to server/assets if root path doesn't exist
if not MODEL_PATH.exists():
    MODEL_PATH = Path(__file__).parent.parent / "assets" / "pose_landmarker_lite.task"

base_options = python.BaseOptions(model_asset_path=str(MODEL_PATH))
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.VIDEO,
    min_pose_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

pose_landmarker = vision.PoseLandmarker.create_from_options(options)

class ExerciseTracker:
    def __init__(self):
        self.rep_count = 0
        self.stage = None
        self.max_angle = 0
        self.session_start = None
        self.angle_history = []
        
    def reset(self):
        self.rep_count = 0
        self.stage = None
        self.max_angle = 0
        self.session_start = datetime.now()
        self.angle_history = []
        
    def claculate_angle(self, a, b, c):
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0/np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
        return angle
    
    def get_feedback(self, angle):
        if angle > 160:
            return "Perfect! Full range", (0, 155, 0)
        elif angle > 120:
            return "Good! Lift 10 degree higher", (0, 255, 255)

        elif angle > 90:
            return "Keep going", (0, 165, 255)
        
        else:
            return "Start position", (255, 255, 255)
        
    def process_frame(self, frame, frame_timestamp_ms):
        frame = cv2.flip(frame, 1)
        
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        mp_image = mp.Image(image_format = mp.ImageFormat.SRGB, data=image)
        
        results = pose_landmarker.detect_for_video(mp_image, frame_timestamp_ms)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        metrics = {
            "angle": 0,
            "reps": self.rep_count,
            "max_angle": self.max_angle,
            "feedback": "Position yourself in frame",
            "pose_detected": False,
        }
        
        try:
            if results.pose_landmarks:
                landmarks = results.pose_landmarks[0]
                metrics["pose_detected"] = True
                shoulder = [landmarks[12].x, landmarks[12].y]
                elbow = [landmarks[14].x, landmarks[14].y]
                
                angle = self.claculate_angle(elbow, shoulder, [shoulder[0], shoulder[1] - 0.1])
                metrics["angle"] = round(angle, 1)
                
                if angle > self.max_angle:
                    self.max_angle = angle
                
                if angle < 30:
                    self.stage = "down"
                if angle > 140 and self.stage == "down":
                    self.stage = "up"
                    self.rep_count += 1
                    metrics["reps"] = self.rep_count
                    
                feedback_text, color = self.get_feedback(angle)
                metrics["feedback"] = feedback_text
                
                self.angle_history.append(angle)
                self.draw_landmarks(image, landmarks)
                
                shoulder_px = tuple(np.multiply(shoulder, [image.shape[1], image.shape[0]]).astype(int))
                cv2.putText(image, f"{int(angle)}degree", shoulder_px,
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                
                
                cv2.rectangle(image, (0, 0), (400, 150), (0,0,0), -1)
                cv2.putText(image, 'NEUROPATH AI', (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 155, 255), 2)
                
                cv2.putText(image, f'Reps: {self.rep_count}', (10, 65),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                
                cv2.putText(image, f'Current: {int(angle)}degree', (10, 95),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
                
                cv2.putText(image, f'Best: {int(self.max_angle)}degree', (10, 125),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                
                
                
                cv2.putText(image, feedback_text, (10, image.shape[0]-20),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
                
                
        except Exception as e:
            cv2.putText(image, 'Position yourself in frame', (50, 240),
                         cv2.FONT_HERSHEY_COMPLEX, 1, (0, 0, 255), 2)
            
        return image, metrics
    
    def draw_landmarks(self, image, landmarks):
        """Draw pose landmarks on image"""
        height, width = image.shape[:2]
        
        # Define connections
        connections = [
            (11, 12), (12, 14), (14, 16), (11, 13), (13, 15),
            (12, 24), (11, 23), (23, 24),
            (24, 26), (26, 28), (23, 25), (25, 27)
        ]
        
        # Draw connections
        for connection in connections:
            start_idx, end_idx = connection
            if start_idx < len(landmarks) and end_idx < len(landmarks):
                start = landmarks[start_idx]
                end = landmarks[end_idx]
                start_point = (int(start.x * width), int(start.y * height))
                end_point = (int(end.x * width), int(end.y * height))
                cv2.line(image, start_point, end_point, (245, 66, 230), 2)
        
        # Draw landmarks
        for landmark in landmarks:
            x = int(landmark.x * width)
            y = int(landmark.y * height)
            cv2.circle(image, (x, y), 3, (245, 117, 66), -1)
    
    def get_session_summary(self):
        """Get session summary statistics"""
        duration_secs = (datetime.now() - self.session_start).total_seconds() if self.session_start else 0
        
        return {
            "reps": self.rep_count,
            "max_angle": round(self.max_angle, 1),
            "duration_mins": round(duration_secs / 60, 1),
            "avg_angle": round(np.mean(self.angle_history), 1) if self.angle_history else 0,
            "total_frames": len(self.angle_history)
        }

# Global tracker instance
tracker = ExerciseTracker()

@router.get("/start-session")
async def start_session():
    """Start new exercise session"""
    tracker.reset()
    return {
        "message": "Session started",
        "timestamp": tracker.session_start.isoformat()
    }

@router.get("/session-status")
async def get_session_status():
    """Get current session status"""
    return {
        "reps": tracker.rep_count,
        "max_angle": tracker.max_angle,
        "session_active": tracker.session_start is not None
    }

@router.get("/end-session")
async def end_session():
    """End session and get summary"""
    summary = tracker.get_session_summary()
    tracker.reset()
    return {
        "message": "Session ended",
        "summary": summary
    }

@router.websocket("/ws/exercise")
async def websocket_exercise_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time exercise tracking"""
    await websocket.accept()
    
    # Start session
    tracker.reset()
    
    cap = cv2.VideoCapture(0)
    frame_count = 0
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            frame_timestamp_ms = int(cap.get(cv2.CAP_PROP_POS_MSEC))
            
            # Process frame
            annotated_frame, metrics = tracker.process_frame(frame, frame_timestamp_ms)
            
            # Encode frame to base64
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Send data to client
            await websocket.send_json({
                "frame": frame_base64,
                "metrics": metrics
            })
            
            # Small delay to prevent overwhelming the client
            await asyncio.sleep(0.033)  # ~30 FPS
            
    except WebSocketDisconnect:
        print("Client disconnected")
    finally:
        cap.release()
        summary = tracker.get_session_summary()
        print(f"Session summary: {summary}")

@router.get("/video-feed")
async def video_feed():
    """HTTP endpoint for video streaming (alternative to WebSocket)"""
    
    def generate_frames():
        cap = cv2.VideoCapture(0)
        frame_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            frame_timestamp_ms = int(cap.get(cv2.CAP_PROP_POS_MSEC))
            
            # Process frame
            annotated_frame, _ = tracker.process_frame(frame, frame_timestamp_ms)
            
            # Encode frame
            ret, buffer = cv2.imencode('.jpg', annotated_frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        cap.release()
    
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

# Simple test endpoint
@router.get("/test-camera")
async def test_camera():
    """Test if camera is accessible"""
    cap = cv2.VideoCapture(0)
    if cap.isOpened():
        cap.release()
        return {"camera_available": True, "message": "Camera is working"}
    else:
        return {"camera_available": False, "message": "Camera not accessible"}