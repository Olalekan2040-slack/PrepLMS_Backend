import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  const location = useLocation();

  if (!token) {
    // Redirect to the auth page, but save the attempted URL
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
