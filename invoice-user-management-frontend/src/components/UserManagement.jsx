import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, X, Check, AlertTriangle, Loader } from 'lucide-react';

// Mock data and functions to replace API imports
const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'ADMIN',
    groupId: 'G001',
    createdAt: '2025-04-01T12:00:00Z'
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'USER',
    groupId: 'G002',
    createdAt: '2025-04-02T12:00:00Z'
  },
  {
    _id: '3',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    role: 'UNIT_MANAGER',
    groupId: 'G001',
    createdAt: '2025-04-03T12:00:00Z'
  },
  {
    _id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    role: 'SUPER_ADMIN',
    groupId: 'G003',
    createdAt: '2025-04-04T12:00:00Z'
  }
];

// Mock functions to simulate API calls
const testBackendConnection = () => Promise.resolve(true);
const getCurrentUser = () => Promise.resolve(mockUsers[0]);
const getUsers = () => Promise.resolve(mockUsers);
const createUser = (userData) => Promise.resolve({
  ...userData,
  _id: Math.random().toString(36).substring(2, 15),
  createdAt: new Date().toISOString()
});

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserType, setSelectedUserType] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBackendConnected, setIsBackendConnected] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        groupId: 'G001',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const checkBackendConnection = async () => {
            try {
                const connected = await testBackendConnection();
                setIsBackendConnected(connected);
                if (!connected) {
                    setError('Unable to connect to backend server. Please check if the server is running.');
                    setLoading(false);
                    return;
                }
                await fetchData();
            } catch (error) {
                console.error('Error checking backend connection:', error);
                setIsBackendConnected(false);
                setError('Unable to connect to backend server. Please check if the server is running.');
                setLoading(false);
            }
        };

        checkBackendConnection();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // First fetch current user
            const userData = await getCurrentUser();
            setCurrentUser(userData);

            // Then fetch all users
            const allUsers = await getUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message || 'Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setIsSubmitting(true);

        try {
            // Simulate token check
            const token = true; // In a real app this would be localStorage.getItem('token')
            if (!token) {
                throw new Error('No authentication token found. Please login first.');
            }

            const response = await createUser({
                ...formData,
                createdBy: 'SYSTEM'
            });

            setFormSuccess('User created successfully!');
            setUsers([...users, response]);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'USER',
                groupId: 'G001',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
            
            // Close the form after successful submission after 2 seconds
            setTimeout(() => {
                setShowCreateForm(false);
                setFormSuccess('');
            }, 2000);
        } catch (err) {
            console.error('Error creating user:', err);
            setFormError(err.message || 'Failed to create user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'USER',
            groupId: 'G001',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        setFormError('');
        setFormSuccess('');
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !selectedUserType || user.role === selectedUserType;
        return matchesSearch && matchesType;
    });

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'SUPER_ADMIN':
                return 'bg-purple-100 text-purple-800';
            case 'ADMIN':
                return 'bg-blue-100 text-blue-800';
            case 'UNIT_MANAGER':
                return 'bg-green-100 text-green-800';
            case 'USER':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isBackendConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="rounded-lg bg-red-50 border border-red-200 p-6 flex items-center space-x-4">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        <div className="text-red-600 font-medium">
                            {error || 'Unable to connect to backend server. Please check if the server is running.'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="flex flex-col items-center">
                        <Loader className="h-12 w-12 text-blue-500 animate-spin" />
                        <p className="mt-4 text-gray-500">Loading user data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="rounded-lg bg-red-50 border border-red-200 p-6 flex items-center space-x-4">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        <div className="text-red-600 font-medium">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Users className="mr-2 h-6 w-6 text-blue-500" />
                        User Management
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">Manage your organization's users and permissions</p>
                </div>

                <div className="mb-6 flex justify-end">
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {showCreateForm ? (
                            <>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add New User
                            </>
                        )}
                    </button>
                </div>

                {showCreateForm && (
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 mb-6">
                        <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-blue-800 flex items-center">
                                <UserPlus className="mr-2 h-5 w-5" />
                                Create New User
                            </h2>
                        </div>
                        <div className="p-6">
                            {formError && (
                                <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200 flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                                    <div className="text-sm text-red-700">{formError}</div>
                                </div>
                            )}
                            {formSuccess && (
                                <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200 flex items-start">
                                    <Check className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                                    <div className="text-sm text-green-700">{formSuccess}</div>
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="form-group">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="Enter user's full name"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            placeholder="email@example.com"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            required
                                            placeholder="Enter secure password"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                            Role
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.role}
                                            onChange={handleChange}
                                        >
                                            <option value="USER">User</option>
                                            <option value="UNIT_MANAGER">Unit Manager</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="SUPER_ADMIN">Super Admin</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-1">
                                            Group ID
                                        </label>
                                        <input
                                            type="text"
                                            id="groupId"
                                            name="groupId"
                                            required
                                            placeholder="Enter group identifier"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData.groupId}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader className="animate-spin h-4 w-4 mr-2" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Create User
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="relative flex-1 w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <select
                                value={selectedUserType}
                                onChange={(e) => setSelectedUserType(e.target.value)}
                                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All User Types</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                                <option value="ADMIN">Admin</option>
                                <option value="UNIT_MANAGER">Unit Manager</option>
                                <option value="USER">User</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Group
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created At
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{user.groupId || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                                            No users match your search criteria. Try adjusting your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-500 text-right">
                            Showing {filteredUsers.length} of {users.length} users
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;