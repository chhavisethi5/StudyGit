const mongoose = require('mongoose');

const getHealthStatus = (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStates[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    status: 'ok',
    service: 'studygit-api',
    message: 'StudyGit API server is operational',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
  });
};

module.exports = {
  getHealthStatus,
};
