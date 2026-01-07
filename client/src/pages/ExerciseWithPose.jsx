import { useState, useRef, useEffect } from 'react';
import { Camera, Play, Pause, Activity, Target, TrendingUp, User } from 'lucide-react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

/**
 * Exercise with REAL Pose Detection
 * Uses TensorFlow.js MoveNet for actual body tracking
 */

const ExerciseWithPose = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const coachCanvasRef = useRef(null);
  const detectorRef = useRef(null);
  
  const [isActive, setIsActive] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [formScore, setFormScore] = useState(85);
  const [leftArmAngle, setLeftArmAngle] = useState(0);
  const [rightArmAngle, setRightArmAngle] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Rep counting refs
  const lastAngleRef = useRef(0);
  const hasReachedTopRef = useRef(false);

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
      setIsActive(false);
      stopCamera();
    } else {
      if (!detectorRef.current) {
        await initPoseDetector();
      }
      setIsActive(true);
      startCamera();
      setRepCount(0);
      setFormScore(85);
      lastAngleRef.current = 0;
      hasReachedTopRef.current = false;
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
    
    // Animated arms
    const armAngleRad = (angle * Math.PI) / 180;
    const armLength = 100;
    
    // Arms
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
    
    // Legs
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 50);
    ctx.lineTo(centerX - 40, centerY + 140);
    ctx.moveTo(centerX, centerY + 50);
    ctx.lineTo(centerX + 40, centerY + 140);
    ctx.stroke();
    
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
            
            // Draw angle on canvas
            ctx.fillStyle = '#00ff00';
            ctx.font = '20px Arial';
            ctx.fillText(`L: ${leftAngle}°`, leftElbow.x + 10, leftElbow.y);
          }
          
          if (rightShoulder.score > 0.3 && rightElbow.score > 0.3 && rightWrist.score > 0.3) {
            const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
            setRightArmAngle(rightAngle);
            
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                NeuroPath AI - Real Pose Detection
              </h1>
              <p className="text-gray-400 mt-2">AI tracks YOUR actual body movements</p>
            </div>
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
    </div>
  );
};

export default ExerciseWithPose;
