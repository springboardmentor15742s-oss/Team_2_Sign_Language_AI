import apiClient from './apiClient';

export const platformService = {
  getStats: () => apiClient.get('/platform/stats'),
};
