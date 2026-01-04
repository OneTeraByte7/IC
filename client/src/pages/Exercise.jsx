import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { exerciseService } from '../services/patientService'
import { Play, Square, Camera, AlertCircle, CheckCircle } from 'lucide-react'

const Exercise = () => {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [patientId, setPatientId] = useState('')
  const [exerciseType, setExerciseType] = useState('arm_raise')
  const [feedback, setFeedback] = useState(null)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    angle: 0,
    reps: 0,
    max_angle: 0,
    feedback: 'Position yourself in frame',
    pose_detected: false
  })
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const wsRef = useRef(null)

  const exerciseTypes = [
    { value: 'arm_raise', label: 'Arm Raise Exercise' },
    { value: 'leg_lift', label: 'Leg Lift Exercise' },
    { value: 'shoulder_rotation', label: 'Shoulder Rotation' },
    { value: 'knee_bend', label: 'Knee Bend Exercise' },
  ]

  useEffect(() => {
    return () => {
      stopCamera()
      closeWebSocket()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://127.0.0.1:8000/api/exercise/ws/exercise')
    
    ws.onopen = () => {
      console.log('WebSocket connected for ML processing')
      setFeedback({ type: 'success', message: 'ML processing active!' })
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      // Update metrics from backend
      if (data.metrics) {
        setMetrics(data.metrics)
      }

      // Display processed frame with ML annotations
      if (data.frame && canvasRef.current) {
        const img = new Image()
        img.onload = () => {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
        }
        img.src = 'data:image/jpeg;base64,' + data.frame
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('ML processing connection failed')
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    wsRef.current = ws
  }

  const closeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  const startSession = async () => {
    if (!patientId) {
      setError('Please enter a patient ID')
      return
    }

    try {
      setError(null)
      const response = await exerciseService.startSession({
        patient_id: patientId,
        exercise_type: exerciseType,
      })
      
      setSessionId(response.session_id)
      setIsSessionActive(true)
      setFeedback({ type: 'success', message: 'Session started with ML!' })
      
      // Connect to WebSocket for ML processing
      connectWebSocket()
    } catch (err) {
      setError('Failed to start session. Please ensure the backend is running.')
      console.error('Start session error:', err)
    }
  }

  const endSession = async () => {
    if (!sessionId) return

    try {
      const response = await exerciseService.endSession(sessionId, {
        total_reps: metrics.reps,
        accuracy_score: metrics.max_angle > 140 ? 90 : 70,
        notes: `Completed with ${metrics.reps} reps, max angle: ${metrics.max_angle}°`,
      })
      
      setFeedback({ type: 'success', message: 'Session ended successfully!' })
      setIsSessionActive(false)
      setSessionId(null)
      closeWebSocket()
      stopCamera()
      
      // Reset metrics
      setMetrics({
        angle: 0,
        reps: 0,
        max_angle: 0,
        feedback: 'Position yourself in frame',
        pose_detected: false
      })
    } catch (err) {
      setError('Failed to end session')
      console.error('End session error:', err)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Exercise Session</h1>
          <p className="text-gray-600">Real-time pose analysis and feedback</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Control Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div className="card space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Session Control</h2>

              {/* Patient ID Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  disabled={isSessionActive}
                  placeholder="Enter patient ID"
                  className="input-field"
                />
              </div>

              {/* Exercise Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Type
                </label>
                <select
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  disabled={isSessionActive}
                  className="input-field"
                >
                  {exerciseTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Status */}
              <div className={`p-4 rounded-lg ${isSessionActive ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="font-medium">
                    {isSessionActive ? 'Session Active' : 'Session Inactive'}
                  </span>
                </div>
                {sessionId && (
                  <p className="text-sm text-gray-600 mt-2">
                    Session ID: {sessionId}
                  </p>
                )}
              </div>

              {/* Control Buttons */}
              <div className="space-y-3">
                {!isSessionActive ? (
                  <button
                    onClick={startSession}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Session</span>
                  </button>
                ) : (
                  <button
                    onClick={endSession}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 w-full flex items-center justify-center space-x-2"
                  >
                    <Square className="w-5 h-5" />
                    <span>End Session</span>
                  </button>
                )}
              </div>

              {/* Feedback */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-lg flex items-center space-x-3 ${
                    feedback.type === 'success'
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-yellow-50 border-2 border-yellow-200'
                  }`}
                >
                  <CheckCircle className={`w-5 h-5 ${feedback.type === 'success' ? 'text-green-600' : 'text-yellow-600'}`} />
                  <p className={`text-sm ${feedback.type === 'success' ? 'text-green-800' : 'text-yellow-800'}`}>
                    {feedback.message}
                  </p>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Video Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2"
          >
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ML Pose Detection Feed
                {metrics.pose_detected && (
                  <span className="ml-3 text-sm text-green-600 font-normal">
                    ✓ Pose Detected
                  </span>
                )}
              </h2>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                {isSessionActive ? (
                  <>
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full object-cover"
                    />
                    {/* Live Feedback Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg">
                      <p className="text-lg font-bold">{metrics.feedback}</p>
                      <p className="text-sm mt-1">Current Angle: {metrics.angle}°</p>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">ML Processing Ready</p>
                      <p className="text-sm text-gray-500 mt-2">Start session to see pose detection</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Feedback Display */}
              {isSessionActive && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <motion.div 
                      key={metrics.reps}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.3 }}
                      className="bg-healthcare-light p-4 rounded-lg text-center"
                    >
                      <p className="text-2xl font-bold text-healthcare-primary">{metrics.reps}</p>
                      <p className="text-sm text-gray-600">Repetitions</p>
                    </motion.div>
                    <div className="bg-healthcare-light p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-healthcare-accent">
                        {metrics.angle}°
                      </p>
                      <p className="text-sm text-gray-600">Current Angle</p>
                    </div>
                    <div className="bg-healthcare-light p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-healthcare-secondary">
                        {metrics.max_angle}°
                      </p>
                      <p className="text-sm text-gray-600">Best Angle</p>
                    </div>
                  </div>

                  {/* AI Feedback Card */}
                  <motion.div
                    key={metrics.feedback}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border-2 ${
                      metrics.angle > 160 ? 'bg-green-50 border-green-400' :
                      metrics.angle > 120 ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${
                        metrics.pose_detected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-bold text-gray-800">AI Feedback:</p>
                        <p className="text-gray-700">{metrics.feedback}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Exercise
