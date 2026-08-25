// =====================================================
// utils/ApiError.js
// Custom error class used throughout the application to
// represent operational errors with an HTTP status code.
// =====================================================

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array} errors - Optional validation errors
   * @param {string} stack - Optional custom stack
   */
  constructor(
    statusCode = 500,
    message = 'Something went wrong',
    errors = [],
    stack = ''
  ) {
    super(message);

    this.name = 'ApiError';

    this.statusCode =
      Number.isInteger(statusCode) && statusCode >= 100 && statusCode <= 599
        ? statusCode
        : 500;

    this.success = false;
    this.message = message;
    this.errors = Array.isArray(errors) ? errors : [];
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;