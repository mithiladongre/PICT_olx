import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import itemsService from '../services/items';
import ItemCard from '../components/ItemCard';
import Filters from '../components/Filters';
import Pagination from '../components/Pagination';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    condition: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);

  const loadItems = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...filters
      };
      const response = await itemsService.list(params);
      setItems(response.items);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadItems(1);
  }, [filters, loadItems]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleSort = (value) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    loadItems(page);
  };

  const handleFavorite = async (itemId) => {
    if (!isAuthenticated) {
      alert('Please login to add favorites');
      return;
    }
    try {
      await itemsService.toggleFavorite(itemId);
      // Reload items to update favorite status
      loadItems(currentPage);
    } catch (err) {
      alert('Error updating favorite: ' + err.message);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Hero Section */}
      <div className="p-4 p-md-5 mb-4 text-white rounded bg-primary">
        <div className="col-md-8 px-0">
          <h1 className="display-6 fw-bold">PICT OLX becho Kharido</h1>
          <p className="lead my-3">Buy and sell within the PICT community. Find great deals on books, electronics, furniture, and more.</p>
          <p className="mb-0">
            <a href="#listings" className="btn btn-light btn-lg fw-semibold">Browse Listings</a>
            <a href="/create" className="btn btn-outline-light btn-lg fw-semibold ms-2">Sell an Item</a>
          </p>
        </div>
      </div>

      <div className="row" id="listings">
        <div className="col-12">
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onSort={handleSort}
          />

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-5">
              <h3>No items found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="row">
                {items.map(item => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onFavorite={handleFavorite}
                    showFavorite={isAuthenticated}
                  />
                ))}
              </div>

              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
