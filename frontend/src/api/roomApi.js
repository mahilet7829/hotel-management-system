import axiosInstance from './axiosInstance';

const roomApi = {
  getRooms: (params) => axiosInstance.get('/rooms', { params }),
  getRoomById: (id) => axiosInstance.get(`/rooms/${id}`),
  getRoomByNumber: (number) => axiosInstance.get(`/rooms/number/${number}`),
  createRoom: (data) => axiosInstance.post('/rooms', data),
  updateRoom: (id, data) => axiosInstance.put(`/rooms/${id}`, data),
  updateRoomStatus: (id, data) => axiosInstance.patch(`/rooms/${id}/status`, data),
  deleteRoom: (id) => axiosInstance.delete(`/rooms/${id}`),
  getRoomSummary: () => axiosInstance.get('/rooms/summary'),
};

export default roomApi;