import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { authAPI, userAPI, adminAPI } from '../../api';
import { useNavigate, useLocation } from 'react-router-dom';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  React.useEffect(() => {
    if (location.search.includes('logout=1')) {
      localStorage.removeItem('access_token');
      navigate('/auth', { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTab = (e, v) => {
    setTab(v);
    setMessage(null);
    setForm({});
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      await authAPI.register(formData);
      setMessage({ type: 'success', text: 'Registration successful! Please verify OTP.' });
      setTab(1);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await authAPI.login(form);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      const userProfile = await userAPI.getProfile();
      localStorage.setItem('user_profile', JSON.stringify(userProfile.data));
      
      const redirect = new URLSearchParams(location.search).get('redirect') || '/';
      navigate(redirect, { replace: true });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  // OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await authAPI.verifyOtp(form);
      setMessage({ type: 'success', text: 'OTP verified! Please login.' });
      setTab(0);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'OTP verification failed' });
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Request
  const handlePasswordResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await authAPI.passwordResetRequest(form);
      setMessage({ type: 'success', text: 'Password reset link sent to your email!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Password reset request failed' });
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Confirm
  const handlePasswordResetConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await authAPI.passwordResetConfirm(form);
      setMessage({ type: 'success', text: 'Password reset successful! Please login.' });
      setTab(0);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Password reset failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Tabs value={tab} onChange={handleTab} variant="scrollable" scrollButtons="auto">
        <Tab label="Register" />
        <Tab label="Login" />
        <Tab label="Verify OTP" />
        <Tab label="Reset Password" />
        <Tab label="Confirm Reset" />
      </Tabs>
      {message && <Alert severity={message.type} sx={{ mt: 2 }}>{message.text}</Alert>}
      <TabPanel value={tab} index={0}>
        <form onSubmit={handleRegister}>
          <TextField label="Email" name="email" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="Phone Number" name="phone_number" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="Password" name="password" type="password" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="Confirm Password" name="confirm_password" type="password" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="Contact Details" name="contact_details" fullWidth margin="normal" onChange={handleChange} />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </form>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <form onSubmit={handleLogin}>
          <TextField label="Email or Phone" name="email_or_phone" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="Password" name="password" type="password" fullWidth margin="normal" onChange={handleChange} required />          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <form onSubmit={handleVerifyOtp}>
          <TextField label="Email or Phone" name="email_or_phone" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="OTP" name="otp" fullWidth margin="normal" onChange={handleChange} required />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
          </Button>
        </form>
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <form onSubmit={handlePasswordResetRequest}>
          <TextField label="Email or Phone" name="email_or_phone" fullWidth margin="normal" onChange={handleChange} required />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Send OTP'}
          </Button>
        </form>
      </TabPanel>
      <TabPanel value={tab} index={4}>
        <form onSubmit={handlePasswordResetConfirm}>
          <TextField label="Email or Phone" name="email_or_phone" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="OTP" name="otp" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="New Password" name="new_password" type="password" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="Confirm Password" name="confirm_password" type="password" fullWidth margin="normal" onChange={handleChange} required />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </form>
      </TabPanel>    </Paper>
  );
}