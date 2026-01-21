/**
 * Tableau de gestion des thèses pour le personnel
 * src/components/staff/StaffThesisTable.jsx
 */

import React from 'react';
import { 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaHistory, 
  FaToggleOn, 
  FaToggleOff 
} from 'react-icons/fa';

const StaffThesisTable = ({ 
  theses, 
  onToggleAvailability, 
  onEdit, 
  onDelete, 
  onViewHistory 
}) => {
  if (!theses || theses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-600">Aucune thèse trouvée</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                N°
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Titre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Directeur
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Année
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Statut
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {theses.map((thesis) => (
              <tr key={thesis.id} className="hover:bg-gray-50 transition">
                {/* N° */}
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  {thesis.reference || `${String(thesis.numero).padStart(3, '0')}/${String(thesis.annee).slice(-2)}`}
                </td>

                {/* Titre */}
                <td className="px-4 py-4 text-sm text-gray-700 max-w-md">
                  <div className="line-clamp-2">
                    {thesis.short_title || thesis.titre}
                  </div>
                </td>

                {/* Directeur */}
                <td className="px-4 py-4 text-sm text-gray-700">
                  {thesis.directeur}
                </td>

                {/* Année */}
                <td className="px-4 py-4 text-sm text-gray-700">
                  {thesis.annee}
                </td>

                {/* Statut */}
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => onToggleAvailability(thesis.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition ${
                      thesis.disponible
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                    title="Cliquer pour changer le statut"
                  >
                    {thesis.disponible ? (
                      <>
                        <FaToggleOn size={16} />
                        Disponible
                      </>
                    ) : (
                      <>
                        <FaToggleOff size={16} />
                        Emprunté
                      </>
                    )}
                  </button>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {/* Historique */}
                    <button
                      onClick={() => onViewHistory(thesis)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      title="Voir l'historique"
                    >
                      <FaHistory size={16} />
                    </button>

                    {/* Modifier */}
                    <button
                      onClick={() => onEdit(thesis)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Modifier"
                    >
                      <FaEdit size={16} />
                    </button>

                    {/* Supprimer */}
                    <button
                      onClick={() => onDelete(thesis.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex flex-wrap gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <FaHistory className="text-purple-600" />
            <span>Historique des changements</span>
          </div>
          <div className="flex items-center gap-2">
            <FaEdit className="text-blue-600" />
            <span>Modifier les informations</span>
          </div>
          <div className="flex items-center gap-2">
            <FaTrash className="text-red-600" />
            <span>Supprimer la thèse</span>
          </div>
          <div className="flex items-center gap-2">
            <FaToggleOn className="text-green-600" />
            <span>Cliquer sur le badge pour changer le statut</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffThesisTable;
