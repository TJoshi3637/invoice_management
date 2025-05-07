import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, testBackendConnection } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const connected = await testBackendConnection();
        setIsBackendConnected(connected);
        if (!connected) {
          setError('Unable to connect to backend server. Please check if the server is running.');
        }
      } catch (err) {
        console.error('Error checking backend connection:', err);
        setIsBackendConnected(false);
        setError('Unable to connect to backend server. Please check if the server is running.');
      }
    };

    checkBackendConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);

      // Store the token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 style={{ marginTop: '20px', textAlign: 'center', fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '10px', padding: '10px', borderRadius: '4px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isBackendConnected}
              style={{ 
                padding: '8px', 
                width: '100%', 
                marginBottom: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              placeholder="you@example.com"
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!isBackendConnected}
              style={{ 
                padding: '8px', 
                width: '100%', 
                marginBottom: '5px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center justify-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                style={{ 
                  height: '16px', 
                  width: '16px', 
                  borderRadius: '3px',
                  border: '1px solid #ccc'
                }}
              />
              <label htmlFor="remember-me" style={{ marginLeft: '8px', color: '#111827', fontSize: '0.875rem' }}>
                Remember me
              </label>
            </div>

            <div style={{ fontSize: '0.875rem' }}>
              <a href="#" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !isBackendConnected}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !isBackendConnected ? 'not-allowed' : 'pointer',
                width: '100%',
                opacity: loading || !isBackendConnected ? '0.5' : '1'
              }}
            >
              {loading ? (
                <div style={{ 
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  borderTopColor: 'white',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;