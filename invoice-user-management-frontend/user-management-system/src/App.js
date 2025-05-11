import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';  // Add Link import here
import UserDashboard from './components/UserManagement/UserDashboard';
import CreateInvoiceForm from './components/InvoiceManagement/CreateInvoiceForm';
import Login from './components/Auth/Login';

const Navigation = ({ onLogout }) => {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white font-bold text-xl">User Management System</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {/* Replaced anchor tags with Link components */}
                <Link to="/dashboard" className="text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                <Link to="/users" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Users</Link>
                <Link to="/invoices" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Invoices</Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <span className="text-gray-300 mr-4">
                {currentUser.username} ({currentUser.role})
              </span>
              <button
                onClick={onLogout}
                className="bg-gray-700 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProtectedLayout = ({ onLogout }) => {
  return (
    <>
      <Navigation onLogout={onLogout} />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/users" element={<UserDashboard />} />
          <Route path="/invoices" element={<CreateInvoiceForm />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/UserDashboard" replace /> : <Login />} 
          />
          <Route
            path="/*"
            element={
              isAuthenticated ? 
                <ProtectedLayout onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
