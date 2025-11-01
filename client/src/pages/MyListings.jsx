import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import itemsService from '../services/items';
import ItemCard from '../components/ItemCard';

const MyListings = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyItems();
  }, []);

  const loadMyItems = async () => {
    try {
      setLoading(true);
      // For now, we'll get all items and filter by seller
      // In a real app, you'd have a dedicated endpoint for user's items
      const response = await itemsService.list({ limit: 100 });
      const myItems = response.items.filter(item => item.seller?._id === user?._id);
      setItems(myItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async (itemId) => {
    if (!window.confirm('Are you sure you want to mark this item as sold?')) return;
    try {
      await itemsService.markSold(itemId);
      loadMyItems();
    } catch (err) {
      alert('Error marking as sold: ' + err.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemsService.remove(itemId);
      loadMyItems();
    } catch (err) {
      alert('Error deleting item: ' + err.message);
    }
  };

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Listings</h1>
        <Link to="/create" className="btn btn-primary">
          + Add New Item
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-5">
          <h3>No items found</h3>
          <p>You haven't listed any items yet.</p>
          <Link to="/create" className="btn btn-primary">
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="row">
          {items.map(item => (
            <div key={item._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="position-relative">
                  <img 
                    src={item.images[0]} 
                    className="card-img-top" 
                    alt={item.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  {item.isSold && (
                    <div className="position-absolute top-0 start-0 m-2">
                      <span className="badge bg-danger">SOLD</span>
                    </div>
                  )}
                </div>
                
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-truncate">{item.title}</h5>
                  <p className="card-text text-muted small flex-grow-1">
                    {item.description.length > 100 
                      ? `${item.description.substring(0, 100)}...` 
                      : item.description
                    }
                  </p>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="h5 text-primary mb-0">₹{item.price}</span>
                      <span className="badge bg-secondary">{item.category}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center text-muted small">
                      <span>{item.condition}</span>
                      <span>{item.views} views</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer bg-transparent">
                  <div className="d-grid gap-2">
                    <Link to={`/item/${item._id}`} className="btn btn-outline-primary">
                      View Details
                    </Link>
                    <div className="btn-group" role="group">
                      <Link to={`/edit/${item._id}`} className="btn btn-outline-secondary btn-sm">
                        Edit
                      </Link>
                      {!item.isSold && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleMarkSold(item._id)}
                        >
                          Mark Sold
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
