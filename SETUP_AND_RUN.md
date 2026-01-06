# NeuroPath AI - Complete Setup & Run Guide

## 📋 Pre-Flight Checklist

### ✅ Issues Fixed:
1. **azure_openai.py** - Fixed typos:
   - Line 30: `AZURE_OPEAI_KEY` → `AZURE_OPENAI_KEY`
   - Line 32: `AZURE_OPENAI_DEPLOYMWNT` → `AZURE_OPENAI_DEPLOYMENT`
   - Line 11: `tag` → `tags`

2. **azure_vision.py** - Fixed:
   - Indentation error in `analyze_exercise_form` method
   - Typo in print statement

3. **api/exercise_session.py** - Fixed:
   - Line 13: `/ap/exercise` → `/api/exercise`

4. **requirements.txt** - Added missing Azure SDKs:
   - `openai==1.12.0`
   - `azure-cognitiveservices-speech==1.35.0`
   - `azure-ai-vision-imageanalysis==1.0.0b2`

5. **main.py** - Integrated all Azure services:
   - Added Azure router imports
   - Included all service endpoints
   - Added `/azure-status` endpoint

---

## 🔑 Environment Variables Check

Your `.env` file has all required keys:

```
✅ AZURE_OPENAI_KEY (configured)
✅ AZURE_OPENAI_ENDPOINT (configured)
✅ AZURE_SPEECH_KEY (configured)
✅ AZURE_SPEECH_REGION (configured)
✅ AZURE_VISION_KEY (configured)
✅ AZURE_VISION_ENDPOINT (configured)
```

---

## 🚀 How to Run

### Step 1: Install Server Dependencies

```bash
cd "F:\Imagine Cup\server"

# Activate virtual environment (if you have one)
venv\Scripts\activate

# Install/Update all dependencies
pip install -r requirements.txt
```

### Step 2: Verify Setup

```bash
# Run verification script
python verify_setup.py
```

This will check:
- ✅ All files exist
- ✅ Environment variables are set
- ✅ Dependencies are installed
- ✅ Azure services can connect

### Step 3: Start the Backend Server

```bash
# Make sure you're in the server directory
cd "F:\Imagine Cup\server"

# Run the server
python main.py
```

Server will start at: **http://127.0.0.1:8000**

### Step 4: Start the Frontend Client

Open a **NEW** terminal/command prompt:

```bash
cd "F:\Imagine Cup\client"

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

Client will start at: **http://localhost:5173** (or 3000)

---

## 🌐 Available Endpoints

Once running, visit:

### Main API
- **Root:** http://127.0.0.1:8000
- **API Docs:** http://127.0.0.1:8000/api/docs
- **Health Check:** http://127.0.0.1:8000/api/health
- **Azure Status:** http://127.0.0.1:8000/azure-status

### Azure Services
- **OpenAI Coach:** http://127.0.0.1:8000/api/openai/*
- **Speech Services:** http://127.0.0.1:8000/api/speech/*
- **Vision Analysis:** http://127.0.0.1:8000/api/vision/*

### Exercise & Patients
- **Exercise Session:** http://127.0.0.1:8000/api/exercise/*
- **Patient Management:** http://127.0.0.1:8000/api/patients/*

---

## 🧪 Quick Test

After starting the server, test if everything works:

### Test 1: Check Server Status
```bash
curl http://127.0.0.1:8000
```

Expected: JSON with "Powered by Microsoft Azure" message

### Test 2: Check Azure Services
```bash
curl http://127.0.0.1:8000/azure-status
```

Expected: Status of all 3 Azure services (should show "✅ Ready")

### Test 3: Visit API Documentation
Open browser: http://127.0.0.1:8000/api/docs

You should see all endpoints organized by tags:
- Exercise
- Patients
- Exercise API
- Azure Speech
- Azure OpenAI
- Azure Vision

---

## 🐛 Troubleshooting

### Issue: Import errors
**Solution:** Make sure all dependencies are installed
```bash
pip install -r requirements.txt
```

### Issue: Azure services show "Mock Mode"
**Solution:** Check your .env file has correct keys
```bash
python verify_setup.py
```

### Issue: Port 8000 already in use
**Solution:** Change port in main.py or kill existing process
```bash
# Find process on port 8000
netstat -ano | findstr :8000

# Kill it (replace PID)
taskkill /PID <PID> /F
```

### Issue: ModuleNotFoundError
**Solution:** Make sure you're in the correct directory
```bash
cd "F:\Imagine Cup\server"
python main.py
```

---

## 📊 Expected Output

When you run `python main.py`, you should see:

```
============================================================
🏥 NEUROPATH AI - BACKEND SERVER
============================================================

📡 Starting server...

🔗 API Root:      http://127.0.0.1:8000
📚 API Docs:      http://127.0.0.1:8000/api/docs
🏥 Health Check:  http://127.0.0.1:8000/api/health

💡 Press CTRL+C to stop

============================================================

INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Plus Azure service initialization messages:
```
✅ Azure OpenAI initialized successfully
✅ Azure Speech Services initialized successfully
✅ Azure Computer Vision initialized successfully
```

---

## ✅ Final Checklist

Before running, ensure:

- [ ] All Python dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file exists with all Azure keys
- [ ] Virtual environment activated (if using one)
- [ ] In correct directory (`F:\Imagine Cup\server`)
- [ ] Port 8000 is available
- [ ] No syntax errors in any files

---

## 🎯 Next Steps

1. Run `python verify_setup.py` to check everything
2. If all checks pass, run `python main.py`
3. Open http://127.0.0.1:8000/api/docs in browser
4. Test Azure services at http://127.0.0.1:8000/azure-status
5. Start the React frontend in another terminal
6. Begin testing the full application!

---

## 📞 Quick Commands Reference

```bash
# Verify setup
python verify_setup.py

# Start server
python main.py

# Start client (new terminal)
cd ../client
npm run dev

# Test endpoints
curl http://127.0.0.1:8000/azure-status
```

**Everything is ready to run! 🚀**
