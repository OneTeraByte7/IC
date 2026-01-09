import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { patientService, healthService } from '../services/patientService'
import { getUserExerciseSessions } from '../services/exerciseService'
import { useAuth } from '../hooks/useAuth'
import { Users, TrendingUp, Activity, AlertCircle, CheckCircle, Plus, Calendar, Award } from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [healthStatus, setHealthStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check API health
      const health = await healthService.checkHealth()
      setHealthStatus(health)

      // Load patients
      const patientsData = await patientService.getAllPatients()
      setPatients(patientsData)

      // Load user sessions from Supabase
      if (user) {
        const userSessions = await getUserExerciseSessions(user.id, 50)
        setSessions(userSessions)
      }
    } catch (err) {
      setError('Failed to connect to server. Please ensure the backend is running.')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      icon: Users,
      label: 'Total Patients',
      value: patients.length || 0,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Activity,
      label: 'Total Sessions',
      value: sessions.length || 0,
      color: 'from-teal-500 to-teal-600',
    },
    {
      icon: TrendingUp,
      label: 'Completed',
      value: sessions.filter(s => s.completion_status === 'completed').length || 0,
      color: 'from-green-500 to-green-600',
    },
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Monitor patient progress and system status</p>
        </motion.div>

        {/* Health Status */}
        {healthStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">System Online</p>
              <p className="text-sm text-green-600">{healthStatus.service} - {healthStatus.status}</p>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Connection Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`bg-gradient-to-br ${stat.color} w-16 h-16 rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Patients List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Patients</h2>
            <button
              onClick={() => navigate('/exercise')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Session</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No patients found</p>
              <p className="text-sm text-gray-500 mt-2">Start an exercise session to create a patient record</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient, index) => (
                <motion.div
                  key={patient.patient_id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/profile/${patient.patient_id}`)}
                  className="bg-healthcare-light p-4 rounded-lg cursor-pointer hover:shadow-md transition-all border-2 border-transparent hover:border-healthcare-primary"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {patient.name || `Patient ${patient.patient_id}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        ID: {patient.patient_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-healthcare-primary">
                        {patient.progress_percentage || 0}%
                      </p>
                      <p className="text-sm text-gray-600">Progress</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* All Sessions from Supabase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card mt-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              All Exercise Sessions
            </h2>
            <span className="text-sm text-gray-500">{sessions.length} total</span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No exercise sessions found</p>
              <p className="text-sm text-gray-500 mt-2">Start an exercise session to see your history</p>
              <button
                onClick={() => navigate('/exercise')}
                className="mt-4 btn-primary"
              >
                Start First Session
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Exercise Type</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Reps</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Form Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Duration</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => (
                    <motion.tr
                      key={session.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-healthcare-light/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-800">
                            {new Date(session.start_time).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(session.start_time).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {session.exercise_type === 'knee_extension' ? '🦵' : '💪'}
                          </span>
                          <span className="text-sm font-medium capitalize">
                            {session.exercise_type?.replace('_', ' ') || 'Exercise'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                          {session.total_reps || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg font-bold text-healthcare-primary">
                            {session.form_score || 0}%
                          </span>
                          {session.form_score >= 85 && <Award className="w-4 h-4 text-yellow-500" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        {Math.round((session.duration_seconds || 0) / 60)}m {(session.duration_seconds || 0) % 60}s
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          session.completion_status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : session.completion_status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {session.completion_status || 'unknown'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
