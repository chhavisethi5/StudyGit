const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'token';
const JWT_EXPIRES_IN = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'studygit-jwt-dev-secret-key-change-in-prod';
};

/**
 * Generate a signed JWT for the given user ID
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {string}
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId.toString() }, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify a JWT string and return its payload
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

/**
 * Set a secure, HTTP-only cookie with the JWT on the response object
 * @param {import('express').Response} res
 * @param {string} token
 */
const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
};

/**
 * Clear the authentication cookie
 * @param {import('express').Response} res
 */
const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
};

/**
 * Extract token from either the HTTP-only cookie or Bearer Authorization header
 * @param {import('express').Request} req
 * @returns {string|null}
 */
const extractToken = (req) => {
  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }

  // 2. Check Authorization: Bearer <token> header fallback
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
};

module.exports = {
  COOKIE_NAME,
  generateToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
  extractToken,
  getJwtSecret,
};
