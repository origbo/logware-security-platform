import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  WatchLater as WatchLaterIcon,
} from "@mui/icons-material";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";
import useAuth from "../../../features/auth/hooks/useAuth";
import axios from "axios";
import { TOKEN_KEY } from "../../../config/constants";

interface SecurityAlertsSummaryWidgetProps {
  data: any;
  widget: DashboardWidget;
}

// Alert Severity enum
enum AlertSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  INFO = "info",
}

// Alert Status enum
enum AlertStatus {
  NEW = "new",
  ACKNOWLEDGED = "acknowledged",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  FALSE_POSITIVE = "false_positive",
}

// Alert interface
interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  timestamp: string;
  affectedSystems?: string[];
}

// Alert summary data interface
interface AlertsSummaryData {
  totalAlerts: number;
  criticalCount: number;
  highCount: number;
  newAlertsToday: number;
  lastUpdated: string;
  recentAlerts: SecurityAlert[];
}

/**
 * SecurityAlertsSummaryWidget Component
 *
 * Displays a summary of security alerts with severity levels,
 * counts, and recent alerts information
 */
const SecurityAlertsSummaryWidget: React.FC<
  SecurityAlertsSummaryWidgetProps
> = ({ data, widget }) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertStats, setAlertStats] = useState({
    totalAlerts: 0,
    criticalCount: 0,
    highCount: 0,
    newAlertsToday: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);

  // Mock data as fallback
  const mockData: AlertsSummaryData = {
    totalAlerts: 27,
    criticalCount: 3,
    highCount: 8,
    newAlertsToday: 12,
    lastUpdated: new Date().toISOString(),
    recentAlerts: [
      {
        id: "alert-001",
        title: "Brute force attack detected",
        description: "Multiple failed login attempts from IP 203.0.113.42",
        severity: AlertSeverity.CRITICAL,
        status: AlertStatus.NEW,
        source: "Web Application Firewall",
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        affectedSystems: ["auth-server", "admin-portal"],
      },
      {
        id: "alert-002",
        title: "Suspicious outbound traffic",
        description: "Large data transfer to unrecognized IP address",
        severity: AlertSeverity.HIGH,
        status: AlertStatus.ACKNOWLEDGED,
        source: "Network Monitoring",
        timestamp: new Date(Date.now() - 110 * 60000).toISOString(),
        affectedSystems: ["corp-fileserver"],
      },
      {
        id: "alert-003",
        title: "Malware detected",
        description: "Trojan detected on marketing workstation",
        severity: AlertSeverity.HIGH,
        status: AlertStatus.IN_PROGRESS,
        source: "Endpoint Protection",
        timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
        affectedSystems: ["mktg-ws-021"],
      },
      {
        id: "alert-004",
        title: "Configuration change detected",
        description: "Firewall rules modified outside change window",
        severity: AlertSeverity.MEDIUM,
        status: AlertStatus.NEW,
        source: "Configuration Management",
        timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
        affectedSystems: ["edge-firewall-01"],
      },
    ],
  };

  // Fetch alerts data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAlertsData();
    }
  }, [isAuthenticated]);

  // Fetch alerts data from API
  const fetchAlertsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      // API endpoint for security alerts
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/alerts/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update state with fetched data
      if (response.data && response.data.data) {
        const alertsData = response.data.data;
        setAlertStats({
          totalAlerts: alertsData.totalAlerts || 0,
          criticalCount: alertsData.criticalCount || 0,
          highCount: alertsData.highCount || 0,
          newAlertsToday: alertsData.newAlertsToday || 0,
        });
        setRecentAlerts(alertsData.recentAlerts || []);
      }
    } catch (err) {
      console.error("Error fetching alerts data:", err);
      setError("Failed to load security alerts. Please try again later.");

      // Fall back to mock data in case of error
      setRecentAlerts(mockData.recentAlerts);
      setAlertStats({
        totalAlerts: mockData.totalAlerts,
        criticalCount: mockData.criticalCount,
        highCount: mockData.highCount,
        newAlertsToday: mockData.newAlertsToday,
      });
    } finally {
      setLoading(false);
    }
  };

  // Get severity color based on alert severity
  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return theme.palette.error.main;
      case AlertSeverity.HIGH:
        return theme.palette.warning.dark;
      case AlertSeverity.MEDIUM:
        return theme.palette.warning.main;
      case AlertSeverity.LOW:
        return theme.palette.info.main;
      case AlertSeverity.INFO:
        return theme.palette.primary.light;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get severity icon based on alert severity
  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return <ErrorIcon color="error" />;
      case AlertSeverity.HIGH:
        return <WarningIcon sx={{ color: theme.palette.warning.dark }} />;
      case AlertSeverity.MEDIUM:
        return <WarningIcon color="warning" />;
      case AlertSeverity.LOW:
        return <InfoIcon color="info" />;
      case AlertSeverity.INFO:
        return <InfoIcon color="primary" />;
      default:
        return <InfoIcon />;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${
        diffInMinutes === 1 ? "minute" : "minutes"
      } ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
  };

  // Real-time data refresh - poll every 60 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchAlertsData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Use provided data, fetched data, or fallback to mock data
  const alertsData = data?.alertsSummary || {
    totalAlerts: alertStats.totalAlerts || mockData.totalAlerts,
    criticalCount: alertStats.criticalCount || mockData.criticalCount,
    highCount: alertStats.highCount || mockData.highCount,
    newAlertsToday: alertStats.newAlertsToday || mockData.newAlertsToday,
    lastUpdated: new Date().toISOString(),
    recentAlerts:
      recentAlerts.length > 0 ? recentAlerts : mockData.recentAlerts,
  };

  // Handle manual refresh
  const handleRefresh = () => {
    if (isAuthenticated) {
      fetchAlertsData();
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      {/* Show error if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Widget Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SecurityIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
          <Typography variant="h6">Security Alerts</Typography>
        </Box>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Alerts
              </Typography>
              <Typography variant="h5">{alertsData.totalAlerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="subtitle2" color="text.secondary">
                Critical
              </Typography>
              <Typography variant="h5" color="error">
                {alertsData.criticalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="subtitle2" color="text.secondary">
                High
              </Typography>
              <Typography variant="h5" color="warning.dark">
                {alertsData.highCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="subtitle2" color="text.secondary">
                New Today
              </Typography>
              <Typography variant="h5" color="info.main">
                {alertsData.newAlertsToday}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Alerts Section */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Recent Alerts
        </Typography>
        <List disablePadding>
          {alertsData.recentAlerts.map((alert) => (
            <React.Fragment key={alert.id}>
              <ListItem
                sx={{
                  py: 1,
                  borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                  pl: 1.5,
                  bgcolor: alpha(getSeverityColor(alert.severity), 0.05),
                  mb: 1,
                  borderRadius: "4px",
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getSeverityIcon(alert.severity)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {alert.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {alert.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mt: 0.5,
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        <Chip
                          size="small"
                          label={alert.severity}
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            bgcolor: alpha(
                              getSeverityColor(alert.severity),
                              0.1
                            ),
                            color: getSeverityColor(alert.severity),
                            textTransform: "uppercase",
                          }}
                        />
                        <Chip
                          size="small"
                          label={alert.status.replace("_", " ")}
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            textTransform: "capitalize",
                          }}
                        />
                        <Chip
                          size="small"
                          label={alert.source}
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                          }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            ml: "auto",
                            fontSize: "0.7rem",
                            color: "text.secondary",
                          }}
                        >
                          <WatchLaterIcon
                            sx={{ fontSize: "0.9rem", mr: 0.5 }}
                          />
                          {formatTimeAgo(alert.timestamp)}
                        </Box>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: "auto", pt: 1, textAlign: "right" }}>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => (window.location.href = "/alerts")}
          size="small"
        >
          View All Alerts
        </Button>
      </Box>
    </Box>
  );
};

export default SecurityAlertsSummaryWidget;
