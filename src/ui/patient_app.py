import streamlit as st
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import json
import os
from datetime import datetime, date
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


st.set_page_config(
    page_title = "NeuroPath AI - Stroke Rehabilition System",
    layout = "wide",
    initial_sidebar_state = "expanded"
)

st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1e88e5;
        text-align: center;
        padding: 1rem 0;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 10px;
        color: white;
        text-align: center;
    }
    .success-message {
        background-color: #4caf50;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)


if 'patient_id' not in st.session_state:
    st.session_state.patient_id = None
if 'exercise_active' not in st.session_state:
    st.session_state.exercise_active = False
    
    
def load_patient_data(patient_id):
    filepath = f"data/patients/{patient_id}.json"
    if os.path.exits(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return None

def save_patient_data(patient_id, data):
    os.makedir("data/patients", exist_ok=True)
    filepath = f"data/patients/{patient_id}.json"    
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def create_new_patient_data(patient_id, name):
    data = {
        "patient_id":patient_id,
        "name":name,
        "created_data":str(date.today()),
        "baseline":{},
        "sessions":[]
    }
    save_patient_data(patient_id, data)
    return data

with st.sidebar:
    st.markdown("Patient Login")
    
    if st.session_state.patient_id is None:
        patient_id = st.text_input("Patient ID", placeholder = "e.g, PAITENT001")
        patient_name = st.text_input("Your Name", placeholder = "John Doe")
        
        if st.button("Login / Create Account", type = "primary"):
            if patient_id and patient_name:
                data = load_patient_data(patient_id)
                if data is None:
                    data = create_new_patient_data(patient_id, patient_name)
                    st.success(f"Welcome, {data['name']}!")
                else:
                    st.success(f"Welcome back, {data['name']}!")
                    
                st.session_state.patient_id = patient_id
                st.rerun()
            else:
                st.error("Please enter both ID and name")
                
    else:
        data = load_patient_data(st.session_state.patient_id)
        st.success(f"Logged in as: **{data['name']}**")
        
        if st.button("Logout"):
            st.session_state.patient_id = None
            st.rerun()
            
        st.markdown("---")
        st.markdown("### Quick Stats")
        st.metrics("Total Sessions", len(data['sessions']))
        if data['sessions']:
            total_reps = sum(s.get('reps', 0) for s in data['sessions'])
            st.metric("Total Reps", total_reps)
            
if st.session_state.patient_id is None:
    # Landing page
    st.markdown('<div class="main-header">🏥 NeuroPath AI</div>', unsafe_allow_html=True)
    st.markdown("### AI-Powered Stroke Rehabilitation")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("#### 🎯 Real-time Tracking")
        st.write("Advanced AI tracks your movements and provides instant feedback")
    
    with col2:
        st.markdown("#### 📈 Progress Monitoring")
        st.write("See your improvement over time with detailed charts and insights")
    
    with col3:
        st.markdown("#### 🔮 Recovery Prediction")
        st.write("AI predicts your recovery trajectory and sets achievable goals")
    
    st.markdown("---")
    st.info("👈 Please login or create an account in the sidebar to get started")
    
    # Demo video/images would go here
    st.markdown("### How It Works")
    st.markdown("""
    1. **Login** - Create your account or login
    2. **Start Exercise** - Follow on-screen instructions
    3. **Get Feedback** - Real-time guidance on your form
    4. **Track Progress** - See your improvement over weeks
    5. **Predict Recovery** - AI shows your recovery path
    """)

else:
    # Patient dashboard
    data = load_patient_data(st.session_state.patient_id)
    
    st.markdown(f'<div class="main-header">Welcome, {data["name"]}! 👋</div>', unsafe_allow_html=True)
    
    # Tab navigation
    tab1, tab2, tab3, tab4 = st.tabs(["🏋️ Exercise", "📊 Progress", "🔮 Predictions", "⚙️ Settings"])
    
    # TAB 1: EXERCISE
    with tab1:
        st.markdown("### Today's Exercise Session")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.markdown("#### Shoulder Raise Exercise")
            st.markdown("""
            **Instructions:**
            1. Stand facing your camera
            2. Raise your RIGHT arm straight up
            3. Lower it back down slowly
            4. Goal: 10 repetitions
            """)
            
            if st.button("🎥 Start Exercise Session", type="primary", disabled=st.session_state.exercise_active):
                st.session_state.exercise_active = True
                st.info("Exercise session starting... (This would launch webcam interface)")
                # In production, this would open webcam interface
                # For demo purposes:
                st.warning("⚠️ Webcam interface would open here. For now, click 'Complete Session' to simulate.")
        
        with col2:
            st.markdown("#### Session Goals")
            st.markdown("- 🎯 10 repetitions")
            st.markdown("- 📐 Achieve 140° range")
            st.markdown("- ⏱️ 15 minutes duration")
            
            if st.session_state.exercise_active:
                if st.button("✅ Complete Session"):
                    # Simulate session completion
                    session = {
                        "date": str(date.today()),
                        "timestamp": datetime.now().isoformat(),
                        "session_number": len(data["sessions"]) + 1,
                        "exercise": "shoulder_raise",
                        "reps": np.random.randint(8, 12),
                        "max_angle": np.random.uniform(120, 160),
                        "duration_mins": 15
                    }
                    
                    # Set baseline if first session
                    if not data["baseline"]:
                        data["baseline"] = {
                            "date": str(date.today()),
                            "shoulder_range": session["max_angle"],
                            "elbow_range": 90
                        }
                    
                    data["sessions"].append(session)
                    save_patient_data(st.session_state.patient_id, data)
                    
                    st.session_state.exercise_active = False
                    st.success(f"✅ Session complete! You completed {session['reps']} reps.")
                    st.balloons()
                    st.rerun()
    
    # TAB 2: PROGRESS
    with tab2:
        st.markdown("### Your Progress Dashboard")
        
        if not data["sessions"]:
            st.info("Complete your first exercise session to see progress!")
        else:
            # Metrics row
            col1, col2, col3, col4 = st.columns(4)
            
            total_sessions = len(data["sessions"])
            total_reps = sum(s.get("reps", 0) for s in data["sessions"])
            avg_angle = np.mean([s.get("max_angle", 0) for s in data["sessions"]])
            
            if data["baseline"]:
                improvement = avg_angle - data["baseline"]["shoulder_range"]
            else:
                improvement = 0
            
            with col1:
                st.metric("Total Sessions", total_sessions)
            with col2:
                st.metric("Total Reps", total_reps)
            with col3:
                st.metric("Avg Range", f"{avg_angle:.1f}°")
            with col4:
                st.metric("Improvement", f"{improvement:+.1f}°")
            
            st.markdown("---")
            
            # Progress chart
            st.markdown("#### Shoulder Range of Motion Over Time")
            
            df = pd.DataFrame([
                {
                    "Session": s["session_number"],
                    "Angle": s["max_angle"],
                    "Date": s.get("date", "N/A")
                }
                for s in data["sessions"]
            ])
            
            fig = go.Figure()
            
            # Progress line
            fig.add_trace(go.Scatter(
                x=df["Session"],
                y=df["Angle"],
                mode='lines+markers',
                name='Your Progress',
                line=dict(color='#2196F3', width=3),
                marker=dict(size=10)
            ))
            
            # Baseline
            if data["baseline"]:
                fig.add_trace(go.Scatter(
                    x=[df["Session"].min(), df["Session"].max()],
                    y=[data["baseline"]["shoulder_range"], data["baseline"]["shoulder_range"]],
                    mode='lines',
                    name='Baseline',
                    line=dict(color='red', width=2, dash='dash')
                ))
            
            # Goal
            fig.add_trace(go.Scatter(
                x=[df["Session"].min(), df["Session"].max()],
                y=[180, 180],
                mode='lines',
                name='Full Range Goal',
                line=dict(color='green', width=2, dash='dash')
            ))
            
            fig.update_layout(
                xaxis_title="Session Number",
                yaxis_title="Shoulder Range (degrees)",
                height=400,
                hovermode='x unified'
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Recent sessions table
            st.markdown("#### Recent Sessions")
            recent_df = df.tail(5).sort_values("Session", ascending=False)
            st.dataframe(recent_df, use_container_width=True)
    
    # TAB 3: PREDICTIONS
    with tab3:
        st.markdown("### Recovery Predictions")
        
        if len(data["sessions"]) < 3:
            st.warning(f"⚠️ You need at least 3 sessions for predictions. Current: {len(data['sessions'])}")
            st.info("Complete more exercise sessions to unlock AI recovery predictions!")
        else:
            # Calculate predictions
            sessions = data["sessions"]
            X = np.array([[i+1] for i in range(len(sessions))])
            y = np.array([s["max_angle"] for s in sessions])
            
            # Simple linear regression
            from sklearn.linear_model import LinearRegression
            model = LinearRegression()
            model.fit(X, y)
            
            # Predict 12 weeks ahead (36 sessions at 3/week)
            future_X = np.array([[i] for i in range(1, len(sessions) + 37)])
            predictions = model.predict(future_X)
            
            current_recovery = (y[-1] / 180) * 100
            predicted_recovery = min((predictions[-1] / 180) * 100, 100)
            
            # Display predictions
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.markdown('<div class="metric-card">', unsafe_allow_html=True)
                st.metric("Current Recovery", f"{current_recovery:.1f}%")
                st.markdown('</div>', unsafe_allow_html=True)
            
            with col2:
                st.markdown('<div class="metric-card">', unsafe_allow_html=True)
                st.metric("Predicted (12 weeks)", f"{predicted_recovery:.1f}%")
                st.markdown('</div>', unsafe_allow_html=True)
            
            with col3:
                improvement_pct = predicted_recovery - current_recovery
                st.markdown('<div class="metric-card">', unsafe_allow_html=True)
                st.metric("Expected Gain", f"{improvement_pct:+.1f}%")
                st.markdown('</div>', unsafe_allow_html=True)
            
            st.markdown("---")
            
            # Prediction chart
            st.markdown("#### Your Recovery Trajectory")
            
            fig = go.Figure()
            
            # Historical data
            fig.add_trace(go.Scatter(
                x=list(range(1, len(sessions)+1)),
                y=y,
                mode='lines+markers',
                name='Actual Progress',
                line=dict(color='#2196F3', width=3)
            ))
            
            # Predictions
            fig.add_trace(go.Scatter(
                x=list(range(len(sessions)+1, len(future_X)+1)),
                y=predictions[len(sessions):],
                mode='lines',
                name='Predicted Progress',
                line=dict(color='#FFA726', width=3, dash='dash')
            ))
            
            fig.update_layout(
                xaxis_title="Session Number",
                yaxis_title="Shoulder Range (degrees)",
                height=400,
                hovermode='x unified'
            )
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Recommendations
            st.markdown("#### 🎯 Recommendations")
            
            if predicted_recovery >= 85:
                st.success("🌟 Excellent! You're on track for independent living. Keep up the great work!")
            elif predicted_recovery >= 70:
                st.info("💪 Good progress! Increase exercise frequency to 4x/week for better outcomes.")
            else:
                st.warning("📈 Consider consulting your PT for exercise plan adjustments.")
            
            # Milestones
            st.markdown("#### 🏆 Functional Milestones")
            
            current_angle = y[-1]
            
            milestones = [
                (90, "Can reach face and brush hair", current_angle >= 90),
                (120, "Can reach overhead cabinets", current_angle >= 120),
                (150, "Near full range of motion", current_angle >= 150),
                (170, "Full functional recovery", current_angle >= 170)
            ]
            
            for angle, description, achieved in milestones:
                if achieved:
                    st.markdown(f"✅ **{description}** ({angle}°)")
                else:
                    st.markdown(f"⏳ {description} ({angle}°)")
    
    # TAB 4: SETTINGS
    with tab4:
        st.markdown("### Account Settings")
        
        st.text_input("Name", value=data["name"])
        st.text_input("Patient ID", value=data["patient_id"], disabled=True)
        st.date_input("Member Since", value=datetime.strptime(data["created_date"], "%Y-%m-%d"))
        
        st.markdown("---")
        
        st.markdown("### Data Export")
        
        if st.button("📄 Download Progress Report (PDF)"):
            st.info("Report generation would happen here")
        
        if st.button("📊 Export Data (JSON)"):
            st.download_button(
                label="Download JSON",
                data=json.dumps(data, indent=2),
                file_name=f"{data['patient_id']}_data.json",
                mime="application/json"
            )
        
        st.markdown("---")
        
        st.markdown("### Danger Zone")
        if st.button("🗑️ Delete All Data", type="secondary"):
            if st.checkbox("I understand this cannot be undone"):
                st.error("Data deletion would happen here")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666;'>
    <p>NeuroPath AI - Making Expert Stroke Rehabilitation Accessible to Everyone</p>
    <p>Microsoft Imagine Cup 2025 Project</p>
</div>
""", unsafe_allow_html=True)          