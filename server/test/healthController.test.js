const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { getHealthStatus } = require('../src/controllers/healthController');

test('Health Controller Tests', async (t) => {
  await t.test('getHealthStatus - reports disconnected database state when readyState is 0', () => {
    const originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 0,
      configurable: true,
    });

    const req = {};
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(data) {
        jsonSent = data;
        return this;
      },
    };

    try {
      getHealthStatus(req, res);

      assert.equal(statusSent, 200);
      assert.equal(jsonSent.status, 'ok');
      assert.equal(jsonSent.service, 'studygit-api');
      assert.equal(jsonSent.database, 'disconnected');
      assert.ok(jsonSent.timestamp);
      assert.equal(typeof jsonSent.uptime, 'number');
    } finally {
      Object.defineProperty(mongoose.connection, 'readyState', {
        value: originalReadyState,
        configurable: true,
      });
    }
  });

  await t.test('getHealthStatus - reports connected database state when readyState is 1', () => {
    const originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, 'readyState', {
      value: 1,
      configurable: true,
    });

    const req = {};
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(data) {
        jsonSent = data;
        return this;
      },
    };

    try {
      getHealthStatus(req, res);

      assert.equal(statusSent, 200);
      assert.equal(jsonSent.status, 'ok');
      assert.equal(jsonSent.service, 'studygit-api');
      assert.equal(jsonSent.database, 'connected');
      assert.ok(jsonSent.timestamp);
      assert.equal(typeof jsonSent.uptime, 'number');
    } finally {
      Object.defineProperty(mongoose.connection, 'readyState', {
        value: originalReadyState,
        configurable: true,
      });
    }
  });
});
