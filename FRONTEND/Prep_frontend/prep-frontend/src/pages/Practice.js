import React from 'react';
import { Container, Typography, Alert } from '@mui/material';

export default function Practice() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={700} color="primary" gutterBottom>
        Prep Practice Questions (PPQ)
      </Typography>
      <Alert severity="info">Coming Soon! Practice questions, mock tests, and quizzes will be available in Phase 2.</Alert>
    </Container>
  );
}
