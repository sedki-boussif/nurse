/**
 * Composant Footer - Pied de page
 * src/components/Footer.jsx
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">
              À Propos
            </h3>
            <p className="text-sm text-gray-400">
              Plateforme de recherche des PFE infirmiers pour faciliter
              l'accès aux travaux de recherche des étudiants diplômés.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">
              Liens Rapides
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition">
                  Rechercher un PFE
                </Link>
              </li>
              <li>
                <Link to="/bibliotheque" className="hover:text-blue-400 transition">
                  Informations Bibliothèque
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">
              Besoin d'Aide ?
            </h3>
            <p className="text-sm text-gray-400">
              Consultez notre page{' '}
              <Link to="/bibliotheque" className="text-blue-400 hover:underline">
                Bibliothèque
              </Link>
              {' '}pour plus d'informations sur l'accès aux PFE.
            </p>
          </div>
        </div>

        {/* Partenaires */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
            <img 
              src="/etoileformation.png" 
              alt="Étoile Formation" 
              className="h-36 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <img 
              src="/chatgpt-logo.png" 
              alt="ChatGPT" 
              className="h-36 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              Développé par <span className="text-lg">🦇</span> pour faciliter la recherche académique
            </p>
            <p className="text-xs text-gray-600 mt-2">
              © {currentYear} Plateforme PFE Infirmiers. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;