import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  StarBorder as StarBorderIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  getPerformanceAnalytics,
  getTimeSpentAnalytics,
  getSubjectStrengths,
  getLearningRecommendations,
} from '../../api';

function StatCard({ icon, title, value, subtitle, color }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 28, mr: 1 } })}
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={color} sx={{ mb: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function SubjectStrengthBar({ subject, strength, maxStrength }) {
  const percentage = (strength / maxStrength) * 100;
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{subject}</Typography>
        <Typography variant="body2" color="primary">
          {strength} videos completed
        </Typography>
      </Box>
      <Box
        sx={{
          width: '100%',
          height: 8,
          bgcolor: 'background.paper',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${percentage}%`,
            height: '100%',
            bgcolor: theme.palette.primary.main,
            transition: 'width 1s ease-in-out',
          }}
        />
      </Box>
    </Box>
  );
}

export default function Analytics() {
  const [performance, setPerformance] = useState(null);
  const [timeSpent, setTimeSpent] = useState(null);
  const [strengths, setStrengths] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const theme = useTheme();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        const [performanceData, timeData, strengthsData, recommendationsData] = await Promise.all([
          getPerformanceAnalytics(token),
          getTimeSpentAnalytics(token),
          getSubjectStrengths(token),
          getLearningRecommendations(token),
        ]);

        setPerformance(performanceData.data);
        setTimeSpent(timeData.data);
        setStrengths(strengthsData.data);
        setRecommendations(recommendationsData.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load analytics');
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [token]);

  if (!token) {
    return (
      <Alert 
        severity="info" 
        action={
          <Button color="inherit" size="small" onClick={() => navigate('/auth')}>
            Login
          </Button>
        }
      >
        Please login to view your analytics
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Box>
      {/* Performance Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PlayCircleOutlineIcon />}
            title="Videos Watched"
            value={performance?.total_watched || 0}
            subtitle="Total videos"
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TimelineIcon />}
            title="Completion Rate"
            value={`${Math.round(performance?.completion_rate || 0)}%`}
            subtitle="Videos completed"
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccessTimeIcon />}
            title="Average Watch Time"
            value={formatTime(performance?.avg_watch_time || 0)}
            subtitle="Per video"
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUpIcon />}
            title="Total Time"
            value={formatTime(timeSpent?.total_minutes || 0)}
            subtitle="Learning time"
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Subject Strengths */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
            <Typography variant="h6" gutterBottom>
              Subject Strengths
            </Typography>
            <Box sx={{ mt: 2 }}>
              {strengths?.subjects?.map((subject) => (
                <SubjectStrengthBar
                  key={subject.id}
                  subject={subject.name}
                  strength={subject.completed_videos}
                  maxStrength={Math.max(...strengths.subjects.map(s => s.completed_videos))}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Recommended for You
            </Typography>
            <List>
              {recommendations?.subjects?.map((subject, index) => (
                <React.Fragment key={subject.id}>
                  <ListItem 
                    button 
                    onClick={() => navigate(`/tutor?subject=${subject.id}`)}
                  >
                    <ListItemIcon>
                      <StarBorderIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={subject.name}
                      secondary={subject.reason}
                    />
                  </ListItem>
                  {index < recommendations.subjects.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
