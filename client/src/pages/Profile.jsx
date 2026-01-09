import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  const [activeTab, setActiveTab] = useState('overview') // overview, sessions, stats, settings

  useEffect(() => {
    loadProfileData()
  }, [user])

  const loadProfileData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Load all sessions
      const userSessions = await getUserExerciseSessions(user.id, 100)
      setSessions(userSessions)
      
      // Calculate statistics
      const completedSessions = userSessions.filter(s => s.completion_status === 'completed')
      const totalReps = completedSessions.reduce((sum, s) => sum + (s.total_reps || 0), 0)
      const avgFormScore = completedSessions.length > 0
        ? Math.round(completedSessions.reduce((sum, s) => sum + (s.form_score || 0), 0) / completedSessions.length)
        : 0
      const totalMinutes = Math.round(completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60)
      
      // Count streaks (consecutive days)
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
      label: 'Total Sessions',
      value: stats.totalSessions,
      color: 'from-blue-500 to-blue-600',
      trend: '+12%'
    },
    {
      icon: Target,
      label: 'Total Reps',
      value: stats.totalReps,
      color: 'from-purple-500 to-purple-600',
      trend: '+8%'
    },
    {
      icon: TrendingUp,
      label: 'Avg Form Score',
      value: `${stats.avgFormScore}%`,
      color: 'from-green-500 to-green-600',
      trend: '+5%'
    },
    {
      icon: Clock,
      label: 'Total Time',
      value: `${stats.totalMinutes}m`,
      color: 'from-orange-500 to-orange-600',
      trend: '+15%'
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${stats.streak} days`,
      color: 'from-red-500 to-red-600',
      trend: 'Hot!'
    },
    {
      icon: Trophy,
      label: 'Completed',
      value: stats.completedSessions,
      color: 'from-yellow-500 to-yellow-600',
      trend: '+10%'
    },
  ] : []

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-healthcare-light via-white to-gray-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
              <p className="text-gray-600">Track your progress and manage your account</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
              <img 
                src="/images/logo.png" 
                alt="User Avatar" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{user?.email || 'User'}</h2>
              <p className="text-gray-600 mt-1">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  ✓ Active
                </span>
                {stats && stats.streak > 0 && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    {stats.streak} day streak!
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'sessions', label: 'Sessions', icon: Calendar },
            { id: 'stats', label: 'Statistics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-healthcare-primary text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
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
                        <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
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

            {/* Exercise Breakdown */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" />
                  Exercise Breakdown
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">💪</span>
                      <span className="text-2xl font-bold text-blue-600">{stats.exerciseTypes.arm_raise}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Arm Raise Sessions</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🦵</span>
                      <span className="text-2xl font-bold text-purple-600">{stats.exerciseTypes.knee_extension}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Knee Extension Sessions</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/exercise')}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-healthcare-primary to-healthcare-accent text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <span className="font-semibold">Start New Session</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center justify-between p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <span className="font-semibold">View Dashboard</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Sessions</h3>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No sessions yet</p>
                <button
                  onClick={() => navigate('/exercise')}
                  className="mt-4 btn-primary"
                >
                  Start Your First Session
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 20).map((session, index) => (
                  <div
                    key={session.id || index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">
                        {session.exercise_type === 'knee_extension' ? '🦵' : '💪'}
                      </span>
                      <div>
                        <p className="font-semibold capitalize">
                          {session.exercise_type?.replace('_', ' ') || 'Exercise'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.start_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-purple-600">{session.total_reps || 0}</p>
                        <p className="text-xs text-gray-500">Reps</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-600">{session.form_score || 0}%</p>
                        <p className="text-xs text-gray-500">Form</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-blue-600">
                          {Math.round((session.duration_seconds || 0) / 60)}m
                        </p>
                        <p className="text-xs text-gray-500">Time</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Average Form Score</span>
                    <span className="font-bold">{stats.avgFormScore}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-healthcare-primary to-healthcare-accent transition-all"
                      style={{ width: `${stats.avgFormScore}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion Rate</span>
                    <span className="font-bold">
                      {stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                      style={{ width: `${stats.totalSessions > 0 ? (stats.completedSessions / stats.totalSessions) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Achievements</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {stats.totalSessions >= 10 && (
                  <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <Award className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                    <p className="font-bold">10 Sessions!</p>
                    <p className="text-xs text-gray-600">Keep it up</p>
                  </div>
                )}
                {stats.streak >= 3 && (
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <Flame className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                    <p className="font-bold">{stats.streak} Day Streak!</p>
                    <p className="text-xs text-gray-600">On fire!</p>
                  </div>
                )}
                {stats.avgFormScore >= 85 && (
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <Trophy className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="font-bold">Perfect Form!</p>
                    <p className="text-xs text-gray-600">85%+ average</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{user?.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-semibold">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout from Account</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Profile
