import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { authAPI, userAPI } from '../../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </div>
);

const LoginForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({});
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        name="email"
        type="email"
        required
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Password"
        name="password"
        type="password"
        required
        onChange={handleChange}
      />
      <Button
        fullWidth
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Login'}
      </Button>
    </Box>
  );
};

const RegisterForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({});
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        name="email"
        type="email"
        required
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="First Name"
        name="first_name"
        required
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Last Name"
        name="last_name"
        required
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Password"
        name="password"
        type="password"
        required
        onChange={handleChange}
      />
      <Button
        fullWidth
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Register'}
      </Button>
    </Box>
  );
};

const OtpForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({});
  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        name="email"
        type="email"
        required
        onChange={handleChange}
      />
      <TextField
        fullWidth
        margin="normal"
        label="OTP"
        name="otp"
        required
        onChange={handleChange}
      />
      <Button
        fullWidth
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
      </Button>
    </Box>
  );
};

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    if (location.search.includes('logout=1')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/auth', { replace: true });
    }
  }, [location, navigate]);

  const handleTab = (e, v) => {
    setTab(v);
    setMessage(null);
  };

  const handleLogin = (formData) => {
    setLoading(true);
    setMessage(null);

    authAPI.login(formData)
      .then(response => {
        const { access, refresh } = response.data;
        login({ access, refresh });
        return userAPI.getProfile();
      })
      .then(userProfile => {
        localStorage.setItem('user_profile', JSON.stringify(userProfile.data));
        // Redirect to the page they were trying to access, or home if none
        navigate(from, { replace: true });
      })
      .catch(error => {
        console.error('Login error:', error);
        setMessage({
          type: 'error',
          text: error.response?.data?.detail || 'Login failed. Please check your credentials.'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRegister = (formData) => {
    setLoading(true);
    setMessage(null);

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));

    authAPI.register(data)
      .then(() => {
        setMessage({
          type: 'success',
          text: 'Registration successful! Please verify your email with the OTP.'
        });
        setTab(2);
      })
      .catch(error => {
        setMessage({
          type: 'error',
          text: error.response?.data?.detail || 'Registration failed. Please try again.'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleVerifyOtp = (formData) => {
    setLoading(true);
    setMessage(null);

    authAPI.verifyOtp(formData)
      .then(() => {
        setMessage({
          type: 'success',
          text: 'Email verified successfully! Please login.'
        });
        setTab(0);
      })
      .catch(error => {
        setMessage({
          type: 'error',
          text: error.response?.data?.detail || 'OTP verification failed. Please try again.'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 2 
    }}>
      <Paper sx={{ width: '100%', maxWidth: 400 }}>
        <Tabs 
          value={tab} 
          onChange={handleTab} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Login" />
          <Tab label="Register" />
          <Tab label="Verify OTP" />
        </Tabs>

        {message && (
          <Box sx={{ p: 2 }}>
            <Alert severity={message.type}>{message.text}</Alert>
          </Box>
        )}

        <TabPanel value={tab} index={0}>
          <LoginForm onSubmit={handleLogin} loading={loading} />
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <RegisterForm onSubmit={handleRegister} loading={loading} />
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <OtpForm onSubmit={handleVerifyOtp} loading={loading} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Auth;