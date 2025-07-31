import api from './axios';
import { setupInterceptors } from './interceptors';

const API_BASE = 'http://localhost:8000/api';

// Create base axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Setup interceptors
setupInterceptors(api);

// Auth API
export const authAPI = {
  login: (data) => api.post('/token/', data),
  register: (data) => api.post('/users/register/', data),
  verifyOtp: (data) => api.post('/users/verify-otp/', data),
  refreshToken: (data) => api.post('/token/refresh/', data),
  changePassword: (data) => api.post('/users/change-password/', data),
  resetPassword: (data) => api.post('/users/reset-password/', data),
  passwordResetRequest: (data) => api.post('/users/reset-password-request/', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
};

// Content API
export const contentAPI = {
  getVideos: (params) => api.get('/content/videos/', { params }),
  getVideo: (id) => api.get(`/content/videos/${id}/`),
  addBookmark: (videoId) => api.post(`/content/videos/${videoId}/bookmark/`),
  removeBookmark: (videoId) => api.delete(`/content/videos/${videoId}/bookmark/`),
  getBookmarks: () => api.get('/content/bookmarks/'),
  recordProgress: (videoId, data) => api.post(`/content/videos/${videoId}/progress/`, data),
  getProgress: (videoId) => api.get(`/content/videos/${videoId}/progress/`),
};

// Subscription API
export const subscriptionAPI = {
  getCurrentSubscription: () => api.get('/subscription/current/'),
  getPlans: () => api.get('/subscription/plans/'),
  initiatePayment: (planId) => api.post(`/subscription/initiate-payment/${planId}/`),
  verifyPayment: (reference) => api.post('/subscription/verify-payment/', { reference }),
};

export default api;
