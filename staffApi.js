/**
 * Service API pour l'interface staff
 * src/services/staffApi.js
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const staffApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Pour les cookies de session Django
});

// Intercepteur pour inclure le token CSRF si disponible
staffApi.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Fonction utilitaire pour récupérer les cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * Service d'authentification
 */
export const authAPI = {
  /**
   * Connexion
   */
  login: async (username, password) => {
    const response = await staffApi.post('/auth/login/', {
      username,
      password,
    });
    return response.data;
  },

  /**
   * Déconnexion
   */
  logout: async () => {
    const response = await staffApi.post('/auth/logout/');
    return response.data;
  },

  /**
   * Récupérer l'utilisateur actuel
   */
  getCurrentUser: async () => {
    const response = await staffApi.get('/auth/me/');
    return response.data;
  },
};

/**
 * Service pour les thèses (interface staff)
 */
export const staffThesesAPI = {
  /**
   * Récupérer toutes les thèses (avec filtres et recherche)
   */
  getAll: async (params = {}) => {
    const response = await staffApi.get('/staff/theses/', { params });
    return response.data;
  },

  /**
   * Récupérer une thèse par ID
   */
  getById: async (id) => {
    const response = await staffApi.get(`/staff/theses/${id}/`);
    return response.data;
  },

  /**
   * Créer une nouvelle thèse
   */
  create: async (thesisData) => {
    const response = await staffApi.post('/staff/theses/', thesisData);
    return response.data;
  },

  /**
   * Modifier une thèse
   */
  update: async (id, thesisData) => {
    const response = await staffApi.put(`/staff/theses/${id}/`, thesisData);
    return response.data;
  },

  /**
   * Modifier partiellement une thèse
   */
  partialUpdate: async (id, thesisData) => {
    const response = await staffApi.patch(`/staff/theses/${id}/`, thesisData);
    return response.data;
  },

  /**
   * Supprimer une thèse
   */
  delete: async (id) => {
    const response = await staffApi.delete(`/staff/theses/${id}/`);
    return response.data;
  },

  /**
   * Basculer la disponibilité d'une thèse
   */
  toggleAvailability: async (id) => {
    const response = await staffApi.post(`/staff/theses/${id}/toggle/`);
    return response.data;
  },

  /**
   * Récupérer l'historique des changements de statut
   */
  getHistory: async (id) => {
    const response = await staffApi.get(`/staff/theses/${id}/history/`);
    return response.data;
  },

  /**
   * Récupérer les changements récents
   */
  getRecentChanges: async () => {
    const response = await staffApi.get('/staff/theses/recent_changes/');
    return response.data;
  },
};

export default staffApi;
