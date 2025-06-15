import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { adminAPI } from '../../../api';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '24px 0' }}>
    {value === index && children}
  </div>
);

const ContentTable = ({ headers, data, onEdit, onDelete }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableCell key={header}>{header}</TableCell>
          ))}
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {Object.values(row).map((value, index) => (
              <TableCell key={index}>{value}</TableCell>
            ))}
            <TableCell align="right">
              <IconButton onClick={() => onEdit(row)} size="small">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(row)} size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const VideoUploadDialog = ({ open, onClose, onSave, subjects, classLevels }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    classLevel: '',
    videoFile: null,
    thumbnail: null,
    isFree: false,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value);
    });
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload New Video</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Video Title"
                fullWidth
                required
                value={form.title}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={form.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Subject</InputLabel>
                <Select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  label="Subject"
                >
                  {subjects.map(subject => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Class Level</InputLabel>
                <Select
                  name="classLevel"
                  value={form.classLevel}
                  onChange={handleChange}
                  label="Class Level"
                >
                  {classLevels.map(level => (
                    <MenuItem key={level.id} value={level.id}>
                      {level.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ height: '100%' }}
              >
                Upload Video
                <input
                  type="file"
                  hidden
                  name="videoFile"
                  accept="video/*"
                  onChange={handleChange}
                  required
                />
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ height: '100%' }}
              >
                Upload Thumbnail
                <input
                  type="file"
                  hidden
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleChange}
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Access Level</InputLabel>
                <Select
                  name="isFree"
                  value={form.isFree}
                  onChange={handleChange}
                  label="Access Level"
                >
                  <MenuItem value={false}>Premium</MenuItem>
                  <MenuItem value={true}>Free</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Upload</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default function ContentManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [openUpload, setOpenUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          subjectsRes,
          levelsRes,
          videosRes,
          coursesRes
        ] = await Promise.all([
          adminAPI.getSubjects(),
          adminAPI.getClassLevels(),
          adminAPI.getVideos(),
          adminAPI.courses.list()
        ]);

        setSubjects(subjectsRes.data || []);
        setClassLevels(levelsRes.data || []);
        setVideos(videosRes.data || []);
        setCourses(coursesRes.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUploadVideo = async (formData) => {
    try {
      await adminAPI.createVideo(formData);
      const videosRes = await adminAPI.getVideos();
      setVideos(videosRes.data || []);
      setOpenUpload(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload video');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEdit = (item) => {
    console.log('Edit:', item);
  };

  const handleDelete = (item) => {
    console.log('Delete:', item);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Content Management</Typography>
        {tabValue === 1 && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpenUpload(true)}
          >
            Upload Video
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Courses" />
          <Tab label="Videos" />
          <Tab label="Subjects" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <ContentTable
              headers={['ID', 'Name', 'Subjects', 'Level', 'Videos']}
              data={courses}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ContentTable
              headers={['ID', 'Title', 'Subject', 'Class', 'Duration', 'Status']}
              data={videos.map(video => ({
                id: video.id,
                title: video.title,
                subject: subjects.find(s => s.id === video.subject)?.name || '-',
                class: classLevels.find(c => c.id === video.classLevel)?.name || '-',
                duration: video.duration || '-',
                status: video.isFree ? 'Free' : 'Premium'
              }))}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <ContentTable
              headers={['ID', 'Name', 'Courses', 'Videos']}
              data={subjects}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabPanel>
        </Box>
      </Paper>

      <VideoUploadDialog
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        onSave={handleUploadVideo}
        subjects={subjects}
        classLevels={classLevels}
      />
    </Box>
  );
}
