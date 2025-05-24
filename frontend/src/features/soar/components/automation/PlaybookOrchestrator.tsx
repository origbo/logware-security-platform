import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Badge,
  Divider,
  TextField,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Tooltip,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Save as SaveIcon,
  FileCopy as DuplicateIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon,
  BarChart as AnalyticsIcon,
  ViewList as ListIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

// Types
interface Playbook {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  triggerType: string;
  steps: PlaybookStep[];
  isActive: boolean;
  isEditable: boolean;
  lastModified: string;
  createdBy: string;
  createdAt: string;
  lastRun?: string;
  runCount: number;
  avgDuration?: number;
  successRate?: number;
}

interface PlaybookStep {
  id: string;
  name: string;
  description: string;
  actionType: string;
  parameters: Record<string, any>;
  nextSteps: {
    condition?: string;
    stepId: string;
  }[];
  position: { x: number; y: number };
}

interface PlaybookExecution {
  id: string;
  playbookId: string;
  playbookName: string;
  status: "running" | "completed" | "failed" | "aborted";
  startTime: string;
  endTime?: string;
  triggerSource: string;
  executedBy: string;
  currentStep?: string;
  stepResults: PlaybookStepResult[];
}

interface PlaybookStepResult {
  id: string;
  stepId: string;
  stepName: string;
  status: "success" | "failure" | "skipped" | "running";
  startTime: string;
  endTime?: string;
  output?: any;
  error?: string;
}

// Mock data
const mockPlaybooks: Playbook[] = [
  {
    id: "playbook-1",
    name: "Malware Alert Triage",
    description: "Automatically triage and respond to malware alerts",
    category: "Endpoint Security",
    version: "1.2",
    triggerType: "alert",
    steps: [
      {
        id: "step-1",
        name: "Enrich Alert",
        description: "Gather additional information about the alert",
        actionType: "enrich_alert",
        parameters: {
          alertId: "{{alert.id}}",
          enrichmentSources: ["threatIntel", "assetInventory"],
        },
        nextSteps: [{ stepId: "step-2" }],
        position: { x: 100, y: 100 },
      },
      {
        id: "step-2",
        name: "Check Severity",
        description: "Determine if this is a high-severity alert",
        actionType: "condition_check",
        parameters: {
          condition: '{{alert.severity}} == "high"',
        },
        nextSteps: [
          { condition: "true", stepId: "step-3" },
          { condition: "false", stepId: "step-4" },
        ],
        position: { x: 300, y: 100 },
      },
      {
        id: "step-3",
        name: "Create Incident",
        description: "Create a high-priority incident",
        actionType: "create_incident",
        parameters: {
          title: "High Severity Malware: {{alert.title}}",
          description: "Automatically created from malware alert",
          priority: "high",
        },
        nextSteps: [],
        position: { x: 500, y: 50 },
      },
      {
        id: "step-4",
        name: "Create Task",
        description: "Create a task for routine investigation",
        actionType: "create_task",
        parameters: {
          title: "Review Malware Alert: {{alert.title}}",
          assignee: "tier1-analyst",
          priority: "medium",
        },
        nextSteps: [],
        position: { x: 500, y: 150 },
      },
    ],
    isActive: true,
    isEditable: true,
    lastModified: "2025-05-10T14:30:00Z",
    createdBy: "admin",
    createdAt: "2025-03-15T09:45:00Z",
    lastRun: "2025-05-18T11:20:00Z",
    runCount: 43,
    avgDuration: 35,
    successRate: 0.95,
  },
  {
    id: "playbook-2",
    name: "Phishing Response",
    description: "Respond to reported phishing emails",
    category: "Email Security",
    version: "2.0",
    triggerType: "case",
    steps: [
      {
        id: "step-1",
        name: "Extract Indicators",
        description: "Extract IOCs from the email",
        actionType: "extract_iocs",
        parameters: {
          emailId: "{{case.emailId}}",
          types: ["url", "domain", "hash", "ip"],
        },
        nextSteps: [{ stepId: "step-2" }],
        position: { x: 100, y: 100 },
      },
      {
        id: "step-2",
        name: "Enrich IOCs",
        description: "Enrich extracted IOCs with threat intelligence",
        actionType: "enrich_iocs",
        parameters: {
          iocs: "{{step-1.output.iocs}}",
          sources: ["virustotal", "alienvault", "threatgrid"],
        },
        nextSteps: [{ stepId: "step-3" }],
        position: { x: 300, y: 100 },
      },
      {
        id: "step-3",
        name: "Check Malicious",
        description: "Check if any IOCs are known malicious",
        actionType: "condition_check",
        parameters: {
          condition: "{{step-2.output.maliciousCount}} > 0",
        },
        nextSteps: [
          { condition: "true", stepId: "step-4" },
          { condition: "false", stepId: "step-5" },
        ],
        position: { x: 500, y: 100 },
      },
      // More steps...
    ],
    isActive: true,
    isEditable: true,
    lastModified: "2025-04-20T16:45:00Z",
    createdBy: "admin",
    createdAt: "2025-02-10T08:30:00Z",
    lastRun: "2025-05-19T08:15:00Z",
    runCount: 78,
    avgDuration: 120,
    successRate: 0.88,
  },
  {
    id: "playbook-3",
    name: "Account Lockout Investigation",
    description: "Investigate account lockout events",
    category: "Identity Security",
    version: "1.0",
    triggerType: "alert",
    steps: [
      // Steps would be defined here
    ],
    isActive: false,
    isEditable: true,
    lastModified: "2025-05-05T11:20:00Z",
    createdBy: "security-architect",
    createdAt: "2025-05-01T15:30:00Z",
    runCount: 5,
    avgDuration: 65,
    successRate: 0.6,
  },
];

const mockExecutions: PlaybookExecution[] = [
  {
    id: "exec-1",
    playbookId: "playbook-1",
    playbookName: "Malware Alert Triage",
    status: "completed",
    startTime: "2025-05-18T11:20:00Z",
    endTime: "2025-05-18T11:20:35Z",
    triggerSource: "alert-abc123",
    executedBy: "system",
    stepResults: [
      {
        id: "res-1",
        stepId: "step-1",
        stepName: "Enrich Alert",
        status: "success",
        startTime: "2025-05-18T11:20:00Z",
        endTime: "2025-05-18T11:20:12Z",
      },
      {
        id: "res-2",
        stepId: "step-2",
        stepName: "Check Severity",
        status: "success",
        startTime: "2025-05-18T11:20:12Z",
        endTime: "2025-05-18T11:20:14Z",
      },
      {
        id: "res-3",
        stepId: "step-4",
        stepName: "Create Task",
        status: "success",
        startTime: "2025-05-18T11:20:14Z",
        endTime: "2025-05-18T11:20:35Z",
      },
    ],
  },
  {
    id: "exec-2",
    playbookId: "playbook-2",
    playbookName: "Phishing Response",
    status: "running",
    startTime: "2025-05-19T08:15:00Z",
    triggerSource: "case-xyz789",
    executedBy: "analyst1",
    currentStep: "step-2",
    stepResults: [
      {
        id: "res-1",
        stepId: "step-1",
        stepName: "Extract Indicators",
        status: "success",
        startTime: "2025-05-19T08:15:00Z",
        endTime: "2025-05-19T08:15:25Z",
      },
      {
        id: "res-2",
        stepId: "step-2",
        stepName: "Enrich IOCs",
        status: "running",
        startTime: "2025-05-19T08:15:25Z",
      },
    ],
  },
];

const PlaybookOrchestrator: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [playbooks, setPlaybooks] = useState<Playbook[]>(mockPlaybooks);
  const [executions, setExecutions] =
    useState<PlaybookExecution[]>(mockExecutions);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Get unique categories from playbooks
  const categories = Array.from(new Set(playbooks.map((p) => p.category)));

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter playbooks
  const filteredPlaybooks = playbooks.filter((playbook) => {
    // Apply category filter
    if (selectedCategory && playbook.category !== selectedCategory) {
      return false;
    }

    // Apply search term
    if (
      searchTerm &&
      !playbook.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !playbook.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Toggle playbook active status
  const togglePlaybookActive = (playbookId: string) => {
    setPlaybooks(
      playbooks.map((p) =>
        p.id === playbookId ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  // Dialog handlers
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // For visual representation
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return theme.palette.warning.main;
      case "completed":
        return theme.palette.success.main;
      case "failed":
        return theme.palette.error.main;
      case "aborted":
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return <CircularProgress size={16} />;
      case "completed":
        return <CheckIcon fontSize="small" color="success" />;
      case "failed":
        return <ErrorIcon fontSize="small" color="error" />;
      case "aborted":
        return <StopIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Calculate completion percentages for running playbooks
  const getExecutionProgress = (execution: PlaybookExecution) => {
    const playbook = playbooks.find((p) => p.id === execution.playbookId);
    if (!playbook) return 0;

    const totalSteps = playbook.steps.length;
    const completedSteps = execution.stepResults.filter(
      (r) =>
        r.status === "success" ||
        r.status === "failure" ||
        r.status === "skipped"
    ).length;

    return Math.round((completedSteps / totalSteps) * 100);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Playbook Orchestrator</Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Create Playbook
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<ListIcon />} label="Playbooks" />
          <Tab icon={<TimelineIcon />} label="Executions" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
        </Tabs>
      </Paper>

      {/* Playbooks Tab */}
      <Box role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <>
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Playbooks"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select
                      labelId="category-filter-label"
                      id="category-filter"
                      value={selectedCategory}
                      label="Category"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("");
                      }}
                      sx={{ mr: 1 }}
                    >
                      Clear Filters
                    </Button>
                    <Button variant="outlined" startIcon={<HistoryIcon />}>
                      Import Playbook
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Playbooks Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Trigger Type</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Last Run</TableCell>
                    <TableCell>Run Count</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPlaybooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No playbooks found matching the current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPlaybooks.map((playbook) => (
                      <TableRow key={playbook.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {playbook.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {playbook.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{playbook.category}</TableCell>
                        <TableCell>{playbook.triggerType}</TableCell>
                        <TableCell>v{playbook.version}</TableCell>
                        <TableCell>
                          {playbook.lastRun
                            ? new Date(playbook.lastRun).toLocaleString()
                            : "Never"}
                        </TableCell>
                        <TableCell align="center">
                          {playbook.runCount}
                          {playbook.successRate !== undefined && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mt: 0.5,
                              }}
                            >
                              <Chip
                                size="small"
                                label={`${Math.round(
                                  playbook.successRate * 100
                                )}% Success`}
                                color={
                                  playbook.successRate > 0.9
                                    ? "success"
                                    : playbook.successRate > 0.7
                                    ? "warning"
                                    : "error"
                                }
                              />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={playbook.isActive ? "Active" : "Inactive"}
                            color={playbook.isActive ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <Tooltip title="Edit Playbook">
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={
                                playbook.isActive ? "Deactivate" : "Activate"
                              }
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  togglePlaybookActive(playbook.id)
                                }
                              >
                                {playbook.isActive ? (
                                  <StopIcon fontSize="small" />
                                ) : (
                                  <PlayArrowIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Duplicate">
                              <IconButton size="small">
                                <DuplicateIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Run Playbook">
                              <IconButton
                                size="small"
                                disabled={!playbook.isActive}
                              >
                                <PlayArrowIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>

      {/* Executions Tab */}
      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Playbook</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell>Executed By</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {executions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No playbook executions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  executions.map((execution) => (
                    <TableRow key={execution.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {execution.playbookName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(execution.startTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {execution.endTime
                          ? `${Math.round(
                              (new Date(execution.endTime).getTime() -
                                new Date(execution.startTime).getTime()) /
                                1000
                            )}s`
                          : "Running..."}
                      </TableCell>
                      <TableCell>{execution.triggerSource}</TableCell>
                      <TableCell>{execution.executedBy}</TableCell>
                      <TableCell>
                        {execution.status === "running" ? (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box sx={{ width: "100%", mr: 1 }}>
                              <LinearProgressWithLabel
                                value={getExecutionProgress(execution)}
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Chip
                            size="small"
                            label="100%"
                            color={
                              execution.status === "completed"
                                ? "success"
                                : "error"
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getStatusIcon(execution.status)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {execution.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <TimelineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {execution.status === "running" && (
                            <Tooltip title="Abort Execution">
                              <IconButton size="small">
                                <StopIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Analytics Tab - Just a placeholder */}
      <Box role="tabpanel" hidden={tabValue !== 2}>
        {tabValue === 2 && (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6">Playbook Analytics</Typography>
            <Typography variant="body1" color="textSecondary">
              This tab would display analytics about playbook performance,
              including success rates, average execution times, and trends over
              time.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* New Playbook Dialog - Simplified placeholder */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Playbook</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            This dialog would contain a form for creating a new playbook, with
            options for playbook metadata, trigger configuration, and a visual
            editor for designing the playbook workflow.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            For a full implementation, this would include a canvas for visually
            designing playbook steps, condition branching, and action
            configuration.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper component for linear progress with label
interface LinearProgressWithLabelProps {
  value: number;
}

const LinearProgressWithLabel: React.FC<LinearProgressWithLabelProps> = ({
  value,
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <div
          style={{
            height: 10,
            backgroundColor: "#e0e0e0",
            borderRadius: 5,
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${value}%`,
              height: "100%",
              backgroundColor: "#2196f3",
              borderRadius: 5,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          value
        )}%`}</Typography>
      </Box>
    </Box>
  );
};

export default PlaybookOrchestrator;
