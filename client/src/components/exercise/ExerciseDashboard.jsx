import { useState, useRef, useEffect } from 'react';
import { Camera, Play, Pause, RotateCcw, Target, TrendingUp, Award, ChevronDown } from 'lucide-react';
import Skeleton3DViewer from './Skeleton3DViewer';
import AICoachAvatar from './AICoachAvatar';
import ExerciseWebcam from './ExerciseWebcam';

/**
 * Professional Exercise Dashboard
 * Split-screen view with 3D visualization and AI coaching
 * INNOVATION: Clinical-grade PT interface with real-time feedback
 */

// Available exercises
const EXERCISES = [
  {
    id: 'arm_raise',
    name: 'Arm Raise (Bicep Curl)',
    description: 'Strengthens arm and shoulder muscles',
    targetReps: 15,
    difficulty: 'Beginner',
    icon: '💪'
  },
  {
    id: 'knee_extension',
    name: 'Knee Extension',
    description: 'Strengthens quadriceps and improves knee stability',
    targetReps: 12,
    difficulty: 'Beginner',
    icon: '🦵'
  }
];

const ExerciseDashboard = ({ 
  patientId,
  onComplete 
}) => {
  const videoRef = useRef(null);
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [showExerciseMenu, setShowExerciseMenu] = useState(false);
  const [isExercising, setIsExercising] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [repCount, setRepCount] = useState(0);
  const [targetReps, setTargetReps] = useState(15);
  const [formScore, setFormScore] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [coachMessage, setCoachMessage] = useState('');
  const [streak, setStreak] = useState(7);
  const [recoveryProgress, setRecoveryProgress] = useState(12);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'patient', 'coach', 'comparison'
  
  // Joint angle metrics
  const [jointMetrics, setJointMetrics] = useState({
    leftShoulder: { current: 0, target: 90, status: 'neutral' },
    rightShoulder: { current: 0, target: 90, status: 'neutral' },
    leftElbow: { current: 0, target: 135, status: 'neutral' },
    rightElbow: { current: 0, target: 135, status: 'neutral' },
  });

  // Handle exercise selection
  const selectExercise = (exercise) => {
    setSelectedExercise(exercise);
    setTargetReps(exercise.targetReps);
    setShowExerciseMenu(false);
    setRepCount(0);
    setFormScore(0);
    setFeedback([]);
  };

  // Start/stop exercise session
  const toggleExercise = () => {
    if (isExercising) {
      setIsExercising(false);
      // Save session data
    } else {
      setIsExercising(true);
      setRepCount(0);
      setFormScore(0);
      setFeedback([]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExerciseMenu && !event.target.closest('.exercise-dropdown')) {
        setShowExerciseMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExerciseMenu]);

  // Initialize camera - removed as ExerciseWebcam handles it

  // Add feedback message
  const addFeedback = (type, message) => {
    const newFeedback = {
      id: Date.now(),
      type, // 'success', 'warning', 'error', 'info'
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setFeedback(prev => [newFeedback, ...prev].slice(0, 5));
  };

  // Handle coaching messages from AI
  const handleCoachingMessage = (message) => {
    setCoachMessage(message);
    addFeedback('info', message);
    
    // Text-to-speech if available
    if ('speechSynthesis' in window && message) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Simulate real-time form analysis
  useEffect(() => {
    if (!isExercising) return;

    const interval = setInterval(() => {
      // Simulate form score changes
      const newScore = Math.min(100, formScore + Math.random() * 10 - 3);
      setFormScore(Math.max(0, newScore));

      // Simulate joint angle updates
      setJointMetrics(prev => ({
        leftShoulder: { ...prev.leftShoulder, current: Math.round(45 + Math.random() * 50) },
        rightShoulder: { ...prev.rightShoulder, current: Math.round(45 + Math.random() * 50) },
        leftElbow: { ...prev.leftElbow, current: Math.round(100 + Math.random() * 40) },
        rightElbow: { ...prev.rightElbow, current: Math.round(100 + Math.random() * 40) },
      }));

      // Generate mock landmarks for 3D visualization (33 pose landmarks)
      const mockLandmarks = Array(33).fill(null).map((_, i) => ({
        x: 0.5 + (Math.random() - 0.5) * 0.3,
        y: 0.3 + (i / 33) * 0.5 + (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.2,
        visibility: 0.8 + Math.random() * 0.2
      }));
      setLandmarks(mockLandmarks);

      // Random feedback
      if (Math.random() < 0.1) {
        generateFeedback();
      }

      // Increment rep count occasionally
      if (Math.random() < 0.05) {
        setRepCount(prev => Math.min(prev + 1, targetReps));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isExercising, formScore]);

  // Determine joint status
  const getJointStatus = (current, target) => {
    const diff = Math.abs(current - target);
    if (diff <= 5) return 'excellent';
    if (diff <= 10) return 'good';
    return 'needsWork';
  };

  // Generate contextual feedback
  const generateFeedback = () => {
    const messages = [
      { type: 'success', text: 'Excellent form! Keep it up!' },
      { type: 'warning', text: 'Lift your elbow 5° higher' },
      { type: 'info', text: 'Maintain steady breathing' },
      { type: 'success', text: 'Perfect alignment on that rep!' },
      { type: 'warning', text: 'Slow down the movement slightly' },
    ];
    const random = messages[Math.floor(Math.random() * messages.length)];
    addFeedback(random.type, random.text);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'good': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'needsWork': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'needsWork': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-b border-blue-500/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NeuroPath AI - Your Digital Physical Therapist
            </h1>
            <p className="text-gray-400 text-sm mt-1">Real-time 3D motion analysis powered by Azure AI</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Exercise Selection Dropdown */}
            <div className="relative exercise-dropdown">
              <button
                onClick={() => setShowExerciseMenu(!showExerciseMenu)}
                disabled={isExercising}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 transition-all ${
                  isExercising ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-2xl">{selectedExercise.icon}</span>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{selectedExercise.name}</div>
                  <div className="text-xs text-gray-400">{selectedExercise.description}</div>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {showExerciseMenu && !isExercising && (
                <div className="absolute top-full mt-2 right-0 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                  <div className="p-2 bg-slate-900/50 border-b border-slate-700">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Select Exercise</p>
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
                            Target: {exercise.targetReps} reps
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

            <div className="text-right">
              <div className="text-sm text-gray-400">Patient ID</div>
              <div className="text-lg font-semibold">{patientId || 'DEMO-001'}</div>
            </div>
            <button
              onClick={toggleExercise}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isExercising
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
              }`}
            >
              {isExercising ? (
                <>
                  <Pause size={20} />
                  <span>Stop Session</span>
                </>
              ) : (
                <>
                  <Play size={20} />
                  <span>Start Session</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-100px)] gap-4 p-6">
        {/* Left Side - Video Feeds */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Split View */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            {/* Patient View with 3D Skeleton */}
            <div className="relative bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/50 backdrop-blur-sm">
              <div className="absolute top-4 left-4 z-10 bg-blue-500/20 backdrop-blur-md px-4 py-2 rounded-lg border border-blue-500/30">
                <span className="text-blue-300 font-medium text-sm flex items-center gap-2">
                  <Camera size={16} />
                  YOUR MOVEMENT
                </span>
              </div>
              
              {/* Webcam with Pose Detection */}
              <ExerciseWebcam
                isActive={isExercising}
                exerciseType={selectedExercise.id}
                onPoseUpdate={(pose) => setLandmarks(pose.keypoints)}
                onRepCount={(count) => setRepCount(count)}
              />
            </div>

            {/* AI Coach View */}
            <div className="relative bg-slate-900/50 rounded-xl overflow-hidden border border-cyan-700/50 backdrop-blur-sm">
              <div className="absolute top-4 left-4 z-10 bg-cyan-500/20 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/30">
                <span className="text-cyan-300 font-medium text-sm flex items-center gap-2">
                  <Target size={16} />
                  AI COACH
                </span>
              </div>
              
              <AICoachAvatar
                exerciseType={selectedExercise.id}
                isPlaying={isExercising}
                landmarks={landmarks}
                onCoachingMessage={handleCoachingMessage}
              />
            </div>
          </div>

          {/* Joint Metrics Bar */}
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(jointMetrics).map(([joint, data]) => (
                <div key={joint} className={`px-4 py-3 rounded-lg border ${getStatusColor(data.status)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium uppercase opacity-70">
                      {joint.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-lg">{getStatusIcon(data.status)}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{data.current}°</span>
                    <span className="text-sm opacity-70">/ {data.target}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Stats & Feedback */}
        <div className="w-96 flex flex-col gap-4">
          {/* Performance Score */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-300 font-medium">Form Score</span>
              <Target className="text-blue-400" size={20} />
            </div>
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {Math.round(formScore)}%
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                style={{ width: `${formScore}%` }}
              />
            </div>
          </div>

          {/* Rep Counter */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-medium">Repetitions</span>
              <RotateCcw className="text-green-400" size={20} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-green-400">{repCount}</span>
              <span className="text-2xl text-gray-500">/ {targetReps}</span>
            </div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: targetReps }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i < repCount ? 'bg-green-500' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quality & Streaks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-orange-400" />
                <span className="text-sm text-gray-300">Recovery</span>
              </div>
              <div className="text-3xl font-bold text-orange-400">+{recoveryProgress}%</div>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-yellow-400" />
                <span className="text-sm text-gray-300">Streak</span>
              </div>
              <div className="text-3xl font-bold text-yellow-400">{streak} days</div>
            </div>
          </div>

          {/* Voice Coaching Display */}
          {coachMessage && (
            <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-sm text-cyan-300 font-medium">AI Coach Speaking</span>
              </div>
              <p className="text-white text-sm">{coachMessage}</p>
            </div>
          )}

          {/* Live Feedback */}
          <div className="flex-1 bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm overflow-hidden flex flex-col">
            <h3 className="text-gray-300 font-medium mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live Feedback
            </h3>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {feedback.length === 0 ? (
                <p className="text-gray-500 text-sm">Start exercising to see real-time feedback...</p>
              ) : (
                feedback.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border transition-all ${
                      item.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-300'
                        : item.type === 'warning'
                        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                        : item.type === 'error'
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    }`}
                  >
                    <p className="text-sm font-medium">{item.message}</p>
                    <p className="text-xs opacity-60 mt-1">{item.timestamp}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDashboard;
