import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { subscriptionAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import './Subscription.css';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login', { state: { from: '/subscription/plans' } });
      return;
    }
    fetchPlans();
  }, [user, navigate]);

  const fetchPlans = async () => {
    try {
      const response = await subscriptionAPI.getPlans();
      setPlans(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load subscription plans. Please try again later.');
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      const response = await subscriptionAPI.initiateSubscription({
        plan_id: planId,
        redirect_url: `${window.location.origin}/subscription/verify`
      });

      if (response.data.payment_url) {
        // Store the transaction reference for verification
        localStorage.setItem('pendingSubscriptionRef', response.data.tx_ref);
        // Redirect to Flutterwave payment page
        window.location.href = response.data.payment_url;
      }
    } catch (err) {
      setError('Failed to initiate subscription. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
      
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Choose Your Subscription Plan
      </Typography>
      
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card 
              className="subscription-card"
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <CardHeader
                title={plan.name}
                titleTypography={{ align: 'center' }}
                sx={{ bgcolor: 'primary.main', color: 'white' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h4" component="div" align="center" color="primary" gutterBottom>
                  ₦{plan.price.toFixed(2)}
                </Typography>
                <Typography variant="body1" paragraph>
                  {plan.description}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={`${plan.duration_days} days access`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={plan.video_limit > 0 
                        ? `Access to ${plan.video_limit} premium videos`
                        : 'Unlimited premium video access'
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => handleSubscribe(plan.id)}
                  fullWidth
                  sx={{ mx: 2 }}
                >
                  Subscribe Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SubscriptionPlans;
