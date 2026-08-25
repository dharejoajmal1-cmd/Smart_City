import axiosInstance from "./axiosInstance";

// Real backend user service
const userService = {
  // GET /api/users
  getAll: (params = {}) =>
    axiosInstance.get("/users", { params }),

  // GET /api/users/:id
  getById: (id) =>
    axiosInstance.get(`/users/${id}`),

  // PUT /api/users/:id/role
  updateRole: (id, role) =>
    axiosInstance.put(`/users/${id}/role`, { role }),

  // DELETE /api/users/:id
  remove: (id) =>
    axiosInstance.delete(`/users/${id}`),
};

export default userService;