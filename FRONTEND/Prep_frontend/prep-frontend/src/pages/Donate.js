import React from 'react';
import { Container, Typography, Button, Paper } from '@mui/material';

export default function Donate() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={700} color="primary" gutterBottom>
          Support Prep
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Help us provide free and low-cost access to quality education. Your donation supports our mission to empower students across Nigeria.
        </Typography>
        <Button variant="contained" color="primary" size="large" sx={{ mr: 2 }}>
          One-time Donation
        </Button>
        <Button variant="outlined" color="primary" size="large">
          Recurring Donation
        </Button>
      </Paper>
    </Container>
  );
}
