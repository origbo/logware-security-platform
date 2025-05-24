/**
 * Anomaly Event Details
 *
 * Component for displaying detailed information about an anomaly event
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Code as CodeIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import ReactJson from "react-json-view";

import {
  useGetAnomalyEventQuery,
  useUpdateAnomalyEventStatusMutation,
} from "../../services/anomalyDetectionService";
import { AnomalySeverity, AnomalyStatus } from "../../types/anomalyTypes";

interface AnomalyEventDetailsProps {
  eventId: string;
  onBack: () => void;
}

// Tab panel interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-detail-tabpanel-${index}`}
      aria-labelledby={`event-detail-tab-${index}`}
      {...other}
      style={{ width: "100%", height: "100%" }}
    >
      {value === index && <Box sx={{ pt: 2, height: "100%" }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
const a11yProps = (index: number) => {
  return {
    id: `event-detail-tab-${index}`,
    "aria-controls": `event-detail-tabpanel-${index}`,
  };
};

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

const AnomalyEventDetails: React.FC<AnomalyEventDetailsProps> = ({
  eventId,
  onBack,
}) => {
  const theme = useTheme();

  // Fetch event data
  const { data: event, isLoading, error } = useGetAnomalyEventQuery(eventId);

  // Mutation for updating event status
  const [updateEventStatus, { isLoading: isUpdating }] =
    useUpdateAnomalyEventStatusMutation();

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Status update state
  const [newStatus, setNewStatus] = useState<AnomalyStatus | "">("");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (newStatus) {
      try {
        await updateEventStatus({
          id: eventId,
          status: newStatus,
          assignedTo: assignedTo || undefined,
          notes: notes || undefined,
        }).unwrap();

        // Reset form
        setNewStatus("");
        setAssignedTo("");
        setNotes("");
      } catch (error) {
        console.error("Failed to update event status:", error);
      }
    }
  };

  // Prepare related events data
  const relatedEventsColumns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "type", headerName: "Type", width: 150 },
    { field: "severity", headerName: "Severity", width: 120 },
    { field: "description", headerName: "Description", flex: 1, minWidth: 200 },
    { field: "timestamp", headerName: "Timestamp", width: 180 },
  ];

  // Mock related events (would come from the actual event in a real implementation)
  const relatedEvents = event?.relatedEvents
    ? [
        {
          id: "rel-1",
          type: "AUTHENTICATION",
          severity: "MEDIUM",
          description: "Failed login attempt from same source IP",
          timestamp: new Date(Date.now() - 120000).toISOString(),
        },
        {
          id: "rel-2",
          type: "NETWORK",
          severity: "LOW",
          description: "Unusual outbound connection from affected resource",
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
      ]
    : [];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
          Back to List
        </Button>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error" variant="h6">
            Error loading anomaly event details
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            The event may have been deleted or there was a problem with the
            server.
          </Typography>
          <Button variant="contained" onClick={onBack} sx={{ mt: 2 }}>
            Return to List
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h5" component="h1">
          Anomaly Event Details
        </Typography>
      </Box>

      {/* Summary Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={9}>
            <Typography variant="h6" gutterBottom>
              {event.description}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Chip
                label={event.severity}
                size="small"
                sx={{
                  bgcolor: getSeverityColor(event.severity),
                  color: "white",
                  mr: 1,
                }}
              />
              <Chip label={event.type} size="small" sx={{ mr: 1 }} />
              <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                <Box sx={{ mr: 1 }}>{getStatusIcon(event.status)}</Box>
                <Typography variant="body2">{event.status}</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Source:</strong> {event.source}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Affected Resource:</strong> {event.affectedResource}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Timestamp:</strong>{" "}
              {new Date(event.timestamp).toLocaleString()}
            </Typography>
            {event.assignedTo && (
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Assigned To:</strong> {event.assignedTo}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader title="ML Confidence" />
              <CardContent sx={{ textAlign: "center" }}>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={event.mlConfidence}
                    size={80}
                    thickness={5}
                    sx={{
                      color:
                        event.mlConfidence > 85
                          ? theme.palette.error.main
                          : event.mlConfidence > 70
                          ? theme.palette.warning.main
                          : theme.palette.success.main,
                    }}
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
                      {`${event.mlConfidence}%`}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  {event.mlConfidence > 85
                    ? "High Confidence"
                    : event.mlConfidence > 70
                    ? "Medium Confidence"
                    : "Low Confidence"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="anomaly event detail tabs"
          >
            <Tab
              label="Raw Data"
              icon={<CodeIcon />}
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              label="Related Events"
              icon={<TimelineIcon />}
              iconPosition="start"
              {...a11yProps(1)}
            />
            <Tab
              label="Status Management"
              icon={<AssignmentIcon />}
              iconPosition="start"
              {...a11yProps(2)}
            />
          </Tabs>
        </Box>

        {/* Raw Data Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Raw Event Data
            </Typography>
            <Paper sx={{ p: 2, bgcolor: theme.palette.grey[100] }}>
              <ReactJson
                src={event.rawData}
                theme="rjv-default"
                displayDataTypes={false}
                name={false}
                collapsed={1}
                enableClipboard={true}
                style={{ fontFamily: "monospace", fontSize: "0.9rem" }}
              />
            </Paper>
          </Box>
        </TabPanel>

        {/* Related Events Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2, height: 400 }}>
            <Typography variant="subtitle1" gutterBottom>
              Related Events
            </Typography>
            {relatedEvents.length > 0 ? (
              <DataGrid
                rows={relatedEvents}
                columns={relatedEventsColumns}
                autoHeight
                pageSize={5}
                rowsPerPageOptions={[5, 10, 25]}
                disableSelectionOnClick
              />
            ) : (
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="textSecondary">
                  No related events found
                </Typography>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* Status Management Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Update Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>New Status</InputLabel>
                  <Select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as AnomalyStatus)
                    }
                    label="New Status"
                  >
                    <MenuItem value="">
                      <em>Select a status</em>
                    </MenuItem>
                    {Object.values(AnomalyStatus).map((status) => (
                      <MenuItem
                        key={status}
                        value={status}
                        disabled={status === event.status}
                      >
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
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Assign To"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Enter username or team"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={4}
                  placeholder="Enter any notes about this status change"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || isUpdating}
                >
                  Update Status
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom>
              Status History
            </Typography>
            {/* This would be real data in a production environment */}
            <Paper sx={{ p: 2 }}>
              <Box
                sx={{
                  mb: 2,
                  pb: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Box sx={{ mr: 1 }}>{getStatusIcon(event.status)}</Box>
                  <Typography variant="subtitle2">{event.status}</Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ ml: 2 }}
                  >
                    {new Date().toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {event.assignedTo
                    ? `Assigned to ${event.assignedTo}`
                    : "Not assigned"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Initial detection
                </Typography>
              </Box>
            </Paper>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AnomalyEventDetails;
