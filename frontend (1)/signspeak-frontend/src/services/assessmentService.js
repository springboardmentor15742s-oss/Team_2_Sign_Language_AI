import apiClient from './apiClient';

export const assessmentService = {
  getAssessments: () => apiClient.get('/assessments'),
  getAssessment: (id) => apiClient.get(`/assessments/${id}`),
  submitAssessment: (id, answers) => apiClient.post(`/assessments/${id}/submit`, { answers }),
  getResults: (id) => apiClient.get(`/assessments/${id}/results`),
};
