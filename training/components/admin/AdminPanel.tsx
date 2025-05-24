import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import { mockCourses, mockUserProgress, mockCertifications } from '../../services/mockData';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenDialog = (course: any = null) => {
    setCurrentCourse(course);
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentCourse(null);
  };
  
  const handleSaveCourse = () => {
    // In a real app, this would save the course data
    handleCloseDialog();
  };
  
  // Calculate summary statistics
  const totalUsers = 10; // Mock value for demo
  const totalCourses = mockCourses.length;
  const totalCompletions = mockUserProgress.filter(p => p.completedAt).length;
  const avgCompletionRate = Math.round((totalCompletions / (totalUsers * totalCourses)) * 100);
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Training Administration
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin tabs"
        >
          <Tab label="Dashboard" id="admin-tab-0" />
          <Tab label="Course Management" id="admin-tab-1" />
          <Tab label="User Progress" id="admin-tab-2" />
          <Tab label="Certifications" id="admin-tab-3" />
        </Tabs>
        
        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Courses
                  </Typography>
                  <Typography variant="h3">
                    {totalCourses}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h3">
                    {totalUsers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Course Completions
                  </Typography>
                  <Typography variant="h3">
                    {totalCompletions}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant="h3">
                    {avgCompletionRate}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Course Engagement
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChartIcon sx={{ fontSize: 100, color: 'action.disabled' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      Course engagement chart would appear here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User Distribution by Role
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PersonIcon sx={{ fontSize: 100, color: 'action.disabled' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      User distribution chart would appear here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Course Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create New Course
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Target Roles</TableCell>
                  <TableCell>Modules</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>
                      <Chip 
                        label={course.difficulty} 
                        size="small"
                        color={
                          course.difficulty === 'beginner' ? 'success' :
                          course.difficulty === 'intermediate' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {course.targetRoles.map(role => (
                          <Chip key={role} label={role} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>{course.modules.length}</TableCell>
                    <TableCell>{course.duration} min</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenDialog(course)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {/* User Progress Tab */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Completed</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockUserProgress.map((progress, index) => {
                  const course = mockCourses.find(c => c.id === progress.courseId);
                  return (
                    <TableRow key={index}>
                      <TableCell>User-{progress.userId}</TableCell>
                      <TableCell>{course?.title || progress.courseId}</TableCell>
                      <TableCell>{new Date(progress.startedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {progress.completedAt 
                          ? new Date(progress.completedAt).toLocaleDateString() 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {progress.completedAt 
                          ? '100%' 
                          : `${Math.round(
                              (progress.moduleProgress.filter(m => m.status === 'completed').length / 
                              (course?.modules.length || 1)) * 100
                            )}%`}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={progress.completedAt ? 'Completed' : 'In Progress'} 
                          color={progress.completedAt ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {/* Certifications Tab */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Certificate ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Issued Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockCertifications.map((cert) => {
                  const course = mockCourses.find(c => c.id === cert.courseId);
                  return (
                    <TableRow key={cert.id}>
                      <TableCell>{cert.verificationCode}</TableCell>
                      <TableCell>User-{cert.userId}</TableCell>
                      <TableCell>{cert.title}</TableCell>
                      <TableCell>{course?.title || cert.courseId}</TableCell>
                      <TableCell>{new Date(cert.issuedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          size="small"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
      
      {/* Course Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentCourse ? `Edit Course: ${currentCourse.title}` : 'Create New Course'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Course Title"
                fullWidth
                value={currentCourse?.title || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={currentCourse?.description || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Difficulty"
                select
                fullWidth
                value={currentCourse?.difficulty || 'beginner'}
                SelectProps={{
                  native: true
                }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration (minutes)"
                fullWidth
                type="number"
                value={currentCourse?.duration || 60}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Modules
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {currentCourse?.modules?.map((module: any, index: number) => (
                  <Card key={module.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {module.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {module.lessons.length} lessons
                        {module.assessment ? ', 1 assessment' : ''}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Edit</Button>
                      <Button size="small" color="error">Delete</Button>
                    </CardActions>
                  </Card>
                ))}
                
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                >
                  Add Module
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCourse} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
