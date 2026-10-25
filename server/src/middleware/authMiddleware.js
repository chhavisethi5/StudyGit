const User = require('../models/User');
const { extractToken, verifyToken } = require('../utils/tokenUtils');

/**
 * Protect route middleware: Enforces that a valid authenticated session exists.
 * Exposes the safe authenticated user object on req.user.
 */
const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. No active session token found.',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session token is invalid or has expired. Please log in again.',
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Malformed authentication token.',
      });
    }

    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'The user account for this session no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth middleware: Attaches req.user if a valid token is present,
 * but allows unauthenticated requests to proceed.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (user) {
          req.user = user;
        }
      }
    } catch {
      // Ignored for optional auth; unauthenticated access continues
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  optionalAuth,
};
