import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        console.log('Request headers:', config.headers);
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for logging
api.interceptors.response.use(
    (response) => {
        console.log('Response from:', response.config.url);
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));
        return response;
    },
    (error) => {
        console.error('Response error:', {
            url: error.config?.url,
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Health check function
export const checkBackendHealth = async () => {
    try {
        const response = await api.get(API_CONFIG.ENDPOINTS.HEALTH);
        return response.data;
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};

// Auth functions
export const login = async (credentials) => {
    try {
        const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.CURRENT_USER);
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
};

// User functions
export const createUser = async (userData) => {
    try {
        console.log('Creating user with data:', userData);
        const response = await api.post(API_CONFIG.ENDPOINTS.USERS.CREATE, userData);
        console.log('Create user response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error.response?.data || error);
        throw error;
    }
};

export const getUsers = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(`${API_CONFIG.ENDPOINTS.USERS.LIST}?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await api.put(API_CONFIG.ENDPOINTS.USERS.UPDATE.replace(':userId', userId), userData);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(API_CONFIG.ENDPOINTS.USERS.DELETE.replace(':userId', userId));
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

export const getUserGroups = async () => {
    try {
        const response = await api.get(API_CONFIG.ENDPOINTS.USERS.GROUPS);
        return response.data;
    } catch (error) {
        console.error('Error fetching user groups:', error);
        throw error;
    }
};

export default api; 