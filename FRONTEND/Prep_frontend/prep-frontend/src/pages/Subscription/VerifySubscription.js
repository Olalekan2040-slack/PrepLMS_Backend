import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  Button,
  Stack,
  Typography
} from '@mui/material';
import { subscriptionAPI } from '../../api';

const VerifySubscription = () => {
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const tx_ref = localStorage.getItem('pendingSubscriptionRef');
      if (!tx_ref) {
        setStatus('failed');
        setError('No pending subscription found');
        return;
      }

      try {
        const response = await subscriptionAPI.verifySubscription({ tx_ref });
        
        if (response.data.status === 'success') {
          setStatus('success');
          localStorage.removeItem('pendingSubscriptionRef');
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('failed');
          setError('Payment verification failed. Please contact support.');
        }
      } catch (err) {
        setStatus('failed');
        setError(err.response?.data?.error || 'Failed to verify payment');
      }
    };

    verifyPayment();
  }, [navigate]);

  return (
    <Container maxWidth="md">
      <Box 
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {status === 'verifying' && (
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Verifying your payment...
            </Typography>
          </Box>
        )}

        {status === 'success' && (
          <Alert 
            severity="success"
            variant="filled"
            sx={{ width: '100%', py: 2 }}
          >
            <AlertTitle>Payment Successful!</AlertTitle>
            <Typography>
              Your subscription has been activated. You will be redirected to the dashboard shortly.
            </Typography>
          </Alert>
        )}

        {status === 'failed' && (
          <Alert 
            severity="error"
            variant="filled"
            sx={{ width: '100%' }}
          >
            <AlertTitle>Payment Verification Failed</AlertTitle>
            <Typography paragraph>{error}</Typography>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/subscription/plans')}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </Stack>
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default VerifySubscription;
