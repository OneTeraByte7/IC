import { useState, useRef, useEffect } from 'react';
import { Camera, Play, Pause, Activity, Target, TrendingUp, User, ChevronDown, UserCircle, History, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { useAuth } from '../hooks/useAuth';
import {
  startExerciseSession,
  updateExerciseSession,
  completeExerciseSession,
  saveExerciseMetrics,
  updateDailyProgress,
  getUserExerciseSessions
} from '../services/exerciseService';

/**
 * Exercise with REAL Pose Detection
 * Uses TensorFlow.js MoveNet for actual body tracking
 */

// Available exercises
const EXERCISES = [
  {
    id: 'arm_raise',
    name: 'Arm Raise (Bicep Curl)',
    description: 'Strengthens arm and shoulder muscles',
    targetReps: 15,
    difficulty: 'Beginner',
    icon: '💪',
    joints: ['shoulder', 'elbow', 'wrist']
  },
  {
    id: 'knee_extension',
    name: 'Knee Extension',
    description: 'Strengthens quadriceps and improves knee stability',
    targetReps: 12,
    difficulty: 'Beginner',
    icon: '🦵',
    joints: ['hip', 'knee', 'ankle']
  }
];

const ExerciseWithPose = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const coachCanvasRef = useRef(null);
  const detectorRef = useRef(null);

  // Exercise state
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [showExerciseMenu, setShowExerciseMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [sessionId, setSessionId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [formScore, setFormScore] = useState(85);
  const [leftArmAngle, setLeftArmAngle] = useState(0);
  const [rightArmAngle, setRightArmAngle] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [allAngles, setAllAngles] = useState([]);

  // Rep counting refs
  const lastAngleRef = useRef(0);
  const hasReachedTopRef = useRef(false);
  const metricsIntervalRef = useRef(null);

  // Load session history
  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        try {
          const sessions = await getUserExerciseSessions(user.id, 10);
          setSessionHistory(sessions);
        } catch (error) {
          console.error('Failed to load session history:', error);
        }
      }
    };
    loadHistory();
  }, [user]);

  // Handle exercise selection
  const selectExercise = (exercise) => {
    if (!isActive) {
      setSelectedExercise(exercise);
      setShowExerciseMenu(false);
      setRepCount(0);
      setFormScore(85);
    }
  };

  // Calculate angle between 3 points
  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return Math.round(angle);
  };

  // Initialize pose detector
  const initPoseDetector = async () => {
    try {
      setIsLoading(true);

      // Initialize TensorFlow backend first
      await tf.setBackend('webgl');
      await tf.ready();

      console.log('TensorFlow backend initialized:', tf.getBackend());

      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
      };
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      detectorRef.current = detector;
      setIsLoading(false);
      console.log('Pose detector loaded successfully!');
      return detector;
    } catch (error) {
      console.error('Failed to load pose detector:', error);
      setIsLoading(false);
      alert('❌ Failed to load AI model. Please refresh the page.');
      return null;
    }
  };

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
      alert('❌ Please allow camera access!');
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
  const toggleExercise = async () => {
    if (isActive) {
      // Stop exercise and save to database
      await stopExercise();
    } else {
      // Start new exercise session
      await startExercise();
    }
  };

  // Start exercise session
  const startExercise = async () => {
    try {
      if (!detectorRef.current) {
        await initPoseDetector();
      }

      // Create session in database with selected exercise
      const session = await startExerciseSession(user.id, selectedExercise.id);
      setSessionId(session.id);
      setSessionStartTime(new Date());

      setIsActive(true);
      startCamera();
      setRepCount(0);
      setFormScore(85);
      setAllAngles([]);
      lastAngleRef.current = 0;
      hasReachedTopRef.current = false;

      // Start saving metrics every 5 seconds
      metricsIntervalRef.current = setInterval(async () => {
        if (leftArmAngle > 0 || rightArmAngle > 0) {
          try {
            await saveExerciseMetrics(session.id, {
              leftArmAngle,
              rightArmAngle,
              formScore,
              landmarks: null
            });
          } catch (error) {
            console.error('Error saving metrics:', error);
          }
        }
      }, 5000);

      console.log('✅ Exercise session started with:', selectedExercise.name, session.id);
    } catch (error) {
      console.error('Failed to start exercise:', error);
      alert('Failed to start session. Please try again.');
    }
  };

  // Stop exercise session
  const stopExercise = async () => {
    try {
      setIsActive(false);
      stopCamera();

      // Clear metrics interval
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }

      if (sessionId && sessionStartTime) {
        // Calculate session statistics
        const avgAngle = allAngles.length > 0
          ? allAngles.reduce((a, b) => a + b, 0) / allAngles.length
          : 0;
        const maxAngle = allAngles.length > 0 ? Math.max(...allAngles) : 0;
        const minAngle = allAngles.length > 0 ? Math.min(...allAngles) : 0;

        // Complete session in database
        await completeExerciseSession(sessionId, {
          start_time: sessionStartTime.toISOString(),
          total_reps: repCount,
          form_score: formScore,
          avg_angle: avgAngle,
          max_angle: maxAngle,
          min_angle: minAngle
        });

        // Update daily progress
        await updateDailyProgress(user.id, {
          total_reps: repCount,
          duration_seconds: Math.floor((new Date() - sessionStartTime) / 1000),
          form_score: formScore
        });

        console.log('✅ Exercise session completed');
        alert(`🎉 Session Complete!\n\n${repCount} reps completed\nForm Score: ${formScore}%`);
      }

      setSessionId(null);
      setSessionStartTime(null);
    } catch (error) {
      console.error('Failed to stop exercise:', error);
    }
  };

  // Draw skeleton on canvas
  const drawSkeleton = (ctx, keypoints) => {
    // Define connections between keypoints
    const connections = [
      [5, 6], // shoulders
      [5, 7], [7, 9], // left arm
      [6, 8], [8, 10], // right arm
      [5, 11], [6, 12], // torso
      [11, 12], // hips
      [11, 13], [13, 15], // left leg
      [12, 14], [14, 16], // right leg
    ];

    // Draw connections
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    connections.forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];
      if (kp1.score > 0.3 && kp2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });

    // Draw keypoints
    keypoints.forEach(kp => {
      if (kp.score > 0.3) {
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  // Draw AI Coach
  const drawCoach = (canvas, angle) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid effect
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Holographic coach
    ctx.strokeStyle = '#00ffff';
    ctx.fillStyle = '#00ffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

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

    // Draw based on exercise type
    if (selectedExercise.id === 'arm_raise') {
      // Animated arms for arm raise
      const armAngleRad = (angle * Math.PI) / 180;
      const armLength = 100;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 60);
      ctx.lineTo(
        centerX - armLength * Math.cos(armAngleRad),
        centerY - 60 - armLength * Math.sin(armAngleRad)
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 60);
      ctx.lineTo(
        centerX + armLength * Math.cos(armAngleRad),
        centerY - 60 - armLength * Math.sin(armAngleRad)
      );
      ctx.stroke();

      // Static legs
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 50);
      ctx.lineTo(centerX - 40, centerY + 140);
      ctx.moveTo(centerX, centerY + 50);
      ctx.lineTo(centerX + 40, centerY + 140);
      ctx.stroke();

    } else if (selectedExercise.id === 'knee_extension') {
      // Static arms
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 60);
      ctx.lineTo(centerX - 80, centerY - 40);
      ctx.moveTo(centerX, centerY - 60);
      ctx.lineTo(centerX + 80, centerY - 40);
      ctx.stroke();

      // Animated leg for knee extension (seated position)
      const legAngle = angle / 2; // Scale down for leg movement
      const legAngleRad = (legAngle * Math.PI) / 180;
      const legLength = 90;

      // Left leg - animated (extending forward)
      ctx.beginPath();
      ctx.moveTo(centerX - 20, centerY + 50);
      ctx.lineTo(
        centerX - 20 + legLength * Math.cos(legAngleRad - Math.PI / 2),
        centerY + 50 + legLength * Math.sin(legAngleRad - Math.PI / 2)
      );
      ctx.stroke();

      // Right leg - static
      ctx.beginPath();
      ctx.moveTo(centerX + 20, centerY + 50);
      ctx.lineTo(centerX + 20, centerY + 140);
      ctx.stroke();
    }

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
  };

  // Main animation loop
  useEffect(() => {
    if (!isActive || !cameraReady || !detectorRef.current) return;

    let animationId;
    const detectPose = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === 4) {
        const poses = await detectorRef.current.estimatePoses(video);

        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (poses.length > 0) {
          const keypoints = poses[0].keypoints;

          // Draw skeleton
          drawSkeleton(ctx, keypoints);

          // Calculate angles
          const leftShoulder = keypoints[5];
          const leftElbow = keypoints[7];
          const leftWrist = keypoints[9];
          const rightShoulder = keypoints[6];
          const rightElbow = keypoints[8];
          const rightWrist = keypoints[10];

          if (leftShoulder.score > 0.3 && leftElbow.score > 0.3 && leftWrist.score > 0.3) {
            const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
            setLeftArmAngle(leftAngle);
            setAllAngles(prev => [...prev, leftAngle]);

            // Draw angle on canvas
            ctx.fillStyle = '#00ff00';
            ctx.font = '20px Arial';
            ctx.fillText(`L: ${leftAngle}°`, leftElbow.x + 10, leftElbow.y);
          }

          if (rightShoulder.score > 0.3 && rightElbow.score > 0.3 && rightWrist.score > 0.3) {
            const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
            setRightArmAngle(rightAngle);
            setAllAngles(prev => [...prev, rightAngle]);

            ctx.fillStyle = '#00ff00';
            ctx.font = '20px Arial';
            ctx.fillText(`R: ${rightAngle}°`, rightElbow.x + 10, rightElbow.y);
          }

          // Rep counting based on average arm angle
          const avgAngle = (leftArmAngle + rightArmAngle) / 2;

          // Count rep when arms extend (angle increases to ~160+) then return
          if (avgAngle >= 160 && !hasReachedTopRef.current) {
            hasReachedTopRef.current = true;
          } else if (avgAngle <= 100 && hasReachedTopRef.current) {
            setRepCount(prev => prev + 1);
            hasReachedTopRef.current = false;
          }

          // Update form score
          setFormScore(prev => {
            if (avgAngle >= 160) return Math.min(100, prev + 1);
            return Math.max(70, prev - 0.1);
          });
        }
      }

      animationId = requestAnimationFrame(detectPose);
    };

    detectPose();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isActive, cameraReady, leftArmAngle, rightArmAngle]);

  // Draw AI coach animation
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const targetAngle = Math.round(90 + Math.sin(Date.now() / 800) * 85);
      if (coachCanvasRef.current) {
        drawCoach(coachCanvasRef.current, targetAngle);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isActive]);

  // Pre-initialize TensorFlow on component mount
  useEffect(() => {
    const initTF = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('✅ TensorFlow backend pre-initialized:', tf.getBackend());
      } catch (error) {
        console.error('TensorFlow initialization error:', error);
      }
    };
    initTF();
  }, []);

  return (
    <div className="min-h-screen bg-healthcare-background text-white p-6 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-healthcare-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-healthcare-secondary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-healthcare-primary/30 blur-xl rounded-full"></div>
                <img
                  src="/images/logo.png"
                  alt="NeuroPath AI Logo"
                  className="w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] relative z-10"
                />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white tracking-widest text-glow uppercase">
                  NEUROPATH <span className="text-healthcare-primary">AI</span>
                </h1>
                <p className="text-gray-400 mt-1 uppercase tracking-[0.2em] text-xs font-semibold">Real-Time Kinematic Tracking</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 w-full md:w-auto">
              {/* Exercise Selection */}
              <div className="relative exercise-dropdown z-50">
                <button
                  onClick={() => setShowExerciseMenu(!showExerciseMenu)}
                  disabled={isActive}
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${isActive ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <span className="text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">{selectedExercise.icon}</span>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-bold text-white uppercase tracking-wider">{selectedExercise.name}</div>
                    <div className="text-xs text-healthcare-primary font-semibold tracking-widest uppercase">Target: {selectedExercise.targetReps} reps</div>
                  </div>
                  <ChevronDown size={16} className="text-gray-400 ml-2" />
                </button>

                {/* Exercise Dropdown */}
                {showExerciseMenu && !isActive && (
                  <div className="absolute top-16 right-0 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden z-[10001]">
                    <div className="p-3 bg-white/5 border-b border-white/10">
                      <p className="text-xs text-healthcare-primary font-bold uppercase tracking-widest flex items-center gap-2">
                        <Dumbbell size={14} />
                        Select Protocol
                      </p>
                    </div>
                    {EXERCISES.map((exercise) => (
                      <button
                        key={exercise.id}
                        onClick={() => selectExercise(exercise)}
                        className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-white/10 transition-colors text-left ${selectedExercise.id === exercise.id ? 'bg-healthcare-primary/10 border-l-2 border-healthcare-primary' : ''
                          }`}
                      >
                        <span className="text-3xl drop-shadow-md">{exercise.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-white uppercase tracking-wider text-sm">{exercise.name}</div>
                          <div className="text-xs text-gray-400 mt-1.5 leading-relaxed">{exercise.description}</div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-healthcare-secondary/20 text-healthcare-secondary border border-healthcare-secondary/30">
                              {exercise.difficulty}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {exercise.targetReps} reps target
                            </span>
                          </div>
                        </div>
                        {selectedExercise.id === exercise.id && (
                          <div className="w-2 h-2 rounded-full bg-healthcare-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative profile-dropdown z-50">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <UserCircle size={20} className="text-healthcare-primary" />
                  <span className="text-sm font-bold uppercase tracking-wider hidden sm:block">{user?.email?.split('@')[0] || 'Subject'}</span>
                  <ChevronDown size={16} className="text-gray-400 ml-1" />
                </button>

                {showProfileMenu && (
                  <div className="absolute top-16 right-0 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden z-[10001]">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/10 transition-colors text-left"
                    >
                      <UserCircle size={18} className="text-healthcare-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
                      <span className="text-sm font-bold uppercase tracking-wider text-white">My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/10 transition-colors text-left"
                    >
                      <Activity size={18} className="text-healthcare-success drop-shadow-[0_0_5px_rgba(0,255,102,0.8)]" />
                      <span className="text-sm font-bold uppercase tracking-wider text-white">Dashboard</span>
                    </button>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/10 transition-colors text-left border-t border-white/5"
                    >
                      <History size={18} className="text-healthcare-secondary drop-shadow-[0_0_5px_rgba(112,0,255,0.8)]" />
                      <span className="text-sm font-bold uppercase tracking-wider text-white">Session History</span>
                      <span className="ml-auto text-[10px] bg-healthcare-secondary/20 border border-healthcare-secondary/30 text-healthcare-secondary px-2 py-0.5 rounded font-bold shadow-[0_0_5px_rgba(112,0,255,0.2)]">
                        {sessionHistory.length}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Start/Stop Button */}
              <button
                onClick={toggleExercise}
                disabled={isLoading}
                className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm transition-all sm:w-auto w-full ${isActive
                  ? 'bg-healthcare-error/20 border border-healthcare-error hover:bg-healthcare-error text-white shadow-[0_0_20px_rgba(255,0,60,0.4)]'
                  : 'btn-primary'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Initializing...</span>
                  </>
                ) : isActive ? (
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 relative z-10">
        {/* Your Camera with Real Pose Detection */}
        <div className="lg:col-span-1">
          <div className="card !p-0 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="bg-healthcare-success/10 px-5 py-3 border-b border-healthcare-success/30">
              <div className="flex items-center gap-3">
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
                  <div className="text-center p-6 border border-white/10 rounded-2xl bg-white/5">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-healthcare-primary/50" />
                    <p className="text-white font-bold uppercase tracking-widest text-sm mb-2">Camera Inactive</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest leading-relaxed">System awaiting<br />"Initiate Link" command</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 space-y-5">
            <div className="card !p-5 border-healthcare-secondary/30 shadow-[0_0_15px_rgba(112,0,255,0.1)] hover:bg-healthcare-secondary/10 transition-colors group">
              <div className="text-healthcare-secondary text-xs uppercase tracking-widest font-bold mb-2 drop-shadow-[0_0_5px_rgba(112,0,255,0.5)]">Accumulated Reps</div>
              <div className="text-5xl font-display font-bold text-white group-hover:text-glow transition-all">{repCount}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-semibold">Target: {selectedExercise.targetReps} reps</div>
            </div>

            <div className="card !p-5 border-healthcare-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:bg-healthcare-primary/10 transition-colors group">
              <div className="text-healthcare-primary text-xs uppercase tracking-widest font-bold mb-2 drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">Form Precision</div>
              <div className="text-4xl font-display font-bold text-white group-hover:text-glow transition-all mb-4">{Math.round(formScore)}%</div>
              <div className="h-3 bg-black/50 border border-white/10 rounded-full overflow-hidden shadow-inner flex">
                <div
                  className="h-full bg-gradient-to-r from-healthcare-primary to-healthcare-secondary transition-all duration-300 relative"
                  style={{ width: `${formScore}%` }}
                >
                  <div className="absolute inset-0 bg-white/20"></div>
                </div>
              </div>
            </div>

            <div className="card !p-5 border-healthcare-accent/30 shadow-[0_0_15px_rgba(0,255,102,0.1)] hover:bg-healthcare-accent/10 transition-colors group">
              <div className="text-healthcare-accent text-xs uppercase tracking-widest font-bold mb-4 drop-shadow-[0_0_5px_rgba(0,255,102,0.5)]">Kinematic Angles</div>
              <div className="flex justify-between items-center">
                <div className="bg-black/40 border border-white/10 p-3 rounded-lg w-[45%] text-center">
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Left Joint</div>
                  <div className="text-2xl font-display font-bold text-white group-hover:text-glow transition-all">{leftArmAngle}°</div>
                </div>
                <div className="bg-black/40 border border-white/10 p-3 rounded-lg w-[45%] text-center">
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Right Joint</div>
                  <div className="text-2xl font-display font-bold text-white group-hover:text-glow transition-all">{rightArmAngle}°</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Coach */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card !p-0 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="bg-healthcare-primary/10 px-5 py-3 border-b border-healthcare-primary/20">
              <div className="flex items-center gap-3">
                <Target className="text-healthcare-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" size={18} />
                <span className="font-bold text-white uppercase tracking-wider text-sm">Instructor Hologram</span>
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
                  <div className="text-center p-8 border border-white/10 rounded-2xl bg-white/5 max-w-sm">
                    <Target className="w-16 h-16 mx-auto mb-6 text-healthcare-primary opacity-50 drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
                    <p className="text-white font-display font-bold uppercase tracking-widest text-xl mb-3 text-glow">Module Standby</p>
                    <p className="text-sm text-gray-400 uppercase tracking-widest leading-relaxed font-semibold">Holographic instructor will initialize upon link activation.</p>
                  </div>
                </div>
              )}

              {isActive && (
                <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl rounded-xl p-5 border border-healthcare-primary/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-healthcare-primary mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-healthcare-primary animate-pulse shadow-[0_0_5px_rgba(0,240,255,0.8)]"></div>
                    System Feedback
                  </div>
                  <p className="text-white font-bold tracking-wide text-lg sm:text-xl drop-shadow-md">
                    {Math.max(leftArmAngle, rightArmAngle) > 160
                      ? "✅ Target trajectory reached. Good extension."
                      : Math.max(leftArmAngle, rightArmAngle) > 120
                        ? "⬆️ Increase extension angle. Push further."
                        : "⚡ Awaiting kinematic actuation. Raise limbs."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="card !p-6 border-healthcare-secondary/30 shadow-[0_0_15px_rgba(112,0,255,0.1)] flex-1">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-healthcare-secondary drop-shadow-[0_0_5px_rgba(112,0,255,0.8)]" size={20} />
              <h3 className="font-display font-bold text-white uppercase tracking-wider text-xl text-glow">Protocol Guidelines</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-healthcare-primary text-[11px] font-bold uppercase tracking-widest mb-2 drop-shadow-[0_0_3px_rgba(0,240,255,0.5)]">Positioning</div>
                <div className="text-gray-300 text-sm font-semibold">Maintain full visibility within the sensor frame.</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-healthcare-secondary text-[11px] font-bold uppercase tracking-widest mb-2 drop-shadow-[0_0_3px_rgba(112,0,255,0.5)]">Extension</div>
                <div className="text-gray-300 text-sm font-semibold">Ensure joint angle reaches 160° for cycle validation.</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-healthcare-accent text-[11px] font-bold uppercase tracking-widest mb-2 drop-shadow-[0_0_3px_rgba(0,255,102,0.5)]">Control</div>
                <div className="text-gray-300 text-sm font-semibold">Execute movements with consistent, steady velocity.</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-orange-500 text-[11px] font-bold uppercase tracking-widest mb-2 drop-shadow-[0_0_3px_rgba(255,165,0,0.5)]">Synchronization</div>
                <div className="text-gray-300 text-sm font-semibold">Mirror the holographic instructor's exact tempo.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session History Sidebar */}
      {showHistory && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10002]" onClick={() => setShowHistory(false)}></div>
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-black border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[10003] overflow-y-auto flex flex-col">
            <div className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-white/10 p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <History size={20} className="text-healthcare-secondary drop-shadow-[0_0_5px_rgba(112,0,255,0.8)]" />
                <h3 className="font-display font-bold text-white uppercase tracking-wider text-glow">Logs</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1">
              {sessionHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <Activity className="w-16 h-16 text-white/10 mb-5" />
                  <p className="text-gray-300 font-bold text-lg uppercase tracking-widest mb-2">No Records</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Initiate a session to encode data.</p>
                </div>
              ) : (
                sessionHistory.map((session, index) => (
                  <div
                    key={session.id || index}
                    className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-healthcare-primary group-hover:text-glow transition-colors bg-healthcare-primary/10 px-2 py-1 rounded inline-block">
                        {session.exercise_type?.replace('_', ' ') || 'Protocol'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(session.start_time).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                        <div className="text-xl font-display font-bold text-healthcare-secondary truncate">
                          {session.total_reps || 0}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Reps</div>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                        <div className="text-xl font-display font-bold text-healthcare-primary truncate">
                          {session.form_score || 0}%
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Form</div>
                      </div>
                      <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                        <div className="text-xl font-display font-bold text-healthcare-accent truncate">
                          {Math.round((session.duration_seconds || 0) / 60)}m
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Time</div>
                      </div>
                    </div>

                    {session.completion_status && (
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Status:</span>
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded border ${session.completion_status === 'completed'
                          ? 'bg-healthcare-success/10 text-healthcare-success border-healthcare-success/30 shadow-[0_0_10px_rgba(0,255,102,0.1)]'
                          : 'bg-healthcare-warning/10 text-healthcare-warning border-healthcare-warning/30 shadow-[0_0_10px_rgba(255,184,0,0.1)]'
                          }`}>
                          {session.completion_status}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExerciseWithPose;
