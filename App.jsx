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
import { authAPI } from './services/staffApi';

// Composant pour protéger les routes staff
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/staff/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Routes publiques (étudiants) */}
        <Route
          path="/*"
          element={
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/thesis/:id" element={<ThesisDetail />} />
                  <Route path="/bibliotheque" element={<LibraryInfo />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />

        {/* Routes staff (personnel bibliothèque) */}
        <Route
          path="/staff/login"
          element={
            user ? (
              <Navigate to="/staff/dashboard" replace />
            ) : (
              <StaffLogin onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute user={user}>
              <StaffDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;