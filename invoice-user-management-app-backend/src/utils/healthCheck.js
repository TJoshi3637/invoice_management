import axios from 'axios';
import API_CONFIG from '../api/config';

export const checkBackendHealth = async () => {
    try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`);
        return {
            isHealthy: true,
            data: response.data
        };
    } catch (error) {
        console.error('Health check failed:', error);
        return {
            isHealthy: false,
            error: error.message || 'Unable to connect to the server. Please check if the backend is running.'
        };
    }
};