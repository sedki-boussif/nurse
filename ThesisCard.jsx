/**
 * Carte d'affichage d'une thèse
 * src/components/ThesisCard.jsx
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaUserTie, FaArrowRight, FaHashtag } from 'react-icons/fa';

const ThesisCard = ({ thesis }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-grow">
          {/* Numéro de référence */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <FaHashtag size={10} />
            <span>Réf: {thesis.numero}</span>
          </div>

          {/* Titre */}
          <Link to={`/thesis/${thesis.id}`}>
            <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition mb-3 leading-snug">
              {thesis.short_title || thesis.titre}
            </h3>
          </Link>

          {/* Métadonnées */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaCalendar className="text-blue-600" />
              <span className="font-medium">{thesis.annee}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <FaUserTie className="text-green-600" />
              <span>{thesis.directeur}</span>
            </div>
          </div>
        </div>

        {/* Bouton de détail */}
        <Link
          to={`/thesis/${thesis.id}`}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap self-start"
        >
          Voir détails
          <FaArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};

export default ThesisCard;