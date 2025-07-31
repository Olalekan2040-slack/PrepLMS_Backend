import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';
const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Add request interceptor
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (data) => client.post('/token/', data),
  register: (data) => client.post('/users/register/', data),
  verifyOtp: (data) => client.post('/users/verify-otp/', data),
  refreshToken: (data) => client.post('/token/refresh/', data),
  changePassword: (data) => client.post('/users/change-password/', data),
  resetPassword: (data) => client.post('/users/reset-password/', data),
  passwordResetRequest: (data) => client.post('/users/reset-password-request/', data)
};

// User API endpoints
export const userAPI = {
  getProfile: () => client.get('/users/profile/'),
  updateProfile: (data) => client.patch('/users/profile/', data)
};

// Content API endpoints
export const contentAPI = {
  getVideos: (params) => client.get('/content/videos/', { params }),
  getVideo: (id) => client.get(`/content/videos/${id}/`),
  addBookmark: (videoId) => client.post(`/content/videos/${videoId}/bookmark/`),
  removeBookmark: (videoId) => client.delete(`/content/videos/${videoId}/bookmark/`),
  getBookmarks: () => client.get('/content/bookmarks/'),
  recordProgress: (videoId, data) => client.post(`/content/videos/${videoId}/progress/`, data),
  getProgress: (videoId) => client.get(`/content/videos/${videoId}/progress/`)
};

// Subscription API endpoints
export const subscriptionAPI = {
  getCurrentSubscription: () => client.get('/subscription/current/'),
  getPlans: () => client.get('/subscription/plans/'),
  initiatePayment: (planId) => client.post(`/subscription/initiate-payment/${planId}/`),
  verifyPayment: (reference) => client.post('/subscription/verify-payment/', { reference })
};

// Admin API endpoints
export const adminAPI = {
  getAnalytics: () => client.get('/admin/analytics/'),
  getUsers: () => client.get('/admin/users/'),
  getVideos: () => client.get('/admin/videos/'),
  updateVideo: (id, data) => client.patch(`/admin/videos/${id}/`, data),
  deleteVideo: (id) => client.delete(`/admin/videos/${id}/`),
  createVideo: (data) => client.post('/admin/videos/', data)
};

// Progress API endpoints
export const progressAPI = {
  getUserProgress: () => client.get('/content/user-progress/'),
  getVideoProgress: (videoId) => client.get(`/content/videos/${videoId}/progress/`),
  updateProgress: (videoId, data) => client.post(`/content/videos/${videoId}/progress/`, data),
  getAllProgress: () => client.get('/content/all-progress/')
};

// Export the axios instance as default
export default axiosInstance;


