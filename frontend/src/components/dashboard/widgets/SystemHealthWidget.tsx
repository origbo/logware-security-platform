import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Divider,
  Chip,
  Grid,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  DeveloperBoard as DeveloperBoardIcon,
} from "@mui/icons-material";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";

// Define the props interface
interface SystemHealthWidgetProps {
  data: any;
  widget: DashboardWidget;
}

// Define system component status
enum ComponentStatus {
  HEALTHY = "healthy",
  WARNING = "warning",
  ERROR = "error",
  UNKNOWN = "unknown",
}

// Define system component
interface SystemComponent {
  id: string;
  name: string;
  status: ComponentStatus;
  metrics: {
    value: number;
    unit: string;
    threshold: number;
  }[];
  lastChecked: string;
}

// Define system resource
interface SystemResource {
  id: string;
  name: string;
  usage: number;
  limit?: number;
  unit: string;
  status: ComponentStatus;
}

/**
 * SystemHealthWidget Component
 *
 * Displays the health status of the system and its components
 * including resource usage metrics and component health status
 */
const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();

  // Mock data for development
  const mockData = {
    overallStatus: ComponentStatus.WARNING,
    lastUpdated: "2025-05-15T12:43:00Z",
    components: [
      {
        id: "comp-1",
        name: "API Server",
        status: ComponentStatus.HEALTHY,
        metrics: [{ value: 45, unit: "ms", threshold: 200 }],
        lastChecked: "2025-05-15T12:43:00Z",
      },
      {
        id: "comp-2",
        name: "Database",
        status: ComponentStatus.HEALTHY,
        metrics: [{ value: 12, unit: "ms", threshold: 100 }],
        lastChecked: "2025-05-15T12:43:00Z",
      },
      {
        id: "comp-3",
        name: "Elasticsearch",
        status: ComponentStatus.WARNING,
        metrics: [{ value: 350, unit: "ms", threshold: 300 }],
        lastChecked: "2025-05-15T12:42:00Z",
      },
      {
        id: "comp-4",
        name: "Message Queue",
        status: ComponentStatus.HEALTHY,
        metrics: [{ value: 5, unit: "ms", threshold: 50 }],
        lastChecked: "2025-05-15T12:43:00Z",
      },
    ],
    resources: [
      {
        id: "res-1",
        name: "CPU",
        usage: 42,
        unit: "%",
        status: ComponentStatus.HEALTHY,
      },
      {
        id: "res-2",
        name: "Memory",
        usage: 68,
        unit: "%",
        status: ComponentStatus.WARNING,
      },
      {
        id: "res-3",
        name: "Disk",
        usage: 76,
        unit: "%",
        status: ComponentStatus.WARNING,
      },
      {
        id: "res-4",
        name: "Network",
        usage: 38,
        unit: "Mbps",
        limit: 100,
        status: ComponentStatus.HEALTHY,
      },
    ],
  };

  // Use real data if available, otherwise use mock data
  const healthData = data || mockData;

  // Get status icon and color
  const getStatusInfo = (status: ComponentStatus) => {
    switch (status) {
      case ComponentStatus.HEALTHY:
        return {
          icon: <CheckCircleIcon fontSize="small" />,
          color: theme.palette.success.main,
          label: "Healthy",
        };
      case ComponentStatus.WARNING:
        return {
          icon: <WarningIcon fontSize="small" />,
          color: theme.palette.warning.main,
          label: "Warning",
        };
      case ComponentStatus.ERROR:
        return {
          icon: <ErrorIcon fontSize="small" />,
          color: theme.palette.error.main,
          label: "Error",
        };
      default:
        return {
          icon: <InfoIcon fontSize="small" />,
          color: theme.palette.info.main,
          label: "Unknown",
        };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  };

  // Get resource icon
  const getResourceIcon = (resourceName: string) => {
    const iconProps = { fontSize: "small", sx: { mr: 1 } };

    switch (resourceName.toLowerCase()) {
      case "cpu":
        return <DeveloperBoardIcon {...iconProps} />;
      case "memory":
        return <MemoryIcon {...iconProps} />;
      case "disk":
        return <StorageIcon {...iconProps} />;
      case "network":
        return <SpeedIcon {...iconProps} />;
      default:
        return <InfoIcon {...iconProps} />;
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    // In a real implementation, this would trigger a data refresh
    console.log("Refreshing system health data");
  };

  // Get health color for progress bar
  const getHealthColor = (status: ComponentStatus) => {
    switch (status) {
      case ComponentStatus.HEALTHY:
        return theme.palette.success.main;
      case ComponentStatus.WARNING:
        return theme.palette.warning.main;
      case ComponentStatus.ERROR:
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  // Get usage color based on percentage and status
  const getUsageColor = (usage: number, status: ComponentStatus) => {
    if (status === ComponentStatus.ERROR) return theme.palette.error.main;
    if (status === ComponentStatus.WARNING) return theme.palette.warning.main;
    if (usage > 80) return theme.palette.error.main;
    if (usage > 60) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  // Count components by status
  const statusCounts = {
    [ComponentStatus.HEALTHY]: healthData.components.filter(
      (c) => c.status === ComponentStatus.HEALTHY
    ).length,
    [ComponentStatus.WARNING]: healthData.components.filter(
      (c) => c.status === ComponentStatus.WARNING
    ).length,
    [ComponentStatus.ERROR]: healthData.components.filter(
      (c) => c.status === ComponentStatus.ERROR
    ).length,
    [ComponentStatus.UNKNOWN]: healthData.components.filter(
      (c) => c.status === ComponentStatus.UNKNOWN
    ).length,
  };

  const {
    icon: statusIcon,
    color: statusColor,
    label: statusLabel,
  } = getStatusInfo(healthData.overallStatus);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with overall status */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(statusColor, 0.1),
              color: statusColor,
              borderRadius: "50%",
              p: 0.5,
              mr: 1,
            }}
          >
            {statusIcon}
          </Box>
          <Typography variant="subtitle2">
            System Status: {statusLabel}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleRefresh}
          aria-label="Refresh data"
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Status summary */}
      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <Tooltip title="Healthy Components">
          <Chip
            icon={<CheckCircleIcon />}
            label={statusCounts[ComponentStatus.HEALTHY]}
            size="small"
            color="success"
            variant="outlined"
          />
        </Tooltip>

        <Tooltip title="Warning Components">
          <Chip
            icon={<WarningIcon />}
            label={statusCounts[ComponentStatus.WARNING]}
            size="small"
            color="warning"
            variant="outlined"
          />
        </Tooltip>

        <Tooltip title="Error Components">
          <Chip
            icon={<ErrorIcon />}
            label={statusCounts[ComponentStatus.ERROR]}
            size="small"
            color="error"
            variant="outlined"
          />
        </Tooltip>
      </Box>

      {/* Resource usage section */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Resource Usage
      </Typography>

      <Grid container spacing={1} sx={{ mb: 2 }}>
        {healthData.resources.map((resource) => (
          <Grid item xs={12} key={resource.id}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                {getResourceIcon(resource.name)}
                <Typography variant="body2">{resource.name}</Typography>
              </Box>
              <Typography variant="body2" fontWeight="medium">
                {resource.usage}
                {resource.unit}
                {resource.limit ? ` / ${resource.limit}${resource.unit}` : ""}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={
                resource.limit
                  ? (resource.usage / resource.limit) * 100
                  : resource.usage
              }
              sx={{
                height: 6,
                borderRadius: 1,
                bgcolor: alpha(
                  getUsageColor(resource.usage, resource.status),
                  0.2
                ),
                "& .MuiLinearProgress-bar": {
                  bgcolor: getUsageColor(resource.usage, resource.status),
                },
              }}
            />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 1 }} />

      {/* Component status section */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Component Status
      </Typography>

      <Box sx={{ overflow: "auto", flexGrow: 1 }}>
        {healthData.components.map((component) => {
          const { icon, color } = getStatusInfo(component.status);

          return (
            <Box
              key={component.id}
              sx={{
                display: "flex",
                alignItems: "center",
                p: 1,
                borderRadius: 1,
                mb: 0.5,
                bgcolor: alpha(color, 0.05),
                border: 1,
                borderColor: alpha(color, 0.2),
              }}
            >
              <Box sx={{ color, mr: 1 }}>{icon}</Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {component.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {component.metrics
                    .map((metric) => `${metric.value}${metric.unit}`)
                    .join(" • ")}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {formatTimestamp(component.lastChecked)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: "auto", pt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Last updated: {formatTimestamp(healthData.lastUpdated)}
        </Typography>
      </Box>
    </Box>
  );
};

export default SystemHealthWidget;
