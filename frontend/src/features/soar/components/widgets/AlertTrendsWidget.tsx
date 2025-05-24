/**
 * AlertTrendsWidget Component
 *
 * Visualizes trends in security alerts over time, categorized by severity,
 * source, and status. Provides interactive filtering and drill-down capabilities.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  useTheme,
  SelectChangeEvent,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

// Mock data - would come from API in production
const mockAlertData = {
  bySeverity: [
    { name: "Critical", value: 14, color: "#d32f2f" },
    { name: "High", value: 27, color: "#f44336" },
    { name: "Medium", value: 42, color: "#ff9800" },
    { name: "Low", value: 31, color: "#4caf50" },
    { name: "Info", value: 18, color: "#2196f3" },
  ],
  bySource: [
    { name: "IDS", value: 35, color: "#9c27b0" },
    { name: "Firewall", value: 28, color: "#673ab7" },
    { name: "EDR", value: 22, color: "#3f51b5" },
    { name: "SIEM", value: 19, color: "#00bcd4" },
    { name: "Threat Intel", value: 17, color: "#009688" },
    { name: "Other", value: 11, color: "#607d8b" },
  ],
  byTimeOfDay: [
    { hour: "00:00", alerts: 8 },
    { hour: "01:00", alerts: 5 },
    { hour: "02:00", alerts: 4 },
    { hour: "03:00", alerts: 3 },
    { hour: "04:00", alerts: 3 },
    { hour: "05:00", alerts: 4 },
    { hour: "06:00", alerts: 7 },
    { hour: "07:00", alerts: 12 },
    { hour: "08:00", alerts: 18 },
    { hour: "09:00", alerts: 23 },
    { hour: "10:00", alerts: 20 },
    { hour: "11:00", alerts: 19 },
    { hour: "12:00", alerts: 18 },
    { hour: "13:00", alerts: 21 },
    { hour: "14:00", alerts: 24 },
    { hour: "15:00", alerts: 22 },
    { hour: "16:00", alerts: 19 },
    { hour: "17:00", alerts: 15 },
    { hour: "18:00", alerts: 13 },
    { hour: "19:00", alerts: 11 },
    { hour: "20:00", alerts: 10 },
    { hour: "21:00", alerts: 12 },
    { hour: "22:00", alerts: 9 },
    { hour: "23:00", alerts: 7 },
  ],
  weeklyTrend: [
    { day: "Mon", alerts: 32, resolved: 28 },
    { day: "Tue", alerts: 38, resolved: 32 },
    { day: "Wed", alerts: 42, resolved: 35 },
    { day: "Thu", alerts: 35, resolved: 30 },
    { day: "Fri", alerts: 28, resolved: 25 },
    { day: "Sat", alerts: 22, resolved: 20 },
    { day: "Sun", alerts: 18, resolved: 15 },
  ],
  monthlyTrend: [
    { month: "Jan", alerts: 280, resolved: 265 },
    { month: "Feb", alerts: 250, resolved: 240 },
    { month: "Mar", alerts: 310, resolved: 290 },
    { month: "Apr", alerts: 350, resolved: 320 },
    { month: "May", alerts: 320, resolved: 300 },
  ],
};

type ViewType =
  | "severity"
  | "source"
  | "timeOfDay"
  | "weeklyTrend"
  | "monthlyTrend";

interface AlertTrendsWidgetProps {
  title?: string;
  widgetId: string;
  onDelete?: (widgetId: string) => void;
}

const AlertTrendsWidget: React.FC<AlertTrendsWidgetProps> = ({
  title = "Alert Trends",
  widgetId,
  onDelete,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(mockAlertData);
  const [viewType, setViewType] = useState<ViewType>("weeklyTrend");

  // Handle view type change
  const handleViewTypeChange = (event: SelectChangeEvent<ViewType>) => {
    setViewType(event.target.value as ViewType);
  };

  // Simulating data refresh - would be replaced with real API call
  const refreshData = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setData(mockAlertData);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    refreshData();

    // Set up real-time updates every 5 minutes
    const intervalId = setInterval(refreshData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Render the appropriate chart based on view type
  const renderChart = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            minHeight: 250,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    switch (viewType) {
      case "severity":
      case "source":
        const chartData =
          viewType === "severity" ? data.bySeverity : data.bySource;

        return (
          <Box sx={{ height: 250, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} alerts`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        );

      case "timeOfDay":
        return (
          <Box sx={{ height: 250, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byTimeOfDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tickMargin={5} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} alerts`, "Count"]} />
                <Bar
                  dataKey="alerts"
                  fill={theme.palette.primary.main}
                  name="Alerts"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );

      case "weeklyTrend":
        return (
          <Box sx={{ height: 250, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="alerts"
                  fill={theme.palette.error.main}
                  name="Alerts"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="resolved"
                  fill={theme.palette.success.main}
                  name="Resolved"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );

      case "monthlyTrend":
        return (
          <Box sx={{ height: 250, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="alerts"
                  stroke={theme.palette.error.main}
                  activeDot={{ r: 8 }}
                  name="Alerts"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke={theme.palette.success.main}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={<Typography variant="h6">{title}</Typography>}
        action={
          <Box>
            <IconButton onClick={refreshData} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
            <IconButton onClick={() => onDelete?.(widgetId)}>
              <MoreIcon />
            </IconButton>
          </Box>
        }
      />

      <Divider />

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="view-type-select-label">View</InputLabel>
            <Select
              labelId="view-type-select-label"
              id="view-type-select"
              value={viewType}
              label="View"
              onChange={handleViewTypeChange}
            >
              <MenuItem value="severity">By Severity</MenuItem>
              <MenuItem value="source">By Source</MenuItem>
              <MenuItem value="timeOfDay">By Time of Day</MenuItem>
              <MenuItem value="weeklyTrend">Weekly Trend</MenuItem>
              <MenuItem value="monthlyTrend">Monthly Trend</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flexGrow: 1 }}>{renderChart()}</Box>

        {viewType === "weeklyTrend" && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" align="center">
              Alert Resolution Rate:{" "}
              {(
                (data.weeklyTrend.reduce(
                  (sum, item) => sum + item.resolved,
                  0
                ) /
                  data.weeklyTrend.reduce(
                    (sum, item) => sum + item.alerts,
                    0
                  )) *
                100
              ).toFixed(1)}
              %
            </Typography>
          </Box>
        )}

        {viewType === "monthlyTrend" && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" align="center">
              Monthly Average:{" "}
              {(
                data.monthlyTrend.reduce((sum, item) => sum + item.alerts, 0) /
                data.monthlyTrend.length
              ).toFixed(0)}{" "}
              alerts
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertTrendsWidget;
