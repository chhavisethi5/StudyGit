const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const checkDbConnection = require('../middleware/checkDbConnection');

const router = express.Router();

// Ensure MongoDB is connected before attempting any authentication database operations
router.use(checkDbConnection);

// Authentication endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
