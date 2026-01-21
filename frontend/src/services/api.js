/**
 * Service API pour communiquer avec le backend Django
 * src/services/api.js
 */

import axios from 'axios';

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur API:', error);
    return Promise.reject(error);
  }
);

/**
 * Service pour gérer les thèses
 */
export const thesesAPI = {
  /**
   * Récupérer toutes les thèses avec pagination
   * @param {number} page - Numéro de page
   * @param {Object} filters - Filtres (annee, directeur, etc.)
   */
  getAll: async (page = 1, filters = {}) => {
    const params = { page, ...filters };
    const response = await api.get('/theses/', { params });
    return response.data;
  },

  /**
   * Récupérer une thèse par ID
   * @param {number} id - ID de la thèse
   */
  getById: async (id) => {
    const response = await api.get(`/theses/${id}/`);
    return response.data;
  },

  /**
   * Rechercher des thèses par terme (titre ET directeur)
   * @param {string} query - Terme de recherche
   * @param {Object} filters - Filtres additionnels
   */
  search: async (query, filters = {}) => {
    const params = { q: query, ...filters };
    const response = await api.get('/theses/search/', { params });
    return response.data;
  },

  /**
   * Récupérer les années disponibles
   */
  getYears: async () => {
    const response = await api.get('/theses/years/');
    return response.data;
  },

  /**
   * Récupérer les directeurs disponibles
   */
  getSupervisors: async () => {
    const response = await api.get('/theses/supervisors/');
    return response.data;
  },

  /**
   * Récupérer les statistiques
   */
  getStatistics: async () => {
    const response = await api.get('/theses/statistics/');
    return response.data;
  },
};

/**
 * Service pour les informations de la bibliothèque
 */
export const libraryAPI = {
  /**
   * Récupérer les informations de la bibliothèque
   */
  getInfo: async () => {
    const response = await api.get('/library-info/');
    return response.data;
  },
};

/**
 * Health check de l'API
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health/');
    return response.data;
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

export default api;