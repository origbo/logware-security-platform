import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  IconButton,
  Divider,
  Alert,
  Tooltip,
  useTheme
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Lesson } from '../../models/types';

interface LabLessonPlayerProps {
  lesson: Lesson;
  onComplete: () => void;
}

// Mock lab data
const mockLab = {
  id: 'lab-1',
  title: 'Configuring SIEM Rules for Detection',
  description: 'In this lab, you will learn how to create effective detection rules in a SIEM system.',
  environment: {
    type: 'simulated',
    url: 'https://lab.example.com/siem-sandbox'
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Create a Basic Detection Rule',
      instructions: `
1. Navigate to the Rules section in the SIEM interface
2. Click "Create New Rule"
3. Set the following parameters:
   - Rule Name: "Failed Login Detection"
   - Data Source: "Authentication Logs"
   - Condition: sourceEvent.eventType = "AUTH_FAILURE" AND sourceEvent.attemptCount > 3
   - Severity: Medium
4. Click Save Rule
      `,
      expectedOutput: `
Rule created successfully with ID: AUTH-RULE-001
Status: Enabled
      `,
      hints: [
        'Make sure to select "Authentication Logs" from the dropdown menu',
        'The condition syntax requires exact field names',
        'You need to set a threshold value for attemptCount'
      ],
      validation: {
        type: 'screenshot',
        criteria: 'Rule created successfully'
      }
    },
    {
      id: 'task-2',
      title: 'Test the Detection Rule',
      instructions: `
1. Go to the "Simulation" tab in the lab environment
2. Select "Authentication Scenario"
3. Click "Run Simulation"
4. Configure the following parameters:
   - Username: "testuser"
   - Failed Attempts: 5
   - Time Window: 10 minutes
5. Execute the simulation
6. Check the Alerts tab to verify your rule triggered
      `,
      expectedOutput: `
Alert generated:
- Title: Failed Login Detection
- User: testuser
- Attempts: 5
- Source IP: 192.168.1.100
      `,
      hints: [
        'The simulation may take a few moments to run',
        'You may need to refresh the Alerts tab',
        'Check that the Time Window is set correctly'
      ],
      validation: {
        type: 'alert_check',
        criteria: 'Alert exists with title "Failed Login Detection"'
      }
    }
  ]
};

const LabLessonPlayer: React.FC<LabLessonPlayerProps> = ({ lesson, onComplete }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [labOutput, setLabOutput] = useState('');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<{[key: string]: boolean}>({});
  const [labStarted, setLabStarted] = useState(false);
  
  // In a real app, this would come from the lesson content
  const lab = mockLab;
  const tasks = lab.tasks;
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const toggleHint = (taskId: string) => {
    setShowHint(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  const startLab = () => {
    setLabStarted(true);
    // In a real app, this would initialize the lab environment
    setLabOutput('Initializing lab environment...\n');
    
    setTimeout(() => {
      setLabOutput(prev => prev + 'SIEM sandbox environment ready.\nYou can now begin the lab tasks.\n');
    }, 2000);
  };
  
  const resetLab = () => {
    // In a real app, this would reset the lab environment
    setLabOutput('Resetting lab environment...\n');
    
    setTimeout(() => {
      setLabOutput(prev => prev + 'Lab environment reset complete.\nYou can restart the lab tasks.\n');
      setCompletedTasks([]);
    }, 1500);
  };
  
  const runTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // This simulates executing the lab task and validating results
    setLabOutput(prev => prev + `\nExecuting task: ${task.title}...\n`);
    
    // Simulate task execution with a delay
    setTimeout(() => {
      // In a real app, this would validate actual user actions
      setLabOutput(prev => prev + task.expectedOutput + '\n');
      
      // Mark task as completed
      if (!completedTasks.includes(taskId)) {
        setCompletedTasks(prev => [...prev, taskId]);
      }
      
      // Auto-advance to next task if not the last one
      if (activeStep < tasks.length - 1) {
        setTimeout(() => {
          handleNext();
        }, 1500);
      }
    }, 3000);
  };
  
  const isTaskComplete = (taskId: string) => completedTasks.includes(taskId);
  const areAllTasksComplete = tasks.every(task => completedTasks.includes(task.id));
  
  return (
    <Box>
      <Paper 
        elevation={0}
        sx={{ 
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="lab environment tabs"
          >
            <Tab label="Instructions" />
            <Tab label="Lab Environment" />
            <Tab label="Output" />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {/* Instructions Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {lab.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {lab.description}
              </Typography>
              
              <Stepper activeStep={activeStep} orientation="vertical">
                {tasks.map((task, index) => (
                  <Step key={task.id} completed={isTaskComplete(task.id)}>
                    <StepLabel>
                      <Typography variant="subtitle1">
                        {task.title}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {task.instructions}
                          </Typography>
                          
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Expected Output
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                whiteSpace: 'pre-wrap',
                                p: 1,
                                bgcolor: 'background.default',
                                borderRadius: 1
                              }}
                            >
                              {task.expectedOutput}
                            </Typography>
                          </Box>
                          
                          {showHint[task.id] && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Hints
                              </Typography>
                              <ul>
                                {task.hints.map((hint, i) => (
                                  <li key={i}>
                                    <Typography variant="body2">
                                      {hint}
                                    </Typography>
                                  </li>
                                ))}
                              </ul>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Button
                            disabled={index === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                          >
                            Back
                          </Button>
                          
                          <Tooltip title="Show Hints">
                            <IconButton 
                              onClick={() => toggleHint(task.id)}
                              color={showHint[task.id] ? 'primary' : 'default'}
                            >
                              <HelpOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        <Box>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => runTask(task.id)}
                            disabled={!labStarted || isTaskComplete(task.id)}
                            sx={{ mr: 1 }}
                          >
                            {isTaskComplete(task.id) ? 'Completed' : 'Run Task'}
                          </Button>
                          
                          {(isTaskComplete(task.id) && index < tasks.length - 1) && (
                            <Button
                              variant="outlined"
                              onClick={handleNext}
                            >
                              Next Task
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
          
          {/* Lab Environment Tab */}
          {tabValue === 1 && (
            <Box sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" gutterBottom>
                  SIEM Lab Environment
                </Typography>
                
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={startLab}
                    disabled={labStarted}
                    sx={{ mr: 1 }}
                  >
                    Start Lab
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={resetLab}
                    disabled={!labStarted}
                  >
                    Reset Lab
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {labStarted ? (
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    bgcolor: '#1e1e1e', 
                    color: 'white',
                    borderRadius: 1,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    SIEM Sandbox Interface
                  </Typography>
                  
                  {/* This would be replaced with an actual iframe or interactive component in a real app */}
                  <Box sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px dashed grey',
                    borderRadius: 1
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Interactive SIEM environment would be displayed here
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <InfoIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Lab Environment Not Started
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click the "Start Lab" button to initialize the environment
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          
          {/* Output Tab */}
          {tabValue === 2 && (
            <Box sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Lab Output
              </Typography>
              
              <TextField
                multiline
                fullWidth
                variant="outlined"
                value={labOutput}
                InputProps={{
                  readOnly: true,
                  sx: { 
                    fontFamily: 'monospace', 
                    bgcolor: 'background.paper',
                    height: '450px'
                  }
                }}
                sx={{ flexGrow: 1 }}
              />
            </Box>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary"
          disabled={!areAllTasksComplete}
          onClick={onComplete}
          endIcon={<CheckCircleIcon />}
        >
          {areAllTasksComplete ? 'Complete Lab' : 'Complete all tasks to finish this lab'}
        </Button>
        
        {!areAllTasksComplete && !labStarted && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            You need to start the lab and complete all tasks
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default LabLessonPlayer;
