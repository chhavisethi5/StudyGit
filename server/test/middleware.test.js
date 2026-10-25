const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const validateObjectId = require('../src/middleware/validateObjectId');
const checkDbConnection = require('../src/middleware/checkDbConnection');
const { errorHandler } = require('../src/middleware/errorHandler');

test('Middleware Tests', async (t) => {
  await t.test('validateObjectId - rejects invalid IDs with 400', () => {
    const middleware = validateObjectId('id');
    const req = { params: { id: 'invalid-id-123' } };
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

    let nextCalled = false;
    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false, 'next() should not be called for invalid ID');
    assert.equal(statusSent, 400);
    assert.equal(jsonSent.error, 'Bad Request');
  });

  await t.test('validateObjectId - accepts valid 24-char hex ObjectId', () => {
    const middleware = validateObjectId('id');
    const validId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: validId } };
    const res = {};

    let nextCalled = false;
    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true, 'next() should be called for valid ObjectId');
  });

  await t.test('checkDbConnection - returns 503 if mongoose is not connected', () => {
    // When readyState !== 1 (0 = disconnected)
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

    let nextCalled = false;
    checkDbConnection(req, res, () => {
      nextCalled = true;
    });

    if (mongoose.connection.readyState !== 1) {
      assert.equal(nextCalled, false);
      assert.equal(statusSent, 503);
      assert.equal(jsonSent.error, 'Service Unavailable');
    }
  });

  await t.test('errorHandler - formats malformed JSON SyntaxError as 400', () => {
    const error = new SyntaxError('Unexpected token in JSON');
    error.status = 400;
    error.body = '{ bad json';

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

    errorHandler(error, req, res, () => {});

    assert.equal(statusSent, 400);
    assert.equal(jsonSent.error, 'Bad Request');
    assert.equal(jsonSent.message, 'Malformed JSON payload in request body');
  });
});
