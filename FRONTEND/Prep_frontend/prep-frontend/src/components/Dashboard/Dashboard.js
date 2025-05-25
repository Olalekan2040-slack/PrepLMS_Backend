import React, { useEffect, useState } from 'react';
import { getVideos } from '../../api'; // adjust path based on your project structure

import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
  Divider,
  Alert
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getDashboardStats, getActiveVideos, getUserBookmarkedVideos, getWatchHistory, getLearningProgress, getUserProfile, getAllVideos, getFeaturedCourses, bookmarkVideo, removeBookmark } from '../../api';
import { useNavigate } from 'react-router-dom';

function VideoCarousel({ title, videos, onPlay, onBookmark, bookmarks }) {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={1}>{title}</Typography>
      <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 1 }}>
        {videos.length === 0 && <Alert severity="info" sx={{ minWidth: 220 }}>No videos found.</Alert>}
        {videos.map(video => (
          <Card key={video.id} sx={{ minWidth: 220, maxWidth: 240, flex: '0 0 auto', position: 'relative' }}>
            <CardMedia
              component="img"
              height="120"
              image={video.thumbnail || '/students-studying-together-medium-shot.jpg'}
              alt={video.title}
              sx={{ borderRadius: 1 }}
            />
            <IconButton
              onClick={() => onBookmark(video)}
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', color: 'primary.main', zIndex: 2 }}
            >
              {bookmarks?.some(b => b.id === video.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
            <CardContent sx={{ pb: '8px !important' }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>{video.title}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{video.subject} • {video.class_level}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Button size="small" startIcon={<PlayCircleOutlineIcon />} onClick={() => onPlay(video)}>
                  Play
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [continueVideos, setContinueVideos] = useState([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState([]);
  const [pointsToday, setPointsToday] = useState(0);
  const [pointsWeek, setPointsWeek] = useState(0);
  const [streak, setStreak] = useState(0);
  const [videosWatched, setVideosWatched] = useState(0);
  const [allVideos, setAllVideos] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [browseVideos, setBrowseVideos] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('access_token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate('/auth');
        return;
      }

      setLoading(true);
      try {
        // Check if token is valid by attempting to get user profile
        await getUserProfile();

        const [profileRes, statsRes, featuredRes, continueRes, bookmarksRes, allRes] = await Promise.all([
          getUserProfile(),
          getDashboardStats(),
          getFeaturedCourses(),
          getActiveVideos(),
          getUserBookmarkedVideos(),
          getVideos()
        ]);
        console.log('Dashboard data loaded:', {
          profile: profileRes.data,
          stats: statsRes.data,
          featured: featuredRes.data,
          continue: continueRes.data,
          bookmarks: bookmarksRes.data
        });
        setProfile(profileRes.data);
        setStats(statsRes.data);
        setFeaturedVideos(featuredRes.data || []);
        setContinueVideos(continueRes.data || []);
        setBookmarkedVideos(bookmarksRes.data || []);
        setAllVideos(allRes.data || []);
        setPointsToday(statsRes.data?.points?.today || 0);
        setPointsWeek(statsRes.data?.points?.week || 0);
        setStreak(statsRes.data?.streak?.current_streak_days || 0);
        setVideosWatched(statsRes.data?.videos_watched || 0);
      } catch (err) {
        console.error('Dashboard loading error:', err);
        if (err.response?.status === 403) {
          // Token is invalid or expired
          localStorage.removeItem('access_token');
          navigate('/auth');
        } else {
          setError(err?.response?.data?.message || 'Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  useEffect(() => {
    // Filter browseVideos by class/subject
    setBrowseVideos(
      allVideos.filter(v =>
        (!selectedClass || v.class_level === selectedClass) &&
        (!selectedSubject || v.subject === selectedSubject)
      )
    );
  }, [selectedClass, selectedSubject, allVideos]);

  const handlePlay = (video) => {
    // Implement navigation to video detail
    window.location.href = `/tutor/course/${video.courseId || video.id}`;
  };
  const handleBookmark = async (video) => {
    try {
      if (bookmarkedVideos?.some(b => b.id === video.id)) {
        await removeBookmark(video.id);
        setBookmarkedVideos(prev => prev.filter(b => b.id !== video.id));
      } else {
        await bookmarkVideo(video.id);
        const bookmark = { ...video, bookmarked_at: new Date().toISOString() };
        setBookmarkedVideos(prev => [...prev, bookmark]);
      }
    } catch (err) {
      console.error('Error updating bookmark:', err);
      if (err.response?.status === 403) {
        localStorage.removeItem('access_token');
        navigate('/auth');
      } else {
        alert(err?.response?.data?.message || 'Failed to update bookmark');
      }
    }
  };

  // Unique class/subject lists for browse
  const classLevels = [...new Set(allVideos.map(v => v.class_level).filter(Boolean))];
  const subjects = [...new Set(allVideos.map(v => v.subject).filter(Boolean))];

  if (loading) {
    return <Box sx={{ width: '100%', mt: 3, textAlign: 'center' }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Avatar src={profile?.avatar} sx={{ width: 48, height: 48 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Hello, {profile?.name || 'User'}
          </Typography>
          <Chip label="Free" color="success" size="small" sx={{ ml: 1 }} />
        </Box>
      </Box>
      {/* Streak */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <WhatshotIcon color="warning" />
        <Typography variant="body2">You are on a <b>{streak}</b> day streak</Typography>
      </Box>
      {/* Quick Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 120, bgcolor: 'background.paper', p: 2, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2">Videos Watched</Typography>
          <Typography variant="h6" color="primary">{videosWatched}</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 120, bgcolor: 'background.paper', p: 2, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2">Points Earned</Typography>
          <Typography variant="h6" color="primary">{stats?.points?.total_points || 0}</Typography>
        </Box>
      </Box>
      {/* Featured Videos Carousel */}
      <VideoCarousel
        title="Featured Videos"
        videos={featuredVideos}
        onPlay={handlePlay}
        onBookmark={handleBookmark}
        bookmarks={bookmarkedVideos}
      />
      {/* Continue Learning Carousel */}
      <VideoCarousel
        title="Continue Learning"
        videos={continueVideos}
        onPlay={handlePlay}
        onBookmark={handleBookmark}
        bookmarks={bookmarkedVideos}
      />
      {/* Calendar Section (placeholder) */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={1}>Calendar</Typography>
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CalendarMonthIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="body2">Calendar & streaks coming soon!</Typography>
        </Box>
      </Box>
      {/* Browse Lessons */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={1}>Browse Lessons</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {classLevels.map(level => (
            <Chip
              key={level}
              label={level}
              clickable
              color={selectedClass === level ? 'primary' : 'default'}
              onClick={() => setSelectedClass(level)}
            />
          ))}
          {subjects.map(subject => (
            <Chip
              key={subject}
              label={subject}
              clickable
              color={selectedSubject === subject ? 'secondary' : 'default'}
              onClick={() => setSelectedSubject(subject)}
            />
          ))}
          {(selectedClass || selectedSubject) && (
            <Button size="small" onClick={() => { setSelectedClass(''); setSelectedSubject(''); }}>Clear</Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 1 }}>
          {browseVideos.length === 0 && <Alert severity="info" sx={{ minWidth: 220 }}>No lessons found.</Alert>}
          {browseVideos.map(video => (
            <Card key={video.id} sx={{ minWidth: 220, maxWidth: 240, flex: '0 0 auto', position: 'relative' }}>
              <CardMedia
                component="img"
                height="120"
                image={video.thumbnail || '/students-studying-together-medium-shot.jpg'}
                alt={video.title}
                sx={{ borderRadius: 1 }}
              />
              <IconButton
                onClick={() => handleBookmark(video)}
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', color: 'primary.main', zIndex: 2 }}
              >
                {bookmarkedVideos?.some(b => b.id === video.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
              <CardContent sx={{ pb: '8px !important' }}>
                <Typography variant="subtitle1" fontWeight={600} noWrap>{video.title}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{video.subject} • {video.class_level}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Button size="small" startIcon={<PlayCircleOutlineIcon />} onClick={() => handlePlay(video)}>
                    Play
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
      {/* Points Earned Today/Week */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 120, bgcolor: 'background.paper', p: 2, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2">Points Today</Typography>
          <Typography variant="h6" color="primary">{pointsToday}</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 120, bgcolor: 'background.paper', p: 2, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2">Points This Week</Typography>
          <Typography variant="h6" color="primary">{pointsWeek}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
