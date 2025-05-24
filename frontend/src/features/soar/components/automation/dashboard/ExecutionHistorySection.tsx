import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  InputAdornment,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  PauseCircle as PauseIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  AutomationExecution,
  ExecutionStep,
  mockHistoricalExecutions,
} from "./executionTypes";

const ExecutionHistorySection: React.FC = () => {
  const theme = useTheme();
  const [executions, setExecutions] = useState<AutomationExecution[]>(
    mockHistoricalExecutions
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedExecution, setSelectedExecution] =
    useState<AutomationExecution | null>(null);
  const [openExecutionDialog, setOpenExecutionDialog] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("7d");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle opening execution details
  const handleOpenExecutionDetails = (execution: AutomationExecution) => {
    setSelectedExecution(execution);
    setOpenExecutionDialog(true);
  };

  // Handle closing execution details
  const handleCloseExecutionDetails = () => {
    setOpenExecutionDialog(false);
    setSelectedExecution(null);
  };

  // Get color for execution status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return theme.palette.success.main;
      case "running":
        return theme.palette.warning.main;
      case "failed":
        return theme.palette.error.main;
      case "aborted":
        return theme.palette.grey[500];
      default:
        return theme.palette.text.disabled;
    }
  };

  // Get icon for execution status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <CheckCircleIcon
            fontSize="small"
            sx={{ color: getStatusColor(status) }}
          />
        );
      case "running":
        return (
          <PlayArrowIcon
            fontSize="small"
            sx={{ color: getStatusColor(status) }}
          />
        );
      case "failed":
        return (
          <ErrorIcon fontSize="small" sx={{ color: getStatusColor(status) }} />
        );
      case "aborted":
        return (
          <CancelIcon fontSize="small" sx={{ color: getStatusColor(status) }} />
        );
      default:
        return (
          <PauseIcon fontSize="small" sx={{ color: getStatusColor(status) }} />
        );
    }
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

  // Apply filters to executions
  const filteredExecutions = executions.filter((execution) => {
    // Apply status filter
    if (statusFilter !== "all" && execution.status !== statusFilter) {
      return false;
    }

    // Apply type filter
    if (typeFilter !== "all" && execution.type !== typeFilter) {
      return false;
    }

    // Apply date range filter (simplified for demo)
    const executionDate = new Date(execution.startTime);
    const now = new Date();
    const daysAgo =
      (now.getTime() - executionDate.getTime()) / (1000 * 60 * 60 * 24);

    if (
      (dateRangeFilter === "1d" && daysAgo > 1) ||
      (dateRangeFilter === "7d" && daysAgo > 7) ||
      (dateRangeFilter === "30d" && daysAgo > 30)
    ) {
      return false;
    }

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        execution.name.toLowerCase().includes(searchLower) ||
        execution.id.toLowerCase().includes(searchLower) ||
        execution.triggeredBy.name.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Calculate statistics
  const totalExecutions = filteredExecutions.length;
  const successfulExecutions = filteredExecutions.filter(
    (e) => e.status === "completed"
  ).length;
  const failedExecutions = filteredExecutions.filter(
    (e) => e.status === "failed"
  ).length;
  const abortedExecutions = filteredExecutions.filter(
    (e) => e.status === "aborted"
  ).length;

  // Success rate calculation
  const successRate =
    totalExecutions > 0
      ? Math.round((successfulExecutions / totalExecutions) * 100)
      : 0;

  // Format duration
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "N/A";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setDateRangeFilter("7d");
    setSearchTerm("");
  };

  // Render step status
  const renderStepStatus = (step: ExecutionStep) => {
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: getStepStatusColor(step.status),
            mr: 1,
          }}
        />
        <Typography variant="body2">
          {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      {/* Statistics Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Executions
            </Typography>
            <Typography variant="h3">{totalExecutions}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                In selected time period
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Success Rate
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color:
                  successRate >= 90
                    ? theme.palette.success.main
                    : successRate >= 70
                    ? theme.palette.warning.main
                    : theme.palette.error.main,
              }}
            >
              {successRate}%
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Chip
                size="small"
                label={`${successfulExecutions} Successful`}
                color="success"
                sx={{ mr: 1 }}
              />
              <Chip
                size="small"
                label={`${failedExecutions} Failed`}
                color="error"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Average Duration
            </Typography>
            <Typography variant="h3">
              {formatDuration(
                filteredExecutions.length > 0
                  ? Math.round(
                      filteredExecutions.reduce(
                        (acc, exec) => acc + (exec.duration || 0),
                        0
                      ) / filteredExecutions.length
                    )
                  : 0
              )}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Per execution
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribution
            </Typography>
            <Typography variant="h3">
              {Math.round(
                (filteredExecutions.filter((e) => e.type === "playbook")
                  .length /
                  Math.max(filteredExecutions.length, 1)) *
                  100
              )}
              %
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Chip
                size="small"
                label="Playbooks"
                color="primary"
                sx={{ mr: 1 }}
              />
              <Chip size="small" label="Rules" color="secondary" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search executions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="aborted">Aborted</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                id="type-filter"
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="playbook">Playbooks</MenuItem>
                <MenuItem value="rule">Rules</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="date-range-filter-label">Time Period</InputLabel>
              <Select
                labelId="date-range-filter-label"
                id="date-range-filter"
                value={dateRangeFilter}
                label="Time Period"
                onChange={(e) => setDateRangeFilter(e.target.value)}
              >
                <MenuItem value="1d">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Execution History Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Triggered By</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExecutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">
                    No executions found matching the current filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredExecutions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((execution) => (
                  <TableRow
                    key={execution.id}
                    hover
                    sx={{
                      "&:hover": {
                        cursor: "pointer",
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.05
                        ),
                      },
                    }}
                    onClick={() => handleOpenExecutionDetails(execution)}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {getStatusIcon(execution.status)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {execution.status.charAt(0).toUpperCase() +
                            execution.status.slice(1)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{execution.name}</TableCell>
                    <TableCell>
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
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(execution.startTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {execution.duration
                        ? formatDuration(execution.duration)
                        : "In progress..."}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Chip
                          size="small"
                          label={execution.triggeredBy.type}
                          sx={{ mr: 1 }}
                        />
                        {execution.triggeredBy.name}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Execution Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenExecutionDetails(execution);
                          }}
                        >
                          <TimelineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredExecutions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Execution Details Dialog */}
      <Dialog
        open={openExecutionDialog}
        onClose={handleCloseExecutionDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedExecution && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {getStatusIcon(selectedExecution.status)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedExecution.name}
                </Typography>
              </Box>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleCloseExecutionDetails}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Basic Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AccessTimeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Start Time"
                        secondary={new Date(
                          selectedExecution.startTime
                        ).toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="End Time"
                        secondary={
                          selectedExecution.endTime
                            ? new Date(
                                selectedExecution.endTime
                              ).toLocaleString()
                            : "In progress..."
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BarChartIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Duration"
                        secondary={
                          selectedExecution.duration
                            ? formatDuration(selectedExecution.duration)
                            : "In progress..."
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Triggered By"
                        secondary={`${selectedExecution.triggeredBy.type}: ${selectedExecution.triggeredBy.name}`}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Execution Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <PlayArrowIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Type"
                        secondary={
                          selectedExecution.type.charAt(0).toUpperCase() +
                          selectedExecution.type.slice(1)
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FilterListIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Source ID"
                        secondary={selectedExecution.sourceId}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Version"
                        secondary={selectedExecution.sourceVersion}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Success Rate"
                        secondary={
                          selectedExecution.successRate !== undefined
                            ? `${Math.round(
                                selectedExecution.successRate * 100
                              )}%`
                            : "N/A"
                        }
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Execution Steps
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Step Name</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Start Time</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Action Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedExecution.steps.map((step) => (
                          <TableRow key={step.id}>
                            <TableCell>{step.order}</TableCell>
                            <TableCell>{step.name}</TableCell>
                            <TableCell>{renderStepStatus(step)}</TableCell>
                            <TableCell>
                              {step.startTime
                                ? new Date(step.startTime).toLocaleTimeString()
                                : "Pending"}
                            </TableCell>
                            <TableCell>
                              {step.duration
                                ? formatDuration(step.duration)
                                : step.status === "running"
                                ? "In progress..."
                                : "N/A"}
                            </TableCell>
                            <TableCell>{step.actionType || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseExecutionDetails} color="primary">
                Close
              </Button>
              {selectedExecution.status === "completed" && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                >
                  Re-run Execution
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ExecutionHistorySection;
