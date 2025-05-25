import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  LinearProgress,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Button,
  IconButton,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import {
  getDashboardStats,
  getActiveVideos,
  getBookmarkedVideos,
  getWatchHistory,
  getLearningProgress,
  getUserProfile,
  getCourses,
  getSubjects,
  getVideosByCourse,
} from '../../api';

const recommendedVideos = [
  {
    id: 'rec1',
    title: 'Advanced Chemistry: Organic Compounds',
    subject: 'Chemistry',
    class: 'SS3',
    description: 'Comprehensive guide to organic chemistry for WAEC',
    youtubeId: 'LQGrNEJ0i-4',
    duration: '20:15',
    teacher: 'Dr. Adams',
    topic: 'Organic Chemistry',
    progress: 75,
    views: 1250,
    rating: 4.8
  },
  {
    id: 'rec2',
    title: 'Biology: Cell Structure',
    subject: 'Biology',
    class: 'SS1',
    description: 'Cell biology fundamentals',
    youtubeId: '8IlzKri08kk',
    duration: '16:40',
    teacher: 'Mrs. Peterson',
    topic: 'Cell Biology',
    progress: 0,
    views: 890,
    rating: 4.6
  },
  {
    id: 'rec3',
    title: 'Physics: Forces and Motion',
    subject: 'Physics',
    class: 'SS2',
    description: 'Understanding Newton\'s laws',
    youtubeId: '-c1DKnWKnlg',
    duration: '18:25',
    teacher: 'Mr. Johnson',
    topic: 'Mechanics',
    progress: 30,
    views: 1100,
    rating: 4.7
  }
];

// Sample data for recent lessons
const recentLessons = [
  {
    id: 'lesson1',
    title: 'Introduction to Algebra',
    subject: 'Mathematics',
    class: 'JSS3',
    lastWatched: '2 hours ago',
    progress: 60,
    youtubeId: 'NybHckSEQBI'
  },
  {
    id: 'lesson2',
    title: 'Basic Essay Writing',
    subject: 'English',
    class: 'SS2',
    lastWatched: '1 day ago',
    progress: 100,
    youtubeId: 'GgkRoYPLhts'
  }
];

function VideoCard({ video, onPlay, onBookmark, isBookmarked = false }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt={video.title}
          sx={{
            objectFit: 'cover',
            filter: video.progress > 0 ? 'brightness(0.9)' : 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: 'background.paper'
          }}
        >
          {video.progress > 0 && (
            <LinearProgress 
              variant="determinate" 
              value={video.progress} 
              sx={{ height: '100%' }}
            />
          )}
        </Box>
        <IconButton
          onClick={() => onPlay(video)}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              bgcolor: 'white',
              transform: 'translate(-50%, -50%) scale(1.1)',
            },
            transition: 'all 0.2s'
          }}
        >
          <PlayArrowIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        </IconButton>
        <IconButton
          onClick={() => onBookmark(video)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { bgcolor: 'white' }
          }}
        >
          {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
        </IconButton>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {video.title}
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Chip 
            label={video.subject} 
            size="small" 
            color="primary" 
            sx={{ mr: 1, mb: 1 }} 
          />
          <Chip 
            label={video.class} 
            size="small" 
            color="secondary" 
            sx={{ mr: 1, mb: 1 }} 
          />
          <Chip 
            icon={<AccessTimeIcon />} 
            label={video.duration} 
            size="small" 
            sx={{ mb: 1 }} 
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {video.teacher}
        </Typography>
        {video.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {video.rating} • {video.views.toLocaleString()} views
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function ContinueLearningCard({ lesson, onPlay }) {
  return (
    <Paper 
      sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' }
      }}
      onClick={() => onPlay(lesson)}
    >
      <Box 
        component="img"
        src={`https://img.youtube.com/vi/${lesson.youtubeId}/default.jpg`}
        alt={lesson.title}
        sx={{ 
          width: 120,
          height: 68,
          objectFit: 'cover',
          borderRadius: 1
        }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          {lesson.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {lesson.subject} • {lesson.class}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={lesson.progress} 
            sx={{ flexGrow: 1, height: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            {lesson.progress}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'flex-start' }}>
        {lesson.lastWatched}
      </Typography>
    </Paper>
  );
}

export default function NewDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [bookmarkedVideos, setBookmarkedVideos] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handlePlay = (video) => {
    // Navigate to video player or open in modal
    window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank');
  };

  const handleBookmark = (video) => {
    setBookmarkedVideos(prev => {
      const isBookmarked = prev.some(v => v.id === video.id);
      if (isBookmarked) {
        return prev.filter(v => v.id !== video.id);
      }
      return [...prev, video];
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Continue Learning Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Continue Learning
        </Typography>
        <Grid container spacing={2}>
          {recentLessons.map(lesson => (
            <Grid item xs={12} md={6} key={lesson.id}>
              <ContinueLearningCard lesson={lesson} onPlay={handlePlay} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Recommended Videos Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Recommended for You
        </Typography>
        <Grid container spacing={3}>
          {recommendedVideos.map(video => (
            <Grid item xs={12} sm={6} md={4} key={video.id}>
              <VideoCard 
                video={video}
                onPlay={handlePlay}
                onBookmark={handleBookmark}
                isBookmarked={bookmarkedVideos.some(v => v.id === video.id)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <SchoolIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">15 Hours</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Learning Time
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <PlayArrowIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">24 Videos</Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <StarIcon sx={{ fontSize: 40, mb: 1, color: 'warning.main' }} />
            <Typography variant="h6">85%</Typography>
            <Typography variant="body2" color="text.secondary">
              Average Score
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
