/**
 * PlaybookPerformanceWidget Component
 *
 * Dashboard widget that displays playbook execution performance metrics including:
 * - Success/failure rates
 * - Average execution time
 * - Most frequently used playbooks
 */

import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  CircularProgress,
  useTheme,
  alpha,
  LinearProgress,
} from "@mui/material";
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingIcon,
  ArrowForward as ArrowIcon,
  PlayArrow as PlayIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Import from execution service
import {
  useGetExecutionAnalyticsQuery,
  useGetExecutionsQuery,
} from "../../services/executionService";

// Import types
import { PlaybookExecution } from "../../types/soarTypes";

/**
 * PlaybookPerformanceWidget Component
 */
const PlaybookPerformanceWidget: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Get execution analytics data for the past 7 days
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useGetExecutionAnalyticsQuery({ timeRange: "7d" });

  // Get recent executions data
  const {
    data: recentExecutions,
    isLoading: executionsLoading,
    error: executionsError,
  } = useGetExecutionsQuery({ limit: 50 });

  // Calculate most used playbooks
  const mostUsedPlaybooks = useMemo(() => {
    if (!recentExecutions) return [];

    // Count executions by playbook ID
    const playbookCounts = recentExecutions.reduce((acc, execution) => {
      const playbookId = execution.playbook.id;
      if (!acc[playbookId]) {
        acc[playbookId] = {
          id: playbookId,
          name: execution.playbook.name,
          count: 0,
          successCount: 0,
          failureCount: 0,
        };
      }

      acc[playbookId].count++;
      if (execution.status === "completed") {
        acc[playbookId].successCount++;
      } else if (execution.status === "failed") {
        acc[playbookId].failureCount++;
      }

      return acc;
    }, {} as Record<string, { id: string; name: string; count: number; successCount: number; failureCount: number }>);

    // Convert to array and sort by count
    return Object.values(playbookCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [recentExecutions]);

  // Calculate overall success rate
  const successRate = useMemo(() => {
    if (!analyticsData) return 0;
    return analyticsData.successRate;
  }, [analyticsData]);

  // Format the average duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  // Handle navigation to playbook list
  const handleViewAllPlaybooks = () => {
    navigate("/soar/playbooks");
  };

  // Handle navigation to a specific playbook
  const handleViewPlaybook = (playbookId: string) => {
    navigate(`/soar/playbooks/${playbookId}`);
  };

  // Loading state
  const isLoading = analyticsLoading || executionsLoading;
  if (isLoading) {
    return (
      <Card sx={{ height: "100%", minHeight: 300 }}>
        <CardHeader title="Playbook Performance" />
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  // Error state
  const hasError = analyticsError || executionsError;
  if (hasError) {
    return (
      <Card sx={{ height: "100%", minHeight: 300 }}>
        <CardHeader title="Playbook Performance" />
        <CardContent>
          <Typography color="error">
            Failed to load performance data. Please try again.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title="Playbook Performance"
        subheader="Last 7 days"
        action={
          <Button
            size="small"
            endIcon={<ArrowIcon />}
            onClick={handleViewAllPlaybooks}
          >
            View All
          </Button>
        }
      />
      <Divider />

      <CardContent
        sx={{ flex: 1, display: "flex", flexDirection: "column", p: 0 }}
      >
        {/* Performance Metrics */}
        <Box sx={{ display: "flex", justifyContent: "space-around", p: 2 }}>
          {/* Success Rate */}
          <Box
            sx={{
              textAlign: "center",
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.success.main, 0.1),
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="h4" color="success.main">
                {successRate}%
              </Typography>
              <SuccessIcon color="success" sx={{ ml: 0.5 }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Success Rate
            </Typography>
          </Box>

          {/* Average Duration */}
          <Box
            sx={{
              textAlign: "center",
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.info.main, 0.1),
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="h4" color="info.main">
                {analyticsData && formatDuration(analyticsData.averageDuration)}
              </Typography>
              <TimerIcon color="info" sx={{ ml: 0.5 }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Avg Duration
            </Typography>
          </Box>

          {/* Total Executions */}
          <Box
            sx={{
              textAlign: "center",
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Typography variant="h4" color="primary">
              {analyticsData?.totalExecutions || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Executions
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Most Used Playbooks */}
        <Box sx={{ p: 2, flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ mb: 1, display: "flex", alignItems: "center" }}
          >
            <TrendingIcon sx={{ mr: 0.5, fontSize: 20 }} />
            Most Used Playbooks
          </Typography>

          {mostUsedPlaybooks.length > 0 ? (
            <List disablePadding>
              {mostUsedPlaybooks.map((playbook) => {
                const successRate =
                  playbook.count > 0
                    ? Math.round((playbook.successCount / playbook.count) * 100)
                    : 0;

                return (
                  <ListItem
                    key={playbook.id}
                    divider
                    button
                    onClick={() => handleViewPlaybook(playbook.id)}
                    sx={{ flexDirection: "column", alignItems: "stretch" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <PlayIcon color="primary" sx={{ mr: 1 }} />
                      <ListItemText
                        primary={playbook.name}
                        secondary={`${playbook.count} executions`}
                        primaryTypographyProps={{ noWrap: true }}
                      />
                      <Chip
                        label={`${successRate}%`}
                        size="small"
                        color={
                          successRate > 80
                            ? "success"
                            : successRate > 50
                            ? "warning"
                            : "error"
                        }
                      />
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={successRate}
                      color={
                        successRate > 80
                          ? "success"
                          : successRate > 50
                          ? "warning"
                          : "error"
                      }
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Typography
              color="text.secondary"
              sx={{ py: 2, textAlign: "center" }}
            >
              No playbook execution data available
            </Typography>
          )}
        </Box>

        {/* Status Counts */}
        {analyticsData && (
          <>
            <Divider />
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Execution Status Breakdown
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Chip
                  icon={<SuccessIcon />}
                  label={`Completed: ${analyticsData.byStatus.completed}`}
                  color="success"
                  size="small"
                  sx={{ mr: 0.5 }}
                />
                <Chip
                  icon={<ErrorIcon />}
                  label={`Failed: ${analyticsData.byStatus.failed}`}
                  color="error"
                  size="small"
                  sx={{ mr: 0.5 }}
                />
                <Chip
                  icon={<TimerIcon />}
                  label={`Running: ${analyticsData.byStatus.running}`}
                  color="info"
                  size="small"
                />
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaybookPerformanceWidget;
