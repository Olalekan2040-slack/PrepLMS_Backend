import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { userAPI } from '../../api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const token = localStorage.getItem('access_token');
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data);
      setForm(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to load profile' });
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchProfile();
  }, [token, fetchProfile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) formData.append(k, v);
      });
      await userAPI.updateProfile(formData, token);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEdit(false);
      fetchProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Update failed' });
    }
    setLoading(false);
  };

  if (!token) return <Alert severity="info">Please login to view your profile.</Alert>;
  if (loading && !profile) return <Box textAlign="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card className="dashboard-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={avatarPreview || profile?.avatar}
                  sx={{ width: 120, height: 120, mx: 'auto' }}
                />
                {edit && (
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    <input type="file" hidden onChange={handleAvatar} accept="image/*" />
                    <PhotoCameraIcon sx={{ color: 'white' }} />
                  </IconButton>
                )}
              </Box>
              <Typography variant="h6" gutterBottom>
                {profile?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
              </Typography>
              {!edit && (
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={() => setEdit(true)}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card className="dashboard-card">
            <CardContent>
              {message && (
                <Alert severity={message.type} sx={{ mb: 2 }}>
                  {message.text}
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Profile Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      name="phone_number"
                      value={edit ? form.phone_number || '' : profile?.phone_number || ''}
                      onChange={handleChange}
                      fullWidth
                      disabled={!edit}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      value={profile?.email || ''}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Contact Details"
                      name="contact_details"
                      value={edit ? form.contact_details || '' : profile?.contact_details || ''}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                      disabled={!edit}
                    />
                  </Grid>
                  {edit && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setEdit(false);
                            setForm(profile);
                            setAvatarPreview(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
