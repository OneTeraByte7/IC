import cv2
import mediapipe as mp
import numpy as np
import math

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

def calculate_angle(a, b, c):
    """Calculate angle between three points (for joint angles)"""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    
    if angle > 180.0:
        angle = 360-angle
    return angle

def get_feedback(angle, exercise_type="shoulder_raise"):
    """Provide real-time feedback based on angle"""
    if exercise_type == "shoulder_raise":
        if angle > 160:
            return "Perfect! Full range achieved!", (0, 255, 0)
        elif angle > 120:
            return "Good! Lift 10° higher", (0, 255, 255)
        elif angle > 90:
            return "Keep going! Lift arm higher", (0, 165, 255)
        else:
            return "Start position", (255, 255, 255)
    return "", (255, 255, 255)

# Open webcam
cap = cv2.VideoCapture(0)

# Exercise tracking variables
rep_count = 0
stage = None
max_angle_achieved = 0

print("Starting Stroke Rehabilitation Exercise Tracker")
print("Exercise: Shoulder Raise (Right Arm)")
print("Press 'q' to quit, 'r' to reset counter\n")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    
    # Flip frame for mirror view
    frame = cv2.flip(frame, 1)
    
    # Convert to RGB for MediaPipe
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    
    # Process pose detection
    results = pose.process(image)
    
    # Convert back to BGR for OpenCV
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    try:
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            # Get coordinates for right arm (shoulder, elbow, wrist)
            shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                       landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
            elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
            wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                    landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
            
            # Calculate shoulder angle
            angle = calculate_angle(elbow, shoulder, [shoulder[0], shoulder[1]-0.1])
            
            # Track max angle for this session
            if angle > max_angle_achieved:
                max_angle_achieved = angle
            
            # Count reps (down -> up motion)
            if angle < 30:
                stage = "down"
            if angle > 140 and stage == "down":
                stage = "up"
                rep_count += 1
            
            # Get AI feedback
            feedback, color = get_feedback(angle)
            
            # Visualize angle at shoulder
            cv2.putText(image, str(int(angle)) + "°", 
                       tuple(np.multiply(shoulder, [640, 480]).astype(int)),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
            
            # Draw skeleton
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                     mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2),
                                     mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2))
            
            # Display stats box
            cv2.rectangle(image, (0, 0), (400, 150), (0, 0, 0), -1)
            cv2.putText(image, 'NEUROPATH AI - Shoulder Raise', (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(image, f'Reps: {rep_count}', (10, 65),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            cv2.putText(image, f'Current: {int(angle)}°', (10, 95),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
            cv2.putText(image, f'Best: {int(max_angle_achieved)}°', (10, 125),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            
            # Display feedback
            cv2.putText(image, feedback, (10, 450),
                       cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2, cv2.LINE_AA)
    
    except Exception as e:
        cv2.putText(image, 'Position yourself in frame', (50, 240),
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    
    # Show frame
    cv2.imshow('NeuroPath AI - Stroke Rehab Tracker', image)
    
    # Controls
    key = cv2.waitKey(10) & 0xFF
    if key == ord('q'):
        break
    elif key == ord('r'):
        rep_count = 0
        max_angle_achieved = 0
        print("Counter reset!")

cap.release()
cv2.destroyAllWindows()
print(f"\nSession Complete!")
print(f"Total Reps: {rep_count}")
print(f"Best Angle Achieved: {int(max_angle_achieved)}°")