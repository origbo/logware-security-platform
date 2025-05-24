import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel,
  StepContent,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  LinearProgress,
  Chip,
  useTheme
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import SchoolIcon from '@mui/icons-material/School';
import { mockCourses, mockUserProgress } from '../services/mockData';
import { Course, Module, Lesson, ProgressStatus, Assessment } from '../models/types';
import { LessonPlayer } from './lessons/LessonPlayer';
import { AssessmentEngine } from './assessments/AssessmentEngine';

interface CourseViewerProps {
  courseId: string;
}

export const CourseViewer: React.FC<CourseViewerProps> = ({ courseId }) => {
  const theme = useTheme();
  const [course, setCourse] = useState<Course | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch course data - in a real app, this would be an API call
    setIsLoading(true);
    const selectedCourse = mockCourses.find(c => c.id === courseId);
    if (selectedCourse) {
      setCourse(selectedCourse);
      
      // Fetch user progress for this course
      const progress = mockUserProgress.find(p => 
        p.userId === 'current-user' && p.courseId === courseId
      );
      setUserProgress(progress);
      
      // Determine which module/lesson to show based on progress
      if (progress) {
        const incompleteModule = progress.moduleProgress.findIndex(
          mp => mp.status !== 'completed'
        );
        
        if (incompleteModule !== -1) {
          setActiveModuleIndex(incompleteModule);
          
          const incompleteLessonIndex = progress.moduleProgress[incompleteModule].lessonProgress.findIndex(
            lp => lp.status !== 'completed'
          );
          
          if (incompleteLessonIndex !== -1) {
            setActiveLessonIndex(incompleteLessonIndex);
          } else {
            setActiveLessonIndex(0);
            setShowAssessment(true);
          }
        }
      }
    }
    setIsLoading(false);
  }, [courseId]);
  
  const handleLessonComplete = () => {
    // In a real app, this would update the backend
    if (!course) return;
    
    // Mark current lesson as completed
    const updatedProgress = { ...userProgress };
    if (!updatedProgress.moduleProgress[activeModuleIndex]) {
      updatedProgress.moduleProgress[activeModuleIndex] = {
        moduleId: course.modules[activeModuleIndex].id,
        status: 'in_progress' as ProgressStatus,
        lessonProgress: []
      };
    }
    
    if (!updatedProgress.moduleProgress[activeModuleIndex].lessonProgress[activeLessonIndex]) {
      updatedProgress.moduleProgress[activeModuleIndex].lessonProgress[activeLessonIndex] = {
        lessonId: course.modules[activeModuleIndex].lessons[activeLessonIndex].id,
        status: 'completed' as ProgressStatus,
        lastAccessedAt: new Date().toISOString()
      };
    } else {
      updatedProgress.moduleProgress[activeModuleIndex].lessonProgress[activeLessonIndex].status = 'completed';
      updatedProgress.moduleProgress[activeModuleIndex].lessonProgress[activeLessonIndex].lastAccessedAt = new Date().toISOString();
    }
    
    setUserProgress(updatedProgress);
    
    // Determine next lesson or show assessment
    if (activeLessonIndex < course.modules[activeModuleIndex].lessons.length - 1) {
      // Move to next lesson
      setActiveLessonIndex(activeLessonIndex + 1);
      setShowAssessment(false);
    } else if (course.modules[activeModuleIndex].assessment) {
      // Show module assessment
      setShowAssessment(true);
    } else if (activeModuleIndex < course.modules.length - 1) {
      // Move to next module
      setActiveModuleIndex(activeModuleIndex + 1);
      setActiveLessonIndex(0);
      setShowAssessment(false);
    }
  };
  
  const handleAssessmentComplete = (passed: boolean, score: number) => {
    if (!course || !userProgress) return;
    
    // Update assessment result
    const updatedProgress = { ...userProgress };
    if (!updatedProgress.moduleProgress[activeModuleIndex].assessmentResult) {
      updatedProgress.moduleProgress[activeModuleIndex].assessmentResult = {
        score,
        passed,
        attempts: 1,
        lastAttemptAt: new Date().toISOString()
      };
    } else {
      updatedProgress.moduleProgress[activeModuleIndex].assessmentResult.score = score;
      updatedProgress.moduleProgress[activeModuleIndex].assessmentResult.passed = passed;
      updatedProgress.moduleProgress[activeModuleIndex].assessmentResult.attempts += 1;
      updatedProgress.moduleProgress[activeModuleIndex].assessmentResult.lastAttemptAt = new Date().toISOString();
    }
    
    if (passed) {
      // Mark module as completed
      updatedProgress.moduleProgress[activeModuleIndex].status = 'completed';
      
      // Move to next module if available
      if (activeModuleIndex < (course?.modules.length || 0) - 1) {
        setActiveModuleIndex(activeModuleIndex + 1);
        setActiveLessonIndex(0);
        setShowAssessment(false);
      } else {
        // Course completed
        updatedProgress.completedAt = new Date().toISOString();
      }
    }
    
    setUserProgress(updatedProgress);
  };
  
  const getLessonStatus = (moduleIndex: number, lessonIndex: number): ProgressStatus => {
    if (!userProgress || !userProgress.moduleProgress[moduleIndex]) return 'not_started';
    
    const lessonProgress = userProgress.moduleProgress[moduleIndex].lessonProgress[lessonIndex];
    return lessonProgress ? lessonProgress.status : 'not_started';
  };
  
  const getModuleStatus = (moduleIndex: number): ProgressStatus => {
    if (!userProgress || !userProgress.moduleProgress[moduleIndex]) return 'not_started';
    return userProgress.moduleProgress[moduleIndex].status;
  };
  
  const getModuleCompletionPercentage = (moduleIndex: number): number => {
    if (!userProgress || !course || !userProgress.moduleProgress[moduleIndex]) return 0;
    
    const module = course.modules[moduleIndex];
    const moduleProgress = userProgress.moduleProgress[moduleIndex];
    
    const completedLessons = moduleProgress.lessonProgress.filter(
      lp => lp.status === 'completed'
    ).length;
    
    return Math.round((completedLessons / module.lessons.length) * 100);
  };
  
  const getCurrentLesson = () => {
    if (!course) return null;
    return course.modules[activeModuleIndex]?.lessons[activeLessonIndex];
  };
  
  const getCurrentAssessment = () => {
    if (!course) return null;
    return course.modules[activeModuleIndex]?.assessment;
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!course) {
    return (
      <Box>
        <Typography variant="h5" color="error">
          Course not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {course.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {course.description}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Chip 
            label={course.difficulty} 
            color={
              course.difficulty === 'beginner' ? 'success' :
              course.difficulty === 'intermediate' ? 'warning' : 'error'
            }
          />
          {course.tags.map(tag => (
            <Chip key={tag} label={tag} variant="outlined" />
          ))}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} lg={3}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Course Progress
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={userProgress?.completedAt ? 100 : getModuleCompletionPercentage(activeModuleIndex)} 
              sx={{ height: 8, borderRadius: 5, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {userProgress?.completedAt 
                ? 'Course completed' 
                : `${getModuleCompletionPercentage(activeModuleIndex)}% of current module`}
            </Typography>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 0, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
              Course Content
            </Typography>
            
            <Stepper activeStep={activeModuleIndex} orientation="vertical" sx={{ pl: 2 }}>
              {course.modules.map((module, moduleIndex) => (
                <Step key={module.id} completed={getModuleStatus(moduleIndex) === 'completed'}>
                  <StepLabel>
                    <Typography variant="subtitle1">
                      {module.title}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <List dense disablePadding>
                      {module.lessons.map((lesson, lessonIndex) => {
                        const lessonStatus = getLessonStatus(moduleIndex, lessonIndex);
                        return (
                          <ListItem 
                            key={lesson.id}
                            button
                            onClick={() => {
                              if (moduleIndex === activeModuleIndex) {
                                setActiveLessonIndex(lessonIndex);
                                setShowAssessment(false);
                              }
                            }}
                            selected={moduleIndex === activeModuleIndex && lessonIndex === activeLessonIndex && !showAssessment}
                            sx={{
                              borderLeft: lessonStatus === 'completed' 
                                ? `2px solid ${theme.palette.success.main}`
                                : (lessonStatus === 'in_progress' 
                                  ? `2px solid ${theme.palette.warning.main}`
                                  : 'none'
                                )
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {lesson.type === 'video' && <PlayCircleOutlineIcon fontSize="small" />}
                              {lesson.type === 'text' && <DescriptionIcon fontSize="small" />}
                              {lesson.type === 'interactive' && <CodeIcon fontSize="small" />}
                              {lesson.type === 'lab' && <SchoolIcon fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText 
                              primary={lesson.title} 
                              secondary={`${lesson.duration} min`}
                            />
                            {lessonStatus === 'completed' && (
                              <CheckCircleIcon fontSize="small" color="success" />
                            )}
                          </ListItem>
                        );
                      })}
                      
                      {module.assessment && (
                        <ListItem 
                          button
                          onClick={() => {
                            if (moduleIndex === activeModuleIndex) {
                              setShowAssessment(true);
                            }
                          }}
                          selected={moduleIndex === activeModuleIndex && showAssessment}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <SchoolIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={module.assessment.title || 'Module Assessment'} 
                          />
                          {userProgress?.moduleProgress[moduleIndex]?.assessmentResult?.passed && (
                            <CheckCircleIcon fontSize="small" color="success" />
                          )}
                        </ListItem>
                      )}
                    </List>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8} lg={9}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 500 }}>
            {!showAssessment ? (
              <LessonPlayer 
                lesson={getCurrentLesson()} 
                onComplete={handleLessonComplete}
              />
            ) : (
              <AssessmentEngine 
                assessment={getCurrentAssessment()}
                onComplete={handleAssessmentComplete}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseViewer;
