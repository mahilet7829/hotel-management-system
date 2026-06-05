import axiosInstance from './axiosInstance';

const notificationApi = {
  getNotifications: (params) => axiosInstance.get('/notifications', { params }),
  
  getUnreadCount: () => axiosInstance.get('/notifications/unread-count'),
  
  markAsRead: (id) => axiosInstance.post(`/notifications/${id}/read`),
  
  markAllAsRead: () => axiosInstance.post('/notifications/read-all')
};

export default notificationApi;