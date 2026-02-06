/**
 * Page d'accueil avec recherche et navigation
 * src/pages/Home.jsx
 */

import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { thesesAPI } from '../services/api';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ThesisList from '../components/ThesisList';
import Statistics from '../components/Statistics';

const Home = () => {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    annee: null,
    directeur: null,
    disponibles: false,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Charger les thèses au montage et lors des changements de filtres
  useEffect(() => {
    loadTheses();
  }, [currentPage, filters]);

  const loadTheses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await thesesAPI.getAll(currentPage, filters);
      
      setTheses(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      setError('Erreur lors du chargement des thèses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gérer la recherche
  const handleSearch = async (query) => {
    if (!query.trim()) {
      loadTheses();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchQuery(query);
      
      const data = await thesesAPI.search(query, filters);
      
      setTheses(data.results || []);
      setTotalCount(data.count || 0);
      setCurrentPage(1);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Gérer les filtres
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilters({ annee: null, directeur: null, disponibles: false });
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section avec Recherche */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Recherchez une Thèse Infirmière
          </h1>
          <p className="text-blue-100 mb-6 text-lg">
            Explorez les travaux de recherche des étudiants diplômés
          </p>
          
          <SearchBar onSearch={handleSearch} />
          
          <p className="text-xs text-blue-200 mt-4">
            💡 Recherchez par titre de thèse ou nom du directeur
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <Statistics />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
        {/* Panel de filtres */}
        <aside className="lg:col-span-1">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Liste des résultats */}
        <div className="lg:col-span-3">
          {/* Résumé des résultats */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {searchQuery ? `Résultats pour "${searchQuery}"` : 'Toutes les thèses'}
                </h2>
                <p className="text-sm text-gray-600">
                  {totalCount} thèse{totalCount > 1 ? 's' : ''} trouvée{totalCount > 1 ? 's' : ''}
                </p>
              </div>
              
              {(searchQuery || filters.annee || filters.directeur || filters.disponibles) && (
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* État de chargement */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-blue-600 text-3xl" />
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Liste des thèses */}
          {!loading && !error && (
            <ThesisList
              theses={theses}
              totalCount={totalCount}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Aucun résultat */}
          {!loading && !error && theses.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <FaSearch className="text-gray-400 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aucune thèse trouvée
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Voir toutes les thèses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;