import React from 'react';
import UserProfile from '../components/UserProfile';

const Dashboard = () => {
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