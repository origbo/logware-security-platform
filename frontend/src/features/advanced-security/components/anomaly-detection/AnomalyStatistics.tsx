/**
 * Anomaly Statistics
 *
 * Component for displaying statistical charts and metrics for the anomaly detection system
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";

import { useGetAnomalyStatisticsQuery } from "../../services/anomalyDetectionService";
import {
  AnomalySeverity,
  AnomalyType,
  AnomalyStatus,
} from "../../types/anomalyTypes";

// Interface for the statistics counter card
interface StatCounterProps {
  title: string;
  value: number;
  previousValue?: number;
  icon?: React.ReactNode;
  color?: string;
}

// Component for displaying a statistics counter with trend
const StatCounter: React.FC<StatCounterProps> = ({
  title,
  value,
  previousValue,
  icon,
  color = "primary.main",
}) => {
  const theme = useTheme();

  // Calculate percent change
  const percentChange = previousValue
    ? Math.round(((value - previousValue) / previousValue) * 100)
    : 0;

  // Determine if trend is up or down
  const trendUp = percentChange > 0;
  const trendDown = percentChange < 0;

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" color="textSecondary">
            {title}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${color}20`,
              color: color,
              borderRadius: "50%",
              width: 40,
              height: 40,
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value.toLocaleString()}
        </Typography>
        {previousValue && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {trendUp && (
              <TrendingUpIcon
                fontSize="small"
                sx={{ color: theme.palette.error.main, mr: 0.5 }}
              />
            )}
            {trendDown && (
              <TrendingDownIcon
                fontSize="small"
                sx={{ color: theme.palette.success.main, mr: 0.5 }}
              />
            )}
            <Typography
              variant="body2"
              color={
                trendUp ? "error" : trendDown ? "success" : "textSecondary"
              }
            >
              {trendUp ? "+" : ""}
              {percentChange}% vs previous period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const AnomalyStatistics: React.FC = () => {
  const theme = useTheme();

  // Time range state
  const [timeRange, setTimeRange] = useState("7days");

  // Fetch statistics data
  const { data, isLoading, error } = useGetAnomalyStatisticsQuery(timeRange);

  // Color mapping for severity
  const severityColors = {
    CRITICAL: theme.palette.error.main,
    HIGH: theme.palette.warning.main,
    MEDIUM: theme.palette.info.main,
    LOW: theme.palette.success.main,
    INFO: theme.palette.primary.main,
  };

  // Color mapping for status
  const statusColors = {
    NEW: theme.palette.error.main,
    INVESTIGATING: theme.palette.warning.main,
    FALSE_POSITIVE: theme.palette.info.main,
    RESOLVED: theme.palette.success.main,
    IGNORED: theme.palette.grey[500],
  };

  // Status to icon mapping
  const getStatusIcon = (status: AnomalyStatus) => {
    switch (status) {
      case "NEW":
        return <ErrorIcon color="error" />;
      case "INVESTIGATING":
        return <WarningIcon color="warning" />;
      case "FALSE_POSITIVE":
        return <InfoIcon color="info" />;
      case "RESOLVED":
        return <CheckCircleIcon color="success" />;
      case "IGNORED":
        return <InfoIcon color="disabled" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error loading anomaly statistics. Please try again.
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No statistics data available.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Time Range Selector */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <FormControl sx={{ width: 200 }} size="small">
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="24hours">Last 24 Hours</MenuItem>
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stat Counters */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCounter
            title="Total Anomalies"
            value={data.totalAnomalies}
            previousValue={data.previousTotalAnomalies}
            icon={<ErrorIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCounter
            title="Critical Anomalies"
            value={data.criticalAnomalies}
            previousValue={data.previousCriticalAnomalies}
            icon={<ErrorIcon />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCounter
            title="New Anomalies"
            value={data.newAnomalies}
            previousValue={data.previousNewAnomalies}
            icon={<WarningIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCounter
            title="Resolved Anomalies"
            value={data.resolvedAnomalies}
            previousValue={data.previousResolvedAnomalies}
            icon={<CheckCircleIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Anomalies Over Time */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Anomalies Over Time
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={data.anomaliesByDate}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="critical"
                  stackId="1"
                  name="Critical"
                  stroke={severityColors.CRITICAL}
                  fill={severityColors.CRITICAL}
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="high"
                  stackId="1"
                  name="High"
                  stroke={severityColors.HIGH}
                  fill={severityColors.HIGH}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="medium"
                  stackId="1"
                  name="Medium"
                  stroke={severityColors.MEDIUM}
                  fill={severityColors.MEDIUM}
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="low"
                  stackId="1"
                  name="Low"
                  stroke={severityColors.LOW}
                  fill={severityColors.LOW}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Anomalies by Severity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Anomalies by Severity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.anomaliesBySeverity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="severity"
                  label={({ severity, percent }) =>
                    `${severity}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.anomaliesBySeverity.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        severityColors[
                          entry.severity as keyof typeof severityColors
                        ]
                      }
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        {/* Anomalies by Type */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Anomalies by Type
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.anomaliesByType}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Count"
                  fill={theme.palette.primary.main}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Anomalies by Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Anomalies by Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.anomaliesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="status"
                  label={({ status, percent }) =>
                    `${status}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.anomaliesByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        statusColors[entry.status as keyof typeof statusColors]
                      }
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Affected Resources
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {data.topAffectedResources.map((resource, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2">{resource.resource}</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {resource.count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    bgcolor: theme.palette.grey[200],
                    borderRadius: 1,
                    height: 8,
                  }}
                >
                  <Box
                    sx={{
                      width: `${
                        (resource.count / data.topAffectedResources[0].count) *
                        100
                      }%`,
                      bgcolor: theme.palette.primary.main,
                      height: 8,
                      borderRadius: 1,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detection Performance
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Average Detection Time
                </Typography>
                <Typography variant="h5" gutterBottom color="primary">
                  {data.avgDetectionTimeSeconds < 60
                    ? `${data.avgDetectionTimeSeconds.toFixed(1)} seconds`
                    : `${(data.avgDetectionTimeSeconds / 60).toFixed(
                        1
                      )} minutes`}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  False Positive Rate
                </Typography>
                <Typography
                  variant="h5"
                  gutterBottom
                  color={data.falsePositiveRate > 15 ? "error" : "success"}
                >
                  {data.falsePositiveRate.toFixed(1)}%
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  ML Average Confidence
                </Typography>
                <Typography variant="h5" gutterBottom color="primary">
                  {data.avgMlConfidence.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Detection Rules
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {Object.entries(data.activeRulesByType).map(([type, count]) => (
                <Grid item xs={6} key={type}>
                  <Card
                    variant="outlined"
                    sx={{ bgcolor: "background.default" }}
                  >
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Typography variant="h4" gutterBottom align="center">
                        {count}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        align="center"
                      >
                        {type}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnomalyStatistics;
