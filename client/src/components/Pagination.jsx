import React from 'react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, hasNext, hasPrev } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${!hasPrev ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => hasPrev && onPageChange(currentPage - 1)}
            disabled={!hasPrev}
          >
            Previous
          </button>
        </li>

        {getPageNumbers().map(page => (
          <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}

        <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => hasNext && onPageChange(currentPage + 1)}
            disabled={!hasNext}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
