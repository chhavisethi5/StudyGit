/**
 * Roadmap API Service
 * Handles all HTTP interactions with the StudyGit Express backend
 * Uses relative /api paths which are proxied via Vite in development.
 */

const BASE_URL = '/api/roadmaps';

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
 * Fetch paginated roadmaps with search keywords and filters
 * @param {Object} params
 * @param {string} [params.q] - Search query across title, subject, description
 * @param {string} [params.subject] - Subject filter
 * @param {string} [params.university] - University filter
 * @param {string} [params.semester] - Semester filter
 * @param {string|string[]} [params.tag] - Tag or comma-separated tags
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page
 * @returns {Promise<{ success: boolean, count: number, total: number, page: number, totalPages: number, data: Array }>}
 */
export const getRoadmaps = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.q && params.q.trim()) query.set('q', params.q.trim());
  if (params.subject && params.subject.trim()) query.set('subject', params.subject.trim());
  if (params.university && params.university.trim()) query.set('university', params.university.trim());
  if (params.semester && params.semester.trim()) query.set('semester', params.semester.trim());
  if (params.tag && params.tag.trim()) query.set('tag', params.tag.trim());
  if (params.sort && params.sort.trim()) query.set('sort', params.sort.trim());
  if (params.page && params.page > 1) query.set('page', params.page.toString());
  if (params.limit && params.limit !== 10) query.set('limit', params.limit.toString());

  const queryString = query.toString();
  const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Fetch roadmaps owned by the currently authenticated user
 * @route GET /api/roadmaps/mine
 * @returns {Promise<{ success: boolean, count: number, data: Array }>}
 */
export const getMyRoadmaps = async () => {
  const response = await fetch(`${BASE_URL}/mine`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Fetch a single roadmap by MongoDB ID
 * @param {string} id - 24-character hex MongoDB ObjectId
 * @returns {Promise<{ success: boolean, data: Object }>}
 */
export const getRoadmapById = async (id) => {
  if (!id) {
    throw new Error('Roadmap ID is required');
  }

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Create a new roadmap (Requires authentication)
 * @param {Object} roadmapData - Roadmap schema payload
 * @returns {Promise<{ success: boolean, message: string, data: Object }>}
 */
export const createRoadmap = async (roadmapData) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(roadmapData),
  });

  return handleResponse(response);
};

/**
 * Update an existing roadmap (Owner only)
 * @param {string} id - 24-character hex MongoDB ObjectId
 * @param {Object} updateData - Modified roadmap fields
 * @returns {Promise<{ success: boolean, message: string, data: Object }>}
 */
export const updateRoadmap = async (id, updateData) => {
  if (!id) {
    throw new Error('Roadmap ID is required for updating');
  }

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updateData),
  });

  return handleResponse(response);
};

/**
 * Fork an existing roadmap with personalized study dates and hours
 * @param {string} id - Parent roadmap ObjectId
 * @param {Object} forkData - Personal fork configuration (title, startDate, examDate, dailyStudyHours, schedule)
 * @returns {Promise<{ success: boolean, message: string, data: Object }>}
 */
export const forkRoadmap = async (id, forkData) => {
  if (!id) {
    throw new Error('Roadmap ID is required for forking');
  }

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}/fork`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(forkData),
  });

  return handleResponse(response);
};

/**
 * Update completion status for a topic within a forked roadmap
 * @param {string} roadmapId - Roadmap ObjectId
 * @param {string} topicId - Topic ObjectId
 * @param {boolean} isCompleted - Completion status
 * @returns {Promise<{ success: boolean, message: string, data: Object }>}
 */
export const updateTopicCompletion = async (roadmapId, topicId, isCompleted) => {
  if (!roadmapId || !topicId) {
    throw new Error('Roadmap ID and Topic ID are required');
  }

  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(roadmapId)}/topics/${encodeURIComponent(topicId)}/complete`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ isCompleted }),
    }
  );

  return handleResponse(response);
};

/**
 * Toggle or set upvote status on a public roadmap (Requires authentication)
 * @param {string} id - Roadmap ObjectId
 * @param {string} [action] - Optional explicit action ('upvote' or 'remove')
 * @returns {Promise<{ success: boolean, message: string, data: { roadmapId: string, upvoteCount: number, hasUpvoted: boolean } }>}
 */
export const toggleUpvoteRoadmap = async (id, action) => {
  if (!id) {
    throw new Error('Roadmap ID is required to upvote');
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
  };

  if (action) {
    options.body = JSON.stringify({ action });
  }

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}/upvote`, options);

  return handleResponse(response);
};

