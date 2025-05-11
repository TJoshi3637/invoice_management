import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000 // 5 second timeout
});

// Add request interceptor for logging
api.interceptors.request.use(
  config => {
    // Only log non-health check requests
    if (!config.url.includes('/health')) {
      console.log('Making request to:', config.url);
      console.log('Request headers:', config.headers);
    }
    // Add token to requests if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => {
    // Only log non-health check responses
    if (!response.config.url.includes('/health')) {
      console.log('Response from:', response.config.url);
      console.log('Response data:', response.data);
    }
    return response;
  },
  error => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error: Unable to connect to the server');
      throw new Error('Unable to connect to the server. Please check if the backend is running.');
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw error.response?.data || error.message;
  }
);

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Health check with debouncing
let healthCheckInProgress = false;
const debouncedHealthCheck = debounce(async () => {
  if (healthCheckInProgress) return;

  try {
    healthCheckInProgress = true;
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  } finally {
    healthCheckInProgress = false;
  }
}, 1000);

// Auth endpoints
export const login = async (username, password) => {
  try {
    console.log('Attempting login...');
    const response = await api.post('/auth/login', {
      username,
      password,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
    // Clear all stored data
    localStorage.clear();
    sessionStorage.clear();
    // Clear axios default headers
    delete api.defaults.headers.common['Authorization'];
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    // Even if the server request fails, clear local data
    localStorage.clear();
    sessionStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    return true;
  }
};

// User endpoints
export const getCurrentUser = async () => {
  try {
    console.log('Fetching current user...');
    const response = await api.get('/auth/current-user');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export const getUsers = async (page = 1, limit = 10) => {
  try {
    console.log('Fetching users...');
    const response = await api.get('/users', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    // Validate required fields before sending
    const requiredFields = ['username', 'email', 'password', 'role'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log('Creating user with data:', {
      ...userData,
      password: '***' // Hide password in logs
    });

    // Log current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user'));
    console.log('Current user from localStorage:', currentUser);

    // Log request headers
    const headers = {
      'Content-Type': 'application/json',
      ...(currentUser?.token ? { 'Authorization': `Bearer ${currentUser.token}` } : {})
    };
    console.log('Request headers:', headers);

    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error('Full error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      },
      validationErrors: error.response?.data?.errors || error.response?.data?.validationErrors
    });

    // If it's a validation error, show the specific errors
    if (error.response?.status === 400) {
      const validationErrors = error.response.data?.errors || error.response.data?.validationErrors;
      if (validationErrors) {
        throw new Error(`Validation failed: ${Object.entries(validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ')}`);
      }
    }

    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    console.log('Updating user...');
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    console.log('Deleting user...');
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Invoice endpoints
export const getInvoices = async () => {
  try {
    console.log('Fetching invoices...');
    const response = await api.get('/invoices');
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    console.log('Creating invoice...');
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    console.log('Updating invoice...');
    const response = await api.put(`/invoices/${invoiceId}`, invoiceData);
    return response.data;
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

export const deleteInvoice = async (invoiceId) => {
  try {
    console.log('Deleting invoice...');
    const response = await api.delete(`/invoices/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
};

// Test backend connection with debouncing
export const testBackendConnection = debouncedHealthCheck;

export default api;
