import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Divider,
  Grid,
  Paper,
  Alert,
  Stack,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Wifi as WifiIcon,
  Router as RouterIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Sensors as SensorsIcon,
  SignalWifi4Bar as SignalIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";
import { useGetWidgetDataQuery } from "../../../services/api/dashboardApiService";
import useWidgetRealTimeData from "../../../hooks/websocket/useWidgetRealTimeData";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define props interface
interface NetworkStatusWidgetProps {
  widget: DashboardWidget;
}

// Define network status data interface
interface NetworkStatusData {
  status: "normal" | "warning" | "critical";
  connectedDevices: number;
  trafficData: {
    inbound: number;
    outbound: number;
    unit: string;
    history?: {
      timestamps: string[];
      inbound: number[];
      outbound: number[];
    };
  };
  anomalies: Array<{
    id: string;
    type: string;
    source: string;
    timestamp: string;
    severity: "low" | "medium" | "high" | "critical";
  }>;
  topSources: Array<{
    ip: string;
    traffic: number;
  }>;
  updatedAt: string;
}

/**
 * Network Status Widget with Real-Time Updates
 *
 * Displays real-time network traffic statistics, connected devices,
 * and potential anomalies with WebSocket updates
 */
const NetworkStatusWidgetWithRealTime: React.FC<NetworkStatusWidgetProps> = ({
  widget,
}) => {
  const theme = useTheme();

  // Generate mock data for history
  const generateMockHistory = () => {
    const timestamps = [];
    const inbound = [];
    const outbound = [];

    const now = new Date();

    for (let i = 10; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      timestamps.push(time.toISOString());
      inbound.push(200 + Math.random() * 100);
      outbound.push(100 + Math.random() * 50);
    }

    return { timestamps, inbound, outbound };
  };

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
  } = useWidgetRealTimeData<NetworkStatusData>(
    widget.id,
    widget.type,
    initialData
  );

  // Merge data from API and WebSocket
  const [mergedData, setMergedData] = useState<NetworkStatusData | undefined>(
    initialData
  );
  const [trafficHistory, setTrafficHistory] = useState(generateMockHistory());

  // Update merged data when either source changes
  useEffect(() => {
    if (realTimeData) {
      // Prefer real-time data when available
      setMergedData(realTimeData);

      // Update traffic history
      if (realTimeData.trafficData && !realTimeData.trafficData.history) {
        setTrafficHistory((prev) => {
          const newTimestamps = [
            ...prev.timestamps.slice(1),
            new Date().toISOString(),
          ];
          const newInbound = [
            ...prev.inbound.slice(1),
            realTimeData.trafficData.inbound,
          ];
          const newOutbound = [
            ...prev.outbound.slice(1),
            realTimeData.trafficData.outbound,
          ];

          return {
            timestamps: newTimestamps,
            inbound: newInbound,
            outbound: newOutbound,
          };
        });
      }
    } else if (initialData && !mergedData) {
      // Use API data if no real-time data yet
      setMergedData(initialData);
    }
  }, [realTimeData, initialData, mergedData]);

  // Mock data for development
  const mockData: NetworkStatusData = {
    status: "normal",
    connectedDevices: 68,
    trafficData: {
      inbound: 256.7,
      outbound: 124.3,
      unit: "Mbps",
      history: trafficHistory,
    },
    anomalies: [
      {
        id: "anomaly-1",
        type: "traffic_spike",
        source: "192.168.1.45",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        severity: "medium",
      },
    ],
    topSources: [
      { ip: "192.168.1.45", traffic: 45.3 },
      { ip: "192.168.1.22", traffic: 32.8 },
      { ip: "192.168.1.105", traffic: 28.4 },
    ],
    updatedAt: new Date().toISOString(),
  };

  // Use real data if available, otherwise use mock data
  const networkData = mergedData || mockData;

  // Add history data if not present
  if (networkData.trafficData && !networkData.trafficData.history) {
    networkData.trafficData.history = trafficHistory;
  }

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
      case "normal":
        return theme.palette.success.main;
      case "warning":
        return theme.palette.warning.main;
      case "critical":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <ErrorIcon fontSize="small" color="error" />;
      case "medium":
        return <WarningIcon fontSize="small" color="warning" />;
      default:
        return <SensorsIcon fontSize="small" color="info" />;
    }
  };

  // Prepare chart data
  const chartData = {
    labels:
      networkData.trafficData.history?.timestamps.map((t) => formatTime(t)) ||
      [],
    datasets: [
      {
        label: "Inbound",
        data: networkData.trafficData.history?.inbound || [],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main + "40", // Add transparency
        fill: true,
        tension: 0.4,
      },
      {
        label: "Outbound",
        data: networkData.trafficData.history?.outbound || [],
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.main + "40", // Add transparency
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: networkData.trafficData.unit,
          font: {
            size: 10,
          },
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      x: {
        ticks: {
          font: {
            size: 9,
          },
          maxRotation: 0,
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

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
          Failed to load network data
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Network status header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <WifiIcon
            sx={{ mr: 0.5, color: getStatusColor(networkData.status) }}
          />
          <Typography variant="subtitle2">Network Status:</Typography>
          <Chip
            size="small"
            label={networkData.status.toUpperCase()}
            sx={{
              ml: 1,
              bgcolor: getStatusColor(networkData.status) + "20",
              color: getStatusColor(networkData.status),
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

      {/* Traffic chart */}
      <Box sx={{ height: 140, mb: 1 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>

      {/* Network stats */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={6}>
          <Paper variant="outlined" sx={{ p: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Devices
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline" }}>
              <Typography variant="h6" sx={{ mr: 0.5, fontWeight: "bold" }}>
                {networkData.connectedDevices}
              </Typography>
              <RouterIcon fontSize="small" color="action" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper variant="outlined" sx={{ p: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Current Traffic
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">
                ↓ {networkData.trafficData.inbound}{" "}
                {networkData.trafficData.unit}
              </Typography>
              <Typography variant="body2">
                ↑ {networkData.trafficData.outbound}{" "}
                {networkData.trafficData.unit}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      {/* Anomalies list */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        <SecurityIcon
          fontSize="small"
          sx={{ mr: 0.5, verticalAlign: "text-bottom" }}
        />
        Recent Anomalies
      </Typography>

      {networkData.anomalies.length === 0 ? (
        <Box sx={{ py: 1, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No anomalies detected
          </Typography>
        </Box>
      ) : (
        <List
          dense
          sx={{
            overflow: "auto",
            maxHeight: 80,
            "& .MuiListItem-root": {
              px: 1,
              py: 0.5,
              borderLeft: 2,
              borderColor: theme.palette.warning.main,
              mb: 0.5,
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          {networkData.anomalies.map((anomaly) => (
            <ListItem key={anomaly.id}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center">
                    {getSeverityIcon(anomaly.severity)}
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {anomaly.type.replace(/_/g, " ")}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {anomaly.source} • {formatTime(anomaly.timestamp)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

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
          Updated: {formatTime(networkData.updatedAt)}
        </Typography>
      </Box>
    </Box>
  );
};

export default NetworkStatusWidgetWithRealTime;
