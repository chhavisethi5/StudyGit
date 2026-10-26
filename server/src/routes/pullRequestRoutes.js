const express = require('express');
const {
  createPullRequest,
  getMyPullRequests,
  getReceivedPullRequests,
  getRoadmapPullRequests,
  getPullRequestById,
  acceptPullRequest,
  rejectPullRequest,
} = require('../controllers/pullRequestController');
const validateObjectId = require('../middleware/validateObjectId');
const checkDbConnection = require('../middleware/checkDbConnection');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Ensure MongoDB is connected before running any database queries
router.use(checkDbConnection);

// Enforce authentication for all pull request operations
router.use(protect);

// PR collection & personal filter routes
// /mine and /received must be defined before /:id parameterized route
router.route('/')
  .post(createPullRequest);

router.get('/mine', getMyPullRequests);
router.get('/received', getReceivedPullRequests);
router.get('/roadmap/:roadmapId', validateObjectId('roadmapId'), getRoadmapPullRequests);

// Single PR detail and resolution routes
router.route('/:id')
  .get(validateObjectId('id'), getPullRequestById);

router.post('/:id/accept', validateObjectId('id'), acceptPullRequest);
router.post('/:id/reject', validateObjectId('id'), rejectPullRequest);

module.exports = router;
