import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import UserLogin from './components/login/UserLogin';
import Register from './components/login/Register';
import UserDashboard from './components/UserDashboard';

function App() {
  console.log('App component rendering');
  const [showSchedule, setShowSchedule] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // TEMPORARY: load schedule data into in-memory database
  const testSheetID = "1ZXZwDDLnk7MCthMLQ-N6noKPqVf-10pf_2Qv_KxEbKM";

  // const storeScheduleData = async () => {
  //   const response = await fetch(`/api/schedule/fetch-store?sheetID=${testSheetID}`);
  //   if (response.ok) {
  //     console.log("schedule data stored in database");
  //   } else {
  //     console.error("error loading schedule data");
  //   }
  // }

  // useEffect(() => {
  //   storeScheduleData();
  // }, []); // Empty dependency array ensures this only runs once
  // END TEMPORARY

  const handleFetchResponses = () => {
    setShowSchedule(prev => !prev); // Toggle showSchedule
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<UserLogin setIsAuthenticated={setIsAuthenticated} />} />
        <Route path='register' element={<Register />} />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard handleFetchResponses={handleFetchResponses} /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect root to login */}
      </Routes>
    </Router>
  );
}

export default App;
