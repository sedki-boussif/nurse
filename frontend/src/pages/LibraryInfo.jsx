/**
 * Page d'informations sur la bibliothèque
 * src/pages/LibraryInfo.jsx
 */

import React, { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaPhone, 
  FaEnvelope,
  FaInfoCircle,
  FaSpinner,
  FaBook
} from 'react-icons/fa';
import { libraryAPI } from '../services/api';

const LibraryInfo = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLibraryInfo();
  }, []);

  const loadLibraryInfo = async () => {
    try {
      const data = await libraryAPI.getInfo();
      setInfo(data);
    } catch (err) {
      setError('Erreur lors du chargement des informations');
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 md:p-12 mb-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <FaBook className="text-5xl mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Bibliothèque Universitaire
          </h1>
          <p className="text-blue-100 text-lg">
            Informations pratiques pour consulter les PFE
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <p className="text-yellow-800">
            Les informations de la bibliothèque ne sont pas encore configurées.
            Veuillez contacter l'administrateur.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Adresse */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaMapMarkerAlt className="text-blue-600 text-xl" />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Adresse
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {info?.adresse || 'Information non disponible'}
              </p>
            </div>
          </div>
        </div>

        {/* Horaires */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaClock className="text-green-600 text-xl" />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Horaires d'Ouverture
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {info?.horaires || 'Information non disponible'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        {(info?.telephone || info?.email) && (
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaPhone className="text-purple-600 text-xl" />
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Contact
                </h2>
                <div className="space-y-3 text-gray-700">
                  {info?.telephone && (
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" size={14} />
                      <a 
                        href={`tel:${info.telephone}`}
                        className="hover:text-blue-600 transition"
                      >
                        {info.telephone}
                      </a>
                    </div>
                  )}
                  {info?.email && (
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" size={14} />
                      <a 
                        href={`mailto:${info.email}`}
                        className="hover:text-blue-600 transition"
                      >
                        {info.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaInfoCircle className="text-orange-600 text-xl" />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Comment Consulter un PFE
              </h2>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {info?.instructions || 'Information non disponible'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conseils pratiques */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <FaInfoCircle />
            Conseils Pratiques
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Notez le numéro de référence du PFE avant de vous déplacer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Munissez-vous de votre carte d'étudiant ou pièce d'identité</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Les PFE sont consultables sur place uniquement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>N'hésitez pas à demander l'aide du personnel de la bibliothèque</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LibraryInfo;