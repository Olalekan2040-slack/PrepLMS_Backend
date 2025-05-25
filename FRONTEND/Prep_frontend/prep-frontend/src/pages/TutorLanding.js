import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Paper,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import { getRandomFreeVideos, getRecommendations, getAllVideos, getCoursesBySubject, getCoursesByClass } from '../api';

const subjects = [
  'All Subjects',
  'Mathematics',
  'Chemistry',
  'Physics',
  'Biology',
  'English Language'
];

const classLevels = [
  'All Classes',
  'JSS1',
  'JSS2',
  'JSS3',
  'SS1',
  'SS2',
  'SS3'
];

// Sample free videos
const freeVideos = [
  {
    id: 'video1',
    title: 'Introduction to Algebra',
    subject: 'Mathematics',
    class: 'JSS3',
    description: 'Learn the basics of algebraic expressions and equations',
    youtubeId: 'NybHckSEQBI',
    duration: '12:45',
    teacher: 'Mr. Johnson',
    topic: 'Algebra',
    difficulty: 'Beginner',
    is_free: true
  },
  {
    id: 'video2',
    title: 'Forces in Physics',
    subject: 'Physics',
    class: 'SS1',
    description: 'Understanding Newton\'s laws of motion',
    youtubeId: '-c1DKnWKnlg',
    duration: '15:20',
    teacher: 'Mrs. Williams',
    topic: 'Forces and Motion',
    difficulty: 'Intermediate',
    is_free: true
  },
  {
    id: 'video3',
    title: 'Basic Essay Writing',
    subject: 'English Language',
    class: 'SS2',
    description: 'Learn how to write effective essays',
    youtubeId: 'GgkRoYPLhts',
    duration: '18:30',
    teacher: 'Ms. Thompson',
    topic: 'Essay Writing',
    difficulty: 'Intermediate',
    is_free: true
  }
];

// Recommended videos
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
    difficulty: 'Advanced',
    is_free: false
  },
  {
    id: 'rec2',
    title: 'Biology: Cell Structure and Function',
    subject: 'Biology',
    class: 'SS1',
    description: 'Detailed look at cell biology',
    youtubeId: '8IlzKri08kk',
    duration: '16:40',
    teacher: 'Mrs. Peterson',
    topic: 'Cell Biology',
    difficulty: 'Intermediate',
    is_free: false
  },
  {
    id: 'rec3',
    title: 'Literature: Understanding Poetry',
    subject: 'Literature',
    class: 'SS2',
    description: 'Analysis of poetic devices and interpretation',
    youtubeId: 'NG3HqBgxgtE',
    duration: '14:55',
    teacher: 'Mr. Roberts',
    topic: 'Poetry Analysis',
    difficulty: 'Advanced',
    is_free: false
  }
];

function VideoCard({ video, onPlay }) {
  const isLocked = !video.is_free;
  
  return (
    <Card sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: 2,
    }}>
      <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
        <CardMedia
          component="img"
          image={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt={video.title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isLocked ? 'brightness(0.7)' : 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            gap: 1
          }}
        >
          <Typography
            variant="caption"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 'medium'
            }}
          >
            {video.duration}
          </Typography>
          {isLocked && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <PlayArrowIcon sx={{ fontSize: 16 }} />
              </Box>
              Premium
            </Typography>
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
          {isLocked ? (
            <Box sx={{ color: 'error.main', fontSize: 40 }}>🔒</Box>
          ) : (
            <PlayArrowIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          )}
        </IconButton>
      </Box>
      <CardContent sx={{ p: 2, flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {video.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {video.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto' }}>
          <Typography
            variant="caption"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            {video.subject}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              bgcolor: 'secondary.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            {video.class}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              bgcolor: 'info.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            {video.difficulty}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function VideoCarousel({ videos, onVideoPlay }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.9;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: 2,
          py: 2,
          px: 2,
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {videos.map((video) => (
          <Box
            key={video.id}
            sx={{
              flexShrink: 0,
              width: { xs: '85%', sm: '80%' },
              scrollSnapAlign: 'center',
            }}
          >
            <VideoCard
              video={video}
              onPlay={onVideoPlay}
            />
          </Box>
        ))}
      </Box>
      
      {canScrollLeft && (
        <IconButton
          onClick={() => scroll('left')}
          sx={{
            position: 'absolute',
            left: 1,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': { bgcolor: 'background.paper' },
            zIndex: 2
          }}
        >
          <KeyboardArrowLeft />
        </IconButton>
      )}
      
      {canScrollRight && (
        <IconButton
          onClick={() => scroll('right')}
          sx={{
            position: 'absolute',
            right: 1,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': { bgcolor: 'background.paper' },
            zIndex: 2
          }}
        >
          <KeyboardArrowRight />
        </IconButton>
      )}
    </Box>
  );
}

function FilterBar({ selectedSubject, setSelectedSubject, selectedClass, setSelectedClass }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Subject</InputLabel>
        <Select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          label="Subject"
        >
          {subjects.map((subject) => (
            <MenuItem key={subject} value={subject}>{subject}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Class</InputLabel>
        <Select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          label="Class"
        >
          {classLevels.map((level) => (
            <MenuItem key={level} value={level}>{level}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <Box sx={{ mb: 4, textAlign: 'center' }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 1,
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default function TutorLanding() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedClass, setSelectedClass] = useState('All Classes');

  // Use the sample data directly
  const [availableFreeVideos] = useState(freeVideos);
  const [availableRecommendedVideos] = useState(recommendedVideos);

  const handleVideoPlay = (video) => {
    if (video.is_free) {
      window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, '_blank');
    } else {
      navigate('/auth');
    }
  };

  const filteredFreeVideos = availableFreeVideos.filter(video => 
    (selectedSubject === 'All Subjects' || video.subject === selectedSubject) &&
    (selectedClass === 'All Classes' || video.class === selectedClass)
  );
  
  const filteredRecommendedVideos = availableRecommendedVideos.filter(video => 
    (selectedSubject === 'All Subjects' || video.subject === selectedSubject) &&
    (selectedClass === 'All Classes' || video.class === selectedClass)
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #714B67 0%, #017E84 100%)',
          color: 'white',
          py: { xs: 4, md: 6 },
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                Learn with Prep Tutor
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  fontSize: { xs: '1.1rem', sm: '1.3rem' }
                }}
              >
                Access high-quality video lessons from experienced teachers. Perfect for WAEC and NECO preparation.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/auth')}
                  sx={{ 
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  Start Learning
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/tutor')}
                  sx={{ 
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Browse Courses
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mt: { xs: 4, md: 0 } }}>
                <VideoCarousel 
                  videos={availableFreeVideos.slice(0, 1)}
                  onVideoPlay={handleVideoPlay}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Video Sections */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <FilterBar
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
        />

        {filteredFreeVideos.length > 0 ? (
          <>
            <SectionTitle
              title="Free Sample Videos"
              subtitle="Start learning with these free educational videos"
            />
            <Box sx={{ mb: 6 }}>
              <VideoCarousel 
                videos={filteredFreeVideos}
                onVideoPlay={handleVideoPlay}
              />
            </Box>
          </>
        ) : (
          <Alert severity="info" sx={{ mb: 6 }}>
            No free videos available for the selected filters.
          </Alert>
        )}

        {filteredRecommendedVideos.length > 0 ? (
          <>
            <SectionTitle
              title="Premium Content"
              subtitle="Get unlimited access to all our premium videos with a subscription"
            />
            <Box sx={{ mb: 6 }}>
              <VideoCarousel 
                videos={filteredRecommendedVideos}
                onVideoPlay={handleVideoPlay}
              />
            </Box>
          </>
        ) : (
          <Alert severity="info" sx={{ mb: 6 }}>
            No premium videos available for the selected filters.
          </Alert>
        )}

        <Box sx={{ 
          textAlign: 'center', 
          mt: 4, 
          p: 4, 
          bgcolor: 'primary.main', 
          color: 'white',
          borderRadius: 2
        }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Ready to Start Learning?
          </Typography>
          <Typography sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            Get unlimited access to all our premium content, practice questions, and personalized learning features.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/auth')}
            sx={{ 
              px: 4, 
              py: 1.5, 
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            Get Full Access
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
