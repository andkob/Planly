import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UserLogin = ({ setIsAuthenticated }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if the URL has a `logout=true` parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('logout') === 'true') {
      setMessage('Logout successful');
    }
  }, [location]);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier,
          password: password
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Token received:', data.token);
        localStorage.setItem('jwtToken', data.token);

        setMessage('Login successful');
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        const errorText = await response.text();
        console.error('Login failed: ' + errorText);
        setMessage(errorText);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-md font-medium hover:bg-indigo-600 transition duration-150"
          >
            Login
          </button>
        </form>

        <div className="mt-6">
          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-indigo-600 hover:text-indigo-500">
              Register
            </a>
          </p>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-md text-center ${
            message === 'Login successful' || message === 'Logout successful'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLogin;