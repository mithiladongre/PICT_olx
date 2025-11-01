import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import itemsService from '../services/items';

const ItemDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const data = await itemsService.getById(id);
      console.log('Item loaded:', data);
      console.log('Item images:', data.images);
      setItem(data);
      setIsFavorited(data.favorites?.includes(user?._id) || false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, user?._id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please login to add favorites');
      return;
    }
    try {
      await itemsService.toggleFavorite(id);
      setIsFavorited(!isFavorited);
    } catch (err) {
      alert('Error updating favorite: ' + err.message);
    }
  };

  const handleMarkSold = async () => {
    if (!window.confirm('Are you sure you want to mark this item as sold?')) return;
    try {
      await itemsService.markSold(id);
      loadItem();
    } catch (err) {
      alert('Error marking as sold: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemsService.remove(id);
      navigate('/my-listings');
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

  if (error || !item) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error || 'Item not found'}
        </div>
      </div>
    );
  }

  const isOwner = user?._id === item.seller?._id;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          {/* Image Gallery */}
          <div className="card mb-4">
            <div className="card-body p-0">
              <div className="position-relative">
                <img
                  src={item.images[currentImageIndex]}
                  className="img-fluid w-100"
                  alt={item.title}
                  style={{ height: '400px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                  onError={(e) => {
                    console.error('Main image failed to load:', item.images[currentImageIndex]);
                    e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                  }}
                  onLoad={() => console.log('Main image loaded successfully:', item.images[currentImageIndex])}
                />
                {item.isSold && (
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-danger fs-6">SOLD</span>
                  </div>
                )}
              </div>
              
              {item.images.length > 1 && (
                <div className="p-3">
                  <div className="row g-2">
                    {item.images.map((image, index) => (
                      <div key={index} className="col-2">
                        <img
                          src={image}
                          className={`img-fluid rounded cursor-pointer ${index === currentImageIndex ? 'border border-primary' : ''}`}
                          alt={`${item.title} ${index + 1}`}
                          style={{ height: '60px', objectFit: 'contain', cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div className="card">
            <div className="card-body">
              <h1 className="card-title">{item.title}</h1>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-primary mb-0">₹{item.price}</h2>
                <div>
                  <span className="badge bg-secondary me-2">{item.category}</span>
                  <span className="badge bg-info">{item.condition}</span>
                </div>
              </div>
              
              <p className="card-text">{item.description}</p>
              
              {item.tags && item.tags.length > 0 && (
                <div className="mb-3">
                  <strong>Tags: </strong>
                  {item.tags.map((tag, index) => (
                    <span key={index} className="badge bg-light text-dark me-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="row text-muted small">
                <div className="col-md-6">
                  <strong>Views:</strong> {item.views}
                </div>
                <div className="col-md-6">
                  <strong>Posted:</strong> {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          {/* Seller Info */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Seller Information</h5>
              <p className="mb-1"><strong>Name:</strong> {item.seller?.name}</p>
              <p className="mb-1"><strong>Year:</strong> {item.seller?.year}</p>
              <p className="mb-1"><strong>Branch:</strong> {item.seller?.branch}</p>
              <p className="mb-1"><strong>Phone:</strong> {item.seller?.phone}</p>
              <p className="mb-1"><strong>WhatsApp:</strong> {item.seller?.whatsapp}</p>
              {item.seller?.rating > 0 && (
                <p className="mb-0"><strong>Rating:</strong> ⭐ {item.seller?.rating}/5</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="card-body">
              {isOwner ? (
                <div>
                  <h5 className="card-title">Manage Item</h5>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => navigate(`/edit/${id}`)}
                    >
                      Edit Item
                    </button>
                    {!item.isSold && (
                      <button
                        className="btn btn-success"
                        onClick={handleMarkSold}
                      >
                        Mark as Sold
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={handleDelete}
                    >
                      Delete Item
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h5 className="card-title">Contact Seller</h5>
                  <div className="d-grid gap-2">
                    <a
                      href={`tel:${item.seller?.phone}`}
                      className="btn btn-primary"
                    >
                      📞 Call Seller
                    </a>
                    <a
                      href={`https://wa.me/91${item.seller?.whatsapp}`}
                      className="btn btn-success"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 WhatsApp
                    </a>
                    <button
                      className="btn btn-outline-danger"
                      onClick={handleFavorite}
                    >
                      {isFavorited ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
