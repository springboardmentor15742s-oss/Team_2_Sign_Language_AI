import apiClient from './apiClient';

export const achievementService = {
  getAchievements: () => apiClient.get('/achievements'),
};
