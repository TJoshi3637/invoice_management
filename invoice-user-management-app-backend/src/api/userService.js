import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Create user
export const createUser = async (userData) => {
    try {
        // Add timezone if not provided
        const data = {
            ...userData,
            timezone: userData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        console.log('Creating user with data:', {
            ...data,
            password: '[REDACTED]' // Don't log the actual password
        });

        const response = await api.post(API_CONFIG.USERS.CREATE, data);
        console.log('User creation response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            requestData: {
                ...userData,
                password: '[REDACTED]' // Don't log the actual password
            },
            validationErrors: error.response?.data?.validationErrors,
            missingFields: error.response?.data?.missing,
            stack: error.stack
        });

        // Throw a more detailed error
        throw {
            msg: error.response?.data?.msg || 'Failed to create user',
            validationErrors: error.response?.data?.validationErrors,
            missingFields: error.response?.data?.missing,
            details: error.response?.data?.error || error.message
        };
    }
};

// Get users with pagination
export const getUsers = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(API_CONFIG.USERS.LIST, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error.response?.data || { msg: 'Failed to fetch users' };
    }
};

// Update user
export const updateUser = async (userId, userData) => {
    try {
        const response = await api.put(
            API_CONFIG.USERS.UPDATE.replace(':userId', userId),
            userData
        );
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error.response?.data || { msg: 'Failed to update user' };
    }
};

// Delete user
export const deleteUser = async (userId) => {
    try {
        console.log('Attempting to delete user:', userId);
        const url = API_CONFIG.USERS.DELETE.replace(':userId', userId);
        console.log('Delete URL:', url);

        const response = await api.delete(url);
        console.log('User deletion response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            userId,
            url: API_CONFIG.USERS.DELETE.replace(':userId', userId),
            stack: error.stack
        });

        // Throw a more detailed error
        throw {
            msg: error.response?.data?.msg || 'Failed to delete user',
            details: error.response?.data?.error || error.message,
            status: error.response?.status,
            userId
        };
    }
};

// Get user groups
export const getUserGroups = async () => {
    try {
        const response = await api.get(API_CONFIG.USERS.GROUPS);
        return response.data;
    } catch (error) {
        console.error('Error fetching user groups:', error);
        throw error.response?.data || { msg: 'Failed to fetch user groups' };
    }
}; 