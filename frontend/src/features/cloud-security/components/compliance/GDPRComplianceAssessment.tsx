import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  FormControlLabel,
  Checkbox,
  TextField,
  RadioGroup,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  useTheme,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CloudCircle as CloudCircleIcon,
  VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useRunGdprAssessmentMutation } from "../../../cloud-security/services/complianceService";
import {
  ComplianceStatus,
  CloudProvider,
} from "../../types/cloudSecurityTypes";

/**
 * GDPR Compliance Assessment Component
 * Provides an interactive assessment form for GDPR compliance
 */
const GDPRComplianceAssessment: React.FC = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCloud, setSelectedCloud] = useState<CloudProvider | "">("");
  const [accountId, setAccountId] = useState("");
  const [assessmentResponses, setAssessmentResponses] = useState<
    Record<string, string>
  >({});
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  // Run GDPR assessment mutation
  const [runAssessment, { isLoading, isError, error }] =
    useRunGdprAssessmentMutation();

  // Handle cloud provider selection
  const handleCloudChange = (event: SelectChangeEvent) => {
    setSelectedCloud(event.target.value as CloudProvider);
  };

  // Handle account ID input
  const handleAccountIdChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAccountId(event.target.value);
  };

  // Handle response change
  const handleResponseChange = (questionId: string, value: string) => {
    setAssessmentResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Handle next step
  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Submit assessment
      try {
        const result = await runAssessment({
          cloudProvider: selectedCloud as CloudProvider,
          accountId,
          responses: assessmentResponses,
        }).unwrap();

        setAssessmentResult(result);
      } catch (err) {
        console.error("Failed to run assessment:", err);
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle reset
  const handleReset = () => {
    setActiveStep(0);
    setSelectedCloud("");
    setAccountId("");
    setAssessmentResponses({});
    setAssessmentResult(null);
  };

  // Check if step is complete
  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return selectedCloud !== "" && accountId.trim() !== "";
      case 1:
        return dataProcessingQuestions.every((q) => assessmentResponses[q.id]);
      case 2:
        return dataSubjectQuestions.every((q) => assessmentResponses[q.id]);
      case 3:
        return securityQuestions.every((q) => assessmentResponses[q.id]);
      case 4:
        return breachQuestions.every((q) => assessmentResponses[q.id]);
      default:
        return false;
    }
  };

  // Define assessment steps
  const steps = [
    "Setup Assessment",
    "Data Processing Principles",
    "Data Subject Rights",
    "Security Measures",
    "Breach Notification",
  ];

  // Define assessment questions for each category
  const dataProcessingQuestions = [
    {
      id: "dp1",
      question: "Do you have a lawful basis for processing personal data?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "dp2",
      question:
        "Is personal data collected for specified, explicit and legitimate purposes?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "dp3",
      question: "Is data minimization practiced?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "dp4",
      question: "Do you ensure data accuracy and keep it up to date?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "dp5",
      question:
        "Is personal data kept in a form that permits identification for no longer than necessary?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
  ];

  const dataSubjectQuestions = [
    {
      id: "ds1",
      question:
        "Do you provide mechanisms for data subjects to access their personal data?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "ds2",
      question:
        "Can data subjects request rectification of inaccurate personal data?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "ds3",
      question:
        'Do you have a process for handling data erasure requests ("right to be forgotten")?',
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "ds4",
      question:
        "Do you have a mechanism for data subjects to object to processing?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
  ];

  const securityQuestions = [
    {
      id: "sec1",
      question:
        "Do you implement appropriate technical measures to ensure data security?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "sec2",
      question: "Do you use encryption for personal data?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "sec3",
      question: "Do you conduct regular security assessments?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "sec4",
      question: "Do you have access controls in place?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "sec5",
      question:
        "Do you have a process for regularly testing security measures?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
  ];

  const breachQuestions = [
    {
      id: "br1",
      question: "Do you have a data breach response plan?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "br2",
      question: "Are you able to detect data breaches in a timely manner?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "br3",
      question:
        "Can you notify the supervisory authority within 72 hours of a breach?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
    {
      id: "br4",
      question:
        "Do you have a process for notifying affected data subjects when necessary?",
      type: "radio",
      options: ["Yes", "Partially", "No", "Not Applicable"],
    },
  ];

  // Define question categories
  const questionCategories = [
    {
      step: 1,
      title: "Data Processing Principles",
      questions: dataProcessingQuestions,
    },
    { step: 2, title: "Data Subject Rights", questions: dataSubjectQuestions },
    { step: 3, title: "Security Measures", questions: securityQuestions },
    { step: 4, title: "Breach Notification", questions: breachQuestions },
  ];

  // Render question form based on question type
  const renderQuestionForm = (question: any) => {
    switch (question.type) {
      case "radio":
        return (
          <RadioGroup
            value={assessmentResponses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
          >
            {question.options.map((option: string) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        );
      default:
        return null;
    }
  };

  // Render assessment result
  const renderAssessmentResult = () => {
    if (!assessmentResult) return null;

    // Mock result for demonstration
    const mockResult = {
      overallStatus: ComplianceStatus.PARTIALLY_COMPLIANT,
      score: 72,
      categories: [
        {
          name: "Data Processing Principles",
          status: ComplianceStatus.COMPLIANT,
          score: 85,
          controls: 5,
          compliantControls: 4,
          nonCompliantControls: 0,
          partiallyCompliantControls: 1,
        },
        {
          name: "Data Subject Rights",
          status: ComplianceStatus.PARTIALLY_COMPLIANT,
          score: 70,
          controls: 4,
          compliantControls: 2,
          nonCompliantControls: 0,
          partiallyCompliantControls: 2,
        },
        {
          name: "Security Measures",
          status: ComplianceStatus.PARTIALLY_COMPLIANT,
          score: 80,
          controls: 5,
          compliantControls: 4,
          nonCompliantControls: 1,
          partiallyCompliantControls: 0,
        },
        {
          name: "Breach Notification",
          status: ComplianceStatus.PARTIALLY_COMPLIANT,
          score: 65,
          controls: 4,
          compliantControls: 2,
          nonCompliantControls: 1,
          partiallyCompliantControls: 1,
        },
      ],
      recommendations: [
        "Improve your data breach response plan to ensure timely notification",
        "Enhance mechanisms for data subjects to exercise their rights",
        "Implement stronger encryption for data at rest",
        "Conduct more frequent security assessments",
      ],
    };

    // Use mock result for now
    const result = mockResult;

    // Get status icon
    const getStatusIcon = (status: ComplianceStatus) => {
      switch (status) {
        case ComplianceStatus.COMPLIANT:
          return <CheckIcon sx={{ color: theme.palette.success.main }} />;
        case ComplianceStatus.PARTIALLY_COMPLIANT:
          return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
        case ComplianceStatus.NON_COMPLIANT:
          return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
        default:
          return <InfoIcon sx={{ color: theme.palette.info.main }} />;
      }
    };

    // Get status color
    const getStatusColor = (status: ComplianceStatus) => {
      switch (status) {
        case ComplianceStatus.COMPLIANT:
          return theme.palette.success.main;
        case ComplianceStatus.PARTIALLY_COMPLIANT:
          return theme.palette.warning.main;
        case ComplianceStatus.NON_COMPLIANT:
          return theme.palette.error.main;
        default:
          return theme.palette.info.main;
      }
    };

    return (
      <Box>
        <Alert
          severity={
            result.overallStatus === ComplianceStatus.COMPLIANT
              ? "success"
              : result.overallStatus === ComplianceStatus.PARTIALLY_COMPLIANT
              ? "warning"
              : "error"
          }
          sx={{ mb: 3 }}
        >
          <Typography variant="h6">
            {result.overallStatus === ComplianceStatus.COMPLIANT
              ? "GDPR Compliant"
              : result.overallStatus === ComplianceStatus.PARTIALLY_COMPLIANT
              ? "Partially GDPR Compliant"
              : "Not GDPR Compliant"}
          </Typography>
          <Typography variant="body2">
            Your organization is {result.score}% compliant with GDPR
            requirements.
          </Typography>
        </Alert>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {result.categories.map((category) => (
            <Grid item xs={12} sm={6} md={3} key={category.name}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    {getStatusIcon(category.status)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {category.score}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    {category.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {category.compliantControls} of {category.controls} controls
                    compliant
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" gutterBottom>
          Recommendations
        </Typography>

        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box component="ul" sx={{ m: 0, pl: 3 }}>
            {result.recommendations.map((recommendation, index) => (
              <Box component="li" key={index} sx={{ mb: 1 }}>
                <Typography variant="body2">{recommendation}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button variant="outlined" onClick={handleReset}>
            Start New Assessment
          </Button>
          <Button variant="contained" color="primary" sx={{ ml: 2 }}>
            Generate Report
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          GDPR Compliance Assessment
        </Typography>
        <Typography variant="body1">
          Complete this assessment to evaluate your organization's compliance
          with GDPR requirements. Answer all questions to get a detailed
          compliance report with recommendations.
        </Typography>
      </Paper>

      {/* Assessment completed */}
      {assessmentResult ? (
        renderAssessmentResult()
      ) : (
        // Assessment stepper
        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {index === 0 ? (
                    // Setup step
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Configure your assessment
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth required>
                            <InputLabel id="cloud-provider-label">
                              Cloud Provider
                            </InputLabel>
                            <Select
                              labelId="cloud-provider-label"
                              id="cloud-provider"
                              value={selectedCloud}
                              label="Cloud Provider"
                              onChange={handleCloudChange as any}
                            >
                              <MenuItem value={CloudProvider.AWS}>AWS</MenuItem>
                              <MenuItem value={CloudProvider.AZURE}>
                                Azure
                              </MenuItem>
                              <MenuItem value={CloudProvider.GCP}>
                                Google Cloud Platform
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            id="account-id"
                            label="Account ID"
                            value={accountId}
                            onChange={handleAccountIdChange}
                            helperText="Enter your cloud account ID"
                          />
                        </Grid>
                      </Grid>

                      <Alert severity="info" sx={{ mt: 3 }}>
                        This assessment will scan your cloud resources to
                        evaluate GDPR compliance. Make sure you have the
                        necessary permissions to access the resources.
                      </Alert>
                    </Box>
                  ) : (
                    // Questions steps
                    <Box sx={{ mt: 2 }}>
                      {questionCategories
                        .find((cat) => cat.step === index)
                        ?.questions.map((question, qIndex) => (
                          <Box key={question.id} sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              {qIndex + 1}. {question.question}
                            </Typography>
                            {renderQuestionForm(question)}
                          </Box>
                        ))}
                    </Box>
                  )}

                  <Box sx={{ mb: 2, mt: 3 }}>
                    <div>
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!isStepComplete(activeStep) || isLoading}
                      >
                        {activeStep === steps.length - 1 ? (
                          isLoading ? (
                            <>
                              <CircularProgress size={24} sx={{ mr: 1 }} />
                              Running Assessment...
                            </>
                          ) : (
                            "Submit Assessment"
                          )
                        ) : (
                          "Next"
                        )}
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {isError && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {(error as any)?.data?.message ||
                "Failed to run assessment. Please try again."}
            </Alert>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default GDPRComplianceAssessment;
