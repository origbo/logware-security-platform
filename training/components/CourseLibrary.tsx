import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  Typography, 
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Stack,
  Button,
  Divider,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { mockCourses } from '../services/mockData';
import { Course, DifficultyLevel, UserRole } from '../models/types';

interface CourseLibraryProps {
  onCourseSelect: (courseId: string) => void;
  userRole: UserRole;
}

export const CourseLibrary: React.FC<CourseLibraryProps> = ({ 
  onCourseSelect,
  userRole 
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  
  // Extract all unique tags from courses
  const allTags = Array.from(
    new Set(mockCourses.flatMap(course => course.tags))
  );

  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = mockCourses.filter(course => 
      // Filter by role
      course.targetRoles.includes(userRole)
    );
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(term) || 
        course.description.toLowerCase().includes(term)
      );
    }
    
    // Apply difficulty filter
    if (selectedDifficulty.length > 0) {
      filtered = filtered.filter(course => 
        selectedDifficulty.includes(course.difficulty)
      );
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(course => 
        course.tags.some(tag => selectedTags.includes(tag))
      );
    }
    
    setFilteredCourses(filtered);
  }, [searchTerm, selectedDifficulty, selectedTags, userRole]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleDifficultyChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedDifficulty(typeof value === 'string' ? value.split(',') : value);
  };
  
  const handleTagChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedTags(typeof value === 'string' ? value.split(',') : value);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty([]);
    setSelectedTags([]);
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Course Library
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Courses"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="difficulty-filter-label">Difficulty</InputLabel>
              <Select
                labelId="difficulty-filter-label"
                id="difficulty-filter"
                multiple
                value={selectedDifficulty}
                onChange={handleDifficultyChange}
                input={<OutlinedInput label="Difficulty" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size="small"
                        color={
                          value === 'beginner' ? 'success' :
                          value === 'intermediate' ? 'warning' : 'error'
                        }
                      />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="tag-filter-label">Tags</InputLabel>
              <Select
                labelId="tag-filter-label"
                id="tag-filter"
                multiple
                value={selectedTags}
                onChange={handleTagChange}
                input={<OutlinedInput label="Tags" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {allTags.map(tag => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={clearFilters}
              fullWidth
              sx={{ height: '56px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ mb: 4 }} />
      
      {filteredCourses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No courses match your filters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCourses.map(course => (
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
                    
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {course.duration} minutes
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Modules: {course.modules.length}
                      </Typography>
                    </Stack>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
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
                      {course.tags.length > 2 && (
                        <Chip 
                          label={`+${course.tags.length - 2}`} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={() => onCourseSelect(course.id)}
                  >
                    View Course
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CourseLibrary;
