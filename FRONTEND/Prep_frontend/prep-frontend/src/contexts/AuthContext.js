import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    setUser(null);
    // Use replace to prevent going back to protected routes
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleLogin = useCallback((tokens) => {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    const decoded = jwtDecode(tokens.access);
    setUser({
      id: decoded.user_id,
      email: decoded.email,
      firstName: decoded.first_name,
      lastName: decoded.last_name,
      isStaff: decoded.is_staff,
      isAdmin: decoded.is_superuser
    });
  }, []);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          handleLogout();
        } else {
          setUser({
            id: decoded.user_id,
            email: decoded.email,
            firstName: decoded.first_name,
            lastName: decoded.last_name,
            isStaff: decoded.is_staff,
            isAdmin: decoded.is_superuser
          });
        }
      } catch (error) {
        handleLogout();
      }
    }
    setLoading(false);
  }, [handleLogout]);

  const value = {
    user,
    loading,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
