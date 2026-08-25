// =====================================================
// middleware/errorHandler.js
// Centralized error handling middleware. Converts known
// error types (Mongoose, JWT, ApiError) into a consistent
// JSON response shape: { success, message, data }
// =====================================================

const ApiError = require('../utils/ApiError');

/**
 * Normalizes various error types into an ApiError instance
 * so the response format stays consistent.
 */
const normalizeError = (err) => {
  let error = err;

  // Mongoose invalid ObjectId / bad query value (CastError)
  if (err.name === 'CastError') {
    // err.value can be an object (e.g. an accidentally-empty filter like
    // `{}`), a string, a number, etc. Template-literal interpolating an
    // object always yields the useless "[object Object]" string, so
    // serialize non-primitive values with JSON.stringify instead.
    const displayValue =
      typeof err.value === 'object' && err.value !== null
        ? JSON.stringify(err.value)
        : String(err.value);
    error = new ApiError(400, `Invalid value for field '${err.path}': ${displayValue}`);
  }

  // Mongoose duplicate key error (e.g. unique email)
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new ApiError(409, `Duplicate value for field '${field}'. Please use another value.`);
  }

  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(400, messages.join('. '), messages);
  }

  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  } else if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token has expired');
  }

  // Multer file upload errors
  else if (err.name === 'MulterError') {
    error = new ApiError(400, `File upload error: ${err.message}`);
  }

  // If it's not already an ApiError and not handled above, wrap it
  else if (!(err instanceof ApiError)) {
    const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    error = new ApiError(statusCode, err.message || 'Internal Server Error');
  }

  return error;
};

/**
 * Express error-handling middleware. Must be registered last,
 * after all routes and other middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);

  // Log full error details on the server for debugging
  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${error.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    data: null,
    errors: error.errors && error.errors.length ? error.errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};

module.exports = errorHandler;
