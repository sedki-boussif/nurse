/**
 * Page de détail d'une thèse
 * src/pages/ThesisDetail.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCalendar, 
  FaUserTie, 
  FaHashtag, 
  FaMapMarkerAlt,
  FaSpinner 
} from 'react-icons/fa';
import { thesesAPI } from '../services/api';

const ThesisDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thesis, setThesis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadThesis();
  }, [id]);

  const loadThesis = async () => {
    try {
      setLoading(true);
      const data = await thesesAPI.getById(id);
      setThesis(data);
    } catch (err) {
      setError('Thèse introuvable');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-blue-600 text-3xl" />
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !thesis) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              Erreur
            </h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <FaArrowLeft />
        <span>Retour aux résultats</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Numéro de référence */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <FaHashtag size={12} />
              <span>Référence: {thesis.numero}</span>
            </div>

            {/* Titre */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {thesis.titre}
            </h1>

            {/* Métadonnées */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <FaCalendar className="text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Année de soutenance</p>
                  <p className="text-xl font-bold text-gray-900">{thesis.annee}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                <FaUserTie className="text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Directeur de Mémoire</p>
                  <p className="text-xl font-semibold text-gray-900">{thesis.directeur}</p>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Informations
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <span className="font-medium">Date d'ajout:</span>{' '}
                  {new Date(thesis.created_at).toLocaleDateString('fr-FR')}
                </p>
                {thesis.updated_at !== thesis.created_at && (
                  <p>
                    <span className="font-medium">Dernière modification:</span>{' '}
                    {new Date(thesis.updated_at).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Accès à la thèse */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white sticky top-24">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaMapMarkerAlt />
              Accéder à cette thèse
            </h2>
            
            <p className="text-blue-100 mb-6 text-sm">
              Cette thèse est disponible en consultation à la bibliothèque universitaire.
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-xs text-blue-100 mb-1">Référence à mentionner</p>
                <p className="text-lg font-bold">N° {thesis.numero}</p>
              </div>
            </div>

            <Link
              to="/bibliotheque"
              className="block w-full text-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
            >
              Informations bibliothèque
            </Link>

            <p className="text-xs text-blue-200 mt-4 text-center">
              Horaires, adresse et modalités d'accès
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThesisDetail;