import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Button,
  Link,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  NotificationsActive as AlertIcon,
  SyncProblem as SyncProblemIcon,
} from "@mui/icons-material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";
import { useGetWidgetDataQuery } from "../../../services/api/dashboardApiService";
import useWidgetRealTimeData from "../../../hooks/websocket/useWidgetRealTimeData";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define the props interface
interface AlertsSummaryWidgetProps {
  widget: DashboardWidget;
}

// Define the Alert Severity types
enum AlertSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  INFO = "info",
}

// Alert interface
interface Alert {
  id: string;
  title: string;
  severity: AlertSeverity;
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

// Define the alert data structure
interface AlertsData {
  alertCounts: Record<AlertSeverity, number>;
  totalAlerts: number;
  recentAlerts: Alert[];
  updatedAt: string;
}

/**
 * AlertsSummaryWidget Component with Real-Time Updates
 *
 * Displays a summary of recent alerts grouped by severity with real-time updates
 * via WebSockets. Falls back to REST API polling when WebSocket is unavailable.
 */
const AlertsSummaryWidgetWithRealTime: React.FC<AlertsSummaryWidgetProps> = ({
  widget,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch initial data using RTK Query
  const {
    data: initialData,
    isLoading: isApiLoading,
    error: apiError,
  } = useGetWidgetDataQuery(
    {
      widgetId: widget.id,
      type: widget.type,
      params: widget.settings,
    },
    {
      // Skip if we're in development and want to use mock data
      skip:
        process.env.NODE_ENV === "development" &&
        process.env.REACT_APP_USE_MOCK_DATA === "true",
      // Poll every 30 seconds as a fallback when WebSocket fails
      pollingInterval: 30000,
    }
  );

  // Set up real-time data subscription
  const {
    realTimeData,
    isConnected: isWebSocketConnected,
    error: webSocketError,
  } = useWidgetRealTimeData<AlertsData>(widget.id, widget.type, initialData);

  // Merge data from API and WebSocket
  const [mergedData, setMergedData] = useState<AlertsData | undefined>(
    initialData
  );

  // Update merged data when either source changes
  useEffect(() => {
    if (realTimeData) {
      // Prefer real-time data when available
      setMergedData(realTimeData);
    } else if (initialData && !mergedData) {
      // Use API data if no real-time data yet
      setMergedData(initialData);
    }
  }, [realTimeData, initialData, mergedData]);

  // Mock data for development
  const mockData: AlertsData = {
    alertCounts: {
      [AlertSeverity.CRITICAL]: 3,
      [AlertSeverity.HIGH]: 7,
      [AlertSeverity.MEDIUM]: 12,
      [AlertSeverity.LOW]: 18,
      [AlertSeverity.INFO]: 5,
    },
    totalAlerts: 45,
    recentAlerts: [
      {
        id: "alert-1",
        title: "Failed login attempts detected",
        severity: AlertSeverity.CRITICAL,
        source: "Authentication Service",
        timestamp: "2025-05-15T11:42:00Z",
        acknowledged: false,
      },
      {
        id: "alert-2",
        title: "Unusual network traffic pattern detected",
        severity: AlertSeverity.HIGH,
        source: "Network Monitor",
        timestamp: "2025-05-15T10:58:00Z",
        acknowledged: true,
      },
      {
        id: "alert-3",
        title: "Malware signature match in uploaded file",
        severity: AlertSeverity.CRITICAL,
        source: "Malware Scanner",
        timestamp: "2025-05-15T09:23:00Z",
        acknowledged: false,
      },
    ],
    updatedAt: new Date().toISOString(),
  };

  // Use real data if available, otherwise use mock data
  const alertData = mergedData || mockData;

  // Determine if we're using real-time data
  const isUsingRealTime = isWebSocketConnected && realTimeData !== undefined;

  // Check loading state
  const isLoading = isApiLoading && !mergedData;

  // Check for errors
  const error = apiError || webSocketError;

  // Prepare chart data
  const chartData = {
    labels: ["Critical", "High", "Medium", "Low", "Info"],
    datasets: [
      {
        data: [
          alertData.alertCounts[AlertSeverity.CRITICAL],
          alertData.alertCounts[AlertSeverity.HIGH],
          alertData.alertCounts[AlertSeverity.MEDIUM],
          alertData.alertCounts[AlertSeverity.LOW],
          alertData.alertCounts[AlertSeverity.INFO],
        ],
        backgroundColor: [
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.warning.light,
          theme.palette.info.main,
          theme.palette.info.light,
        ],
        borderWidth: 1,
        borderColor: theme.palette.background.paper,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "70%",
  };

  // Get icon based on severity
  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
      case AlertSeverity.HIGH:
        return <ErrorIcon />;
      case AlertSeverity.MEDIUM:
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Get color based on severity
  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return theme.palette.error.main;
      case AlertSeverity.HIGH:
        return theme.palette.warning.main;
      case AlertSeverity.MEDIUM:
        return theme.palette.warning.light;
      case AlertSeverity.LOW:
        return theme.palette.info.main;
      case AlertSeverity.INFO:
        return theme.palette.info.light;
      default:
        return theme.palette.grey[500];
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  };

  // Navigate to alerts page
  const handleViewAllAlerts = () => {
    navigate("/alerts");
  };

  // Navigate to specific alert
  const handleViewAlert = (alertId: string) => {
    navigate(`/alerts/${alertId}`);
  };

  // Calculate total unacknowledged alerts
  const unacknowledgedAlerts = alertData.recentAlerts.filter(
    (alert: Alert) => !alert.acknowledged
  ).length;

  // If loading, show spinner
  if (isLoading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
          Failed to load alerts data
        </Alert>
        <Button variant="outlined" onClick={handleViewAllAlerts}>
          View Alerts in Full Page
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Alert summary header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          Total Alerts
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Chip
            icon={<AlertIcon />}
            label={`${unacknowledgedAlerts} Unacknowledged`}
            color="error"
            size="small"
            variant="outlined"
            sx={{ mr: 1 }}
          />
          {isUsingRealTime && (
            <Chip
              size="small"
              label="Real-time"
              color="success"
              variant="outlined"
              sx={{
                height: 20,
                "& .MuiChip-label": { px: 1, fontSize: "0.7rem" },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Chart and summary */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          mb: 1,
          flexGrow: 0,
        }}
      >
        {/* Doughnut chart */}
        <Box sx={{ height: 120, width: 120, position: "relative" }}>
          <Doughnut data={chartData} options={chartOptions} />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {alertData.totalAlerts}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
          </Box>
        </Box>

        {/* Alert counts by severity */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            ml: { xs: 0, sm: 2 },
            mt: { xs: 2, sm: 0 },
            flexGrow: 1,
          }}
        >
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: theme.palette.error.main,
                  mr: 1,
                }}
              />
              Critical
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {alertData.alertCounts[AlertSeverity.CRITICAL]}
            </Typography>
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: theme.palette.warning.main,
                  mr: 1,
                }}
              />
              High
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {alertData.alertCounts[AlertSeverity.HIGH]}
            </Typography>
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: theme.palette.warning.light,
                  mr: 1,
                }}
              />
              Medium
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {alertData.alertCounts[AlertSeverity.MEDIUM]}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Recent alerts list */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Recent Alerts
      </Typography>

      <List
        sx={{
          p: 0,
          overflow: "auto",
          flexGrow: 1,
          "& .MuiListItem-root": { px: 1, py: 0.5 },
        }}
      >
        {alertData.recentAlerts.map((alert: Alert) => (
          <ListItem
            key={alert.id}
            button
            onClick={() => handleViewAlert(alert.id)}
            sx={{
              borderLeft: 3,
              borderColor: getSeverityColor(alert.severity),
              mb: 0.5,
              bgcolor: alert.acknowledged ? "transparent" : "action.hover",
              "&:hover": {
                bgcolor: "action.selected",
              },
            }}
          >
            <ListItemAvatar sx={{ minWidth: 36 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: getSeverityColor(alert.severity),
                }}
              >
                {getSeverityIcon(alert.severity)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ fontWeight: alert.acknowledged ? "regular" : "bold" }}
                >
                  {alert.title}
                </Typography>
              }
              secondary={
                <Typography variant="caption" noWrap color="text.secondary">
                  {alert.source} • {formatTimestamp(alert.timestamp)}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box
        sx={{
          mt: "auto",
          pt: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Updated:{" "}
          {formatTimestamp(alertData.updatedAt || new Date().toISOString())}
        </Typography>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAllAlerts}
          size="small"
        >
          View All Alerts
        </Button>
      </Box>
    </Box>
  );
};

export default AlertsSummaryWidgetWithRealTime;
