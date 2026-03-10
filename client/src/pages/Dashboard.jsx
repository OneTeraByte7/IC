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
      color: 'from-healthcare-primary to-healthcare-secondary',
      shadow: 'shadow-[0_0_20px_rgba(0,240,255,0.3)]'
    },
    {
      icon: Activity,
      label: 'Total Sessions',
      value: sessions.length || 0,
      color: 'from-healthcare-secondary to-purple-600',
      shadow: 'shadow-[0_0_20px_rgba(112,0,255,0.3)]'
    },
    {
      icon: TrendingUp,
      label: 'Completed',
      value: sessions.filter(s => s.completion_status === 'completed').length || 0,
      color: 'from-healthcare-accent to-green-600',
      shadow: 'shadow-[0_0_20px_rgba(0,255,102,0.3)]'
    },
  ]

  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-healthcare-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-healthcare-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-healthcare-primary/30 bg-healthcare-primary/10 text-healthcare-primary text-xs font-medium mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-healthcare-primary animate-pulse"></span>
            <span>Live Telemetry</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight text-glow">Neural Dashboard</h1>
          <p className="text-gray-400 font-light">Monitor patient kinematics and system telemetry</p>
        </motion.div>

        {/* Health Status */}
        {healthStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 card border-healthcare-accent/30 bg-healthcare-accent/10 flex items-center space-x-4 p-4"
          >
            <div className="bg-healthcare-accent/20 p-2 rounded-full">
              <CheckCircle className="w-6 h-6 text-healthcare-accent drop-shadow-[0_0_8px_rgba(0,255,102,0.8)]" />
            </div>
            <div>
              <p className="font-semibold text-healthcare-accent tracking-wide">System Online</p>
              <p className="text-sm text-healthcare-accent/70">{healthStatus.service} - {healthStatus.status}</p>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 card border-healthcare-error/30 bg-healthcare-error/10 flex items-center space-x-4 p-4"
          >
            <div className="bg-healthcare-error/20 p-2 rounded-full">
              <AlertCircle className="w-6 h-6 text-healthcare-error drop-shadow-[0_0_8px_rgba(255,0,60,0.8)]" />
            </div>
            <div>
              <p className="font-semibold text-healthcare-error tracking-wide">Connection Error</p>
              <p className="text-sm text-healthcare-error/70">{error}</p>
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
                whileHover={{ scale: 1.02 }}
                className="card group cursor-default"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-4xl font-display font-bold text-white group-hover:text-glow transition-all">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`bg-gradient-to-br ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center ${stat.shadow} transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}
                  >
                    <Icon className="w-8 h-8 text-white drop-shadow-md" />
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
          className="card mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-healthcare-primary" />
              Patient Roster
            </h2>
            <button
              onClick={() => navigate('/exercise')}
              className="btn-primary flex items-center space-x-2 py-2.5 px-5 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Session</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-primary drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] mx-auto"></div>
              <p className="mt-6 text-gray-400 font-medium animate-pulse">Establishing Neural Link...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-gray-300 font-medium text-lg">No active patients</p>
              <p className="text-sm text-gray-500 mt-2 font-light">Initialize an exercise session to generate a patient profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patients.map((patient, index) => (
                <motion.div
                  key={patient.patient_id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/profile/${patient.patient_id}`)}
                  className="bg-white/5 backdrop-blur-md p-5 rounded-xl cursor-pointer hover:bg-white/10 transition-all border border-white/5 hover:border-healthcare-primary/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white group-hover:text-healthcare-primary transition-colors">
                        {patient.name || `Subject ${patient.patient_id.substring(0, 6)}`}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-mono">
                        UUID: {patient.patient_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-display font-bold text-healthcare-accent group-hover:text-glow transition-all">
                        {patient.progress_percentage || 0}%
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Recovery</p>
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
          className="card"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              <Calendar className="w-6 h-6 text-healthcare-secondary" />
              Session History
            </h2>
            <span className="text-xs font-medium text-healthcare-secondary bg-healthcare-secondary/10 px-3 py-1 rounded-full border border-healthcare-secondary/30">
              {sessions.length} Records
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-secondary drop-shadow-[0_0_10px_rgba(112,0,255,0.8)] mx-auto"></div>
              <p className="mt-6 text-gray-400 font-medium animate-pulse">Syncing Database...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
              <Activity className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-gray-300 font-medium text-lg">No session data available</p>
              <p className="text-sm text-gray-500 mt-2 font-light">Start logging exercises to populate the database.</p>
              <button
                onClick={() => navigate('/exercise')}
                className="mt-6 btn-primary"
              >
                Initialize Session
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10 font-medium tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Sequence</th>
                    <th className="text-center py-4 px-6">Cycles</th>
                    <th className="text-center py-4 px-6">Precision</th>
                    <th className="text-center py-4 px-6">Uptime</th>
                    <th className="text-center py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessions.map((session, index) => (
                    <motion.tr
                      key={session.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-300 group-hover:text-white transition-colors">
                            {new Date(session.start_time).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500 font-mono mt-0.5">
                            {new Date(session.start_time).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                            {session.exercise_type === 'knee_extension' ? '🦵' : '💪'}
                          </div>
                          <span className="font-medium text-gray-300 capitalize group-hover:text-healthcare-primary transition-colors">
                            {session.exercise_type?.replace('_', ' ') || 'Exercise'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300 font-mono font-medium">
                          {session.total_reps || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-lg font-display font-bold ${session.form_score >= 85 ? 'text-healthcare-accent text-glow' : 'text-healthcare-primary'}`}>
                            {session.form_score || 0}%
                          </span>
                          {session.form_score >= 85 && <Award className="w-4 h-4 text-healthcare-warning drop-shadow-[0_0_5px_rgba(255,184,0,0.8)]" />}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-gray-400 group-hover:text-gray-300 transition-colors">
                        {Math.round((session.duration_seconds || 0) / 60)}m {(session.duration_seconds || 0) % 60}s
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold border ${session.completion_status === 'completed'
                            ? 'bg-healthcare-accent/10 text-healthcare-accent border-healthcare-accent/30'
                            : session.completion_status === 'in_progress'
                              ? 'bg-healthcare-warning/10 text-healthcare-warning border-healthcare-warning/30'
                              : 'bg-white/5 text-gray-400 border-white/10'
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
