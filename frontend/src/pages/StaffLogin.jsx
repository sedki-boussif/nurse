/**
 * Page de connexion pour le personnel
 * src/pages/StaffLogin.jsx
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaSpinner } from 'react-icons/fa';
import { authAPI } from '../services/staffApi';

const StaffLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(credentials.username, credentials.password);
      const user = await authAPI.getCurrentUser();
      onLogin(user);
      navigate('/staff/dashboard');
    } catch (err) {
      setError('Nom d\'utilisateur ou mot de passe incorrect');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo / Titre */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full mb-4">
            <FaLock className="text-blue-600 text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Interface Personnel
          </h1>
          <p className="text-blue-200">
            Gestion des PFE Infirmiers
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Nom d'utilisateur */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre nom d'utilisateur"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre mot de passe"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </form>

          {/* Lien retour */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-blue-100 text-sm">
          <p>Accès réservé au personnel de la bibliothèque</p>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
