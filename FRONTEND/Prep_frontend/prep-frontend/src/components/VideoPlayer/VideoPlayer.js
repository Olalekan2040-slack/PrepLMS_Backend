import React from 'react';
import { Box, Typography } from '@mui/material';

const VideoPlayer = ({ video }) => {
  if (!video) return null;

  const getVideoUrl = () => {
    if (video.video_source === 'youtube') {
      return `https://www.youtube.com/embed/${video.video_id}`;
    } else if (video.video_source === 'drive') {
      return `https://drive.google.com/file/d/${video.video_id}/preview`;
    }
    return null;
  };

  const videoUrl = getVideoUrl();
  if (!videoUrl) return null;

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box sx={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
        <iframe
          src={videoUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          allowFullScreen
          title={video.title}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          {video.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {video.description}
        </Typography>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
