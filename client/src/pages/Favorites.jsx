import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import itemsService from '../services/items';
import ItemCard from '../components/ItemCard';

const Favorites = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      // Get all items and filter by favorites
      // In a real app, you'd have a dedicated endpoint for user's favorites
      const response = await itemsService.list({ limit: 100 });
      setItems(response.items.filter(item => item.favorites?.length > 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (itemId) => {
    try {
      await itemsService.toggleFavorite(itemId);
      loadFavorites();
    } catch (err) {
      alert('Error updating favorite: ' + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <h3>Please login to view favorites</h3>
          <p>You need to be logged in to see your favorite items.</p>
        </div>
      </div>
    );
  }

  if (loading) {
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
      <h1 className="mb-4">My Favorites</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-5">
          <h3>No favorites yet</h3>
          <p>Items you favorite will appear here.</p>
        </div>
      ) : (
        <div className="row">
          {items.map(item => (
            <ItemCard
              key={item._id}
              item={item}
              onFavorite={handleFavorite}
              showFavorite={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
