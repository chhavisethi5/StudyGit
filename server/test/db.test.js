const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

test('Database Connection Module Tests', async (t) => {
  await t.test('connectDB - returns null when MONGODB_URI is undefined without throwing', async () => {
    const originalUri = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;

    try {
      const result = await connectDB();
      assert.equal(result, null);
    } finally {
      process.env.MONGODB_URI = originalUri;
    }
  });

  await t.test('connectDB - strips accidental MONGODB_URI= prefix before connecting', async () => {
    const originalUri = process.env.MONGODB_URI;
    const originalConnect = mongoose.connect;
    let passedUri = null;

    mongoose.connect = async (uri) => {
      passedUri = uri;
      return { connection: { host: 'test-host' } };
    };

    process.env.MONGODB_URI = 'MONGODB_URI=mongodb://localhost:27017/testdb';

    try {
      const conn = await connectDB();
      assert.equal(passedUri, 'mongodb://localhost:27017/testdb');
      assert.equal(conn.connection.host, 'test-host');
    } finally {
      process.env.MONGODB_URI = originalUri;
      mongoose.connect = originalConnect;
    }
  });
});
