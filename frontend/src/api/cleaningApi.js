import axiosInstance from './axiosInstance';

const cleaningApi = {
  assignCleaning: (data) => axiosInstance.post('/cleaning/assign', data),
  
  startCleaning: (data) => axiosInstance.post('/cleaning/start', data),
  
  completeCleaning: (data) => axiosInstance.post('/cleaning/complete', data),
  
  skipCleaning: (id, reason) => axiosInstance.post(`/cleaning/${id}/skip`, { reason }),
  
  getAllCleaningLogs: (params) => axiosInstance.get('/cleaning', { params }),
  
  getActiveTasks: () => axiosInstance.get('/cleaning/active'),
  
  getMyTasks: (params) => axiosInstance.get('/cleaning/my-tasks', { params }),
  
  getMyStats: () => axiosInstance.get('/cleaning/my-stats'),
  
  getCleaningLogById: (id) => axiosInstance.get(`/cleaning/${id}`)
};

export default cleaningApi;