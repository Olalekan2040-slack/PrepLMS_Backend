import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { register, login, verifyOtp, passwordResetRequest, passwordResetConfirm } from '../../api';
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
      await register(formData);
      setMessage({ type: 'success', text: 'Registration successful! Please verify OTP.' });
      setTab(1);
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Registration failed.' });
    }
    setLoading(false);
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await login(form);
      localStorage.setItem('access_token', response.data.token);
      
      // Check if user is admin
      // try {
      //   await adminAPI.getAdminRoles();
      //   navigate('/admin');
      //   return;
      // } catch (adminErr) {
      //   // Not an admin, continue with normal user flow
      // }
      
      // Regular user flow
      navigate('/tutor/dashboard');
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Login failed.' });
    } finally {
      setLoading(false);
    }
  };

  // OTP
  const handleOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await verifyOtp(form);
      setMessage({ type: 'success', text: 'OTP verified! You can now login.' });
      setTab(1);
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'OTP verification failed.' });
    }
    setLoading(false);
  };

  // Password Reset Request
  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await passwordResetRequest(form);
      setMessage({ type: 'success', text: 'OTP sent for password reset.' });
      setTab(4);
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Request failed.' });
    }
    setLoading(false);
  };

  // Password Reset Confirm
  const handleResetConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await passwordResetConfirm(form);
      setMessage({ type: 'success', text: 'Password reset successful! You can now login.' });
      setTab(1);
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Reset failed.' });
    }
    setLoading(false);
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
        <form onSubmit={handleOtp}>
          <TextField label="Email or Phone" name="email_or_phone" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="OTP" name="otp" fullWidth margin="normal" onChange={handleChange} required />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
          </Button>
        </form>
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <form onSubmit={handleResetRequest}>
          <TextField label="Email or Phone" name="email_or_phone" fullWidth margin="normal" onChange={handleChange} required />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Send OTP'}
          </Button>
        </form>
      </TabPanel>
      <TabPanel value={tab} index={4}>
        <form onSubmit={handleResetConfirm}>
          <TextField label="Email or Phone" name="email_or_phone" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="OTP" name="otp" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="New Password" name="new_password" type="password" fullWidth margin="normal" onChange={handleChange} required />
          <TextField label="Confirm Password" name="confirm_password" type="password" fullWidth margin="normal" onChange={handleChange} required />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </form>
      </TabPanel>
    </Paper>
  );
}
