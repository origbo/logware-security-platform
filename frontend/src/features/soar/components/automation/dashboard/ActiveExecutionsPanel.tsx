import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Divider,
  LinearProgress,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  AutomationExecution,
  ExecutionStep,
  mockActiveExecutions,
} from "./executionTypes";

const ActiveExecutionsPanel: React.FC = () => {
  const theme = useTheme();
  const [executions, setExecutions] =
    useState<AutomationExecution[]>(mockActiveExecutions);
  const [expandedExecution, setExpandedExecution] = useState<string | null>(
    null
  );
  const [refreshInterval, setRefreshInterval] = useState<number>(10000); // 10 seconds
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update progress and elapsed time for running executions
      setExecutions((prev) => {
        return prev.map((execution) => {
          // Only process running executions
          if (execution.status === "running") {
            // Create a copy of the execution to avoid mutation
            const updatedExecution = { ...execution };
            // Create a new steps array to avoid issues with references
            const updatedSteps = [...updatedExecution.steps];

            // Process each step
            for (let i = 0; i < updatedSteps.length; i++) {
              const step = updatedSteps[i];

              // If this step is running, check if it should be completed
              if (step.status === "running") {
                // 20% chance to complete a running step
                if (Math.random() < 0.2) {
                  // Update the current step to completed
                  updatedSteps[i] = {
                    ...step,
                    status: "completed" as const, // Type assertion to ensure type safety
                    endTime: new Date().toISOString(),
                    duration: step.startTime
                      ? Math.floor(
                          (new Date().getTime() -
                            new Date(step.startTime).getTime()) /
                            1000
                        )
                      : undefined,
                  };

                  // Find next step
                  const nextStepIndex = i + 1;

                  // If there's a next step, set it to running
                  if (nextStepIndex < updatedSteps.length) {
                    updatedSteps[nextStepIndex] = {
                      ...updatedSteps[nextStepIndex],
                      status: "running" as const, // Type assertion for type safety
                      startTime: new Date().toISOString(),
                    };
                  } else {
                    // If no more steps, complete the execution
                    updatedExecution.status = "completed";
                    updatedExecution.endTime = new Date().toISOString();
                  }

                  // Only process one step change per interval
                  break;
                }
              }
            }

            // Return the updated execution with new steps
            return {
              ...updatedExecution,
              steps: updatedSteps,
            };
          }
          return execution;
        });
      });

      setLastRefreshed(new Date());
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Handle expanding and collapsing executions
  const handleToggleExpand = (executionId: string) => {
    setExpandedExecution(
      expandedExecution === executionId ? null : executionId
    );
  };

  // Handle aborting an execution
  const handleAbortExecution = (executionId: string) => {
    setExecutions(
      executions.map((execution) =>
        execution.id === executionId
          ? {
              ...execution,
              status: "aborted" as const, // Type assertion to fix lint error
              endTime: new Date().toISOString(),
            }
          : execution
      )
    );
  };

  // Manual refresh
  const handleRefresh = () => {
    // In a real app, this would fetch fresh data from an API
    setLastRefreshed(new Date());
  };

  // Calculate progress percentage for an execution
  const calculateProgress = (execution: AutomationExecution): number => {
    const totalSteps = execution.steps.length;
    const completedSteps = execution.steps.filter(
      (step) => step.status === "completed" || step.status === "skipped"
    ).length;

    return Math.round((completedSteps / totalSteps) * 100);
  };

  // Format elapsed time
  const formatElapsedTime = (startTime: string): string => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = Math.floor((now - start) / 1000);

    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    return `${hours > 0 ? `${hours}h ` : ""}${
      minutes > 0 ? `${minutes}m ` : ""
    }${seconds}s`;
  };

  // Get color for step status
  const getStepStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return theme.palette.success.main;
      case "running":
        return theme.palette.warning.main;
      case "failed":
        return theme.palette.error.main;
      case "skipped":
        return theme.palette.info.main;
      default:
        return theme.palette.text.disabled;
    }
  };

  // Active executions count
  const activeExecutionsCount = executions.filter(
    (e) => e.status === "running"
  ).length;

  return (
    <Box>
      {/* Header with stats */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6">
            Active Executions ({activeExecutionsCount})
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Last refreshed: {lastRefreshed.toLocaleTimeString()}
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {/* No active executions message */}
      {activeExecutionsCount === 0 && (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="textSecondary">
            No active automation executions at this time.
          </Typography>
        </Paper>
      )}

      {/* Active executions list */}
      <Grid container spacing={2}>
        {executions
          .filter((execution) => execution.status === "running")
          .map((execution) => (
            <Grid item xs={12} key={execution.id}>
              <Card>
                <CardContent sx={{ pb: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="h6">{execution.name}</Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                      >
                        <Chip
                          size="small"
                          label={
                            execution.type === "playbook" ? "Playbook" : "Rule"
                          }
                          color={
                            execution.type === "playbook"
                              ? "primary"
                              : "secondary"
                          }
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          Triggered by: {execution.triggeredBy.name}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Abort Execution">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleAbortExecution(execution.id)}
                        >
                          <StopIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          expandedExecution === execution.id
                            ? "Collapse"
                            : "Expand"
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleToggleExpand(execution.id)}
                        >
                          {expandedExecution === execution.id ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Progress information */}
                  <Box sx={{ mt: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2">
                        Progress: {calculateProgress(execution)}%
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AccessTimeIcon
                          fontSize="small"
                          sx={{ mr: 0.5, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          Running for {formatElapsedTime(execution.startTime)}
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(execution)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Current step */}
                  {execution.steps.find(
                    (step) => step.status === "running"
                  ) && (
                    <Box
                      sx={{ mt: 1.5, display: "flex", alignItems: "center" }}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mr: 1 }}
                      >
                        Current step:
                      </Typography>
                      <Chip
                        size="small"
                        icon={<PlayArrowIcon />}
                        label={
                          execution.steps.find(
                            (step) => step.status === "running"
                          )?.name || "Unknown"
                        }
                        color="warning"
                      />
                    </Box>
                  )}

                  {/* Step details when expanded */}
                  <Collapse
                    in={expandedExecution === execution.id}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Execution Steps
                    </Typography>
                    <List dense disablePadding>
                      {execution.steps.map((step) => (
                        <ListItem
                          key={step.id}
                          sx={{
                            py: 0.5,
                            borderLeft: `3px solid ${getStepStatusColor(
                              step.status
                            )}`,
                            backgroundColor:
                              step.status === "running"
                                ? alpha(theme.palette.warning.main, 0.05)
                                : "transparent",
                            pl: 2,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {step.status === "completed" && (
                              <CheckCircleIcon
                                color="success"
                                fontSize="small"
                              />
                            )}
                            {step.status === "running" && (
                              <PlayArrowIcon color="warning" fontSize="small" />
                            )}
                            {step.status === "failed" && (
                              <ErrorIcon color="error" fontSize="small" />
                            )}
                            {step.status === "pending" && (
                              <PauseIcon color="disabled" fontSize="small" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={step.name}
                            secondary={
                              <>
                                {step.status !== "pending" &&
                                  step.startTime && (
                                    <Typography
                                      variant="caption"
                                      component="span"
                                    >
                                      Started:{" "}
                                      {new Date(
                                        step.startTime
                                      ).toLocaleTimeString()}
                                      {step.endTime &&
                                        ` • Duration: ${
                                          step.duration
                                            ? `${step.duration}s`
                                            : "..."
                                        }`}
                                    </Typography>
                                  )}
                                {step.status === "pending" && (
                                  <Typography
                                    variant="caption"
                                    component="span"
                                  >
                                    Pending execution
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<StopIcon />}
                        onClick={() => handleAbortExecution(execution.id)}
                      >
                        Abort Execution
                      </Button>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default ActiveExecutionsPanel;
