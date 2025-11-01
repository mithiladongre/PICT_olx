// Centralized API client with JWT handling
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const getAuthToken = () => {
  try {
    return localStorage.getItem('token') || '';
  } catch (_) {
    return '';
  }
};

const buildHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = data?.message || (Array.isArray(data?.errors) ? data.errors[0]?.msg : 'Request failed');
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const api = {
  get: (path, params = {}) => {
    const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
    });
    return fetch(url.toString(), { method: 'GET', headers: buildHeaders() }).then(handleResponse);
  },
  post: (path, body = {}, { formData = false } = {}) => {
    const init = {
      method: 'POST',
      headers: buildHeaders(formData),
      body: formData ? body : JSON.stringify(body)
    };
    return fetch(`${API_BASE_URL}${path}`, init).then(handleResponse);
  },
  put: (path, body = {}, { formData = false } = {}) => {
    const init = {
      method: 'PUT',
      headers: buildHeaders(formData),
      body: formData ? body : JSON.stringify(body)
    };
    return fetch(`${API_BASE_URL}${path}`, init).then(handleResponse);
  },
  del: (path) => {
    return fetch(`${API_BASE_URL}${path}`, { method: 'DELETE', headers: buildHeaders() }).then(handleResponse);
  }
};

export default api;
