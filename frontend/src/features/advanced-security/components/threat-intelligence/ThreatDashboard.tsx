/**
 * Threat Dashboard
 *
 * Component for displaying overview metrics and statistics for the threat intelligence platform
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
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
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
  OpenInNew as OpenInNewIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  Computer as ComputerIcon,
  Public as PublicIcon,
  Email as EmailIcon,
  Http as HttpIcon,
} from "@mui/icons-material";

import { useGetThreatStatsQuery } from "../../services/threatIntelligenceService";
import {
  ThreatCategory,
  ThreatType,
  IndicatorType,
} from "../../types/threatIntelTypes";

// Interface for the statistic card component
interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  color: string;
}

// Statistic card component with trend indicator
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  previousValue = 0,
  icon,
  color,
}) => {
  const theme = useTheme();

  // Calculate percent change
  const percentChange = previousValue
    ? Math.round(((value - previousValue) / previousValue) * 100)
    : 0;

  // Determine trend direction
  const isTrendUp = percentChange > 0;
  const isTrendDown = percentChange < 0;

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
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
        {previousValue > 0 && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isTrendUp && (
              <TrendingUpIcon
                sx={{
                  color: title.includes("Remediated")
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                  mr: 0.5,
                  fontSize: 16,
                }}
              />
            )}
            {isTrendDown && (
              <TrendingDownIcon
                sx={{
                  color: title.includes("Remediated")
                    ? theme.palette.error.main
                    : theme.palette.success.main,
                  mr: 0.5,
                  fontSize: 16,
                }}
              />
            )}
            <Typography
              variant="body2"
              color={
                title.includes("Remediated")
                  ? isTrendUp
                    ? "success"
                    : isTrendDown
                    ? "error"
                    : "textSecondary"
                  : isTrendUp
                  ? "error"
                  : isTrendDown
                  ? "success"
                  : "textSecondary"
              }
            >
              {isTrendUp ? "+" : ""}
              {percentChange}% vs previous period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ThreatDashboard: React.FC = () => {
  const theme = useTheme();

  // Time range state
  const [timeRange, setTimeRange] = useState("7days");

  // Fetch threat intelligence stats
  const { data, isLoading, error, refetch } = useGetThreatStatsQuery(timeRange);

  // Handle time range change
  const handleTimeRangeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setTimeRange(event.target.value as string);
  };

  // Colors for charts
  const threatCategoryColors = {
    MALWARE: theme.palette.error.main,
    PHISHING: theme.palette.warning.main,
    COMMAND_AND_CONTROL: theme.palette.info.main,
    VULNERABILITY: theme.palette.primary.main,
    RANSOMWARE: theme.palette.error.dark,
    DATA_LEAK: theme.palette.secondary.main,
  };

  // Colors for indicator types
  const indicatorTypeColors = {
    IP: theme.palette.primary.main,
    DOMAIN: theme.palette.secondary.main,
    URL: theme.palette.error.main,
    FILE_HASH: theme.palette.warning.main,
    EMAIL: theme.palette.info.main,
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
        Error loading threat intelligence statistics. Please try again.
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No threat intelligence data available.
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
          Threat Intelligence Dashboard
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FormControl sx={{ width: 180, mr: 2 }} size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="24hours">Last 24 Hours</MenuItem>
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
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
            title="Total Indicators"
            value={data.totalIndicators}
            previousValue={data.previousTotalIndicators}
            icon={<SecurityIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Threats"
            value={data.activeThreats}
            previousValue={data.previousActiveThreats}
            icon={<WarningIcon />}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Threat Actors"
            value={data.threatActors}
            previousValue={data.previousThreatActors}
            icon={<ComputerIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Threats Remediated"
            value={data.threatsRemediated}
            previousValue={data.previousThreatsRemediated}
            icon={<SecurityIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Threats Over Time */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Threats Over Time
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data.threatsOverTime}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="detected"
                  name="Detected"
                  stroke={theme.palette.primary.main}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="blocked"
                  name="Blocked"
                  stroke={theme.palette.success.main}
                />
                <Line
                  type="monotone"
                  dataKey="investigating"
                  name="Investigating"
                  stroke={theme.palette.warning.main}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Threats by Category */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Threats by Category
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.threatsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="category"
                  label={({ category, percent }) =>
                    `${category}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.threatsByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        threatCategoryColors[
                          entry.category as keyof typeof threatCategoryColors
                        ] || theme.palette.grey[500]
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Indicators by Type */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Indicators by Type
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.indicatorsByType}
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

        {/* Top Threat Actors */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Top Threat Actors</Typography>
              <Button variant="text" endIcon={<OpenInNewIcon />} size="small">
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Actor Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell align="right">Threat Count</TableCell>
                    <TableCell align="right">Confidence</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topThreatActors.map((actor) => (
                    <TableRow key={actor.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {actor.name}
                          {actor.isActive && (
                            <Chip
                              label="Active"
                              size="small"
                              color="error"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{actor.type}</TableCell>
                      <TableCell>{actor.region}</TableCell>
                      <TableCell align="right">{actor.threatCount}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${actor.confidence}%`}
                          size="small"
                          color={
                            actor.confidence >= 80
                              ? "success"
                              : actor.confidence >= 60
                              ? "warning"
                              : "error"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Recent Indicators */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Recent Indicators</Typography>
              <Button variant="text" endIcon={<OpenInNewIcon />} size="small">
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Added</TableCell>
                    <TableCell align="right">Confidence</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recentIndicators.map((indicator) => (
                    <TableRow key={indicator.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {indicator.type === "IP" && (
                            <PublicIcon fontSize="small" sx={{ mr: 1 }} />
                          )}
                          {indicator.type === "DOMAIN" && (
                            <HttpIcon fontSize="small" sx={{ mr: 1 }} />
                          )}
                          {indicator.type === "URL" && (
                            <HttpIcon fontSize="small" sx={{ mr: 1 }} />
                          )}
                          {indicator.type === "EMAIL" && (
                            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                          )}
                          {indicator.type === "FILE_HASH" && (
                            <ComputerIcon fontSize="small" sx={{ mr: 1 }} />
                          )}
                          {indicator.type}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {indicator.value}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={indicator.category}
                          size="small"
                          sx={{
                            bgcolor:
                              threatCategoryColors[
                                indicator.category as keyof typeof threatCategoryColors
                              ] || theme.palette.grey[500],
                            color: "white",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(indicator.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${indicator.confidence}%`}
                          size="small"
                          color={
                            indicator.confidence >= 80
                              ? "success"
                              : indicator.confidence >= 60
                              ? "warning"
                              : "error"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Threat Reports */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Recent Threat Reports</Typography>
              <Button variant="text" endIcon={<OpenInNewIcon />} size="small">
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {data.recentReports.map((report) => (
                <Card key={report.id} variant="outlined">
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1">
                        {report.title}
                      </Typography>
                      <Chip
                        label={report.severity}
                        size="small"
                        color={
                          report.severity === "CRITICAL"
                            ? "error"
                            : report.severity === "HIGH"
                            ? "warning"
                            : report.severity === "MEDIUM"
                            ? "info"
                            : "success"
                        }
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      {report.description.length > 120
                        ? report.description.substring(0, 120) + "..."
                        : report.description}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <Typography variant="caption" color="textSecondary">
                        Published:{" "}
                        {new Date(report.publishedDate).toLocaleDateString()}
                      </Typography>
                      <Button size="small">Read More</Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export { ThreatDashboard };
