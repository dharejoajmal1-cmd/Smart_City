// =====================================================
// utils/ApiResponse.js
// Standardized success response format used across all
// API endpoints: { success, statusCode, message, data }
// =====================================================

class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Success message
   * @param {*} data - Response payload
   */
  constructor(statusCode = 200, message = 'Success', data = {}) {
    this.success =
      Number.isInteger(statusCode) &&
      statusCode >= 200 &&
      statusCode < 400;

    this.statusCode =
      Number.isInteger(statusCode) ? statusCode : 200;

    this.message = message || 'Success';

    this.data = data ?? {};

    // Prevent accidental modification after creation
    Object.freeze(this);
  }
}

module.exports = ApiResponse;