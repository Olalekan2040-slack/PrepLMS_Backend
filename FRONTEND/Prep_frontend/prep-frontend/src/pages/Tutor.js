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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { contentAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const classLevels = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'];

function CourseCard({ course, loading }) {
  if (loading) {
    return (
      <Card className="course-card">
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

  return (
    <Card className="course-card">
      <CardMedia
        component="img"
        height="180"
        image={course.thumbnail_url || `https://source.unsplash.com/featured/?${course.subject}`}
        alt={course.title}
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {course.title}
          </Typography>
          <IconButton size="small">
            <BookmarkBorderIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {course.description}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {course.class_level && (
            <Chip 
              label={course.class_level} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          )}
          {course.subject && (
            <Chip 
              label={course.subject} 
              size="small" 
              color="secondary" 
              variant="outlined" 
            />
          )}
          {course.is_free && (
            <Chip 
              label="Free" 
              size="small" 
              color="success" 
              variant="outlined" 
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {course.duration || 'Self-paced'}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PlayCircleOutlineIcon />}
          fullWidth
          href={`/tutor/course/${course.id}`}
        >
          Start Learning
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Tutor() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/tutor', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        switch (tab) {
          case 0: // All Courses
            response = await contentAPI.getCourses();
            break;
          case 1: // By Class
            if (selectedClass !== 'all') {
              response = await contentAPI.getCoursesByClass(selectedClass.toLowerCase());
            } else {
              response = await contentAPI.getCourses();
            }
            break;
          case 2: // Featured
            response = await contentAPI.getFeaturedCourses();
            break;
          default:
            response = await contentAPI.getCourses();
        }
        setCourses(response.data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load courses');
      }
      setLoading(false);
    };

    fetchCourses();
  }, [tab, selectedClass]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" sx={{ 
            color: 'primary.main', 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #714B67 30%, #017E84 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Learning Resources
          </Typography>
          <TextField
            placeholder="Search courses..."
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

        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          sx={{ mb: 4 }}
        >
          <Tab label="All Courses" />
          <Tab label="By Class" />
          <Tab label="Featured" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        {tab === 1 && (
          <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {classLevels.map((level) => (
              <Chip
                key={level}
                label={level}
                clickable
                color={selectedClass === level ? 'primary' : 'default'}
                onClick={() => setSelectedClass(level)}
                sx={{ px: 1 }}
              />
            ))}
          </Box>
        )}

        <Grid container spacing={3}>
          {loading ? (
            Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <CourseCard loading={true} />
              </Grid>
            ))
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CourseCard course={course} loading={false} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                No courses found. Try adjusting your search or filters.
              </Alert>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
