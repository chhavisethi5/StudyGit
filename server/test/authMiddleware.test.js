const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');
const Roadmap = require('../src/models/Roadmap');
const { protect } = require('../src/middleware/authMiddleware');
const { createRoadmap, updateRoadmap, deleteRoadmap, getMyRoadmaps, getRoadmapById } = require('../src/controllers/roadmapController');
const { generateToken, getJwtSecret } = require('../src/utils/tokenUtils');

test('Auth Middleware & Roadmap Ownership Tests', async (t) => {
  await t.test('protect - rejects request with 401 when no token is present', async () => {
    const req = { cookies: {}, headers: {} };
    let statusSent = null;
    let jsonSent = null;
    let nextCalled = false;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    await protect(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(statusSent, 401);
    assert.equal(jsonSent.error, 'Unauthorized');
  });

  await t.test('protect - rejects request with 401 when token is invalid or expired', async () => {
    const req = { cookies: { token: 'invalid.jwt.token' }, headers: {} };
    let statusSent = null;
    let jsonSent = null;
    let nextCalled = false;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    await protect(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(statusSent, 401);
    assert.equal(jsonSent.error, 'Unauthorized');
  });

  await t.test('protect - attaches req.user when valid JWT is supplied', async () => {
    const originalFindById = User.findById;
    const testUserId = new mongoose.Types.ObjectId();
    const token = generateToken(testUserId);

    User.findById = (id) => ({
      select: async () => ({
        _id: testUserId,
        name: 'Chhavi Sethi',
        email: 'chhavi@university.edu',
      }),
    });

    const req = { cookies: { token }, headers: {} };
    const res = {};
    let nextCalled = false;

    try {
      await protect(req, res, () => { nextCalled = true; });

      assert.equal(nextCalled, true);
      assert.ok(req.user);
      assert.equal(req.user._id.toString(), testUserId.toString());
      assert.equal(req.user.name, 'Chhavi Sethi');
    } finally {
      User.findById = originalFindById;
    }
  });

  await t.test('createRoadmap - enforces ownerId from req.user and ignores client-provided ownerId', async () => {
    const originalCreate = Roadmap.create;
    const authenticatedUserId = new mongoose.Types.ObjectId();
    const attackerSuppliedId = new mongoose.Types.ObjectId();
    let capturedPayload = null;

    Roadmap.create = async (data) => {
      capturedPayload = data;
      return { _id: new mongoose.Types.ObjectId(), ...data };
    };

    const req = {
      user: { _id: authenticatedUserId },
      body: {
        title: 'Owned Roadmap',
        subject: 'Computer Science',
        ownerId: attackerSuppliedId, // Should be ignored!
      },
    };

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await createRoadmap(req, res, () => {});

      assert.equal(statusSent, 201);
      assert.equal(
        capturedPayload.ownerId.toString(),
        authenticatedUserId.toString(),
        'ownerId must be derived from req.user._id'
      );
      assert.notEqual(
        capturedPayload.ownerId.toString(),
        attackerSuppliedId.toString(),
        'client-supplied ownerId must be rejected'
      );
    } finally {
      Roadmap.create = originalCreate;
    }
  });

  await t.test('updateRoadmap - rejects modification of another user roadmap with 403', async () => {
    const originalFindById = Roadmap.findById;
    const realOwnerId = new mongoose.Types.ObjectId();
    const attackerId = new mongoose.Types.ObjectId();
    const roadmapId = new mongoose.Types.ObjectId();

    Roadmap.findById = async () => ({
      _id: roadmapId,
      title: 'Original Title',
      ownerId: realOwnerId,
    });

    const req = {
      user: { _id: attackerId },
      params: { id: roadmapId.toString() },
      body: { title: 'Hacked Title' },
    };

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await updateRoadmap(req, res, () => {});

      assert.equal(statusSent, 403);
      assert.equal(jsonSent.error, 'Forbidden');
    } finally {
      Roadmap.findById = originalFindById;
    }
  });

  await t.test('deleteRoadmap - rejects deletion of another user roadmap with 403', async () => {
    const originalFindById = Roadmap.findById;
    const realOwnerId = new mongoose.Types.ObjectId();
    const attackerId = new mongoose.Types.ObjectId();
    const roadmapId = new mongoose.Types.ObjectId();

    Roadmap.findById = async () => ({
      _id: roadmapId,
      ownerId: realOwnerId,
    });

    const req = {
      user: { _id: attackerId },
      params: { id: roadmapId.toString() },
    };

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await deleteRoadmap(req, res, () => {});

      assert.equal(statusSent, 403);
      assert.equal(jsonSent.error, 'Forbidden');
    } finally {
      Roadmap.findById = originalFindById;
    }
  });

  await t.test('getMyRoadmaps - queries only roadmaps matching req.user._id', async () => {
    const originalFind = Roadmap.find;
    const authenticatedUserId = new mongoose.Types.ObjectId();
    let capturedQuery = null;

    Roadmap.find = (query) => {
      capturedQuery = query;
      return {
        sort: () => ({
          lean: async () => [
            { _id: new mongoose.Types.ObjectId(), title: 'My Roadmap 1', ownerId: authenticatedUserId },
          ],
        }),
      };
    };

    const req = { user: { _id: authenticatedUserId } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await getMyRoadmaps(req, res, () => {});

      assert.equal(statusSent, 200);
      assert.equal(capturedQuery.ownerId.toString(), authenticatedUserId.toString());
      assert.equal(jsonSent.count, 1);
    } finally {
      Roadmap.find = originalFind;
    }
  });

  await t.test('getRoadmapById - allows owner to view private roadmap', async () => {
    const originalFindById = Roadmap.findById;
    const ownerId = new mongoose.Types.ObjectId();
    const roadmapId = new mongoose.Types.ObjectId();

    Roadmap.findById = () => ({
      lean: async () => ({
        _id: roadmapId,
        title: 'Secret Roadmap',
        visibility: 'private',
        ownerId,
      }),
    });

    const req = {
      user: { _id: ownerId },
      params: { id: roadmapId.toString() },
    };

    let statusSent = null;
    let jsonSent = null;
    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await getRoadmapById(req, res, () => {});

      assert.equal(statusSent, 200);
      assert.equal(jsonSent.data.title, 'Secret Roadmap');
    } finally {
      Roadmap.findById = originalFindById;
    }
  });
});
