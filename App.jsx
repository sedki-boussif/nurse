/**
 * Composant principal de l'application
 * src/App.jsx
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ThesisDetail from './pages/ThesisDetail';
import LibraryInfo from './pages/LibraryInfo';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;