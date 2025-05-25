import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

// Base configuration for axios with interceptors
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token and error handling to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      localStorage.removeItem('access_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Authentication endpoints
export const register = (data) =>
  api.post('/users/register/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const verifyOtp = (data) =>
  api.post('/users/verify-otp/', data);

export const login = (data) =>
  api.post('/users/login/', data);

export const passwordResetRequest = (data) =>
  api.post('/users/password-reset/request/', data);

export const passwordResetConfirm = (data) =>
  api.post('/users/password-reset/confirm/', data);

// User profile and dashboard endpoints
export const getUserProfile = () => api.get('/users/profile/');
export const updateProfile = (data) => 
  api.patch('/users/profile/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getDashboardStats = () => api.get('/rewards/dashboard/');
export const getActiveVideos = () => api.get('/content/videos/history/current/');
export const getWatchHistory = () => api.get('/user/history/');
export const getUserBookmarkedVideos = () => api.get('/content/videos/bookmarks/');

// Progress tracking
export const getProgressDashboard = () => api.get('/content/progress/dashboard/');
export const getRecentActivity = () => api.get('/content/progress/recent-activity/');
export const getSubjectProgress = (subjectId) => 
  api.get(`/content/progress/subject/${subjectId}/`);

// Video Management
export const getVideos = () => api.get('/content/videos/');
export const getVideosByCourse = (courseId) => api.get(`/content/videos/course/${courseId}/`);
export const bookmarkVideo = (videoId) => api.post(`/content/videos/${videoId}/bookmark/`);
export const removeBookmark = (videoId) => api.delete(`/content/videos/${videoId}/bookmark/`);
export const getVideoProgress = (videoId) => api.get(`/content/progress/video/${videoId}/`);
export const trackProgress = (data) => api.post('/progress/track/', data);



  
// Analytics endpoints
export const getPerformanceAnalytics = () => api.get('/content/analytics/performance/');
export const getTimeSpentAnalytics = () => api.get('/content/analytics/time-spent/');
export const getLearningRecommendations = () => api.get('/content/analytics/recommendations/');
export const getSubjectStrengths = () => api.get('/content/analytics/subject-strengths/');

// Admin endpoints with separate instance
const adminApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token and error handling to admin requests
adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      localStorage.removeItem('access_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Admin Users
  getAdminRoles: () => adminApi.get('/users/admins/roles/'),
  getCurrentAdmin: () => adminApi.get('/users/admins/me/'),
  getAdmins: () => adminApi.get('/users/admins/'),
  createContentAdmin: (data) => adminApi.post('/users/admins/create-content-admin/', data),
  updateAdminStatus: (id, data) => adminApi.patch(`/users/admins/${id}/status/`, data),

  // User Management
  getUsers: (params) => adminApi.get('/users/admins/users/', { params }),
  getUserDetails: (id) => adminApi.get(`/users/admins/users/${id}/`),
  updateUser: (id, data) => adminApi.patch(`/users/admins/users/${id}/`, data),
  deleteUser: (id) => adminApi.delete(`/users/admins/users/${id}/`),
  searchUsers: (query) => adminApi.get('/users/admins/users/search/', { params: { q: query } }),

  // Content Management
  getCourses: () => adminApi.get('/content/admin/courses/'),
  createCourse: (data) => adminApi.post('/content/admin/courses/', data),
  updateCourse: (id, data) => adminApi.patch(`/content/admin/courses/${id}/`, data),
  deleteCourse: (id) => adminApi.delete(`/content/admin/courses/${id}/`),
  

  // Dashboard Stats
  getDashboardStats: () => adminApi.get('/admin/dashboard/stats/'),
  getRecentActivity: () => adminApi.get('/admin/dashboard/recent-activity/')
};

export const getCourses = () => api.get('/content/courses/');
export const getCoursesByClass = (classLevel) => api.get(`/content/courses/class/${classLevel}/`);
export const getFeaturedCourses = () => api.get('/content/courses/featured/');
export const getCourseById = (id) => api.get(`/content/courses/${id}/`);


