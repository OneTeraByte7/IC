import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.progress_tracker import StrokeRecoveryTracker

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

def run_complte_demo():
    print("\n" + "=" * 70)
    print("NERUPATH AI REHAB SYSTEM")
    print("=" * 70)
    
    patient_name = input("\n Enter patient name or ID:").strip()
    
    if not patinet_name:
        patinet_name = "demo_patient"
        
    tracker = StrokeRecoveryTracker(patient_name)
    is_new_patient = len(tracker.data["sessions"]) == 0
    
    if is_new_patient:
        print("\n Welcome! This is your first  session")
        print("\n We'll establisg your baseline and start tracking your progress. \n")
        
    else:
        print(f"\n Welcome back! You've completed {len(tracker.data['session'])} sessions")
        improvement = tracker.calculate_improvement()
        print(f"Current improvement: { improvement['shoulder']: + 1f}degree shulder range\n")
        
        
    input("Press ENTER to start your exercise session..")
    
    
    
    print("\n" + "=" * 70)
    print("Starting Exercise Session")
    print("Exercise: Shoulder Raise (Right Arm)")
    print("Goal: Complete 10 Repetitions")
    print("\n Instructions:")
    print("1. Stand Facing the Camera")
    print("2. Raise your Right Arm Stright Up")
    print("3. Lower it back down")
    print("4. The System will count your reps adng give feedback")
    print("\n Press 'q' to finish session , 'r' to reset counter")
    print("="*70 + "\n")
    
    input("Ready ? Press ENTER to BEGIN")
    
    base_options = python.BaseOption(mode_assest_path = 'pose_landmarker_lite.task')
    options = vision.PoseLandmarkerOptions(
        base_options = base_options,
        running_mode = vision.RunningMode.VIDEO,
        min_pose_detection_confidence = 0.5,
        min_tracking_confidence = 0.5)
    
    pose_landmarker = vision.PoseLandMarker.create_from_options(options)
    
    
    def c
    