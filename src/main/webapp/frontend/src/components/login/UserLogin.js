import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserLogin({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize the navigate function

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/auth/user/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
              email: email,
              password: password
          }),
          credentials: 'include'  // Include cookies and credentials
      });

      if (response.ok) {
          // store the JWT token in local storage
          const data = await response.json();
          localStorage.setItem('jwtToken', data.token);

          console.log('Login successful');
          setMessage('Login successful');
          setIsAuthenticated(true);
          navigate('/dashboard'); // redirect to dashboard
      } else {
          console.error('Login failed');
          setMessage('Login failed');
      }
  } catch (error) {
      console.error('Error:', error);
  }
  };

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
      <div className='bg-white shadow-md rounded-lg p-8 max-w-sm w-full'>
        <h2 className='text-2xl font-semibold text-gray-700 mb-6 text-center'>Login</h2>
        <form onSubmit={handleLogin}>
          <div className='mb-4'>
            <label className='block text-gray-600 text-sm font-medium mb-2'>Email</label>
            <input
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>
          <div className='mb-6'>
            <label className='block text-gray-600 text-sm font-medium mb-2'>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>
          <button
            type='submit'
            className='w-full bg-indigo-500 text-white py-2 rounded-md font-medium hover:bg-indigo-600 transition duration-150'
          >
            Login
          </button>
        </form>
        <p>
          Don't have an account? <a href='/register' className='text-blue-600'>Register</a>
        </p>
        {message && (
          <p className='text-center text-red-500 mt-4'>{message}</p>
        )}
      </div>
    </div>
  );
}

export default UserLogin;