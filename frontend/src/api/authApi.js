import axiosInstance from './axiosInstance';

export const authApi = {
  login: (email, password) =>
    axiosInstance.post('/auth/login', { email, password }),

  getProfile: () =>
    axiosInstance.get('/auth/me'),

  changePassword: (currentPassword, newPassword, confirmPassword) =>
    axiosInstance.put('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    }),

  logout: () =>
    axiosInstance.post('/auth/logout'),
};

export default authApi;