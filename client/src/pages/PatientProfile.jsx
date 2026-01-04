import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { patientService } from '../services/patientService'
import { User, Activity, TrendingUp, Calendar, AlertCircle } from 'lucide-react'

const PatientProfile = () => {
  const { patientId } = useParams()
  const [patient, setPatient] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPatientData()
  }, [patientId])

  const loadPatientData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const patientData = await patientService.getPatient(patientId)
      setPatient(patientData)

      const progressData = await patientService.getPatientProgress(patientId)
      setProgress(progressData)
    } catch (err) {
      setError('Failed to load patient data')
      console.error('Patient profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-healthcare-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-lg p-8 flex items-center space-x-4"
        >
          <AlertCircle className="w-8 h-8 text-red-600" />
          <div>
            <p className="font-semibold text-red-800">Error Loading Profile</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Patient Profile</h1>
          <p className="text-gray-600">Detailed information and progress tracking</p>
        </motion.div>

        {/* Patient Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-healthcare mb-8"
        >
          <div className="flex items-center space-x-6">
            <div className="bg-gradient-to-br from-healthcare-primary to-healthcare-secondary w-20 h-20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800">
                {patient?.name || `Patient ${patientId}`}
              </h2>
              <p className="text-gray-600">ID: {patientId}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-healthcare-primary">
                {patient?.progress_percentage || 0}%
              </p>
              <p className="text-sm text-gray-600">Overall Progress</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-800">
                  {patient?.total_sessions || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Active Sessions</p>
                <p className="text-3xl font-bold text-gray-800">
                  {patient?.active_sessions || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Avg Accuracy</p>
                <p className="text-3xl font-bold text-gray-800">
                  {patient?.avg_accuracy || 0}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Progress Details</h2>
          
          {progress ? (
            <div className="space-y-4">
              <div className="bg-healthcare-light p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress_percentage || 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-healthcare-primary to-healthcare-accent h-4 rounded-full"
                  ></motion.div>
                </div>
                <p className="text-right text-sm text-gray-600 mt-1">
                  {progress.progress_percentage || 0}%
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-healthcare-light p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Last Session</p>
                  <p className="text-lg font-bold text-gray-800">
                    {progress.last_session_date || 'N/A'}
                  </p>
                </div>
                <div className="bg-healthcare-light p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Next Goal</p>
                  <p className="text-lg font-bold text-gray-800">
                    {progress.next_goal || 'Complete 10 sessions'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No progress data available</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default PatientProfile
