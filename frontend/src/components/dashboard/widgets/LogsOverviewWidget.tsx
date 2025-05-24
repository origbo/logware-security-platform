import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Button,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Terminal as TerminalIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  Api as ApiIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

// Define props interface
interface LogsOverviewWidgetProps {
  data: any;
  widget: DashboardWidget;
}

// Define log level
enum LogLevel {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
  DEBUG = "debug",
  TRACE = "trace",
}

// Define log source type
enum LogSourceType {
  SYSTEM = "system",
  SECURITY = "security",
  APPLICATION = "application",
  DATABASE = "database",
  NETWORK = "network",
  API = "api",
  CLOUD = "cloud",
}

// Define log entry
interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSourceType;
  message: string;
  details?: string;
  host?: string;
  user?: string;
}

/**
 * LogsOverviewWidget Component
 *
 * Displays a summary of log data with filtering options
 * and a chart showing log distribution by level and source
 */
const LogsOverviewWidget: React.FC<LogsOverviewWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("24h");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("chart");

  // Mock data for development
  const mockData = {
    summary: {
      total: 15482,
      byLevel: {
        [LogLevel.ERROR]: 128,
        [LogLevel.WARNING]: 843,
        [LogLevel.INFO]: 12536,
        [LogLevel.DEBUG]: 1823,
        [LogLevel.TRACE]: 152,
      },
      bySource: {
        [LogSourceType.SYSTEM]: 3245,
        [LogSourceType.SECURITY]: 2871,
        [LogSourceType.APPLICATION]: 5623,
        [LogSourceType.DATABASE]: 1487,
        [LogSourceType.NETWORK]: 1203,
        [LogSourceType.API]: 902,
        [LogSourceType.CLOUD]: 151,
      },
    },
    recentLogs: [
      {
        id: "log-1",
        timestamp: "2025-05-15T12:42:15Z",
        level: LogLevel.ERROR,
        source: LogSourceType.SECURITY,
        message: "Failed login attempt for user admin",
        details: "IP: 192.168.1.15, Reason: Invalid password",
        host: "auth-server-01",
        user: "admin",
      },
      {
        id: "log-2",
        timestamp: "2025-05-15T12:40:32Z",
        level: LogLevel.WARNING,
        source: LogSourceType.SYSTEM,
        message: "High CPU usage detected",
        details: "CPU usage at 92% for more than 5 minutes",
        host: "app-server-02",
      },
      {
        id: "log-3",
        timestamp: "2025-05-15T12:38:47Z",
        level: LogLevel.INFO,
        source: LogSourceType.APPLICATION,
        message: "User profile updated",
        details: "User updated profile information",
        host: "app-server-01",
        user: "john.smith",
      },
      {
        id: "log-4",
        timestamp: "2025-05-15T12:35:21Z",
        level: LogLevel.ERROR,
        source: LogSourceType.DATABASE,
        message: "Database connection timeout",
        details: "Connection to primary database timed out after 30s",
        host: "db-server-01",
      },
      {
        id: "log-5",
        timestamp: "2025-05-15T12:33:05Z",
        level: LogLevel.INFO,
        source: LogSourceType.API,
        message: "API rate limit increased",
        details: "Rate limit for /api/v1/users increased to 100 req/min",
        host: "api-gateway-01",
      },
    ],
    lastUpdated: "2025-05-15T12:45:00Z",
  };

  // Use real data if available, otherwise use mock data
  const logsData = data || mockData;

  // Prepare chart data for distribution by level
  const levelChartData = {
    labels: Object.keys(logsData.summary.byLevel).map(
      (level) => level.charAt(0).toUpperCase() + level.slice(1)
    ),
    datasets: [
      {
        label: "Logs by Level",
        data: Object.values(logsData.summary.byLevel),
        backgroundColor: [
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.grey[500],
          theme.palette.grey[300],
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for distribution by source
  const sourceChartData = {
    labels: Object.keys(logsData.summary.bySource).map(
      (source) => source.charAt(0).toUpperCase() + source.slice(1)
    ),
    datasets: [
      {
        label: "Logs by Source",
        data: Object.values(logsData.summary.bySource),
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.error.main,
          theme.palette.grey[500],
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 1,
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
            const label = context.dataset.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = Math.round((value / total) * 100);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  // Get level icon
  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return (
          <ErrorIcon
            fontSize="small"
            sx={{ color: theme.palette.error.main }}
          />
        );
      case LogLevel.WARNING:
        return (
          <WarningIcon
            fontSize="small"
            sx={{ color: theme.palette.warning.main }}
          />
        );
      case LogLevel.INFO:
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
      default:
        return (
          <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />
        );
    }
  };

  // Get source icon
  const getSourceIcon = (source: LogSourceType) => {
    switch (source) {
      case LogSourceType.SYSTEM:
        return <TerminalIcon fontSize="small" />;
      case LogSourceType.SECURITY:
        return <SecurityIcon fontSize="small" />;
      case LogSourceType.DATABASE:
        return <StorageIcon fontSize="small" />;
      case LogSourceType.NETWORK:
        return <CloudIcon fontSize="small" />;
      case LogSourceType.API:
        return <ApiIcon fontSize="small" />;
      case LogSourceType.APPLICATION:
      case LogSourceType.CLOUD:
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date);
  };

  // Handle refresh
  const handleRefresh = () => {
    // In a real implementation, this would refresh log data
    console.log("Refreshing log data");
  };

  // Handle view all logs
  const handleViewAllLogs = () => {
    navigate("/logs");
  };

  // Handle time range change
  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
  };

  // Format log level for display
  const formatLogLevel = (level: LogLevel): string => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  // Format log source for display
  const formatLogSource = (source: LogSourceType): string => {
    return source.charAt(0).toUpperCase() + source.slice(1);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 1,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
            sx={{ height: 32 }}
          >
            <MenuItem value="1h">Last Hour</MenuItem>
            <MenuItem value="6h">Last 6 Hours</MenuItem>
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Chip
            label="Chart"
            size="small"
            color={viewMode === "chart" ? "primary" : "default"}
            onClick={() => handleViewModeChange("chart")}
            sx={{ mr: 0.5 }}
          />
          <Chip
            label="Table"
            size="small"
            color={viewMode === "table" ? "primary" : "default"}
            onClick={() => handleViewModeChange("table")}
            sx={{ mr: 0.5 }}
          />
          <IconButton size="small" onClick={handleRefresh}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Summary stats */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Total Logs:{" "}
          <Typography component="span" fontWeight="bold">
            {logsData.summary.total.toLocaleString()}
          </Typography>
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Error Logs">
            <Chip
              icon={<ErrorIcon />}
              label={logsData.summary.byLevel[LogLevel.ERROR].toLocaleString()}
              size="small"
              color="error"
              variant="outlined"
            />
          </Tooltip>

          <Tooltip title="Warning Logs">
            <Chip
              icon={<WarningIcon />}
              label={logsData.summary.byLevel[
                LogLevel.WARNING
              ].toLocaleString()}
              size="small"
              color="warning"
              variant="outlined"
            />
          </Tooltip>
        </Box>
      </Box>

      {/* Chart view */}
      {viewMode === "chart" && (
        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <Box
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {/* By Level Chart */}
            <Box sx={{ flexGrow: 1, mb: 1, height: "50%" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                Distribution by Level
              </Typography>
              <Box sx={{ height: "calc(100% - 20px)" }}>
                <Bar data={levelChartData} options={chartOptions} />
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* By Source Chart */}
            <Box sx={{ flexGrow: 1, height: "50%" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                Distribution by Source
              </Typography>
              <Box sx={{ height: "calc(100% - 20px)" }}>
                <Bar data={sourceChartData} options={chartOptions} />
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <Box sx={{ flexGrow: 1, overflow: "auto", mt: 1 }}>
          <TextField
            size="small"
            placeholder="Search logs..."
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            margin="dense"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              maxHeight: "100%",
              "& .MuiTableCell-root": {
                py: 0.75,
                px: 1,
              },
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={100}>Time</TableCell>
                  <TableCell width={80}>Level</TableCell>
                  <TableCell width={100}>Source</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logsData.recentLogs
                  .filter(
                    (log) =>
                      searchQuery === "" ||
                      log.message
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      log.source
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      log.level
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((log) => (
                    <TableRow
                      key={log.id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        ...(log.level === LogLevel.ERROR && {
                          bgcolor: alpha(theme.palette.error.main, 0.05),
                        }),
                        ...(log.level === LogLevel.WARNING && {
                          bgcolor: alpha(theme.palette.warning.main, 0.05),
                        }),
                      }}
                    >
                      <TableCell>
                        <Typography variant="caption" noWrap>
                          {formatTimestamp(log.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={formatLogLevel(log.level)}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {getLevelIcon(log.level)}
                            <Typography
                              variant="caption"
                              sx={{
                                ml: 0.5,
                                display: { xs: "none", sm: "block" },
                              }}
                            >
                              {formatLogLevel(log.level)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={formatLogSource(log.source)}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {getSourceIcon(log.source)}
                            <Typography
                              variant="caption"
                              sx={{
                                ml: 0.5,
                                display: { xs: "none", sm: "block" },
                              }}
                            >
                              {formatLogSource(log.source)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={log.details || log.message}>
                          <Typography variant="body2" noWrap>
                            {log.message}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ mt: "auto", pt: 1, textAlign: "right" }}>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAllLogs}
          size="small"
        >
          View All Logs
        </Button>
      </Box>
    </Box>
  );
};

export default LogsOverviewWidget;
