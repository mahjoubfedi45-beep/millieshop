// API Configuration
const API_CONFIG = {
  // Development (local testing)
  development: 'http://localhost:5001',
  
  // Production (deployed backend)
  production: 'https://millieshop.onrender.com',
  
  // Current environment
  baseURL: process.env.NODE_ENV === 'production' && window.location.hostname !== 'localhost'
    ? 'https://millieshop.onrender.com'
    : 'http://localhost:5001' // Local development
};

export const API_BASE_URL = API_CONFIG.baseURL;

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export default API_CONFIG;