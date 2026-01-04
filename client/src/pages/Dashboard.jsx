import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { patientService, healthService } from '../services/patientService'
import { Users, TrendingUp, Activity, AlertCircle, CheckCircle, Plus } from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [healthStatus, setHealthStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

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
      label: 'Active Sessions',
      value: patients.filter(p => p.active_sessions > 0).length || 0,
      color: 'from-teal-500 to-teal-600',
    },
    {
      icon: TrendingUp,
      label: 'Avg Progress',
      value: patients.length > 0 
        ? `${Math.round(patients.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / patients.length)}%`
        : '0%',
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
      </div>
    </div>
  )
}

export default Dashboard
