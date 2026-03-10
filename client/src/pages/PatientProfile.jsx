import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { patientService } from '../services/patientService'
import { User, Activity, TrendingUp, Calendar, AlertCircle, Target } from 'lucide-react'

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
      <div className="min-h-screen bg-healthcare-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-healthcare-primary mx-auto shadow-[0_0_15px_rgba(0,240,255,0.5)]"></div>
          <p className="mt-6 text-healthcare-primary font-display font-bold uppercase tracking-widest text-glow animate-pulse">Initializing Subject Data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-healthcare-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-healthcare-error/10 border border-healthcare-error rounded-2xl p-8 flex items-center space-x-6 shadow-[0_0_30px_rgba(255,0,60,0.2)] max-w-lg w-full"
        >
          <div className="bg-healthcare-error/20 p-4 rounded-full">
            <AlertCircle className="w-10 h-10 text-healthcare-error drop-shadow-[0_0_8px_rgba(255,0,60,0.8)]" />
          </div>
          <div>
            <p className="font-display font-bold text-white uppercase tracking-wider text-lg">System Error</p>
            <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-semibold">{error}</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-healthcare-background text-white relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-healthcare-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-healthcare-secondary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-white mb-2 uppercase tracking-widest text-glow">
            Subject <span className="text-healthcare-primary">Profile</span>
          </h1>
          <p className="text-gray-400 uppercase tracking-widest text-xs font-semibold">Detailed Telemetry & Progress</p>
        </motion.div>

        {/* Patient Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-white/10 shadow-[0_0_30px_rgba(31,110,235,0.1)] mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-healthcare-primary/5 rounded-full blur-3xl group-hover:bg-healthcare-primary/10 transition-colors pointer-events-none"></div>

          <div className="flex items-center space-x-6 relative z-10">
            <div className="bg-gradient-to-br from-healthcare-primary to-healthcare-secondary w-20 h-20 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] transform rotate-3 group-hover:rotate-6 transition-all duration-500">
              <User className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">
                {patient?.name || `Subject ${patientId.substring(0, 6)}`}
              </h2>
              <p className="text-healthcare-primary text-sm font-mono mt-1 drop-shadow-[0_0_2px_rgba(0,240,255,0.5)]">ID: {patientId}</p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-black/40 p-4 border border-white/5 rounded-xl block relative z-10 w-full sm:w-auto">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Overall Trajectory</p>
            <p className="text-4xl font-display font-bold text-healthcare-success drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]">
              {patient?.progress_percentage || 0}%
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card border-healthcare-secondary/30 shadow-[0_0_15px_rgba(112,0,255,0.1)] hover:bg-healthcare-secondary/10 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-healthcare-secondary text-[10px] uppercase tracking-widest font-bold mb-2 drop-shadow-[0_0_5px_rgba(112,0,255,0.5)]">Total Sessions</p>
                <p className="text-4xl font-display font-bold text-white group-hover:text-glow transition-all">
                  {patient?.total_sessions || 0}
                </p>
              </div>
              <div className="bg-healthcare-secondary/20 border border-healthcare-secondary/30 w-14 h-14 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(112,0,255,0.3)]">
                <Calendar className="w-6 h-6 text-healthcare-secondary drop-shadow-[0_0_5px_rgba(112,0,255,0.8)]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card border-healthcare-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:bg-healthcare-primary/10 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-healthcare-primary text-[10px] uppercase tracking-widest font-bold mb-2 drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">Active Sessions</p>
                <p className="text-4xl font-display font-bold text-white group-hover:text-glow transition-all">
                  {patient?.active_sessions || 0}
                </p>
              </div>
              <div className="bg-healthcare-primary/20 border border-healthcare-primary/30 w-14 h-14 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <Activity className="w-6 h-6 text-healthcare-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card border-healthcare-accent/30 shadow-[0_0_15px_rgba(0,255,102,0.1)] hover:bg-healthcare-accent/10 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-healthcare-accent text-[10px] uppercase tracking-widest font-bold mb-2 drop-shadow-[0_0_5px_rgba(0,255,102,0.5)]">Avg Precision</p>
                <p className="text-4xl font-display font-bold text-white group-hover:text-glow transition-all">
                  {patient?.avg_accuracy || 0}%
                </p>
              </div>
              <div className="bg-healthcare-accent/20 border border-healthcare-accent/30 w-14 h-14 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                <TrendingUp className="w-6 h-6 text-healthcare-accent drop-shadow-[0_0_5px_rgba(0,255,102,0.8)]" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-healthcare-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" size={24} />
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider text-glow">Progress Telemetry</h2>
          </div>

          {progress ? (
            <div className="space-y-6">
              <div className="bg-black/40 border border-white/5 p-5 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">Overall Trajectory</p>
                  <p className="text-sm font-display font-bold text-healthcare-primary text-glow">
                    {progress.progress_percentage || 0}%
                  </p>
                </div>
                <div className="w-full bg-black/60 border border-white/10 rounded-full h-3 overflow-hidden shadow-inner flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress_percentage || 0}%` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    className="bg-gradient-to-r from-healthcare-secondary via-healthcare-primary to-healthcare-accent h-3 relative"
                  >
                    <div className="absolute inset-0 bg-white/20"></div>
                  </motion.div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-black/40 border border-white/5 hover:border-white/10 transition-colors p-5 rounded-xl flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Last Log</p>
                    <p className="text-lg font-display font-bold text-white group-hover:text-glow transition-all">
                      {progress.last_session_date || 'N/A'}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
                <div className="bg-black/40 border border-white/5 hover:border-white/10 transition-colors p-5 rounded-xl flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Target Protocol</p>
                    <p className="text-lg font-display font-bold text-white group-hover:text-glow transition-all">
                      {progress.next_goal || 'Complete 10 cycles'}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-16 h-16 text-white/10 mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Telemetry Available</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default PatientProfile
