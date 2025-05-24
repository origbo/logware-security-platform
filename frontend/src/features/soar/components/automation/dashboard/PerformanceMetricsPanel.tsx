import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  Divider,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PerformanceMetric, mockPerformanceMetrics } from "./executionTypes";

// Custom components to simulate recharts since we can't actually import the library in this environment
const CustomBarChart = ({
  data,
  dataKey,
  xKey,
}: {
  data: any[];
  dataKey: string;
  xKey: string;
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ height: 300, position: "relative" }}>
      <Typography
        variant="caption"
        sx={{ position: "absolute", top: 0, right: 0 }}
      >
        Bar Chart Visualization
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
          pl: 5, // Space for y-axis
          pt: 20, // Space for legend
          pb: 5, // Space for x-axis
        }}
      >
        {/* Simulate the bars */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "flex-end",
            position: "relative",
          }}
        >
          {data.map((item, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                mx: 1,
                height: `${(item[dataKey] / 100) * 80}%`, // Scale to 80% of the height for visual effect
                backgroundColor: theme.palette.primary.main,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                position: "relative",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  bottom: -20,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontSize: "0.7rem",
                }}
              >
                {item[xKey]}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: -20,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {item[dataKey]}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const CustomLineChart = ({
  data,
  dataKeys,
}: {
  data: any[];
  dataKeys: string[];
}) => {
  const theme = useTheme();
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
  ];

  return (
    <Box sx={{ height: 300, position: "relative" }}>
      <Typography
        variant="caption"
        sx={{ position: "absolute", top: 0, right: 0 }}
      >
        Line Chart Visualization
      </Typography>
      <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
        <Typography
          variant="caption"
          sx={{ position: "absolute", top: 15, left: 10 }}
        >
          Legend:{" "}
          {dataKeys.map((key, i) => (
            <Box component="span" key={key} sx={{ ml: 1 }}>
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  backgroundColor: colors[i % colors.length],
                  mr: 0.5,
                }}
              />
              {key}
            </Box>
          ))}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            p: 5,
          }}
        >
          <Typography>
            Line chart would show trend data over time for {dataKeys.join(", ")}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const CustomPieChart = ({ data }: { data: any[] }) => {
  const theme = useTheme();
  const COLORS = [
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box sx={{ height: 250, position: "relative" }}>
      <Typography
        variant="caption"
        sx={{ position: "absolute", top: 0, right: 0 }}
      >
        Pie Chart Visualization
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            position: "relative",
            background: `conic-gradient(${data
              .map(
                (entry, index) =>
                  `${COLORS[index % COLORS.length]} ${
                    index === 0
                      ? 0
                      : (data
                          .slice(0, index)
                          .reduce((sum, item) => sum + item.value, 0) /
                          total) *
                        100
                  }% ${
                    (data
                      .slice(0, index + 1)
                      .reduce((sum, item) => sum + item.value, 0) /
                      total) *
                    100
                  }%`
              )
              .join(", ")})`,
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          {data.map((entry, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", mx: 1 }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  backgroundColor: COLORS[index % COLORS.length],
                  mr: 0.5,
                }}
              />
              <Typography variant="caption">
                {entry.name}: {Math.round((entry.value / total) * 100)}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const PerformanceMetricsPanel: React.FC = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(
    mockPerformanceMetrics
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>("week");
  const [selectedMetric, setSelectedMetric] = useState<string>("success_rate");

  // Overall statistics
  const totalExecutions = metrics.reduce(
    (sum, metric) => sum + metric.totalExecutions,
    0
  );
  const successfulExecutions = metrics.reduce(
    (sum, metric) => sum + metric.successCount,
    0
  );
  const failedExecutions = metrics.reduce(
    (sum, metric) => sum + metric.failureCount,
    0
  );
  const overallSuccessRate = Math.round(
    (successfulExecutions / totalExecutions) * 100
  );

  // Get most frequently executed automation
  const mostFrequentAutomation = metrics.reduce((prev, current) =>
    prev.totalExecutions > current.totalExecutions ? prev : current
  );

  // Create data for error distribution pie chart
  const errorCategories = metrics.flatMap((metric) =>
    metric.errorDistribution.map((error) => error.category)
  );
  const uniqueErrorCategories = Array.from(new Set(errorCategories));

  const errorDistributionData = uniqueErrorCategories.map((category) => {
    const count = metrics.reduce((sum, metric) => {
      const error = metric.errorDistribution.find(
        (e) => e.category === category
      );
      return sum + (error ? error.count : 0);
    }, 0);

    return { name: category, value: count };
  });

  // Create data for execution trends
  const trendsData =
    metrics[0]?.trendsData.map((dayData) => {
      // Convert all metrics to the same date format
      const item: { [key: string]: any } = { date: dayData.date };

      // Sum up executions across all automations
      item.executions = metrics.reduce((sum, metric) => {
        const dayMetric = metric.trendsData.find(
          (d) => d.date === dayData.date
        );
        return sum + (dayMetric ? dayMetric.executions : 0);
      }, 0);

      // Calculate average success rate
      const successRatesSum = metrics.reduce((sum, metric) => {
        const dayMetric = metric.trendsData.find(
          (d) => d.date === dayData.date
        );
        return sum + (dayMetric ? dayMetric.successRate * 100 : 0);
      }, 0);

      item.successRate = Math.round(successRatesSum / metrics.length);

      // Calculate average duration
      const durationsSum = metrics.reduce((sum, metric) => {
        const dayMetric = metric.trendsData.find(
          (d) => d.date === dayData.date
        );
        return sum + (dayMetric ? dayMetric.avgDuration : 0);
      }, 0);

      item.avgDuration = Math.round(durationsSum / metrics.length);

      return item;
    }) || [];

  // Data for top automations by success rate
  const topAutomationsBySuccessRate = [...metrics]
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 5);

  // Data for top automations by frequency
  const topAutomationsByFrequency = [...metrics]
    .sort((a, b) => b.totalExecutions - a.totalExecutions)
    .slice(0, 5);

  // Handle period change
  const handlePeriodChange = (event: SelectChangeEvent) => {
    setSelectedPeriod(event.target.value);
  };

  // Handle metric change
  const handleMetricChange = (event: SelectChangeEvent) => {
    setSelectedMetric(event.target.value);
  };

  return (
    <Box>
      {/* Performance Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Executions
            </Typography>
            <Typography variant="h3">{totalExecutions}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Across all automations
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Overall Success Rate
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color:
                  overallSuccessRate >= 90
                    ? theme.palette.success.main
                    : overallSuccessRate >= 70
                    ? theme.palette.warning.main
                    : theme.palette.error.main,
              }}
            >
              {overallSuccessRate}%
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Chip
                size="small"
                label={`${successfulExecutions} Successful`}
                color="success"
                sx={{ mr: 1 }}
              />
              <Chip
                size="small"
                label={`${failedExecutions} Failed`}
                color="error"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Average Duration
            </Typography>
            <Typography variant="h3">
              {Math.round(
                metrics.reduce(
                  (sum, metric) => sum + metric.averageDuration,
                  0
                ) / metrics.length
              )}
              s
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Per execution
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Most Frequent
            </Typography>
            <Typography variant="h5" noWrap>
              {mostFrequentAutomation.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Chip
                size="small"
                label={`${mostFrequentAutomation.totalExecutions} Executions`}
                color="primary"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Chart Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="period-select-label">Time Period</InputLabel>
              <Select
                labelId="period-select-label"
                id="period-select"
                value={selectedPeriod}
                label="Time Period"
                onChange={handlePeriodChange}
              >
                <MenuItem value="day">Last 24 Hours</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="metric-select-label">Primary Metric</InputLabel>
              <Select
                labelId="metric-select-label"
                id="metric-select"
                value={selectedMetric}
                label="Primary Metric"
                onChange={handleMetricChange}
              >
                <MenuItem value="success_rate">Success Rate</MenuItem>
                <MenuItem value="execution_count">Execution Count</MenuItem>
                <MenuItem value="avg_duration">Average Duration</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Trends Over Time */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Execution Trends Over Time
            </Typography>
            <Box>
              <CustomLineChart
                data={trendsData}
                dataKeys={["executions", "successRate", "avgDuration"]}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Top Automations by Success Rate */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Automations by Success Rate
            </Typography>
            <Box>
              <CustomBarChart
                data={topAutomationsBySuccessRate.map((metric) => ({
                  name: metric.name,
                  rate: Math.round(metric.successRate * 100),
                }))}
                dataKey="rate"
                xKey="name"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Error Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error Distribution
            </Typography>
            <Box>
              <CustomPieChart data={errorDistributionData} />
            </Box>
          </Paper>
        </Grid>

        {/* Top Automation Details Table */}
        <Grid item xs={12}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="center">Type</TableCell>
                    <TableCell align="center">Total Executions</TableCell>
                    <TableCell align="center">Success Rate</TableCell>
                    <TableCell align="center">Avg Duration</TableCell>
                    <TableCell align="center">Frequency Rank</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell>{metric.name}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={
                            metric.type === "playbook" ? "Playbook" : "Rule"
                          }
                          color={
                            metric.type === "playbook" ? "primary" : "secondary"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        {metric.totalExecutions}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`${Math.round(metric.successRate * 100)}%`}
                          color={
                            metric.successRate >= 0.9
                              ? "success"
                              : metric.successRate >= 0.7
                              ? "warning"
                              : "error"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        {metric.averageDuration}s
                      </TableCell>
                      <TableCell align="center">
                        #{metric.frequencyRank}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceMetricsPanel;
