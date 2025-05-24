/**
 * SecurityMetricsWidget Component
 *
 * Displays key security metrics like MTTR, detection rate, and alert trends
 * with real-time updates and visualizations.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Divider,
  IconButton,
  CircularProgress,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// Mock data - would come from API in production
const mockMetricsData = {
  mttr: {
    current: 42, // minutes
    previous: 56,
    change: -25, // percent change
    trend: "decreasing", // decreasing is good for MTTR
  },
  detectionRate: {
    current: 94.3, // percent
    previous: 91.2,
    change: 3.4,
    trend: "increasing", // increasing is good for detection rate
  },
  falsePositiveRate: {
    current: 5.8, // percent
    previous: 7.2,
    change: -19.4,
    trend: "decreasing", // decreasing is good for FP rate
  },
  alertsResolved: {
    current: 173,
    previous: 142,
    change: 21.8,
    trend: "increasing", // context dependent
  },
  historicalData: [
    { date: "Mon", alerts: 45, resolved: 42, mttr: 38 },
    { date: "Tue", alerts: 52, resolved: 48, mttr: 41 },
    { date: "Wed", alerts: 49, resolved: 46, mttr: 39 },
    { date: "Thu", alerts: 63, resolved: 57, mttr: 44 },
    { date: "Fri", alerts: 58, resolved: 53, mttr: 47 },
    { date: "Sat", alerts: 48, resolved: 45, mttr: 42 },
    { date: "Sun", alerts: 38, resolved: 35, mttr: 40 },
  ],
};

interface SecurityMetricsWidgetProps {
  title?: string;
  widgetId: string;
  onDelete?: (widgetId: string) => void;
}

const SecurityMetricsWidget: React.FC<SecurityMetricsWidgetProps> = ({
  title = "Security Metrics",
  widgetId,
  onDelete,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(mockMetricsData);
  const [activeMetric, setActiveMetric] = useState<
    "alerts" | "resolved" | "mttr"
  >("alerts");

  // Simulating data refresh - would be replaced with real API call
  const refreshData = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setData(mockMetricsData);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refreshData();

    // Set up real-time updates every 5 minutes
    const intervalId = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTrend = (
    value: number,
    trendDirection: string,
    isGood: boolean
  ) => {
    const color = isGood
      ? theme.palette.success.main
      : theme.palette.error.main;
    const Icon =
      trendDirection === "increasing" ? TrendingUpIcon : TrendingDownIcon;

    return (
      <Box sx={{ display: "flex", alignItems: "center", color }}>
        <Icon fontSize="small" sx={{ mr: 0.5 }} />
        <Typography
          variant="body2"
          component="span"
          sx={{ fontWeight: "medium" }}
        >
          {value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`}
        </Typography>
      </Box>
    );
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={title}
        action={
          <IconButton
            aria-label="settings"
            onClick={() => onDelete?.(widgetId)}
          >
            <MoreIcon />
          </IconButton>
        }
      />
      <Divider />
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
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
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* MTTR Metric */}
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Mean Time to Respond
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TimeIcon
                        sx={{ mr: 1, color: theme.palette.primary.main }}
                      />
                      <Typography variant="h5" component="span">
                        {data.mttr.current}m
                      </Typography>
                    </Box>
                    {formatTrend(
                      data.mttr.change,
                      data.mttr.trend,
                      data.mttr.trend === "decreasing"
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Detection Rate */}
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Detection Rate
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h5" component="span">
                      {data.detectionRate.current}%
                    </Typography>
                    {formatTrend(
                      data.detectionRate.change,
                      data.detectionRate.trend,
                      data.detectionRate.trend === "increasing"
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* False Positive Rate */}
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    False Positive Rate
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h5" component="span">
                      {data.falsePositiveRate.current}%
                    </Typography>
                    {formatTrend(
                      data.falsePositiveRate.change,
                      data.falsePositiveRate.trend,
                      data.falsePositiveRate.trend === "decreasing"
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Alerts Resolved */}
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.info.main, 0.08),
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Alerts Resolved
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h5" component="span">
                      {data.alertsResolved.current}
                    </Typography>
                    {formatTrend(
                      data.alertsResolved.change,
                      data.alertsResolved.trend,
                      true
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Chart Toggle */}
            <Box
              sx={{ mb: 2, display: "flex", justifyContent: "center", gap: 1 }}
            >
              <Chip
                label="Alerts"
                color={activeMetric === "alerts" ? "primary" : "default"}
                onClick={() => setActiveMetric("alerts")}
                variant={activeMetric === "alerts" ? "filled" : "outlined"}
              />
              <Chip
                label="Resolved"
                color={activeMetric === "resolved" ? "primary" : "default"}
                onClick={() => setActiveMetric("resolved")}
                variant={activeMetric === "resolved" ? "filled" : "outlined"}
              />
              <Chip
                label="MTTR"
                color={activeMetric === "mttr" ? "primary" : "default"}
                onClick={() => setActiveMetric("mttr")}
                variant={activeMetric === "mttr" ? "filled" : "outlined"}
              />
            </Box>

            {/* Chart */}
            <Box sx={{ flexGrow: 1, minHeight: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.historicalData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="colorMetric"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={theme.palette.primary.main}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={theme.palette.primary.main}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey={activeMetric}
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorMetric)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityMetricsWidget;
