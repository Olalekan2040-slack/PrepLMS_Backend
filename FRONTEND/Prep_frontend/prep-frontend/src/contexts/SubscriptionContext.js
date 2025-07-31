import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscriptionAPI } from '../api';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  const { isAuthenticated } = useAuth();

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await subscriptionAPI.getCurrentSubscription();
      setSubscription(response.data);
      setError(null);
    } catch (err) {
      // Only set error if it's not an authentication error (those are handled by auth context)
      if (err.response?.status !== 401) {
        setError('Failed to fetch subscription status');
      }
      setSubscription(null);
    } finally {
      setLoading(false);    }
  }, [isAuthenticated]);
  useEffect(() => {
    // Only fetch subscription if user is authenticated and there's a token
    const token = localStorage.getItem('access_token');
    if (isAuthenticated && token) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchSubscription]); // Re-fetch when auth state changes or fetchSubscription changes

  const value = {
    subscription,
    loading,
    error,
    refreshSubscription: fetchSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;
