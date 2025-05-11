// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:5001',
    ENDPOINTS: {
        HEALTH: '/api/health',
        AUTH: {
            LOGIN: '/api/auth/login',
            CURRENT_USER: '/api/auth/current-user'
        },
        USERS: {
            CREATE: '/api/users/create',
            LIST: '/api/users'
        }
    }
};

export default API_CONFIG; 