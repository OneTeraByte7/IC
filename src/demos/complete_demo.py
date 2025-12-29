import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.progress_tracker import StrokeRecoveryTracker

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

def run_complete_demo():
    print("\n" + "=" * 70)
    print("NERUPATH AI REHAB SYSTEM")
    print("=" * 70)
    
    patient_name = input("\n Enter patient name or ID:").strip()
    
    if not patient_name:
        patient_name = "demo_patient"
        
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
    
    base_options = python.BaseOptions(model_asset_path = 'pose_landmarker_lite.task')
    options = vision.PoseLandmarkerOptions(
        base_options = base_options,
        running_mode = vision.RunningMode.VIDEO,
        min_pose_detection_confidence = 0.5,
        min_tracking_confidence = 0.5)
    
    pose_landmarker = vision.PoseLandmarker.create_from_options(options)
    
    
    def calculate_angle(a, b, c):
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        if angle > 180.0:
            angle = 360-angle
        return angle
    
    def get_feedback(angle):
        if angle > 160:
            return "Perfect Full range!", (0, 255, 0)
        elif angle > 120:
            return "Good! Lift 10° higher", (0, 255, 255)
        elif angle > 90:
            return "Keep going!", (0, 165, 255)
        else:
            return "Start position", (255, 255, 255)
    
    def draw_landmarks(image, landmarks):
        height, width = image.shape[:2]
        connections = [
            (11, 12), (12, 14), (14, 16), (11, 13), (13, 15),
            (12, 24), (11, 23), (23, 24),
            (24, 26), (26, 28), (23, 25), (25, 27)
        ]
        for connection in connections:
            start_idx, end_idx = connection
            if start_idx < len(landmarks) and end_idx < len(landmarks):
                start = landmarks[start_idx]
                end = landmarks[end_idx]
                start_point = (int(start.x * width), int(start.y * height))
                end_point = (int(end.x * width), int(end.y * height))
                cv2.line(image, start_point, end_point, (245, 66, 230), 2)
        for landmark in landmarks:
            x = int(landmark.x * width)
            y = int(landmark.y * height)
            cv2.circle(image, (x, y), 3, (245, 117, 66), -1)
    
    # Open webcam
    cap = cv2.VideoCapture(0)
    rep_count = 0
    stage = None
    max_angle = 0
    frame_timestamp_ms = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame = cv2.flip(frame, 1)
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image)
        frame_timestamp_ms += 33  # Assuming ~30 FPS, increment by 33ms
        results = pose_landmarker.detect_for_video(mp_image, frame_timestamp_ms)
        
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        try:
            if results.pose_landmarks:
                landmarks = results.pose_landmarks[0]
                
                shoulder = [landmarks[12].x, landmarks[12].y]
                elbow = [landmarks[14].x, landmarks[14].y]
                
                angle = calculate_angle(elbow, shoulder, [shoulder[0], shoulder[1]-0.1])
                
                if angle > max_angle:
                    max_angle = angle
                
                if angle < 30:
                    stage = "down"
                if angle > 140 and stage == "down":
                    stage = "up"
                    rep_count += 1
                    print(f"✅ Rep {rep_count} completed!")
                
                feedback, color = get_feedback(angle)
                
                cv2.putText(image, str(int(angle)) + "°", 
                           tuple(np.multiply(shoulder, [640, 480]).astype(int)),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                
                draw_landmarks(image, results.pose_landmarks[0])
                
                cv2.rectangle(image, (0, 0), (400, 150), (0, 0, 0), -1)
                cv2.putText(image, 'NEUROPATH AI', (10, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                cv2.putText(image, f'Reps: {rep_count}/10', (10, 65),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                cv2.putText(image, f'Current: {int(angle)}°', (10, 95),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
                cv2.putText(image, f'Best: {int(max_angle)}°', (10, 125),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                
                cv2.putText(image, feedback, (10, 450),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
        
        except Exception as e:
            cv2.putText(image, 'Position yourself in frame', (50, 240),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        cv2.imshow('NeuroPath AI Exercise Session', image)
        
        key = cv2.waitKey(10) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            rep_count = 0
            max_angle = 0
    
    cap.release()
    cv2.destroyAllWindows()
    
    # =======================
    # SAVE PROGRESS
    # =======================
    
    print("\n" + "="*70)
    print("SESSION COMPLETE!")
    print("="*70)
    print(f"✅ Reps completed: {rep_count}")
    print(f"✅ Best angle: {int(max_angle)}°")
    print("="*70 + "\n")
    
    # Set baseline or log session
    if is_new_patient:
        print("Setting your baseline measurements...")
        tracker.set_baseline(
            shoulder_angle=max_angle,
            elbow_angle=90,  # Default
            wrist_strength=5  # Default
        )
    
    # Log this session
    tracker.log_session(
        shoulder_angle=max_angle,
        elbow_angle=90,
        wrist_strength=5,
        reps_completed=rep_count,
        exercise_duration_mins=5,
        pain_level=0
    )
    
    # =======================
    # SHOW PROGRESS & PREDICTIONS
    # =======================
    
    print("\n" + "="*70)
    print("YOUR PROGRESS")
    print("="*70)
    
    if len(tracker.data["sessions"]) >= 3:
        # Show predictions
        tracker.predict_recovery(weeks_ahead=12)
    else:
        print(f"\nYou've completed {len(tracker.data['sessions'])} session(s).")
        print(f"After 3 sessions, we'll show you recovery predictions! 🎯")
    
    # Generate report
    tracker.generate_report()
    
    # Visualize progress
    if len(tracker.data["sessions"]) >= 2:
        print("\n📊 Generating progress chart...")
        tracker.visualize_progress()
    
    print("\n" + "="*70)
    print("NEXT STEPS")
    print("="*70)
    print("✅ Continue exercising 3x per week")
    print("✅ Your data is saved and will carry over to next session")
    print("✅ Share your progress with family or healthcare provider")
    print("\n💡 TIP: Consistency is key! Regular exercise leads to better recovery.")
    print("="*70 + "\n")

if __name__ == "__main__":
    run_complete_demo()
            
    