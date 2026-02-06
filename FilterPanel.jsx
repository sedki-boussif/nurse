/**
 * Panneau de filtres (année, directeur)
 * src/components/FilterPanel.jsx
 */

import React, { useState, useEffect } from 'react';
import { FaFilter, FaCalendar, FaUserTie, FaTimes } from 'react-icons/fa';
import { thesesAPI } from '../services/api';

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const [years, setYears] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const [yearsData, supervisorsData] = await Promise.all([
        thesesAPI.getYears(),
        thesesAPI.getSupervisors(),
      ]);
      
      setYears(yearsData);
      setSupervisors(supervisorsData);
    } catch (error) {
      console.error('Erreur lors du chargement des filtres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (year) => {
    onFilterChange({
      ...filters,
      annee: year === filters.annee ? null : year,
    });
  };

  const handleSupervisorChange = (supervisor) => {
    onFilterChange({
      ...filters,
      directeur: supervisor === filters.directeur ? null : supervisor,
    });
  };

  const hasActiveFilters = filters.annee || filters.directeur;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FaFilter className="text-blue-600" />
          <h3 className="font-bold text-gray-900">Filtres</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            <FaTimes size={12} />
            Effacer
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">
          Chargement...
        </div>
      ) : (
        <>
          {/* Filtre disponibles uniquement */}
          <div className="mb-6 pb-6 border-b">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <input
                type="checkbox"
                checked={filters.disponibles || false}
                onChange={(e) => onFilterChange({
                  ...filters,
                  disponibles: e.target.checked
                })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Disponibles uniquement
              </span>
            </label>
          </div>

          {/* Filtre par année */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FaCalendar className="text-gray-600 text-sm" />
              <h4 className="font-semibold text-gray-800">Année</h4>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {years.map((year) => (
                <button
                  key={year.annee}
                  onClick={() => handleYearChange(year.annee)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${
                    filters.annee === year.annee
                      ? 'bg-blue-100 text-blue-800 font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{year.annee}</span>
                    <span className="text-sm text-gray-500">
                      ({year.count})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par directeur */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaUserTie className="text-gray-600 text-sm" />
              <h4 className="font-semibold text-gray-800">Directeur</h4>
            </div>
            
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {supervisors.map((supervisor) => (
                <button
                  key={supervisor.directeur}
                  onClick={() => handleSupervisorChange(supervisor.directeur)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                    filters.directeur === supervisor.directeur
                      ? 'bg-blue-100 text-blue-800 font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{supervisor.directeur}</span>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      ({supervisor.count})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterPanel;