import React from 'react';
import { Link } from 'react-router-dom';

const ItemCard = ({ item, onFavorite, showFavorite = true }) => {
  console.log('ItemCard rendering item:', item);
  console.log('ItemCard images:', item.images);
  
  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorite) onFavorite(item._id);
  };

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm">
        <div className="position-relative">
          <img 
            src={item.images[0]} 
            className="card-img-top" 
            alt={item.title}
            style={{ height: '200px', objectFit: 'cover' }}
            onError={(e) => {
              console.error('Image failed to load:', item.images[0]);
              console.error('Item data:', item);
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            }}
            onLoad={() => console.log('Image loaded successfully:', item.images[0])}
          />
          {showFavorite && (
            <button 
              className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2"
              onClick={handleFavorite}
              title="Add to favorites"
            >
              <i className="bi bi-heart"></i>
            </button>
          )}
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
            
            <div className="mt-2">
              <small className="text-muted">
                By {item.seller?.name} ({item.seller?.year} {item.seller?.branch})
              </small>
            </div>
          </div>
        </div>
        
        <div className="card-footer bg-transparent">
          <Link to={`/item/${item._id}`} className="btn btn-primary w-100">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
