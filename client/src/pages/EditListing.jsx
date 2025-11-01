import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import itemsService from '../services/items';
import ImageUploader from '../components/ImageUploader';

const EditListing = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Books',
    condition: 'New',
    tags: ''
  });
  const [images, setImages] = useState({ files: [], previews: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Books', 'Electronics', 'Clothing', 'Sports', 'Furniture', 'Stationery', 'Accessories', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

  const loadItem = useCallback(async () => {
    try {
      setLoading(true);
      const item = await itemsService.getById(id);
      
      // Check if user owns this item
      if (item.seller?._id !== user?._id) {
        navigate('/my-listings');
        return;
      }

      setFormData({
        title: item.title,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        condition: item.condition,
        tags: item.tags?.join(', ') || ''
      });
      setImages({ files: [], previews: Array.isArray(item.images) ? item.images : [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, user?._id, navigate]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImagesChange = ({ files, previews }) => {
    setImages({ files, previews });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Keep existing previews that are URLs and add new files
      const files = images.files;
      const existingImages = (images.previews || []).filter(p => typeof p === 'string' && p.startsWith('http'));
      const updatedFormData = {
        ...formData,
        existingImages: existingImages
      };

      await itemsService.update(id, updatedFormData, files);
      navigate('/my-listings');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title mb-4">Edit Listing</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength="100"
                    placeholder="Enter item title"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    maxLength="1000"
                    placeholder="Describe your item in detail"
                  />
                  <div className="form-text">{formData.description.length}/1000 characters</div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="price" className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="category" className="form-label">Category *</label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="condition" className="form-label">Condition *</label>
                    <select
                      className="form-select"
                      id="condition"
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      required
                    >
                      {conditions.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="tags" className="form-label">Tags (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>

                <ImageUploader
                  images={images}
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                />

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-md-2"
                    onClick={() => navigate('/my-listings')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Update Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditListing;
