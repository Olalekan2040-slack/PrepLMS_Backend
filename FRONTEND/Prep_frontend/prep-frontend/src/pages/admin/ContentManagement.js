import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  useTheme,
  CircularProgress,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { adminAPI } from '../../api';

export default function ContentManagement() {
  const theme = useTheme();
  const [videos, setVideos] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    class_level_id: '',
    video_source: 'youtube',
    video_id: '',
    video_file: null,
    access_token: '',
    thumbnail: '',
    duration: 0,
    is_free: false,
    order_in_subject: 0,
    processing_status: 'pending'
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      console.log('Loading data...');
      const [videosRes, subjectsRes, classLevelsRes] = await Promise.all([
        adminAPI.getVideos(),
        adminAPI.getSubjects(),
        adminAPI.getClassLevels()
      ]);
      console.log('Subjects:', subjectsRes.data);
      console.log('Class Levels:', classLevelsRes.data);
      setVideos(videosRes.data);
      setSubjects(subjectsRes.data);
      setClassLevels(classLevelsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please check console for details.');
    }
  };

  const handleOpenDialog = (video = null) => {
    if (video) {
      setSelectedVideo(video);
      setFormData({
        title: video.title,
        description: video.description,
        subject_id: video.subject.id,
        class_level_id: video.class_level.id,
        video_source: video.video_source,
        video_id: video.video_id,
        thumbnail: video.thumbnail,
        duration: video.duration,
        is_free: video.is_free,
        order_in_subject: video.order_in_subject
      });
    } else {
      setSelectedVideo(null);
      setFormData({
        title: '',
        description: '',
        subject_id: '',
        class_level_id: '',
        video_source: 'youtube',
        video_id: '',
        thumbnail: '',
        duration: 0,
        is_free: false,
        order_in_subject: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVideo(null);
  };  const handleVideoSourceChange = (event) => {
    const newSource = event.target.value;
    setFormData({
      ...formData,
      video_source: newSource,
      video_id: '',  // Reset video ID
      video_file: null,  // Reset file
      error: ''  // Reset any errors
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      
      // Create FormData
      const form = new FormData();
      const baseFields = [
        'title', 'description', 'subject_id', 'class_level_id',
        'video_source', 'is_free', 'order_in_subject'
      ];

      // Add base fields to FormData
      baseFields.forEach(field => {
        if (formData[field] !== undefined && formData[field] !== null) {
          form.append(field, typeof formData[field] === 'boolean' ? 
            formData[field].toString() : formData[field]);
        }
      });

      // Handle different video sources
      if (formData.video_source === 'upload' && formData.video_file) {
        console.log('Uploading file:', formData.video_file);
        form.append('video_file', formData.video_file);
      } else if (formData.video_source === 'drive') {
        if (!validateGoogleDriveLink(formData.video_id)) {
          throw new Error('Invalid Google Drive link');
        }
        const fileId = extractGoogleDriveId(formData.video_id);
        form.append('video_id', fileId);
        if (formData.access_token) {
          form.append('access_token', formData.access_token);
        }
      } else if (formData.video_source === 'youtube') {
        if (!validateYouTubeUrl(formData.video_id)) {
          throw new Error('Invalid YouTube URL');
        }
        form.append('video_id', extractYouTubeId(formData.video_id));
      }

      // Handle thumbnail if present
      if (formData.thumbnail instanceof File) {
        form.append('thumbnail', formData.thumbnail);
      }

      // Log FormData contents for debugging
      console.log('Form data being sent:');
      for (let pair of form.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      // Submit the form
      if (selectedVideo) {
        const response = await adminAPI.updateVideo(selectedVideo.id, form);
        console.log('Update response:', response);
      } else {
        const response = await adminAPI.uploadVideo(form, (progressEvent) => {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentage);
          console.log('Upload progress:', percentage + '%');
        });
        console.log('Upload response:', response);
      }

      setUploading(false);
      setUploadProgress(0);
      handleCloseDialog();
      loadData();  // Refresh the video list
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      console.error('Error saving video:', error.response?.data || error.message || error);
      alert(error.response?.data?.error || error.response?.data?.message || error.message || 'Error saving video. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await adminAPI.deleteVideo(id);
        loadData();
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const validateGoogleDriveLink = (link) => {
    if (!link) return false;
    // Check if it's a valid Google Drive link
    return link.includes('drive.google.com') && 
           (link.includes('/file/d/') || link.includes('?id='));
  };

  const extractGoogleDriveId = (link) => {
    if (!link) return null;
    let fileId = null;
    
    // Handle both sharing URL formats
    if (link.includes('/file/d/')) {
      fileId = link.split('/file/d/')[1].split('/')[0];
    } else if (link.includes('?id=')) {
      fileId = link.split('?id=')[1].split('&')[0];
    }
    
    return fileId;
  };

  const validateYouTubeUrl = (url) => {
    if (!url) return false;
    const pattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
    return pattern.test(url);
  };

  const extractYouTubeId = (url) => {
    const pattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
    const match = url.match(pattern);
    return match ? match[1] : url;
  };

  const columns = [
    { field: 'title', headerName: 'Title', flex: 2 },
    { field: 'subject', headerName: 'Subject', flex: 1, valueGetter: (params) => params.row.subject.name },
    { field: 'class_level', headerName: 'Class', flex: 1, valueGetter: (params) => params.row.class_level.name },
    { field: 'video_source', headerName: 'Source', flex: 1 },
    { field: 'is_free', headerName: 'Free', flex: 1, type: 'boolean' },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpenDialog(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
          Content Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }}
        >
          Add Video
        </Button>
      </Box>

      <Paper 
        sx={{ 
          height: 600,
          backgroundColor: 'transparent',
          '& .MuiDataGrid-root': {
            border: 'none',
            color: 'white',
            '& .MuiDataGrid-cell': {
              borderColor: 'rgba(255, 255, 255, 0.12)'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)'
            },
            '& .MuiCheckbox-root': {
              color: 'white'
            },
            '& .MuiTablePagination-root': {
              color: 'white'
            },
            '& .MuiIconButton-root': {
              color: 'white'
            }
          }
        }}
      >
        <DataGrid
          rows={videos}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          disableSelectionOnClick
        />
      </Paper>      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            '& .MuiDialogTitle-root': {
              color: 'white'
            }
          }
        }}
      >
        <DialogTitle>
          {selectedVideo ? 'Edit Video' : 'Add New Video'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                variant="outlined"
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: 'white' },
                  }
                }}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
                variant="outlined"
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: 'white' },
                  }
                }}
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="subject-label" sx={{ color: 'white' }}>Subject</InputLabel>
                <Select
                  labelId="subject-label"
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  label="Subject"
                  required
                  sx={{ 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="class-level-label" sx={{ color: 'white' }}>Class Level</InputLabel>
                <Select
                  labelId="class-level-label"
                  value={formData.class_level_id}
                  onChange={(e) => setFormData({ ...formData, class_level_id: e.target.value })}
                  label="Class Level"
                  required
                  sx={{ 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  {classLevels.map((level) => (
                    <MenuItem key={level.id} value={level.id}>{level.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="video-source-label" sx={{ color: 'white' }}>Video Source</InputLabel>
                <Select
                  labelId="video-source-label"
                  value={formData.video_source}
                  onChange={handleVideoSourceChange}
                  label="Video Source"
                  required
                  sx={{ 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                >
                  <MenuItem value="youtube">YouTube</MenuItem>
                  <MenuItem value="upload">File Upload</MenuItem>
                  <MenuItem value="drive">Google Drive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              {formData.video_source === 'upload' ? (
                <Box sx={{ textAlign: 'center', py: 2, border: '2px dashed rgba(255, 255, 255, 0.23)', borderRadius: 1 }}>
                  <input
                    accept="video/*"
                    style={{ display: 'none' }}
                    id="video-file-input"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        console.log('Selected file:', file);
                        setFormData(prev => ({
                          ...prev,
                          video_file: file
                        }));
                      }
                    }}
                  />
                  <label htmlFor="video-file-input">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                    >
                      Select Video File
                    </Button>
                  </label>
                  {formData.video_file && (
                    <Typography variant="body2" sx={{ mt: 1, color: 'white' }}>
                      Selected: {formData.video_file.name}
                    </Typography>
                  )}
                  {uploading && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                      <Typography variant="body2" sx={{ mt: 1, color: 'white' }}>
                        Uploading: {uploadProgress}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <TextField
                  fullWidth
                  label={formData.video_source === 'drive' ? 'Google Drive Link' : 'YouTube URL'}
                  name="video_id"
                  value={formData.video_id}
                  onChange={(e) => setFormData({ ...formData, video_id: e.target.value })}
                  required
                  variant="outlined"
                  InputLabelProps={{ style: { color: 'white' } }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                      '&:hover fieldset': { borderColor: 'white' },
                    }
                  }}
                />
              )}
            </Grid>
            {formData.video_source === 'drive' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Access Token (Optional)"
                  name="access_token"
                  value={formData.access_token}
                  onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                  variant="outlined"
                  InputLabelProps={{ style: { color: 'white' } }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                      '&:hover fieldset': { borderColor: 'white' },
                    }
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_free}
                    onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ff00' } }}
                  />
                }
                label="Free Access"
                sx={{ color: 'white' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: 'white' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : selectedVideo ? 'Update' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Video List */}
      <Paper sx={{ mt: 4 }}>
        <DataGrid
          rows={videos}
          columns={[
            { field: 'title', headerName: 'Title', flex: 1 },
            { field: 'video_source', headerName: 'Source', width: 120 },
            { 
              field: 'subject',
              headerName: 'Subject',
              width: 150,
              valueGetter: (params) => params.row.subject?.name
            },
            { 
              field: 'class_level',
              headerName: 'Class Level',
              width: 150,
              valueGetter: (params) => params.row.class_level?.name
            },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 120,
              renderCell: (params) => (
                <Box>
                  <IconButton onClick={() => handleOpenDialog(params.row)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(params.row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )
            }
          ]}
          autoHeight
          disableSelectionOnClick
          pageSize={10}
          rowsPerPageOptions={[10]}
        />
      </Paper>
    </Container>
  );
}
