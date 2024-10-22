import React, { useState } from 'react';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/auth/user-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Make sure the keys match what your backend expects
        credentials: 'include'  // This is required if your CORS policy allows credentials
      });
  
      const data = await response.text();
      if (response.ok) {
        setMessage('User registered successfully');
      } else {
        setMessage('Registration failed: ' + data);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred during registration');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Register</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-gray-600 text-sm font-medium mb-2">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-600 text-sm font-medium mb-2">Password</label>
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
            Register
          </button>
        </form>
        <p><a href='/login' className='text-blue-600'>Return to login</a></p>
        {message && (
          <p className="text-center text-red-500 mt-4">{message}</p>
        )}
      </div>
    </div>
  );  
}

export default Register;