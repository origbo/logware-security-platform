import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  LinearProgress,
  Alert,
  Paper,
  Grid,
  useTheme,
} from "@mui/material";
import {
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CloudQueue as CloudIcon,
  QueryStats as StatsIcon,
} from "@mui/icons-material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";
import { useGetWidgetDataQuery } from "../../../services/api/dashboardApiService";
import useWidgetRealTimeData from "../../../hooks/websocket/useWidgetRealTimeData";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define props interface
interface SystemHealthWidgetProps {
  widget: DashboardWidget;
}

// Define system health data interface
interface SystemService {
  name: string;
  status: "online" | "warning" | "offline";
  performance: number;
}

interface SystemHealthData {
  status: "healthy" | "warning" | "critical";
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  services: SystemService[];
  updatedAt: string;
}

/**
 * System Health Widget with Real-Time Updates
 *
 * Displays real-time system health metrics including CPU, memory, disk usage,
 * and service status with WebSocket updates
 */
const SystemHealthWidgetWithRealTime: React.FC<SystemHealthWidgetProps> = ({
  widget,
}) => {
  const theme = useTheme();

  // Initial data from REST API
  const {
    data: initialData,
    isLoading: isApiLoading,
    error: apiError,
  } = useGetWidgetDataQuery(
    {
      widgetId: widget.id,
      type: widget.type,
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
  } = useWidgetRealTimeData<SystemHealthData>(
    widget.id,
    widget.type,
    initialData
  );

  // Merge data from API and WebSocket
  const [mergedData, setMergedData] = useState<SystemHealthData | undefined>(
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
  const mockData: SystemHealthData = {
    status: "healthy",
    cpuUsage: 42,
    memoryUsage: 65,
    diskUsage: 78,
    services: [
      { name: "Web Server", status: "online", performance: 98 },
      { name: "Database", status: "online", performance: 87 },
      { name: "Authentication", status: "online", performance: 96 },
      { name: "Monitoring", status: "online", performance: 92 },
      { name: "Log Processing", status: "warning", performance: 78 },
    ],
    updatedAt: new Date().toISOString(),
  };

  // Use real data if available, otherwise use mock data
  const healthData = mergedData || mockData;

  // Determine if we're using real-time data
  const isUsingRealTime = isWebSocketConnected && realTimeData !== undefined;

  // Check loading state
  const isLoading = isApiLoading && !mergedData;

  // Check for errors
  const error = apiError || webSocketError;

  // Format timestamp
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "healthy":
      case "online":
        return theme.palette.success.main;
      case "warning":
        return theme.palette.warning.main;
      case "critical":
      case "offline":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case "warning":
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case "critical":
      case "offline":
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <StatsIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  // Get performance color based on value
  const getPerformanceColor = (value: number): string => {
    if (value >= 90) return theme.palette.success.main;
    if (value >= 70) return theme.palette.success.light;
    if (value >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Generate doughnut chart data
  const chartData = {
    labels: ["CPU", "Memory", "Disk"],
    datasets: [
      {
        data: [
          healthData.cpuUsage,
          healthData.memoryUsage,
          healthData.diskUsage,
        ],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.info.main,
        ],
        borderWidth: 1,
        cutout: "70%",
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
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  // Calculate overall health percentage
  const overallHealth = Math.round(
    (healthData.services.filter((s) => s.status === "online").length /
      healthData.services.length) *
      100
  );

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
          Failed to load system health data
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* System health header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SpeedIcon
            sx={{ mr: 0.5, color: getStatusColor(healthData.status) }}
          />
          <Typography variant="subtitle2">System Status:</Typography>
          <Chip
            size="small"
            label={healthData.status.toUpperCase()}
            sx={{
              ml: 1,
              bgcolor: getStatusColor(healthData.status) + "20",
              color: getStatusColor(healthData.status),
              fontWeight: "bold",
              fontSize: "0.7rem",
            }}
          />
        </Box>
        <Box>
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

      {/* Resource utilization */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={6}>
          {/* Resource usage chart */}
          <Box
            sx={{
              position: "relative",
              height: 120,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Doughnut data={chartData} options={chartOptions} />
            <Box
              sx={{
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", lineHeight: 1.1 }}
              >
                {overallHealth}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Health
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={6}>
          {/* Resource usage metrics */}
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SpeedIcon
                    sx={{
                      fontSize: 14,
                      mr: 0.5,
                      color: theme.palette.primary.main,
                    }}
                  />
                  <Typography variant="caption">CPU</Typography>
                </Box>
                <Typography variant="caption" fontWeight="bold">
                  {healthData.cpuUsage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={healthData.cpuUsage}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  mb: 0.5,
                  backgroundColor: theme.palette.primary.light + "40",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              />
            </Box>

            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MemoryIcon
                    sx={{
                      fontSize: 14,
                      mr: 0.5,
                      color: theme.palette.secondary.main,
                    }}
                  />
                  <Typography variant="caption">Memory</Typography>
                </Box>
                <Typography variant="caption" fontWeight="bold">
                  {healthData.memoryUsage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={healthData.memoryUsage}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  mb: 0.5,
                  backgroundColor: theme.palette.secondary.light + "40",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: theme.palette.secondary.main,
                  },
                }}
              />
            </Box>

            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <StorageIcon
                    sx={{
                      fontSize: 14,
                      mr: 0.5,
                      color: theme.palette.info.main,
                    }}
                  />
                  <Typography variant="caption">Disk</Typography>
                </Box>
                <Typography variant="caption" fontWeight="bold">
                  {healthData.diskUsage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={healthData.diskUsage}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: theme.palette.info.light + "40",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: theme.palette.info.main,
                  },
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      {/* Services list */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        <CloudIcon
          fontSize="small"
          sx={{ mr: 0.5, verticalAlign: "text-bottom" }}
        />
        Service Status
      </Typography>

      <List
        dense
        sx={{
          overflow: "auto",
          flexGrow: 1,
          "& .MuiListItem-root": { px: 1, py: 0.5 },
        }}
      >
        {healthData.services.map((service, index) => (
          <ListItem key={service.name}>
            <ListItemAvatar sx={{ minWidth: 36 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: getStatusColor(service.status) + "20",
                  color: getStatusColor(service.status),
                }}
              >
                {getStatusIcon(service.status)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={<Typography variant="body2">{service.name}</Typography>}
              secondary={
                <LinearProgress
                  variant="determinate"
                  value={service.performance}
                  sx={{
                    height: 4,
                    borderRadius: 1,
                    mt: 0.5,
                    backgroundColor: theme.palette.grey[300],
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getPerformanceColor(service.performance),
                    },
                  }}
                />
              }
            />
            <Box component="span" sx={{ ml: 1 }}>
              <Typography variant="caption" fontWeight="medium">
                {service.performance}%
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>

      {/* Footer with update time */}
      <Box
        sx={{
          mt: "auto",
          pt: 1,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Updated: {formatTime(healthData.updatedAt)}
        </Typography>
      </Box>
    </Box>
  );
};

export default SystemHealthWidgetWithRealTime;
