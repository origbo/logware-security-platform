/**
 * Attack Simulation Component
 *
 * Allows users to configure and run attack path simulations with visualization and remediation recommendations
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  GetApp as DownloadIcon,
} from "@mui/icons-material";

import {
  useGetAttackPathsQuery,
  useRunSimulationMutation,
  useGetSimulationResultQuery,
} from "../../services/attackPathService";
import {
  AttackPath,
  SimulationConfig,
  SimulationStatus,
  SimulationResult,
  RemediationRecommendation,
} from "../../types/attackPathTypes";

export const AttackSimulation: React.FC = () => {
  const theme = useTheme();

  // State for simulation configuration
  const [simConfig, setSimConfig] = useState<SimulationConfig>({
    attackPathId: "",
    startingPoints: [],
    targetAssets: [],
    attackerProfile: "TARGETED",
    techniques: ["EXPLOIT_VULNERABILITY", "BRUTE_FORCE", "PHISHING"],
    maxDepth: 5,
    maxTime: 60,
    includeRemediations: true,
  });

  // State for simulation execution
  const [simId, setSimId] = useState<string | null>(null);
  const [simStatus, setSimStatus] = useState<SimulationStatus>("IDLE");
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  // Queries
  const { data: attackPaths = [], isLoading: isLoadingPaths } =
    useGetAttackPathsQuery();
  const [runSimulation, { isLoading: isRunning }] = useRunSimulationMutation();
  const {
    data: simResult,
    isLoading: isLoadingResult,
    refetch: refetchResult,
  } = useGetSimulationResultQuery(simId || "", { skip: !simId });

  // Get current attack path
  const currentAttackPath = attackPaths.find(
    (path) => path.id === simConfig.attackPathId
  );

  // Handle configuration change
  const handleConfigChange = (name: string, value: any) => {
    setSimConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle start simulation
  const handleStartSimulation = async () => {
    try {
      const result = await runSimulation(simConfig).unwrap();
      setSimId(result.id);
      setSimStatus("RUNNING");
      setActiveStep(1);
      setElapsedTime(0);

      // Start timer for progress tracking
      const timer = setInterval(() => {
        setElapsedTime((prev) => {
          if (prev >= simConfig.maxTime) {
            clearInterval(timer);
            return simConfig.maxTime;
          }
          return prev + 1;
        });
      }, 1000);

      // Poll for simulation completion
      const statusCheck = setInterval(async () => {
        await refetchResult();
        if (
          simResult?.status === "COMPLETED" ||
          simResult?.status === "FAILED"
        ) {
          clearInterval(statusCheck);
          clearInterval(timer);
          setSimStatus(simResult.status);
          setActiveStep(2);
        }
      }, 5000);
    } catch (error) {
      console.error("Failed to run simulation:", error);
      setSimStatus("FAILED");
    }
  };

  // Handle stop simulation
  const handleStopSimulation = () => {
    // Logic to stop simulation would be here
    setSimStatus("STOPPED");
  };

  // Handle restart simulation
  const handleRestartSimulation = () => {
    setSimId(null);
    setSimStatus("IDLE");
    setActiveStep(0);
    setElapsedTime(0);
  };

  // Handle open report dialog
  const handleOpenReportDialog = () => {
    setReportDialogOpen(true);
  };

  // Handle close report dialog
  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
  };

  // Handle download report
  const handleDownloadReport = () => {
    // Logic to download report would be here
    console.log("Downloading report for simulation:", simId);
    setReportDialogOpen(false);
  };

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "CRITICAL":
        return theme.palette.error.dark;
      case "HIGH":
        return theme.palette.error.main;
      case "MEDIUM":
        return theme.palette.warning.main;
      case "LOW":
        return theme.palette.success.main;
      case "INFO":
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircleIcon color="success" />;
      case "FAILED":
        return <ErrorIcon color="error" />;
      case "PARTIAL":
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>Configure Simulation</StepLabel>
          </Step>
          <Step>
            <StepLabel>Run Simulation</StepLabel>
          </Step>
          <Step>
            <StepLabel>Review Results</StepLabel>
          </Step>
        </Stepper>

        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="attack-path-label">Attack Path</InputLabel>
                <Select
                  labelId="attack-path-label"
                  value={simConfig.attackPathId}
                  onChange={(e) =>
                    handleConfigChange("attackPathId", e.target.value)
                  }
                  label="Attack Path"
                  disabled={isLoadingPaths}
                >
                  <MenuItem value="">
                    <em>Select an attack path</em>
                  </MenuItem>
                  {attackPaths.map((path: AttackPath) => (
                    <MenuItem key={path.id} value={path.id}>
                      {path.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="attacker-profile-label">
                  Attacker Profile
                </InputLabel>
                <Select
                  labelId="attacker-profile-label"
                  value={simConfig.attackerProfile}
                  onChange={(e) =>
                    handleConfigChange("attackerProfile", e.target.value)
                  }
                  label="Attacker Profile"
                >
                  <MenuItem value="OPPORTUNISTIC">
                    Opportunistic (Low Skill)
                  </MenuItem>
                  <MenuItem value="TARGETED">Targeted (Medium Skill)</MenuItem>
                  <MenuItem value="ADVANCED">
                    Advanced Persistent Threat (High Skill)
                  </MenuItem>
                  <MenuItem value="INSIDER">Insider Threat</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="techniques-label">Attack Techniques</InputLabel>
                <Select
                  labelId="techniques-label"
                  multiple
                  value={simConfig.techniques}
                  onChange={(e) =>
                    handleConfigChange("techniques", e.target.value)
                  }
                  label="Attack Techniques"
                >
                  <MenuItem value="EXPLOIT_VULNERABILITY">
                    Exploit Vulnerabilities
                  </MenuItem>
                  <MenuItem value="BRUTE_FORCE">Brute Force Attacks</MenuItem>
                  <MenuItem value="PHISHING">Phishing</MenuItem>
                  <MenuItem value="LATERAL_MOVEMENT">Lateral Movement</MenuItem>
                  <MenuItem value="PRIVILEGE_ESCALATION">
                    Privilege Escalation
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Depth"
                    type="number"
                    value={simConfig.maxDepth}
                    onChange={(e) =>
                      handleConfigChange("maxDepth", parseInt(e.target.value))
                    }
                    InputProps={{ inputProps: { min: 1, max: 10 } }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Time (seconds)"
                    type="number"
                    value={simConfig.maxTime}
                    onChange={(e) =>
                      handleConfigChange("maxTime", parseInt(e.target.value))
                    }
                    InputProps={{ inputProps: { min: 10, max: 300 } }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>

              {currentAttackPath && (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="starting-points-label">
                      Starting Points
                    </InputLabel>
                    <Select
                      labelId="starting-points-label"
                      multiple
                      value={simConfig.startingPoints}
                      onChange={(e) =>
                        handleConfigChange("startingPoints", e.target.value)
                      }
                      label="Starting Points"
                    >
                      {currentAttackPath.nodes
                        .filter((node) => node.type === "ENTRY_POINT")
                        .map((node) => (
                          <MenuItem key={node.id} value={node.id}>
                            {node.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="target-assets-label">
                      Target Assets
                    </InputLabel>
                    <Select
                      labelId="target-assets-label"
                      multiple
                      value={simConfig.targetAssets}
                      onChange={(e) =>
                        handleConfigChange("targetAssets", e.target.value)
                      }
                      label="Target Assets"
                    >
                      {currentAttackPath.nodes
                        .filter(
                          (node) => node.type === "TARGET" || node.riskScore > 7
                        )
                        .map((node) => (
                          <MenuItem key={node.id} value={node.id}>
                            {node.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </Grid>

            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayIcon />}
                onClick={handleStartSimulation}
                disabled={
                  !simConfig.attackPathId ||
                  simConfig.startingPoints.length === 0 ||
                  simConfig.techniques.length === 0 ||
                  isRunning
                }
              >
                Start Simulation
              </Button>
            </Grid>
          </Grid>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Simulation in Progress
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Progress:
                </Typography>
                <Box sx={{ width: "100%", mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(elapsedTime / simConfig.maxTime) * 100}
                  />
                </Box>
                <Typography variant="body2">
                  {Math.round((elapsedTime / simConfig.maxTime) * 100)}%
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                Elapsed Time: {elapsedTime} seconds / Max Time:{" "}
                {simConfig.maxTime} seconds
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}
            >
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleStopSimulation}
              >
                Stop Simulation
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => refetchResult()}
                disabled={isLoadingResult}
              >
                Refresh Status
              </Button>
            </Box>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Simulation Details
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Attack Path:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {currentAttackPath?.name || "Unknown"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Attacker Profile:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {simConfig.attackerProfile}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Starting Points:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {simConfig.startingPoints.length} entry points
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                      Target Assets:
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {simConfig.targetAssets.length} assets
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}

        {activeStep === 2 && simResult && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Simulation Results</Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={handleOpenReportDialog}
                  sx={{ mr: 1 }}
                >
                  Generate Report
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRestartSimulation}
                >
                  New Simulation
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {getStatusIcon(simResult.status)}
                      <Typography variant="subtitle1" sx={{ ml: 1 }}>
                        Overall Result: {simResult.status}
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            textAlign: "center",
                            bgcolor: theme.palette.background.default,
                          }}
                        >
                          <Typography variant="h6" color="error.main">
                            {simResult.successfulPaths}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Successful Attack Paths
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            textAlign: "center",
                            bgcolor: theme.palette.background.default,
                          }}
                        >
                          <Typography variant="h6">
                            {simResult.compromisedAssets}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Compromised Assets
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            textAlign: "center",
                            bgcolor: theme.palette.background.default,
                          }}
                        >
                          <Typography variant="h6">
                            {simResult.timeToCompromise}s
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Avg. Time to Compromise
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            textAlign: "center",
                            bgcolor: theme.palette.background.default,
                          }}
                        >
                          <Typography variant="h6">
                            {simResult.exploitedVulnerabilities}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Exploited Vulnerabilities
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Most Critical Paths
                    </Typography>
                    {simResult.criticalPaths.map((path, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          border: `1px solid ${theme.palette.divider}`,
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            Path #{index + 1}
                          </Typography>
                          <Chip
                            label={`Risk: ${path.riskScore.toFixed(1)}`}
                            size="small"
                            color="error"
                          />
                        </Box>
                        <Typography variant="caption">
                          {path.startNode} → {path.intermediateNodes} →{" "}
                          {path.endNode}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Remediation Recommendations
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      {simResult.remediationRecommendations.map(
                        (rec: RemediationRecommendation, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              mb: 1,
                              backgroundColor: theme.palette.background.default,
                              borderRadius: 1,
                            }}
                          >
                            <ListItemIcon>
                              {rec.severity === "CRITICAL" && (
                                <ErrorIcon color="error" />
                              )}
                              {rec.severity === "HIGH" && (
                                <WarningIcon color="error" />
                              )}
                              {rec.severity === "MEDIUM" && (
                                <WarningIcon color="warning" />
                              )}
                              {rec.severity === "LOW" && (
                                <InfoIcon color="info" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {rec.title}
                                  </Typography>
                                  <Chip
                                    label={rec.severity}
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      bgcolor: getSeverityColor(rec.severity),
                                      color: "white",
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    paragraph
                                  >
                                    {rec.description}
                                  </Typography>
                                  <Typography variant="caption" color="primary">
                                    Impact: {rec.impact} | Effort: {rec.effort}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                        )
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={handleCloseReportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Simulation Report</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="report-format-label">Report Format</InputLabel>
                <Select
                  labelId="report-format-label"
                  value="pdf"
                  label="Report Format"
                >
                  <MenuItem value="pdf">PDF Document</MenuItem>
                  <MenuItem value="docx">Word Document</MenuItem>
                  <MenuItem value="html">HTML</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="report-detail-label">Detail Level</InputLabel>
                <Select
                  labelId="report-detail-label"
                  value="full"
                  label="Detail Level"
                >
                  <MenuItem value="executive">Executive Summary</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="full">Full Details</MenuItem>
                  <MenuItem value="technical">
                    Technical (With Raw Data)
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" margin="normal">
                <Typography variant="subtitle2" gutterBottom>
                  Include Sections
                </Typography>
                <Grid container>
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Chip
                        label="✓"
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">Executive Summary</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Chip
                        label="✓"
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">Attack Paths</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Chip
                        label="✓"
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">Vulnerabilities</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Chip
                        label="✓"
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">Remediation Plan</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportDialog}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReport}
          >
            Generate and Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
