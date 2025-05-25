import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';

const PerformanceCard = ({ title, value, color }) => (
  <Card>
    <CardContent>
      <Typography color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <LinearProgress 
        variant="determinate" 
        value={parseFloat(value)} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          backgroundColor: `${color}22`,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
          }
        }} 
      />
    </CardContent>
  </Card>
);

const SubjectStrengthCard = ({ subject, strength }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {subject}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Box sx={{ flex: 1, mr: 2 }}>
          <LinearProgress
            variant="determinate"
            value={strength}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {strength}%
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default function AdminAnalytics() {
  const performanceMetrics = [
    { title: 'Average Completion Rate', value: '76%', color: '#4caf50' },
    { title: 'Average Time Spent', value: '45', color: '#2196f3' },
    { title: 'User Engagement', value: '82%', color: '#ff9800' },
    { title: 'Content Usage', value: '68%', color: '#9c27b0' },
  ];

  const subjectStrengths = [
    { subject: 'Mathematics', strength: 85 },
    { subject: 'Physics', strength: 72 },
    { subject: 'Chemistry', strength: 68 },
    { subject: 'Biology', strength: 76 },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>Analytics</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2 }}>Performance Metrics</Typography>
          <Grid container spacing={3}>
            {performanceMetrics.map((metric) => (
              <Grid item xs={12} sm={6} md={3} key={metric.title}>
                <PerformanceCard {...metric} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2 }}>Subject Strengths</Typography>
          <Grid container spacing={3}>
            {subjectStrengths.map((subject) => (
              <Grid item xs={12} sm={6} md={3} key={subject.subject}>
                <SubjectStrengthCard {...subject} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Recommendations</Typography>
            <Typography variant="body1" paragraph>
              Based on the analytics data:
            </Typography>
            <ul>
              <li>Increase math content - high engagement rate</li>
              <li>Add more practice questions for chemistry</li>
              <li>Consider adding video explanations for complex topics</li>
              <li>Implement more interactive elements in biology courses</li>
            </ul>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
