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
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Response interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
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
        const currentPath = window.location.pathname;
        window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}`;
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      const currentPath = window.location.pathname;
      window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}`;
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (data) =>
    api.post('/users/register/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  verifyOtp: (data) =>
    api.post('/users/verify-otp/', data),
  login: (data) =>
    api.post('/users/login/', data),
  passwordResetRequest: (data) =>
    api.post('/users/password-reset/request/', data),
  passwordResetConfirm: (data) =>
    api.post('/users/password-reset/confirm/', data)
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => 
    api.patch('/users/profile/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getDashboardStats: () => api.get('/rewards/dashboard/'),
  getActiveVideos: () => api.get('/content/videos/history/current/'),
  getWatchHistory: () => api.get('/user/history/'),
  getBookmarkedVideos: () => api.get('/content/videos/bookmarks/')
};

// Progress API
export const progressAPI = {
  getDashboard: () => api.get('/content/progress/dashboard/'),
  getRecentActivity: () => api.get('/content/progress/recent-activity/'),
  getSubjectProgress: (subjectId) => 
    api.get(`/content/progress/subject/${subjectId}/`),
  trackProgress: (data) => api.post('/progress/track/', data),
  getVideoProgress: (videoId) => api.get(`/content/progress/video/${videoId}/`)
};

// Content API
export const contentAPI = {
  getVideos: () => api.get('/content/videos/'),
  getVideosByCourse: (courseId) => api.get(`/content/videos/course/${courseId}/`),
  bookmarkVideo: (videoId) => api.post(`/content/videos/${videoId}/bookmark/`),
  removeBookmark: (videoId) => api.delete(`/content/videos/${videoId}/bookmark/`),
  getCourses: () => api.get('/content/courses/'),
  getCoursesByClass: (classLevel) => api.get(`/content/courses/class/${classLevel}/`),
  getFeaturedCourses: () => api.get('/content/courses/featured/'),
  getCourseById: (id) => api.get(`/content/courses/${id}/`)
};

// Analytics API
export const analyticsAPI = {
  getPerformance: () => api.get('/content/analytics/performance/'),
  getTimeSpent: () => api.get('/content/analytics/time-spent/'),
  getLearningRecommendations: () => api.get('/content/analytics/recommendations/'),
  getSubjectStrengths: () => api.get('/content/analytics/subject-strengths/')
};

// Admin API
const adminApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to admin requests
adminApi.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminAPI = {
  // Content Management
  getVideos: () => adminApi.get('/content/lessons/'),
  getSubjects: () => adminApi.get('/content/subjects/'),
  getClassLevels: () => adminApi.get('/content/class-levels/'),

  // Video Management
  createVideo: (data) => {
    const formData = data instanceof FormData ? data : new FormData();
    if (!(data instanceof FormData)) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value, value.name);
          } else {
            formData.append(key, JSON.stringify(value));
          }
        }
      });
    }
    return adminApi.post('/content/lessons/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateVideo: (id, data) => {
    const formData = data instanceof FormData ? data : new FormData();
    if (!(data instanceof FormData)) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value, value.name);
          } else {
            formData.append(key, JSON.stringify(value));
          }
        }
      });
    }
    return adminApi.put(`/content/lessons/${id}/update/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteVideo: (id) => adminApi.delete(`/content/lessons/${id}/delete/`),

  // Upload with progress
  uploadVideo: (formData, onUploadProgress) => {
    return adminApi.post('/content/lessons/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          onUploadProgress(progressEvent);
        }
      }
    });
  },

  // User Management
  users: {
    list: (params) => adminApi.get('/users/admins/users/', { params }),
    getDetails: (id) => adminApi.get(`/users/admins/users/${id}/`),
    update: (id, data) => adminApi.patch(`/users/admins/users/${id}/`, data),
    delete: (id) => adminApi.delete(`/users/admins/users/${id}/`),
    search: (query) => adminApi.get('/users/admins/users/search/', { params: { q: query } })
  },

  // Admin Users
  getAdminRoles: () => adminApi.get('/users/admins/roles/'),
  getCurrentAdmin: () => adminApi.get('/users/admins/me/'),
  getAdminProfile: () => adminApi.get('/users/admins/me/'),
  getAdmins: () => adminApi.get('/users/admins/'),
  createContentAdmin: (data) => adminApi.post('/users/admins/create-content-admin/', data),
  updateAdminStatus: (id, data) => adminApi.patch(`/users/admins/${id}/status/`, data),

  // Course Management
  courses: {
    list: () => adminApi.get('/content/admin/courses/'),
    create: (data) => adminApi.post('/content/admin/courses/', data),
    update: (id, data) => adminApi.patch(`/content/admin/courses/${id}/`, data),
    delete: (id) => adminApi.delete(`/content/admin/courses/${id}/`)
  },

  // Dashboard
  getDashboardStats: () => adminApi.get('/admin/dashboard/stats/'),
  getRecentActivity: () => adminApi.get('/admin/dashboard/recent-activity/')
};


