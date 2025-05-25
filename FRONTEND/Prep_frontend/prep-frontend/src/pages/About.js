import React from 'react';
import { Container, Typography, Box, useTheme, useMediaQuery, Paper, Grid } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';

const features = [
  {
    icon: <SchoolIcon sx={{ fontSize: 40 }} color="primary" />,
    title: 'Video Lessons',
    description: 'Expert-led video lessons in core subjects for WAEC and NECO preparation.'
  },
  {
    icon: <QuizIcon sx={{ fontSize: 40 }} color="secondary" />,
    title: 'Practice Questions',
    description: 'Comprehensive question bank with detailed solutions and explanations.'
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 40 }} color="success" />,
    title: 'Progress Tracking',
    description: 'Monitor your learning progress with detailed analytics and insights.'
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 40 }} color="warning" />,
    title: 'Community Learning',
    description: 'Join a community of learners and share knowledge together.'
  }
];

export default function About() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 6 } }}>
      {/* Hero Section */}
      <Paper elevation={0} sx={{
        p: { xs: 1.5, md: 4 },
        borderRadius: 3,
        bgcolor: 'background.paper',
        mb: 4,
        boxShadow: { xs: 0, md: 2 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Box
          component="img"
          src={process.env.PUBLIC_URL + '/students-studying-together-medium-shot.jpg'}
          alt="Students learning"
          sx={{
            width: '100%',
            maxWidth: 600,
            height: { xs: 200, sm: 300, md: 400 },
            objectFit: 'cover',
            borderRadius: 2,
            boxShadow: 2,
            mb: 3
          }}
        />
        <Typography
          variant={isMobile ? 'h5' : 'h3'}
          fontWeight={700}
          color="primary"
          gutterBottom
          sx={{ fontSize: { xs: '1.7rem', sm: '2.2rem', md: '3rem' }, textAlign: 'center' }}
        >
          About Prep
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          mb={2}
          sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, lineHeight: 1.7, textAlign: 'center' }}
        >
          Prep is an e-learning platform designed to improve access to quality education for primary and secondary school students. Our mission is to provide free and low-cost access to high-quality learning materials, build digital literacy, and support educational equality with adaptive learning tools.
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, lineHeight: 1.7, textAlign: 'center' }}
        >
          Prep Tutor offers a collection of pre-recorded video lessons in core subjects, while Prep Practice Questions (PPQ) will soon provide a vast repository of past questions, mock tests, and quizzes to help students prepare for exams like WAEC and NECO.
        </Typography>
      </Paper>

      {/* Mission Section */}
      <Paper elevation={1} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom color="primary" align="center">
          Our Mission
        </Typography>
        <Typography variant="body1" paragraph align="center" sx={{ maxWidth: 800, mx: 'auto' }}>
          At Prep, we believe that every student deserves access to quality education. Our platform is built on three core principles:
        </Typography>
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Accessibility
              </Typography>
              <Typography variant="body2">
                Making quality education available to all students regardless of their location or economic status.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="secondary" gutterBottom>
                Quality
              </Typography>
              <Typography variant="body2">
                Providing high-standard educational content aligned with national curricula and exam requirements.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="success.main" gutterBottom>
                Innovation
              </Typography>
              <Typography variant="body2">
                Leveraging technology to create engaging and effective learning experiences.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Features Section */}
      <Paper elevation={1} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom color="primary" align="center">
          Platform Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 1 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {feature.icon}
                <Typography variant="h6" sx={{ my: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Impact Section */}
      <Paper elevation={1} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom color="primary" align="center">
          Our Impact
        </Typography>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h5" gutterBottom color="text.primary">
                Making a Difference
              </Typography>
              <Typography variant="body1" paragraph>
                Since our launch, we've helped thousands of students improve their academic performance and achieve their educational goals.
              </Typography>
              <Typography variant="body1" paragraph>
                Our platform has reached students across Nigeria, providing them with:
              </Typography>
              <Box component="ul" sx={{ pl: 3 }}>
                <Typography component="li" variant="body1" paragraph>
                  Access to quality educational content
                </Typography>
                <Typography component="li" variant="body1" paragraph>
                  Improved exam preparation strategies
                </Typography>
                <Typography component="li" variant="body1" paragraph>
                  Better understanding of complex subjects
                </Typography>
                <Typography component="li" variant="body1">
                  Increased confidence in academic abilities
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    10K+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Students
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="secondary" fontWeight={700}>
                    500+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Video Lessons
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="success.main" fontWeight={700}>
                    85%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="warning.main" fontWeight={700}>
                    24/7
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Learning Access
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
