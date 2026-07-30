import apiClient from './apiClient';

export const reportService = {
  getLearningReport: (params) => apiClient.get('/reports/learning', { params }),
  getAssessmentReport: (params) => apiClient.get('/reports/assessment', { params }),
  getAccuracyReport: (params) => apiClient.get('/reports/accuracy', { params }),
  getProgressReport: (params) => apiClient.get('/reports/progress', { params }),
};
