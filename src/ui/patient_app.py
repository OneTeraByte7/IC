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
    initial_sidebar_State = "expanded"
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
    
    if()