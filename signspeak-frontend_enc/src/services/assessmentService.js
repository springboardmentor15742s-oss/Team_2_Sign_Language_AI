import apiClient from './apiClient';

export const assessmentService = {
  getAssessments: () => apiClient.get('/assessments'),
  getAssessment: (id) => apiClient.get(`/assessments/${id}`),
  submitAssessment: (id, answers) => apiClient.post(`/assessments/${id}/submit`, { answers }),
  getResults: (id) => apiClient.get(`/assessments/${id}/results`),

  // ML Sign Assessment Endpoints
  predictSign: (data) => apiClient.post('/assessment/predict', data),
  evaluateSign: (data) => apiClient.post('/assessment/evaluate', data),
  getAssessmentHistory: () => apiClient.get('/assessment/history'),
  getAssessmentAttempt: (id) => apiClient.get(`/assessment/${id}`),

  // Dynamic sign-assessment workflow endpoints
  getSignClasses: () => apiClient.get('/assessment/classes'),
  getAssessmentQuestions: (type, count, difficulty) => apiClient.get('/assessment/questions', { params: { type, count, difficulty: difficulty || undefined } }),
  submitAssessmentSession: (assessmentType, attemptIds) =>
    apiClient.post('/assessment/submit', { assessment_type: assessmentType, attempt_ids: attemptIds }),
  getAssessmentSession: (id) => apiClient.get(`/assessment/sessions/${id}`),
  getAssessmentProgress: () => apiClient.get('/assessment/progress'),

  // AI Feedback Engine
  generateFeedback: (data) => apiClient.post('/feedback/generate', data),

  // Dashboard
  getDashboardStats: () => apiClient.get('/dashboard/stats'),
  getAchievements: () => apiClient.get('/dashboard/achievements'),

  // ML Model Evaluation Endpoints (staff/admin only)
  getModelEvaluation: () => apiClient.get('/evaluation/model'),
  runEvaluation: (maxSamples) => apiClient.post('/evaluation/run', null, { params: maxSamples ? { max_samples: maxSamples } : {} }),
  getModelComparison: () => apiClient.get('/evaluation/models/compare'),
};
