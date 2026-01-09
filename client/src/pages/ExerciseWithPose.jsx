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
    
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid effect
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
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
        centerX - 20 + legLength * Math.cos(legAngleRad - Math.PI/2),
        centerY + 50 + legLength * Math.sin(legAngleRad - Math.PI/2)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white p-6 relative">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 relative z-[10000]">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/images/logo.png" 
                alt="NeuroPath AI Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NeuroPath AI - Real Pose Detection
                </h1>
                <p className="text-gray-400 mt-2">AI tracks YOUR actual body movements</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Exercise Selection */}
              <div className="relative exercise-dropdown">
                <button
                  onClick={() => setShowExerciseMenu(!showExerciseMenu)}
                  disabled={isActive}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 transition-all ${
                    isActive ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="text-2xl">{selectedExercise.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">{selectedExercise.name}</div>
                    <div className="text-xs text-gray-400">Target: {selectedExercise.targetReps} reps</div>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {/* Exercise Dropdown */}
                {showExerciseMenu && !isActive && (
                  <div className="fixed top-20 right-6 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-[10001]">
                    <div className="p-2 bg-slate-900/50 border-b border-slate-700">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide flex items-center gap-2">
                        <Dumbbell size={14} />
                        Select Exercise
                      </p>
                    </div>
                    {EXERCISES.map((exercise) => (
                      <button
                        key={exercise.id}
                        onClick={() => selectExercise(exercise)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors text-left ${
                          selectedExercise.id === exercise.id ? 'bg-blue-600/20 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <span className="text-3xl">{exercise.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-white">{exercise.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{exercise.description}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                              {exercise.difficulty}
                            </span>
                            <span className="text-xs text-gray-500">
                              {exercise.targetReps} reps
                            </span>
                          </div>
                        </div>
                        {selectedExercise.id === exercise.id && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 transition-all"
                >
                  <UserCircle size={24} className="text-blue-400" />
                  <span className="text-sm font-medium">{user?.email || 'User'}</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {showProfileMenu && (
                  <div className="fixed top-20 right-6 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-[10001]">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <UserCircle size={18} className="text-blue-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <Activity size={18} className="text-green-400" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <History size={18} className="text-purple-400" />
                      <span>Session History</span>
                      <span className="ml-auto text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
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
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
                  isActive
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/50'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Loading AI...</span>
                  </>
                ) : isActive ? (
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Your Camera with Real Pose Detection */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 px-4 py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-2">
                <User className="text-green-400" size={20} />
                <span className="font-semibold">YOU - Real Pose Detection</span>
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
                    <p className="text-sm text-gray-500 mt-2">AI will track your body</p>
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
              <div className="text-xs text-gray-400 mt-1">Target: {selectedExercise.targetReps} reps</div>
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
              <div className="text-green-400 text-sm mb-2">Arm Angles</div>
              <div className="flex justify-between">
                <div>
                  <div className="text-xs text-gray-400">Left</div>
                  <div className="text-2xl font-bold">{leftArmAngle}°</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Right</div>
                  <div className="text-2xl font-bold">{rightArmAngle}°</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Coach */}
        <div className="lg:col-span-2 space-y-6">
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
                    <p className="text-sm text-gray-500 mt-2">Will demonstrate when you start</p>
                  </div>
                </div>
              )}

              {isActive && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-cyan-500/30">
                  <div className="text-cyan-300 text-sm font-medium mb-2">💬 AI Coach:</div>
                  <p className="text-white text-lg">
                    {Math.max(leftArmAngle, rightArmAngle) > 160
                      ? "✅ Perfect! Great arm extension!"
                      : Math.max(leftArmAngle, rightArmAngle) > 120
                      ? "⬆️ Almost there! Extend more!"
                      : "💪 Raise your arms up!"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl p-6 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-amber-400" size={20} />
              <h3 className="font-bold text-lg">Exercise Tips</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <div className="text-amber-300 text-sm font-medium">✓ Stand in frame</div>
                <div className="text-gray-400 text-xs">Make sure AI can see you</div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <div className="text-amber-300 text-sm font-medium">✓ Extend arms fully</div>
                <div className="text-gray-400 text-xs">Reach 160°+ for a rep</div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <div className="text-amber-300 text-sm font-medium">✓ Control movement</div>
                <div className="text-gray-400 text-xs">Slow and steady wins</div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                <div className="text-amber-300 text-sm font-medium">✓ Mirror coach</div>
                <div className="text-gray-400 text-xs">Follow the demonstration</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session History Sidebar */}
      {showHistory && (
        <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 overflow-y-auto">
          <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={20} className="text-purple-400" />
              <h3 className="font-bold text-lg">Session History</h3>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3">
            {sessionHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">No sessions yet</p>
                <p className="text-sm text-gray-500 mt-1">Start exercising to see your history</p>
              </div>
            ) : (
              sessionHistory.map((session, index) => (
                <div
                  key={session.id || index}
                  className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">
                      {session.exercise_type?.replace('_', ' ') || 'Exercise'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(session.start_time).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-purple-500/10 rounded p-2">
                      <div className="text-xl font-bold text-purple-400">
                        {session.total_reps || 0}
                      </div>
                      <div className="text-xs text-gray-400">Reps</div>
                    </div>
                    <div className="bg-blue-500/10 rounded p-2">
                      <div className="text-xl font-bold text-blue-400">
                        {session.form_score || 0}%
                      </div>
                      <div className="text-xs text-gray-400">Form</div>
                    </div>
                    <div className="bg-green-500/10 rounded p-2">
                      <div className="text-xl font-bold text-green-400">
                        {Math.round((session.duration_seconds || 0) / 60)}m
                      </div>
                      <div className="text-xs text-gray-400">Time</div>
                    </div>
                  </div>

                  {session.completion_status && (
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        session.completion_status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
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
      )}
    </div>
  );
};

export default ExerciseWithPose;
