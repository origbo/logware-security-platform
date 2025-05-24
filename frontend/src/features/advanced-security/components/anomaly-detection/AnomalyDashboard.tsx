/**
 * Anomaly Detection Dashboard
 *
 * Main component for the ML-based anomaly detection feature
 */
import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Chip,
  Button,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  ShowChart as ChartIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  BugReport as BugReportIcon,
} from "@mui/icons-material";

import {
  useGetAnomalyEventsQuery,
  useGetAnomalyStatsQuery,
} from "../../services/anomalyDetectionService";
import {
  AnomalyEvent,
  AnomalyType,
  AnomalySeverity,
  AnomalyStatus,
} from "../../types/anomalyTypes";
import AnomalyEventsList from "./AnomalyEventsList";
import AnomalyRulesList from "./AnomalyRulesList";
import AnomalyEventDetails from "./AnomalyEventDetails";

// Interface for tab panel props
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
      id={`anomaly-tabpanel-${index}`}
      aria-labelledby={`anomaly-tab-${index}`}
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
    id: `anomaly-tab-${index}`,
    "aria-controls": `anomaly-tabpanel-${index}`,
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

const AnomalyDashboard: React.FC = () => {
  const theme = useTheme();

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Selected event state
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch data
  const {
    data: events,
    isLoading: isEventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useGetAnomalyEventsQuery();
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useGetAnomalyStatsQuery({ timeRange: "30d" });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle event selection
  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    setTabValue(2); // Switch to details tab
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchEvents();
    refetchStats();
  };

  // Prepare data for charts
  const severityData = stats
    ? Object.entries(stats.bySeverity).map(([key, value]) => ({
        name: key,
        value: value,
        color: getSeverityColor(key as AnomalySeverity),
      }))
    : [];

  const typeData = stats
    ? Object.entries(stats.byType).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];

  const statusData = stats
    ? Object.entries(stats.byStatus).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];

  const trendData = stats?.trend || [];

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <BugReportIcon fontSize="large" color="primary" />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              ML-Based Anomaly Detection
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monitor system behavior, detect anomalies, and respond to
              potential security incidents
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button variant="contained" startIcon={<SettingsIcon />}>
              Configure
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      {isStatsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : statsError ? (
        <Typography color="error">Error loading statistics data</Typography>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  Total Anomalies
                </Typography>
                <Typography variant="h4" component="div">
                  {stats?.total || 0}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  Critical Anomalies
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="h4" component="div" sx={{ mr: 1 }}>
                    {stats?.bySeverity?.CRITICAL || 0}
                  </Typography>
                  <Chip
                    label="Critical"
                    size="small"
                    sx={{
                      bgcolor: getSeverityColor("CRITICAL"),
                      color: "white",
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Requiring immediate attention
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  New Anomalies
                </Typography>
                <Typography variant="h4" component="div">
                  {stats?.byStatus?.NEW || 0}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Waiting for investigation
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                >
                  Today's Anomalies
                </Typography>
                <Typography variant="h4" component="div">
                  {trendData.length > 0
                    ? trendData[trendData.length - 1].count
                    : 0}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Detected in the last 24 hours
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs and Content */}
      <Paper
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="anomaly detection tabs"
          >
            <Tab
              label="Dashboard"
              icon={<ChartIcon />}
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              label="Anomaly Events"
              icon={<TimelineIcon />}
              iconPosition="start"
              {...a11yProps(1)}
            />
            {selectedEventId && (
              <Tab
                label="Event Details"
                icon={<StorageIcon />}
                iconPosition="start"
                {...a11yProps(2)}
              />
            )}
            <Tab
              label="Detection Rules"
              icon={<SecurityIcon />}
              iconPosition="start"
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          {/* Dashboard Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Anomalies by Severity */}
              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: "100%" }}>
                  <CardHeader title="Anomalies by Severity" />
                  <Divider />
                  <CardContent sx={{ height: 300 }}>
                    {isStatsLoading ? (
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
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={severityData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {severityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Anomalies by Type */}
              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: "100%" }}>
                  <CardHeader title="Anomalies by Type" />
                  <Divider />
                  <CardContent sx={{ height: 300 }}>
                    {isStatsLoading ? (
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
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={typeData}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill={theme.palette.primary.main}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Anomalies by Status */}
              <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ height: "100%" }}>
                  <CardHeader title="Anomalies by Status" />
                  <Divider />
                  <CardContent sx={{ height: 300 }}>
                    {isStatsLoading ? (
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
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={statusData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill={theme.palette.secondary.main}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Anomaly Trend */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Anomaly Trend (Last 30 Days)" />
                  <Divider />
                  <CardContent sx={{ height: 300 }}>
                    {isStatsLoading ? (
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
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={trendData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="count"
                            name="Anomalies"
                            stroke={theme.palette.primary.main}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Anomaly Sources */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Top Anomaly Sources" />
                  <Divider />
                  <CardContent sx={{ height: 300 }}>
                    {isStatsLoading ? (
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
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats?.topSources || []}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="source" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            name="Count"
                            fill={theme.palette.info.main}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Recently Detected Anomalies */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%" }}>
                  <CardHeader
                    title="Recently Detected Anomalies"
                    action={
                      <Button size="small" onClick={() => setTabValue(1)}>
                        View All
                      </Button>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 300, overflow: "auto" }}>
                    {isEventsLoading ? (
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
                    ) : events && events.length > 0 ? (
                      <Box>
                        {events.slice(0, 5).map((event) => (
                          <Box
                            key={event.id}
                            sx={{
                              p: 1.5,
                              mb: 1,
                              borderRadius: 1,
                              bgcolor: "background.default",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Box sx={{ mr: 1.5 }}>
                              {getStatusIcon(event.status)}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 0.5,
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ mr: 1 }}>
                                  {event.description}
                                </Typography>
                                <Chip
                                  label={event.severity}
                                  size="small"
                                  sx={{
                                    bgcolor: getSeverityColor(event.severity),
                                    color: "white",
                                    fontSize: "0.7rem",
                                    height: 20,
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" color="textSecondary">
                                {new Date(event.timestamp).toLocaleString()} •{" "}
                                {event.source}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEventSelect(event.id)}
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ textAlign: "center", mt: 2 }}
                      >
                        No anomaly events detected
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Anomaly Events Tab */}
          <TabPanel value={tabValue} index={1}>
            <AnomalyEventsList
              events={events || []}
              isLoading={isEventsLoading}
              onEventSelect={handleEventSelect}
            />
          </TabPanel>

          {/* Event Details Tab */}
          <TabPanel value={tabValue} index={2}>
            {selectedEventId && (
              <AnomalyEventDetails
                eventId={selectedEventId}
                onBack={() => setTabValue(1)}
              />
            )}
          </TabPanel>

          {/* Detection Rules Tab */}
          <TabPanel value={tabValue} index={3}>
            <AnomalyRulesList />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default AnomalyDashboard;
