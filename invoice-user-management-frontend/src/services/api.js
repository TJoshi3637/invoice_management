import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 second timeout
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    // Add token to requests if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.url);
    console.log('Request headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('Response from:', response.config.url);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running or not accessible');
      return Promise.reject(new Error('Backend server is not running. Please start the server and try again.'));
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Test backend connection
export const testBackendConnection = async () => {
  try {
    await api.get('/health');
    return true;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

// Auth endpoints
export const login = async (email, password) => {
  try {
    console.log('Attempting login...');
    const response = await api.post('/auth/login', {
      email,
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
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Backend server is not running. Please start the server and try again.');
    }
    throw error;
  }
};

export const getUsers = async () => {
  try {
    console.log('Fetching users...');
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    console.log('Creating user...');
    const response = await api.post('/users/create', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
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

export default api;
