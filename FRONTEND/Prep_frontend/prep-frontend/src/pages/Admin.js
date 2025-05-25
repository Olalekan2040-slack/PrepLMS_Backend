import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { adminAPI } from '../api';
import AdminLayout from '../components/Admin/AdminLayout';
import AdminDashboard from '../components/Admin/Dashboard/AdminDashboard';
import ContentManagement from '../components/Admin/Content/ContentManagement';
import AdminAnalytics from '../components/Admin/Analytics/AdminAnalytics';
import UserManagement from '../components/Admin/Users/UserManagement';
import SubscriptionManagement from '../components/Admin/Subscriptions/SubscriptionManagement';
import RewardsManagement from '../components/Admin/Rewards/RewardsManagement';

export default function AdminRoutes() {
  const [loading, setLoading] = useState(true);
  const [adminRole, setAdminRole] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('access_token');
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        // Use the adminAPI from our api.js file
        const { data } = await adminAPI.getAdminRoles();
        setAdminRole(data.role);
        setError(null);
      } catch (err) {
        console.error('Admin verification failed:', err);
        setError(err?.response?.data?.message || 'Not authorized');
        localStorage.removeItem('access_token'); // Clear invalid token
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyAdmin();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !adminRole) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="content" element={<ContentManagement />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="subscriptions" element={<SubscriptionManagement />} />
        <Route path="rewards" element={<RewardsManagement />} />
      </Routes>
    </AdminLayout>
  );
}
