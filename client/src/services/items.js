import { api } from './api';

export const itemsService = {
  // Public
  list: (params) => api.get('/items', params),
  getById: (id) => api.get(`/items/${id}`),

  // Private
  create: (formValues, files) => {
    console.log('Creating item with formValues:', formValues);
    console.log('Creating item with files:', files);
    
    const formData = new FormData();
    Object.entries(formValues).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v);
    });
    (files || []).forEach((file, index) => {
      console.log(`Adding file ${index}:`, file.name, file.type, file.size);
      formData.append('images', file);
    });
    
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    return api.post('/items', formData, { formData: true });
  },
  update: (id, formValues, files) => {
    const formData = new FormData();
    Object.entries(formValues).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v);
    });
    (files || []).forEach((file) => formData.append('images', file));
    return api.put(`/items/${id}`, formData, { formData: true });
  },
  remove: (id) => api.del(`/items/${id}`),
  toggleFavorite: (id) => api.post(`/items/${id}/favorite`),
  markSold: (id, buyerId) => api.post(`/items/${id}/sold`, buyerId ? { buyerId } : {})
};

export default itemsService;
