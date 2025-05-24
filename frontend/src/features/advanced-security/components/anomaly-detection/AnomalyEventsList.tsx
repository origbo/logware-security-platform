/**
 * Anomaly Events List
 *
 * Component for displaying and filtering anomaly events
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Divider,
  FormControlLabel,
  Switch,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Block as BlockIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";

import {
  AnomalyEvent,
  AnomalyType,
  AnomalySeverity,
  AnomalyStatus,
} from "../../types/anomalyTypes";
import { useUpdateAnomalyEventStatusMutation } from "../../services/anomalyDetectionService";

interface AnomalyEventsListProps {
  events: AnomalyEvent[];
  isLoading: boolean;
  onEventSelect: (eventId: string) => void;
}

// Severity to color mapping
const getSeverityColor = (severity: AnomalySeverity): string => {
  switch (severity) {
    case "CRITICAL":
      return "#d32f2f"; // red
    case "HIGH":
      return "#f57c00"; // orange
    case "MEDIUM":
      return "#fbc02d"; // yellow
    case "LOW":
      return "#388e3c"; // green
    case "INFO":
      return "#1976d2"; // blue
    default:
      return "#757575"; // grey
  }
};

// Status to icon mapping
const getStatusIcon = (status: AnomalyStatus) => {
  switch (status) {
    case "NEW":
      return <ErrorIcon color="error" />;
    case "INVESTIGATING":
      return <WarningIcon color="warning" />;
    case "FALSE_POSITIVE":
      return <InfoIcon color="info" />;
    case "RESOLVED":
      return <CheckCircleIcon color="success" />;
    case "IGNORED":
      return <InfoIcon color="disabled" />;
    default:
      return null;
  }
};

const AnomalyEventsList: React.FC<AnomalyEventsListProps> = ({
  events,
  isLoading,
  onEventSelect,
}) => {
  const theme = useTheme();

  // Mutation for updating event status
  const [updateEventStatus, { isLoading: isUpdating }] =
    useUpdateAnomalyEventStatusMutation();

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    severity: [] as AnomalySeverity[],
    type: [] as AnomalyType[],
    status: [] as AnomalyStatus[],
    startDate: "",
    endDate: "",
  });

  // Show filters
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Filtered events
  const [filteredEvents, setFilteredEvents] = useState<AnomalyEvent[]>(events);

  // Apply filters effect
  useEffect(() => {
    let result = [...events];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (event) =>
          event.description.toLowerCase().includes(searchLower) ||
          event.source.toLowerCase().includes(searchLower) ||
          event.affectedResource.toLowerCase().includes(searchLower) ||
          event.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply severity filter
    if (filters.severity.length > 0) {
      result = result.filter((event) =>
        filters.severity.includes(event.severity)
      );
    }

    // Apply type filter
    if (filters.type.length > 0) {
      result = result.filter((event) => filters.type.includes(event.type));
    }

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter((event) => filters.status.includes(event.status));
    }

    // Apply date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate).getTime();
      result = result.filter(
        (event) => new Date(event.timestamp).getTime() >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate).getTime();
      result = result.filter(
        (event) => new Date(event.timestamp).getTime() <= endDate
      );
    }

    // Update filtered events
    setFilteredEvents(result);
    // Reset to first page when filters change
    setPage(0);
  }, [events, filters]);

  // Handle filter change
  const handleFilterChange = (name: string, value: any) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Handle pagination change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle status update
  const handleStatusUpdate = async (
    eventId: string,
    newStatus: AnomalyStatus
  ) => {
    try {
      await updateEventStatus({ id: eventId, status: newStatus }).unwrap();
    } catch (error) {
      console.error("Failed to update event status:", error);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      severity: [],
      type: [],
      status: [],
      startDate: "",
      endDate: "",
    });
  };

  // Get filtered and paginated events
  const paginatedEvents = filteredEvents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search Anomalies"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by description, source, resource..."
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    type="date"
                    label="From"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="date"
                    label="To"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Button
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
            >
              Filters
            </Button>
          </Grid>

          <Grid item xs={6} sm={3} md={1}>
            <Tooltip title="Reset Filters">
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleResetFilters}
                disabled={
                  !filters.search &&
                  filters.severity.length === 0 &&
                  filters.type.length === 0 &&
                  filters.status.length === 0 &&
                  !filters.startDate &&
                  !filters.endDate
                }
                fullWidth
              >
                Reset
              </Button>
            </Tooltip>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  color="primary"
                />
              }
              label="Auto-refresh"
            />
          </Grid>
        </Grid>

        {showFilters && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    multiple
                    value={filters.severity}
                    onChange={(e) =>
                      handleFilterChange("severity", e.target.value)
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as AnomalySeverity[]).map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            size="small"
                            sx={{
                              bgcolor: getSeverityColor(value),
                              color: "white",
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(AnomalySeverity).map((severity) => (
                      <MenuItem key={severity} value={severity}>
                        <Chip
                          label={severity}
                          size="small"
                          sx={{
                            bgcolor: getSeverityColor(
                              severity as AnomalySeverity
                            ),
                            color: "white",
                            mr: 1,
                          }}
                        />
                        {severity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    multiple
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as AnomalyType[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(AnomalyType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as AnomalyStatus[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(AnomalyStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box sx={{ mr: 1 }}>
                            {getStatusIcon(status as AnomalyStatus)}
                          </Box>
                          {status}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Events Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Severity</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <CircularProgress sx={{ my: 3 }} />
                </TableCell>
              </TableRow>
            ) : paginatedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ my: 3 }}
                  >
                    No anomaly events found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEvents.map((event) => (
                <TableRow key={event.id} hover>
                  <TableCell>
                    <Chip
                      label={event.severity}
                      size="small"
                      sx={{
                        bgcolor: getSeverityColor(event.severity),
                        color: "white",
                      }}
                    />
                  </TableCell>
                  <TableCell>{event.description}</TableCell>
                  <TableCell>{event.type}</TableCell>
                  <TableCell>{event.source}</TableCell>
                  <TableCell>{event.affectedResource}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ mr: 1 }}>{getStatusIcon(event.status)}</Box>
                      {event.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(event.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 40,
                          mr: 1,
                          bgcolor: theme.palette.grey[200],
                          borderRadius: 1,
                          height: 4,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${event.mlConfidence}%`,
                            bgcolor:
                              event.mlConfidence > 85
                                ? theme.palette.error.main
                                : event.mlConfidence > 70
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                          }}
                        />
                      </Box>
                      {event.mlConfidence}%
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => onEventSelect(event.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {event.status === "NEW" && (
                        <Tooltip title="Mark as Investigating">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() =>
                              handleStatusUpdate(
                                event.id,
                                AnomalyStatus.INVESTIGATING
                              )
                            }
                            disabled={isUpdating}
                          >
                            <AssignmentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {(event.status === "NEW" ||
                        event.status === "INVESTIGATING") && (
                        <Tooltip title="Mark as False Positive">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() =>
                              handleStatusUpdate(
                                event.id,
                                AnomalyStatus.FALSE_POSITIVE
                              )
                            }
                            disabled={isUpdating}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {(event.status === "NEW" ||
                        event.status === "INVESTIGATING") && (
                        <Tooltip title="Mark as Resolved">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() =>
                              handleStatusUpdate(
                                event.id,
                                AnomalyStatus.RESOLVED
                              )
                            }
                            disabled={isUpdating}
                          >
                            <CheckCircleIcon fontSize="small" />
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
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredEvents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Summary Statistics */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Total Events: {filteredEvents.length}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Critical Events:{" "}
              {filteredEvents.filter((e) => e.severity === "CRITICAL").length}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              New Events:{" "}
              {filteredEvents.filter((e) => e.status === "NEW").length}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" color="textSecondary">
              Average Confidence:{" "}
              {filteredEvents.length > 0
                ? (
                    filteredEvents.reduce(
                      (acc, curr) => acc + curr.mlConfidence,
                      0
                    ) / filteredEvents.length
                  ).toFixed(1)
                : "N/A"}
              %
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AnomalyEventsList;
