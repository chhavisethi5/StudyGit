// Load environment variables immediately before accessing configuration or modules
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const authRoutes = require('./routes/authRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Core middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/roadmaps', roadmapRoutes);

// Catch 404 routes and forward to error handler
app.use(notFoundHandler);

// Global centralized error handler
app.use(errorHandler);

let serverInstance = null;

/**
 * Initializes database connection before binding the HTTP port to accept requests.
 */
const startServer = async () => {
  // Connect to MongoDB Atlas / local database before accepting incoming requests
  await connectDB();

  serverInstance = app.listen(PORT, () => {
    console.log(`[StudyGit Server] Running on http://localhost:${PORT}`);
    console.log(`[StudyGit Server] Health check available at http://localhost:${PORT}/api/health`);
    console.log(`[StudyGit Server] Roadmaps API available at http://localhost:${PORT}/api/roadmaps`);
  });

  return serverInstance;
};

// Automatically start server when executed directly as application entry point
if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
  get server() {
    return serverInstance;
  },
};

