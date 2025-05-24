import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Divider,
  Button,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Lesson } from '../../models/types';

interface TextLessonPlayerProps {
  lesson: Lesson;
  onComplete: () => void;
}

const TextLessonPlayer: React.FC<TextLessonPlayerProps> = ({ lesson, onComplete }) => {
  const [readConfirmed, setReadConfirmed] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [autoCompleteTimePassed, setAutoCompleteTimePassed] = useState(false);
  
  // Simulate a timer for auto-completion (in a real app, this would be more sophisticated)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoCompleteTimePassed(true);
    }, 10000); // 10 seconds for demo purposes
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50;
    if (bottom && !scrolledToBottom) {
      setScrolledToBottom(true);
    }
  };
  
  // In a real app, the content would be properly formatted and possibly use markdown
  const content = lesson.content?.body || 'No content available for this lesson.';
  
  const isCompletionEnabled = scrolledToBottom && autoCompleteTimePassed;
  
  return (
    <Box>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          maxHeight: '400px', 
          overflowY: 'auto', 
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
        onScroll={handleScroll}
      >
        <Typography variant="body1" component="div">
          {/* This would be replaced with a proper rich text renderer in a real app */}
          {content.split('\n').map((paragraph: string, index: number) => (
            <Typography key={index} paragraph>
              {paragraph}
            </Typography>
          ))}
        </Typography>
      </Paper>
      
      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Checkbox 
              checked={readConfirmed}
              onChange={(e) => setReadConfirmed(e.target.checked)}
              disabled={!isCompletionEnabled}
            />
          }
          label="I confirm that I have read and understood this material"
          sx={{ mb: 2 }}
        />
        
        <Button 
          variant="contained" 
          color="primary"
          disabled={!readConfirmed || !isCompletionEnabled}
          onClick={onComplete}
        >
          Mark as Completed
        </Button>
        
        {!scrolledToBottom && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Please scroll through all content to complete this lesson
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TextLessonPlayer;
