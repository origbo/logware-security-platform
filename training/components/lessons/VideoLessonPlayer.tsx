import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Slider,
  IconButton,
  Stack,
  LinearProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import { Lesson } from '../../models/types';

interface VideoLessonPlayerProps {
  lesson: Lesson;
  onComplete: () => void;
}

const VideoLessonPlayer: React.FC<VideoLessonPlayerProps> = ({ lesson, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // In a real implementation, this would use a proper video player like videojs or React Player
  const videoUrl = lesson.content?.videoUrl || 'https://example.com/placeholder.mp4';
  const transcript = lesson.content?.transcript || 'No transcript available for this video.';
  
  // For demo purposes, set a placeholder video
  const placeholderVideo = 'https://www.w3schools.com/html/mov_bbb.mp4';
  
  useEffect(() => {
    // Add event listeners to the video element
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Consider video watched when 90% complete
      if (video.currentTime / video.duration > 0.9 && !videoWatched) {
        setVideoWatched(true);
      }
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoWatched]);
  
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const volumeValue = newValue as number;
    setVolume(volumeValue);
    video.volume = volumeValue / 100;
    
    if (volumeValue === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };
  
  const handleSeek = (event: Event, newValue: number | number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const seekTime = newValue as number;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <Box>
      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: 'background.paper',
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ position: 'relative', width: '100%' }}>
          <video
            ref={videoRef}
            src={placeholderVideo}
            style={{ width: '100%', display: 'block' }}
          />
          
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              p: 1
            }}
          >
            <Slider
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              sx={{ mb: 1 }}
            />
            
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                
                <Typography variant="body2" sx={{ color: 'white', mx: 1 }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={() => setShowTranscript(!showTranscript)} 
                  sx={{ color: showTranscript ? 'primary.main' : 'white' }}
                >
                  <ClosedCaptionIcon />
                </IconButton>
                
                <Box sx={{ width: 100, mx: 2 }}>
                  <Slider
                    size="small"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={handleVolumeChange}
                  />
                </Box>
                
                <IconButton onClick={handleMuteToggle} sx={{ color: 'white' }}>
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
                
                <IconButton onClick={handleFullscreen} sx={{ color: 'white' }}>
                  <FullscreenIcon />
                </IconButton>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>
      
      {showTranscript && (
        <Paper 
          elevation={0}
          sx={{ 
            mt: 2, 
            p: 2, 
            maxHeight: '200px', 
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Transcript
          </Typography>
          <Typography variant="body2">
            {transcript}
          </Typography>
        </Paper>
      )}
      
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary"
          disabled={!videoWatched}
          onClick={onComplete}
        >
          {videoWatched ? 'Mark as Completed' : 'Watch the video to complete this lesson'}
        </Button>
        
        {!videoWatched && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Please watch at least 90% of the video to complete this lesson
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default VideoLessonPlayer;
