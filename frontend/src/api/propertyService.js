import axiosInstance from "./axiosInstance";

// -----------------------------------------------------
// Property Service
// -----------------------------------------------------
// All property requests now use the real Express backend.
// Mock property data is disabled.
// -----------------------------------------------------

const propertyService = {
  // ---------------------------------------------------
  // Get all properties
  // GET /api/properties
  // ---------------------------------------------------
  getAll: (params = {}) =>
    axiosInstance.get("/properties", {
      params,
    }),

  // ---------------------------------------------------
  // Get property by MongoDB ID
  // GET /api/properties/id/:id
  // ---------------------------------------------------
  getById: (id) =>
    axiosInstance.get(`/properties/id/${id}`),

  // ---------------------------------------------------
  // Get property by slug
  // GET /api/properties/slug/:slug
  // ---------------------------------------------------
  getBySlug: (slug) =>
    axiosInstance.get(`/properties/slug/${slug}`),

  // ---------------------------------------------------
  // Create property
  // POST /api/properties
  // Requires authentication
  // ---------------------------------------------------
  create: (formData) =>
    axiosInstance.post("/properties", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // ---------------------------------------------------
  // Update property
  // PUT /api/properties/:id
  // Requires authentication
  // ---------------------------------------------------
  update: (id, formData) =>
    axiosInstance.put(`/properties/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // ---------------------------------------------------
  // Delete property
  // DELETE /api/properties/:id
  // Requires authentication
  // ---------------------------------------------------
  remove: (id) =>
    axiosInstance.delete(`/properties/${id}`),
};

export default propertyService;