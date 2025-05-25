import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Grid, Card, CardContent, CardMedia, Typography,
  CircularProgress, Alert, IconButton, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import { getUserBookmarkedVideos, removeBookmark } from '../../api';

function BookmarkCard({ video, onPlay, onRemove }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmRemove = () => {
    setConfirmOpen(false);
    onRemove(video.id);
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="140"
            image={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
            alt={video.title}
            sx={{ 
              objectFit: 'cover',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          />
          <IconButton
            onClick={() => setConfirmOpen(true)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { bgcolor: 'white', color: 'error.main' }
            }}
          >
            <BookmarkIcon color="primary" />
          </IconButton>
        </Box>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="h3" gutterBottom noWrap>
            {video.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {video.course_title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AccessTimeIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="text.secondary">
              Bookmarked: {new Date(video.bookmarked_at).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
            {video.subject && (
              <Chip
                label={video.subject}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {video.class_level && (
              <Chip
                label={video.class_level}
                size="small"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<PlayCircleOutlineIcon />}
            fullWidth
            onClick={() => onPlay(video.course_id, video.id)}
            sx={{ mt: 2 }}
          >
            Continue Learning
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Remove Bookmark</DialogTitle>
        <DialogContent>
          Are you sure you want to remove this video from your bookmarks?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRemove} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function BookmarkedLessons() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserBookmarkedVideos();
      setBookmarks(response.data || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      if (err.response?.status === 403) {
        localStorage.removeItem('access_token');
        navigate('/auth');
      } else if (err.response?.status === 404) {
        setError('No bookmarks found. The bookmarks feature may be temporarily unavailable.');
      } else {
        setError(err?.response?.data?.message || 'Failed to load bookmarked videos');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRemoveBookmark = async (videoId) => {
    try {
      await removeBookmark(videoId);
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== videoId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
      if (err.response?.status === 403) {
        localStorage.removeItem('access_token');
        navigate('/auth');
      } else {
        setError(err?.response?.data?.message || 'Failed to remove bookmark');
      }
    }
  };

  const handlePlayVideo = (courseId, videoId) => {
    navigate(`/tutor/course/${courseId}`, { state: { videoId } });
  };

  if (!localStorage.getItem('access_token')) {
    return (
      <Alert severity="info" action={
        <Button color="inherit" size="small" onClick={() => navigate('/auth')}>
          Login
        </Button>
      }>
        Please login to view your bookmarked lessons
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

  if (bookmarks.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <BookmarkIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Bookmarked Videos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          You haven't bookmarked any videos yet. Browse courses to find interesting videos to bookmark.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/tutor')}
        >
          Browse Courses
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={3}>
        {bookmarks.map(bookmark => (
          <Grid item xs={12} sm={6} md={4} key={bookmark.id}>
            <BookmarkCard
              video={bookmark}
              onPlay={handlePlayVideo}
              onRemove={handleRemoveBookmark}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
