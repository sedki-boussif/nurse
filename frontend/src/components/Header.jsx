/**
 * Composant Header - Navigation principale
 * src/components/Header.jsx
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaBookMedical, FaMapMarkerAlt } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-1">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <img 
              src="/isepsi.png" 
              alt="Logo ISEPSI" 
              className="h-[120px] w-[120px] object-contain"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Thèses Infirmières
              </h1>
              <p className="text-xs md:text-sm text-gray-600">
                Bibliothèque Universitaire
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden md:inline-block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              Accueil
            </Link>
            <Link
              to="/bibliotheque"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaMapMarkerAlt />
              <span className="hidden md:inline">Bibliothèque</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;