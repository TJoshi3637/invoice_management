import React, { useState } from 'react';
import { updateUser, USER_ROLES } from '../../api/userService';

const UpdateUserForm = ({ user, onSuccess, onCancel, currentUserRole }) => {
  const [role, setRole] = useState(user.role);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Use the currentUserRole prop if provided, otherwise get from localStorage
  const currentUser = currentUserRole ? { role: currentUserRole } : JSON.parse(localStorage.getItem('user'));
  
  // Determine available roles based on current user's role and the target user's role
  let availableRoles = [];
  
  switch (currentUser.role) {
    case USER_ROLES.SUPER_ADMIN:
      // Super-Admin can only manage ADMIN users
      if (user.role === USER_ROLES.ADMIN) {
        availableRoles = [USER_ROLES.ADMIN]; // Can only keep them as ADMIN
      }
      break;
    case USER_ROLES.ADMIN:
      // Admin can only manage UNIT_MANAGER users they created
      if (user.role === USER_ROLES.UNIT_MANAGER && 
          (user.createdBy === currentUser.uniqueId || user.adminGroup === currentUser.adminGroup)) {
        availableRoles = [USER_ROLES.UNIT_MANAGER]; // Can only keep them as UNIT_MANAGER
      }
      break;
    case USER_ROLES.UNIT_MANAGER:
      // Unit Manager can only manage USER users they created
      if (user.role === USER_ROLES.USER && user.createdByUnitManager === currentUser.uniqueId) {
        availableRoles = [USER_ROLES.USER]; // Can only keep them as USER
      }
      break;
    default:
      availableRoles = [];
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!availableRoles.includes(role)) {
      setError('Invalid role selection');
      return;
    }
    
    setLoading(true);
    try {
      await updateUser(user.uniqueId, { role });
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage = err.message || 'Failed to update user';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Update User</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p className="block text-gray-700 mb-2">
            <span className="font-bold">User ID:</span> {user.uniqueId}
          </p>
          <p className="block text-gray-700 mb-2">
            <span className="font-bold">Username:</span> {user.username}
          </p>
          <p className="block text-gray-700 mb-2">
            <span className="font-bold">Email:</span> {user.email}
          </p>
          <p className="block text-gray-700 mb-2">
            <span className="font-bold">Current Role:</span> {user.role}
          </p>
          {user.createdBy && (
            <p className="block text-gray-700 mb-2">
              <span className="font-bold">Created By:</span> {user.createdBy}
            </p>
          )}
          {user.adminGroup && (
            <p className="block text-gray-700 mb-2">
              <span className="font-bold">Admin Group:</span> {user.adminGroup}
            </p>
          )}
          {user.unitManagerGroup && (
            <p className="block text-gray-700 mb-2">
              <span className="font-bold">Unit Manager Group:</span> {user.unitManagerGroup}
            </p>
          )}
        </div>
        
        {availableRoles.length > 0 ? (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              {availableRoles.map(roleOption => (
                <option key={roleOption} value={roleOption}>{roleOption}</option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Note: Based on your role permissions, you can only maintain this user's current role.
            </p>
          </div>
        ) : (
          <div className="mb-4 text-yellow-600">
            You don't have permission to change this user's role.
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          {availableRoles.length > 0 && (
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UpdateUserForm;