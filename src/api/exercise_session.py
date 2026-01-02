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

