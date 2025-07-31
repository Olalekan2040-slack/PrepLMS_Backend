import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

// Create base instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Simple request interceptor for auth
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Simple response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    if (response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export our configured instance
export default api;
