import apiClient from './apiClient';

export const adminService = {
  getDashboard: () => apiClient.get('/admin/dashboard'),
  getUsers: () => apiClient.get('/admin/users'),
  getUsersActivity: () => apiClient.get('/admin/users/activity'),
  getActivity: (limit) => apiClient.get('/admin/activity', { params: { limit } }),
  createStaffUser: (data) => apiClient.post('/admin/users', data),
  updateUserRole: (userId, role) => apiClient.patch(`/admin/users/${userId}/role`, { role }),
  updateUserStatus: (userId, isActive) => apiClient.patch(`/admin/users/${userId}/status`, { is_active: isActive }),
};
