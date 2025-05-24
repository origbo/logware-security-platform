import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  useTheme,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Description as ReportIcon,
} from "@mui/icons-material";
import { ComplianceFramework } from "../../pages/compliance/CompliancePage";
import {
  HealthMetric,
  HealthAlert,
  generateComplianceHealthMetrics,
  generateComplianceHealthAlerts,
} from "../../services/integrations/complianceHealthService";
import {
  complianceHealthMonitoring,
  initializeComplianceHealthMonitoring,
} from "../../services/scheduling/complianceHealthMonitoring";
import { getComplianceModuleStatus } from "../../services/integrations/complianceIntegrationService";

// Props for the component
interface ComplianceHealthDashboardProps {
  frameworks: ComplianceFramework[];
}

// Component for displaying health metrics and alerts
const ComplianceHealthDashboard: React.FC<ComplianceHealthDashboardProps> = ({
  frameworks,
}) => {
  const theme = useTheme();

  // State variables
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [moduleStatus, setModuleStatus] = useState<{
    status: "healthy" | "degraded" | "unhealthy";
    lastUpdated: string;
    components: {
      name: string;
      status: "operational" | "degraded" | "offline";
      message?: string;
    }[];
  } | null>(null);
  const [scheduledChecks, setScheduledChecks] = useState<any[]>([]);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
      case "info":
      case "normal":
        return (
          <CheckCircleIcon style={{ color: theme.palette.success.main }} />
        );
      case "degraded":
      case "warning":
        return <WarningIcon style={{ color: theme.palette.warning.main }} />;
      case "unhealthy":
      case "offline":
      case "critical":
        return <ErrorIcon style={{ color: theme.palette.error.main }} />;
      default:
        return <InfoIcon style={{ color: theme.palette.info.main }} />;
    }
  };

  // Get status color based on status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "healthy":
      case "operational":
      case "info":
      case "normal":
        return theme.palette.success.main;
      case "degraded":
      case "warning":
        return theme.palette.warning.main;
      case "unhealthy":
      case "offline":
      case "critical":
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate time since in a readable format
  const getTimeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  // Initialize the health monitoring service
  useEffect(() => {
    const initializeMonitoring = async () => {
      try {
        setLoading(true);

        // Initialize the health monitoring service
        const success = await initializeComplianceHealthMonitoring(
          frameworks,
          (newMetrics, newAlerts) => {
            setMetrics((prev) => [...newMetrics, ...prev].slice(0, 50));
            setAlerts((prev) => [...newAlerts, ...prev].slice(0, 20));
          }
        );

        if (!success) {
          throw new Error("Failed to initialize health monitoring");
        }

        // Get the current health metrics and alerts
        const currentMetrics = generateComplianceHealthMetrics(frameworks);
        const currentAlerts = generateComplianceHealthAlerts(frameworks);

        // Get the module status
        const status = await getComplianceModuleStatus();

        // Get the scheduled checks
        const checks = complianceHealthMonitoring.getScheduledChecks();

        // Update state
        setMetrics(currentMetrics);
        setAlerts(currentAlerts);
        setModuleStatus(status);
        setScheduledChecks(checks);
        setInitialized(true);
        setLoading(false);
      } catch (err) {
        console.error("Error initializing health monitoring:", err);
        setError("Failed to initialize health monitoring. Please try again.");
        setLoading(false);
      }
    };

    initializeMonitoring();

    // Cleanup
    return () => {
      complianceHealthMonitoring.cleanup();
    };
  }, [frameworks]);

  // Refresh the data
  const handleRefresh = async () => {
    try {
      setLoading(true);

      // Run a compliance health check
      await complianceHealthMonitoring.runComplianceHealthCheck(frameworks);

      // Get the module status
      const status = await getComplianceModuleStatus();

      // Get the scheduled checks
      const checks = complianceHealthMonitoring.getScheduledChecks();

      // Update state
      setModuleStatus(status);
      setScheduledChecks(checks);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing health data:", err);
      setError("Failed to refresh health data. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Compliance Health Dashboard</Typography>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button
            color="inherit"
            size="small"
            onClick={() => setError(null)}
            sx={{ ml: 2 }}
          >
            Dismiss
          </Button>
        </Alert>
      )}

      {loading && !initialized && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {initialized && (
        <Grid container spacing={3}>
          {/* Module Status Card */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box sx={{ mr: 2 }}>
                  {moduleStatus && getStatusIcon(moduleStatus.status)}
                </Box>
                <Typography variant="h6">
                  Compliance Module Status:
                  <span
                    style={{
                      marginLeft: "8px",
                      color: moduleStatus
                        ? getStatusColor(moduleStatus.status)
                        : theme.palette.info.main,
                    }}
                  >
                    {moduleStatus
                      ? moduleStatus.status.charAt(0).toUpperCase() +
                        moduleStatus.status.slice(1)
                      : "Unknown"}
                  </span>
                </Typography>
                <Box sx={{ ml: "auto" }}>
                  <Typography variant="caption" color="textSecondary">
                    Last Updated:{" "}
                    {moduleStatus
                      ? formatDate(moduleStatus.lastUpdated)
                      : "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Component</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {moduleStatus?.components.map((component, index) => (
                      <TableRow key={index}>
                        <TableCell>{component.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {getStatusIcon(component.status)}
                            <Typography
                              variant="body2"
                              sx={{
                                ml: 1,
                                color: getStatusColor(component.status),
                              }}
                            >
                              {component.status.charAt(0).toUpperCase() +
                                component.status.slice(1)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {component.message || "No issues reported"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Framework Health Metrics */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Framework Health" avatar={<TimelineIcon />} />
              <CardContent>
                {frameworks.map((framework) => {
                  const frameworkMetric = metrics.find(
                    (m) =>
                      m.name.includes(framework.name) &&
                      m.category === "compliance"
                  );

                  return (
                    <Box key={framework.id} sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2">
                          {framework.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: frameworkMetric
                              ? getStatusColor(frameworkMetric.status)
                              : theme.palette.text.secondary,
                          }}
                        >
                          {frameworkMetric
                            ? `${frameworkMetric.value}${frameworkMetric.unit}`
                            : "N/A"}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          frameworkMetric
                            ? frameworkMetric.value
                            : framework.score
                        }
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: theme.palette.grey[200],
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            backgroundColor: frameworkMetric
                              ? getStatusColor(frameworkMetric.status)
                              : getStatusColor(
                                  framework.score >= 80
                                    ? "healthy"
                                    : framework.score >= 60
                                    ? "degraded"
                                    : "unhealthy"
                                ),
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          {/* Compliance Alerts */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: "100%" }}>
              <CardHeader
                title="Active Compliance Alerts"
                avatar={<ErrorIcon />}
                action={
                  <Chip
                    label={`${alerts.length} alerts`}
                    color={
                      alerts.some((a) => a.severity === "critical")
                        ? "error"
                        : alerts.some((a) => a.severity === "high")
                        ? "warning"
                        : "default"
                    }
                    size="small"
                  />
                }
              />
              <CardContent sx={{ maxHeight: 400, overflow: "auto" }}>
                {alerts.length === 0 ? (
                  <Alert severity="info">No active compliance alerts</Alert>
                ) : (
                  <List>
                    {alerts.map((alert, index) => (
                      <React.Fragment key={alert.id}>
                        {index > 0 && <Divider />}
                        <ListItem alignItems="flex-start">
                          <Box sx={{ mr: 2, pt: 0.5 }}>
                            {alert.severity === "critical" ? (
                              <ErrorIcon color="error" />
                            ) : alert.severity === "high" ? (
                              <WarningIcon color="warning" />
                            ) : (
                              <InfoIcon color="info" />
                            )}
                          </Box>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography variant="subtitle1">
                                  {alert.title}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {getTimeSince(alert.timestamp.toString())}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textPrimary"
                                >
                                  {alert.description}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  <Chip
                                    size="small"
                                    label={alert.severity.toUpperCase()}
                                    sx={{
                                      mr: 1,
                                      backgroundColor: getStatusColor(
                                        alert.severity
                                      ),
                                      color: "#fff",
                                    }}
                                  />
                                  <Chip
                                    size="small"
                                    label={`Source: ${alert.source}`}
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                  />
                                  {alert.affectedItems &&
                                    alert.affectedItems.length > 0 && (
                                      <Chip
                                        size="small"
                                        label={`Affected: ${alert.affectedItems.length}`}
                                        variant="outlined"
                                      />
                                    )}
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Scheduled Health Checks */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Scheduled Health Checks"
                avatar={<ReportIcon />}
              />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Check Name</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Last Run</TableCell>
                        <TableCell>Next Run</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {scheduledChecks.map((check) => (
                        <TableRow key={check.id}>
                          <TableCell>{check.name}</TableCell>
                          <TableCell>
                            {(check.interval / (60 * 1000)).toFixed(0)} minutes
                          </TableCell>
                          <TableCell>
                            {check.lastRun.getTime() > 0
                              ? formatDate(check.lastRun.toISOString())
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            {formatDate(check.nextRun.toISOString())}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={check.active ? "Active" : "Inactive"}
                              color={check.active ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ComplianceHealthDashboard;
