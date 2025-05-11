import React, { useState, useEffect } from 'react';
import { getUsers, deleteUser, USER_ROLES } from '../../api/userService';
import UpdateUserForm from './UpdateUserForm';

// Updated user roles based on requirements
const USER_ROLE_TYPES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  UNIT_MANAGER: 'UNIT_MANAGER',
  USER: 'USER'
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const fetchUsers = async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await getUsers(pageNum);
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleEdit = (user) => {
    setSelectedUser(user);
  };
  
  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete.uniqueId);
      setUserToDelete(null);
      fetchUsers(page); // Refresh the list
    } catch (err) {
      setError('Failed to delete user');
    }
  };
  
  const handleUpdateSuccess = () => {
    setSelectedUser(null);
    fetchUsers(page); // Refresh the list
  };
  
  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  // Determine which users the current user can see based on role
  const canViewUser = (user) => {
    switch (currentUser.role) {
      case USER_ROLE_TYPES.SUPER_ADMIN:
        return true; // Super Admin can see all users
      case USER_ROLE_TYPES.ADMIN:
        // Admin can see all Admin, Unit Managers, and Users in their hierarchy
        return (
          user.createdBy === currentUser.uniqueId || 
          user.createdByAdminGroup === currentUser.adminGroup ||
          user.createdByUnitManager === currentUser.uniqueId ||
          (user.role === USER_ROLE_TYPES.USER && user.unitManagerGroup === currentUser.adminManagedGroups)
        );
      case USER_ROLE_TYPES.UNIT_MANAGER:
        // Unit Manager can see only the Users they created or in their group
        return (
          user.createdByUnitManager === currentUser.uniqueId ||
          user.unitManagerGroup === currentUser.unitManagerGroup
        );
      case USER_ROLE_TYPES.USER:
        // Regular users can only see themselves
        return user.uniqueId === currentUser.uniqueId;
      default:
        return false;
    }
  };
  
  // Determine if the current user can edit a specific user
  const canEditUser = (user) => {
    switch (currentUser.role) {
      case USER_ROLE_TYPES.SUPER_ADMIN:
        return true; // Super Admin can edit all users
      case USER_ROLE_TYPES.ADMIN:
        // Admin can edit Unit Managers they created and Users under those Unit Managers
        return (
          (user.role === USER_ROLE_TYPES.UNIT_MANAGER && user.createdBy === currentUser.uniqueId) ||
          (user.role === USER_ROLE_TYPES.USER && 
            (user.createdByAdminHierarchy === currentUser.uniqueId || 
             user.unitManagerGroup === currentUser.adminManagedGroups))
        );
      case USER_ROLE_TYPES.UNIT_MANAGER:
        // Unit Manager can edit only Users they created
        return user.role === USER_ROLE_TYPES.USER && user.createdByUnitManager === currentUser.uniqueId;
      default:
        return false;
    }
  };
  
  // Filter users based on viewing permissions
  const visibleUsers = users.filter(canViewUser);
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Users List
        </h3>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mb-4">
          {error}
        </div>
      )}
      
      {selectedUser ? (
        <div className="px-4 py-5 sm:p-6">
          <UpdateUserForm 
            user={selectedUser} 
            onSuccess={handleUpdateSuccess} 
            onCancel={() => setSelectedUser(null)} 
            currentUserRole={currentUser.role}
          />
        </div>
      ) : (
        <>
          {loading ? (
            <div className="px-4 py-5 sm:p-6 text-center">
              Loading users...
            </div>
          ) : (
            <>
              <div className="px-4 sm:px-6 py-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created By
                        </th>
                        {currentUser.role !== USER_ROLE_TYPES.USER && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {visibleUsers.map((user) => (
                        <tr key={user.uniqueId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.uniqueId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.createdBy || 'System'}
                          </td>
                          {currentUser.role !== USER_ROLE_TYPES.USER && canEditUser(user) && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setUserToDelete(user)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Pagination */}
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page {page} of {totalPages}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => fetchUsers(page - 1)}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                        page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchUsers(page + 1)}
                      disabled={page === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                        page === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
      
      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete User
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {userToDelete.username} ({userToDelete.uniqueId})? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  onClick={() => setUserToDelete(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;