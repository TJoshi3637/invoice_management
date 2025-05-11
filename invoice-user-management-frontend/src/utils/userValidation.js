import { USER_ROLES } from '../services/userService';

// Validation rules for user creation based on current user's role
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

// Check if user can view another user based on roles and hierarchy
export const canViewUser = (viewerRole, targetUserRole, viewerGroups, targetUserGroups) => {
    // Super Admin can view everyone
    if (viewerRole === USER_ROLES.SUPER_ADMIN) {
        return true;
    }

    // Admin can view Unit Managers and Users
    if (viewerRole === USER_ROLES.ADMIN) {
        return targetUserRole === USER_ROLES.UNIT_MANAGER || targetUserRole === USER_ROLES.USER;
    }

    // Unit Manager can only view Users
    if (viewerRole === USER_ROLES.UNIT_MANAGER) {
        if (targetUserRole !== USER_ROLES.USER) {
            return false;
        }
        // Check if users are in the same group
        return viewerGroups.some(group => targetUserGroups.includes(group));
    }

    // Regular users can't view other users
    return false;
};

// Check if user can manage (update/delete) another user
export const canManageUser = (managerRole, targetUserRole, managerGroups, targetUserGroups) => {
    // Super Admin can manage everyone
    if (managerRole === USER_ROLES.SUPER_ADMIN) {
        return true;
    }

    // Admin can manage Unit Managers and Users
    if (managerRole === USER_ROLES.ADMIN) {
        return targetUserRole === USER_ROLES.UNIT_MANAGER || targetUserRole === USER_ROLES.USER;
    }

    // Unit Manager can only manage Users in their group
    if (managerRole === USER_ROLES.UNIT_MANAGER) {
        if (targetUserRole !== USER_ROLES.USER) {
            return false;
        }
        return managerGroups.some(group => targetUserGroups.includes(group));
    }

    // Regular users can't manage other users
    return false;
};

// Generate a unique user ID based on role and count
export const generateUserId = (role, count) => {
    const prefix = {
        [USER_ROLES.ADMIN]: 'A',
        [USER_ROLES.UNIT_MANAGER]: 'UM',
        [USER_ROLES.USER]: 'U'
    }[role] || 'U';

    return `${prefix}${count}`;
};

// Validate email format
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}; 