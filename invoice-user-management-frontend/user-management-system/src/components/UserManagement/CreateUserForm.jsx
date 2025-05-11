import React, { useState, useEffect } from 'react';
import { createUser, USER_ROLES } from '../../api/userService';

const CreateUserForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  // Determine available roles based on current user's role
  let availableRoles = [];
  
  useEffect(() => {
    // Set default role when component mounts based on currentUser's role
    switch (currentUser.role) {
      case USER_ROLES.SUPER_ADMIN:
        // Super-Admin can only create ADMIN users
        availableRoles = [USER_ROLES.ADMIN];
        setFormData(prev => ({ ...prev, role: USER_ROLES.ADMIN }));
        break;
      case USER_ROLES.ADMIN:
        // Admin can only create UNIT_MANAGER users
        availableRoles = [USER_ROLES.UNIT_MANAGER];
        setFormData(prev => ({ ...prev, role: USER_ROLES.UNIT_MANAGER }));
        break;
      case USER_ROLES.UNIT_MANAGER:
        // Unit Manager can only create USER users
        availableRoles = [USER_ROLES.USER];
        setFormData(prev => ({ ...prev, role: USER_ROLES.USER }));
        break;
      default:
        availableRoles = [];
        break;
    }
  }, [currentUser.role]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    // Username validation
    if (!formData.username || formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...userData } = formData;
      
      await createUser(userData);
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage = err.message || 'Failed to create user';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Determine if current user can create users
  const canCreateUsers = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.UNIT_MANAGER].includes(currentUser.role);
  
  // Get the role name that this user can create
  const getRoleDescription = () => {
    switch (currentUser.role) {
      case USER_ROLES.SUPER_ADMIN:
        return 'Admin';
      case USER_ROLES.ADMIN:
        return 'Unit Manager';
      case USER_ROLES.UNIT_MANAGER:
        return 'User';
      default:
        return '';
    }
  };
  
  if (!canCreateUsers) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Your role does not have permission to create new users.
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create New {getRoleDescription()}</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Role
          </label>
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-gray-800">{formData.role}</p>
            <p className="text-sm text-gray-500 mt-1">
              Based on your role as {currentUser.role}, you can only create {getRoleDescription()} accounts.
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'Creating...' : `Create ${getRoleDescription()}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;