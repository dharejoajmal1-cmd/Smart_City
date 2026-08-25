import axiosInstance from './axiosInstance';
export default {
  create: (payload) => axiosInstance.post('/contact', payload),
  getAll: () => axiosInstance.get('/contact'),
  updateStatus: (id, status) => axiosInstance.put(`/contact/${id}/status`, { status }),
  remove: (id) => axiosInstance.delete(`/contact/${id}`),
};
