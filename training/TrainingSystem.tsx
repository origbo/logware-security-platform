import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TrainingDashboard } from './components/TrainingDashboard';
import { CourseLibrary } from './components/CourseLibrary';
import { CourseViewer } from './components/CourseViewer';
import { AdminPanel } from './components/admin/AdminPanel';
import { UserRole } from './models/types';

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
      id={`training-tabpanel-${index}`}
      aria-labelledby={`training-tab-${index}`}
      {...other}
      style={{ height: 'calc(100vh - 112px)', overflow: 'auto' }}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const TrainingSystem: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('analyst'); // Would come from auth context in real app

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    // Reset selected course when changing tabs
    if (newValue !== 2) {
      setSelectedCourseId(null);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setTabValue(2); // Switch to course viewer tab
  };

  const isAdmin = userRole === 'administrator';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} sx={{ height: '100vh', p: 0 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 0
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="h4" component="h1" sx={{ px: 3, pt: 3, pb: 2 }}>
              Logware Security Training
            </Typography>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="training navigation tabs"
              sx={{ px: 3 }}
            >
              <Tab label="Dashboard" id="training-tab-0" aria-controls="training-tabpanel-0" />
              <Tab label="Course Library" id="training-tab-1" aria-controls="training-tabpanel-1" />
              {selectedCourseId && (
                <Tab label="Current Course" id="training-tab-2" aria-controls="training-tabpanel-2" />
              )}
              {isAdmin && (
                <Tab label="Admin" id="training-tab-3" aria-controls="training-tabpanel-3" />
              )}
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <TrainingDashboard onCourseSelect={handleCourseSelect} userRole={userRole} />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <CourseLibrary onCourseSelect={handleCourseSelect} userRole={userRole} />
          </TabPanel>
          
          {selectedCourseId && (
            <TabPanel value={tabValue} index={2}>
              <CourseViewer courseId={selectedCourseId} />
            </TabPanel>
          )}
          
          {isAdmin && (
            <TabPanel value={tabValue} index={isAdmin && selectedCourseId ? 3 : 2}>
              <AdminPanel />
            </TabPanel>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default TrainingSystem;
