// =====================================================
// middleware/notFound.js
// Catches requests to undefined routes and forwards a
// 404 error to the global error handler.
// =====================================================

const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.originalUrl}`);
  next(error);
};

module.exports = notFound;
