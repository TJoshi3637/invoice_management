// api/userService.js - Core API service for user management

import axios from 'axios';

// Base API URL - replace with your actual API URL
const API_URL = 'http://localhost:5001';

// User roles enum for consistent usage
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  UNIT_MANAGER: 'UNIT_MANAGER',
  USER: 'USER'
};

// User login API
export const login = async (username, password) => {
  try {
    // Input validation
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Check network connectivity before making the request
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    // For superadmin, always use email format
    const isSuperAdmin = username.toLowerCase() === 'superadmin';
    const isEmail = username.includes('@') || isSuperAdmin;
    const loginIdentifier = isEmail ? 'email' : 'username';

    // If it's superadmin, append @example.com to the username
    const loginValue = isSuperAdmin ? `${username}@example.com` : username.trim();

    // Log the login attempt (without password)
    console.log('Login attempt:', {
      [loginIdentifier]: loginValue,
      passwordLength: password.length,
      isEmail: isEmail,
      isSuperAdmin: isSuperAdmin
    });

    // Prepare request data
    const requestData = {
      [loginIdentifier]: loginValue,
      password: password.trim()
    };

    // Log the full request details
    console.log('Request payload:', {
      ...requestData,
      password: '****',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Log the API endpoint
    console.log('Making request to:', `${API_URL}/api/auth/login`);

    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      requestData,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    // Log the complete response
    console.log('Login response status:', response.status);
    console.log('Login response headers:', response.headers);
    console.log('Login response data:', response.data);

    // Check if response has the expected structure
    if (!response.data) {
      console.error('Empty response data received');
      throw new Error('Invalid response from server');
    }

    // Handle different response formats
    const token = response.data.token || response.data.accessToken;
    const userData = response.data.user || response.data;

    if (!token) {
      console.error('No token in response:', response.data);
      throw new Error('Authentication token not received');
    }

    // Validate user data
    if (!userData.role || !userData.uniqueId) {
      console.error('Invalid user data in response:', userData);
      throw new Error('Invalid user data received from server');
    }

    // Save user data including token to localStorage
    const userToStore = {
      ...userData,
      token: token
    };

    console.log('Storing user data:', {
      ...userToStore,
      token: '****',
      password: undefined
    });
    localStorage.setItem('user', JSON.stringify(userToStore));
    return userToStore;

  } catch (error) {
    console.error('Login error details:', error);

    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      throw new Error('Connection timed out. Please try again.');
    }

    if (error.response) {
      // Log detailed error information
      console.error('Server response status:', error.response.status);
      console.error('Server response headers:', error.response.headers);
      console.error('Server response data:', JSON.stringify(error.response.data, null, 2));

      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 401:
          // Check for specific error messages from server
          const serverMessage = error.response.data?.message || error.response.data?.error;
          if (serverMessage?.toLowerCase().includes('password')) {
            throw new Error('Incorrect password. Please check your password and try again.');
          } else if (serverMessage?.toLowerCase().includes('user not found')) {
            throw new Error('User not found. Please check your username/email.');
          } else {
            throw new Error(serverMessage || 'Invalid credentials. Please try again.');
          }
        case 403:
          throw new Error('Your account has been disabled. Please contact support.');
        case 429:
          throw new Error('Too many login attempts. Please try again later.');
        case 503:
          throw new Error('Service temporarily unavailable. Please try again later.');
        default:
          // If server provides an error message, use it
          const errorMessage = error.response.data?.message || error.response.data?.error;
          console.error('Server error message:', errorMessage);
          throw new Error(errorMessage || 'An error occurred during login. Please try again.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      throw new Error(error.message || 'An unexpected error occurred. Please try again.');
    }
  }
};

// Optional: Add a logout function as well
export const logout = () => {
  localStorage.removeItem('user');
};

// Generate next ID based on user type
export const generateUserId = async (userRole) => {
  try {
    // In a real implementation, this would call the backend to get the next sequence
    // Here we're simulating a call to get the next ID
    const response = await axios.get(`${API_URL}/users/next-id/${userRole}`, { headers: authHeader() });
    return response.data.nextId;
  } catch (error) {
    console.error('Error generating user ID:', error);
    // Fallback logic if API fails
    const prefixes = {
      [USER_ROLES.ADMIN]: 'A',
      [USER_ROLES.UNIT_MANAGER]: 'UM',
      [USER_ROLES.USER]: 'U'
    };

    return `${prefixes[userRole]}${Math.floor(Math.random() * 1000)}`;
  }
};

// Authentication headers for API calls
const authHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

// 1. Create User API
export const createUser = async (userData) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Validate if the current user has permission to create this type of user
    if (!validateCreatePermission(currentUser.role, userData.role)) {
      throw new Error(`${currentUser.role} cannot create a ${userData.role}`);
    }

    // Generate unique ID based on role
    const userId = await generateUserId(userData.role);

    // Add creator information and ID
    const enrichedUserData = {
      ...userData,
      id: userId,
      createdBy: currentUser.id,
      createdByRole: currentUser.role,
      groups: userData.groups || []
    };

    const response = await axios.post(
      `${API_URL}/users`,
      enrichedUserData,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// 2. Update User API
export const updateUser = async (userId, userData) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Verify the current user has permission to update this user
    const userToUpdate = await getUserById(userId);

    if (!validateUpdatePermission(currentUser, userToUpdate, userData)) {
      throw new Error('You do not have permission to update this user');
    }

    const response = await axios.put(
      `${API_URL}/users/${userId}`,
      userData,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/users/${userId}`,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// 3. Delete User API
export const deleteUser = async (userId) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Verify the current user has permission to delete this user
    const userToDelete = await getUserById(userId);

    if (!validateDeletePermission(currentUser, userToDelete)) {
      throw new Error('You do not have permission to delete this user');
    }

    const response = await axios.delete(
      `${API_URL}/users/${userId}`,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// 4. Read Users API with pagination
export const getUsers = async (page = 1, limit = 10) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const response = await axios.get(
      `${API_URL}/users?page=${page}&limit=${limit}`,
      { headers: authHeader() }
    );

    // Filter users based on visibility rules
    const filteredUsers = filterUsersByVisibility(response.data.users, currentUser);

    return {
      ...response.data,
      users: filteredUsers
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user groups
export const getUserGroups = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/user-groups`,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching user groups:', error);
    throw error;
  }
};

// 5. Validation helper functions
export const validateCreatePermission = (creatorRole, targetRole) => {
  // Super-Admin can create only ADMIN users
  if (creatorRole === USER_ROLES.SUPER_ADMIN) {
    return targetRole === USER_ROLES.ADMIN;
  }

  // Admin can create only Unit Manager users
  if (creatorRole === USER_ROLES.ADMIN) {
    return targetRole === USER_ROLES.UNIT_MANAGER;
  }

  // Unit Manager can create only regular Users
  if (creatorRole === USER_ROLES.UNIT_MANAGER) {
    return targetRole === USER_ROLES.USER;
  }

  // Regular users can't create other users
  return false;
};

// Validate if the current user can update the target user
const validateUpdatePermission = (currentUser, targetUser, updateData) => {
  // Super-Admin can update any Admin user
  if (currentUser.role === USER_ROLES.SUPER_ADMIN) {
    return targetUser.role === USER_ROLES.ADMIN;
  }

  // Admin can update Unit Managers they created or Unit Managers in their group
  if (currentUser.role === USER_ROLES.ADMIN) {
    if (targetUser.role !== USER_ROLES.UNIT_MANAGER) {
      return false;
    }

    // Direct creator relationship
    if (targetUser.createdBy === currentUser.id) {
      return true;
    }

    // Group relationship
    const currentUserGroups = currentUser.groups || [];
    const targetUserGroups = targetUser.groups || [];

    return currentUserGroups.some(group => targetUserGroups.includes(group));
  }

  // Unit Manager can update Users they created or Users in their group
  if (currentUser.role === USER_ROLES.UNIT_MANAGER) {
    if (targetUser.role !== USER_ROLES.USER) {
      return false;
    }

    // Direct creator relationship
    if (targetUser.createdBy === currentUser.id) {
      return true;
    }

    // Group relationship
    const currentUserGroups = currentUser.groups || [];
    const targetUserGroups = targetUser.groups || [];

    return currentUserGroups.some(group => targetUserGroups.includes(group));
  }

  // Regular users can't update other users
  return false;
};

// Validate if the current user can delete the target user
const validateDeletePermission = (currentUser, targetUser) => {
  // Same rules as update permissions
  return validateUpdatePermission(currentUser, targetUser, {});
};

// Filter users based on visibility rules
export const filterUsersByVisibility = (users, currentUser) => {
  const { role, id, groups = [] } = currentUser;

  // Super admin can see all Admin users only
  if (role === USER_ROLES.SUPER_ADMIN) {
    return users.filter(user => user.role === USER_ROLES.ADMIN);
  }

  // Admin visibility logic
  if (role === USER_ROLES.ADMIN) {
    return users.filter(user => {
      // Can see all Unit Managers they created
      if (user.role === USER_ROLES.UNIT_MANAGER && user.createdBy === id) {
        return true;
      }

      // Can see all Users created by Unit Managers they created
      if (user.role === USER_ROLES.USER) {
        // Get all Unit Managers created by this admin
        const createdUnitManagers = users.filter(u =>
          u.role === USER_ROLES.UNIT_MANAGER && u.createdBy === id
        ).map(um => um.id);

        if (createdUnitManagers.includes(user.createdBy)) {
          return true;
        }
      }

      // If in shared group with another Admin, can see their Unit Managers and their Users
      if (groups.length > 0) {
        // Find all other admins in the same groups
        const sharedAdminIds = users
          .filter(u =>
            u.role === USER_ROLES.ADMIN &&
            u.id !== id &&
            u.groups?.some(g => groups.includes(g))
          )
          .map(admin => admin.id);

        if (sharedAdminIds.length > 0) {
          // If user is a Unit Manager created by a shared admin
          if (user.role === USER_ROLES.UNIT_MANAGER && sharedAdminIds.includes(user.createdBy)) {
            return true;
          }

          // If user is a regular User created by a Unit Manager of a shared admin
          if (user.role === USER_ROLES.USER) {
            // Get all Unit Managers created by shared admins
            const sharedUnitManagerIds = users
              .filter(u =>
                u.role === USER_ROLES.UNIT_MANAGER &&
                sharedAdminIds.includes(u.createdBy)
              )
              .map(um => um.id);

            if (sharedUnitManagerIds.includes(user.createdBy)) {
              return true;
            }
          }
        }
      }

      return false;
    });
  }

  // Unit Manager visibility logic
  if (role === USER_ROLES.UNIT_MANAGER) {
    return users.filter(user => {
      // Can see only Users they created
      if (user.role === USER_ROLES.USER && user.createdBy === id) {
        return true;
      }

      // If grouped with another Unit Manager, can see their users
      if (user.role === USER_ROLES.USER && groups.length > 0) {
        // Find all other unit managers in the same groups
        const sharedUnitManagerIds = users
          .filter(u =>
            u.role === USER_ROLES.UNIT_MANAGER &&
            u.id !== id &&
            u.groups?.some(g => groups.includes(g))
          )
          .map(um => um.id);

        if (sharedUnitManagerIds.includes(user.createdBy)) {
          return true;
        }
      }

      return false;
    });
  }

  // Regular User can only see themselves
  if (role === USER_ROLES.USER) {
    return users.filter(user => user.id === id);
  }

  return [];
};

// Invoice related functions
export const createInvoice = async (invoiceData) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Add creator information
    const enrichedInvoiceData = {
      ...invoiceData,
      createdBy: currentUser.id,
      createdByRole: currentUser.role
    };

    const response = await axios.post(
      `${API_URL}/invoices`,
      enrichedInvoiceData,
      { headers: authHeader() }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

export const getInvoices = async (page = 1, limit = 10) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const response = await axios.get(
      `${API_URL}/invoices?page=${page}&limit=${limit}`,
      { headers: authHeader() }
    );

    // Filter invoices based on visibility rules
    const filteredInvoices = filterInvoicesByVisibility(response.data.invoices, currentUser);

    return {
      ...response.data,
      invoices: filteredInvoices
    };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

const filterInvoicesByVisibility = (invoices, currentUser) => {
  const { role, id, groups = [] } = currentUser;

  // Get all visible users first to determine which invoices should be visible
  const allUsers = []; // In a real app, this would be fetched from the API
  const visibleUsers = filterUsersByVisibility(allUsers, currentUser);
  const visibleUserIds = visibleUsers.map(user => user.id);

  // Add current user's ID to visible users
  visibleUserIds.push(id);

  return invoices.filter(invoice =>
    // Can see invoices created by themselves
    invoice.createdBy === id ||
    // Can see invoices created by users they can see
    visibleUserIds.includes(invoice.createdBy)
  );
};