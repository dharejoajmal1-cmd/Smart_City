// =====================================================
// middleware/admin.js
// Restricts access to routes based on user role. Must be
// used AFTER the `protect` middleware so req.user exists.
// =====================================================

const ApiError = require('../utils/ApiError');

/**
 * Middleware that only allows users with the 'admin' role
 * to proceed to the next handler.
 */
const admin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Not authorized, please log in'));
  }

  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Access denied, admin privileges required'));
  }

  next();
};

/**
 * Factory function to build middleware that allows access
 * only to users whose role is included in `roles`.
 * Usage: authorizeRoles('admin', 'agent')
 */
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Not authorized, please log in'));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, `Access denied, requires one of the following roles: ${roles.join(', ')}`));
  }

  next();
};

module.exports = { admin, authorizeRoles };
