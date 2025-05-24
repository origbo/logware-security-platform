import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  LinearProgress,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { format } from "date-fns";
import RouterIcon from "@mui/icons-material/Router";
import ComputerIcon from "@mui/icons-material/Computer";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import StorageIcon from "@mui/icons-material/Storage";
import SsidChartIcon from "@mui/icons-material/SsidChart";
import SecurityIcon from "@mui/icons-material/Security";
import WarningIcon from "@mui/icons-material/Warning";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import InfoIcon from "@mui/icons-material/Info";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import {
  NetworkDevice,
  TrafficData,
  NetworkAlert,
} from "../../pages/network/NetworkMonitoringPage";

// Interface for component props
interface NetworkDashboardProps {
  devices: NetworkDevice[];
  trafficData: TrafficData[];
  alerts: NetworkAlert[];
}

const NetworkDashboard: React.FC<NetworkDashboardProps> = ({
  devices,
  trafficData,
  alerts,
}) => {
  const theme = useTheme();

  // State for selected time range (in hours)
  const [timeRange, setTimeRange] = useState(24);

  // Calculate device statistics
  const deviceStats = {
    total: devices.length,
    online: devices.filter((device) => device.status === "online").length,
    offline: devices.filter((device) => device.status === "offline").length,
    warning: devices.filter((device) => device.status === "warning").length,
    byType: {
      router: devices.filter((device) => device.type === "router").length,
      server: devices.filter((device) => device.type === "server").length,
      workstation: devices.filter((device) => device.type === "workstation")
        .length,
      mobile: devices.filter((device) => device.type === "mobile").length,
      iot: devices.filter((device) => device.type === "iot").length,
      other: devices.filter(
        (device) =>
          !["router", "server", "workstation", "mobile", "iot"].includes(
            device.type
          )
      ).length,
    },
  };

  // Calculate traffic statistics
  const now = new Date();
  const rangeStart = new Date(now.getTime() - timeRange * 60 * 60 * 1000);

  const recentTraffic = trafficData.filter(
    (traffic) => traffic.timestamp >= rangeStart
  );

  const totalTrafficIn =
    recentTraffic.reduce((sum, traffic) => sum + traffic.bytesTransferred, 0) /
    (1024 * 1024); // Convert to MB
  const totalTrafficOut =
    recentTraffic.reduce((sum, traffic) => sum + traffic.bytesTransferred, 0) /
    (1024 * 1024); // Simplification

  // Calculate alert statistics
  const recentAlerts = alerts.filter((alert) => alert.timestamp >= rangeStart);
  const alertStats = {
    total: recentAlerts.length,
    critical: recentAlerts.filter((alert) => alert.severity === "critical")
      .length,
    high: recentAlerts.filter((alert) => alert.severity === "high").length,
    medium: recentAlerts.filter((alert) => alert.severity === "medium").length,
    low: recentAlerts.filter((alert) => alert.severity === "low").length,
    byType: {
      intrusion: recentAlerts.filter((alert) => alert.type === "intrusion")
        .length,
      malware: recentAlerts.filter((alert) => alert.type === "malware").length,
      data_loss: recentAlerts.filter((alert) => alert.type === "data_loss")
        .length,
      policy_violation: recentAlerts.filter(
        (alert) => alert.type === "policy_violation"
      ).length,
      anomaly: recentAlerts.filter((alert) => alert.type === "anomaly").length,
    },
  };

  // Prepare data for device type chart
  const deviceTypeData = [
    {
      name: "Routers",
      value: deviceStats.byType.router,
      color: theme.palette.primary.main,
    },
    {
      name: "Servers",
      value: deviceStats.byType.server,
      color: theme.palette.secondary.main,
    },
    {
      name: "Workstations",
      value: deviceStats.byType.workstation,
      color: theme.palette.success.main,
    },
    {
      name: "Mobile",
      value: deviceStats.byType.mobile,
      color: theme.palette.warning.main,
    },
    {
      name: "IoT",
      value: deviceStats.byType.iot,
      color: theme.palette.error.main,
    },
    {
      name: "Other",
      value: deviceStats.byType.other,
      color: theme.palette.grey[500],
    },
  ];

  // Prepare data for device status chart
  const deviceStatusData = [
    {
      name: "Online",
      value: deviceStats.online,
      color: theme.palette.success.main,
    },
    {
      name: "Warning",
      value: deviceStats.warning,
      color: theme.palette.warning.main,
    },
    {
      name: "Offline",
      value: deviceStats.offline,
      color: theme.palette.error.main,
    },
  ];

  // Prepare data for alert severity chart
  const alertSeverityData = [
    {
      name: "Critical",
      value: alertStats.critical,
      color: theme.palette.error.dark,
    },
    { name: "High", value: alertStats.high, color: theme.palette.error.main },
    {
      name: "Medium",
      value: alertStats.medium,
      color: theme.palette.warning.main,
    },
    { name: "Low", value: alertStats.low, color: theme.palette.success.main },
  ];

  // Prepare data for traffic over time chart
  const trafficHourly = Array.from({ length: timeRange }, (_, i) => {
    const hourStart = new Date(
      now.getTime() - (timeRange - i) * 60 * 60 * 1000
    );
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

    const hourTraffic = trafficData.filter(
      (traffic) => traffic.timestamp >= hourStart && traffic.timestamp < hourEnd
    );

    const trafficIn =
      hourTraffic.reduce(
        (sum, traffic) => sum + traffic.bytesTransferred / 2,
        0
      ) /
      (1024 * 1024); // Simplification
    const trafficOut =
      hourTraffic.reduce(
        (sum, traffic) => sum + traffic.bytesTransferred / 2,
        0
      ) /
      (1024 * 1024); // Simplification

    return {
      name: format(hourStart, "HH:mm"),
      in: trafficIn.toFixed(2),
      out: trafficOut.toFixed(2),
    };
  });

  // Prepare data for top devices by traffic
  const topDevicesByTraffic = [...devices]
    .sort((a, b) => b.trafficIn + b.trafficOut - (a.trafficIn + a.trafficOut))
    .slice(0, 5)
    .map((device) => ({
      id: device.id,
      name: device.name,
      ip: device.ip,
      total: ((device.trafficIn + device.trafficOut) / (1024 * 1024)).toFixed(
        2
      ), // Convert to MB
      in: (device.trafficIn / (1024 * 1024)).toFixed(2), // Convert to MB
      out: (device.trafficOut / (1024 * 1024)).toFixed(2), // Convert to MB
    }));

  // Get device icon based on type
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "router":
        return <RouterIcon />;
      case "server":
        return <StorageIcon />;
      case "workstation":
        return <ComputerIcon />;
      case "mobile":
        return <SmartphoneIcon />;
      default:
        return <SsidChartIcon />;
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Top Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <RouterIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Devices</Typography>
            </Box>
            <Typography variant="h3" component="div" gutterBottom>
              {deviceStats.total}
            </Typography>
            <Grid container>
              <Grid item xs={4}>
                <Typography variant="body2" color="success.main" align="center">
                  {deviceStats.online} Online
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="warning.main" align="center">
                  {deviceStats.warning} Warning
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="error.main" align="center">
                  {deviceStats.offline} Offline
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <SsidChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Network Traffic</Typography>
            </Box>
            <Typography variant="h3" component="div" gutterBottom>
              {(totalTrafficIn + totalTrafficOut).toFixed(2)} MB
            </Typography>
            <Grid container>
              <Grid item xs={6}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUpIcon color="success" fontSize="small" />
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ ml: 0.5 }}
                  >
                    {totalTrafficIn.toFixed(2)} MB In
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingDownIcon color="error" fontSize="small" />
                  <Typography
                    variant="body2"
                    color="error.main"
                    sx={{ ml: 0.5 }}
                  >
                    {totalTrafficOut.toFixed(2)} MB Out
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Security Score</Typography>
            </Box>
            <Typography variant="h3" component="div" gutterBottom>
              78%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={78}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 1,
                backgroundColor: theme.palette.grey[300],
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    78 > 70
                      ? theme.palette.success.main
                      : theme.palette.warning.main,
                },
              }}
            />
            <Typography variant="body2" color="textSecondary" align="center">
              3% increase from last week
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <WarningIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Alerts</Typography>
            </Box>
            <Typography variant="h3" component="div" gutterBottom>
              {alertStats.total}
            </Typography>
            <Grid container>
              <Grid item xs={6}>
                <Typography variant="body2" color="error.main" align="center">
                  {alertStats.critical + alertStats.high} Critical/High
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="warning.main" align="center">
                  {alertStats.medium} Medium
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Device Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Device Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  By Type
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip
                      formatter={(value, name) => [`${value} devices`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  By Status
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip
                      formatter={(value, name) => [`${value} devices`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Alert Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alert Distribution
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  By Severity
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={alertSeverityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {alertSeverityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip
                      formatter={(value, name) => [`${value} alerts`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  By Type
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      { name: "Intrusion", value: alertStats.byType.intrusion },
                      { name: "Malware", value: alertStats.byType.malware },
                      { name: "Data Loss", value: alertStats.byType.data_loss },
                      {
                        name: "Policy",
                        value: alertStats.byType.policy_violation,
                      },
                      { name: "Anomaly", value: alertStats.byType.anomaly },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip
                      formatter={(value) => [`${value} alerts`]}
                    />
                    <Bar dataKey="value" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Traffic Over Time */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Network Traffic Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={trafficHourly}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  label={{
                    value: "Traffic (MB)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <RechartsTooltip formatter={(value) => [`${value} MB`]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="in"
                  stroke={theme.palette.success.main}
                  name="Inbound"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="out"
                  stroke={theme.palette.error.main}
                  name="Outbound"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Devices and Latest Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Devices by Traffic
            </Typography>
            <List>
              {topDevicesByTraffic.map((device, index) => (
                <React.Fragment key={device.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem>
                    <ListItemIcon>
                      {getDeviceIcon(
                        devices.find((d) => d.id === device.id)?.type || "other"
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body1">{device.name}</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {device.total} MB
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            {device.ip}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {device.in} MB In / {device.out} MB Out
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
              {topDevicesByTraffic.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No traffic data available"
                    secondary="Traffic statistics will appear here once data is collected"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Latest Alerts
            </Typography>
            <List>
              {recentAlerts.slice(0, 5).map((alert, index) => (
                <React.Fragment key={alert.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" aria-label="view">
                        <ArrowRightIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <Chip
                        size="small"
                        label={alert.severity}
                        sx={{
                          bgcolor:
                            alert.severity === "critical"
                              ? theme.palette.error.dark
                              : alert.severity === "high"
                              ? theme.palette.error.main
                              : alert.severity === "medium"
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1">{alert.title}</Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {format(
                              new Date(alert.timestamp),
                              "MMM d, yyyy HH:mm"
                            )}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {alert.description.substring(0, 80)}...
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
              {recentAlerts.length === 0 && (
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="No recent alerts"
                    secondary="Network alerts will appear here when detected"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NetworkDashboard;
