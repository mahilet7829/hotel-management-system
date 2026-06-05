import axiosInstance from './axiosInstance';

const orderApi = {
  getOrders: (params) => axiosInstance.get('/orders', { params }),
  getKitchenOrders: () => axiosInstance.get('/orders/kitchen'),
  getMyOrders: (params) => axiosInstance.get('/orders/my-orders', { params }),
  getOrderById: (id) => axiosInstance.get(`/orders/${id}`),
  createOrder: (data) => axiosInstance.post('/orders', data),
  updateOrderStatus: (id, data) => axiosInstance.patch(`/orders/${id}/status`, data),
  cancelOrder: (id) => axiosInstance.delete(`/orders/${id}`),
};

export default orderApi;