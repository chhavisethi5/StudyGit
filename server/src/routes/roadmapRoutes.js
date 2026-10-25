const express = require('express');
const {
  getRoadmaps,
  getMyRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  forkRoadmap,
  updateTopicCompletion,
} = require('../controllers/roadmapController');
const validateObjectId = require('../middleware/validateObjectId');
const checkDbConnection = require('../middleware/checkDbConnection');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure MongoDB is connected before attempting any roadmap database queries
router.use(checkDbConnection);

// Authenticated user's personal roadmaps
// MUST be registered before /:id parameterized route to prevent 'mine' matching as an ObjectId
router.get('/mine', protect, getMyRoadmaps);

// Collection routes
router.route('/')
  .get(getRoadmaps)
  .post(protect, createRoadmap);

// Fork & Personalize Route
router.post('/:id/fork', validateObjectId('id'), protect, forkRoadmap);

// Topic Completion Route
router.patch(
  '/:id/topics/:topicId/complete',
  validateObjectId('id'),
  validateObjectId('topicId'),
  protect,
  updateTopicCompletion
);

// Document routes with ObjectId validation
router.route('/:id')
  .get(validateObjectId('id'), optionalAuth, getRoadmapById)
  .patch(validateObjectId('id'), protect, updateRoadmap)
  .delete(validateObjectId('id'), protect, deleteRoadmap);

module.exports = router;
