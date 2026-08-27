import apiClient from './apiClient';

export const profileService = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  updatePassword: (data) => apiClient.put('/users/password', data),
};
