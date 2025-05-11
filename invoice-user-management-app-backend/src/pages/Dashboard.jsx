import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        console.log('Dashboard mounted, auth check:', {
            hasToken: !!token,
            hasUser: !!user
        });

        if (!token || !user) {
            console.log('No auth data found, redirecting to login');
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UserProfile />
                    {/* Add other dashboard components here */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 