import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import AssessmentIcon from "@mui/icons-material/Assessment";
import {
  ComplianceFramework,
} from "../../pages/compliance/CompliancePage";

interface ComplianceAssessmentProps {
  frameworks: ComplianceFramework[];
  onAssessmentComplete: (results: AssessmentResult) => void;
}

interface AssessmentQuestion {
  id: string;
  controlId: string;
  question: string;
  description?: string;
  answerType:
    | "yes-no"
    | "yes-no-partial"
    | "yes-no-na"
    | "text"
    | "multiple-choice";
  options?: string[];
  required: boolean;
}

interface AssessmentControl {
  controlId: string;
  title: string;
  category: string;
  questions: AssessmentQuestion[];
}

interface AssessmentAnswer {
  questionId: string;
  controlId: string;
  answer: string | string[] | boolean | null;
  notes?: string;
  evidence?: string[];
}

interface AssessmentResult {
  frameworkId: string;
  frameworkName: string;
  date: Date;
  answers: AssessmentAnswer[];
  score: number;
  completedControls: number;
  totalControls: number;
  status: "compliant" | "non-compliant" | "partially-compliant";
}

const ComplianceAssessment: React.FC<ComplianceAssessmentProps> = ({
  frameworks,
  onAssessmentComplete,
}) => {
  // State
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFramework, setSelectedFramework] = useState<string>("");
  const [assessmentControls, setAssessmentControls] = useState<
    AssessmentControl[]
  >([]);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentControlIndex, setCurrentControlIndex] = useState(0);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResult | null>(null);

  // Steps for the assessment process
  const steps = [
    "Select Framework",
    "Answer Assessment Questions",
    "Review and Submit",
  ];

  // Generate assessment questions from framework controls
  const generateAssessmentControls = (frameworkId: string) => {
    setLoading(true);
    setError(null);

    try {
      const framework = frameworks.find((f) => f.id === frameworkId);

      if (!framework) {
        throw new Error("Framework not found");
      }

      // Transform controls into assessment questions
      const controls: AssessmentControl[] = framework.controls.map(
        (control) => {
          // Generate questions based on control requirements
          const questions: AssessmentQuestion[] = [
            {
              id: `${control.id}-implementation`,
              controlId: control.id,
              question: `Is ${control.title} implemented in your organization?`,
              description: control.description,
              answerType: "yes-no-partial",
              required: true,
            },
            {
              id: `${control.id}-documentation`,
              controlId: control.id,
              question: "Is this control formally documented?",
              answerType: "yes-no",
              required: true,
            },
            {
              id: `${control.id}-evidence`,
              controlId: control.id,
              question:
                "Do you have evidence to support compliance with this control?",
              answerType: "yes-no",
              required: true,
            },
          ];

          return {
            controlId: control.id,
            title: control.title,
            category: control.category,
            questions,
          };
        }
      );

      setAssessmentControls(controls);

      // Initialize answers
      const initialAnswers: AssessmentAnswer[] = [];
      controls.forEach((control) => {
        control.questions.forEach((question) => {
          initialAnswers.push({
            questionId: question.id,
            controlId: control.controlId,
            answer: null,
            notes: "",
            evidence: [],
          });
        });
      });

      setAnswers(initialAnswers);
      setLoading(false);
    } catch (err) {
      setError("Failed to generate assessment questions. Please try again.");
      setLoading(false);
    }
  };

  // Handle framework selection
  const handleFrameworkChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const frameworkId = event.target.value as string;
    setSelectedFramework(frameworkId);
    generateAssessmentControls(frameworkId);
  };

  // Answer handlers
  const handleAnswerChange = (
    questionId: string,
    value: string | string[] | boolean
  ) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === questionId ? { ...a, answer: value } : a
      )
    );
  };

  const handleNotesChange = (questionId: string, notes: string) => {
    setAnswers((prev) =>
      prev.map((a) => (a.questionId === questionId ? { ...a, notes } : a))
    );
  };

  // Navigation handlers
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate framework selection
      if (!selectedFramework) {
        setError("Please select a compliance framework");
        return;
      }
      setError(null);
    } else if (activeStep === 1) {
      // Check if all required questions for current control are answered
      const currentControl = assessmentControls[currentControlIndex];
      const controlQuestions = currentControl.questions.filter(
        (q) => q.required
      );
      const unansweredQuestions = controlQuestions.filter((q) => {
        const answer = answers.find((a) => a.questionId === q.id);
        return answer?.answer === null || answer?.answer === undefined;
      });

      if (unansweredQuestions.length > 0) {
        setError(
          `Please answer all required questions for ${currentControl.title}`
        );
        return;
      }

      // Move to next control or step
      if (currentControlIndex < assessmentControls.length - 1) {
        setCurrentControlIndex(currentControlIndex + 1);
        setError(null);
        return;
      }
    }

    if (activeStep === steps.length - 2) {
      // Before final step, calculate assessment results
      calculateAssessmentResults();
    }

    setActiveStep((prev) => prev + 1);
    setError(null);
  };

  const handleBack = () => {
    if (activeStep === 1 && currentControlIndex > 0) {
      setCurrentControlIndex(currentControlIndex - 1);
    } else {
      setActiveStep((prev) => prev - 1);
    }
    setError(null);
  };

  // Calculate assessment results
  const calculateAssessmentResults = () => {
    setLoading(true);

    try {
      const framework = frameworks.find((f) => f.id === selectedFramework);

      if (!framework) {
        throw new Error("Framework not found");
      }

      // Count compliant and non-compliant controls
      const controlResults = new Map<
        string,
        "compliant" | "non-compliant" | "partially-compliant"
      >();

      // Analyze answers for each control
      assessmentControls.forEach((control) => {
        const controlAnswers = answers.filter(
          (a) => a.controlId === control.controlId
        );

        // Check if all required questions are answered
        const requiredQuestions = control.questions.filter((q) => q.required);
        const answeredRequired = requiredQuestions.every((q) =>
          controlAnswers.some(
            (a) => a.questionId === q.id && a.answer !== null
          )
        );

        if (!answeredRequired) {
          controlResults.set(control.controlId, "non-compliant");
          return;
        }

        // Check implementation question (this is the main compliance indicator)
        const implementationAnswer = controlAnswers.find((a) =>
          a.questionId.includes("-implementation")
        );

        if (implementationAnswer) {
          if (implementationAnswer.answer === "yes") {
            controlResults.set(control.controlId, "compliant");
          } else if (implementationAnswer.answer === "partial") {
            controlResults.set(control.controlId, "partially-compliant");
          } else {
            controlResults.set(control.controlId, "non-compliant");
          }
        } else {
          controlResults.set(control.controlId, "non-compliant");
        }
      });

      // Calculate overall statistics
      const compliantControls = Array.from(controlResults.values()).filter(
        (status) => status === "compliant"
      ).length;
      const partiallyCompliantControls = Array.from(
        controlResults.values()
      ).filter((status) => status === "partially-compliant").length;

      const totalControls = assessmentControls.length;
      const completedControls = compliantControls;

      // Calculate compliance score (compliant + 0.5 * partially compliant)
      const score =
        (compliantControls + 0.5 * partiallyCompliantControls) / totalControls;

      // Determine overall status
      let status: "compliant" | "non-compliant" | "partially-compliant" =
        "non-compliant";

      if (score >= 0.8) {
        status = "compliant";
      } else if (score >= 0.5) {
        status = "partially-compliant";
      }

      // Create assessment result
      const result: AssessmentResult = {
        frameworkId: selectedFramework,
        frameworkName: framework.name,
        date: new Date(),
        answers,
        score,
        completedControls,
        totalControls,
        status,
      };

      setAssessmentResult(result);
      setAssessmentComplete(true);
    } catch (err) {
      setError("Error calculating assessment results");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Submit assessment results
  const handleSubmitAssessment = () => {
    if (assessmentResult) {
      onAssessmentComplete(assessmentResult);
    }
  };

  // Get current control
  const currentControl = assessmentControls[currentControlIndex] || null;

  // Render questions for current control
  const renderQuestions = () => {
    if (!currentControl) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {currentControl.title}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Category: {currentControl.category}
        </Typography>

        {currentControl.questions.map((question) => {
          const answer = answers.find((a) => a.questionId === question.id);

          return (
            <Box key={question.id} sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                {question.required && <span style={{ color: "red" }}>* </span>}
                {question.question}
              </Typography>

              {question.description && (
                <Typography variant="body2" color="textSecondary" paragraph>
                  {question.description}
                </Typography>
              )}

              {question.answerType === "yes-no" && (
                <RadioGroup
                  row
                  value={answer?.answer || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              )}

              {question.answerType === "yes-no-partial" && (
                <RadioGroup
                  row
                  value={answer?.answer || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel
                    value="partial"
                    control={<Radio />}
                    label="Partially"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              )}

              {question.answerType === "yes-no-na" && (
                <RadioGroup
                  row
                  value={answer?.answer || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                  <FormControlLabel
                    value="na"
                    control={<Radio />}
                    label="Not Applicable"
                  />
                </RadioGroup>
              )}

              {question.answerType === "text" && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={answer?.answer || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  variant="outlined"
                  placeholder="Enter your answer"
                />
              )}

              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={answer?.notes || ""}
                onChange={(e) => handleNotesChange(question.id, e.target.value)}
                variant="outlined"
                margin="normal"
                placeholder="Add any relevant notes or context"
              />
            </Box>
          );
        })}
      </Box>
    );
  };

  // Render assessment steps
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select a compliance framework to assess
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel id="framework-select-label">
                Compliance Framework
              </InputLabel>
              <Select
                labelId="framework-select-label"
                value={selectedFramework}
                onChange={handleFrameworkChange}
                label="Compliance Framework"
              >
                {frameworks.map((framework) => (
                  <MenuItem key={framework.id} value={framework.id}>
                    {framework.name} (v{framework.version})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedFramework && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Framework Details
                </Typography>

                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Box>
                    <Typography variant="body2" paragraph>
                      This assessment will evaluate your compliance with{" "}
                      {frameworks.find((f) => f.id === selectedFramework)?.name}
                      .
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Total controls to assess: {assessmentControls.length}
                    </Typography>
                    <Typography variant="body2">
                      Estimated time to complete:{" "}
                      {Math.ceil((assessmentControls.length * 3) / 60)} hours
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );

      case 1:
        return loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle1">
                Control {currentControlIndex + 1} of {assessmentControls.length}
              </Typography>
              <Chip
                label={`${Math.round(
                  ((currentControlIndex + 1) / assessmentControls.length) * 100
                )}% Complete`}
                color="primary"
                variant="outlined"
              />
            </Box>

            {renderQuestions()}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Assessment Summary
            </Typography>

            {assessmentResult && (
              <Box>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Framework:</Typography>
                        <Typography variant="body1" gutterBottom>
                          {assessmentResult.frameworkName}
                        </Typography>

                        <Typography variant="subtitle1">
                          Date Assessed:
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {assessmentResult.date.toLocaleDateString()}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">
                          Overall Compliance Score:
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              position: "relative",
                              display: "inline-flex",
                              mr: 2,
                            }}
                          >
                            <CircularProgress
                              variant="determinate"
                              value={assessmentResult.score}
                              color={
                                assessmentResult.score >= 85
                                  ? "success"
                                  : assessmentResult.score >= 50
                                  ? "warning"
                                  : "error"
                              }
                              size={80}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: "absolute",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography variant="h6" component="div">
                                {assessmentResult.score}%
                              </Typography>
                            </Box>
                          </Box>

                          <Chip
                            label={
                              assessmentResult.status === "compliant"
                                ? "Compliant"
                                : assessmentResult.status ===
                                  "partially-compliant"
                                ? "Partially Compliant"
                                : "Non-Compliant"
                            }
                            color={
                              assessmentResult.status === "compliant"
                                ? "success"
                                : assessmentResult.status ===
                                  "partially-compliant"
                                ? "warning"
                                : "error"
                            }
                          />
                        </Box>

                        <Typography variant="subtitle1" sx={{ mt: 2 }}>
                          Controls Summary:
                        </Typography>
                        <Typography variant="body1">
                          {assessmentResult.completedControls} of{" "}
                          {assessmentResult.totalControls} controls compliant
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Next Steps:
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <AssessmentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Generate a detailed compliance report"
                        secondary="Share the assessment results with stakeholders"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Create remediation plans"
                        secondary="Address non-compliant controls"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Schedule follow-up assessment"
                        secondary="Track progress on compliance improvements"
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Compliance Assessment
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStepContent()}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button onClick={handleBack} disabled={activeStep === 0 || loading}>
            Back
          </Button>

          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitAssessment}
                disabled={!assessmentComplete}
              >
                Submit Assessment
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={loading}
              >
                {activeStep === steps.length - 2 ? "Review Results" : "Next"}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ComplianceAssessment;
