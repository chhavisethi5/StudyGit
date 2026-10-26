/**
 * Pull Request API Service
 * Handles all HTTP interactions with StudyGit Express pull request endpoints.
 */

const BASE_URL = '/api/pull-requests';

/**
 * Helper to handle fetch responses and extract meaningful error messages
 */
const handleResponse = async (response) => {
  let data;
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      (typeof data === 'string' && data) ||
      `Request failed with status ${response.status}`;

    const error = new Error(errorMessage);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
};

/**
 * Create a new pull request proposing syllabus updates from a fork
 * @param {Object} prData
 * @param {string} prData.originalRoadmapId
 * @param {string} prData.sourceForkId
 * @param {string} prData.title
 * @param {string} prData.description
 * @param {Array} prData.proposedChanges
 * @returns {Promise<{ success: boolean, message: string, data: Object }>}
 */
export const createPullRequest = async (prData) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(prData),
  });

  return handleResponse(response);
};

/**
 * Fetch pull requests submitted by the current authenticated user
 * @param {string} [status] - Optional filter ('open', 'accepted', 'rejected')
 * @returns {Promise<{ success: boolean, count: number, data: Array }>}
 */
export const getMyPullRequests = async (status) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await fetch(`${BASE_URL}/mine${query}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Fetch pull requests received on roadmaps owned by current user
 * @param {string} [status] - Optional filter ('open', 'accepted', 'rejected')
 * @returns {Promise<{ success: boolean, count: number, data: Array }>}
 */
export const getReceivedPullRequests = async (status) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await fetch(`${BASE_URL}/received${query}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Fetch pull requests targeted at a specific roadmap
 * @param {string} roadmapId
 * @param {string} [status]
 * @returns {Promise<{ success: boolean, count: number, data: Array }>}
 */
export const getRoadmapPullRequests = async (roadmapId, status) => {
  if (!roadmapId) throw new Error('Roadmap ID is required');

  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await fetch(`${BASE_URL}/roadmap/${encodeURIComponent(roadmapId)}${query}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Fetch details for a single pull request
 * @param {string} id
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const getPullRequestById = async (id) => {
  if (!id) throw new Error('Pull Request ID is required');

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Accept and merge a pull request (Original Roadmap Owner Only)
 * @param {string} id
 * @returns {Promise<{ success: boolean, message: string, data: Object }>}
 */
export const acceptPullRequest = async (id) => {
  if (!id) throw new Error('Pull Request ID is required');

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Reject a pull request without modifying the roadmap (Original Roadmap Owner Only)
 * @param {string} id
 * @param {string} [reason]
 * @returns {Promise<{ success: boolean, message: string, data: Object }>}
 */
export const rejectPullRequest = async (id, reason) => {
  if (!id) throw new Error('Pull Request ID is required');

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ reason: reason || '' }),
  });

  return handleResponse(response);
};
