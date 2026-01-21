/**
 * Composant d'affichage des statistiques
 * src/components/Statistics.jsx
 */

import React, { useState, useEffect } from 'react';
import { FaBook, FaCalendarAlt, FaUserGraduate } from 'react-icons/fa';
import { thesesAPI } from '../services/api';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await thesesAPI.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total thèses */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              Total des Thèses
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.total_theses}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg">
            <FaBook className="text-blue-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Période couverte */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              Période Couverte
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.year_range.min} - {stats.year_range.max}
            </p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <FaCalendarAlt className="text-green-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Directeurs */}
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              Directeurs
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.total_supervisors}
            </p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <FaUserGraduate className="text-purple-600 text-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;