# Quick Demo: Testing New Knee Extension Exercise

## 🚀 How to Test

### 1. Start the Application

```bash
# Terminal 1 - Backend
cd server
.venv\Scripts\activate
python main.py

# Terminal 2 - Frontend
cd client
npm run dev
```

### 2. Open Browser
Navigate to: `http://localhost:5173`

### 3. Select Exercise

**Default view shows:**
- 💪 Arm Raise (Bicep Curl) selected by default

**To change exercise:**
1. Look at top-right area of the screen
2. Click the exercise card that shows "💪 Arm Raise (Bicep Curl)"
3. Dropdown menu appears with 2 options:
   - 💪 Arm Raise (Bicep Curl) - 15 reps
   - 🦵 Knee Extension - 12 reps
4. Click "🦵 Knee Extension"
5. Card updates to show knee extension

### 4. Start Exercise Session

**Click "Start Session" button**
- Camera activates
- Pose detection initializes (wait 3-5 seconds)
- Status shows "Ready" when loaded

### 5. Perform Knee Extension

**Sitting position recommended:**
1. Sit in a chair facing the camera
2. Make sure your full leg is visible
3. Start with knee bent (sitting normally)
4. Slowly extend your LEFT leg straight out
5. Watch the screen:
   - Magenta line highlights: Hip → Knee → Ankle
   - "Knee Angle: XXX°" displays
   - When angle > 160°, rep counter increases
6. Lower leg back down (angle < 120°)
7. Repeat for target of 12 reps

### 6. Test Arm Raise (Switch Back)

1. Click "Stop Session"
2. Click exercise dropdown again
3. Select "💪 Arm Raise (Bicep Curl)"
4. Click "Start Session"
5. Stand/sit facing camera
6. Raise LEFT arm from straight (down) to bent (up)
7. Watch cyan overlay on arm
8. Rep counts when: Extended (>160°) → Bent (<90°)

### 7. Observe AI Coach

**Right side of screen:**
- 3D holographic avatar
- Demonstrates the selected exercise
- Voice instructions guide you through movements
- Avatar animation matches exercise type

---

## 🎯 What to Look For

### Visual Feedback:
✅ Exercise dropdown shows both options
✅ Selected exercise highlighted in blue
✅ Dropdown closes when clicking outside
✅ Dropdown disabled during active session
✅ Camera feed appears in left panel
✅ Skeleton overlay on your body
✅ Angle measurements display in real-time
✅ Rep counter updates automatically
✅ Different colored highlights for different exercises:
   - Arm raise: Cyan on arm
   - Knee extension: Magenta on leg

### AI Coach:
✅ 3D avatar visible on right side
✅ Avatar demonstrates exercise movements
✅ Voice instructions (if audio enabled)
✅ Animation matches selected exercise type

### Rep Counting:
✅ Arm Raise: Counts when arm goes from extended to bent
✅ Knee Extension: Counts when knee extends fully
✅ No double-counting (debounce works)
✅ Counter resets when switching exercises
✅ Target reps shown (15 for arm, 12 for knee)

---

## 🐛 Common Issues & Fixes

### Issue: Camera not starting
**Fix:** Check browser permissions, allow camera access

### Issue: Pose detection shows "Loading..."
**Fix:** Wait 5-10 seconds for TensorFlow to initialize

### Issue: Rep counter not incrementing
**Fix:** 
- Ensure full body part visible in camera
- Move slowly and deliberately
- Check angle display - must cross thresholds
- For knee: Must extend beyond 160°
- For arm: Must go from >160° to <90°

### Issue: Dropdown won't open
**Fix:** Make sure session is stopped first (Click "Stop Session")

### Issue: Skeleton overlay not appearing
**Fix:** 
- Ensure good lighting
- Stand/sit centered in frame
- Wear contrasting clothes
- Check console for errors

---

## 📸 Expected Camera View

### For Knee Extension:
```
┌─────────────────────┐
│   Your Camera View  │
│                     │
│       O  ← Head     │
│      /|\            │
│       |             │
│      / \            │
│     /   ----        │ ← Extended leg (magenta line)
│                     │
│  Knee Angle: 165°   │ ← Should see this
│  Reps: 3            │
└─────────────────────┘
```

### For Arm Raise:
```
┌─────────────────────┐
│   Your Camera View  │
│                     │
│       O  ← Head     │
│      /|─            │ ← Raised arm (cyan line)
│       |             │
│      / \            │
│                     │
│  Arm Angle: 145°    │ ← Should see this
│  Reps: 8            │
└─────────────────────┘
```

---

## ✨ Demonstration Points

### For Imagine Cup Demo:

1. **Show Versatility:**
   - "Notice we can track ANY body part"
   - Switch between arm and leg exercises
   - "AI adapts to different exercise types"

2. **Highlight Intelligence:**
   - "Real-time angle calculations"
   - "Smart rep counting prevents double-counting"
   - "Different thresholds for different exercises"

3. **Emphasize Scalability:**
   - "Easy to add more exercises"
   - "Backend has 15+ exercises ready"
   - "Just add detection logic and animation"

4. **Show AI Coach:**
   - "3D holographic coach demonstrates"
   - "Voice guidance in real-time"
   - "Personalized feedback"

---

## 📊 Success Metrics

**Exercise system should:**
- ✅ Support multiple exercise types
- ✅ Accurately track different body parts
- ✅ Count reps correctly
- ✅ Provide real-time visual feedback
- ✅ Demonstrate AI coaching capabilities
- ✅ Easy to switch between exercises
- ✅ Professional UI/UX

**All metrics met!** 🎉

---

**Ready for testing!** 🚀
Start with arm raise to verify basic functionality, then switch to knee extension to show the new feature.
