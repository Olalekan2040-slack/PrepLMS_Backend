import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Container, Typography } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Tutor from './pages/Tutor';
import TutorLanding from './pages/TutorLanding';
import CourseDetail from './pages/CourseDetail';
import Practice from './pages/Practice';
import Rewards from './pages/Rewards';
import Account from './pages/Account';
import Donate from './pages/Donate';
import Contact from './pages/Contact';
import Auth from './components/Auth/Auth';
import Admin from './pages/Admin';
import ProtectedRoute from './components/Auth/ProtectedRoute';

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}>
          <Navbar />
          <Box sx={{ flex: 1, py: { xs: 2, md: 4 } }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/tutor" element={<TutorLanding />} />
              <Route path="/tutor/dashboard" element={
                <ProtectedRoute>
                  <Tutor />
                </ProtectedRoute>
              } />
              <Route path="/tutor/course/:courseId" element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } />
              <Route path="/practice" element={<Practice />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/account/*" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />
              <Route path="/donate" element={<Donate />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>
          <Container maxWidth="md" sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Prep Platform &copy; {new Date().getFullYear()}
            </Typography>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
