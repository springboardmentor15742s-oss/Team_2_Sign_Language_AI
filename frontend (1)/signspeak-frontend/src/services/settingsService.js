import apiClient from './apiClient';

export const settingsService = {
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.put('/settings', data),
  updatePassword: (data) => apiClient.put('/settings/password', data),
};
