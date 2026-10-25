/**
 * Authentication API Client
 * Interacts with /api/auth endpoints using HTTP-only cookies
 */

const BASE_URL = '/api/auth';

const handleResponse = async (response) => {
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      (typeof data === 'string' && data) ||
      `Authentication request failed (${response.status})`;

    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
};

/**
 * Register a new user
 * @param {Object} userData - { name, email, password }
 */
export const registerUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
};

/**
 * Log in an existing user
 * @param {Object} credentials - { email, password }
 */
export const loginUser = async (credentials) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  return handleResponse(response);
};

/**
 * Log out user & clear session cookie
 */
export const logoutUser = async () => {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};

/**
 * Restore current session user profile
 */
export const getSessionUser = async () => {
  const response = await fetch(`${BASE_URL}/me`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  });

  return handleResponse(response);
};
