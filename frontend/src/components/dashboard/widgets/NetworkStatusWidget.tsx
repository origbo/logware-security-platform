import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Router as RouterIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Speed as SpeedIcon,
  UploadFile as UploadIcon,
  CloudDownload as DownloadIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  DeviceHub as DeviceHubIcon,
  Cloud as CloudIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";
import { ExtendedDashboardWidget } from "../../../features/dashboard/types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

// Define props interface
interface NetworkStatusWidgetProps {
  data: Record<string, unknown> | null;
  widget: ExtendedDashboardWidget;
}

// Define device status
enum DeviceStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  DEGRADED = "degraded",
  WARNING = "warning",
}

// Define network interface
interface NetworkInterface {
  id: string;
  name: string;
  type: string;
  status: DeviceStatus;
  ipAddress: string;
  macAddress: string;
  bandwidth: {
    current: number;
    max: number;
    unit: string;
  };
  traffic: {
    inbound: number;
    outbound: number;
    unit: string;
  };
}

// Define traffic history
interface TrafficHistory {
  timestamps: string[];
  inbound: number[];
  outbound: number[];
}

/**
 * NetworkStatusWidget Component
 *
 * Displays network status information including device status,
 * bandwidth usage, and traffic patterns
 */
const NetworkStatusWidget: React.FC<NetworkStatusWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedInterface, setSelectedInterface] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("1h");

  // Mock data for development
  const mockData = {
    interfaces: [
      {
        id: "if-1",
        name: "Internet Gateway",
        type: "WAN",
        status: DeviceStatus.ONLINE,
        ipAddress: "203.0.113.1",
        macAddress: "00:1A:2B:3C:4D:5E",
        bandwidth: {
          current: 450,
          max: 1000,
          unit: "Mbps",
        },
        traffic: {
          inbound: 32.5,
          outbound: 18.2,
          unit: "MB/s",
        },
      },
      {
        id: "if-2",
        name: "Internal Network",
        type: "LAN",
        status: DeviceStatus.ONLINE,
        ipAddress: "192.168.1.1",
        macAddress: "00:1A:2B:3C:4D:5F",
        bandwidth: {
          current: 320,
          max: 1000,
          unit: "Mbps",
        },
        traffic: {
          inbound: 28.3,
          outbound: 15.1,
          unit: "MB/s",
        },
      },
      {
        id: "if-3",
        name: "DMZ",
        type: "DMZ",
        status: DeviceStatus.WARNING,
        ipAddress: "172.16.0.1",
        macAddress: "00:1A:2B:3C:4D:60",
        bandwidth: {
          current: 120,
          max: 1000,
          unit: "Mbps",
        },
        traffic: {
          inbound: 10.2,
          outbound: 5.8,
          unit: "MB/s",
        },
      },
      {
        id: "if-4",
        name: "VPN",
        type: "VPN",
        status: DeviceStatus.DEGRADED,
        ipAddress: "10.8.0.1",
        macAddress: "00:1A:2B:3C:4D:61",
        bandwidth: {
          current: 45,
          max: 100,
          unit: "Mbps",
        },
        traffic: {
          inbound: 4.3,
          outbound: 2.1,
          unit: "MB/s",
        },
      },
    ],
    trafficHistory: {
      "1h": {
        timestamps: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMinutes(date.getMinutes() - (11 - i) * 5);
          return date.toISOString();
        }),
        inbound: [28, 32, 35, 29, 33, 36, 34, 39, 42, 38, 36, 32],
        outbound: [15, 18, 20, 17, 19, 22, 21, 23, 25, 22, 20, 18],
      },
      "6h": {
        timestamps: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMinutes(date.getMinutes() - (11 - i) * 30);
          return date.toISOString();
        }),
        inbound: [25, 30, 35, 40, 45, 42, 38, 35, 39, 41, 38, 36],
        outbound: [15, 18, 20, 22, 25, 24, 22, 19, 21, 23, 22, 20],
      },
      "24h": {
        timestamps: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setHours(date.getHours() - (11 - i) * 2);
          return date.toISOString();
        }),
        inbound: [30, 25, 20, 15, 10, 15, 25, 35, 45, 40, 35, 30],
        outbound: [18, 15, 12, 8, 5, 8, 15, 22, 25, 22, 18, 16],
      },
    },
    connectedDevices: 42,
    anomalies: 2,
    lastUpdated: "2025-05-15T12:45:00Z",
  };

  // Define the type for the network data
  type NetworkData = {
    interfaces: NetworkInterface[];
    trafficHistory: Record<string, TrafficHistory>;
    connectedDevices: number;
    anomalies: number;
    lastUpdated: string;
  };

  // Use real data if available, otherwise use mock data
  const networkData: NetworkData = (data as NetworkData) || mockData;

  // Set default selected interface if not set and data is available
  React.useEffect(() => {
    if (networkData.interfaces.length > 0 && !selectedInterface) {
      setSelectedInterface(networkData.interfaces[0].id);
    }
  }, [networkData, selectedInterface]);

  // Get the selected interface data
  const getSelectedInterface = (): NetworkInterface | undefined => {
    return networkData.interfaces.find((intf) => intf.id === selectedInterface);
  };

  // Get the traffic history data for the current time range
  const getTrafficHistory = (): TrafficHistory => {
    return networkData.trafficHistory[
      timeRange as keyof typeof networkData.trafficHistory
    ];
  };

  // Format timestamps for chart display
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    if (timeRange === "1h" || timeRange === "6h") {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleString([], {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Prepare chart data
  const trafficHistory = getTrafficHistory();
  const chartData = {
    labels: trafficHistory.timestamps.map((ts) => formatTimestamp(ts)),
    datasets: [
      {
        label: "Inbound",
        data: trafficHistory.inbound,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        tension: 0.4,
        fill: true,
      },
      {
        label: "Outbound",
        data: trafficHistory.outbound,
        borderColor: theme.palette.secondary.main,
        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
        tension: 0.4,
        fill: true,
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
          boxWidth: 10,
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
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    elements: {
      point: {
        radius: 2,
      },
    },
  };

  // Get status info including icon, color, and label
  const getStatusInfo = (status: DeviceStatus): { icon: JSX.Element; color: string; label: string } => {
    switch (status) {
      case DeviceStatus.ONLINE:
        return {
          icon: <CheckIcon fontSize="small" />,
          color: theme.palette.success.main,
          label: "Online",
        };
      case DeviceStatus.OFFLINE:
        return {
          icon: <WifiOffIcon fontSize="small" />,
          color: theme.palette.error.main,
          label: "Offline",
        };
      case DeviceStatus.DEGRADED:
        return {
          icon: <WarningIcon fontSize="small" />,
          color: theme.palette.warning.main,
          label: "Degraded",
        };
      case DeviceStatus.WARNING:
        return {
          icon: <ErrorIcon fontSize="small" />,
          color: theme.palette.warning.light,
          label: "Warning",
        };
      default:
        return {
          icon: <InfoIcon />,
          color: theme.palette.info.main,
          label: "Unknown",
        };
    }
  };

  // Get interface icon based on type
  const getInterfaceIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "WAN":
        return <CloudIcon fontSize="small" />;
      case "LAN":
        return <DeviceHubIcon fontSize="small" />;
      case "VPN":
        return <RouterIcon fontSize="small" />;
      default:
        return <WifiIcon fontSize="small" />;
    }
  };

  // Handle interface change
  const handleInterfaceChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedInterface(event.target.value);
  };

  // Handle time range change
  const handleTimeRangeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTimeRange(event.target.value);
  };

  // Handle refresh
  const handleRefresh = () => {
    // In a real implementation, this would refresh network data
    console.log("Refreshing network data");
  };

  // Handle view all network data
  const handleViewAllNetworkData = () => {
    navigate("/network");
  };

  // Get the selected interface
  const selectedInterfaceData = getSelectedInterface();

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          Network Status
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Connected Devices">
            <Chip
              icon={<DeviceHubIcon />}
              label={networkData.connectedDevices}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
          </Tooltip>

          {networkData.anomalies > 0 && (
            <Tooltip title="Network Anomalies Detected">
              <Chip
                icon={<ErrorIcon />}
                label={networkData.anomalies}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ mr: 1 }}
              />
            </Tooltip>
          )}

          <IconButton size="small" onClick={handleRefresh}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Interface selector */}
      <Grid container spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Grid item xs={7}>
          <FormControl fullWidth size="small">
            <InputLabel id="interface-select-label">Interface</InputLabel>
            <Select
              labelId="interface-select-label"
              id="interface-select"
              value={selectedInterface}
              label="Interface"
              onChange={handleInterfaceChange}
            >
              {networkData.interfaces.map((intf: NetworkInterface) => (
                <MenuItem key={intf.id} value={intf.id}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {getInterfaceIcon(intf.type)}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {intf.name}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={5}>
          <FormControl fullWidth size="small">
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="6h">Last 6 Hours</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Interface details */}
      {selectedInterfaceData && (
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {/* Status and info */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body2" fontWeight="medium">
                {selectedInterfaceData.name} ({selectedInterfaceData.type})
              </Typography>
            </Box>

            <Chip
              icon={getStatusInfo(selectedInterfaceData.status).icon}
              label={getStatusInfo(selectedInterfaceData.status).label}
              size="small"
              sx={{
                bgcolor: alpha(
                  getStatusInfo(selectedInterfaceData.status).color,
                  0.1
                ),
                color: getStatusInfo(selectedInterfaceData.status).color,
                borderColor: getStatusInfo(selectedInterfaceData.status).color,
                "& .MuiChip-icon": {
                  color: "inherit",
                },
                fontWeight: "medium",
              }}
              variant="outlined"
            />
          </Box>

          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                IP Address
              </Typography>
              <Typography variant="body2" noWrap>
                {selectedInterfaceData.ipAddress}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                MAC Address
              </Typography>
              <Typography variant="body2" noWrap>
                {selectedInterfaceData.macAddress}
              </Typography>
            </Grid>
          </Grid>

          {/* Bandwidth usage */}
          <Box sx={{ mb: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Bandwidth Usage
              </Typography>
              <Typography variant="body2">
                {selectedInterfaceData.bandwidth.current} /{" "}
                {selectedInterfaceData.bandwidth.max}{" "}
                {selectedInterfaceData.bandwidth.unit}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={
                (selectedInterfaceData.bandwidth.current /
                  selectedInterfaceData.bandwidth.max) *
                100
              }
              sx={{
                height: 6,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 1,
                  bgcolor: theme.palette.primary.main,
                },
              }}
            />
          </Box>

          {/* Current traffic */}
          <Box sx={{ mb: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 0.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <DownloadIcon
                  sx={{
                    fontSize: 16,
                    color: theme.palette.primary.main,
                    mr: 0.5,
                  }}
                />
                <Typography variant="body2">
                  {selectedInterfaceData.traffic.inbound}{" "}
                  {selectedInterfaceData.traffic.unit}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <UploadIcon
                  sx={{
                    fontSize: 16,
                    color: theme.palette.secondary.main,
                    mr: 0.5,
                  }}
                />
                <Typography variant="body2">
                  {selectedInterfaceData.traffic.outbound}{" "}
                  {selectedInterfaceData.traffic.unit}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Traffic chart */}
          <Box sx={{ flexGrow: 1, mb: 1, height: "45%" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              Traffic History
            </Typography>
            <Box sx={{ height: "100%", minHeight: 140 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Box>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ mt: "auto", pt: 1, textAlign: "right" }}>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAllNetworkData}
          size="small"
        >
          View Network Details
        </Button>
      </Box>
    </Box>
  );
};

export default NetworkStatusWidget;
