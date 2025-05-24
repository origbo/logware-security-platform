import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Icons
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SecurityIcon from "@mui/icons-material/Security";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

// Types
import { RootState } from "../store/store";

// Chart library (for demo purposes)
// In a real app, you would import chart components from libraries like recharts, visx, or nivo
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Missing InfoIcon import
import InfoIcon from "@mui/icons-material/Info";

// Mock data for charts
const alertsData = [
  { name: "Mon", critical: 4, high: 6, medium: 12, low: 8 },
  { name: "Tue", critical: 2, high: 9, medium: 10, low: 5 },
  { name: "Wed", critical: 5, high: 12, medium: 8, low: 7 },
  { name: "Thu", critical: 3, high: 8, medium: 15, low: 9 },
  { name: "Fri", critical: 6, high: 10, medium: 12, low: 6 },
  { name: "Sat", critical: 2, high: 4, medium: 5, low: 3 },
  { name: "Sun", critical: 1, high: 3, medium: 4, low: 2 },
];

const threatsData = [
  { name: "Malware", value: 35 },
  { name: "Phishing", value: 25 },
  { name: "Data Breach", value: 20 },
  { name: "DOS Attack", value: 10 },
  { name: "Zero-day", value: 10 },
];

const COLORS = ["#ff0000", "#ff9800", "#2196f3", "#4caf50", "#9c27b0"];

const complianceData = [
  { name: "PCI DSS", compliant: 85, nonCompliant: 15 },
  { name: "HIPAA", compliant: 92, nonCompliant: 8 },
  { name: "GDPR", compliant: 78, nonCompliant: 22 },
  { name: "SOC 2", compliant: 88, nonCompliant: 12 },
  { name: "ISO 27001", compliant: 95, nonCompliant: 5 },
];

const recentActivityData = [
  {
    id: 1,
    type: "alert",
    severity: "critical",
    title: "Brute force attack detected",
    source: "Firewall",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 min ago
  },
  {
    id: 2,
    type: "vulnerability",
    severity: "high",
    title: "Critical patch missing on 3 servers",
    source: "Vulnerability Scanner",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(), // 45 min ago
  },
  {
    id: 3,
    type: "compliance",
    severity: "medium",
    title: "Password policy violation",
    source: "Compliance Scanner",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
  },
  {
    id: 4,
    type: "log",
    severity: "low",
    title: "Multiple failed login attempts",
    source: "Auth System",
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(), // 3 hours ago
  },
  {
    id: 5,
    type: "user",
    severity: "info",
    title: "New user account created",
    source: "User Management",
    timestamp: new Date(Date.now() - 240 * 60000).toISOString(), // 4 hours ago
  },
];

// Utility functions
const formatTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diff / 60000);

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return date.toLocaleDateString();
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "error.main";
    case "high":
      return "error.light";
    case "medium":
      return "warning.main";
    case "low":
      return "info.main";
    case "info":
      return "primary.main";
    default:
      return "text.secondary";
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <ErrorIcon color="error" />;
    case "high":
      return <ErrorIcon sx={{ color: "error.light" }} />;
    case "medium":
      return <WarningIcon color="warning" />;
    case "low":
      return <WarningIcon color="info" />;
    case "info":
      return <InfoIcon color="primary" />;
    default:
      return <InfoIcon color="disabled" />;
  }
};

// Component for metric cards
const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon,
  loading = false,
}) => {
  return (
    <Card elevation={1}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box sx={{ mr: 1, color: "primary.main" }}>{icon}</Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {value}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color:
                  changeType === "increase"
                    ? change > 0
                      ? "success.main"
                      : "text.secondary"
                    : change > 0
                    ? "error.main"
                    : "success.main",
              }}
            >
              {change > 0 ? (
                changeType === "increase" ? (
                  <ArrowUpwardIcon fontSize="small" />
                ) : (
                  <ArrowDownwardIcon fontSize="small" />
                )
              ) : changeType === "increase" ? (
                <ArrowDownwardIcon fontSize="small" />
              ) : (
                <ArrowUpwardIcon fontSize="small" />
              )}
              <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                {Math.abs(change)}% from last week
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Security Dashboard
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {user && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome back, {user.firstName} {user.lastName}. Here's your security
          overview for today.
        </Typography>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Alerts"
            value="37"
            change={12}
            changeType="decrease"
            icon={<WarningIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Vulnerabilities"
            value="86"
            change={5}
            changeType="decrease"
            icon={<ErrorIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Compliance Score"
            value="92%"
            change={3}
            changeType="increase"
            icon={<AssignmentIcon />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Security Score"
            value="85%"
            change={2}
            changeType="increase"
            icon={<SecurityIcon />}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card elevation={1}>
            <CardHeader
              title="Alert Trends (Last 7 Days)"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={alertsData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar
                        dataKey="critical"
                        fill={theme.palette.error.main}
                        name="Critical"
                      />
                      <Bar
                        dataKey="high"
                        fill={theme.palette.error.light}
                        name="High"
                      />
                      <Bar
                        dataKey="medium"
                        fill={theme.palette.warning.main}
                        name="Medium"
                      />
                      <Bar
                        dataKey="low"
                        fill={theme.palette.info.main}
                        name="Low"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={1}>
            <CardHeader
              title="Threat Distribution"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={threatsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {threatsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Compliance and Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card elevation={1}>
            <CardHeader
              title="Compliance Status"
              action={
                <Button size="small" onClick={() => navigate("/compliance")}>
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={complianceData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar
                        dataKey="compliant"
                        stackId="a"
                        fill={theme.palette.success.main}
                        name="Compliant"
                      />
                      <Bar
                        dataKey="nonCompliant"
                        stackId="a"
                        fill={theme.palette.error.main}
                        name="Non-Compliant"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card elevation={1}>
            <CardHeader
              title="Recent Security Activity"
              action={
                <Button size="small" onClick={() => navigate("/activity")}>
                  View All
                </Button>
              }
            />
            <Divider />
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {recentActivityData.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    {index > 0 && <Divider />}
                    <Box
                      sx={{
                        display: "flex",
                        p: 2,
                        "&:hover": {
                          backgroundColor: "action.hover",
                          cursor: "pointer",
                        },
                      }}
                      onClick={() =>
                        navigate(`/${activity.type}s/${activity.id}`)
                      }
                    >
                      <Box
                        sx={{ mr: 2, display: "flex", alignItems: "center" }}
                      >
                        {getSeverityIcon(activity.severity)}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" color="text.primary">
                          {activity.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.source}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(activity.timestamp)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            color: getSeverityColor(activity.severity),
                            textTransform: "uppercase",
                            fontWeight: "bold",
                          }}
                        >
                          {activity.severity}
                        </Typography>
                      </Box>
                    </Box>
                  </React.Fragment>
                ))}
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
