/**
 * Composant barre de recherche
 * src/components/SearchBar.jsx
 */

import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par titre ou directeur de mémoire..."
          className="w-full px-6 py-4 text-gray-900 bg-white rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition pr-32"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Effacer
            </button>
          )}
          
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md"
          >
            <FaSearch />
            <span className="hidden sm:inline">Rechercher</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;