import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Container } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Tutor from './pages/Tutor';
import CourseDetail from './pages/CourseDetail';
import Rewards from './pages/Rewards';
import Account from './pages/Account';
import Contact from './pages/Contact';
import Auth from './components/Auth/Auth';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SubscriptionPlans from './pages/Subscription/SubscriptionPlans';
import VerifySubscription from './pages/Subscription/VerifySubscription';
import SubscriptionStatus from './pages/Subscription/SubscriptionStatus';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import AuthProvider from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#714B67',
      light: '#9B6B8D',
      dark: '#4A3144',
    },
    secondary: {
      main: '#017E84',
      light: '#35A8AE',
      dark: '#015558',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      '@media (min-width:600px)': {
        fontSize: '3.5rem',
      },
    },
    h2: {
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#2d2d2d',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
  },
});

export default function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SubscriptionProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Protected Routes */}
                  <Route path="/tutor" element={
                    <ProtectedRoute>
                      <Tutor />
                    </ProtectedRoute>
                  } />
                  <Route path="/tutor/course/:id" element={
                    <ProtectedRoute>
                      <CourseDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/rewards" element={
                    <ProtectedRoute>
                      <Rewards />
                    </ProtectedRoute>
                  } />
                  <Route path="/account/*" element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription/plans" element={
                    <ProtectedRoute>
                      <SubscriptionPlans />
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription/verify" element={
                    <ProtectedRoute>
                      <VerifySubscription />
                    </ProtectedRoute>
                  } />
                  <Route path="/subscription/status" element={
                    <ProtectedRoute>
                      <SubscriptionStatus />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Container>
            </Box>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
