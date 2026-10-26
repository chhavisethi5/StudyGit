const mongoose = require('mongoose');
const PullRequest = require('../models/PullRequest');
const Roadmap = require('../models/Roadmap');
// Ensure User model is loaded for Mongoose population
require('../models/User');

/**
 * Safely extracts an ID string whether populated as an object or raw ObjectId
 * @param {Object|string|mongoose.Types.ObjectId} ref
 * @returns {string|null}
 */
const getIdString = (ref) => {
  if (!ref) return null;
  if (typeof ref === 'object' && ref._id) {
    return ref._id.toString();
  }
  return ref.toString();
};

/**
 * Helper to validate HTTP/HTTPS URLs
 */
const isValidHttpUrl = (val) => {
  if (!val || typeof val !== 'string') return false;
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Resolves the original roadmap's module, topic, and resource for a proposed change.
 * Handles:
 * 1. Explicit mapping via originalModuleId / originalTopicId / originalResourceId (new forks)
 * 2. Direct ID matches if original IDs were provided directly in change.moduleId / change.topicId
 * 3. Fallback matching for existing/legacy forks created before explicit references were tracked:
 *    - Matches modules by case-insensitive title, disambiguating by order if needed.
 *    - Matches topics by case-insensitive title, disambiguating by order if needed.
 *    - Matches resources by URL or title.
 *    - Throws a descriptive error if matching is ambiguous or target cannot be found.
 */
const resolveProposedChangeTargets = (originalRoadmap, fork, change, itemIndex) => {
  const itemNum = itemIndex + 1;
  const {
    type,
    moduleId,
    originalModuleId,
    forkModuleId,
    moduleTitle,
    topicId,
    originalTopicId,
    forkTopicId,
    topicTitle,
    targetResourceId,
    originalResourceId,
    forkResourceId,
    targetResourceTitle,
  } = change;

  // 1. Locate fork subdocuments (if available on the fork)
  const fModId = forkModuleId || moduleId;
  let forkModule = (fork.modules || []).find(
    (m) => m._id && fModId && m._id.toString() === fModId.toString()
  );
  if (!forkModule && moduleTitle) {
    forkModule = (fork.modules || []).find(
      (m) => m.title && m.title.trim().toLowerCase() === moduleTitle.trim().toLowerCase()
    );
  }

  const fTopId = forkTopicId || topicId;
  let forkTopic = null;
  if (forkModule) {
    forkTopic = (forkModule.topics || []).find(
      (t) => t._id && fTopId && t._id.toString() === fTopId.toString()
    );
    if (!forkTopic && topicTitle) {
      forkTopic = (forkModule.topics || []).find(
        (t) => t.title && t.title.trim().toLowerCase() === topicTitle.trim().toLowerCase()
      );
    }
  }

  // 2. Resolve Target Module in originalRoadmap
  let targetModule = null;

  // A. Check explicit originalModuleId from request or fork subdocument
  const candidateModuleIds = [
    originalModuleId,
    forkModule?.originalModuleId,
    moduleId,
  ].filter((id) => id && mongoose.Types.ObjectId.isValid(id));

  for (const candidateId of candidateModuleIds) {
    const found = (originalRoadmap.modules || []).find(
      (m) => m._id && m._id.toString() === candidateId.toString()
    );
    if (found) {
      targetModule = found;
      break;
    }
  }

  // B. Fallback matching for existing forks by title and order
  if (!targetModule) {
    const searchModuleTitle = (forkModule?.title || moduleTitle || '').trim().toLowerCase();
    if (!searchModuleTitle) {
      const err = new Error(`Change #${itemNum}: Target module identifier or title is missing.`);
      err.status = 400;
      throw err;
    }

    const titleMatches = (originalRoadmap.modules || []).filter(
      (m) => m.title && m.title.trim().toLowerCase() === searchModuleTitle
    );

    if (titleMatches.length === 1) {
      targetModule = titleMatches[0];
    } else if (titleMatches.length > 1) {
      // Disambiguate by module order if defined
      const orderMatches = titleMatches.filter(
        (m) => forkModule && m.order !== undefined && m.order === forkModule.order
      );
      if (orderMatches.length === 1) {
        targetModule = orderMatches[0];
      } else {
        const err = new Error(
          `Change #${itemNum}: Cannot reliably resolve target module '${forkModule?.title || moduleTitle}'. Multiple modules in the original roadmap share this title. Please create a new fork to submit proposals.`
        );
        err.status = 400;
        throw err;
      }
    } else {
      const err = new Error(
        `Change #${itemNum}: Target module '${forkModule?.title || moduleTitle || moduleId}' not found in original roadmap.`
      );
      err.status = 400;
      throw err;
    }
  }

  // 3. Resolve Target Topic in targetModule
  let targetTopic = null;

  // A. Check explicit originalTopicId from request or fork subdocument
  const candidateTopicIds = [
    originalTopicId,
    forkTopic?.originalTopicId,
    topicId,
  ].filter((id) => id && mongoose.Types.ObjectId.isValid(id));

  for (const candidateId of candidateTopicIds) {
    const found = (targetModule.topics || []).find(
      (t) => t._id && t._id.toString() === candidateId.toString()
    );
    if (found) {
      targetTopic = found;
      break;
    }
  }

  // B. Fallback matching for existing forks by title and order
  if (!targetTopic) {
    const searchTopicTitle = (forkTopic?.title || topicTitle || '').trim().toLowerCase();
    if (!searchTopicTitle) {
      const err = new Error(`Change #${itemNum}: Target topic identifier or title is missing.`);
      err.status = 400;
      throw err;
    }

    const topicMatches = (targetModule.topics || []).filter(
      (t) => t.title && t.title.trim().toLowerCase() === searchTopicTitle
    );

    if (topicMatches.length === 1) {
      targetTopic = topicMatches[0];
    } else if (topicMatches.length > 1) {
      // Disambiguate by topic order if defined
      const orderMatches = topicMatches.filter(
        (t) => forkTopic && t.order !== undefined && t.order === forkTopic.order
      );
      if (orderMatches.length === 1) {
        targetTopic = orderMatches[0];
      } else {
        const err = new Error(
          `Change #${itemNum}: Cannot reliably resolve target topic '${forkTopic?.title || topicTitle}'. Multiple topics in module '${targetModule.title}' share this title. Please create a new fork to submit proposals.`
        );
        err.status = 400;
        throw err;
      }
    } else {
      const err = new Error(
        `Change #${itemNum}: Target topic '${forkTopic?.title || topicTitle || topicId}' not found in module '${targetModule.title}'.`
      );
      err.status = 400;
      throw err;
    }
  }

  // 4. Resolve Target Resource in targetTopic (for replace_resource)
  let targetResource = null;
  if (type === 'replace_resource') {
    const fResId = forkResourceId || targetResourceId;
    let forkRes = null;
    if (forkTopic) {
      forkRes = (forkTopic.resources || []).find(
        (r) => r._id && fResId && r._id.toString() === fResId.toString()
      );
    }

    // A. Check explicit originalResourceId from request or fork subdocument
    const candidateResourceIds = [
      originalResourceId,
      forkRes?.originalResourceId,
      targetResourceId,
    ].filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    for (const candidateId of candidateResourceIds) {
      const found = (targetTopic.resources || []).find(
        (r) => r._id && r._id.toString() === candidateId.toString()
      );
      if (found) {
        targetResource = found;
        break;
      }
    }

    // B. Fallback matching for existing forks by URL or Title
    if (!targetResource) {
      if (forkRes?.url) {
        const urlMatches = (targetTopic.resources || []).filter(
          (r) => r.url && r.url.trim().toLowerCase() === forkRes.url.trim().toLowerCase()
        );
        if (urlMatches.length === 1) {
          targetResource = urlMatches[0];
        }
      }

      if (!targetResource) {
        const searchResTitle = (forkRes?.title || targetResourceTitle || '').trim().toLowerCase();
        if (searchResTitle) {
          const titleMatches = (targetTopic.resources || []).filter(
            (r) => r.title && r.title.trim().toLowerCase() === searchResTitle
          );
          if (titleMatches.length === 1) {
            targetResource = titleMatches[0];
          } else if (titleMatches.length > 1) {
            const err = new Error(
              `Change #${itemNum}: Cannot reliably resolve target resource to replace in topic '${targetTopic.title}'. Multiple resources share this title. Please create a new fork to submit proposals.`
            );
            err.status = 400;
            throw err;
          }
        }
      }

      if (!targetResource) {
        const err = new Error(
          `Change #${itemNum}: Target resource to replace not found in topic '${targetTopic.title}'.`
        );
        err.status = 400;
        throw err;
      }
    }
  }

  return {
    targetModule,
    targetTopic,
    targetResource,
    forkModule,
    forkTopic,
  };
};

/**
 * @desc    Create a new pull request proposing syllabus updates from a fork
 * @route   POST /api/pull-requests
 * @access  Private
 */
const createPullRequest = async (req, res, next) => {
  try {
    const { originalRoadmapId, sourceForkId, title, description, proposedChanges } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to create a pull request.',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Pull request title is required.',
      });
    }

    if (!sourceForkId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Source fork ID is required.',
      });
    }

    // 1. Validate Source Fork and User Ownership
    const fork = await Roadmap.findById(sourceForkId);
    if (!fork) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Source fork with ID '${sourceForkId}' does not exist.`,
      });
    }

    const forkOwnerId = getIdString(fork.ownerId);
    if (!forkOwnerId || forkOwnerId !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Users may submit proposals only from forks they own.',
      });
    }

    // 2. Validate Original Target Roadmap
    const targetRoadmapId = originalRoadmapId || fork.parentRoadmapId;
    if (!targetRoadmapId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'The source roadmap is not a fork of an upstream syllabus roadmap.',
      });
    }

    const originalRoadmap = await Roadmap.findById(targetRoadmapId);
    if (!originalRoadmap) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Original roadmap with ID '${targetRoadmapId}' does not exist.`,
      });
    }

    // Verify the fork actually stems from the target roadmap
    const parentIdStr = getIdString(fork.parentRoadmapId);
    if (parentIdStr && parentIdStr !== originalRoadmap._id.toString()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'The selected source fork is not derived from the target original roadmap.',
      });
    }

    // 3. Validate Proposed Changes array
    const changesArray = Array.isArray(proposedChanges)
      ? proposedChanges
      : proposedChanges
      ? [proposedChanges]
      : [];

    if (changesArray.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'At least one proposed change (resource addition, replacement, or description correction) is required.',
      });
    }

    const validatedChanges = [];

    for (let i = 0; i < changesArray.length; i++) {
      const change = changesArray[i];
      const { type } = change;

      if (!type || !['add_resource', 'replace_resource', 'update_topic_description'].includes(type)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Change #${i + 1}: Unsupported change type '${type}'. Must be add_resource, replace_resource, or update_topic_description.`,
        });
      }

      // Resolve targets in originalRoadmap (supporting explicit references and existing fork fallback)
      let resolved;
      try {
        resolved = resolveProposedChangeTargets(originalRoadmap, fork, change, i);
      } catch (err) {
        return res.status(err.status || 400).json({
          error: 'Bad Request',
          message: err.message,
        });
      }

      const { targetModule, targetTopic, targetResource, forkModule, forkTopic } = resolved;

      const validatedItem = {
        type,
        moduleId: targetModule._id,
        moduleTitle: targetModule.title,
        topicId: targetTopic._id,
        topicTitle: targetTopic.title,
        forkModuleId: forkModule ? forkModule._id : (change.forkModuleId || null),
        forkTopicId: forkTopic ? forkTopic._id : (change.forkTopicId || null),
      };

      if (type === 'add_resource') {
        const resData = change.resource;
        if (!resData || !resData.title || !resData.title.trim()) {
          return res.status(400).json({
            error: 'Bad Request',
            message: `Change #${i + 1}: Proposed resource title is required.`,
          });
        }
        if (!resData.url || !isValidHttpUrl(resData.url)) {
          return res.status(400).json({
            error: 'Bad Request',
            message: `Change #${i + 1}: A valid HTTP or HTTPS resource URL is required.`,
          });
        }

        validatedItem.resource = {
          title: resData.title.trim(),
          url: resData.url.trim(),
          type: resData.type && ['video', 'article', 'pdf', 'documentation', 'other'].includes(resData.type)
            ? resData.type
            : 'other',
          description: resData.description ? resData.description.trim() : '',
        };
      } else if (type === 'replace_resource') {
        const resData = change.resource;
        if (!resData || !resData.title || !resData.title.trim()) {
          return res.status(400).json({
            error: 'Bad Request',
            message: `Change #${i + 1}: Replacement resource title is required.`,
          });
        }
        if (!resData.url || !isValidHttpUrl(resData.url)) {
          return res.status(400).json({
            error: 'Bad Request',
            message: `Change #${i + 1}: A valid HTTP or HTTPS URL is required for replacement resource.`,
          });
        }

        validatedItem.targetResourceId = targetResource._id;
        validatedItem.targetResourceTitle = targetResource.title;
        validatedItem.forkResourceId = change.forkResourceId || null;
        validatedItem.resource = {
          title: resData.title.trim(),
          url: resData.url.trim(),
          type: resData.type && ['video', 'article', 'pdf', 'documentation', 'other'].includes(resData.type)
            ? resData.type
            : 'other',
          description: resData.description ? resData.description.trim() : '',
        };
      } else if (type === 'update_topic_description') {
        const { newDescription } = change;
        if (typeof newDescription !== 'string') {
          return res.status(400).json({
            error: 'Bad Request',
            message: `Change #${i + 1}: Proposed topic description must be a string.`,
          });
        }

        validatedItem.oldDescription = targetTopic.description || '';
        validatedItem.newDescription = newDescription.trim();
      }

      validatedChanges.push(validatedItem);
    }

    // 4. Create Pull Request document
    const pullRequest = await PullRequest.create({
      originalRoadmapId: originalRoadmap._id,
      sourceForkId: fork._id,
      proposerId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: 'open',
      proposedChanges: validatedChanges,
    });

    // Populate for response
    const populatedPR = await PullRequest.findById(pullRequest._id)
      .populate('proposerId', 'name email avatar')
      .populate('originalRoadmapId', 'title subject ownerId version')
      .populate('sourceForkId', 'title')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Pull request submitted successfully for author review.',
      data: populatedPR,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all pull requests submitted by the current authenticated user
 * @route   GET /api/pull-requests/mine
 * @access  Private
 */
const getMyPullRequests = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to view your pull requests.',
      });
    }

    const { status } = req.query;
    const filter = { proposerId: req.user._id };
    if (status && ['open', 'accepted', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const pullRequests = await PullRequest.find(filter)
      .populate('originalRoadmapId', 'title subject ownerId version')
      .populate('sourceForkId', 'title')
      .populate('proposerId', 'name email')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: pullRequests.length,
      data: pullRequests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all pull requests received for roadmaps owned by current user
 * @route   GET /api/pull-requests/received
 * @access  Private
 */
const getReceivedPullRequests = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to view received pull requests.',
      });
    }

    // Find roadmaps owned by current user
    const ownedRoadmaps = await Roadmap.find({ ownerId: req.user._id }).select('_id');
    const ownedIds = ownedRoadmaps.map((r) => r._id);

    const { status } = req.query;
    const filter = { originalRoadmapId: { $in: ownedIds } };
    if (status && ['open', 'accepted', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const pullRequests = await PullRequest.find(filter)
      .populate('originalRoadmapId', 'title subject ownerId version')
      .populate('sourceForkId', 'title')
      .populate('proposerId', 'name email')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: pullRequests.length,
      data: pullRequests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all pull requests targeting a specific roadmap
 * @route   GET /api/pull-requests/roadmap/:roadmapId
 * @access  Private
 */
const getRoadmapPullRequests = async (req, res, next) => {
  try {
    const { roadmapId } = req.params;
    const { status } = req.query;

    const filter = { originalRoadmapId: roadmapId };
    if (status && ['open', 'accepted', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const pullRequests = await PullRequest.find(filter)
      .populate('originalRoadmapId', 'title subject ownerId version')
      .populate('sourceForkId', 'title')
      .populate('proposerId', 'name email')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: pullRequests.length,
      data: pullRequests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single pull request by ID with complete details
 * @route   GET /api/pull-requests/:id
 * @access  Private
 */
const getPullRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pullRequest = await PullRequest.findById(id)
      .populate('originalRoadmapId', 'title subject ownerId version description modules')
      .populate('sourceForkId', 'title ownerId parentRoadmapId')
      .populate('proposerId', 'name email avatar')
      .populate('resolvedBy', 'name email')
      .lean();

    if (!pullRequest) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Pull request with ID '${id}' does not exist.`,
      });
    }

    res.status(200).json({
      success: true,
      data: pullRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept and merge a pull request (Original Roadmap Owner Only)
 * @route   POST /api/pull-requests/:id/accept
 * @access  Private
 */
const acceptPullRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to review pull requests.',
      });
    }

    const pullRequest = await PullRequest.findById(id);
    if (!pullRequest) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Pull request with ID '${id}' does not exist.`,
      });
    }

    // Prevent reprocessing already resolved pull requests
    if (pullRequest.status !== 'open') {
      return res.status(400).json({
        error: 'Bad Request',
        message: `This pull request has already been ${pullRequest.status} and cannot be processed again.`,
      });
    }

    // Load original roadmap to verify ownership and apply changes
    const originalRoadmap = await Roadmap.findById(pullRequest.originalRoadmapId);
    if (!originalRoadmap) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'The original syllabus roadmap targeted by this pull request was not found.',
      });
    }

    // Enforce authorization: Only the owner of the original roadmap may accept
    const originalOwnerId = getIdString(originalRoadmap.ownerId);
    if (!originalOwnerId || originalOwnerId !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the author and owner of the original roadmap may accept or reject this pull request.',
      });
    }

    // Apply each proposed change to the original roadmap
    for (const change of pullRequest.proposedChanges) {
      const { type, moduleId, topicId } = change;

      // Locate module by mapped original ID or fallback title
      let targetModule = originalRoadmap.modules.find(
        (m) => m._id && m._id.toString() === moduleId.toString()
      );
      if (!targetModule && change.moduleTitle) {
        targetModule = originalRoadmap.modules.find(
          (m) => m.title && m.title.trim().toLowerCase() === change.moduleTitle.trim().toLowerCase()
        );
      }
      if (!targetModule) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `Cannot apply change: Module '${change.moduleTitle || moduleId}' no longer exists in original roadmap.`,
        });
      }

      // Locate topic by mapped original ID or fallback title
      let targetTopic = targetModule.topics.find(
        (t) => t._id && t._id.toString() === topicId.toString()
      );
      if (!targetTopic && change.topicTitle) {
        targetTopic = targetModule.topics.find(
          (t) => t.title && t.title.trim().toLowerCase() === change.topicTitle.trim().toLowerCase()
        );
      }
      if (!targetTopic) {
        return res.status(400).json({
          error: 'Validation Error',
          message: `Cannot apply change: Topic '${change.topicTitle || topicId}' no longer exists in module '${targetModule.title}'.`,
        });
      }

      if (type === 'add_resource') {
        if (!targetTopic.resources) {
          targetTopic.resources = [];
        }
        targetTopic.resources.push({
          title: change.resource.title,
          url: change.resource.url,
          type: change.resource.type || 'other',
          description: change.resource.description || '',
        });
      } else if (type === 'replace_resource') {
        if (!targetTopic.resources) {
          targetTopic.resources = [];
        }
        let resourceIndex = targetTopic.resources.findIndex(
          (r) => r._id && change.targetResourceId && r._id.toString() === change.targetResourceId.toString()
        );
        if (resourceIndex === -1 && change.targetResourceTitle) {
          resourceIndex = targetTopic.resources.findIndex(
            (r) => r.title && r.title.trim().toLowerCase() === change.targetResourceTitle.trim().toLowerCase()
          );
        }
        if (resourceIndex === -1) {
          return res.status(400).json({
            error: 'Validation Error',
            message: `Cannot apply change: Original resource to replace was not found in topic '${targetTopic.title}'.`,
          });
        }

        // Replace resource attributes in place
        targetTopic.resources[resourceIndex].title = change.resource.title;
        targetTopic.resources[resourceIndex].url = change.resource.url;
        targetTopic.resources[resourceIndex].type = change.resource.type || 'other';
        targetTopic.resources[resourceIndex].description = change.resource.description || '';
      } else if (type === 'update_topic_description') {
        targetTopic.description = change.newDescription;
      }
    }

    // Increment roadmap version to reflect accepted community contribution
    originalRoadmap.version = (originalRoadmap.version || 1) + 1;
    await originalRoadmap.save();

    // Mark pull request as accepted
    pullRequest.status = 'accepted';
    pullRequest.resolvedAt = new Date();
    pullRequest.resolvedBy = req.user._id;
    await pullRequest.save();

    const populatedPR = await PullRequest.findById(pullRequest._id)
      .populate('proposerId', 'name email avatar')
      .populate('originalRoadmapId', 'title subject ownerId version')
      .populate('sourceForkId', 'title')
      .populate('resolvedBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Pull request accepted! Proposed changes successfully merged into the original roadmap.',
      data: {
        pullRequest: populatedPR,
        updatedRoadmap: originalRoadmap,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a pull request without modifying the original roadmap
 * @route   POST /api/pull-requests/:id/reject
 * @access  Private
 */
const rejectPullRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to review pull requests.',
      });
    }

    const pullRequest = await PullRequest.findById(id);
    if (!pullRequest) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Pull request with ID '${id}' does not exist.`,
      });
    }

    // Prevent reprocessing already resolved pull requests
    if (pullRequest.status !== 'open') {
      return res.status(400).json({
        error: 'Bad Request',
        message: `This pull request has already been ${pullRequest.status} and cannot be processed again.`,
      });
    }

    // Verify roadmap and owner permissions
    const originalRoadmap = await Roadmap.findById(pullRequest.originalRoadmapId);
    if (!originalRoadmap) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'The original syllabus roadmap targeted by this pull request was not found.',
      });
    }

    const originalOwnerId = getIdString(originalRoadmap.ownerId);
    if (!originalOwnerId || originalOwnerId !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the author and owner of the original roadmap may accept or reject this pull request.',
      });
    }

    // Reject request: leave original roadmap completely untouched
    pullRequest.status = 'rejected';
    pullRequest.resolvedAt = new Date();
    pullRequest.resolvedBy = req.user._id;
    if (reason && typeof reason === 'string') {
      pullRequest.rejectionReason = reason.trim();
    }
    await pullRequest.save();

    const populatedPR = await PullRequest.findById(pullRequest._id)
      .populate('proposerId', 'name email avatar')
      .populate('originalRoadmapId', 'title subject ownerId version')
      .populate('sourceForkId', 'title')
      .populate('resolvedBy', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Pull request rejected. The original roadmap was not modified.',
      data: {
        pullRequest: populatedPR,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPullRequest,
  getMyPullRequests,
  getReceivedPullRequests,
  getRoadmapPullRequests,
  getPullRequestById,
  acceptPullRequest,
  rejectPullRequest,
};
