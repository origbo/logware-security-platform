/**
 * AlertsSummaryWidget Component
 *
 * Displays a summary of recent alerts with filtering capabilities,
 * severity distribution, and quick action buttons.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Chip,
  Badge,
  Button,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  Notifications as AlertIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useNavigate } from "react-router-dom";

// Mock data - would come from API in production
const mockAlerts = [
  {
    id: "alert-001",
    title: "Multiple failed authentication attempts",
    source: "IDS",
    severity: "high",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    status: "new",
  },
  {
    id: "alert-002",
    title: "Malware detected on Marketing-PC5",
    source: "EDR",
    severity: "critical",
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    status: "investigating",
  },
  {
    id: "alert-003",
    title: "Unusual outbound data transfer",
    source: "NIDS",
    severity: "medium",
    timestamp: new Date(Date.now() - 127 * 60000).toISOString(),
    status: "new",
  },
  {
    id: "alert-004",
    title: "Sensitive file access attempt",
    source: "DLP",
    severity: "high",
    timestamp: new Date(Date.now() - 86 * 60000).toISOString(),
    status: "new",
  },
  {
    id: "alert-005",
    title: "Ransomware behavior detected",
    source: "EDR",
    severity: "critical",
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    status: "investigating",
  },
];

const severityCounts = {
  critical: 2,
  high: 5,
  medium: 8,
  low: 3,
  info: 4,
};

interface AlertsSummaryWidgetProps {
  title?: string;
  widgetId: string;
  onDelete?: (widgetId: string) => void;
}

const AlertsSummaryWidget: React.FC<AlertsSummaryWidgetProps> = ({
  title = "Active Alerts",
  widgetId,
  onDelete,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState<string | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );

  // Convert severity counts to chart data
  const chartData = Object.entries(severityCounts).map(([severity, count]) => ({
    name: severity,
    value: count,
  }));

  // Colors for severity levels
  const SEVERITY_COLORS = {
    critical: theme.palette.error.main,
    high: theme.palette.error.light,
    medium: theme.palette.warning.main,
    low: theme.palette.success.main,
    info: theme.palette.info.main,
  };

  // Refresh alerts data
  const refreshData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refreshData();

    // Real-time updates every minute
    const intervalId = setInterval(() => {
      refreshData();
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Apply filter to alerts
  const filteredAlerts = filter
    ? alerts.filter((alert) => alert.severity === filter)
    : alerts;

  // Handle filter menu open
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Handle filter selection
  const handleFilterSelect = (severity: string | null) => {
    setFilter(severity);
    setFilterAnchorEl(null);
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.round(diffMs / 60000);

    if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffMin < 1440) {
      return `${Math.round(diffMin / 60)}h ago`;
    } else {
      return `${Math.round(diffMin / 1440)}d ago`;
    }
  };

  // Get icon for severity
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <ErrorIcon color="error" />;
      case "high":
        return <WarningIcon sx={{ color: SEVERITY_COLORS.high }} />;
      case "medium":
        return <WarningIcon sx={{ color: SEVERITY_COLORS.medium }} />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Navigate to alerts page
  const handleViewAllAlerts = () => {
    navigate("/soar/alerts");
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            <Badge
              badgeContent={alerts.filter((a) => a.status === "new").length}
              color="error"
              sx={{ ml: 1 }}
            >
              <AlertIcon color="action" />
            </Badge>
          </Box>
        }
        action={
          <Box>
            <Tooltip title="Filter by severity">
              <IconButton onClick={handleFilterClick}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={refreshData} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            <IconButton
              aria-label="settings"
              onClick={() => onDelete?.(widgetId)}
            >
              <MoreIcon />
            </IconButton>
          </Box>
        }
      />

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => handleFilterSelect(null)}>
          All Severities
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect("critical")}>
          <Box
            component="span"
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: SEVERITY_COLORS.critical,
              display: "inline-block",
              mr: 1,
            }}
          />
          Critical
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect("high")}>
          <Box
            component="span"
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: SEVERITY_COLORS.high,
              display: "inline-block",
              mr: 1,
            }}
          />
          High
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect("medium")}>
          <Box
            component="span"
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: SEVERITY_COLORS.medium,
              display: "inline-block",
              mr: 1,
            }}
          />
          Medium
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect("low")}>
          <Box
            component="span"
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: SEVERITY_COLORS.low,
              display: "inline-block",
              mr: 1,
            }}
          />
          Low
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect("info")}>
          <Box
            component="span"
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: SEVERITY_COLORS.info,
              display: "inline-block",
              mr: 1,
            }}
          />
          Info
        </MenuItem>
      </Menu>

      <Divider />

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
      >
        {loading ? (
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
          <>
            {/* Severity distribution chart */}
            <Box
              sx={{ height: 150, p: 2, display: { xs: "none", sm: "block" } }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Severity Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          SEVERITY_COLORS[
                            entry.name as keyof typeof SEVERITY_COLORS
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name) => [`${value} alerts`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Divider />

            {/* Alerts list */}
            <Box sx={{ flexGrow: 1, overflow: "auto" }}>
              <List disablePadding>
                {filteredAlerts.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="textSecondary">
                      No alerts match the current filter
                    </Typography>
                  </Box>
                ) : (
                  filteredAlerts.map((alert) => (
                    <React.Fragment key={alert.id}>
                      <ListItem
                        button
                        alignItems="flex-start"
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
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
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="body2"
                                component="div"
                                noWrap
                                sx={{ maxWidth: 200 }}
                              >
                                {alert.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {formatRelativeTime(alert.timestamp)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box
                              sx={{
                                display: "flex",
                                mt: 0.5,
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Chip
                                label={alert.source}
                                size="small"
                                sx={{ mr: 1, height: 20, fontSize: "0.65rem" }}
                              />
                              <Chip
                                label={alert.status}
                                color={
                                  alert.status === "new" ? "error" : "warning"
                                }
                                size="small"
                                sx={{ height: 20, fontSize: "0.65rem" }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))
                )}
              </List>
            </Box>
          </>
        )}
      </CardContent>

      <Divider />

      <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
        <Button
          size="small"
          color="primary"
          onClick={handleViewAllAlerts}
          endIcon={<ArrowForwardIcon />}
        >
          View All Alerts
        </Button>
      </Box>
    </Card>
  );
};

export default AlertsSummaryWidget;
