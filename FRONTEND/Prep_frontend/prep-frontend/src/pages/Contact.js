import React from 'react';
import { Container, Typography, TextField, Button, Paper } from '@mui/material';

export default function Contact() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h3" fontWeight={700} color="primary" gutterBottom>
          Contact & Support
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Have questions or need help? Fill out the form below and our team will get back to you soon.
        </Typography>
        <form>
          <TextField label="Name" name="name" fullWidth margin="normal" required />
          <TextField label="Email" name="email" fullWidth margin="normal" required />
          <TextField label="Message" name="message" fullWidth margin="normal" multiline rows={4} required />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Send Message
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
