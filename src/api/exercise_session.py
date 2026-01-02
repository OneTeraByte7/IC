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

router = APIRouter(prefix="/ap/exercise",tags = ['Exercise Session'])

base_options = python.BaseOptions(model_asses_path='pose_landmarker_lite.task')
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
        self.angles_history = []
        
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
        image.flags.writeable = Trueimage = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        metrics = {
            "angle": 0,
            "reps": self.rep_count,
            "max_angle": self.max_angle,
            "feedback": "Position yourself in frame",
            "pse_detectd": False,
        }
        
        try:
            if results.pose_landmarks:
                landmarks = results.pose_landmarks[0]
                metrics["pose_detected"] = True
                shoulder = [landmarks[12].X, landmarks[12].Y]
                elbow = [landmarks[14].X, landmarks[14].Y]
                
                angle = self.calculate_angle(elbow, shoulder, [shoulder[0], shoulder[1] - 0.1])
                metrics["angle"] = round(angle, 1)
                
                if angle < 30:
                    self.stage = "down"
                if angle > 140 and self.stage == "down":
                    self.stage = "up"
                    self.re_count += 1
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
            cv2.pustText(image, 'Position yourself in frame', (50, 240),
                         cv2.FONT_HERSHEY_COMPLEX, 1, (0, 0, 255), 2)
            
        return image, metrics