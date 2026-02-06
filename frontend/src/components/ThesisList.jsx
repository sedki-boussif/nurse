/**
 * Liste des PFE avec pagination
 * src/components/ThesisList.jsx
 */

import React from 'react';
import ThesisCard from './ThesisCard';
import Pagination from './Pagination';

const ThesisList = ({ theses, totalCount, currentPage, onPageChange }) => {
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div>
      {/* Liste des cartes de PFE */}
      <div className="space-y-4 mb-6">
        {theses.map((thesis) => (
          <ThesisCard key={thesis.id} thesis={thesis} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default ThesisList;