# 🏥 NEUROPATH AI - QUICK START GUIDE

## ⚡ IMMEDIATE SETUP (5 Minutes)

### 1. Setup Python Environment

```bash
# Open PowerShell/Terminal in F:\Imagine Cup
cd "F:\Imagine Cup"

# Create virtual environment with Python 3.11
D:\python.exe -m venv .venv

# Activate it
.venv\Scripts\activate    # Windows PowerShell
# OR
source .venv/Scripts/activate  # Git Bash

# Install dependencies
cd server
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Setup Database

1. Go to https://supabase.com/dashboard
2. Open project: **kcgbgfqkfdojhctagnsm**
3. Click **SQL Editor** (left sidebar)
4. Click **+ New Query**
5. Copy entire content from `database_schema.sql`
6. Click **Run** or press `Ctrl+Enter`
7. Wait for "Success" message

### 3. Start Backend Server

```bash
# Make sure you're in server folder with venv activated
cd "F:\Imagine Cup\server"
.venv\Scripts\activate     # if not already activated
python main.py
```

You should see:
```
✅ Azure OpenAI initialized successfully
Azure Computer Vision initialized successfully

============================================================
🏥 NEUROPATH AI - BACKEND SERVER
============================================================

📡 Starting server...
🔗 API Root:      http://127.0.0.1:8000
```

### 4. Start Frontend (New Terminal)

```bash
# Open NEW terminal
cd "F:\Imagine Cup\client"
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### 5. Open Application

Open browser: **http://localhost:5173**

---

## 🔧 FIXING COMMON ISSUES

### Issue 1: "AttributeError: function 'free' not found" (MediaPipe Error)

**Solution:** You're using Python 3.13, but MediaPipe needs Python 3.11

```bash
# Remove old venv
cd "F:\Imagine Cup"
rmdir /s .venv    # Windows CMD
# OR
rm -rf .venv      # Git Bash

# Create with Python 3.11
D:\python.exe -m venv .venv

# Reactivate and reinstall
.venv\Scripts\activate
cd server
pip install -r requirements.txt
```

### Issue 2: "Azure OpenAI initialization failed: proxies"

**Solution:** Updated OpenAI package - Already fixed in requirements.txt!

```bash
pip install --upgrade openai
```

### Issue 3: "Missing Supabase environment variables"

**Check your client/.env file:**
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://kcgbgfqkfdojhctagnsm.supabase.co
```

Note: Make sure it's `VITE_SUPABASE_URL` not `VITW_SUPABASE_URL` (typo fixed!)

### Issue 4: "Maximum update depth exceeded" (React Error)

**Already Fixed!** The AICoachAvatar component has been updated to prevent infinite loops.

### Issue 5: Can't see myself on camera / No skeleton overlay

**Solution:** The TensorFlow backend needs initialization:

1. Check browser console for errors
2. Make sure WebGL is enabled in browser
3. The component will auto-initialize - wait 3-5 seconds after opening

---

## 📊 TESTING THE FEATURES

### Test 1: Exercise Session with Pose Detection

1. Click "Start Exercise Session"
2. Allow camera access
3. Wait 3 seconds for model loading
4. You should see:
   - ✅ Your video feed
   - ✅ Cyan skeleton overlay on your body
   - ✅ Angle measurements in real-time
   - ✅ Rep counter
   - ✅ 3D Holographic AI Coach on the right

### Test 2: Rep Counting

1. Stand in front of camera
2. Raise your arm slowly (shoulder exercise)
3. When angle > 140°, it's "up" position
4. Lower arm below 50°, that's one rep
5. Counter should increase: "Reps: 1"

### Test 3: AI Coach

1. The holographic coach demonstrates the exercise
2. Blue/cyan animated 3D figure
3. Speaks instructions (check console if audio fails)
4. Changes pose to match exercise type

### Test 4: Azure OpenAI Coaching

1. Complete an exercise session
2. AI generates feedback: "Great work! You reached 145° degrees..."
3. If mock mode: Check it says "Running in mock mode"
4. Real mode: Personalized feedback from GPT-4

---

## 🎯 VERIFYING EVERYTHING WORKS

### Backend Health Check
```bash
# Visit in browser or curl:
http://127.0.0.1:8000/api/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2026-01-07T...",
  "services": {
    "database": "connected",
    "azure_openai": "active",
    ...
  }
}
```

### Test Azure Services
```bash
cd "F:\Imagine Cup\server"
.venv\Scripts\activate
python test_azure.py
```

Expected output:
```
✅ Azure OpenAI: Ready
✅ Azure Speech: Ready
✅ Azure Vision: Ready
```

### Check Database Connection
```bash
# In server folder
python -c "from supabase import create_client; import os; from dotenv import load_dotenv; load_dotenv(); print('✅ Supabase connects!' if create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_ANON_KEY')) else '❌ Failed')"
```

---

## 🎨 NEW FEATURES IMPLEMENTED

### 1. ✅ 3D Holographic AI Coach
- **File:** `client/src/components/exercise/AICoachAvatar.jsx`
- **Tech:** Three.js 3D rendering
- **Features:**
  - Animated avatar that demonstrates exercises
  - Cyan holographic visual effect
  - Smooth keyframe animations
  - Voice coaching instructions
  - Breathing animations for realism

### 2. ✅ Real-time Pose Detection & Skeleton Overlay
- **File:** `client/src/components/exercise/ExerciseWebcam.jsx`
- **Tech:** TensorFlow.js + MoveNet
- **Features:**
  - 17-point skeleton tracking
  - Real-time angle calculation
  - Visual feedback with cyan lines
  - Keypoint confidence scoring

### 3. ✅ Intelligent Rep Counting
- **Logic:** State machine (up/down positions)
- **Accuracy:** Angle-based thresholds
- **Prevents:** Double counting with debouncing

### 4. ✅ Supabase User Authentication & Data Storage
- **File:** `database_schema.sql`
- **Tables:**
  - `patients` - User profiles
  - `exercise_sessions` - Session records
  - `patient_progress` - Aggregated metrics
  - `exercise_library` - Available exercises
- **Security:** Row Level Security (RLS) enabled

### 5. ✅ Azure AI Integration
- **Azure OpenAI (GPT-4):** Personalized coaching
- **Azure Speech:** Text-to-speech for instructions
- **Azure Vision:** (Future: Form analysis from photos)

---

## 📁 PROJECT STRUCTURE

```
F:\Imagine Cup\
├── .venv\                      # Python 3.11 virtual environment
├── server\
│   ├── main.py                 # FastAPI server entry point
│   ├── requirements.txt        # Python dependencies (UPDATED!)
│   ├── .env                    # Server environment variables
│   ├── routers\
│   │   ├── exercise_session.py # Exercise WebSocket & tracking
│   │   └── patients.py         # Patient management API
│   ├── services\
│   │   ├── azure_openai.py     # GPT-4 coaching (FIXED!)
│   │   ├── azure_speech.py     # Text-to-speech
│   │   ├── azure_vision.py     # Image analysis
│   │   └── neural_recovery.py  # ML predictions
│   └── config.py
├── client\
│   ├── src\
│   │   ├── components\
│   │   │   └── exercise\
│   │   │       ├── AICoachAvatar.jsx       # 3D Coach (FIXED!)
│   │   │       ├── ExerciseWebcam.jsx      # Pose detection
│   │   │       ├── ExerciseDashboard.jsx   # Main exercise UI
│   │   │       └── Skeleton3DViewer.jsx    # 3D skeleton viz
│   │   ├── services\
│   │   │   └── supabaseClient.js   # Database client
│   │   └── pages\
│   │       └── Exercise.jsx
│   ├── .env                        # Client env (FIXED TYPO!)
│   └── package.json
├── database_schema.sql             # Complete DB setup (NEW!)
├── setup.bat                       # Windows setup script (NEW!)
└── setup.sh                        # Linux/Mac setup script (NEW!)
```

---

## 🚀 IMAGINE CUP INNOVATION HIGHLIGHTS

### 1. **AI-Powered Holographic Coach** 🤖
- First-of-its-kind 3D avatar for rehabilitation
- Real-time demonstration and mirroring
- Contextual voice guidance

### 2. **Advanced Pose Analysis** 📊
- Clinical-grade angle measurements
- Form quality scoring (0-100)
- Consistency tracking across sessions

### 3. **Predictive Recovery Analytics** 📈
- ML-based progress forecasting
- Personalized exercise recommendations
- Plateau detection and intervention

### 4. **Comprehensive Data Platform** 💾
- Secure cloud storage (Supabase)
- HIPAA-ready architecture
- Multi-device synchronization

### 5. **Azure AI Integration** ☁️
- GPT-4 conversational coaching
- Natural voice synthesis
- Computer vision analysis

---

## 📞 TROUBLESHOOTING CHECKLIST

- [ ] Python version is 3.11.x (check: `python --version`)
- [ ] Virtual environment activated (see `(.venv)` in terminal)
- [ ] All packages installed (check: `pip list`)
- [ ] Server .env file exists and has all keys
- [ ] Client .env file has correct VITE_ prefixes
- [ ] Supabase database tables created
- [ ] Backend running on http://127.0.0.1:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Camera permission granted in browser
- [ ] WebGL enabled in browser (chrome://flags)

---

## ⚡ QUICK COMMANDS REFERENCE

```bash
# Backend
cd "F:\Imagine Cup\server"
.venv\Scripts\activate
python main.py

# Frontend (new terminal)
cd "F:\Imagine Cup\client"
npm run dev

# Test Azure
cd "F:\Imagine Cup\server"
python test_azure.py

# Check Python version
python --version  # Must be 3.11.x

# Reinstall packages
pip install --force-reinstall -r requirements.txt

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 YOU'RE READY!

Everything is now properly configured. Run the setup script or follow the manual steps above, and you'll have a fully functional NeuroPath AI system with:

✅ Real-time pose detection
✅ 3D holographic coach
✅ Azure AI integration
✅ Supabase database
✅ Rep counting and form analysis
✅ Progress tracking

**Good luck with Imagine Cup! 🏆**
