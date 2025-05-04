import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import InvoiceManagement from './InvoiceManagement';
import { logout } from '../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('user');

    const handleNavigation = (tab) => {
        setActiveTab(tab);
    };

    const handleLogout = async () => {
        try {
            await logout();
            // Force a hard reload to clear any cached state
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
            // Still try to navigate to login page
            window.location.href = '/login';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Logout
                    </button>
                </div>

                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => handleNavigation('user')}
                        className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${activeTab === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => handleNavigation('invoice')}
                        className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${activeTab === 'invoice'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Invoice Management
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    {activeTab === 'user' && <UserManagement />}
                    {activeTab === 'invoice' && <InvoiceManagement />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 