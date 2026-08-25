import axiosInstance from './axiosInstance';
export default { list: () => axiosInstance.get('/agreements'), complete: (id) => axiosInstance.post(`/agreements/complete/${id}`) };
