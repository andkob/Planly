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

  // Memes
  const SuperScaryPage = () => {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace", background: "black", color: "lime" }}>
        <h1>403 Forbidden</h1>
        <p>Access denied. This incident has been reported.</p>
      </div>
    );
  };
  const RickRoll = () => {
    useEffect(() => {
      window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }, []);
    return null;
  };
  const DefensePage = () => {
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
      // Delay the message for extra suspense
      const timeout = setTimeout(() => setShowMessage(true), 2000);
      return () => clearTimeout(timeout);
    }, []);

    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'monospace' }}>
        <h1>🤖 Unauthorized Bot Detected</h1>
        <p>Analyzing user agent...</p>

        {showMessage && (
          <>
            <p style={{ color: 'red', fontWeight: 'bold' }}>Threat Level: Mildly Annoying</p>
            <p>Deploying countermeasures...</p>
            <img
              src="https://media.giphy.com/media/3og0IPxMM0erATueVW/giphy.gif"
              alt="Tracking"
              style={{ maxWidth: '300px', margin: '1rem auto' }}
            />
            <p>You have been added to the Naughty Bot List™.</p>
            <p>Enjoy your stay.</p>
            <button
              onClick={() => window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'hotpink',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Click here to report yourself 🙃
            </button>
          </>
        )}
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
    },
    // Memes
    {
      path: '/wp',
      element: <RickRoll />
    },
    {
      path: '/wordpress',
      element: <RickRoll />
    },
    {
      path: '/bk',
      element: <SuperScaryPage />
    },
    {
      path: '/backup',
      element: <SuperScaryPage />
    },
    {
      path: '/home',
      element: <DefensePage />
    },
    {
      path: '/main',
      element: <DefensePage />
    },
    {
      path: '/new',
      element: <DefensePage />
    },
    {
      path: '/old',
      element: <DefensePage />
    },
  ]);

  if (loading) {
    return <div>Loading...</div>; // Or a more elegant loading component
  }

  return <RouterProvider router={router} />;
}

export default App;