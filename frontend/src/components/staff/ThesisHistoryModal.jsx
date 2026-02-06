/**
 * Modal pour afficher l'historique des changements de statut
 * src/components/staff/ThesisHistoryModal.jsx
 */

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaHistory } from 'react-icons/fa';
import { staffThesesAPI } from '../../services/staffApi';

const ThesisHistoryModal = ({ thesis, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [thesis.id]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await staffThesesAPI.getHistory(thesis.id);
      setHistory(data);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaHistory className="text-purple-600" />
              Historique des changements
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              PFE N° {thesis.numero} - {thesis.short_title || thesis.titre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin text-purple-600 text-3xl" />
              <span className="ml-3 text-gray-600">Chargement...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <FaHistory className="text-gray-400 text-5xl mx-auto mb-4" />
              <p className="text-gray-600">
                Aucun changement de statut enregistré pour ce PFE
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            entry.ancien_statut
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entry.ancien_statut ? 'Disponible' : 'Emprunté'}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            entry.nouveau_statut
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {entry.nouveau_statut ? 'Disponible' : 'Emprunté'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 font-medium">
                        {entry.action_label}
                      </p>

                      <div className="mt-2 text-xs text-gray-500 flex items-center gap-4">
                        <span>
                          Par: <span className="font-medium">{entry.modifie_par_nom}</span>
                        </span>
                        <span>
                          Le: <span className="font-medium">{formatDate(entry.date_modification)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThesisHistoryModal;
