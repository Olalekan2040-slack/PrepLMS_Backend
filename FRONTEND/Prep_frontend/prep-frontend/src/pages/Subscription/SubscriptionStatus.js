import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAuth } from '../../contexts/AuthContext';

const SubscriptionStatus = () => {
  const { subscription, loading, error } = useSubscription();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/subscription/status' } });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader 
          title="Subscription Status" 
          sx={{ bgcolor: 'primary.main', color: 'white' }}
        />
        <CardContent>
          {subscription ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  {subscription.plan.name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Chip
                  label={subscription.is_active ? 'Active' : 'Expired'}
                  color={subscription.is_active ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Started:
                </Typography>
                <Typography variant="body1">
                  {new Date(subscription.start_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Expires:
                </Typography>
                <Typography variant="body1">
                  {new Date(subscription.end_date).toLocaleDateString()}
                </Typography>
              </Grid>
              {!subscription.is_active && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/subscription/plans')}
                    fullWidth
                  >
                    Renew Subscription
                  </Button>
                </Grid>
              )}
            </Grid>
          ) : (
            <Box textAlign="center" py={3}>
              <Typography variant="h6" gutterBottom>
                No Active Subscription
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Subscribe to access premium content and features.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/subscription/plans')}
                size="large"
              >
                View Plans
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default SubscriptionStatus;
