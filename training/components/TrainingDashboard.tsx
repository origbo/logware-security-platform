// Using dynamic imports to avoid TypeScript module resolution errors
import React, { useState, useEffect } from 'react';

// Workaround to prevent TypeScript errors
// @ts-ignore
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Paper,
  useTheme
} from '@mui/material';

// @ts-ignore
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
// @ts-ignore
import AccessTimeIcon from '@mui/icons-material/AccessTime';
// @ts-ignore
import SchoolIcon from '@mui/icons-material/School';
import { Course, UserRole } from '../models/types';
import { mockCourses, mockUserProgress } from '../services/mockData';

interface TrainingDashboardProps {
  onCourseSelect: (courseId: string) => void;
  userRole: UserRole;
}

export const TrainingDashboard: React.FC<TrainingDashboardProps> = ({ 
  onCourseSelect,
  userRole
}) => {
  const theme = useTheme();
  const [inProgressCourses, setInProgressCourses] = useState<Course[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    const userProgress = mockUserProgress.filter(progress => 
      progress.userId === 'current-user'
    );
    
    const inProgress = mockCourses.filter(course => 
      userProgress.some(progress => 
        progress.courseId === course.id && 
        !progress.completedAt
      )
    );
    
    const completed = mockCourses.filter(course => 
      userProgress.some(progress => 
        progress.courseId === course.id && 
        progress.completedAt
      )
    );
    
    // Filter recommended courses based on user role
    const recommended = mockCourses.filter(course => 
      course.targetRoles.includes(userRole) && 
      !inProgress.some(c => c.id === course.id) &&
      !completed.some(c => c.id === course.id)
    ).slice(0, 3);
    
    setInProgressCourses(inProgress);
    setCompletedCourses(completed);
    setRecommendedCourses(recommended);
  }, [userRole]);
  
  const calculateProgress = (courseId: string) => {
    const progress = mockUserProgress.find(p => 
      p.userId === 'current-user' && p.courseId === courseId
    );
    
    if (!progress) return 0;
    
    const completedLessons = progress.moduleProgress.reduce((total, module) => {
      return total + module.lessonProgress.filter(lesson => 
        lesson.status === 'completed'
      ).length;
    }, 0);
    
    const totalLessons = mockCourses.find(c => c.id === courseId)?.modules.reduce((total, module) => {
      return total + module.lessons.length;
    }, 0) || 1;
    
    return Math.round((completedLessons / totalLessons) * 100);
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Learning Dashboard
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="primary">
                {inProgressCourses.length}
              </Typography>
              <Typography variant="subtitle1">
                Courses in Progress
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="success.main">
                {completedCourses.length}
              </Typography>
              <Typography variant="subtitle1">
                Completed Courses
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color="info.main">
                {mockCourses.filter(course => course.targetRoles.includes(userRole)).length}
              </Typography>
              <Typography variant="subtitle1">
                Available for Your Role
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {inProgressCourses.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Continue Learning
          </Typography>
          <Grid container spacing={3}>
            {inProgressCourses.map(course => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea onClick={() => onCourseSelect(course.id)}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={course.thumbnail}
                      alt={course.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {course.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {course.duration} minutes
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={calculateProgress(course.id)} 
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {calculateProgress(course.id)}% complete
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      startIcon={<PlayCircleOutlineIcon />}
                      onClick={() => onCourseSelect(course.id)}
                    >
                      Resume
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Recommended for You
        </Typography>
        <Grid container spacing={3}>
          {recommendedCourses.map(course => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea onClick={() => onCourseSelect(course.id)}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={course.thumbnail}
                    alt={course.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {course.description.substring(0, 120)}...
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {course.duration} minutes
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      <Chip 
                        label={course.difficulty} 
                        size="small"
                        color={
                          course.difficulty === 'beginner' ? 'success' :
                          course.difficulty === 'intermediate' ? 'warning' : 'error'
                        }
                      />
                      {course.tags.slice(0, 2).map(tag => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    startIcon={<SchoolIcon />}
                    onClick={() => onCourseSelect(course.id)}
                  >
                    Start Learning
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {completedCourses.length > 0 && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Completed Courses
          </Typography>
          <Grid container spacing={3}>
            {completedCourses.slice(0, 3).map(course => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea onClick={() => onCourseSelect(course.id)}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={course.thumbnail}
                      alt={course.title}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {course.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {course.duration} minutes
                        </Typography>
                      </Box>
                      <Chip 
                        label="Completed" 
                        color="success" 
                        size="small" 
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </CardActionArea>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      fullWidth
                      onClick={() => onCourseSelect(course.id)}
                    >
                      Review
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default TrainingDashboard;
