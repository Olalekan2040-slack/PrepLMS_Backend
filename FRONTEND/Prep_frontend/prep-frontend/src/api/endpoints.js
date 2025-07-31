import client from './client';

export const authAPI = {
  login: (data) => client.post('/token/', data),
  register: (data) => client.post('/users/register/', data),
  verifyOtp: (data) => client.post('/users/verify-otp/', data),
  refreshToken: (data) => client.post('/token/refresh/', data),
  changePassword: (data) => client.post('/users/change-password/', data),
  resetPassword: (data) => client.post('/users/reset-password/', data),
  passwordResetRequest: (data) => client.post('/users/reset-password-request/', data)
};

export const userAPI = {
  getProfile: () => client.get('/users/profile/'),
  updateProfile: (data) => client.patch('/users/profile/', data)
};

export const contentAPI = {
  getVideos: (params) => client.get('/content/videos/', { params }),
  getVideo: (id) => client.get(`/content/videos/${id}/`),
  addBookmark: (videoId) => client.post(`/content/videos/${videoId}/bookmark/`),
  removeBookmark: (videoId) => client.delete(`/content/videos/${videoId}/bookmark/`),
  getBookmarks: () => client.get('/content/bookmarks/'),
  recordProgress: (videoId, data) => client.post(`/content/videos/${videoId}/progress/`, data),
  getProgress: (videoId) => client.get(`/content/videos/${videoId}/progress/`)
};

export const subscriptionAPI = {
  getCurrentSubscription: () => client.get('/subscription/current/'),
  getPlans: () => client.get('/subscription/plans/'),
  initiatePayment: (planId) => client.post(`/subscription/initiate-payment/${planId}/`),
  verifyPayment: (reference) => client.post('/subscription/verify-payment/', { reference })
};
