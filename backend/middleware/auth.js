// =====================================================
// middleware/auth.js
// Protects routes by verifying the JWT sent either as an
// httpOnly cookie or as a Bearer token in the Authorization
// header. Attaches the authenticated user to req.user.
// =====================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Express middleware that verifies a JWT and loads the
 * corresponding user onto req.user. Throws a 401 error if
 * the token is missing, invalid, or the user no longer exists.
 */
const protect = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return next(new ApiError(500, 'Authentication is not configured'));
    }

    let token;

    // 1. Check for token in cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Fallback: check Authorization header (Bearer token)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token provided');
    }

    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user without password field
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new ApiError(401, 'Not authorized, user no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Not authorized, invalid or expired token'));
    }
    next(error);
  }
};

module.exports = { protect };
