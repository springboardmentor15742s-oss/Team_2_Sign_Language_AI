import apiClient from './apiClient';

export const adminService = {
  getDashboard: () => apiClient.get('/admin/dashboard'),

  getUsers: () => apiClient.get('/admin/users'),

  createUser: (data) => apiClient.post('/admin/users', data),

  updateRole: (userId, role) =>
    apiClient.patch(`/admin/users/${userId}/role`, { role }),

  updateStatus: (userId, isActive) =>
    apiClient.patch(`/admin/users/${userId}/status`, {
      is_active: isActive,
    }),
};