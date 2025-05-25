import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Card, 
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const features = [
  {
    icon: <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Quality Education',
    description: 'Access high-quality video lessons from experienced teachers in core subjects.'
  },
  {
    icon: <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Track Progress',
    description: 'Monitor your learning journey with detailed progress tracking and analytics.'
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Earn Rewards',
    description: 'Get rewarded for consistent learning with points redeemable for mobile data.'
  }
];

const stats = [
  { number: '1000+', label: 'Video Lessons' },
  { number: '50,000+', label: 'Active Students' },
  { number: '95%', label: 'Success Rate' }
];

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #714B67 0%, #017E84 100%)',
          color: 'white',
          py: { xs: 4, md: 8 },
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }
                }}
              >
                Your Digital Learning Hub
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  fontSize: { xs: '1.1rem', sm: '1.3rem' }
                }}
              >
                Access quality education for primary and secondary school students. Learn at your own pace with our interactive video lessons.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/tutor')}
                  sx={{ 
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  Start Learning
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/auth')}
                  sx={{ 
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Sign Up Free
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={process.env.PUBLIC_URL + '/students-studying-together-medium-shot.jpg'}
                alt="Students learning"
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3
                }}
                elevation={0}
                className="course-card"
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} md={4} key={index} sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {stat.number}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
