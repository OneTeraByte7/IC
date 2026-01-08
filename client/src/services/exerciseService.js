import { supabase } from './supabaseClient'

/**
 * Exercise Session Service
 * Handles all database operations for exercise sessions
 */

// Start a new exercise session
export const startExerciseSession = async (userId, exerciseType = 'arm_raise') => {
  // Validate exercise type
  const validExercises = ['arm_raise', 'knee_extension', 'shoulder_rotation', 'leg_extension'];
  if (!validExercises.includes(exerciseType)) {
    exerciseType = 'arm_raise'; // Default fallback
  }
  
  const { data, error } = await supabase
    .from('exercise_sessions')
    .insert({
      user_id: userId,
      exercise_type: exerciseType,
      start_time: new Date().toISOString(),
      completion_status: 'in_progress'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update exercise session
export const updateExerciseSession = async (sessionId, updates) => {
  const { data, error } = await supabase
    .from('exercise_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Complete exercise session
export const completeExerciseSession = async (sessionId, sessionData) => {
  const endTime = new Date().toISOString()
  const startTime = sessionData.start_time
  const durationSeconds = Math.floor((new Date(endTime) - new Date(startTime)) / 1000)

  const { data, error } = await supabase
    .from('exercise_sessions')
    .update({
      end_time: endTime,
      duration_seconds: durationSeconds,
      total_reps: sessionData.total_reps,
      form_score: sessionData.form_score,
      avg_angle: sessionData.avg_angle,
      max_angle: sessionData.max_angle,
      min_angle: sessionData.min_angle,
      completion_status: 'completed'
    })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Save exercise metrics (frame data)
export const saveExerciseMetrics = async (sessionId, metrics) => {
  const { data, error } = await supabase
    .from('exercise_metrics')
    .insert({
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      left_arm_angle: metrics.leftArmAngle,
      right_arm_angle: metrics.rightArmAngle,
      form_score: metrics.formScore,
      pose_landmarks: metrics.landmarks
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get user's exercise sessions
export const getUserExerciseSessions = async (userId, limit = 10) => {
  const { data, error } = await supabase
    .from('exercise_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// Get session details with metrics
export const getSessionDetails = async (sessionId) => {
  const { data, error } = await supabase
    .from('exercise_sessions')
    .select(`
      *,
      exercise_metrics(*)
    `)
    .eq('id', sessionId)
    .single()

  if (error) throw error
  return data
}

// Update daily progress
export const updateDailyProgress = async (userId, sessionData) => {
  const today = new Date().toISOString().split('T')[0]

  // Get existing progress for today
  const { data: existing } = await supabase
    .from('progress_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  const updates = {
    user_id: userId,
    date: today,
    total_sessions: (existing?.total_sessions || 0) + 1,
    total_reps: (existing?.total_reps || 0) + sessionData.total_reps,
    total_duration_minutes: (existing?.total_duration_minutes || 0) + Math.floor(sessionData.duration_seconds / 60),
    avg_form_score: sessionData.form_score
  }

  const { data, error } = await supabase
    .from('progress_tracking')
    .upsert(updates, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get user statistics
export const getUserStatistics = async (userId) => {
  const { data, error } = await supabase
    .from('user_statistics')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

// Get weekly progress
export const getWeeklyProgress = async (userId) => {
  const { data, error } = await supabase
    .from('weekly_progress')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(12) // Last 12 weeks

  if (error) throw error
  return data
}

// Add AI coaching feedback
export const addAIFeedback = async (sessionId, feedbackType, message) => {
  const { data, error } = await supabase
    .from('ai_coaching_feedback')
    .insert({
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      feedback_type: feedbackType,
      message: message
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Award achievement
export const awardAchievement = async (userId, achievementData) => {
  const { data, error } = await supabase
    .from('achievements')
    .insert({
      user_id: userId,
      achievement_type: achievementData.type,
      title: achievementData.title,
      description: achievementData.description,
      icon: achievementData.icon
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get user achievements
export const getUserAchievements = async (userId) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (error) throw error
  return data
}
