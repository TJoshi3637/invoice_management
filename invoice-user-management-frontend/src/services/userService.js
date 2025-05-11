import api from './api';

// User Role Types
export const USER_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    UNIT_MANAGER: 'UNIT_MANAGER',
    USER: 'USER'
};

// Validation Rules for User Creation
export const validateUserCreation = (currentUserRole, newUserRole) => {
    switch (currentUserRole) {
        case USER_ROLES.SUPER_ADMIN:
            return newUserRole === USER_ROLES.ADMIN;
        case USER_ROLES.ADMIN:
            return newUserRole === USER_ROLES.UNIT_MANAGER;
        case USER_ROLES.UNIT_MANAGER:
            return newUserRole === USER_ROLES.USER;
        default:
            return false;
    }
};

// Generate User ID based on role
export const generateUserId = (role, count) => {
    const prefix = {
        [USER_ROLES.ADMIN]: 'A',
        [USER_ROLES.UNIT_MANAGER]: 'UM',
        [USER_ROLES.USER]: 'U'
    }[role] || 'U';

    return `${prefix}${count}`;
};

const userService = {
    // Get all users with pagination
    getAllUsers: async (page = 1, limit = 10) => {
        try {
            const response = await api.get('/users', {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Create a new user
    createUser: async (userData) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user'));

            // Validate role permissions
            if (!validateUserCreation(currentUser.role, userData.role)) {
                throw new Error(`${currentUser.role} cannot create users with role ${userData.role}`);
            }

            // Add creator information
            const enrichedUserData = {
                ...userData,
                createdBy: currentUser.id,
                createdByRole: currentUser.role
            };

            const response = await api.post('/users', enrichedUserData);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Update a user
    updateUser: async (userId, userData) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user'));

            // Validate role update permissions
            if (userData.role && !validateUserCreation(currentUser.role, userData.role)) {
                throw new Error(`${currentUser.role} cannot update users to role ${userData.role}`);
            }

            const response = await api.put(`/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Delete a user
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // Get user by ID
    getUserById: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }
};

export default userService; 