import cv2
import mediapipe as mp
import numpy as np
import math

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

def calculate_angle(a,b,c):
    #Calculating angles between three points
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180/np.pi)
    
    if angle > 180.0:
        angle = 360-angle
    return angle

def get_feedback(angle, excercise_type="shoulder_raise"):
    if excercise_type == "shoulder_raise":
        if angle > 160:
            return "Perfect! Full range achieved!", (0, 255, 0)
        
        elif angle > 120:
            return "Good! Lift 10 degree higher", (0, 255, 255)
        
        elif angle > 90:
            return "Keep going! Lift arm higher", (0, 165, 255)
        
        else:
            return "Start position", (255, 255, 255)
        
    return "", (255, 255, 255)

cap = cv2.VideoCapture(0)

