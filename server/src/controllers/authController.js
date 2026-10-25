const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, setAuthCookie, clearAuthCookie } = require('../utils/tokenUtils');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_SALT_ROUNDS = 12;

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Field existence validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name is required and must be a valid non-empty string.',
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email address is required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Please provide a valid email address format (e.g., student@university.edu).',
      });
    }

    if (!password || typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      });
    }

    // Check for existing account with same email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password securely with bcrypt
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user record
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    // Establish authenticated session via HTTP-only cookie
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    // Handle MongoDB duplicate key error (E11000) race condition
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email address already exists.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Authenticate user & establish session
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Look up user by normalized email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Generic error message to prevent account enumeration
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    // Verify password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    // Issue JWT inside HTTP-only cookie
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear authenticated cookie session
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (requires protect middleware)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No active session found.',
      });
    }

    res.status(200).json({
      success: true,
      user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
