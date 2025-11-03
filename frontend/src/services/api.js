import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // This helps with HTTPS in development
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Check for both customer token and employee token
    const token = localStorage.getItem('token') || localStorage.getItem('employeeToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🚀 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Clear both customer and employee data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('employee');
      
      // Redirect based on current path
      if (window.location.pathname.includes('/employee')) {
        window.location.href = '/employee/login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;