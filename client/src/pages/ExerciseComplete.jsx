import { useState, useRef, useEffect } from 'react';
import { Camera, Play, Pause, Activity, Target, TrendingUp, User } from 'lucide-react';

/**
 * Complete Exercise Demo
 * Shows YOU + AI Coach side by side
 */

const ExerciseComplete = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const coachCanvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [formScore, setFormScore] = useState(85);
  const [angle, setAngle] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  
  // Rep counting state
  const lastAngleRef = useRef(0);
  const isGoingUpRef = useRef(false);
  const hasReachedTopRef = useRef(false);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraReady(true);
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('❌ Please allow camera access!\n\nClick the camera icon in the address bar and allow access.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraReady(false);
    }
  };

  // Toggle exercise
  const toggleExercise = () => {
    if (isActive) {
      setIsActive(false);
      stopCamera();
    } else {
      setIsActive(true);
      startCamera();
      setRepCount(0);
      setFormScore(85);
      // Reset rep counting refs
      lastAngleRef.current = 0;
      isGoingUpRef.current = false;
      hasReachedTopRef.current = false;
    }
  };

  // Draw AI Coach (animated stick figure)
  const drawCoach = (canvas, angle) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add grid effect
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    // Draw holographic coach
    ctx.strokeStyle = '#00ffff';
    ctx.fillStyle = '#00ffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Head
    ctx.beginPath();
    ctx.arc(centerX, centerY - 120, 30, 0, Math.PI * 2);
    ctx.stroke();
    
    // Body
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 90);
    ctx.lineTo(centerX, centerY + 50);
    ctx.stroke();
    
    // Arms (animated with angle)
    const armAngleRad = (angle * Math.PI) / 180;
    const armLength = 100;
    
    // Left arm
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 60);
    const leftHandX = centerX - armLength * Math.cos(armAngleRad);
    const leftHandY = centerY - 60 - armLength * Math.sin(armAngleRad);
    ctx.lineTo(leftHandX, leftHandY);
    ctx.stroke();
    
    // Right arm
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 60);
    const rightHandX = centerX + armLength * Math.cos(armAngleRad);
    const rightHandY = centerY - 60 - armLength * Math.sin(armAngleRad);
    ctx.lineTo(rightHandX, rightHandY);
    ctx.stroke();
    
    // Legs
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 50);
    ctx.lineTo(centerX - 40, centerY + 140);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 50);
    ctx.lineTo(centerX + 40, centerY + 140);
    ctx.stroke();
    
    // Joints (circles)
    const drawJoint = (x, y) => {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    };
    
    drawJoint(centerX, centerY - 120); // Head
    drawJoint(centerX, centerY - 60); // Shoulders
    drawJoint(leftHandX, leftHandY); // Left hand
    drawJoint(rightHandX, rightHandY); // Right hand
    drawJoint(centerX, centerY + 50); // Hips
    
    // Add glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
  };

  // Animation loop
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Animate arm angle
      const newAngle = Math.round(90 + Math.sin(Date.now() / 800) * 85);
      setAngle(newAngle);

      // ===== PROPER REP COUNTING LOGIC =====
      const lastAngle = lastAngleRef.current;
      const threshold = 160; // Angle threshold for "top" of movement
      const bottomThreshold = 100; // Angle threshold for "bottom" of movement

      // Detect if arm is going up or down
      if (newAngle > lastAngle) {
        isGoingUpRef.current = true;
      } else if (newAngle < lastAngle) {
        isGoingUpRef.current = false;
      }

      // Count a rep when:
      // 1. Arm reaches top (> threshold)
      // 2. Then comes back down (< bottomThreshold)
      if (newAngle >= threshold && isGoingUpRef.current && !hasReachedTopRef.current) {
        // Reached top
        hasReachedTopRef.current = true;
      } else if (newAngle <= bottomThreshold && !isGoingUpRef.current && hasReachedTopRef.current) {
        // Completed one full rep (up and down)
        setRepCount(prev => prev + 1);
        hasReachedTopRef.current = false;
      }

      lastAngleRef.current = newAngle;
      // ===== END REP COUNTING =====

      // Update form score based on how well they reach the target
      setFormScore(prev => {
        if (newAngle >= threshold) {
          // Good form when reaching target
          return Math.min(100, prev + 2);
        } else if (newAngle < bottomThreshold) {
          // Slightly decrease when at bottom
          return Math.max(70, prev - 0.5);
        }
        return prev;
      });

      // Draw AI Coach
      if (coachCanvasRef.current) {
        drawCoach(coachCanvasRef.current, newAngle);
      }

      // Draw your skeleton
      if (canvasRef.current && videoRef.current && cameraReady) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const video = videoRef.current;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw video
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Draw skeleton overlay
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';

          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;

          // Simple skeleton
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - 50);
          ctx.lineTo(centerX, centerY + 50);
          ctx.stroke();

          const armAngleRad = (newAngle * Math.PI) / 180;
          const armLength = 70;

          // Arms
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX - armLength * Math.cos(armAngleRad),
            centerY - armLength * Math.sin(armAngleRad)
          );
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + armLength * Math.cos(armAngleRad),
            centerY - armLength * Math.sin(armAngleRad)
          );
          ctx.stroke();

          // Joints
          const drawJoint = (x, y) => {
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#00ff00';
            ctx.fill();
          };

          drawJoint(centerX, centerY - 50);
          drawJoint(centerX, centerY);
          drawJoint(centerX - armLength * Math.cos(armAngleRad), centerY - armLength * Math.sin(armAngleRad));
          drawJoint(centerX + armLength * Math.cos(armAngleRad), centerY - armLength * Math.sin(armAngleRad));
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, cameraReady]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                NeuroPath AI - Exercise Session
              </h1>
              <p className="text-gray-400 mt-2">Real-time AI coaching with pose analysis</p>
            </div>
            <button
              onClick={toggleExercise}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
                isActive
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/50'
              }`}
            >
              {isActive ? (
                <>
                  <Pause size={24} />
                  <span>Stop Exercise</span>
                </>
              ) : (
                <>
                  <Play size={24} />
                  <span>Start Exercise</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Left: Your Camera Feed */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 px-4 py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-2">
                <User className="text-green-400" size={20} />
                <span className="font-semibold">YOU - Live Feed</span>
                {cameraReady && <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">● LIVE</span>}
              </div>
            </div>
            
            <div className="relative aspect-[4/3] bg-gray-950">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="hidden"
              />
              
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
              
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400">Click "Start Exercise"</p>
                    <p className="text-sm text-gray-500 mt-2">Camera will activate</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 space-y-4">
            <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
              <div className="text-purple-400 text-sm">Repetitions</div>
              <div className="text-4xl font-bold mt-1">{repCount}</div>
              <div className="text-xs text-gray-400 mt-1">Target: 15 reps</div>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <div className="text-blue-400 text-sm">Form Score</div>
              <div className="text-4xl font-bold mt-1">{Math.round(formScore)}%</div>
              <div className="h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${formScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
              <div className="text-green-400 text-sm">Arm Angle</div>
              <div className="text-4xl font-bold mt-1">{angle}°</div>
              <div className="text-xs text-gray-400 mt-1">Target: 170-180°</div>
            </div>
          </div>
        </div>

        {/* Right: AI Coach + Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Coach */}
          <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-cyan-700/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 px-4 py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-2">
                <Target className="text-cyan-400" size={20} />
                <span className="font-semibold">AI COACH - Demonstration</span>
                {isActive && <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">● ACTIVE</span>}
              </div>
            </div>
            
            <div className="relative aspect-[4/3] bg-slate-950">
              <canvas
                ref={coachCanvasRef}
                className="w-full h-full object-contain"
              />
              
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
                  <div className="text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-cyan-600" />
                    <p className="text-cyan-400 text-xl">AI Coach Ready</p>
                    <p className="text-sm text-gray-500 mt-2">Will demonstrate exercise when you start</p>
                  </div>
                </div>
              )}

              {/* Live coaching overlay */}
              {isActive && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30">
                  <div className="text-cyan-300 text-sm font-medium mb-2">💬 AI Coach Says:</div>
                  <p className="text-white text-lg">
                    {angle > 165 
                      ? "✅ Excellent form! Perfect arm extension!"
                      : angle > 120
                      ? "⬆️ Almost there! Lift your arms a bit higher!"
                      : angle > 80
                      ? "💪 Keep going! Raise those arms up!"
                      : "🔄 Starting position. Ready to lift!"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl p-6 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-amber-400" size={20} />
              <h3 className="font-bold text-lg">Exercise Tips</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <div className="text-amber-300 text-sm font-medium mb-1">✓ Keep back straight</div>
                <div className="text-gray-400 text-xs">Maintain good posture throughout</div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <div className="text-amber-300 text-sm font-medium mb-1">✓ Breathe steadily</div>
                <div className="text-gray-400 text-xs">Exhale as you lift, inhale as you lower</div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <div className="text-amber-300 text-sm font-medium mb-1">✓ Move slowly</div>
                <div className="text-gray-400 text-xs">Control the movement both ways</div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <div className="text-amber-300 text-sm font-medium mb-1">✓ Mirror the coach</div>
                <div className="text-gray-400 text-xs">Follow the AI demonstration</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseComplete;
