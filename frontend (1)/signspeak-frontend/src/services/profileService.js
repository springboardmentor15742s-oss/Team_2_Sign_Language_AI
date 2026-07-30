import apiClient from './apiClient';

export const profileService = {
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (data) => apiClient.put('/profile', data),
  updateAvatar: (formData) => apiClient.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getProgress: () => apiClient.get('/profile/progress'),
  getHistory: () => apiClient.get('/profile/history'),
};
