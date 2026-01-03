"""
Configuration settings for NeuroPath AI Server
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Server Settings
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", 8000))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CORS Settings
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

# Directories
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data" / "patients"
ASSETS_DIR = BASE_DIR / "assets"

# ML Model
POSE_MODEL_PATH = ASSETS_DIR / "pose_landmarker_lite.task"

# Create directories if they don't exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
ASSETS_DIR.mkdir(parents=True, exist_ok=True)
