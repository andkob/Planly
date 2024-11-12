import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import UserLogin from './components/login/UserLogin';
import Register from './components/login/Register';
import UserDashboard from './components/dashboard/UserDashboard';
import EditSchedule from './components/edit-schedule-page/EditSchedulePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the user is authenticated when the app loads
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      // TODO - validate the token here (e.g., check its expiration)
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a more elegant loading component but doesn't matter rn
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<UserLogin setIsAuthenticated={setIsAuthenticated} />} />
        <Route path='/register' element={<Register />} />
        <Route 
          path="/dashboard"
          element={isAuthenticated ? <UserDashboard /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect root to login */}
        <Route path='/edit-schedule' element={isAuthenticated ? <EditSchedule /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
  // return (
  //   <Router>
  //     <Routes>
  //       <Route path="/dashboard" element={<UserDashboard />} />
  //       <Route path='/edit-schedule' element={<EditSchedule />} />
  //     </Routes>
  //   </Router>
  // )
}

export default App;
