import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Checkbox,
  TextField,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle,
  LinearProgress,
  Grid,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import { Assessment, Question } from '../../models/types';

interface AssessmentEngineProps {
  assessment: Assessment | null;
  onComplete: (passed: boolean, score: number) => void;
}

export const AssessmentEngine: React.FC<AssessmentEngineProps> = ({ 
  assessment, 
  onComplete 
}) => {
  const theme = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: any}>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Reset state when assessment changes
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setIsSubmitting(false);
    
    // Set up timer if assessment has a time limit
    if (assessment?.timeLimit) {
      setTimeRemaining(assessment.timeLimit * 60);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [assessment]);
  
  if (!assessment) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No assessment available
        </Typography>
      </Box>
    );
  }
  
  const questions = assessment.questions;
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleCheckboxChange = (questionId: string, optionIndex: number) => {
    setUserAnswers(prev => {
      const prevAnswers = prev[questionId] as number[] || [];
      
      if (prevAnswers.includes(optionIndex)) {
        return {
          ...prev,
          [questionId]: prevAnswers.filter(i => i !== optionIndex)
        };
      } else {
        return {
          ...prev,
          [questionId]: [...prevAnswers, optionIndex]
        };
      }
    });
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    
    questions.forEach(question => {
      totalPoints += question.points;
      
      const userAnswer = userAnswers[question.id];
      const correctAnswer = question.correctAnswer;
      
      if (userAnswer !== undefined) {
        if (question.type === 'multiple_choice') {
          // Check if arrays match (for multiple choice)
          if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
            const isCorrect = 
              userAnswer.length === correctAnswer.length && 
              userAnswer.every(answer => correctAnswer.includes(answer)) &&
              correctAnswer.every(answer => userAnswer.includes(answer));
            
            if (isCorrect) {
              earnedPoints += question.points;
            }
          }
        } else if (question.type === 'true_false') {
          // Simple equality check for single selection
          if (userAnswer === correctAnswer) {
            earnedPoints += question.points;
          }
        } else if (question.type === 'fill_blank') {
          // Case insensitive comparison for text input
          if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
            if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
              earnedPoints += question.points;
            }
          }
        }
      }
    });
    
    const finalScore = Math.round((earnedPoints / totalPoints) * 100);
    setScore(finalScore);
    
    // Check if passed
    const hasPassed = finalScore >= assessment.passingScore;
    setPassed(hasPassed);
    
    // Display results
    setShowResults(true);
    setIsSubmitting(false);
    
    // Notify parent component of completion
    onComplete(hasPassed, finalScore);
  };
  
  const isQuestionAnswered = (questionId: string) => {
    const answer = userAnswers[questionId];
    
    if (answer === undefined) return false;
    
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    
    return answer !== '';
  };
  
  const allQuestionsAnswered = questions.every(q => isQuestionAnswered(q.id));
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const renderQuestion = () => {
    if (!currentQuestion) return null;
    
    const questionId = currentQuestion.id;
    
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend">{currentQuestion.text}</FormLabel>
            <Box sx={{ mt: 2 }}>
              {(currentQuestion.options || []).map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox 
                      checked={Array.isArray(userAnswers[questionId]) && 
                        (userAnswers[questionId] as number[])?.includes(index)}
                      onChange={() => handleCheckboxChange(questionId, index)}
                    />
                  }
                  label={option}
                />
              ))}
            </Box>
          </FormControl>
        );
      
      case 'true_false':
        return (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend">{currentQuestion.text}</FormLabel>
            <RadioGroup
              value={userAnswers[questionId] !== undefined ? userAnswers[questionId] : ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            >
              {(currentQuestion.options || []).map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      
      case 'fill_blank':
        return (
          <Box sx={{ width: '100%' }}>
            <FormLabel component="legend">{currentQuestion.text}</FormLabel>
            <TextField
              fullWidth
              margin="normal"
              value={userAnswers[questionId] || ''}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            />
          </Box>
        );
      
      default:
        return (
          <Typography color="error">
            Unsupported question type
          </Typography>
        );
    }
  };
  
  const renderQuestionResult = (question: Question, index: number) => {
    const userAnswer = userAnswers[question.id];
    const correctAnswer = question.correctAnswer;
    let isCorrect = false;
    
    if (question.type === 'multiple_choice') {
      if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
        isCorrect = 
          userAnswer.length === correctAnswer.length && 
          userAnswer.every(answer => correctAnswer.includes(answer)) &&
          correctAnswer.every(answer => userAnswer.includes(answer));
      }
    } else if (question.type === 'true_false') {
      isCorrect = userAnswer === correctAnswer;
    } else if (question.type === 'fill_blank') {
      if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
        isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      }
    }
    
    const formatAnswer = (answer: any, questionType: string, options?: string[]) => {
      if (questionType === 'multiple_choice') {
        if (Array.isArray(answer) && options) {
          return answer.map(idx => options[idx]).join(', ');
        }
      } else if (questionType === 'true_false' || questionType === 'single_choice') {
        if (options && typeof answer === 'number') {
          return options[answer];
        }
      } else if (questionType === 'fill_blank') {
        return answer;
      }
      
      return String(answer);
    };
    
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: isCorrect ? 'success.main' : 'error.main'
            }}
          >
            {index + 1}. {question.text}
            {isCorrect ? (
              <CheckCircleIcon color="success" sx={{ ml: 1 }} />
            ) : (
              <span style={{ color: theme.palette.error.main, marginLeft: '8px' }}>✗</span>
            )}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Your answer: {formatAnswer(userAnswer, question.type, question.options)}
            </Typography>
            
            {!isCorrect && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                Correct answer: {formatAnswer(correctAnswer, question.type, question.options)}
              </Typography>
            )}
            
            {question.explanation && (
              <Typography variant="body2" sx={{ mt: 2, bgcolor: 'background.default', p: 1, borderRadius: 1 }}>
                <strong>Explanation:</strong> {question.explanation}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  if (showResults) {
    return (
      <Box>
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" gutterBottom>
            Assessment Results
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h3" color={passed ? 'success.main' : 'error.main'}>
              {score}%
            </Typography>
            <Typography variant="body1" sx={{ ml: 2 }}>
              Passing score: {assessment.passingScore}%
            </Typography>
          </Box>
          
          <Alert severity={passed ? "success" : "error"} sx={{ mb: 3 }}>
            <AlertTitle>{passed ? "Congratulations!" : "Not Passed"}</AlertTitle>
            {passed 
              ? "You have successfully completed this assessment." 
              : `You did not meet the passing score of ${assessment.passingScore}%.`}
          </Alert>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Question Review
          </Typography>
          
          {questions.map((question, index) => renderQuestionResult(question, index))}
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {!passed && (
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => {
                setShowResults(false);
                setCurrentQuestionIndex(0);
              }}
              startIcon={<ArrowBackIcon />}
            >
              Try Again
            </Button>
          )}
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => onComplete(passed, score)}
          >
            {passed ? 'Continue' : 'Return to Course'}
          </Button>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {assessment.title || 'Assessment'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {assessment.type === 'quiz' ? 'Knowledge Check' : 'Practical Assessment'}
            </Typography>
          </Box>
          
          {timeRemaining !== null && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: timeRemaining < 300 ? 'error.main' : 'primary.main',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 1
            }}>
              <TimerIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                Time Remaining: {formatTime(timeRemaining)}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <LinearProgress 
          variant="determinate" 
          value={(currentQuestionIndex / questions.length) * 100} 
          sx={{ mb: 3, height: 8, borderRadius: 5 }}
        />
        
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>
        
        <Box sx={{ minHeight: '200px' }}>
          {renderQuestion()}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            startIcon={<ArrowBackIcon />}
          >
            Previous
          </Button>
          
          <Box>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!isQuestionAnswered(currentQuestion.id)}
                endIcon={<ArrowForwardIcon />}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Submitting...
                  </>
                ) : (
                  'Submit Assessment'
                )}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Grid container spacing={2}>
        {questions.map((q, index) => (
          <Grid item key={q.id}>
            <Button
              variant={index === currentQuestionIndex ? 'contained' : 'outlined'}
              color={isQuestionAnswered(q.id) ? 'primary' : 'inherit'}
              onClick={() => setCurrentQuestionIndex(index)}
              sx={{ minWidth: 40, height: 40, p: 0 }}
            >
              {index + 1}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AssessmentEngine;
