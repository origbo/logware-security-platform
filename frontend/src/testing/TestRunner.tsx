/**
 * Test Runner Component
 *
 * UI for running, monitoring, and reporting on automated tests for the security platform.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  useTheme,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  CloudDownload as DownloadIcon,
  Code as CodeIcon,
  FolderOpen as FolderIcon,
  BugReport as BugIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

// Test types
export interface TestResult {
  id: string;
  name: string;
  status: "pass" | "fail" | "skip" | "running" | "pending";
  duration: number;
  errorMessage?: string;
  errorStack?: string;
  metadata?: Record<string, any>;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  type: "unit" | "integration" | "e2e" | "performance";
  results: TestResult[];
  status: "pass" | "fail" | "skip" | "running" | "pending";
  startTime?: number;
  endTime?: number;
}

export interface TestRunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

export const TestRunner: React.FC = () => {
  const theme = useTheme();

  // State
  const [activeTab, setActiveTab] = useState<string>("all");
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(false);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [selectedError, setSelectedError] = useState<{
    message: string;
    stack: string;
  } | null>(null);

  // Load test suites
  useEffect(() => {
    // Simulate API call to load test suites
    const loadTestSuites = async () => {
      setLoading(true);

      try {
        // Mock data - in a real app, this would be an API call
        setTimeout(() => {
          const mockTestSuites: TestSuite[] = [
            {
              id: "1",
              name: "Authentication Tests",
              description: "Tests for user authentication and authorization",
              type: "unit",
              status: "pass",
              results: [
                {
                  id: "1-1",
                  name: "Should login with valid credentials",
                  status: "pass",
                  duration: 45,
                },
                {
                  id: "1-2",
                  name: "Should reject invalid credentials",
                  status: "pass",
                  duration: 38,
                },
                {
                  id: "1-3",
                  name: "Should enforce MFA when enabled",
                  status: "pass",
                  duration: 103,
                },
              ],
              startTime: Date.now() - 180000,
              endTime: Date.now() - 179000,
            },
            {
              id: "2",
              name: "SIEM Integration Tests",
              description: "Tests for SIEM data ingestion and correlation",
              type: "integration",
              status: "fail",
              results: [
                {
                  id: "2-1",
                  name: "Should connect to SIEM API",
                  status: "pass",
                  duration: 234,
                },
                {
                  id: "2-2",
                  name: "Should query events successfully",
                  status: "pass",
                  duration: 567,
                },
                {
                  id: "2-3",
                  name: "Should handle pagination correctly",
                  status: "fail",
                  duration: 321,
                  errorMessage: "Expected 100 events but received 50",
                  errorStack:
                    "Error: Expected 100 events but received 50\n  at SiemClient.getEvents (/src/services/siemService.ts:125:9)\n  at runTest (/src/testing/runners/integrationRunner.ts:67:15)",
                },
              ],
              startTime: Date.now() - 120000,
              endTime: Date.now() - 118000,
            },
            {
              id: "3",
              name: "Dashboard End-to-End Tests",
              description: "Browser tests for dashboard functionality",
              type: "e2e",
              status: "pass",
              results: [
                {
                  id: "3-1",
                  name: "Should load dashboard correctly",
                  status: "pass",
                  duration: 2345,
                },
                {
                  id: "3-2",
                  name: "Should display correct metrics",
                  status: "pass",
                  duration: 1234,
                },
                {
                  id: "3-3",
                  name: "Should filter data correctly",
                  status: "pass",
                  duration: 3456,
                },
              ],
              startTime: Date.now() - 90000,
              endTime: Date.now() - 80000,
            },
            {
              id: "4",
              name: "Performance Tests",
              description: "Tests for application performance under load",
              type: "performance",
              status: "skip",
              results: [
                {
                  id: "4-1",
                  name: "Should handle 1000 concurrent users",
                  status: "skip",
                  duration: 0,
                },
                {
                  id: "4-2",
                  name: "Should process 10000 events per second",
                  status: "skip",
                  duration: 0,
                },
              ],
              startTime: undefined,
              endTime: undefined,
            },
          ];

          setTestSuites(mockTestSuites);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to load test suites:", error);
        setLoading(false);
      }
    };

    loadTestSuites();
  }, []);

  // Filter test suites by type
  const filteredTestSuites =
    activeTab === "all"
      ? testSuites
      : testSuites.filter((suite) => suite.type === activeTab);

  // Calculate test summary
  const testSummary: TestRunSummary = React.useMemo(() => {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let duration = 0;

    filteredTestSuites.forEach((suite) => {
      total += suite.results.length;
      passed += suite.results.filter(
        (result) => result.status === "pass"
      ).length;
      failed += suite.results.filter(
        (result) => result.status === "fail"
      ).length;
      skipped += suite.results.filter(
        (result) => result.status === "skip"
      ).length;

      if (suite.startTime && suite.endTime) {
        duration += suite.endTime - suite.startTime;
      }
    });

    return { total, passed, failed, skipped, duration };
  }, [filteredTestSuites]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Handle run tests
  const handleRunTests = () => {
    setRunning(true);

    // Simulate running tests
    setTimeout(() => {
      setRunning(false);

      // Update test results with properly typed status values
      const updatedTestSuites = testSuites.map((suite) => ({
        ...suite,
        status: Math.random() > 0.8 ? ("fail" as const) : ("pass" as const),
        results: suite.results.map((result) => ({
          ...result,
          status: Math.random() > 0.9 ? ("fail" as const) : ("pass" as const),
          duration: Math.floor(Math.random() * 1000) + 100,
        })),
        startTime: Date.now() - 10000,
        endTime: Date.now(),
      }));

      // Explicitly cast the array to match the TestSuite[] type
      setTestSuites(updatedTestSuites as TestSuite[]);
    }, 3000);
  };

  // Handle stop tests
  const handleStopTests = () => {
    setRunning(false);
  };

  // Handle view test details
  const handleViewTestDetails = (suite: TestSuite) => {
    setSelectedSuite(suite);
  };

  // Handle view error
  const handleViewError = (error: { message: string; stack: string }) => {
    setSelectedError(error);
    setErrorDialogOpen(true);
  };

  // Handle close error dialog
  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setSelectedError(null);
  };

  // Handle download report
  const handleDownloadReport = () => {
    // In a real app, this would generate and download a report
    console.log("Downloading test report");
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return theme.palette.success.main;
      case "fail":
        return theme.palette.error.main;
      case "skip":
        return theme.palette.warning.main;
      case "running":
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircleIcon fontSize="small" />;
      case "fail":
        return <ErrorIcon fontSize="small" />;
      case "skip":
        return <WarningIcon fontSize="small" />;
      case "running":
        return <CircularProgress size={16} />;
      default:
        return null;
    }
  };

  // Format duration
  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const milliseconds = duration % 1000;

    if (seconds === 0) {
      return `${milliseconds}ms`;
    }

    return `${seconds}.${milliseconds.toString().padStart(3, "0")}s`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Test Runner</Typography>

        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadReport}
            sx={{ mr: 1 }}
            disabled={running}
          >
            Export Report
          </Button>

          <Button
            variant="contained"
            color={running ? "error" : "primary"}
            startIcon={running ? <StopIcon /> : <PlayIcon />}
            onClick={running ? handleStopTests : handleRunTests}
            disabled={loading}
          >
            {running ? "Stop Tests" : "Run Tests"}
          </Button>
        </Box>
      </Box>

      {/* Test Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.background.default }}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h2" color="textPrimary">
                {testSummary.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.success.light }}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h2" color="success.main">
                {testSummary.passed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Passed Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.error.light }}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h2" color="error.main">
                {testSummary.failed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Failed Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: theme.palette.background.default }}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h6" color="textPrimary">
                {formatDuration(testSummary.duration)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Duration
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
      >
        <Tab label="All Tests" value="all" />
        <Tab label="Unit" value="unit" />
        <Tab label="Integration" value="integration" />
        <Tab label="E2E" value="e2e" />
        <Tab label="Performance" value="performance" />
      </Tabs>

      {running && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1, textAlign: "center" }}
          >
            Running tests... Please wait.
          </Typography>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredTestSuites.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", py: 5 }}>
          No test suites found for this category.
        </Typography>
      ) : (
        <Box>
          {filteredTestSuites.map((suite) => (
            <Accordion key={suite.id} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  borderLeft: `4px solid ${getStatusColor(suite.status)}`,
                  "&.Mui-expanded": {
                    borderLeft: `4px solid ${getStatusColor(suite.status)}`,
                  },
                }}
              >
                <Grid container alignItems="center">
                  <Grid item xs={6} md={4}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {getStatusIcon(suite.status)}
                      <Typography variant="subtitle1" sx={{ ml: 1 }}>
                        {suite.name}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6} md={2}>
                    <Chip
                      label={suite.type}
                      size="small"
                      color={
                        suite.type === "unit"
                          ? "primary"
                          : suite.type === "integration"
                          ? "secondary"
                          : suite.type === "e2e"
                          ? "info"
                          : "default"
                      }
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={4}
                    sx={{ display: { xs: "none", md: "block" } }}
                  >
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {suite.description}
                    </Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    md={2}
                    sx={{
                      textAlign: "right",
                      display: { xs: "none", md: "block" },
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {suite.results.length} tests •{" "}
                      {suite.results.filter((r) => r.status === "pass").length}{" "}
                      passed
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 2, pb: 2 }}>
                <List disablePadding>
                  {suite.results.map((result) => (
                    <ListItem
                      key={result.id}
                      dense
                      divider
                      secondaryAction={
                        <Typography variant="caption" color="textSecondary">
                          {formatDuration(result.duration)}
                        </Typography>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {getStatusIcon(result.status)}
                      </ListItemIcon>

                      <ListItemText
                        primary={result.name}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondary={
                          result.status === "fail" && result.errorMessage ? (
                            <Button
                              variant="text"
                              size="small"
                              color="error"
                              onClick={() =>
                                handleViewError({
                                  message: result.errorMessage || "",
                                  stack: result.errorStack || "",
                                })
                              }
                              sx={{ mt: 0.5, p: 0, minWidth: "auto" }}
                            >
                              View Error
                            </Button>
                          ) : null
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {suite.startTime && suite.endTime && (
                  <Box sx={{ mt: 2, textAlign: "right" }}>
                    <Typography variant="caption" color="textSecondary">
                      Last run: {new Date(suite.startTime).toLocaleString()} •
                      Duration:{" "}
                      {formatDuration(suite.endTime - suite.startTime)}
                    </Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Error Dialog */}
      <Dialog
        open={errorDialogOpen}
        onClose={handleCloseErrorDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.error.light,
            color: theme.palette.error.contrastText,
          }}
        >
          Test Error
        </DialogTitle>

        <DialogContent dividers>
          {selectedError && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Error Message
              </Typography>
              <Paper sx={{ p: 2, bgcolor: theme.palette.grey[100], mb: 3 }}>
                <Typography variant="body2" color="error">
                  {selectedError.message}
                </Typography>
              </Paper>

              <Typography variant="subtitle1" gutterBottom>
                Stack Trace
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: theme.palette.grey[100],
                  overflow: "auto",
                }}
              >
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}
                >
                  {selectedError.stack}
                </Typography>
              </Paper>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseErrorDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
