import apiClient from './apiClient';

export const settingsService = {
  updatePassword: (data) => apiClient.put('/users/password', data),
};
