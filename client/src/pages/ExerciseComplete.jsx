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
    ctx.strokeStyle = '#00f0ff'; // healthcare-primary
    ctx.fillStyle = '#00f0ff';
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
    ctx.shadowColor = '#00f0ff';
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
    <div className="min-h-screen bg-healthcare-background text-white p-6 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-healthcare-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-healthcare-secondary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-widest text-glow uppercase">
                NEUROPATH <span className="text-healthcare-primary">AI</span> - Complete
              </h1>
              <p className="text-gray-400 mt-1 uppercase tracking-[0.2em] text-xs font-semibold">Dual-feed kinematic analysis module</p>
            </div>
            <button
              onClick={toggleExercise}
              className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm transition-all sm:w-auto w-full ${isActive
                  ? 'bg-healthcare-error/20 border border-healthcare-error hover:bg-healthcare-error text-white shadow-[0_0_20px_rgba(255,0,60,0.4)]'
                  : 'btn-primary'
                }`}
            >
              {isActive ? (
                <>
                  <Pause size={18} />
                  <span>Terminate</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Initiate Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 relative z-10">
        {/* Left: Your Camera Feed */}
        <div className="lg:col-span-1">
          <div className="card !p-0 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="bg-healthcare-success/10 px-4 py-3 border-b border-healthcare-success/30">
              <div className="flex items-center gap-2">
                <User className="text-healthcare-success drop-shadow-[0_0_5px_rgba(0,255,102,0.8)]" size={18} />
                <span className="font-bold text-white uppercase tracking-wider text-sm">Subject Feed</span>
                {cameraReady && <span className="ml-auto text-[10px] font-bold bg-healthcare-success/20 text-healthcare-success border border-healthcare-success/30 px-2 py-0.5 rounded uppercase tracking-widest shadow-[0_0_8px_rgba(0,255,102,0.3)] animate-pulse">● LIVE</span>}
              </div>
            </div>

            <div className="relative aspect-[4/3] bg-black">
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  <div className="text-center p-6 border border-white/10 rounded-2xl bg-white/5 mx-4">
                    <Camera className="w-12 h-12 mx-auto mb-3 text-healthcare-primary/50" />
                    <p className="text-white font-bold uppercase tracking-widest text-xs mb-1">Sensor Inactive</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">Awaiting initiation.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 space-y-4">
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors group">
              <div className="text-[10px] uppercase font-bold tracking-widest text-healthcare-secondary mb-1">Accumulated Reps</div>
              <div className="text-3xl font-display font-bold text-white group-hover:text-glow transition-all">{repCount}</div>
              <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Target: 15 cycles</div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors group">
              <div className="text-[10px] uppercase font-bold tracking-widest text-healthcare-primary mb-1">Form Precision</div>
              <div className="text-3xl font-display font-bold text-white group-hover:text-glow transition-all mb-3">{Math.round(formScore)}%</div>
              <div className="h-2 bg-black/60 border border-white/10 rounded-full overflow-hidden shadow-inner flex">
                <div
                  className="h-full bg-gradient-to-r from-healthcare-primary to-healthcare-secondary transition-all duration-300 relative"
                  style={{ width: `${formScore}%` }}
                >
                  <div className="absolute inset-0 bg-white/20"></div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors group">
              <div className="text-[10px] uppercase font-bold tracking-widest text-healthcare-success mb-1">Extension Angle</div>
              <div className="text-3xl font-display font-bold text-white group-hover:text-glow transition-all">{angle}°</div>
              <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Target: 170-180°</div>
            </div>
          </div>
        </div>

        {/* Right: AI Coach + Feedback */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Coach */}
          <div className="card !p-0 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="bg-healthcare-primary/10 px-5 py-3 border-b border-healthcare-primary/30">
              <div className="flex items-center gap-3">
                <Target className="text-healthcare-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" size={18} />
                <span className="font-bold text-white uppercase tracking-wider text-sm">System Simulation</span>
                {isActive && <span className="ml-auto text-[10px] font-bold bg-healthcare-primary/20 text-healthcare-primary border border-healthcare-primary/30 px-2 py-0.5 rounded uppercase tracking-widest shadow-[0_0_8px_rgba(0,240,255,0.3)] animate-pulse">● ACTIVE</span>}
              </div>
            </div>

            <div className="relative aspect-[4/3] bg-black">
              <canvas
                ref={coachCanvasRef}
                className="w-full h-full object-contain"
              />

              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  <div className="text-center p-6 border border-white/10 rounded-2xl bg-white/5">
                    <Target className="w-12 h-12 mx-auto mb-3 text-healthcare-secondary/50" />
                    <p className="text-white font-bold uppercase tracking-widest text-sm mb-2">Simulation Standby</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest leading-relaxed">Awaiting module initialization.</p>
                  </div>
                </div>
              )}

              {/* Live coaching overlay */}
              {isActive && (
                <div className="absolute bottom-6 left-6 right-6 bg-black/70 backdrop-blur-xl rounded-xl p-5 border border-healthcare-primary/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <div className="text-[10px] text-healthcare-primary uppercase tracking-widest font-bold mb-2 shadow-[0_0_5px_rgba(0,240,255,0.5)]">💬 System Directive:</div>
                  <p className="text-white font-display font-medium text-lg text-glow tracking-wide">
                    {angle > 165
                      ? "✅ Optimal execution. Perfect extension detected!"
                      : angle > 120
                        ? "⬆️ Increase elevation magnitude. Keep going."
                        : angle > 80
                          ? "💪 Maintain kinetic flow. Raise arms."
                          : "🔄 Nominal starting position. Ready for cycle."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="card !p-5 border-healthcare-warning/30 shadow-[0_0_15px_rgba(255,184,0,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-orange-500 drop-shadow-[0_0_5px_rgba(255,165,0,0.8)]" size={18} />
              <h3 className="font-display font-bold text-white uppercase tracking-wider text-sm text-glow">Protocol Guidelines</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                <div className="text-[11px] text-healthcare-success uppercase tracking-widest font-bold mb-1 shadow-[0_0_2px_rgba(0,255,102,0.8)]">✓ Maintain Alignment</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Strict spinal posture required</div>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                <div className="text-[11px] text-healthcare-success uppercase tracking-widest font-bold mb-1 shadow-[0_0_2px_rgba(0,255,102,0.8)]">✓ Resp. Sync</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Exhale (rise), Inhale (fall)</div>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                <div className="text-[11px] text-healthcare-success uppercase tracking-widest font-bold mb-1 shadow-[0_0_2px_rgba(0,255,102,0.8)]">✓ Kinetic Control</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Constant velocity both ways</div>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                <div className="text-[11px] text-healthcare-success uppercase tracking-widest font-bold mb-1 shadow-[0_0_2px_rgba(0,255,102,0.8)]">✓ Object Mirroring</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Follow simulation exactly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseComplete;
