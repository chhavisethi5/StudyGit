const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const { register, login, logout, getMe } = require('../src/controllers/authController');
const { COOKIE_NAME } = require('../src/utils/tokenUtils');

test('Auth Controller Unit Tests', async (t) => {
  await t.test('register - rejects registration if password is less than 8 characters', async () => {
    const req = {
      body: {
        name: 'Chhavi Sethi',
        email: 'chhavi@university.edu',
        password: 'short',
      },
    };

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    await register(req, res, () => {});
    assert.equal(statusSent, 400);
    assert.equal(jsonSent.error, 'Bad Request');
    assert.match(jsonSent.message, /at least 8 characters/i);
  });

  await t.test('register - rejects registration if email format is invalid', async () => {
    const req = {
      body: {
        name: 'Chhavi Sethi',
        email: 'invalid-email-format',
        password: 'ValidPassword123!',
      },
    };

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    await register(req, res, () => {});
    assert.equal(statusSent, 400);
    assert.equal(jsonSent.error, 'Bad Request');
    assert.match(jsonSent.message, /valid email address/i);
  });

  await t.test('register - rejects duplicate email with 409 Conflict', async () => {
    const originalFindOne = User.findOne;
    User.findOne = async () => ({ _id: new mongoose.Types.ObjectId(), email: 'existing@university.edu' });

    const req = {
      body: {
        name: 'New User',
        email: 'existing@university.edu',
        password: 'SecurePassword123!',
      },
    };

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await register(req, res, () => {});
      assert.equal(statusSent, 409);
      assert.equal(jsonSent.error, 'Conflict');
      assert.match(jsonSent.message, /already exists/i);
    } finally {
      User.findOne = originalFindOne;
    }
  });

  await t.test('register - creates user, sets HTTP-only cookie, and returns safe user profile', async () => {
    const originalFindOne = User.findOne;
    const originalCreate = User.create;
    const fakeId = new mongoose.Types.ObjectId();

    User.findOne = async () => null; // No duplicate
    User.create = async ({ name, email, passwordHash }) => ({
      _id: fakeId,
      name,
      email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      toSafeObject() {
        return { _id: fakeId, name, email };
      },
    });

    const req = {
      body: {
        name: 'Chhavi Sethi',
        email: 'Chhavi@University.EDU',
        password: 'ValidPassword123!',
      },
    };

    let statusSent = null;
    let jsonSent = null;
    let cookieSet = null;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
      cookie(name, val, opts) { cookieSet = { name, val, opts }; },
    };

    try {
      await register(req, res, () => {});

      assert.equal(statusSent, 201);
      assert.equal(jsonSent.success, true);
      assert.equal(jsonSent.user.email, 'chhavi@university.edu');
      assert.equal(jsonSent.user.passwordHash, undefined, 'passwordHash must never be exposed');

      assert.ok(cookieSet, 'Expected authentication cookie to be set');
      assert.equal(cookieSet.name, COOKIE_NAME);
      assert.equal(cookieSet.opts.httpOnly, true);
    } finally {
      User.findOne = originalFindOne;
      User.create = originalCreate;
    }
  });

  await t.test('login - returns 401 when account does not exist', async () => {
    const originalFindOne = User.findOne;
    User.findOne = async () => null;

    const req = {
      body: {
        email: 'nonexistent@university.edu',
        password: 'Password123!',
      },
    };

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await login(req, res, () => {});
      assert.equal(statusSent, 401);
      assert.equal(jsonSent.error, 'Unauthorized');
      assert.equal(jsonSent.message, 'Invalid email or password.');
    } finally {
      User.findOne = originalFindOne;
    }
  });

  await t.test('login - returns 401 when password does not match', async () => {
    const originalFindOne = User.findOne;
    const fakeUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'student@university.edu',
      comparePassword: async () => false,
    };
    User.findOne = async () => fakeUser;

    const req = {
      body: {
        email: 'student@university.edu',
        password: 'WrongPassword!',
      },
    };

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await login(req, res, () => {});
      assert.equal(statusSent, 401);
      assert.equal(jsonSent.error, 'Unauthorized');
      assert.equal(jsonSent.message, 'Invalid email or password.');
    } finally {
      User.findOne = originalFindOne;
    }
  });

  await t.test('login - authenticates successfully with correct credentials', async () => {
    const originalFindOne = User.findOne;
    const fakeId = new mongoose.Types.ObjectId();
    const fakeUser = {
      _id: fakeId,
      name: 'Chhavi Sethi',
      email: 'chhavi@university.edu',
      comparePassword: async () => true,
      toSafeObject() {
        return { _id: fakeId, name: 'Chhavi Sethi', email: 'chhavi@university.edu' };
      },
    };
    User.findOne = async () => fakeUser;

    const req = {
      body: {
        email: 'chhavi@university.edu',
        password: 'CorrectPassword123!',
      },
    };

    let statusSent = null;
    let jsonSent = null;
    let cookieSet = null;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
      cookie(name, val, opts) { cookieSet = { name, val, opts }; },
    };

    try {
      await login(req, res, () => {});

      assert.equal(statusSent, 200);
      assert.equal(jsonSent.success, true);
      assert.equal(jsonSent.user.name, 'Chhavi Sethi');
      assert.ok(cookieSet);
      assert.equal(cookieSet.name, COOKIE_NAME);
      assert.equal(cookieSet.opts.httpOnly, true);
    } finally {
      User.findOne = originalFindOne;
    }
  });

  await t.test('logout - clears authentication cookie', async () => {
    const req = {};
    let statusSent = null;
    let jsonSent = null;
    let clearedCookie = null;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
      clearCookie(name, opts) { clearedCookie = { name, opts }; },
    };

    await logout(req, res, () => {});

    assert.equal(statusSent, 200);
    assert.equal(jsonSent.success, true);
    assert.ok(clearedCookie);
    assert.equal(clearedCookie.name, COOKIE_NAME);
  });

  await t.test('getMe - returns user profile when authenticated', async () => {
    const fakeUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Chhavi',
      email: 'chhavi@university.edu',
      toSafeObject() {
        return { _id: this._id, name: this.name, email: this.email };
      },
    };

    const req = { user: fakeUser };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    await getMe(req, res, () => {});

    assert.equal(statusSent, 200);
    assert.equal(jsonSent.success, true);
    assert.equal(jsonSent.user.name, 'Chhavi');
  });

  await t.test('getMe - returns 401 when req.user is absent', async () => {
    const req = { user: null };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    await getMe(req, res, () => {});

    assert.equal(statusSent, 401);
    assert.equal(jsonSent.error, 'Unauthorized');
  });
});
