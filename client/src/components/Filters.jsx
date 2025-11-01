import React from 'react';

const Filters = ({ filters, onFilterChange, onSearch, onSort }) => {
  const categories = ['All', 'Books', 'Electronics', 'Clothing', 'Sports', 'Furniture', 'Stationery', 'Accessories', 'Other'];
  const conditions = ['All', 'New', 'Like New', 'Good', 'Fair', 'Poor'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3">
          {/* Search */}
          <div className="col-md-4">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search items..."
              value={filters.search || ''}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="col-md-2">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={filters.category || 'all'}
              onChange={(e) => onFilterChange('category', e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase() === 'all' ? 'all' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div className="col-md-2">
            <label className="form-label">Condition</label>
            <select
              className="form-select"
              value={filters.condition || 'all'}
              onChange={(e) => onFilterChange('condition', e.target.value)}
            >
              <option value="all">All</option>
              {conditions.slice(1).map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="col-md-2">
            <label className="form-label">Min Price</label>
            <input
              type="number"
              className="form-control"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Max Price</label>
            <input
              type="number"
              className="form-control"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-md-4">
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={filters.sortBy || 'newest'}
              onChange={(e) => onSort(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-8 d-flex align-items-end">
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                onFilterChange('category', 'all');
                onFilterChange('condition', 'all');
                onFilterChange('minPrice', '');
                onFilterChange('maxPrice', '');
                onSearch('');
                onSort('newest');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
