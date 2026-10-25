const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Ensure environment variables are loaded prior to reading process.env
dotenv.config();

const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('[MongoDB] MONGODB_URI environment variable is not defined. Database connection skipped.');
    return null;
  }

  // Gracefully handle common copy-paste issue where prefix 'MONGODB_URI=' is included in value
  mongoUri = mongoUri.trim();
  if (mongoUri.startsWith('MONGODB_URI=')) {
    mongoUri = mongoUri.slice('MONGODB_URI='.length).trim();
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // Redact any potential credentials in error message to prevent accidental leakage in logs
    const safeErrorMsg = error.message
      ? error.message.replace(/:\/\/[^@]+@/, '://<credentials>@')
      : 'Unknown connection error';
    console.error(`[MongoDB] Connection error: ${safeErrorMsg}`);
    // Non-blocking: We do not process.exit(1) so the health API remains accessible
    return null;
  }
};

module.exports = connectDB;

