import React, { useEffect, useState } from 'react';
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
import { userAPI, contentAPI } from '../../api';
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
                <Button size="small" startIcon={<PlayCircleOutlineIcon />} onClick={() => onPlay(video.course_id, video.id)}>
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
  const navigate = useNavigate();
  
  // State variables
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookmarkedVideos, setBookmarkedVideos] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [activeVideos, setActiveVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [browseVideos, setBrowseVideos] = useState([]);
  const [pointsToday, setPointsToday] = useState(0);
  const [pointsWeek, setPointsWeek] = useState(0);

  // Define available subjects and class levels
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
  const classLevels = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  // Handle bookmark/unbookmark
  const handleBookmark = async (video) => {
    try {
      const isBookmarked = bookmarkedVideos.some(b => b.id === video.id);
      if (isBookmarked) {
        await contentAPI.removeBookmark(video.id);
        setBookmarkedVideos(prev => prev.filter(b => b.id !== video.id));
      } else {
        await contentAPI.bookmarkVideo(video.id);
        setBookmarkedVideos(prev => [...prev, video]);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      if (err.response?.status === 403) {
        localStorage.removeItem('access_token');
        navigate('/auth');
      }
    }
  };

  const handlePlay = (courseId, videoId) => {
    navigate(`/course/${courseId}?video=${videoId}`);
  };

  // Effect to filter videos based on selection
  useEffect(() => {
    const filteredVideos = allVideos.filter(video => {
      const matchesClass = !selectedClass || video.class_level === selectedClass;
      const matchesSubject = !selectedSubject || video.subject === selectedSubject;
      return matchesClass && matchesSubject;
    });
    setBrowseVideos(filteredVideos);
  }, [selectedClass, selectedSubject, allVideos]);

  // Effect to load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          profileRes,
          statsRes,
          featuredRes,
          activeRes,
          bookmarksRes,
          videosRes
        ] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getDashboardStats(),
          contentAPI.getFeaturedCourses(),
          contentAPI.getActiveVideos(),
          contentAPI.getBookmarkedVideos(),
          contentAPI.getVideos()
        ]);

        setProfile(profileRes.data);
        setStats(statsRes.data);
        setPointsToday(statsRes.data?.points_today || 0);
        setPointsWeek(statsRes.data?.points_week || 0);
        setFeaturedCourses(featuredRes.data || []);
        setActiveVideos(activeRes.data || []);
        setBookmarkedVideos(bookmarksRes.data || []);
        setAllVideos(videosRes.data || []);
        setBrowseVideos(videosRes.data || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError(err?.response?.data?.message || 'Failed to load dashboard data');
        if (err.response?.status === 403) {
          localStorage.removeItem('access_token');
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
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
        <Typography variant="body2">You are on a <b>{stats?.streak?.current_streak_days || 0}</b> day streak</Typography>
      </Box>
      {/* Quick Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 120, bgcolor: 'background.paper', p: 2, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2">Videos Watched</Typography>
          <Typography variant="h6" color="primary">{stats?.videos_watched || 0}</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 120, bgcolor: 'background.paper', p: 2, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2">Points Earned</Typography>
          <Typography variant="h6" color="primary">{stats?.points?.total_points || 0}</Typography>
        </Box>
      </Box>
      {/* Featured Videos Carousel */}
      <VideoCarousel
        title="Featured Videos"
        videos={featuredCourses}
        onPlay={handlePlay}
        onBookmark={handleBookmark}
        bookmarks={bookmarkedVideos}
      />
      {/* Continue Learning Carousel */}
      <VideoCarousel
        title="Continue Learning"
        videos={activeVideos}
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
                  <Button size="small" startIcon={<PlayCircleOutlineIcon />} onClick={() => handlePlay(video.course_id, video.id)}>
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
