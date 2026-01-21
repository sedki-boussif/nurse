/**
 * Tableau de bord principal pour le personnel
 * src/pages/StaffDashboard.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaPlus, 
  FaSpinner, 
  FaSignOutAlt,
  FaFilter,
  FaSync
} from 'react-icons/fa';
import { staffThesesAPI, authAPI } from '../services/staffApi';
import StaffThesisTable from '../components/staff/StaffThesisTable';
import AddEditThesisModal from '../components/staff/AddEditThesisModal';
import ThesisHistoryModal from '../components/staff/ThesisHistoryModal';

const StaffDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    annee: '',
    disponible: '',
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingThesis, setEditingThesis] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadTheses();
  }, [searchTerm, filters]);

  const loadTheses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...(searchTerm && { search: searchTerm }),
        ...(filters.annee && { annee: filters.annee }),
        ...(filters.disponible !== '' && { disponible: filters.disponible }),
        page_size: 1000, // Load all theses
      };

      const data = await staffThesesAPI.getAll(params);
      setTheses(data.results || data);
      setTotalCount(data.count || (data.results?.length || data.length));
    } catch (err) {
      setError('Erreur lors du chargement des thèses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      onLogout();
      navigate('/staff/login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAvailability = async (thesisId) => {
    try {
      const response = await staffThesesAPI.toggleAvailability(thesisId);
      console.log('Toggle response:', response);
      loadTheses(); // Recharger la liste
    } catch (err) {
      console.error('Toggle error:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Erreur lors du changement de statut';
      alert(errorMsg);
    }
  };

  const handleDeleteThesis = async (thesisId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette thèse ?')) {
      return;
    }

    try {
      await staffThesesAPI.delete(thesisId);
      loadTheses();
    } catch (err) {
      alert('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const handleSaveThesis = async (thesisData) => {
    try {
      if (editingThesis) {
        await staffThesesAPI.update(editingThesis.id, thesisData);
      } else {
        await staffThesesAPI.create(thesisData);
      }
      setShowAddModal(false);
      setEditingThesis(null);
      loadTheses();
    } catch (err) {
      throw new Error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestion des Thèses
              </h1>
              <p className="text-sm text-gray-600">
                Connecté en tant que: {user?.username} ({user?.role})
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Voir le site public
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <FaSignOutAlt />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Barre d'actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Recherche */}
            <div className="flex-grow max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher (titre, directeur, N°)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <select
                value={filters.disponible}
                onChange={(e) => setFilters({ ...filters, disponible: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="true">Disponibles</option>
                <option value="false">Empruntés</option>
              </select>

              <button
                onClick={loadTheses}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <FaSync />
                Actualiser
              </button>

              <button
                onClick={() => {
                  setEditingThesis(null);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FaPlus />
                Ajouter une thèse
              </button>
            </div>
          </div>

          {/* Résumé */}
          <div className="mt-4 text-sm text-gray-600">
            {totalCount} thèse{totalCount > 1 ? 's' : ''} trouvée{totalCount > 1 ? 's' : ''}
          </div>
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
          </div>
        ) : (
          <StaffThesisTable
            theses={theses}
            onToggleAvailability={handleToggleAvailability}
            onEdit={(thesis) => {
              setEditingThesis(thesis);
              setShowAddModal(true);
            }}
            onDelete={handleDeleteThesis}
            onViewHistory={(thesis) => setViewingHistory(thesis)}
          />
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddEditThesisModal
          thesis={editingThesis}
          onSave={handleSaveThesis}
          onClose={() => {
            setShowAddModal(false);
            setEditingThesis(null);
          }}
        />
      )}

      {viewingHistory && (
        <ThesisHistoryModal
          thesis={viewingHistory}
          onClose={() => setViewingHistory(null)}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
