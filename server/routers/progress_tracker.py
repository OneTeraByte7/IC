import json
import datetime
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
from sklearn.linear_model import LinearRegression

class StrokeRecoveryTracker:
    """Track patient progress and predict recovery trajectory"""
    
    def __init__(self, patient_id="patient_001"):
        self.patient_id = patient_id
        self.data_file = f"{patient_id}_progress.json"
        self.load_data()
    
    def load_data(self):
        """Load existing patient data or create new"""
        if Path(self.data_file).exists():
            with open(self.data_file, 'r') as f:
                self.data = json.load(f)
        else:
            self.data = {
                "patient_id": self.patient_id,
                "start_date": str(datetime.date.today()),
                "baseline": {},
                "sessions": []
            }
    
    def save_data(self):
        """Save patient data"""
        with open(self.data_file, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def set_baseline(self, shoulder_angle, elbow_angle, wrist_strength):
        """Set initial baseline measurements"""
        self.data["baseline"] = {
            "date": str(datetime.date.today()),
            "shoulder_range": shoulder_angle,
            "elbow_range": elbow_angle,
            "wrist_strength": wrist_strength
        }
        self.save_data()
        print(f"✅ Baseline set for {self.patient_id}")
        print(f"   Shoulder: {shoulder_angle}°")
        print(f"   Elbow: {elbow_angle}°")
        print(f"   Wrist: {wrist_strength}/10")
    
    def log_session(self, shoulder_angle, elbow_angle, wrist_strength, 
                   reps_completed, exercise_duration_mins, pain_level=0):
        """Log a rehabilitation session"""
        session = {
            "date": str(datetime.date.today()),
            "session_number": len(self.data["sessions"]) + 1,
            "measurements": {
                "shoulder_range": shoulder_angle,
                "elbow_range": elbow_angle,
                "wrist_strength": wrist_strength
            },
            "performance": {
                "reps": reps_completed,
                "duration_mins": exercise_duration_mins,
                "pain_level": pain_level
            }
        }
        self.data["sessions"].append(session)
        self.save_data()
        
        # Calculate improvement
        improvement = self.calculate_improvement()
        print(f"\n📊 Session {session['session_number']} Logged!")
        print(f"   Shoulder: {shoulder_angle}° (Δ{improvement['shoulder']:+.1f}°)")
        print(f"   Elbow: {elbow_angle}° (Δ{improvement['elbow']:+.1f}°)")
        print(f"   Wrist: {wrist_strength}/10 (Δ{improvement['wrist']:+.1f})")
    
    def calculate_improvement(self):
        """Calculate improvement from baseline"""
        if not self.data["sessions"]:
            return {"shoulder": 0, "elbow": 0, "wrist": 0}
        
        latest = self.data["sessions"][-1]["measurements"]
        baseline = self.data["baseline"]
        
        return {
            "shoulder": latest["shoulder_range"] - baseline["shoulder_range"],
            "elbow": latest["elbow_range"] - baseline["elbow_range"],
            "wrist": latest["wrist_strength"] - baseline["wrist_strength"]
        }
    
    def predict_recovery(self, weeks_ahead=12):
        """Predict recovery trajectory using linear regression"""
        if len(self.data["sessions"]) < 3:
            print("⚠️  Need at least 3 sessions for prediction")
            return None
        
        sessions = self.data["sessions"]
        
        # Extract shoulder range data
        X = np.array([[i+1] for i in range(len(sessions))])
        y_shoulder = np.array([s["measurements"]["shoulder_range"] for s in sessions])
        
        # Train model
        model = LinearRegression()
        model.fit(X, y_shoulder)
        
        # Predict future
        future_sessions = np.array([[i] for i in range(1, len(sessions) + weeks_ahead*3 + 1)])
        predictions = model.predict(future_sessions)
        
        # Calculate recovery percentage (assuming 180° is full range)
        current_recovery = (y_shoulder[-1] / 180) * 100
        predicted_recovery = (predictions[-1] / 180) * 100
        predicted_recovery = min(predicted_recovery, 100)  # Cap at 100%
        
        print(f"\n🔮 RECOVERY PREDICTION (Next {weeks_ahead} weeks)")
        print(f"   Current Recovery: {current_recovery:.1f}%")
        print(f"   Predicted Recovery: {predicted_recovery:.1f}%")
        print(f"   Expected Improvement: {predicted_recovery - current_recovery:+.1f}%")
        
        if predicted_recovery >= 85:
            print(f"   🎯 On track for independent living!")
        elif predicted_recovery >= 70:
            print(f"   💪 Good progress - keep it up!")
        else:
            print(f"   📈 Increase exercise frequency for better outcomes")
        
        return {
            "current_recovery_pct": current_recovery,
            "predicted_recovery_pct": predicted_recovery,
            "predictions": predictions.tolist()
        }
    
    def visualize_progress(self):
        """Create progress visualization"""
        if not self.data["sessions"]:
            print("No sessions to visualize")
            return
        
        sessions = self.data["sessions"]
        session_nums = [s["session_number"] for s in sessions]
        shoulder_data = [s["measurements"]["shoulder_range"] for s in sessions]
        
        plt.figure(figsize=(10, 6))
        plt.plot(session_nums, shoulder_data, marker='o', linewidth=2, markersize=8)
        plt.axhline(y=self.data["baseline"]["shoulder_range"], color='r', 
                   linestyle='--', label='Baseline')
        plt.axhline(y=180, color='g', linestyle='--', label='Full Range (Goal)')
        
        plt.xlabel('Session Number', fontsize=12)
        plt.ylabel('Shoulder Range of Motion (degrees)', fontsize=12)
        plt.title(f'Recovery Progress - {self.patient_id}', fontsize=14, fontweight='bold')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f'{self.patient_id}_progress.png', dpi=300)
        print(f"📊 Progress chart saved: {self.patient_id}_progress.png")
        plt.show()
    
    def generate_report(self):
        """Generate progress report for caregivers/doctors"""
        if not self.data["sessions"]:
            print("No data to report")
            return
        
        total_sessions = len(self.data["sessions"])
        improvement = self.calculate_improvement()
        avg_reps = np.mean([s["performance"]["reps"] for s in self.data["sessions"]])
        
        print("\n" + "="*50)
        print(f"PROGRESS REPORT - {self.patient_id}".center(50))
        print("="*50)
        print(f"\n📅 Duration: {self.data['start_date']} to {datetime.date.today()}")
        print(f"💪 Total Sessions: {total_sessions}")
        print(f"📊 Average Reps/Session: {avg_reps:.1f}")
        print(f"\n🎯 FUNCTIONAL IMPROVEMENTS:")
        print(f"   Shoulder Range: {improvement['shoulder']:+.1f}° improvement")
        print(f"   Elbow Range: {improvement['elbow']:+.1f}° improvement")
        print(f"   Wrist Strength: {improvement['wrist']:+.1f} points improvement")
        
        # Functional milestones
        current_shoulder = self.data["sessions"][-1]["measurements"]["shoulder_range"]
        print(f"\n✅ ACHIEVED MILESTONES:")
        if current_shoulder >= 90:
            print("   • Can reach face/brush hair")
        if current_shoulder >= 120:
            print("   • Can reach overhead cabinets")
        if current_shoulder >= 150:
            print("   • Near full range of motion")
        
        print("\n" + "="*50 + "\n")


# =======================
# DEMO: Simulate patient journey
# =======================

if __name__ == "__main__":
    print("🏥 NEUROPATH AI - RECOVERY TRACKER DEMO\n")
    
    # Create patient
    tracker = StrokeRecoveryTracker("demo_patient_001")
    
    # Set baseline (post-stroke initial assessment)
    print("Setting baseline (Week 0)...")
    tracker.set_baseline(shoulder_angle=65, elbow_angle=45, wrist_strength=3)
    
    # Simulate 8 weeks of recovery (3 sessions/week)
    print("\n📈 Simulating 8-week recovery journey...\n")
    
    # Week 1-2: Slow progress
    for i in range(6):
        tracker.log_session(
            shoulder_angle=65 + i*3,
            elbow_angle=45 + i*2,
            wrist_strength=3 + i*0.3,
            reps_completed=8 + i,
            exercise_duration_mins=15,
            pain_level=2
        )
    
    # Week 3-5: Faster progress (patient adapted)
    for i in range(9):
        tracker.log_session(
            shoulder_angle=83 + i*5,
            elbow_angle=57 + i*4,
            wrist_strength=4.8 + i*0.4,
            reps_completed=14 + i,
            exercise_duration_mins=20,
            pain_level=1
        )
    
    # Week 6-8: Plateau but steady
    for i in range(9):
        tracker.log_session(
            shoulder_angle=128 + i*3,
            elbow_angle=93 + i*2,
            wrist_strength=8.4 + i*0.2,
            reps_completed=23 + i,
            exercise_duration_mins=25,
            pain_level=0
        )
    
    # Generate insights
    print("\n" + "="*60)
    tracker.predict_recovery(weeks_ahead=12)
    tracker.generate_report()
    tracker.visualize_progress()
    
    print("\n💡 This data can be shared with:")
    print("   • Physical therapists for treatment adjustments")
    print("   • Insurance companies for coverage appeals")
    print("   • Family members to track loved one's progress")
    print("   • Imagine Cup judges to show real impact! 🏆")
    