import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Button,
  CircularProgress,
  Chip,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SubjectIcon from '@mui/icons-material/Subject';
import TimerIcon from '@mui/icons-material/Timer';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import { userAPI, progressAPI } from '../../api';

function ProgressCard({ title, value, color, icon: Icon, subtitle }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ color, fontSize: 28, mr: 1 }} />
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        </Box>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
          <CircularProgress
            variant="determinate"
            value={value}
            size={80}
            thickness={4}
            sx={{ color }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {`${Math.round(value)}%`}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function SubjectProgressBar({ subject }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <SubjectIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1">
            {subject.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`${subject.completed_videos} of ${subject.total_videos} videos completed`}
          </Typography>
        </Box>
        <Chip 
          label={`${Math.round(subject.progress)}%`}
          color="primary"
          variant="outlined"
          size="small"
        />
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={subject.progress} 
        sx={{ height: 8, borderRadius: 4 }} 
      />
    </Box>
  );
}

export default function LearningProgress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overallProgress, setOverallProgress] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [subjectProgress, setSubjectProgress] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        // Verify authentication first
        await userAPI.getProfile();

        // Fetch progress data
        const [progressRes, activityRes] = await Promise.all([
          progressAPI.getDashboard(),
          progressAPI.getRecentActivity()
        ]);

        setOverallProgress(progressRes.data);
        setRecentActivity(activityRes.data || []);

        // Fetch progress for each subject
        if (progressRes.data?.subjects) {
          const subjectPromises = progressRes.data.subjects.map(async (subject) => {
            try {
              const subjectRes = await progressAPI.getSubjectProgress(subject.id);
              return {
                ...subject,
                progress: subjectRes.data
              };
            } catch (err) {
              console.error(`Failed to fetch progress for subject ${subject.id}:`, err);
              return {
                ...subject,
                progress: null
              };
            }
          });

          const subjectResults = await Promise.all(subjectPromises);
          setSubjectProgress(subjectResults);
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError(err?.response?.data?.message || 'Failed to load progress data');
        if (err.response?.status === 403) {
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [navigate]);

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

  return (
    <Box>
      {/* Overall Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ProgressCard
            title="Overall Progress"
            value={overallProgress?.overall_progress || 0}
            color="primary.main"
            icon={PlayCircleOutlineIcon}
            subtitle="All courses"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProgressCard
            title="Videos Completed"
            value={overallProgress?.videos_completed_percentage || 0}
            color="secondary.main"
            icon={SubjectIcon}
            subtitle={`${overallProgress?.videos_completed || 0} videos`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProgressCard
            title="Daily Streak"
            value={overallProgress?.streak_completion || 0}
            color="success.main"
            icon={WhatshotIcon}
            subtitle={`${overallProgress?.current_streak || 0} days`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProgressCard
            title="Points Earned"
            value={overallProgress?.points_percentage || 0}
            color="warning.main"
            icon={EmojiEventsIcon}
            subtitle={`${overallProgress?.total_points || 0} points`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Subject Progress */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Progress by Subject
            </Typography>
            {subjectProgress.map((subject) => (
              <SubjectProgressBar key={subject.id} subject={subject} />
            ))}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem button onClick={() => navigate(`/tutor/course/${activity.course_id}`)}>
                    <ListItemIcon>
                      <PlayCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.video_title}
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {activity.course_title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimerIcon sx={{ fontSize: 16 }} />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(activity.watched_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <Box sx={{ minWidth: 100, textAlign: 'right' }}>
                      <Chip 
                        label={`${Math.round(activity.progress)}%`}
                        color={activity.progress >= 100 ? "success" : "primary"}
                        size="small"
                      />
                    </Box>
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
