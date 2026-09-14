import apiClient from './apiClient';

export const lessonService = {
  getLesson: (id) => apiClient.get(`/lessons/${id}`),
  completeLesson: (id) => apiClient.post(`/lessons/${id}/complete`),
  getPractice: (id) => apiClient.get(`/lessons/${id}/practice`),
};
