import apiClient from './apiClient';

export const courseService = {
  getCourses: (params) => apiClient.get('/courses', { params }),
  getCourse: (id) => apiClient.get(`/courses/${id}`),
  getLessons: (courseId) => apiClient.get(`/courses/${courseId}/lessons`),
  getLesson: (courseId, lessonId) => apiClient.get(`/courses/${courseId}/lessons/${lessonId}`),
  enroll: (courseId) => apiClient.post(`/courses/${courseId}/enroll`),
};
