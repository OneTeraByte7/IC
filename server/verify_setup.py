"""
NeuroPath AI - Setup Verification Script
Check all configurations, dependencies, and Azure connections
"""

import os
import sys
from pathlib import Path

def print_header(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def check_env_file():
    """Check if .env file exists and has required keys"""
    print_header("🔍 CHECKING ENVIRONMENT FILE")
    
    env_path = Path(".env")
    if not env_path.exists():
        print("❌ .env file not found!")
        return False
    
    print("✅ .env file exists")
    
    required_keys = [
        "AZURE_OPENAI_KEY",
        "AZURE_OPENAI_ENDPOINT",
        "AZURE_SPEECH_KEY",
        "AZURE_SPEECH_REGION",
        "AZURE_VISION_KEY",
        "AZURE_VISION_ENDPOINT"
    ]
    
    from dotenv import load_dotenv
    load_dotenv()
    
    missing = []
    for key in required_keys:
        value = os.getenv(key)
        if value:
            print(f"✅ {key}: {'*' * 10}")
        else:
            print(f"❌ {key}: MISSING")
            missing.append(key)
    
    if missing:
        print(f"\n⚠️  Missing keys: {', '.join(missing)}")
        return False
    
    return True

def check_dependencies():
    """Check if required packages are installed"""
    print_header("📦 CHECKING DEPENDENCIES")
    
    required_packages = {
        "fastapi": "FastAPI",
        "uvicorn": "Uvicorn",
        "openai": "Azure OpenAI SDK",
        "azure.cognitiveservices.speech": "Azure Speech SDK",
        "azure.ai.vision": "Azure Vision SDK",
        "mediapipe": "MediaPipe",
        "cv2": "OpenCV",
        "numpy": "NumPy",
        "dotenv": "Python Dotenv"
    }
    
    all_installed = True
    for package, name in required_packages.items():
        try:
            if package == "cv2":
                __import__("cv2")
            elif package == "dotenv":
                __import__("dotenv")
            elif package == "azure.cognitiveservices.speech":
                __import__("azure.cognitiveservices.speech")
            elif package == "azure.ai.vision":
                __import__("azure.ai.vision.imageanalysis")
            else:
                __import__(package)
            print(f"✅ {name}")
        except ImportError:
            print(f"❌ {name} - NOT INSTALLED")
            all_installed = False
    
    return all_installed

def check_azure_services():
    """Test Azure service connections"""
    print_header("☁️  TESTING AZURE SERVICES")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    # Test Azure OpenAI
    print("\n🤖 Azure OpenAI:")
    try:
        from services.azure_openai import openai_service
        if openai_service.available:
            print(f"   ✅ Connected - Endpoint: {openai_service.endpoint}")
        else:
            print("   ⚠️  Not configured (Mock Mode)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test Azure Speech
    print("\n🎤 Azure Speech:")
    try:
        from services.azure_speech import speech_service
        if speech_service.available:
            print(f"   ✅ Connected - Region: {speech_service.speech_region}")
        else:
            print("   ⚠️  Not configured (Mock Mode)")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test Azure Vision
    print("\n👁️  Azure Vision:")
    try:
        from services.azure_vision import vision_service
        if vision_service.available:
            print(f"   ✅ Connected - Endpoint: {vision_service.endpoint}")
        else:
            print("   ⚠️  Not configured (Mock Mode)")
    except Exception as e:
        print(f"   ❌ Error: {e}")

def check_file_structure():
    """Verify required files and directories exist"""
    print_header("📁 CHECKING FILE STRUCTURE")
    
    required_paths = [
        "main.py",
        "requirements.txt",
        ".env",
        "routers/exercise_session.py",
        "routers/patients.py",
        "api/exercise_session.py",
        "services/azure_openai.py",
        "services/azure_speech.py",
        "services/azure_vision.py",
        "data/patients"
    ]
    
    all_exist = True
    for path in required_paths:
        p = Path(path)
        if p.exists():
            print(f"✅ {path}")
        else:
            print(f"❌ {path} - NOT FOUND")
            all_exist = False
    
    return all_exist

def main():
    print("\n" + "="*60)
    print("  🏥 NEUROPATH AI - SETUP VERIFICATION")
    print("="*60)
    
    os.chdir(Path(__file__).parent)
    
    # Run all checks
    checks = {
        "File Structure": check_file_structure(),
        "Environment File": check_env_file(),
        "Dependencies": check_dependencies()
    }
    
    # Test Azure services (won't fail overall check)
    try:
        check_azure_services()
    except Exception as e:
        print(f"\n⚠️  Azure services check skipped: {e}")
    
    # Final summary
    print_header("📊 SUMMARY")
    
    all_passed = all(checks.values())
    
    for check_name, passed in checks.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{check_name}: {status}")
    
    if all_passed:
        print("\n" + "="*60)
        print("✅ ALL CHECKS PASSED!")
        print("="*60)
        print("\n🚀 You can now run the server with:")
        print("   python main.py")
        print("\n📚 API Documentation will be at:")
        print("   http://127.0.0.1:8000/api/docs")
        print("\n☁️  Azure Status:")
        print("   http://127.0.0.1:8000/azure-status")
        print("\n" + "="*60)
        return 0
    else:
        print("\n" + "="*60)
        print("❌ SOME CHECKS FAILED")
        print("="*60)
        print("\nPlease fix the issues above before running the server.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
