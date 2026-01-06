"""
Quick test script to verify the model file path is correct
"""

import os
from pathlib import Path

print("\n" + "="*60)
print("🔍 CHECKING MEDIAPIPE MODEL FILE")
print("="*60)

# Check root directory
root_model = Path("F:/Imagine Cup/pose_landmarker_lite.task")
print(f"\n1. Root directory model:")
print(f"   Path: {root_model}")
print(f"   Exists: {'✅ YES' if root_model.exists() else '❌ NO'}")

# Check server/assets directory  
assets_model = Path("F:/Imagine Cup/server/assets/pose_landmarker_lite.task")
print(f"\n2. Server assets model:")
print(f"   Path: {assets_model}")
print(f"   Exists: {'✅ YES' if assets_model.exists() else '❌ NO'}")

# Check from api directory perspective
os.chdir("F:/Imagine Cup/server")
from pathlib import Path

api_perspective = Path(__file__).parent.parent / 'pose_landmarker_lite.task'
print(f"\n3. From API perspective:")
print(f"   Path: {api_perspective.absolute()}")
print(f"   Exists: {'✅ YES' if api_perspective.exists() else '❌ NO'}")

assets_perspective = Path(__file__).parent / "server" / "assets" / "pose_landmarker_lite.task"
print(f"\n4. From server assets perspective:")
print(f"   Path: {assets_perspective.absolute()}")
print(f"   Exists: {'✅ YES' if assets_perspective.exists() else '❌ NO'}")

print("\n" + "="*60)
print("✅ Model file check complete")
print("="*60 + "\n")
