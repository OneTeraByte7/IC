import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getUserExerciseSessions, getUserStatistics } from '../services/exerciseService'
import {
  User, Activity, Calendar, TrendingUp, Award,
  Target, Clock, Flame, BarChart3, Dumbbell,
  Settings, LogOut, ChevronRight, Trophy
} from 'lucide-react'

const Profile = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadProfileData()
  }, [user])

  const loadProfileData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const userSessions = await getUserExerciseSessions(user.id, 100)
      setSessions(userSessions)

      const completedSessions = userSessions.filter(s => s.completion_status === 'completed')
      const totalReps = completedSessions.reduce((sum, s) => sum + (s.total_reps || 0), 0)
      const avgFormScore = completedSessions.length > 0
        ? Math.round(completedSessions.reduce((sum, s) => sum + (s.form_score || 0), 0) / completedSessions.length)
        : 0
      const totalMinutes = Math.round(completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60)

      const dates = [...new Set(completedSessions.map(s =>
        new Date(s.start_time).toDateString()
      ))].sort()

      let streak = 0
      let currentStreak = 0
      const today = new Date().toDateString()

      for (let i = dates.length - 1; i >= 0; i--) {
        if (dates[i] === today || i === dates.length - 1) {
          currentStreak = 1
          for (let j = i - 1; j >= 0; j--) {
            const prevDate = new Date(dates[j])
            const currDate = new Date(dates[j + 1])
            const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24))
            if (diffDays === 1) {
              currentStreak++
            } else {
              break
            }
          }
          streak = currentStreak
          break
        }
      }

      setStats({
        totalSessions: userSessions.length,
        completedSessions: completedSessions.length,
        totalReps,
        avgFormScore,
        totalMinutes,
        streak,
        exerciseTypes: {
          arm_raise: userSessions.filter(s => s.exercise_type === 'arm_raise').length,
          knee_extension: userSessions.filter(s => s.exercise_type === 'knee_extension').length,
        }
      })
    } catch (error) {
      console.error('Failed to load profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const statCards = stats ? [
    {
      icon: Activity,
      label: 'Session Cycles',
      value: stats.totalSessions,
      color: 'from-healthcare-primary to-healthcare-secondary',
      trend: 'Optimal',
      shadow: 'shadow-[0_0_20px_rgba(0,240,255,0.3)]'
    },
    {
      icon: Target,
      label: 'Accumulated Reps',
      value: stats.totalReps,
      color: 'from-healthcare-secondary to-purple-600',
      trend: 'Tracking',
      shadow: 'shadow-[0_0_20px_rgba(112,0,255,0.3)]'
    },
    {
      icon: TrendingUp,
      label: 'Form Precision',
      value: `${stats.avgFormScore}%`,
      color: 'from-healthcare-accent to-green-600',
      trend: 'Calibrated',
      shadow: 'shadow-[0_0_20px_rgba(0,255,102,0.3)]'
    },
    {
      icon: Clock,
      label: 'System Uptime',
      value: `${stats.totalMinutes}m`,
      color: 'from-orange-500 to-orange-600',
      trend: '+12%',
      shadow: 'shadow-[0_0_20px_rgba(255,165,0,0.3)]'
    },
    {
      icon: Flame,
      label: 'Neural Streak',
      value: `${stats.streak} days`,
      color: 'from-healthcare-error to-red-600',
      trend: 'Active',
      shadow: 'shadow-[0_0_20px_rgba(255,0,60,0.3)]'
    },
    {
      icon: Trophy,
      label: 'Objectives Met',
      value: stats.completedSessions,
      color: 'from-healthcare-warning to-yellow-600',
      trend: 'Secure',
      shadow: 'shadow-[0_0_20px_rgba(255,184,0,0.3)]'
    },
  ] : []

  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-healthcare-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-healthcare-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight text-glow">Operative Profile</h1>
              <p className="text-gray-400 font-light">Track advanced rehabilitation telemetry and manage credentials</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary hidden md:flex items-center gap-2"
            >
              <span>Neural Dashboard</span>
            </button>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-10 overflow-visible"
        >
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6 text-center md:text-left">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-healthcare-primary/50 blur-xl rounded-full"></div>
              <div className="w-24 h-24 rounded-full bg-black border border-white/20 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                <User className="w-12 h-12 text-healthcare-primary drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-display font-bold text-white text-glow">{user?.email || 'Unknown Operative'}</h2>
              <p className="text-gray-400 font-mono text-sm mt-1 uppercase tracking-widest">
                Active Since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Classification Pending'}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                <span className="px-3 py-1.5 bg-healthcare-accent/10 border border-healthcare-accent/30 text-healthcare-accent rounded-md text-xs font-semibold uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,102,0.1)]">
                  ✓ Network Synced
                </span>
                {stats && stats.streak > 0 && (
                  <span className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,165,0,0.1)]">
                    <Flame className="w-4 h-4" />
                    {stats.streak} Cycle Streak
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full md:w-auto flex justify-center items-center gap-2 px-5 py-2.5 bg-healthcare-error/10 border border-healthcare-error/30 text-healthcare-error hover:bg-healthcare-error hover:text-white rounded-xl transition-all font-semibold uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(255,0,60,0.2)] mt-6 md:mt-0"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'overview', label: 'Telemetry', icon: BarChart3 },
            { id: 'sessions', label: 'Logs', icon: Calendar },
            { id: 'stats', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'System', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm border ${activeTab === tab.id
                    ? 'bg-healthcare-primary/20 text-white border-healthcare-primary/50 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-healthcare-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''}`} />
                <span className="uppercase tracking-wider">{tab.label}</span>
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  {statCards.map((stat, index) => {
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
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-1.5">
                              {stat.label}
                            </p>
                            <p className="text-3xl font-display font-bold text-white group-hover:text-glow transition-all">
                              {stat.value}
                            </p>
                            <p className="text-[10px] text-healthcare-accent uppercase tracking-widest mt-1.5 font-bold drop-shadow-[0_0_5px_rgba(0,255,102,0.8)]">{stat.trend}</p>
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

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Exercise Breakdown */}
                  {stats && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="card"
                    >
                      <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3 tracking-wide">
                        <Dumbbell className="w-5 h-5 text-healthcare-secondary drop-shadow-[0_0_5px_rgba(112,0,255,0.8)]" />
                        Kinematic Module Usage
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-healthcare-primary/20 border border-healthcare-primary/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,240,255,0.2)]">💪</div>
                              <span className="font-semibold text-gray-300 uppercase tracking-widest text-sm">Arm Raise Protocol</span>
                            </div>
                            <span className="text-2xl font-display font-bold text-healthcare-primary group-hover:text-glow transition-all">{stats.exerciseTypes.arm_raise}</span>
                          </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-healthcare-secondary/20 border border-healthcare-secondary/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(112,0,255,0.2)]">🦵</div>
                              <span className="font-semibold text-gray-300 uppercase tracking-widest text-sm">Knee Ext Protocol</span>
                            </div>
                            <span className="text-2xl font-display font-bold text-healthcare-secondary group-hover:text-glow transition-all">{stats.exerciseTypes.knee_extension}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="card"
                  >
                    <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3 tracking-wide">
                      <Activity className="w-5 h-5 text-healthcare-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
                      Terminal Commands
                    </h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => navigate('/exercise')}
                        className="w-full btn-primary flex items-center justify-between p-5 py-5 rounded-xl text-left"
                      >
                        <div>
                          <span className="block font-bold text-white uppercase tracking-wider mb-1 text-sm">Initialize Sequence</span>
                          <span className="block text-xs font-light text-white/70 tracking-wide mt-1">Start a new rehabilitation session</span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white/50" />
                      </button>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full btn-secondary flex items-center justify-between p-5 py-5 rounded-xl text-left bg-white/5 hover:bg-white/10 shadow-none border-white/10"
                      >
                        <div>
                          <span className="block font-bold text-white uppercase tracking-wider mb-1 text-sm">Access Neural Matrix</span>
                          <span className="block text-xs font-light text-gray-400 tracking-wide mt-1">Return to main dashboard overview</span>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-500" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="card">
                <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3 tracking-wide">
                  <Calendar className="w-5 h-5 text-healthcare-secondary drop-shadow-[0_0_5px_rgba(112,0,255,0.8)]" />
                  Recent Session Logs
                </h3>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-primary drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] mx-auto"></div>
                    <p className="mt-4 text-gray-400 animate-pulse font-medium">Syncing Network Logs...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                    <Activity className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-gray-300 font-medium text-lg">No active sessions found.</p>
                    <button
                      onClick={() => navigate('/exercise')}
                      className="mt-6 btn-primary"
                    >
                      Initialize First Log
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.slice(0, 20).map((session, index) => (
                      <div
                        key={session.id || index}
                        className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                          <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-2xl">
                            {session.exercise_type === 'knee_extension' ? '🦵' : '💪'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-300 uppercase tracking-widest text-sm group-hover:text-healthcare-primary transition-colors">
                              {session.exercise_type?.replace('_', ' ') || 'Exercise'}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                              {new Date(session.start_time).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-display font-bold text-lg text-healthcare-secondary group-hover:text-glow transition-all">{session.total_reps || 0}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Cycles</p>
                          </div>
                          <div className="text-center">
                            <p className="font-display font-bold text-lg text-healthcare-accent group-hover:text-glow transition-all">{session.form_score || 0}%</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Precision</p>
                          </div>
                          <div className="text-center">
                            <p className="font-display font-bold text-lg text-healthcare-primary group-hover:text-glow transition-all">
                              {Math.round((session.duration_seconds || 0) / 60)}m
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Uptime</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && stats && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3 tracking-wide">
                    <TrendingUp className="w-5 h-5 text-healthcare-primary drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
                    Metrics Analytics
                  </h3>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                        <span>Form Precision Bias</span>
                        <span className="font-bold text-healthcare-primary">{stats.avgFormScore}%</span>
                      </div>
                      <div className="h-4 bg-black/50 border border-white/10 rounded-full overflow-hidden shadow-inner flex mb-6">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.avgFormScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-healthcare-primary to-healthcare-secondary relative shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                        >
                          <div className="absolute inset-0 bg-white/20"></div>
                        </motion.div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                        <span>Protocol Completion Rate</span>
                        <span className="font-bold text-healthcare-accent">
                          {stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-4 bg-black/50 border border-white/10 rounded-full overflow-hidden shadow-inner flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stats.totalSessions > 0 ? (stats.completedSessions / stats.totalSessions) * 100 : 0}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-healthcare-accent to-green-500 relative shadow-[0_0_15px_rgba(0,255,102,0.5)]"
                        >
                          <div className="absolute inset-0 bg-white/20"></div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3 tracking-wide">
                    <Award className="w-5 h-5 text-healthcare-warning drop-shadow-[0_0_5px_rgba(255,184,0,0.8)]" />
                    Recognized Achievements
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {stats.totalSessions >= 10 && (
                      <div className="p-6 bg-healthcare-secondary/10 border border-healthcare-secondary/30 rounded-xl text-center shadow-[0_0_20px_rgba(112,0,255,0.1)] hover:bg-healthcare-secondary/20 transition-colors">
                        <Award className="w-12 h-12 text-healthcare-secondary drop-shadow-[0_0_10px_rgba(112,0,255,0.8)] mx-auto mb-3" />
                        <p className="font-bold text-white uppercase tracking-widest text-sm mb-1 text-glow">10 Cycles Reached</p>
                        <p className="text-[10px] uppercase font-medium text-healthcare-secondary">Milestone Unlocked</p>
                      </div>
                    )}
                    {stats.streak >= 3 && (
                      <div className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl text-center shadow-[0_0_20px_rgba(255,165,0,0.1)] hover:bg-orange-500/20 transition-colors">
                        <Flame className="w-12 h-12 text-orange-500 drop-shadow-[0_0_10px_rgba(255,165,0,0.8)] mx-auto mb-3" />
                        <p className="font-bold text-white uppercase tracking-widest text-sm mb-1 text-glow">{stats.streak}x Link Streak</p>
                        <p className="text-[10px] uppercase font-medium text-orange-500">System Resonance High</p>
                      </div>
                    )}
                    {stats.avgFormScore >= 85 && (
                      <div className="p-6 bg-healthcare-accent/10 border border-healthcare-accent/30 rounded-xl text-center shadow-[0_0_20px_rgba(0,255,102,0.1)] hover:bg-healthcare-accent/20 transition-colors">
                        <Trophy className="w-12 h-12 text-healthcare-accent drop-shadow-[0_0_10px_rgba(0,255,102,0.8)] mx-auto mb-3" />
                        <p className="font-bold text-white uppercase tracking-widest text-sm mb-1 text-glow">Perfect Alignment</p>
                        <p className="text-[10px] uppercase font-medium text-healthcare-accent">85%+ Precision Base</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="card">
                <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-3 tracking-wide">
                  <Settings className="w-5 h-5 text-gray-400" />
                  System Configuration
                </h3>
                <div className="space-y-4 max-w-2xl">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Neural ID</p>
                      <p className="font-mono text-white tracking-wider">{user?.email}</p>
                    </div>
                  </div>
                  <div className="p-5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Clearance Date</p>
                      <p className="font-mono text-white tracking-wider">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 mt-6 bg-healthcare-error/10 border border-healthcare-error/30 text-healthcare-error rounded-xl hover:bg-healthcare-error hover:text-white transition-all font-semibold uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(255,0,60,0.2)]"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Terminate Link</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Profile
