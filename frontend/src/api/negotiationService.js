import axiosInstance from './axiosInstance';
export default { list: (id) => axiosInstance.get(`/negotiations/${id}/messages`), send: (id,message) => axiosInstance.post(`/negotiations/${id}/messages`,{message}) };
