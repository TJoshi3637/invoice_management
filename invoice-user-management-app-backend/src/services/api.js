import axios from 'axios';

const API_URL = '/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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

// Add response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const invoiceService = {
    getInvoices: (params) => api.get('/invoices', { params }),
    createInvoice: (data) => api.post('/invoices', data),
    updateInvoice: (invoiceNumber, data) => api.put(`/invoices/${invoiceNumber}`, data),
    deleteInvoices: (invoiceNumbers) => api.delete('/invoices', { data: { invoiceNumbers } }),
};

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    },
};

export default api; 