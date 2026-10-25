const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Roadmap = require('../src/models/Roadmap');
const {
  getRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  forkRoadmap,
  updateTopicCompletion,
} = require('../src/controllers/roadmapController');

test('Roadmap Controller Unit Tests', async (t) => {
  await t.test('getRoadmapById - returns 404 if roadmap does not exist in DB', async () => {
    const originalFindById = Roadmap.findById;
    Roadmap.findById = () => ({
      lean: async () => null,
    });

    const testId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: testId } };
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
      await getRoadmapById(req, res, (err) => {
        if (err) throw err;
      });

      assert.equal(statusSent, 404);
      assert.equal(jsonSent.error, 'Not Found');
    } finally {
      Roadmap.findById = originalFindById;
    }
  });

  await t.test('getRoadmapById - returns 403 if roadmap is private', async () => {
    const originalFindById = Roadmap.findById;
    const testId = new mongoose.Types.ObjectId().toString();

    Roadmap.findById = () => ({
      lean: async () => ({
        _id: testId,
        title: 'Secret Roadmap',
        visibility: 'private',
      }),
    });

    const req = { params: { id: testId } };
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
      await getRoadmapById(req, res, (err) => {
        if (err) throw err;
      });

      assert.equal(statusSent, 403);
      assert.equal(jsonSent.error, 'Forbidden');
    } finally {
      Roadmap.findById = originalFindById;
    }
  });

  await t.test('updateRoadmap - strips protected fields (version, ownerId, parentRoadmapId)', async () => {
    const originalFindByIdAndUpdate = Roadmap.findByIdAndUpdate;
    let capturedUpdates = null;

    Roadmap.findByIdAndUpdate = async (id, updatePayload, options) => {
      capturedUpdates = updatePayload.$set;
      return {
        _id: id,
        title: capturedUpdates.title,
        version: 1, // unchanged
      };
    };

    const testId = new mongoose.Types.ObjectId().toString();
    const req = {
      params: { id: testId },
      body: {
        title: 'Updated Algorithm Roadmap',
        version: 99, // Should be stripped
        ownerId: new mongoose.Types.ObjectId().toString(), // Should be stripped
        parentRoadmapId: new mongoose.Types.ObjectId().toString(), // Should be stripped
        createdAt: new Date().toISOString(), // Should be stripped
      },
    };

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
      await updateRoadmap(req, res, (err) => {
        if (err) throw err;
      });

      assert.equal(statusSent, 200);
      assert.equal(capturedUpdates.title, 'Updated Algorithm Roadmap');
      assert.equal(capturedUpdates.version, undefined, 'version should be stripped');
      assert.equal(capturedUpdates.ownerId, undefined, 'ownerId should be stripped');
      assert.equal(capturedUpdates.parentRoadmapId, undefined, 'parentRoadmapId should be stripped');
      assert.equal(capturedUpdates.createdAt, undefined, 'createdAt should be stripped');
    } finally {
      Roadmap.findByIdAndUpdate = originalFindByIdAndUpdate;
    }
  });

  await t.test('deleteRoadmap - returns 404 if roadmap does not exist', async () => {
    const originalFindByIdAndDelete = Roadmap.findByIdAndDelete;
    Roadmap.findByIdAndDelete = async () => null;

    const testId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: testId } };
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
      await deleteRoadmap(req, res, (err) => {
        if (err) throw err;
      });

      assert.equal(statusSent, 404);
      assert.equal(jsonSent.error, 'Not Found');
    } finally {
      Roadmap.findByIdAndDelete = originalFindByIdAndDelete;
    }
  });

  await t.test('getRoadmapById - safely returns creator name when ownerId is populated', async () => {
    const originalFindById = Roadmap.findById;
    const testId = new mongoose.Types.ObjectId().toString();
    const ownerId = new mongoose.Types.ObjectId().toString();

    Roadmap.findById = () => ({
      populate: () => ({
        lean: async () => ({
          _id: testId,
          title: 'Operating Systems',
          visibility: 'public',
          ownerId: {
            _id: ownerId,
            name: 'Linus Torvalds',
          },
        }),
      }),
    });

    const req = { params: { id: testId } };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await getRoadmapById(req, res, () => {});

      assert.equal(statusSent, 200);
      assert.equal(jsonSent.data.title, 'Operating Systems');
      assert.equal(jsonSent.data.ownerId.name, 'Linus Torvalds');
      assert.equal(jsonSent.data.ownerId.passwordHash, undefined, 'Private credentials must never be exposed');
    } finally {
      Roadmap.findById = originalFindById;
    }
  });

  await t.test('getRoadmapById - handles legacy roadmaps with null ownerId without error', async () => {
    const originalFindById = Roadmap.findById;
    const testId = new mongoose.Types.ObjectId().toString();

    Roadmap.findById = () => ({
      populate: () => ({
        lean: async () => ({
          _id: testId,
          title: 'Legacy Community Roadmap',
          visibility: 'public',
          ownerId: null,
        }),
      }),
    });

    const req = { params: { id: testId } };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await getRoadmapById(req, res, () => {});

      assert.equal(statusSent, 200);
      assert.equal(jsonSent.data.ownerId, null);
    } finally {
      Roadmap.findById = originalFindById;
    }
  });

  await t.test('forkRoadmap - rejects forking when user is unauthenticated', async () => {
    const testId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: testId }, body: {}, user: null };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    await forkRoadmap(req, res, () => {});
    assert.equal(statusSent, 401);
  });

  await t.test('forkRoadmap - rejects forking when source roadmap does not exist', async () => {
    const originalFindById = Roadmap.findById;
    Roadmap.findById = async () => null;

    const testId = new mongoose.Types.ObjectId().toString();
    const req = {
      params: { id: testId },
      body: {},
      user: { _id: new mongoose.Types.ObjectId() },
    };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await forkRoadmap(req, res, () => {});
      assert.equal(statusSent, 404);
    } finally {
      Roadmap.findById = originalFindById;
    }
  });

  await t.test('forkRoadmap - rejects forking private roadmap of another user with 403', async () => {
    const originalFindById = Roadmap.findById;
    const testId = new mongoose.Types.ObjectId();
    const otherOwnerId = new mongoose.Types.ObjectId();

    Roadmap.findById = async () => ({
      _id: testId,
      title: 'Secret Syllabus',
      visibility: 'private',
      ownerId: otherOwnerId,
    });

    const req = {
      params: { id: testId.toString() },
      body: {},
      user: { _id: new mongoose.Types.ObjectId() },
    };
    let statusSent = null;
    let jsonSent = null;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { jsonSent = data; return this; },
    };

    try {
      await forkRoadmap(req, res, () => {});
      assert.equal(statusSent, 403);
    } finally {
      Roadmap.findById = originalFindById;
    }
  });

  await t.test('updateTopicCompletion - rejects non-owner with 403', async () => {
    const originalFindById = Roadmap.findById;
    const testId = new mongoose.Types.ObjectId();
    const otherOwnerId = new mongoose.Types.ObjectId();

    Roadmap.findById = async () => ({
      _id: testId,
      ownerId: otherOwnerId,
    });

    const req = {
      params: { id: testId.toString(), topicId: new mongoose.Types.ObjectId().toString() },
      body: { isCompleted: true },
      user: { _id: new mongoose.Types.ObjectId() },
    };
    let statusSent = null;

    const res = {
      status(code) { statusSent = code; return this; },
      json(data) { return this; },
    };

    try {
      await updateTopicCompletion(req, res, () => {});
      assert.equal(statusSent, 403);
    } finally {
      Roadmap.findById = originalFindById;
    }
  });
});

