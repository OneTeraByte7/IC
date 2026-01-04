import apiClient from './api'

export const patientService = {
  // Get all patients
  getAllPatients: async () => {
    const response = await apiClient.get('/api/patients')
    return response.data
  },

  // Get patient by ID
  getPatient: async (patientId) => {
    const response = await apiClient.get(`/api/patients/${patientId}`)
    return response.data
  },

  // Create new patient
  createPatient: async (patientData) => {
    const response = await apiClient.post('/api/patients', patientData)
    return response.data
  },

  // Update patient
  updatePatient: async (patientId, patientData) => {
    const response = await apiClient.put(`/api/patients/${patientId}`, patientData)
    return response.data
  },

  // Get patient progress
  getPatientProgress: async (patientId) => {
    const response = await apiClient.get(`/api/patients/${patientId}/progress`)
    return response.data
  },
}

export const exerciseService = {
  // Start exercise session
  startSession: async (sessionData) => {
    const response = await apiClient.post('/api/exercise/start', sessionData)
    return response.data
  },

  // Analyze pose data
  analyzePose: async (poseData) => {
    const response = await apiClient.post('/api/exercise/analyze', poseData)
    return response.data
  },

  // End exercise session
  endSession: async (sessionId, sessionData) => {
    const response = await apiClient.post(`/api/exercise/end/${sessionId}`, sessionData)
    return response.data
  },

  // Get session history
  getSessionHistory: async (patientId) => {
    const response = await apiClient.get(`/api/exercise/history/${patientId}`)
    return response.data
  },
}

export const healthService = {
  // Check API health
  checkHealth: async () => {
    const response = await apiClient.get('/api/health')
    return response.data
  },
}
