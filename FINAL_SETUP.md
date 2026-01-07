# 🚀 COMPLETE SETUP GUIDE - FINAL VERSION

## Issue: NumPy Version Conflict

### Quick Fix (Run These Commands):

```bash
# In your terminal (with venv activated)
cd "F:\Imagine Cup"
.venv\Scripts\activate
pip install "numpy<2" --force-reinstall
pip install opencv-python --force-reinstall
```

**OR** just double-click: `fix_numpy.bat`

---

## Step-by-Step Setup

### 1. Fix NumPy (REQUIRED)

```bash
cd "F:\Imagine Cup"
.venv\Scripts\python.exe -m pip install "numpy<2" --force-reinstall
```

### 2. Test Azure Keys

```bash
cd server
python test_azure.py
```

This will:
- ✅ Check if all Azure keys exist
- ✅ Test each service connection
- ✅ Show you which services are working

### 3. Start Backend

```bash
cd "F:\Imagine Cup\server"
python main.py
```

Expected output:
```
✅ Azure OpenAI initialized successfully
✅ Azure Computer Vision initialized successfully
✅ Azure Speech initialized successfully

============================================================
🏥 NEUROPATH AI - BACKEND SERVER
============================================================

📡 Starting server...
🔗 API Root:      http://127.0.0.1:8000
```

### 4. Start Frontend (New Terminal)

```bash
cd "F:\Imagine Cup\client"
npm run dev
```

### 5. Open Browser

http://localhost:5173/exercise

---

## 📋 Complete Command Sequence

### Terminal 1 - Backend:
```bash
cd "F:\Imagine Cup"

# Activate venv
.venv\Scripts\activate

# Fix NumPy
pip install "numpy<2" --force-reinstall

# Test Azure
cd server
python test_azure.py

# Start server
python main.py
```

### Terminal 2 - Frontend:
```bash
cd "F:\Imagine Cup\client"
npm run dev
```

---

## 🔑 Azure Keys Status

Your `.env` file has these keys:

### ✅ Azure OpenAI
- **Key:** Configured ✅
- **Endpoint:** `https://neuropath-openai.openai.azure.com/`
- **Deployment:** `gpt-4`

### ✅ Azure Speech
- **Key:** Configured ✅
- **Region:** `eastus`

### ✅ Azure Vision
- **Key:** Configured ✅
- **Endpoint:** `https://neuropath-vision.cognitiveservices.azure.com/`

Run `python test_azure.py` to verify they work!

---

## 🎯 Quick Start (Copy-Paste)

```bash
# Terminal 1
cd "F:\Imagine Cup"
.venv\Scripts\activate
pip install "numpy<2" --force-reinstall
cd server
python main.py

# Terminal 2 (new window)
cd "F:\Imagine Cup\client"
npm run dev

# Browser
# Open: http://localhost:5173/exercise
```

---

## 🏆 YOU'RE READY!

**Run these now:**
1. Double-click `fix_numpy.bat`
2. Then run `python main.py` in server folder
3. Then run `npm run dev` in client folder
4. Open http://localhost:5173/exercise

**GO WIN IMAGINE CUP! 🎉**
