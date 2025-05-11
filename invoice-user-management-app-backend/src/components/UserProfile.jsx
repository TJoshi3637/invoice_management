import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../api/apiService';

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getCurrentUser();
                setUserData(data);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <div className="text-red-600 font-medium">Error</div>
            <div className="text-red-500 mt-2">{error}</div>
        </div>
    );

    if (!userData) return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
            <div className="text-yellow-600">No user data available</div>
        </div>
    );

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
            <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">User Profile</div>
                <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-gray-500">User ID:</div>
                        <div className="font-medium">{userData.id}</div>

                        <div className="text-gray-500">Name:</div>
                        <div className="font-medium">{userData.name}</div>

                        <div className="text-gray-500">Email:</div>
                        <div className="font-medium">{userData.email}</div>

                        <div className="text-gray-500">Role:</div>
                        <div className="font-medium">{userData.role}</div>

                        <div className="text-gray-500">Group ID:</div>
                        <div className="font-medium">{userData.groupId}</div>

                        <div className="text-gray-500">Timezone:</div>
                        <div className="font-medium">{userData.timezone}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile; 