import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import UserLogin from './components/login/UserLogin';
import Register from './components/login/Register';
import UserDashboard from './components/user-dashboard/UserDashboard';
import EditSchedule from './components/edit-schedule-page/EditSchedulePage';
import OrganizationDashboard from './components/organization-dashboard/OrganizationDashboard';
import { checkAuthStatus } from './util/JwtAuth';
import ChatPage from './components/chat-page/ChatPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the user is authenticated when the app loads
  useEffect(() => {
    const validateAuth = async () => {
      try {
        const isValid = await checkAuthStatus();
        setIsAuthenticated(isValid);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    validateAuth();
  }, []);

  // Protected Route wrapper component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Will prevent access to /login until the current user logs out and the jwt is cleared
  const LoginRoute = ({ children }) => {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }

  // Error Boundary component
  const ErrorBoundary = () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <h2 className="text-lg font-semibold mb-2 text-red-800">
            Oops! Something went wrong
          </h2>
          <p className="text-sm text-red-600">
            We couldn't find what you were looking for. Please try again or return to the dashboard.
          </p>
        </div>
      </div>
    );
  };

  // Router configuration
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />
    },
    {
      path: '/login',
      element: (
        <LoginRoute>
          <UserLogin setIsAuthenticated={setIsAuthenticated} />
        </LoginRoute>
      )
    },
    {
      path: '/register',
      element: <Register />
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <UserDashboard setIsAuthenticated={setIsAuthenticated}/>
        </ProtectedRoute>
      )
    },
    {
      path: '/org/:orgId',
      element: (
        <ProtectedRoute>
          <OrganizationDashboard />
        </ProtectedRoute>
      ),
      errorElement: <ErrorBoundary />
    },
    {
      path: '/edit-schedule',
      element: (
        <ProtectedRoute>
          <EditSchedule />
        </ProtectedRoute>
      )
    },
    {
      path: '/chat',
      element: (
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      )
    },
    {
      path: '*',
      element: <ErrorBoundary />
    }
  ]);

  if (loading) {
    return <div>Loading...</div>; // Or a more elegant loading component
  }

  return <RouterProvider router={router} />;
}

export default App;