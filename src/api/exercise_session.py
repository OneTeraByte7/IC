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
        
