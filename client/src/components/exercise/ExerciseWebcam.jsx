import { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import Webcam from 'react-webcam';

/**
 * Exercise Webcam with Pose Detection
 * Shows user's video feed with skeleton overlay
 */
const ExerciseWebcam = ({ isActive, onPoseUpdate, onRepCount, exerciseType = 'arm_raise' }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  
  // Rep counting state
  const repStateRef = useRef({
    isUp: false,
    count: 0,
    lastAngle: 0
  });

  // Initialize pose detector
  useEffect(() => {
    const initDetector = async () => {
      try {
        setStatus('Loading TensorFlow...');
        await tf.ready();
        
        setStatus('Loading pose model...');
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
          minPoseScore: 0.3
        };
        
        const poseDetector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );
        
        setDetector(poseDetector);
        setIsReady(true);
        setStatus('Ready');
      } catch (error) {
        console.error('Failed to load pose detector:', error);
        setStatus(`Error: ${error.message}`);
      }
    };

    initDetector();

    return () => {
      if (detector) {
        detector.dispose();
      }
    };
  }, []);

  // Detect poses continuously
  useEffect(() => {
    if (!detector || !isActive || !isReady) return;

    let animationId;
    const detectPose = async () => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Set canvas size
        if (canvasRef.current) {
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;
        }

        try {
          // Detect poses
          const poses = await detector.estimatePoses(video);
          
          if (poses.length > 0) {
            const pose = poses[0];
            drawPose(pose, canvasRef.current);
            analyzePose(pose);
            
            if (onPoseUpdate) {
              onPoseUpdate(pose);
            }
          }
        } catch (error) {
          console.error('Pose detection error:', error);
        }
      }
      
      animationId = requestAnimationFrame(detectPose);
    };

    detectPose();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [detector, isActive, isReady]);

  // Draw skeleton on canvas
  const drawPose = (pose, canvas) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw keypoints
    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#00ffff';
        ctx.fill();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw skeleton connections
    const connections = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle']
    ];

    connections.forEach(([start, end]) => {
      const startPoint = pose.keypoints.find(kp => kp.name === start);
      const endPoint = pose.keypoints.find(kp => kp.name === end);
      
      if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
  };

  // Analyze pose for rep counting and form
  const analyzePose = (pose) => {
    if (exerciseType === 'arm_raise') {
      analyzeArmRaise(pose);
    } else if (exerciseType === 'knee_extension') {
      analyzeKneeExtension(pose);
    }
  };

  // Analyze arm raise exercise
  const analyzeArmRaise = (pose) => {
    const leftShoulder = pose.keypoints.find(kp => kp.name === 'left_shoulder');
    const leftElbow = pose.keypoints.find(kp => kp.name === 'left_elbow');
    const leftWrist = pose.keypoints.find(kp => kp.name === 'left_wrist');

    if (leftShoulder && leftElbow && leftWrist && 
        leftShoulder.score > 0.3 && leftElbow.score > 0.3 && leftWrist.score > 0.3) {
      
      const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const state = repStateRef.current;
      
      if (angle > 160 && !state.isUp) {
        state.isUp = true;
      } else if (angle < 90 && state.isUp) {
        state.isUp = false;
        state.count++;
        
        if (onRepCount) {
          onRepCount(state.count);
        }
      }
      
      state.lastAngle = angle;
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.font = '24px Arial';
        ctx.fillStyle = '#00ffff';
        ctx.fillText(`Arm Angle: ${Math.round(angle)}°`, leftElbow.x + 20, leftElbow.y);
        ctx.fillText(`Reps: ${state.count}`, 20, 40);
      }
    }
  };

  // Analyze knee extension exercise
  const analyzeKneeExtension = (pose) => {
    const leftHip = pose.keypoints.find(kp => kp.name === 'left_hip');
    const leftKnee = pose.keypoints.find(kp => kp.name === 'left_knee');
    const leftAnkle = pose.keypoints.find(kp => kp.name === 'left_ankle');

    if (leftHip && leftKnee && leftAnkle && 
        leftHip.score > 0.3 && leftKnee.score > 0.3 && leftAnkle.score > 0.3) {
      
      const angle = calculateAngle(leftHip, leftKnee, leftAnkle);
      const state = repStateRef.current;
      
      // Extended knee = high angle (>160°)
      // Bent knee = low angle (<120°)
      if (angle > 160 && !state.isUp) {
        state.isUp = true;
        state.count++;
        
        if (onRepCount) {
          onRepCount(state.count);
        }
      } else if (angle < 120 && state.isUp) {
        state.isUp = false;
      }
      
      state.lastAngle = angle;
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.font = '24px Arial';
        ctx.fillStyle = '#00ffff';
        ctx.fillText(`Knee Angle: ${Math.round(angle)}°`, leftKnee.x + 20, leftKnee.y);
        ctx.fillText(`Reps: ${state.count}`, 20, 40);
        
        // Draw line to highlight knee joint
        ctx.beginPath();
        ctx.moveTo(leftHip.x, leftHip.y);
        ctx.lineTo(leftKnee.x, leftKnee.y);
        ctx.lineTo(leftAnkle.x, leftAnkle.y);
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }
  };

  // Calculate angle between three points
  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - 
                    Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-900">
      {/* Webcam */}
      <Webcam
        ref={webcamRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        mirrored={true}
        videoConstraints={{
          width: 1280,
          height: 720,
          facingMode: 'user'
        }}
      />
      
      {/* Canvas overlay for skeleton */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ transform: 'scaleX(-1)' }}
      />
      
      {/* Status indicator */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
          <span className="text-white text-sm">{status}</span>
        </div>
      </div>
      
      {/* Rep counter */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-lg">
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400">{repStateRef.current.count}</div>
          <div className="text-xs text-gray-300">Reps</div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseWebcam;
