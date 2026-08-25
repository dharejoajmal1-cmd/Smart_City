// =====================================================
// utils/generateToken.js
// Generates a signed JWT for a given user ID and sets it
// as an httpOnly cookie on the response object.
// =====================================================

const jwt = require('jsonwebtoken');
const ApiError = require('./ApiError');

/**
 * Signs a JWT containing the user's ID.
 * @param {string} userId
 * @returns {string}
 */
const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError(500, 'JWT_SECRET is not defined in environment variables');
  }

  if (!userId) {
    throw new ApiError(500, 'User ID is required to generate authentication token');
  }

  return jwt.sign(
    { id: String(userId) },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Creates JWT and stores it in an httpOnly cookie.
 *
 * @param {Object} res
 * @param {string} userId
 * @returns {string}
 */
const generateToken = (res, userId) => {
  if (!res || typeof res.cookie !== 'function') {
    throw new ApiError(500, 'Invalid Express response object');
  }

  const token = signToken(userId);

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  return token;
};

module.exports = generateToken;