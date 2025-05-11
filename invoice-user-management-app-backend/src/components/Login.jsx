import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/apiService';
import { checkBackendHealth } from '../utils/healthCheck';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkBackendConnection = async () => {
            const health = await checkBackendHealth();
            if (!health.isHealthy) {
                setError(health.error);
            }
        };
        checkBackendConnection();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        setError('');
        setLoading(true);

        if (!email || !password) {
            console.log('Missing credentials:', { email: !!email, password: !!password });
            setError('Please enter both email and password');
            setLoading(false);
            return;
        }

        try {
            console.log('Starting login process with:', {
                email,
                passwordLength: password?.length,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            const response = await login({
                username: email,
                password: password,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            console.log('Login response received:', {
                hasToken: !!response?.token,
                hasUser: !!response?.user,
                userData: response?.user
            });

            if (!response?.token || !response?.user) {
                console.error('Invalid response:', response);
                throw new Error('Invalid response from server');
            }

            // Store the token in localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            console.log('Auth data stored, navigating to dashboard...');

            // Redirect to dashboard
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('Login error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                requestData: {
                    username: email,
                    passwordLength: password?.length,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            });
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="text-red-600 text-sm">{error}</div>
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login; 