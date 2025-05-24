import React, { useState, useEffect } from "react";
import { SelectChangeEvent } from "@mui/material";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  ListItemSecondaryAction,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  GetApp as DownloadIcon,
  Timeline as TimelineIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { AuditLogEntry, mockAuditLogs } from "./executionTypes";

const AuditLogsPanel: React.FC = () => {
  const theme = useTheme();
  const [logs, setLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>("24h");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle severity filter change
  const handleSeverityFilterChange = (event: SelectChangeEvent) => {
    setSeverityFilter(event.target.value as string);
  };

  // Handle event type filter change
  const handleEventTypeFilterChange = (event: SelectChangeEvent) => {
    setEventTypeFilter(event.target.value as string);
  };

  // Handle time range filter change
  const handleTimeRangeFilterChange = (event: SelectChangeEvent) => {
    setTimeRangeFilter(event.target.value as string);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSeverityFilter("all");
    setEventTypeFilter("all");
    setTimeRangeFilter("24h");
  };

  // Handle opening log details
  const handleOpenDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  // Handle closing log details
  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedLog(null);
  };

  // Download logs
  const handleDownloadLogs = () => {
    // This would be implemented to export logs as CSV/JSON
    console.log("Downloading logs...");
  };

  // Apply filters to logs
  const filteredLogs = logs.filter((log) => {
    // Apply severity filter
    if (severityFilter !== "all" && log.severity !== severityFilter) {
      return false;
    }

    // Apply event type filter
    if (eventTypeFilter !== "all" && log.eventType !== eventTypeFilter) {
      return false;
    }

    // Apply time range filter
    const logDate = new Date(log.timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);

    if (
      (timeRangeFilter === "1h" && hoursDiff > 1) ||
      (timeRangeFilter === "24h" && hoursDiff > 24) ||
      (timeRangeFilter === "7d" && hoursDiff > 24 * 7)
    ) {
      return false;
    }

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.details.toLowerCase().includes(searchLower) ||
        log.resource.name.toLowerCase().includes(searchLower) ||
        (log.userName && log.userName.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  // Get color for severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return theme.palette.error.main;
      case "warning":
        return theme.palette.warning.main;
      case "info":
      default:
        return theme.palette.info.main;
    }
  };

  // Get icon for severity
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <ErrorIcon sx={{ color: getSeverityColor(severity) }} />;
      case "warning":
        return <WarningIcon sx={{ color: getSeverityColor(severity) }} />;
      case "info":
      default:
        return <InfoIcon sx={{ color: getSeverityColor(severity) }} />;
    }
  };

  // Get icon for event type
  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes("execution_started")) {
      return <PlayArrowIcon />;
    } else if (eventType.includes("execution_completed")) {
      return <CheckCircleIcon />;
    } else if (eventType.includes("execution_failed")) {
      return <ErrorIcon />;
    } else if (eventType.includes("execution_aborted")) {
      return <CancelIcon />;
    } else if (eventType.includes("step_")) {
      return <TimelineIcon />;
    } else if (eventType.includes("configuration_changed")) {
      return <SettingsIcon />;
    } else {
      return <InfoIcon />;
    }
  };

  // Format event type for display
  const formatEventType = (eventType: string) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Unique event types for filter
  const uniqueEventTypes = Array.from(
    new Set(logs.map((log) => log.eventType))
  );

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={handleSearchChange}
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
              <InputLabel id="severity-filter-label">Severity</InputLabel>
              <Select
                labelId="severity-filter-label"
                id="severity-filter"
                value={severityFilter}
                label="Severity"
                onChange={handleSeverityFilterChange}
              >
                <MenuItem value="all">All Severities</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="event-type-filter-label">Event Type</InputLabel>
              <Select
                labelId="event-type-filter-label"
                id="event-type-filter"
                value={eventTypeFilter}
                label="Event Type"
                onChange={handleEventTypeFilterChange}
              >
                <MenuItem value="all">All Event Types</MenuItem>
                {uniqueEventTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {formatEventType(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="time-range-filter-label">Time Range</InputLabel>
              <Select
                labelId="time-range-filter-label"
                id="time-range-filter"
                value={timeRangeFilter}
                label="Time Range"
                onChange={handleTimeRangeFilterChange}
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleResetFilters}
                size="small"
                sx={{ mr: 1 }}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadLogs}
                size="small"
              >
                Export
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Timeline View */}
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Audit Log Timeline</Typography>
          <Button startIcon={<RefreshIcon />} size="small">
            Refresh
          </Button>
        </Box>

        {filteredLogs.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography color="textSecondary">
              No logs found matching the current filters.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ position: "relative" }}>
            {/* Timeline Line */}
            <Box
              sx={{
                position: "absolute",
                left: 20,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                zIndex: 1,
              }}
            />

            {/* Timeline Events */}
            <List sx={{ ml: 2 }}>
              {filteredLogs.map((log) => (
                <ListItem
                  key={log.id}
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                    cursor: "pointer",
                  }}
                  onClick={() => handleOpenDetails(log)}
                >
                  {/* Timeline Node */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: -16,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: getSeverityColor(log.severity),
                      border: `2px solid ${theme.palette.background.paper}`,
                      zIndex: 2,
                    }}
                  />

                  <ListItemIcon>{getEventTypeIcon(log.eventType)}</ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body1" sx={{ mr: 1 }}>
                          {formatEventType(log.eventType)}
                        </Typography>
                        <Chip
                          size="small"
                          label={log.resource.type}
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          size="small"
                          label={log.severity}
                          sx={{
                            backgroundColor: alpha(
                              getSeverityColor(log.severity),
                              0.1
                            ),
                            color: getSeverityColor(log.severity),
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          {log.details}
                        </Typography>
                        <Typography
                          variant="caption"
                          display="block"
                          color="textSecondary"
                        >
                          {new Date(log.timestamp).toLocaleString()} •
                          {log.userName && ` By ${log.userName} • `}
                          Resource: {log.resource.name}
                        </Typography>
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <Tooltip title="View Details">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleOpenDetails(log)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>

      {/* Log Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedLog && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {getSeverityIcon(selectedLog.severity)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {formatEventType(selectedLog.eventType)}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    {selectedLog.details}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Event Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Timestamp"
                        secondary={new Date(
                          selectedLog.timestamp
                        ).toLocaleString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {getSeverityIcon(selectedLog.severity)}
                      </ListItemIcon>
                      <ListItemText
                        primary="Severity"
                        secondary={
                          selectedLog.severity.charAt(0).toUpperCase() +
                          selectedLog.severity.slice(1)
                        }
                      />
                    </ListItem>
                    {selectedLog.userId && (
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="User"
                          secondary={`${selectedLog.userName} (${selectedLog.userId})`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Resource Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Resource Type"
                        secondary={selectedLog.resource.type}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Resource Name"
                        secondary={selectedLog.resource.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <FilterListIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Resource ID"
                        secondary={selectedLog.resource.id}
                      />
                    </ListItem>
                  </List>
                </Grid>

                {selectedLog.executionId && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Related Execution
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography variant="body2">
                            Execution ID: {selectedLog.executionId}
                          </Typography>
                          {selectedLog.stepId && (
                            <Typography variant="body2">
                              Step ID: {selectedLog.stepId}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<TimelineIcon />}
                        >
                          View Execution
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

// Needed for the component since it can't be imported here
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "#4caf50" }}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default AuditLogsPanel;
