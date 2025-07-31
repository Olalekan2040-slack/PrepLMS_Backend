import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Skeleton,
  Chip,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { contentAPI } from '../api';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

const classLevels = ['Primary-1', 'Primary-2', 'Primary-3', 'Primary-4', 'Primary-5', 'Primary-6', 'JSS-1', 'JSS-2', 'JSS-3', 'SSS-1', 'SSS-2', 'SSS-3'];
const subjects = ['Mathematics', 'English', 'Science', 'Biology', 'Chemistry', 'Physics'];

function VideoCard({ video, loading, onBookmarkToggle, isBookmarked }) {
  const { subscription } = useSubscription();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (video.is_free || (subscription && subscription.is_active)) {
      navigate(`/video/${video.id}`);
    } else {
      navigate('/subscription/plans');
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    onBookmarkToggle(video.id);
  };

  if (loading) {
    return (
      <Card className="video-card">
        <Skeleton variant="rectangular" height={180} />
        <CardContent>
          <Skeleton variant="text" height={32} width="80%" />
          <Skeleton variant="text" height={20} width="100%" />
          <Skeleton variant="text" height={20} width="60%" />
          <Skeleton variant="rectangular" height={36} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const isAccessible = video.is_free || (subscription && subscription.is_active);

  // Generate YouTube thumbnail URL if it's a YouTube video
  const getThumbnailUrl = () => {
    if (video.thumbnail) {
      return video.thumbnail;
    }
    if (video.video_source === 'youtube' && video.video_id) {
      return `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`;
    }
    return `https://source.unsplash.com/featured/400x225/?education,${video.subject}`;
  };

  return (
    <Card 
      className="video-card" 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={handleClick}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={getThumbnailUrl()}
          alt={video.title}
          sx={{
            filter: !isAccessible ? 'brightness(0.7)' : 'none',
          }}
        />
        {!isAccessible && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '8px 16px',
              borderRadius: '4px'
            }}
          >
            <LockIcon />
            <Typography variant="body2">Premium Content</Typography>
          </Box>
        )}
        <IconButton 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            bgcolor: 'rgba(255,255,255,0.8)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
          }}
          onClick={handleBookmarkClick}
          size="small"
        >
          {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
        </IconButton>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h2" sx={{ 
          fontWeight: 600, 
          mb: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {video.title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ 
          mb: 2, 
          flexGrow: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {video.description}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {video.class_level && (
            <Chip 
              label={video.class_level} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          )}
          {video.subject && (
            <Chip 
              label={video.subject} 
              size="small" 
              color="secondary" 
              variant="outlined" 
            />
          )}
          {video.is_free ? (
            <Chip 
              label="Free" 
              size="small" 
              color="success" 
              variant="filled" 
            />
          ) : (
            <Chip 
              label="Premium" 
              size="small" 
              color="warning" 
              variant="filled" 
            />
          )}
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={isAccessible ? <PlayCircleOutlineIcon /> : <LockIcon />}
          fullWidth
          color={isAccessible ? 'primary' : 'secondary'}
          sx={{ mt: 'auto' }}
        >
          {isAccessible ? 'Watch Now' : 'Get Premium Access'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Tutor() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [bookmarkedVideos, setBookmarkedVideos] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/tutor', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        switch (tab) {
          case 0: // All Videos
            response = await contentAPI.getVideos();
            break;
          case 1: // Free Videos
            response = await contentAPI.getFreeSampleVideos();
            break;
          case 2: // Featured
            response = await contentAPI.getFreeSampleVideos(); // Using free videos as featured for now
            break;
          default:
            response = await contentAPI.getVideos();
        }
        
        const videoData = Array.isArray(response.data) ? response.data : response.data?.results || [];
        setVideos(videoData);
        
        // Load bookmarks
        try {
          const bookmarksResponse = await contentAPI.getBookmarks();
          const bookmarkedIds = new Set(bookmarksResponse.data.map(video => video.id));
          setBookmarkedVideos(bookmarkedIds);
        } catch (bookmarkError) {
          console.log('Could not load bookmarks:', bookmarkError);
        }
        
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load videos');
        console.error('Error loading videos:', err);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [tab]);

  const handleBookmarkToggle = async (videoId) => {
    try {
      if (bookmarkedVideos.has(videoId)) {
        await contentAPI.removeBookmark(videoId);
        setBookmarkedVideos(prev => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
      } else {
        await contentAPI.addBookmark(videoId);
        setBookmarkedVideos(prev => new Set([...prev, videoId]));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || video.class_level === selectedClass;
    const matchesSubject = selectedSubject === 'all' || video.subject === selectedSubject;
    
    return matchesSearch && matchesClass && matchesSubject;
  });

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" sx={{ 
            color: 'primary.main', 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #714B67 30%, #017E84 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            PrepTutor - Video Lessons
          </Typography>
          <TextField
            placeholder="Search videos..."
            variant="outlined"
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {/* Tabs */}
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          sx={{ mb: 3 }}
        >
          <Tab label="All Videos" />
          <Tab label="Free Videos" />
          <Tab label="Featured" />
        </Tabs>

        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Filter by Class Level</Typography>
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="All Classes"
              clickable
              color={selectedClass === 'all' ? 'primary' : 'default'}
              onClick={() => setSelectedClass('all')}
            />
            {classLevels.map((level) => (
              <Chip
                key={level}
                label={level}
                clickable
                color={selectedClass === level ? 'primary' : 'default'}
                onClick={() => setSelectedClass(level)}
              />
            ))}
          </Box>
          
          <Typography variant="h6" gutterBottom>Filter by Subject</Typography>
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="All Subjects"
              clickable
              color={selectedSubject === 'all' ? 'secondary' : 'default'}
              onClick={() => setSelectedSubject('all')}
            />
            {subjects.map((subject) => (
              <Chip
                key={subject}
                label={subject}
                clickable
                color={selectedSubject === subject ? 'secondary' : 'default'}
                onClick={() => setSelectedSubject(subject)}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        {/* Video Grid */}
        <Grid container spacing={3}>
          {loading ? (
            Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <VideoCard loading={true} />
              </Grid>
            ))
          ) : filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={video.id}>
                <VideoCard 
                  video={video} 
                  loading={false} 
                  onBookmarkToggle={handleBookmarkToggle}
                  isBookmarked={bookmarkedVideos.has(video.id)}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                No videos found. Try adjusting your search or filters.
              </Alert>
            </Grid>
          )}
        </Grid>

        {/* Video Count */}
        {!loading && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
