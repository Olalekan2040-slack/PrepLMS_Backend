import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { userAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [verifying, setVerifying] = React.useState(true);
  const [verified, setVerified] = React.useState(false);

  React.useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            await userAPI.getProfile();
            setVerified(true);
          } catch (error) {
            console.error('Auth verification failed:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        }
      } else {
        setVerified(true);
      }
      setVerifying(false);
    };

    verifyAuth();
  }, [isAuthenticated]);

  // Show loading spinner while checking authentication
  if (loading || verifying) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Handle subscription routes
  const isSubscriptionRoute = location.pathname.startsWith('/subscription');
  
  // Allow access to subscription routes and authenticated users
  if (isSubscriptionRoute || isAuthenticated || verified) {
    return children;
  }

  // Redirect to login for unauthenticated users
  return <Navigate to="/auth" state={{ from: location }} replace />;
}
