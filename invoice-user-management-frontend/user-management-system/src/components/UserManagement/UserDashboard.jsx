// components/UserManagement/UserDashboard.jsx

import React, { useState, useEffect } from 'react';
import CreateUserForm from './CreateUserForm';
import UsersList from './UsersList';
import UpdateUserForm from './UpdateUserForm';
import { USER_ROLES } from '../../api/userService';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Get current user from localStorage to determine permissions
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Handle user selection for update
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setActiveTab('update');
  };
  
  // Handle successful operations
  const handleSuccess = () => {
    setActiveTab('list');
    setSelectedUser(null);
  };

  // Get tab label based on role
  const getCreateTabLabel = () => {
    if (!currentUser) return 'Create User';
    
    switch (currentUser.role) {
      case USER_ROLES.SUPER_ADMIN:
        return 'Create Admin';
      case USER_ROLES.ADMIN:
        return 'Create Unit Manager';
      case USER_ROLES.UNIT_MANAGER:
        return 'Create User';
      default:
        return 'Create User';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('list')}
            className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users List
          </button>
          
          {/* Only show create tab if user has necessary permissions */}
          {currentUser && currentUser.role !== USER_ROLES.USER && (
            <button
              onClick={() => setActiveTab('create')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {getCreateTabLabel()}
            </button>
          )}
          
          {/* Update tab appears only when a user is selected */}
          {selectedUser && (
            <button
              onClick={() => setActiveTab('update')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'update'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Update User
            </button>
          )}
        </nav>
      </div>
      
      <div className="py-6">
        {activeTab === 'list' && (
          <UsersList 
            onUserSelect={handleUserSelect} 
            currentUser={currentUser}
          />
        )}
        
        {activeTab === 'create' && (
          <CreateUserForm 
            onSuccess={handleSuccess} 
            currentUser={currentUser}
          />
        )}
        
        {activeTab === 'update' && selectedUser && (
          <UpdateUserForm 
            user={selectedUser} 
            onSuccess={handleSuccess}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;