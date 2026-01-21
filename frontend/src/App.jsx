/**
 * Composant principal de l'application
 * src/App.jsx
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ThesisDetail from './pages/ThesisDetail';
import LibraryInfo from './pages/LibraryInfo';
import StaffLogin from './pages/StaffLogin';
import StaffDashboard from './pages/StaffDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally verify token with backend
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Show Header only for public routes */}
        <Routes>
          <Route path="/staff/*" element={null} />
          <Route path="*" element={<Header />} />
        </Routes>
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/thesis/:id" element={<ThesisDetail />} />
            <Route path="/bibliotheque" element={<LibraryInfo />} />
            
            {/* Staff Routes */}
            <Route 
              path="/staff/login" 
              element={
                user ? <Navigate to="/staff/dashboard" /> : <StaffLogin onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/staff/dashboard" 
              element={
                user ? <StaffDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/staff/login" />
              } 
            />
          </Routes>
        </main>
        
        {/* Show Footer only for public routes */}
        <Routes>
          <Route path="/staff/*" element={null} />
          <Route path="*" element={<Footer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;