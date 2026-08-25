import axiosInstance from "./axiosInstance";

// -----------------------------------------------------
// Real backend authentication service
// -----------------------------------------------------
// Mock authentication is disabled.
// All authentication requests now go to the Express backend.
// -----------------------------------------------------

const authService = {
  // Register
  // POST /api/auth/register
  register: (payload) =>
    axiosInstance.post("/auth/register", payload),

  // Login
  // POST /api/auth/login
  login: (payload) =>
    axiosInstance.post("/auth/login", payload),

  // Logout
  // POST /api/auth/logout
  logout: () =>
    axiosInstance.post("/auth/logout"),

  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => axiosInstance.post('/auth/reset-password', payload),

  // Current logged-in user
  // GET /api/auth/me
  getProfile: () =>
    axiosInstance.get("/auth/me"),

  // Update profile
  // PUT /api/users/profile
  updateProfile: (payload) =>
    axiosInstance.put("/users/profile", payload),

  uploadAvatar: (formData) => axiosInstance.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  // Change password
  // PUT /api/users/change-password
  changePassword: (payload) =>
    axiosInstance.put("/users/change-password", payload),
};

export default authService;