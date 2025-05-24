import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Button,
  Menu,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  StackedBarChart as StackedBarChartIcon,
  DonutLarge as DonutChartIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  FileDownload as DownloadIcon,
  Fullscreen as FullscreenIcon,
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Define props interface
interface CustomChartWidgetProps {
  data: any;
  widget: DashboardWidget;
}

// Define chart types
enum ChartType {
  LINE = "line",
  BAR = "bar",
  PIE = "pie",
  DOUGHNUT = "doughnut",
  STACKED_BAR = "stacked_bar",
}

// Define time intervals
enum TimeInterval {
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

// Define metric types
enum MetricType {
  ALERTS = "alerts",
  EVENTS = "events",
  TRAFFIC = "traffic",
  RESOURCES = "resources",
  COMPLIANCE = "compliance",
  USERS = "users",
}

// Define chart configuration
interface ChartConfig {
  type: ChartType;
  title: string;
  metric: MetricType;
  timeInterval: TimeInterval;
  timeRange: string;
  stacked?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  colors?: string[];
}

/**
 * CustomChartWidget Component
 *
 * Allows users to create and configure custom visualizations of security metrics
 * with support for different chart types, time ranges, and data sources
 */
const CustomChartWidget: React.FC<CustomChartWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Mock data for development
  const mockData = {
    config: {
      type: ChartType.LINE,
      title: "Security Alerts Trend",
      metric: MetricType.ALERTS,
      timeInterval: TimeInterval.DAILY,
      timeRange: "30d",
      stacked: false,
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      colors: [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.error.main,
      ],
    },
    data: {
      labels: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
      }),
      datasets: [
        {
          label: "Critical Alerts",
          data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 8)),
          borderColor: theme.palette.error.main,
          backgroundColor: alpha(theme.palette.error.main, 0.1),
          tension: 0.4,
          fill: true,
        },
        {
          label: "High Alerts",
          data: Array.from(
            { length: 30 },
            () => Math.floor(Math.random() * 20) + 5
          ),
          borderColor: theme.palette.warning.main,
          backgroundColor: alpha(theme.palette.warning.main, 0.1),
          tension: 0.4,
          fill: true,
        },
        {
          label: "Medium Alerts",
          data: Array.from(
            { length: 30 },
            () => Math.floor(Math.random() * 30) + 10
          ),
          borderColor: theme.palette.info.main,
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          tension: 0.4,
          fill: true,
        },
      ],
    },
    availableCharts: [
      {
        type: ChartType.LINE,
        title: "Security Alerts Trend",
        metric: MetricType.ALERTS,
        timeInterval: TimeInterval.DAILY,
        timeRange: "30d",
      },
      {
        type: ChartType.BAR,
        title: "Resource Usage",
        metric: MetricType.RESOURCES,
        timeInterval: TimeInterval.HOURLY,
        timeRange: "24h",
      },
      {
        type: ChartType.PIE,
        title: "Alert Distribution",
        metric: MetricType.ALERTS,
        timeInterval: TimeInterval.DAILY,
        timeRange: "7d",
      },
      {
        type: ChartType.STACKED_BAR,
        title: "Events by Type",
        metric: MetricType.EVENTS,
        timeInterval: TimeInterval.WEEKLY,
        timeRange: "12w",
      },
      {
        type: ChartType.DOUGHNUT,
        title: "Compliance Status",
        metric: MetricType.COMPLIANCE,
        timeInterval: TimeInterval.MONTHLY,
        timeRange: "6m",
      },
    ],
  };

  // Use real data if available, otherwise use mock data
  const chartData = data || mockData;

  // Current chart configuration
  const chartConfig = chartData.config;

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle chart type change
  const handleChartTypeChange = (event: any) => {
    // In a real implementation, this would update the chart configuration
    console.log("Changing chart type to:", event.target.value);
  };

  // Handle refresh
  const handleRefresh = () => {
    // In a real implementation, this would refresh chart data
    console.log("Refreshing chart data");
  };

  // Handle download chart
  const handleDownloadChart = () => {
    // In a real implementation, this would download the chart as an image
    console.log("Downloading chart");
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    // In a real implementation, this would open the chart in fullscreen
    console.log("Opening chart in fullscreen");
  };

  // Handle chart selection
  const handleChartSelection = (chart: any) => {
    // In a real implementation, this would change the chart
    console.log("Selected chart:", chart.title);
    handleMenuClose();
  };

  // Get chart type icon
  const getChartTypeIcon = (type: ChartType) => {
    switch (type) {
      case ChartType.LINE:
        return <LineChartIcon />;
      case ChartType.BAR:
        return <BarChartIcon />;
      case ChartType.PIE:
        return <PieChartIcon />;
      case ChartType.DOUGHNUT:
        return <DonutChartIcon />;
      case ChartType.STACKED_BAR:
        return <StackedBarChartIcon />;
      default:
        return <BarChartIcon />;
    }
  };

  // Render chart based on type
  const renderChart = () => {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartConfig.showLegend,
          position: "top" as const,
          labels: {
            boxWidth: 12,
            font: {
              size: 10,
            },
          },
        },
        tooltip: {
          enabled: chartConfig.showTooltip,
        },
      },
    };

    // Line chart options
    const lineOptions = {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: chartConfig.showGrid,
          },
          ticks: {
            font: {
              size: 10,
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 9,
            },
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
      elements: {
        point: {
          radius: 2,
        },
        line: {
          tension: 0.4,
        },
      },
    };

    // Bar chart options
    const barOptions = {
      ...commonOptions,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: chartConfig.showGrid,
          },
          ticks: {
            font: {
              size: 10,
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 9,
            },
          },
        },
      },
    };

    // Pie/Doughnut chart options
    const pieOptions = {
      ...commonOptions,
      cutout: chartConfig.type === ChartType.DOUGHNUT ? "60%" : undefined,
    };

    // Render appropriate chart type
    switch (chartConfig.type) {
      case ChartType.LINE:
        return <Line data={chartData.data} options={lineOptions} />;

      case ChartType.BAR:
      case ChartType.STACKED_BAR:
        return <Bar data={chartData.data} options={barOptions} />;

      case ChartType.PIE:
        return <Pie data={chartData.data} options={pieOptions} />;

      case ChartType.DOUGHNUT:
        return <Doughnut data={chartData.data} options={pieOptions} />;

      default:
        return <Line data={chartData.data} options={lineOptions} />;
    }
  };

  // Format time interval for display
  const formatTimeInterval = (interval: TimeInterval): string => {
    switch (interval) {
      case TimeInterval.HOURLY:
        return "Hourly";
      case TimeInterval.DAILY:
        return "Daily";
      case TimeInterval.WEEKLY:
        return "Weekly";
      case TimeInterval.MONTHLY:
        return "Monthly";
      default:
        return interval;
    }
  };

  // Format metric type for display
  const formatMetricType = (metric: MetricType): string => {
    switch (metric) {
      case MetricType.ALERTS:
        return "Alerts";
      case MetricType.EVENTS:
        return "Events";
      case MetricType.TRAFFIC:
        return "Traffic";
      case MetricType.RESOURCES:
        return "Resources";
      case MetricType.COMPLIANCE:
        return "Compliance";
      case MetricType.USERS:
        return "Users";
      default:
        return metric;
    }
  };

  // Format time range for display
  const formatTimeRange = (range: string): string => {
    const value = parseInt(range.slice(0, -1));
    const unit = range.slice(-1);

    switch (unit) {
      case "h":
        return `${value} Hour${value > 1 ? "s" : ""}`;
      case "d":
        return `${value} Day${value > 1 ? "s" : ""}`;
      case "w":
        return `${value} Week${value > 1 ? "s" : ""}`;
      case "m":
        return `${value} Month${value > 1 ? "s" : ""}`;
      case "y":
        return `${value} Year${value > 1 ? "s" : ""}`;
      default:
        return range;
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ mr: 1, color: "primary.main" }}>
            {getChartTypeIcon(chartConfig.type)}
          </Box>
          <Typography variant="subtitle2">{chartConfig.title}</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Refresh Data">
            <IconButton size="small" onClick={handleRefresh} sx={{ mr: 0.5 }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download Chart">
            <IconButton
              size="small"
              onClick={handleDownloadChart}
              sx={{ mr: 0.5 }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="View Fullscreen">
            <IconButton
              size="small"
              onClick={handleFullscreen}
              sx={{ mr: 0.5 }}
            >
              <FullscreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Chart Settings">
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Chart info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          flexWrap: "wrap",
          gap: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {formatMetricType(chartConfig.metric)} •{" "}
          {formatTimeInterval(chartConfig.timeInterval)} • Last{" "}
          {formatTimeRange(chartConfig.timeRange)}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="chart-type-label">Chart Type</InputLabel>
            <Select
              labelId="chart-type-label"
              id="chart-type"
              value={chartConfig.type}
              label="Chart Type"
              onChange={handleChartTypeChange}
              size="small"
              sx={{ height: 32 }}
            >
              <MenuItem value={ChartType.LINE}>Line Chart</MenuItem>
              <MenuItem value={ChartType.BAR}>Bar Chart</MenuItem>
              <MenuItem value={ChartType.PIE}>Pie Chart</MenuItem>
              <MenuItem value={ChartType.DOUGHNUT}>Doughnut Chart</MenuItem>
              <MenuItem value={ChartType.STACKED_BAR}>Stacked Bar</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Chart container */}
      <Box
        sx={{
          flexGrow: 1,
          position: "relative",
          bgcolor: alpha(theme.palette.background.default, 0.5),
          p: 1,
          borderRadius: 1,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {renderChart()}
      </Box>

      {/* Chart menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Available Charts
        </Typography>
        <Divider />

        {chartData.availableCharts.map((chart, index) => (
          <MenuItem key={index} onClick={() => handleChartSelection(chart)}>
            <Box
              sx={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 1,
                color: "primary.main",
              }}
            >
              {getChartTypeIcon(chart.type)}
            </Box>
            <Box>
              <Typography variant="body2">{chart.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatMetricType(chart.metric)} •{" "}
                {formatTimeRange(chart.timeRange)}
              </Typography>
            </Box>
          </MenuItem>
        ))}

        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">Chart Settings</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CustomChartWidget;
