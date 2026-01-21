/**
 * Excel Upload Component - For staff to upload thesis data
 * src/components/staff/ExcelUpload.jsx
 */

import React, { useState } from 'react';
import { FaUpload, FaFileExcel, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { staffThesesAPI } from '../../services/staffApi';

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check if it's an Excel file
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clear', clearExisting);

      const response = await staffThesesAPI.uploadExcel(formData);
      setResult(response);
      setFile(null);
      // Reset file input
      document.getElementById('excel-file-input').value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaFileExcel className="text-green-600 text-3xl" />
        <h2 className="text-2xl font-bold text-gray-900">
          Importer des Thèses (Excel)
        </h2>
      </div>

      {/* File Upload Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fichier Excel
          </label>
          <input
            id="excel-file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Fichier sélectionné: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        {/* Clear existing option */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="clear-existing"
            checked={clearExisting}
            onChange={(e) => setClearExisting(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="clear-existing" className="text-sm text-gray-700">
            Supprimer toutes les thèses existantes avant l'import
          </label>
        </div>

        {clearExisting && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Attention:</strong> Cette action supprimera toutes les thèses existantes dans la base de données avant d'importer les nouvelles.
              </p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition
            ${!file || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Import en cours...</span>
            </>
          ) : (
            <>
              <FaUpload />
              <span>Importer le fichier</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-red-600 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <FaCheckCircle className="text-green-600 mt-0.5" />
            <p className="text-sm font-medium text-green-800">{result.message}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {result.stats.deleted > 0 && (
              <div className="bg-white rounded p-2">
                <p className="text-gray-600">Supprimées</p>
                <p className="text-xl font-bold text-red-600">{result.stats.deleted}</p>
              </div>
            )}
            <div className="bg-white rounded p-2">
              <p className="text-gray-600">Créées</p>
              <p className="text-xl font-bold text-green-600">{result.stats.created}</p>
            </div>
            <div className="bg-white rounded p-2">
              <p className="text-gray-600">Mises à jour</p>
              <p className="text-xl font-bold text-blue-600">{result.stats.updated}</p>
            </div>
            {result.stats.errors > 0 && (
              <div className="bg-white rounded p-2">
                <p className="text-gray-600">Erreurs</p>
                <p className="text-xl font-bold text-orange-600">{result.stats.errors}</p>
              </div>
            )}
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="mt-3 p-3 bg-orange-50 rounded">
              <p className="text-sm font-medium text-orange-800 mb-1">Erreurs détectées:</p>
              <ul className="text-xs text-orange-700 list-disc list-inside">
                {result.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Format Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Format du fichier Excel
        </h3>
        <p className="text-sm text-blue-800 mb-2">
          Le fichier doit contenir les colonnes suivantes:
        </p>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li><strong>N°</strong> ou <strong>Numéro</strong> - Numéro de la thèse</li>
          <li><strong>Année</strong> - Année de publication</li>
          <li><strong>Titre</strong> ou <strong>Titre du TFE</strong> - Titre de la thèse</li>
          <li><strong>Directeur</strong> ou <strong>Directeur de Mémoire</strong> - Nom du directeur</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelUpload;
