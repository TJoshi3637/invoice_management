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
            CREATE: '/api/users',
            LIST: '/api/users',
            UPDATE: '/api/users/:userId',
            DELETE: '/api/users/:userId',
            GET_BY_ID: '/api/users/:userId'
        }
    }
};

export default API_CONFIG; 