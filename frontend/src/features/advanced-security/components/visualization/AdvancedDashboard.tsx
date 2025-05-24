/**
 * Advanced Dashboard Component
 *
 * A flexible, configurable dashboard component that can display various
 * types of visualizations in a grid layout with interactive features.
 * Supports multiple chart types and real-time data updates.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  GetApp as DownloadIcon,
  AddCircleOutline as AddIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  BubbleChart as BubbleChartIcon,
  TableChart as TableChartIcon,
  Map as MapIcon,
} from "@mui/icons-material";

// Note: In a real implementation, you would import actual chart components
// import {
//   BarChart, Bar, LineChart, Line, PieChart, Pie,
//   XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
//   Legend, ResponsiveContainer
// } from 'recharts';

export type ChartType =
  | "bar"
  | "line"
  | "pie"
  | "area"
  | "scatter"
  | "heatmap"
  | "table"
  | "map"
  | "number";

export interface DataPoint {
  [key: string]: any;
}

export interface ChartData {
  data: DataPoint[];
  keys: string[];
  colors?: { [key: string]: string };
  title: string;
  subTitle?: string;
}

export interface DashboardWidgetConfig {
  id: string;
  type: ChartType;
  title: string;
  chartData: ChartData;
  gridPosition: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  refreshInterval?: number; // in seconds
  options?: {
    stacked?: boolean;
    showLegend?: boolean;
    showGrid?: boolean;
    showTooltip?: boolean;
    showDataLabels?: boolean;
  };
}

export interface AdvancedDashboardProps {
  widgets: DashboardWidgetConfig[];
  title?: string;
  subtitle?: string;
  isEditable?: boolean;
  isLoading?: boolean;
  autoRefresh?: boolean;
  darkMode?: boolean;
  onWidgetChange?: (updatedWidget: DashboardWidgetConfig) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetAdd?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  maxColumns?: number;
}

export const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  widgets,
  title = "Dashboard",
  subtitle,
  isEditable = false,
  isLoading = false,
  autoRefresh = false,
  darkMode = false,
  onWidgetChange,
  onWidgetRemove,
  onWidgetAdd,
  onRefresh,
  onExport,
  maxColumns = 12,
}) => {
  const theme = useTheme();

  // State for menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [fullscreenWidgetId, setFullscreenWidgetId] = useState<string | null>(
    null
  );
  const [timeRange, setTimeRange] = useState<string>("24h");

  // Handle refresh timers for widgets with auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const timers: NodeJS.Timeout[] = [];

    widgets.forEach((widget) => {
      if (widget.refreshInterval && widget.refreshInterval > 0) {
        const timer = setInterval(() => {
          if (onRefresh) {
            onRefresh();
          }
        }, widget.refreshInterval * 1000);

        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearInterval(timer));
    };
  }, [widgets, autoRefresh, onRefresh]);

  // Handle menu open
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    widgetId: string
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveWidgetId(widgetId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveWidgetId(null);
  };

  // Handle widget remove
  const handleRemoveWidget = () => {
    if (activeWidgetId && onWidgetRemove) {
      onWidgetRemove(activeWidgetId);
    }
    handleMenuClose();
  };

  // Handle widget fullscreen toggle
  const handleFullscreenToggle = (widgetId: string) => {
    setFullscreenWidgetId(fullscreenWidgetId === widgetId ? null : widgetId);
  };

  // Handle time range change
  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: string | null
  ) => {
    if (newTimeRange) {
      setTimeRange(newTimeRange);
      if (onRefresh) {
        onRefresh();
      }
    }
  };

  // Handle dashboard refresh
  const handleDashboardRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // Handle dashboard export
  const handleDashboardExport = () => {
    if (onExport) {
      onExport();
    }
  };

  // Get chart icon based on type
  const getChartIcon = (type: ChartType) => {
    switch (type) {
      case "bar":
        return <BarChartIcon />;
      case "pie":
        return <PieChartIcon />;
      case "line":
      case "area":
        return <LineChartIcon />;
      case "scatter":
      case "heatmap":
        return <BubbleChartIcon />;
      case "table":
        return <TableChartIcon />;
      case "map":
        return <MapIcon />;
      default:
        return <BarChartIcon />;
    }
  };

  // Render chart based on widget config
  const renderChart = (widget: DashboardWidgetConfig) => {
    const { type, chartData, options = {} } = widget;

    // Mock visualizations for demonstration
    switch (type) {
      case "bar":
        return (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              p: 2,
            }}
          >
            <BarChartIcon
              sx={{
                fontSize: 60,
                color: theme.palette.primary.main,
                opacity: 0.7,
                mb: 2,
              }}
            />
            <Typography variant="caption" align="center" color="textSecondary">
              Bar chart visualization would be rendered here using actual chart
              library
            </Typography>

            {/* Mock Bar Chart */}
            <Box
              sx={{
                width: "100%",
                height: 120,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-around",
                mt: 2,
              }}
            >
              {chartData.data.slice(0, 7).map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    height: `${30 + Math.random() * 70}%`,
                    width: "8%",
                    backgroundColor:
                      chartData.colors?.[chartData.keys[0]] ||
                      theme.palette.primary.main,
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s ease",
                    "&:hover": {
                      opacity: 0.8,
                      height: `${parseInt(item[chartData.keys[0]]) + 10}%`,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        );

      case "line":
        return (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              p: 2,
            }}
          >
            <LineChartIcon
              sx={{
                fontSize: 60,
                color: theme.palette.primary.main,
                opacity: 0.7,
                mb: 2,
              }}
            />
            <Typography variant="caption" align="center" color="textSecondary">
              Line chart visualization would be rendered here using actual chart
              library
            </Typography>

            {/* Mock Line Chart */}
            <Box
              sx={{
                width: "100%",
                height: 120,
                position: "relative",
                mt: 2,
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline
                  points="0,70 10,65 20,50 30,55 40,40 50,45 60,30 70,35 80,20 90,25 100,10"
                  fill="none"
                  stroke={
                    chartData.colors?.[chartData.keys[0]] ||
                    theme.palette.primary.main
                  }
                  strokeWidth="2"
                />
              </svg>
            </Box>
          </Box>
        );

      case "pie":
        return (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              p: 2,
            }}
          >
            <PieChartIcon
              sx={{
                fontSize: 60,
                color: theme.palette.primary.main,
                opacity: 0.7,
                mb: 2,
              }}
            />
            <Typography variant="caption" align="center" color="textSecondary">
              Pie chart visualization would be rendered here using actual chart
              library
            </Typography>

            {/* Mock Pie Chart */}
            <Box
              sx={{
                width: 150,
                height: 150,
                position: "relative",
                mt: 2,
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill={theme.palette.error.main}
                />
                <path
                  d="M 50 50 L 90 50 A 40 40 0 0 1 75 85 Z"
                  fill={theme.palette.warning.main}
                />
                <path
                  d="M 50 50 L 75 85 A 40 40 0 0 1 25 85 Z"
                  fill={theme.palette.success.main}
                />
                <path
                  d="M 50 50 L 25 85 A 40 40 0 0 1 10 50 Z"
                  fill={theme.palette.info.main}
                />
                <path
                  d="M 50 50 L 10 50 A 40 40 0 0 1 30 15 Z"
                  fill={theme.palette.primary.main}
                />
                <path
                  d="M 50 50 L 30 15 A 40 40 0 0 1 90 50 Z"
                  fill={theme.palette.secondary.main}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill={
                    darkMode
                      ? theme.palette.grey[900]
                      : theme.palette.common.white
                  }
                />
              </svg>
            </Box>
          </Box>
        );

      case "heatmap":
        return (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              p: 2,
            }}
          >
            <BubbleChartIcon
              sx={{
                fontSize: 60,
                color: theme.palette.primary.main,
                opacity: 0.7,
                mb: 2,
              }}
            />
            <Typography variant="caption" align="center" color="textSecondary">
              Heatmap visualization would be rendered here using actual chart
              library
            </Typography>

            {/* Mock Heatmap */}
            <Grid container spacing={1} sx={{ mt: 2 }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <Grid item xs={2} key={i}>
                  <Box
                    sx={{
                      width: "100%",
                      paddingTop: "100%",
                      bgcolor: `rgba(255, 0, 0, ${Math.random() * 0.8 + 0.2})`,
                      borderRadius: 1,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case "map":
        return (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              p: 2,
            }}
          >
            <MapIcon
              sx={{
                fontSize: 60,
                color: theme.palette.primary.main,
                opacity: 0.7,
                mb: 2,
              }}
            />
            <Typography variant="caption" align="center" color="textSecondary">
              Geographic map visualization would be rendered here using actual
              mapping library
            </Typography>

            {/* Mock Map */}
            <Box
              sx={{
                width: "100%",
                height: 150,
                bgcolor: theme.palette.background.default,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 2,
              }}
            >
              <Typography variant="body2" color="textSecondary">
                World Map
              </Typography>
            </Box>
          </Box>
        );

      case "number":
        return (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 2,
            }}
          >
            <Typography
              variant="h2"
              align="center"
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              {chartData.data.length > 0
                ? chartData.data[0][chartData.keys[0]]
                : 0}
            </Typography>
            {chartData.data.length > 0 &&
              chartData.data[0].change !== undefined && (
                <Typography
                  variant="body2"
                  align="center"
                  color={
                    chartData.data[0].change >= 0
                      ? "success.main"
                      : "error.main"
                  }
                  sx={{ mt: 1 }}
                >
                  {chartData.data[0].change >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(chartData.data[0].change)}%
                </Typography>
              )}
          </Box>
        );

      case "table":
        return (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              p: 1,
              overflow: "auto",
            }}
          >
            <Box
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                pb: 1,
                mb: 1,
              }}
            >
              {chartData.keys.map((key, index) => (
                <Typography
                  key={key}
                  variant="caption"
                  component="span"
                  sx={{
                    mr: 2,
                    fontWeight: "bold",
                    color: chartData.colors?.[key] || "inherit",
                  }}
                >
                  {key}
                </Typography>
              ))}
            </Box>

            {chartData.data.slice(0, 5).map((row, rowIndex) => (
              <Box
                key={rowIndex}
                sx={{
                  display: "flex",
                  mb: 1,
                  pb: 1,
                  borderBottom:
                    rowIndex < 4
                      ? `1px solid ${theme.palette.divider}`
                      : "none",
                }}
              >
                {chartData.keys.map((key, colIndex) => (
                  <Typography
                    key={`${rowIndex}-${key}`}
                    variant="body2"
                    sx={{
                      mr: 2,
                      flex: colIndex === 0 ? 2 : 1,
                      color:
                        key === "status"
                          ? row[key] === "Critical"
                            ? theme.palette.error.main
                            : row[key] === "Warning"
                            ? theme.palette.warning.main
                            : row[key] === "Normal"
                            ? theme.palette.success.main
                            : "inherit"
                          : "inherit",
                    }}
                  >
                    {row[key]}
                  </Typography>
                ))}
              </Box>
            ))}

            {chartData.data.length > 5 && (
              <Typography
                variant="caption"
                color="textSecondary"
                align="center"
                sx={{ mt: 1 }}
              >
                + {chartData.data.length - 5} more rows
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Unsupported chart type: {type}
            </Typography>
          </Box>
        );
    }
  };

  // If a widget is in fullscreen mode, only render that widget
  if (fullscreenWidgetId) {
    const fullscreenWidget = widgets.find((w) => w.id === fullscreenWidgetId);

    if (fullscreenWidget) {
      return (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: theme.zIndex.modal,
            backgroundColor: darkMode
              ? theme.palette.grey[900]
              : theme.palette.background.paper,
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h5"
              color={
                darkMode
                  ? theme.palette.common.white
                  : theme.palette.text.primary
              }
            >
              {fullscreenWidget.title}
            </Typography>

            <IconButton
              onClick={() => handleFullscreenToggle(fullscreenWidgetId)}
            >
              <FullscreenExitIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
            {renderChart(fullscreenWidget)}
          </Box>
        </Box>
      );
    }
  }

  return (
    <Paper
      sx={{
        p: 2,
        backgroundColor: darkMode
          ? theme.palette.grey[900]
          : theme.palette.background.paper,
        color: darkMode
          ? theme.palette.common.white
          : theme.palette.text.primary,
      }}
    >
      {/* Dashboard Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Time Range Selector */}
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            size="small"
          >
            <ToggleButton value="1h">1h</ToggleButton>
            <ToggleButton value="24h">24h</ToggleButton>
            <ToggleButton value="7d">7d</ToggleButton>
            <ToggleButton value="30d">30d</ToggleButton>
          </ToggleButtonGroup>

          {/* Action Buttons */}
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleDashboardRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export Dashboard">
            <IconButton onClick={handleDashboardExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          {isEditable && (
            <Tooltip title="Add Widget">
              <IconButton onClick={onWidgetAdd}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Dashboard Content */}
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {widgets.map((widget) => (
            <Grid
              item
              key={widget.id}
              xs={12}
              sm={widget.gridPosition.w <= 6 ? 6 : 12}
              md={
                widget.gridPosition.w <= 4
                  ? 4
                  : widget.gridPosition.w <= 8
                  ? 8
                  : 12
              }
              lg={widget.gridPosition.w}
            >
              <Card
                variant="outlined"
                sx={{
                  height: widget.gridPosition.h * 100,
                  minHeight: 150,
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: darkMode
                    ? theme.palette.grey[800]
                    : theme.palette.background.paper,
                  color: darkMode
                    ? theme.palette.common.white
                    : theme.palette.text.primary,
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {getChartIcon(widget.type)}
                      <Typography variant="subtitle1" sx={{ ml: 1 }}>
                        {widget.title}
                      </Typography>
                    </Box>
                  }
                  action={
                    <Box>
                      <Tooltip title="Fullscreen">
                        <IconButton
                          onClick={() => handleFullscreenToggle(widget.id)}
                          size="small"
                        >
                          <FullscreenIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {isEditable && (
                        <IconButton
                          aria-label="more"
                          onClick={(e) => handleMenuOpen(e, widget.id)}
                          size="small"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  }
                  sx={{
                    padding: 1.5,
                    "& .MuiCardHeader-title": {
                      fontSize: "1rem",
                      color: darkMode
                        ? theme.palette.common.white
                        : theme.palette.text.primary,
                    },
                  }}
                />

                <CardContent
                  sx={{ flexGrow: 1, padding: 1, overflow: "hidden" }}
                >
                  {renderChart(widget)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Widget Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Widget
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
          Refresh Data
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export Data
        </MenuItem>
        <MenuItem onClick={handleRemoveWidget}>
          <CloseIcon fontSize="small" sx={{ mr: 1 }} />
          Remove Widget
        </MenuItem>
      </Menu>
    </Paper>
  );
};
