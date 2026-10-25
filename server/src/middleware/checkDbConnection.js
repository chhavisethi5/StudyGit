const mongoose = require('mongoose');

/**
 * Middleware to check whether MongoDB connection is ready before querying.
 * Ensures the API fails gracefully with 503 instead of hanging or claiming success when DB is offline.
 */
const checkDbConnection = (req, res, next) => {
  // readyState 1 = connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Database connection is currently unavailable. Please verify MongoDB is running and MONGODB_URI is properly configured.',
    });
  }
  next();
};

module.exports = checkDbConnection;
