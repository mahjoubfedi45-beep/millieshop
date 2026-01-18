// API Configuration
const API_CONFIG = {
  // Development (local testing)
  development: 'http://localhost:5000',
  
  // Production (deployed backend) - YOUR ACTUAL RENDER URL
  production: 'https://millieshop.onrender.com', // Your actual Render URL
  
  // Current environment
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://millieshop.onrender.com'  // Your actual Render URL
    : 'http://localhost:5000'
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