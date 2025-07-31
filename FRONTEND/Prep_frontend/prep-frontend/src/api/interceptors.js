import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export const setupInterceptors = (api) => {
  // Request interceptor
  api.interceptors.request.use(
    config => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Don't retry the refresh token request itself
        if (!originalRequest.url.includes('token/refresh')) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              // Clear auth and redirect to login
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
              return Promise.reject(error);
            }

            // Try to get new access token
            const { data } = await axios.post(`${API_BASE}/token/refresh/`, {
              refresh: refreshToken
            });

            const { access } = data;
            localStorage.setItem('access_token', access);
            originalRequest.headers.Authorization = `Bearer ${access}`;

            return api(originalRequest);
          } catch (refreshError) {
            // If refresh fails, clear auth and redirect
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
};
