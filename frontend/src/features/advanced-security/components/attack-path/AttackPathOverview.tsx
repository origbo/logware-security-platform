/**
 * Attack Path Overview
 *
 * Component for displaying overview metrics and statistics for the attack path modeling system
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  DeviceHub as DeviceHubIcon,
  BugReport as BugReportIcon,
  Brightness1 as CircleIcon,
} from "@mui/icons-material";

import { useGetAttackPathOverviewQuery } from "../../services/attackPathService";
import {
  AssetType,
  VulnerabilitySeverity,
  AttackVector,
} from "../../types/attackPathTypes";

// Interface for stat card props
interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  subtitle?: string;
  color: string;
  trend?: "positive" | "negative" | "neutral";
  trendLabel?: string;
}

// Stat card component
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  previousValue,
  icon,
  subtitle,
  color,
  trend,
  trendLabel,
}) => {
  const theme = useTheme();

  // Calculate percent change if both values are provided
  const percentChange = previousValue
    ? Math.round(((value - previousValue) / previousValue) * 100)
    : undefined;

  // Determine if trend is up or down based on percent change
  const trendUp =
    percentChange !== undefined ? percentChange > 0 : trend === "positive";
  const trendDown =
    percentChange !== undefined ? percentChange < 0 : trend === "negative";

  // Determine if trend is good or bad depending on the metric
  // For security metrics, down is usually good (fewer vulnerabilities, fewer critical paths)
  const trendIsPositive =
    title.includes("Critical") || title.includes("Vulnerabil")
      ? trendDown
      : trendUp;

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${color}20`,
              color,
              width: 40,
              height: 40,
              borderRadius: "50%",
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle1" color="textSecondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value.toLocaleString()}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {subtitle}
          </Typography>
        )}
        {percentChange !== undefined && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {trendUp && (
              <TrendingUpIcon
                sx={{
                  color: trendIsPositive
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                  mr: 0.5,
                  fontSize: 16,
                }}
              />
            )}
            {trendDown && (
              <TrendingDownIcon
                sx={{
                  color: trendIsPositive
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                  mr: 0.5,
                  fontSize: 16,
                }}
              />
            )}
            <Typography
              variant="body2"
              sx={{
                color: trendIsPositive
                  ? theme.palette.success.main
                  : theme.palette.error.main,
              }}
            >
              {trendUp ? "+" : ""}
              {percentChange}% {trendLabel || "vs previous period"}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const AttackPathOverview: React.FC = () => {
  const theme = useTheme();

  // Time range state
  const [timeRange, setTimeRange] = useState("30days");

  // Fetch overview data
  const { data, isLoading, error, refetch } =
    useGetAttackPathOverviewQuery(timeRange);

  // Handle time range change
  const handleTimeRangeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setTimeRange(event.target.value as string);
  };

  // Colors for charts
  const vulnerabilitySeverityColors = {
    CRITICAL: theme.palette.error.main,
    HIGH: theme.palette.error.light,
    MEDIUM: theme.palette.warning.main,
    LOW: theme.palette.success.main,
    INFO: theme.palette.info.main,
  };

  const assetTypeColors = {
    SERVER: theme.palette.primary.main,
    WORKSTATION: theme.palette.secondary.main,
    NETWORK_DEVICE: theme.palette.info.main,
    IOT_DEVICE: theme.palette.warning.main,
    CLOUD_RESOURCE: theme.palette.primary.light,
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
        Error loading attack path overview data. Please try again.
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No attack path overview data available.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header with Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1">
          Attack Path Modeling Overview
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FormControl sx={{ width: 180, mr: 2 }} size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Assets"
            value={data.totalAssets}
            previousValue={data.previousTotalAssets}
            icon={<DeviceHubIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Vulnerabilities"
            value={data.activeVulnerabilities}
            previousValue={data.previousActiveVulnerabilities}
            icon={<BugReportIcon />}
            color={theme.palette.error.main}
            trendLabel="since last scan"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Critical Attack Paths"
            value={data.criticalAttackPaths}
            previousValue={data.previousCriticalAttackPaths}
            icon={<SecurityIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Risk Score"
            value={data.overallRiskScore}
            previousValue={data.previousRiskScore}
            icon={<SecurityIcon />}
            subtitle="Scale: 0-100"
            color={
              data.overallRiskScore > 75
                ? theme.palette.error.main
                : data.overallRiskScore > 50
                ? theme.palette.warning.main
                : data.overallRiskScore > 25
                ? theme.palette.info.main
                : theme.palette.success.main
            }
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Vulnerabilities by Severity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Vulnerabilities by Severity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.vulnerabilitiesBySeverity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="severity"
                  label={({ severity, percent }) =>
                    `${severity}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.vulnerabilitiesBySeverity.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        vulnerabilitySeverityColors[
                          entry.severity as keyof typeof vulnerabilitySeverityColors
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Risk Score Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Risk Score Trend
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data.riskScoreHistory}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Risk Score"
                  stroke={theme.palette.primary.main}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Vulnerabilities by Asset Type */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Vulnerabilities by Asset Type
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.vulnerabilitiesByAssetType}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="assetType" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar
                  dataKey="critical"
                  name="Critical"
                  stackId="a"
                  fill={vulnerabilitySeverityColors.CRITICAL}
                />
                <Bar
                  dataKey="high"
                  name="High"
                  stackId="a"
                  fill={vulnerabilitySeverityColors.HIGH}
                />
                <Bar
                  dataKey="medium"
                  name="Medium"
                  stackId="a"
                  fill={vulnerabilitySeverityColors.MEDIUM}
                />
                <Bar
                  dataKey="low"
                  name="Low"
                  stackId="a"
                  fill={vulnerabilitySeverityColors.LOW}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Attack Vectors Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Attack Vectors Distribution
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.attackVectorsDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="vector"
                  label={({ vector, percent }) =>
                    `${vector}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.attackVectorsDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={theme.palette.primary.main}
                      opacity={0.9 - index * 0.15}
                    />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Critical Issues and Remediations */}
      <Grid container spacing={3}>
        {/* Critical Attack Paths */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Critical Attack Paths
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {data.topCriticalPaths.map((path, index) => (
                <ListItem
                  key={index}
                  alignItems="flex-start"
                  divider={index < data.topCriticalPaths.length - 1}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                      >
                        <Chip
                          label={`Risk: ${path.riskScore}`}
                          size="small"
                          color={
                            path.riskScore > 75
                              ? "error"
                              : path.riskScore > 50
                              ? "warning"
                              : "info"
                          }
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="subtitle2">{path.name}</Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                        >
                          {path.description}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mt: 1,
                          }}
                        >
                          <Chip
                            label={`${path.steps} steps`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`${path.assets} assets`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recommended Remediations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recommended Remediations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {data.recommendedRemediations.map((remediation, index) => (
                <ListItem
                  key={index}
                  alignItems="flex-start"
                  divider={index < data.recommendedRemediations.length - 1}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                      >
                        <Chip
                          label={`Impact: ${remediation.impactScore}`}
                          size="small"
                          color={
                            remediation.impactScore > 75
                              ? "success"
                              : remediation.impactScore > 50
                              ? "info"
                              : "default"
                          }
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="subtitle2">
                          {remediation.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                        >
                          {remediation.description}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ mr: 1 }}
                          >
                            Effort:
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {[1, 2, 3, 4, 5].map((value) => (
                              <CircleIcon
                                key={value}
                                sx={{
                                  fontSize: 12,
                                  color:
                                    value <= remediation.effort
                                      ? theme.palette.warning.main
                                      : theme.palette.grey[300],
                                  mr: 0.2,
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
