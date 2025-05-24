/**
 * PlaybookStatusWidget Component
 *
 * Displays real-time status of playbook executions, success rates,
 * and performance metrics to monitor automation effectiveness.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Chip,
  LinearProgress,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  PlayArrow as PlayIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

// Mock data for playbook executions
const mockPlaybookData = {
  activeExecutions: [
    {
      id: "pb-exec-001",
      name: "Malware Containment",
      status: "running",
      progress: 65,
      startTime: new Date(Date.now() - 32 * 60000).toISOString(),
      estimatedCompletion: new Date(Date.now() + 15 * 60000).toISOString(),
    },
    {
      id: "pb-exec-002",
      name: "Phishing Response",
      status: "running",
      progress: 30,
      startTime: new Date(Date.now() - 18 * 60000).toISOString(),
      estimatedCompletion: new Date(Date.now() + 35 * 60000).toISOString(),
    },
    {
      id: "pb-exec-003",
      name: "User Account Lockout",
      status: "waiting",
      progress: 0,
      startTime: new Date(Date.now() - 5 * 60000).toISOString(),
      estimatedCompletion: null,
    },
  ],
  recentExecutions: [
    {
      id: "pb-exec-004",
      name: "Vulnerability Scan",
      status: "completed",
      completionTime: new Date(Date.now() - 55 * 60000).toISOString(),
      duration: "28m",
      success: true,
    },
    {
      id: "pb-exec-005",
      name: "Data Exfiltration Response",
      status: "failed",
      completionTime: new Date(Date.now() - 120 * 60000).toISOString(),
      duration: "15m",
      success: false,
      failureReason: "External API timeout",
    },
    {
      id: "pb-exec-006",
      name: "Network Isolation",
      status: "completed",
      completionTime: new Date(Date.now() - 180 * 60000).toISOString(),
      duration: "12m",
      success: true,
    },
  ],
  successRate: 85,
  averageExecutionTime: "18m",
  totalAutomatedActions: 128,
  lastRefreshed: new Date(),
};

// Performance metrics data for pie chart
const statusDistribution = [
  { name: "Completed", value: 78, color: "#4caf50" },
  { name: "Failed", value: 14, color: "#f44336" },
  { name: "Waiting", value: 8, color: "#ff9800" },
];

interface PlaybookStatusWidgetProps {
  title?: string;
  widgetId: string;
  onDelete?: (widgetId: string) => void;
}

const PlaybookStatusWidget: React.FC<PlaybookStatusWidgetProps> = ({
  title = "Playbook Status",
  widgetId,
  onDelete,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(mockPlaybookData);

  // Format relative time from now
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - date.getTime());
    const diffMin = Math.round(diffMs / 60000);

    if (diffMin < 60) {
      return `${diffMin}m`;
    } else if (diffMin < 1440) {
      return `${Math.round(diffMin / 60)}h`;
    } else {
      return `${Math.round(diffMin / 1440)}d`;
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData({
        ...mockPlaybookData,
        lastRefreshed: new Date(),
      });
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    handleRefresh();

    // Set up auto-refresh interval
    const intervalId = setInterval(handleRefresh, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <PlayIcon color="primary" />;
      case "completed":
        return <SuccessIcon color="success" />;
      case "failed":
        return <ErrorIcon color="error" />;
      case "waiting":
        return <PauseIcon color="warning" />;
      default:
        return <TimerIcon />;
    }
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={<Typography variant="h6">{title}</Typography>}
        action={
          <Box>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            <IconButton onClick={() => onDelete?.(widgetId)}>
              <MoreIcon />
            </IconButton>
          </Box>
        }
      />

      <Divider />

      <CardContent
        sx={{
          p: 0,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        {/* Key metrics */}
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              Success Rate
            </Typography>
            <Typography
              variant="h5"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {data.successRate}%
              <SuccessIcon fontSize="small" color="success" sx={{ ml: 0.5 }} />
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              Avg. Time
            </Typography>
            <Typography
              variant="h5"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {data.averageExecutionTime}
              <TimerIcon fontSize="small" color="action" sx={{ ml: 0.5 }} />
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              Actions
            </Typography>
            <Typography
              variant="h5"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {data.totalAutomatedActions}
              <SpeedIcon fontSize="small" color="primary" sx={{ ml: 0.5 }} />
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Status distribution chart */}
        <Box sx={{ height: 180, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Status Distribution
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
              <RechartsTooltip
                formatter={(value, name) => [`${value} playbooks`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Divider />

        {/* Active executions */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Active Executions ({data.activeExecutions.length})
          </Typography>
          {data.activeExecutions.length === 0 ? (
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ py: 2 }}
            >
              No active playbook executions
            </Typography>
          ) : (
            <List disablePadding>
              {data.activeExecutions.map((execution) => (
                <ListItem key={execution.id} sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getStatusIcon(execution.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 150 }}
                        >
                          {execution.name}
                        </Typography>
                        <Chip
                          label={execution.status}
                          size="small"
                          color={
                            execution.status === "running"
                              ? "primary"
                              : execution.status === "waiting"
                              ? "warning"
                              : "default"
                          }
                          sx={{ height: 20, fontSize: "0.65rem" }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <LinearProgress
                          variant={
                            execution.status === "waiting"
                              ? "indeterminate"
                              : "determinate"
                          }
                          value={execution.progress}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 0.5,
                            fontSize: "0.7rem",
                          }}
                        >
                          <Typography variant="caption">
                            Started {formatRelativeTime(execution.startTime)}{" "}
                            ago
                          </Typography>
                          {execution.estimatedCompletion && (
                            <Typography variant="caption">
                              Est.{" "}
                              {formatRelativeTime(
                                execution.estimatedCompletion
                              )}{" "}
                              remaining
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider />

        {/* Recent executions */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Recent Completions
          </Typography>
          <List disablePadding>
            {data.recentExecutions.map((execution) => (
              <ListItem key={execution.id} sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getStatusIcon(execution.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {execution.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatRelativeTime(execution.completionTime)} ago
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 0.5,
                        fontSize: "0.7rem",
                      }}
                    >
                      <Typography variant="caption">
                        Duration: {execution.duration}
                      </Typography>
                      {!execution.success && (
                        <Typography variant="caption" color="error">
                          {execution.failureReason}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>

      <Divider />

      <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
        <Typography variant="caption" color="textSecondary">
          Last updated: {data.lastRefreshed.toLocaleTimeString()}
        </Typography>
      </Box>
    </Card>
  );
};

export default PlaybookStatusWidget;
