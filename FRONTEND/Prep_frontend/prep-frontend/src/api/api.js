import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

// Create API instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!originalRequest.url.includes('token/refresh')) {
        originalRequest._retry = true;
        
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        try {
          const response = await axios.post(`${API_BASE}/token/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Define API endpoints
const authAPI = {
  login: (data) => api.post('/token/', data),
  register: (data) => api.post('/users/register/', data),
  verifyOtp: (data) => api.post('/users/verify-otp/', data),
  refreshToken: (data) => api.post('/token/refresh/', data),
  changePassword: (data) => api.post('/users/change-password/', data),
  resetPassword: (data) => api.post('/users/reset-password/', data),
  passwordResetRequest: (data) => api.post('/users/reset-password-request/', data),
};

const userAPI = {
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
};

const contentAPI = {
  getVideos: (params) => api.get('/content/videos/', { params }),
  getVideo: (id) => api.get(`/content/videos/${id}/`),
  addBookmark: (videoId) => api.post(`/content/videos/${videoId}/bookmark/`),
  removeBookmark: (videoId) => api.delete(`/content/videos/${videoId}/bookmark/`),
  getBookmarks: () => api.get('/content/bookmarks/'),
  recordProgress: (videoId, data) => api.post(`/content/videos/${videoId}/progress/`, data),
  getProgress: (videoId) => api.get(`/content/videos/${videoId}/progress/`),
};

const subscriptionAPI = {
  getCurrentSubscription: () => api.get('/subscription/current/'),
  getPlans: () => api.get('/subscription/plans/'),
  initiatePayment: (planId) => api.post(`/subscription/initiate-payment/${planId}/`),
  verifyPayment: (reference) => api.post('/subscription/verify-payment/', { reference }),
};

export { api as default, authAPI, userAPI, contentAPI, subscriptionAPI };
