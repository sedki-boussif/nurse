/**
 * Modal pour ajouter ou modifier un PFE
 * src/components/staff/AddEditThesisModal.jsx
 */

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';

const AddEditThesisModal = ({ thesis, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    numero: '',
    annee: new Date().getFullYear(),
    titre: '',
    directeur: '',
    disponible: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (thesis) {
      setFormData({
        numero: thesis.numero || '',
        annee: thesis.annee || new Date().getFullYear(),
        titre: thesis.titre || '',
        directeur: thesis.directeur || '',
        disponible: thesis.disponible !== undefined ? thesis.disponible : true,
      });
    } else {
      // Reset form when adding new thesis
      setFormData({
        numero: '',
        annee: new Date().getFullYear(),
        titre: '',
        directeur: '',
        disponible: true,
      });
    }
  }, [thesis]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {thesis ? 'Modifier le PFE' : 'Ajouter un nouveau PFE'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* N° - Show but don't allow editing for existing thesis */}
            {thesis && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  N° de référence
                </label>
                <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  {String(formData.numero).padStart(3, '0')}/{String(formData.annee).slice(-2)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Format: XXX/YY (numéro/année)
                </p>
              </div>
            )}
            {!thesis && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  N° de référence *
                </label>
                <input
                  type="number"
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: parseInt(e.target.value) || '' })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                  min="1"
                  placeholder="Ex: 1, 2, 3..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Numéro unique du PFE (sera affiché au format XXX/YY)
                </p>
              </div>
            )}

            {/* Année */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Année de soutenance *
              </label>
              <input
                type="number"
                value={formData.annee}
                onChange={(e) =>
                  setFormData({ ...formData, annee: parseInt(e.target.value) })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                min="2000"
                max="2100"
              />
            </div>

            {/* Titre */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Titre du TFE *
              </label>
              <textarea
                value={formData.titre}
                onChange={(e) =>
                  setFormData({ ...formData, titre: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
                disabled={loading}
                placeholder="Titre complet du Travail de Fin d'Études"
              />
            </div>

            {/* Directeur */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Directeur de Mémoire *
              </label>
              <input
                type="text"
                value={formData.directeur}
                onChange={(e) =>
                  setFormData({ ...formData, directeur: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Nom du directeur de mémoire"
              />
            </div>

            {/* Disponibilité */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Disponibilité
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.disponible === true}
                    onChange={() =>
                      setFormData({ ...formData, disponible: true })
                    }
                    disabled={loading}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Disponible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.disponible === false}
                    onChange={() =>
                      setFormData({ ...formData, disponible: false })
                    }
                    disabled={loading}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Emprunté</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <span>{thesis ? 'Modifier' : 'Ajouter'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditThesisModal;
