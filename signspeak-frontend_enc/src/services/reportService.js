import apiClient from './apiClient';

export const reportService = {
  getOverview: (params) => apiClient.get('/reports/overview', { params }),
  getActivity: (params) => apiClient.get('/reports/activity', { params }),
  getAccuracyTrend: (params) => apiClient.get('/reports/accuracy-trend', { params }),
  getCategories: (params) => apiClient.get('/reports/categories', { params }),
  getSigns: (params) => apiClient.get('/reports/signs', { params }),
  getRecent: (params) => apiClient.get('/reports/recent', { params }),
  getAdminLearners: () => apiClient.get('/reports/admin/learners'),
  getModelPerformance: () => apiClient.get('/reports/model-performance'),
  exportReport: (params) => apiClient.get('/reports/export', { params, responseType: 'blob' }),

  // Legacy backwards-compatibility endpoints
  getLearningReport: (params) => apiClient.get('/reports/overview', { params }),
  getAssessmentReport: (params) => apiClient.get('/reports/overview', { params }),
  getAccuracyReport: (params) => apiClient.get('/reports/accuracy-trend', { params }),
  getProgressReport: (params) => apiClient.get('/reports/overview', { params }),
};
