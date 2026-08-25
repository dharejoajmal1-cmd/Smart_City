import axiosInstance from "./axiosInstance";

// -----------------------------------------------------
// Inquiry Service
// -----------------------------------------------------
// All inquiry requests use the real Express backend.
// Mock data is disabled.
// -----------------------------------------------------

const inquiryService = {
  // ---------------------------------------------------
  // Create inquiry
  // POST /api/inquiries
  // ---------------------------------------------------
  create: (payload) =>
    axiosInstance.post("/inquiries", payload),

  // ---------------------------------------------------
  // Get inquiries
  // GET /api/inquiries
  // ---------------------------------------------------
  getAll: (params = {}) =>
    axiosInstance.get("/inquiries", {
      params,
    }),

  // ---------------------------------------------------
  // Update inquiry status
  // PUT /api/inquiries/:id/status
  // ---------------------------------------------------
  updateStatus: (id, status) =>
    axiosInstance.put(
      `/inquiries/${id}/status`,
      { status }
    ),

  // ---------------------------------------------------
  // Delete inquiry
  // DELETE /api/inquiries/:id
  // ---------------------------------------------------
  remove: (id) =>
    axiosInstance.delete(`/inquiries/${id}`),
};

export default inquiryService;