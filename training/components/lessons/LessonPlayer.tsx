import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Card, 
  CardContent,
  CardMedia,
  Divider,
  Stack
} from '@mui/material';
import TextLessonPlayer from './TextLessonPlayer';
import VideoLessonPlayer from './VideoLessonPlayer';
import InteractiveLessonPlayer from './InteractiveLessonPlayer';
import LabLessonPlayer from './LabLessonPlayer';
import { Lesson } from '../../models/types';

interface LessonPlayerProps {
  lesson: Lesson | null;
  onComplete: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({ lesson, onComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  
  if (!lesson) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No lesson selected
        </Typography>
      </Box>
    );
  }
  
  const handleComplete = () => {
    setIsCompleted(true);
  };
  
  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'text':
        return <TextLessonPlayer lesson={lesson} onComplete={handleComplete} />;
      case 'video':
        return <VideoLessonPlayer lesson={lesson} onComplete={handleComplete} />;
      case 'interactive':
        return <InteractiveLessonPlayer lesson={lesson} onComplete={handleComplete} />;
      case 'lab':
        return <LabLessonPlayer lesson={lesson} onComplete={handleComplete} />;
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Unsupported lesson type
            </Typography>
          </Box>
        );
    }
  };
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {lesson.title}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Estimated time: {lesson.duration} minutes
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        {renderLessonContent()}
      </Box>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          disabled={!isCompleted}
          onClick={onComplete}
        >
          {isCompleted ? 'Continue to Next Lesson' : 'Complete This Lesson First'}
        </Button>
      </Box>
    </Box>
  );
};

// For development/demonstration purposes, implement simple placeholder players

export default LessonPlayer;
