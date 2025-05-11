export const API_CONFIG = {
    BASE_URL: 'http://localhost:5001/api',
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        CURRENT_USER: '/auth/current-user'
    },
    USERS: {
        CREATE: '/users',
        LIST: '/users',
        UPDATE: '/users/:userId',
        DELETE: '/users/:userId',
        GROUPS: '/users/groups'
    },
    GROUPS: {
        CREATE: '/groups',
        LIST: '/groups',
        UPDATE: '/groups/:groupId',
        DELETE: '/groups/:groupId'
    }
}; 