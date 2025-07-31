import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Skeleton,
  Chip,
  Divider,
  Alert,
  IconButton,
  Paper,
  LinearProgress,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { contentAPI, progressAPI } from '../api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

function VideoListItem({ video, onSelect, isLocked, progress }) {
  return (
    <ListItem 
      button 
      onClick={() => !isLocked && onSelect(video)}
      sx={{
        borderRadius: 1,
        mb: 1,
        '&:hover': {
          bgcolor: 'rgba(113, 75, 103, 0.1)',
        },
        opacity: isLocked ? 0.7 : 1,
      }}
    >
      <ListItemIcon>
        {isLocked ? (
          <LockIcon color="action" />
        ) : (
          <PlayCircleOutlineIcon color="primary" />
        )}
      </ListItemIcon>
      <ListItemText
        primary={video.title}
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {video.duration} mins
            </Typography>
            {video.is_free && (
              <Chip 
                label="Free" 
                size="small" 
                color="success" 
                variant="outlined" 
              />
            )}
            {progress && (
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ width: '100px', ml: 2 }} 
              />
            )}
          </Box>
        }
      />
    </ListItem>
  );
}

function SubscriptionPrompt({ onSubscribe }) {
  return (
    <Card sx={{ mt: 3, bgcolor: 'primary.light', color: 'white' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Get Full Access to Premium Content
        </Typography>
        <Typography variant="body1" paragraph>
          Subscribe to unlock all premium videos and enhance your learning experience.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={onSubscribe}
          sx={{ mt: 1 }}
        >
          View Subscription Plans
        </Button>
      </CardContent>
    </Card>
  );
}

const AUTO_SAVE_INTERVAL = 5000; // Save progress every 5 seconds

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkError, setBookmarkError] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [bookmarkedVideos, setBookmarkedVideos] = useState(new Set());
  const videoRef = useRef(null);
  const progressInterval = useRef(null);
  const token = localStorage.getItem('access_token');
  const { subscription } = useSubscription();
  const { isAuthenticated } = useAuth();
  
  const canAccessPremium = subscription && subscription.is_active;

  useEffect(() => {
    const fetchCourseAndVideos = async () => {
  setLoading(true);
  setError(null);
  try {
    const [courseRes, videosRes] = await Promise.all([
      contentAPI.getCourseById(courseId),
      contentAPI.getVideosByCourse(courseId)
    ]);

    setCourse(courseRes.data);
    setVideos(videosRes.data);

    // Get progress for each video
    const progressPromises = videosRes.data.map(async (video) => {
      try {
        const progressRes = await progressAPI.getVideoProgress(video.id);
        return { videoId: video.id, progress: progressRes.data };
      } catch (error) {
        console.error(`Failed to fetch progress for video ${video.id}:`, error);
        return { videoId: video.id, progress: null };
      }
    });

    // Get bookmarked videos
    try {
      const bookmarksRes = await contentAPI.getBookmarkedVideos();
      setBookmarkedVideos(bookmarksRes.data || []);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
    }

    // Wait for all progress fetches
    const progressResults = await Promise.all(progressPromises);
    const progressMap = {};
    progressResults.forEach(({ videoId, progress }) => {
      if (progress) progressMap[videoId] = progress;
    });
    setVideoProgress(progressMap);

    if (videosRes.data.length > 0) {
      setSelectedVideo(videosRes.data[0]);
    }
  } catch (err) {
    setError(err?.response?.data?.message || 'Failed to load course content');
  }
  setLoading(false);
};
 fetchCourseAndVideos();
}, [courseId, token]);

  const handleToggleBookmark = async () => {
    if (!selectedVideo || bookmarkLoading) return;

    setBookmarkLoading(true);
    setBookmarkError(null);

    try {
      if (bookmarkedVideos.has(selectedVideo.id)) {
        await contentAPI.removeBookmark(selectedVideo.id);
        setBookmarkedVideos(prev => prev.filter(v => v.id !== selectedVideo.id));
      } else {
        await contentAPI.bookmarkVideo(selectedVideo.id);
        setBookmarkedVideos(prev => [...prev, selectedVideo]);
      }
    } catch (err) {
      setBookmarkError(err?.response?.data?.message || 'Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleVideoProgress = (event) => {
    const video = event.target;
    const progress = (video.currentTime / video.duration) * 100;
    
    if (selectedVideo) {
      setVideoProgress(prev => ({
        ...prev,
        [selectedVideo.id]: progress
      }));
    }
  };
  const saveProgress = useCallback(async () => {
    if (!token || !selectedVideo || !videoRef.current) return;

    const video = videoRef.current;
    const progress = (video.currentTime / video.duration) * 100;
    const currentTime = video.currentTime;

    try {
      // Track overall learning progress
      await progressAPI.trackProgress({
        video_id: selectedVideo.id,
        progress: progress,
        current_time: currentTime,
        duration: video.duration
      });
    } catch (err) {
      console.error('Failed to save video progress:', err);
    }
  }, [token, selectedVideo, videoRef]);

  const handleVideoSelect = (video) => {
    if (video.is_free || canAccessPremium) {
      setSelectedVideo(video);
    } else {
      // Directly navigate to subscription plans
      navigate('/subscription/plans');
    }
  };

  const loadVideoProgress = async (video) => {
    if (!video) return;
    try {
      const res = await progressAPI.getVideoProgress(video.id);
      if (res.data?.current_time) {
        const videoElement = videoRef.current;
        if (videoElement) {
          videoElement.currentTime = res.data.current_time;
        }
      }
    } catch (error) {
      console.error('Failed to load video progress:', error);
    }
  };

  const isVideoLocked = (video) => {
    return !video.is_free && !canAccessPremium;
  };

  // Set up auto-save interval when a video is selected
  useEffect(() => {
    if (selectedVideo && token) {
      progressInterval.current = setInterval(saveProgress, AUTO_SAVE_INTERVAL);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [selectedVideo, token, saveProgress]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tutor')}
          sx={{ mb: 3 }}
        >
          Back to Courses
        </Button>

        <Grid container spacing={3}>
          {/* Video Player Section */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 3
              }}
            >
              {selectedVideo ? (
                <Box sx={{ position: 'relative', pt: '56.25%' }}>
                  <Box
                    component="video"
                    ref={videoRef}
                    src={selectedVideo.video_url}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 0
                    }}
                    controls
                    onTimeUpdate={handleVideoProgress}
                    onEnded={saveProgress}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.paper'
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Select a video to start learning
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Video Info */}
            {selectedVideo && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                    {selectedVideo.title}
                  </Typography>
                  <IconButton 
                    onClick={handleToggleBookmark}
                    disabled={bookmarkLoading}
                  >
                    {bookmarkedVideos.has(selectedVideo.id) ? (
                      <BookmarkIcon color="primary" />
                    ) : (
                      <BookmarkBorderIcon />
                    )}
                  </IconButton>
                </Box>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {selectedVideo.description}
                </Typography>
                {/* Progress bar */}
                {videoProgress[selectedVideo.id] > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" color="primary">
                        {Math.round(videoProgress[selectedVideo.id])}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={videoProgress[selectedVideo.id]} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={course?.class_level} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={course?.subject} 
                    size="small" 
                    color="secondary" 
                    variant="outlined" 
                  />
                </Box>
              </Paper>
            )}
          </Grid>

          {/* Video List Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
                Course Content
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {videos.map((video) => (
                  <VideoListItem
                    key={video.id}
                    video={video}
                    onSelect={handleVideoSelect}
                    isLocked={isVideoLocked(video)}
                    progress={videoProgress[video.id] || 0}
                  />
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Add subscription prompt for non-subscribers */}
        {!canAccessPremium && (
          <SubscriptionPrompt onSubscribe={() => navigate('/subscription/plans')} />
        )}
      </Container>

      <Snackbar
        open={!!bookmarkError}
        autoHideDuration={6000}
        onClose={() => setBookmarkError(null)}
        message={bookmarkError}
      />
    </Box>
  );
}
