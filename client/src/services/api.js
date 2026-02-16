const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Generic API request handler
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * User API service
 */
export const userService = {
  getAll: async () => {
    return apiRequest('/api/users');
  },

  getById: async (id) => {
    return apiRequest(`/api/users/${id}`);
  },

  create: async (userData) => {
    return apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

/**
 * Health check
 */
export const healthCheck = async () => {
  return apiRequest('/health');
};
