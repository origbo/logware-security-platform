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
  CardActions,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  AlertTitle,
  IconButton
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Lesson } from '../../models/types';

interface InteractiveLessonPlayerProps {
  lesson: Lesson;
  onComplete: () => void;
}

// Mock interactive scenario data
const mockScenario = {
  id: 'scenario-1',
  title: 'Phishing Detection Exercise',
  description: 'Analyze the following email and identify phishing indicators.',
  steps: [
    {
      id: 'step-1',
      title: 'Review the Email',
      content: `From: security@bankofamerica-securityalert.com
Subject: Urgent: Your Account Has Been Limited
      
Dear Valued Customer,

We have detected unusual activity on your account. Your account has been limited for security purposes. To restore full access to your account, please verify your identity by clicking the link below and following the instructions.

[Verify Account Now]

If you do not verify your account within 24 hours, your account will be permanently suspended.

Thank you,
Bank of America Security Team`,
      instruction: 'Review the email above. What elements make this a suspicious phishing attempt?',
      interaction: {
        type: 'multiple_choice',
        options: [
          'The email is from Bank of America',
          'The sender domain is suspicious (bankofamerica-securityalert.com)',
          'The email has proper grammar and spelling',
          'The email creates a sense of urgency'
        ],
        correctAnswers: [1, 3],
        explanation: 'The sender domain is not the official Bank of America domain, and the email creates a sense of urgency to pressure the recipient into taking immediate action without thinking.'
      }
    },
    {
      id: 'step-2',
      title: 'Analyze the URL',
      content: `When hovering over the "Verify Account Now" link, you see this URL:
http://bankofamerica-secure.validation-portal.com/verify.php?token=12345`,
      instruction: 'What are the indicators that this URL is malicious?',
      interaction: {
        type: 'checkbox',
        options: [
          'It uses HTTPS',
          'The domain is not the official Bank of America domain',
          'It includes random parameters',
          'It uses a subdomain structure to appear legitimate'
        ],
        correctAnswers: [1, 3],
        explanation: 'The URL uses a deceptive domain that\'s not the official Bank of America website, and it employs a subdomain structure to appear legitimate. A real Bank of America URL would be on the bankofamerica.com domain.'
      }
    },
    {
      id: 'step-3',
      title: 'Proper Response',
      content: 'You\'ve identified this as a phishing attempt. What would be the appropriate response?',
      instruction: 'Select the most appropriate action to take:',
      interaction: {
        type: 'single_choice',
        options: [
          'Click the link but don\'t enter any information',
          'Reply to the email asking for verification',
          'Call the number in the email',
          'Do not click any links and report the email as phishing'
        ],
        correctAnswers: [3],
        explanation: 'The correct action is to avoid clicking any links in suspected phishing emails and report it to your IT security team or the organization being impersonated through official channels.'
      }
    }
  ]
};

const InteractiveLessonPlayer: React.FC<InteractiveLessonPlayerProps> = ({ lesson, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: number[] | number}>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // In a real app, this would come from the lesson content
  const scenario = mockScenario;
  const steps = scenario.steps;
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
    setShowFeedback(false);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setShowFeedback(false);
  };
  
  const handleOptionChange = (
    stepId: string, 
    value: string | number, 
    isMultiple: boolean = false
  ) => {
    if (isMultiple) {
      // For checkbox type interactions
      setSelectedOptions(prev => {
        const prevSelected = prev[stepId] as number[] || [];
        const valueNum = Number(value);
        
        if (prevSelected.includes(valueNum)) {
          return { 
            ...prev, 
            [stepId]: prevSelected.filter(item => item !== valueNum) 
          };
        } else {
          return { 
            ...prev, 
            [stepId]: [...prevSelected, valueNum] 
          };
        }
      });
    } else {
      // For radio button type interactions
      setSelectedOptions(prev => ({ 
        ...prev, 
        [stepId]: Number(value) 
      }));
    }
  };
  
  const checkAnswer = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;
    
    const userAnswers = selectedOptions[stepId];
    const correctAnswers = step.interaction.correctAnswers;
    
    let correct = false;
    
    if (Array.isArray(userAnswers) && Array.isArray(correctAnswers)) {
      // For multiple choice/checkbox
      const allCorrect = correctAnswers.every(answer => userAnswers.includes(answer));
      const noExtras = userAnswers.every(answer => correctAnswers.includes(answer));
      correct = allCorrect && noExtras;
    } else {
      // For single choice
      correct = userAnswers === correctAnswers;
    }
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct && !completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };
  
  const resetStep = (stepId: string) => {
    setSelectedOptions(prev => ({ ...prev, [stepId]: [] }));
    setShowFeedback(false);
    setCompletedSteps(prev => prev.filter(id => id !== stepId));
  };
  
  const isStepComplete = (stepId: string) => completedSteps.includes(stepId);
  
  const areAllStepsComplete = steps.every(step => completedSteps.includes(step.id));
  
  const currentStep = steps[activeStep];
  
  const renderInteraction = () => {
    if (!currentStep.interaction) return null;
    
    const { type, options } = currentStep.interaction;
    const stepId = currentStep.id;
    
    if (type === 'multiple_choice' || type === 'checkbox') {
      return (
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel component="legend">{currentStep.instruction}</FormLabel>
          <Box sx={{ mt: 1 }}>
            {options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox 
                    checked={Array.isArray(selectedOptions[stepId]) && 
                      (selectedOptions[stepId] as number[]).includes(index)}
                    onChange={(e) => handleOptionChange(stepId, index, true)}
                    disabled={showFeedback}
                  />
                }
                label={option}
              />
            ))}
          </Box>
        </FormControl>
      );
    }
    
    if (type === 'single_choice') {
      return (
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel component="legend">{currentStep.instruction}</FormLabel>
          <RadioGroup
            value={selectedOptions[stepId] !== undefined ? selectedOptions[stepId] : ''}
            onChange={(e) => handleOptionChange(stepId, e.target.value)}
          >
            {options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio disabled={showFeedback} />}
                label={option}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );
    }
    
    return null;
  };
  
  return (
    <Box>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}
      >
        <Typography variant="h6" gutterBottom>
          {scenario.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {scenario.description}
        </Typography>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.id} completed={isStepComplete(step.id)}>
              <StepLabel>
                <Typography variant="subtitle1">
                  {step.title}
                </Typography>
              </StepLabel>
              <StepContent>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {step.content}
                    </Typography>
                  </CardContent>
                </Card>
                
                {renderInteraction()}
                
                {showFeedback && (
                  <Alert 
                    severity={isCorrect ? "success" : "error"}
                    sx={{ mt: 2 }}
                  >
                    <AlertTitle>{isCorrect ? "Correct!" : "Try again"}</AlertTitle>
                    {currentStep.interaction.explanation}
                  </Alert>
                )}
                
                <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Back
                    </Button>
                    
                    {!showFeedback ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => checkAnswer(step.id)}
                        disabled={
                          !selectedOptions[step.id] || 
                          (Array.isArray(selectedOptions[step.id]) && 
                            (selectedOptions[step.id] as number[]).length === 0)
                        }
                      >
                        Check Answer
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<ReplayIcon />}
                        onClick={() => resetStep(step.id)}
                        sx={{ mr: 1 }}
                      >
                        Try Again
                      </Button>
                    )}
                  </Box>
                  
                  {isStepComplete(step.id) && (
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleNext}
                      disabled={index === steps.length - 1}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary"
          disabled={!areAllStepsComplete}
          onClick={onComplete}
          endIcon={<CheckCircleIcon />}
        >
          {areAllStepsComplete ? 'Complete Exercise' : 'Complete all steps to finish this lesson'}
        </Button>
      </Box>
    </Box>
  );
};

// Missing imports need to be added
import { Checkbox } from '@mui/material';

export default InteractiveLessonPlayer;
