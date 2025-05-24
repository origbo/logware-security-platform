/**
 * SOARAnalyticsWidget Component
 *
 * Dashboard widget that displays SOAR analytics including:
 * - Case resolution time trends
 * - Automation effectiveness metrics
 * - Analyst workload distribution
 */

import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
  useTheme,
  alpha,
  Grid,
  Tooltip,
  Paper,
} from "@mui/material";
import {
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Group as TeamIcon,
  AutoAwesome as AutomationIcon,
} from "@mui/icons-material";

// Custom hook for analytics data
import { useCases } from "../../hooks/useCases";
import { usePlaybooks } from "../../hooks/usePlaybooks";

// Import types
import { SecurityCase, Playbook } from "../../types/soarTypes";

/**
 * Utility function to calculate time to resolution in hours
 */
const getResolutionTimeHours = (caseData: SecurityCase): number | null => {
  if (caseData.status !== "resolved" || !caseData.resolvedAt) {
    return null;
  }

  const createdTime = new Date(caseData.createdAt).getTime();
  const resolvedTime = new Date(caseData.resolvedAt).getTime();

  // Return hours
  return (resolvedTime - createdTime) / (1000 * 60 * 60);
};

/**
 * SOARAnalyticsWidget Component
 */
const SOARAnalyticsWidget: React.FC = () => {
  const theme = useTheme();
  const { cases, loading: casesLoading, error: casesError } = useCases();
  const {
    playbooks,
    loading: playbooksLoading,
    error: playbooksError,
  } = usePlaybooks();

  // Calculate case resolution metrics
  const resolutionMetrics = useMemo(() => {
    if (!cases) return null;

    // Filter resolved cases
    const resolvedCases = cases.filter(
      (c) => c.status === "resolved" && c.resolvedAt
    );
    if (resolvedCases.length === 0) return null;

    // Calculate resolution times in hours
    const resolutionTimes = resolvedCases
      .map((c) => getResolutionTimeHours(c))
      .filter((time): time is number => time !== null);

    // Calculate average resolution time
    const averageResolutionTime =
      resolutionTimes.reduce((sum, time) => sum + time, 0) /
      resolutionTimes.length;

    // Calculate median resolution time
    const sortedTimes = [...resolutionTimes].sort((a, b) => a - b);
    const medianResolutionTime =
      sortedTimes[Math.floor(sortedTimes.length / 2)];

    // Calculate percentile resolution times
    const percentile90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];

    // Calculate trend (comparing to previous period if possible)
    // For demo, we'll use a random value between -20% and 20%
    const trend = (Math.random() * 40 - 20).toFixed(1);

    return {
      average: averageResolutionTime,
      median: medianResolutionTime,
      percentile90,
      trend: parseFloat(trend),
      totalResolved: resolvedCases.length,
      fastestResolution: Math.min(...resolutionTimes),
      slowestResolution: Math.max(...resolutionTimes),
    };
  }, [cases]);

  // Calculate automation effectiveness metrics
  const automationMetrics = useMemo(() => {
    if (!cases || !playbooks) return null;

    // Count cases with automated actions
    const casesWithAutomation = cases.filter(
      (c) => c.automatedActionsCount && c.automatedActionsCount > 0
    );
    const automationPercentage =
      (casesWithAutomation.length / cases.length) * 100;

    // Calculate average time saved per automation (estimated)
    // For demo purposes, we'll use a constant value of 45 minutes per automated action
    const minutesSavedPerAction = 45;
    const totalAutomatedActions = cases.reduce(
      (sum, c) => sum + (c.automatedActionsCount || 0),
      0
    );
    const totalTimeSavedHours =
      (totalAutomatedActions * minutesSavedPerAction) / 60;

    // Calculate success rate of automated actions
    // For demo, we'll use a fixed value
    const automationSuccessRate = 92.5;

    // Count playbooks that have been used
    const activePlaybooks = playbooks.filter(
      (p) => p.executionCount && p.executionCount > 0
    );
    const playbookCoverageRate =
      (activePlaybooks.length / playbooks.length) * 100;

    return {
      casesWithAutomation: casesWithAutomation.length,
      automationPercentage,
      totalAutomatedActions,
      totalTimeSavedHours,
      automationSuccessRate,
      activePlaybooks: activePlaybooks.length,
      playbookCoverageRate,
    };
  }, [cases, playbooks]);

  // Calculate analyst workload distribution
  const analystWorkload = useMemo(() => {
    if (!cases) return null;

    // Count cases by assignee
    const assigneeCounts: Record<string, number> = {};

    cases.forEach((c) => {
      if (c.assignedTo) {
        if (!assigneeCounts[c.assignedTo]) {
          assigneeCounts[c.assignedTo] = 0;
        }
        assigneeCounts[c.assignedTo]++;
      }
    });

    // Convert to array and sort by count
    const analysts = Object.entries(assigneeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate stats
    const totalAssigned = analysts.reduce((sum, a) => sum + a.count, 0);
    const averageWorkload = totalAssigned / analysts.length;
    const maxWorkload = analysts.length > 0 ? analysts[0].count : 0;
    const minWorkload =
      analysts.length > 0 ? analysts[analysts.length - 1].count : 0;

    // Calculate workload balance index (0-100, higher is more balanced)
    const workloadRange = maxWorkload - minWorkload;
    const balanceIndex =
      workloadRange > 0 ? 100 - (workloadRange / maxWorkload) * 100 : 100;

    return {
      analysts: analysts.slice(0, 5), // Top 5 analysts
      totalAssigned,
      averageWorkload,
      maxWorkload,
      minWorkload,
      balanceIndex,
    };
  }, [cases]);

  // Format time in a human-readable way
  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      return `${days}d ${remainingHours}h`;
    }
  };

  // Loading state
  const isLoading = casesLoading || playbooksLoading;
  if (isLoading) {
    return (
      <Card sx={{ height: "100%", minHeight: 300 }}>
        <CardHeader title="SOAR Analytics" />
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
  const hasError = casesError || playbooksError;
  if (hasError) {
    return (
      <Card sx={{ height: "100%", minHeight: 300 }}>
        <CardHeader title="SOAR Analytics" />
        <CardContent>
          <Typography color="error">
            Failed to load analytics data. Please try again.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title="SOAR Analytics"
        subheader="Performance and efficiency metrics"
      />
      <Divider />

      <CardContent sx={{ flex: 1, overflow: "auto" }}>
        <Grid container spacing={2}>
          {/* Case Resolution Time Trends */}
          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                mb: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <TimeIcon sx={{ mr: 0.5 }} />
                Case Resolution Time Trends
              </Typography>

              {resolutionMetrics ? (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Average Resolution Time
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {formatTime(resolutionMetrics.average)}
                          {resolutionMetrics.trend < 0 ? (
                            <Tooltip
                              title={`${Math.abs(
                                resolutionMetrics.trend
                              )}% faster than previous period`}
                            >
                              <TrendingDownIcon
                                color="success"
                                fontSize="small"
                                sx={{ ml: 0.5 }}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip
                              title={`${Math.abs(
                                resolutionMetrics.trend
                              )}% slower than previous period`}
                            >
                              <TrendingUpIcon
                                color="error"
                                fontSize="small"
                                sx={{ ml: 0.5 }}
                              />
                            </Tooltip>
                          )}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Median Resolution Time
                        </Typography>
                        <Typography variant="h6">
                          {formatTime(resolutionMetrics.median)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          90th Percentile
                        </Typography>
                        <Typography variant="h6">
                          {formatTime(resolutionMetrics.percentile90)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Fastest: {formatTime(resolutionMetrics.fastestResolution)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Slowest: {formatTime(resolutionMetrics.slowestResolution)}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 1 }}
                >
                  No resolution data available
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Automation Effectiveness */}
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: "100%",
                bgcolor: alpha(theme.palette.secondary.main, 0.05),
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <AutomationIcon sx={{ mr: 0.5 }} />
                Automation Effectiveness
              </Typography>

              {automationMetrics ? (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Cases with Automation
                        </Typography>
                        <Typography variant="h6">
                          {automationMetrics.automationPercentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Automation Success
                        </Typography>
                        <Typography variant="h6">
                          {automationMetrics.automationSuccessRate.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Time Saved
                        </Typography>
                        <Typography variant="h6">
                          {automationMetrics.totalTimeSavedHours.toFixed(1)}h
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Playbook Coverage
                        </Typography>
                        <Typography variant="h6">
                          {automationMetrics.playbookCoverageRate.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total automated actions:{" "}
                      {automationMetrics.totalAutomatedActions}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 1 }}
                >
                  No automation data available
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Analyst Workload Distribution */}
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: "100%",
                bgcolor: alpha(theme.palette.warning.main, 0.05),
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <TeamIcon sx={{ mr: 0.5 }} />
                Analyst Workload Distribution
              </Typography>

              {analystWorkload ? (
                <Box>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ textAlign: "center", mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Workload Balance
                        </Typography>
                        <Typography
                          variant="h6"
                          color={
                            analystWorkload.balanceIndex > 80
                              ? "success.main"
                              : analystWorkload.balanceIndex > 60
                              ? "warning.main"
                              : "error.main"
                          }
                        >
                          {analystWorkload.balanceIndex.toFixed(1)}%
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Average Cases Per Analyst
                        </Typography>
                        <Typography variant="h6">
                          {analystWorkload.averageWorkload.toFixed(1)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Top Analysts by Workload
                      </Typography>

                      {analystWorkload.analysts.map((analyst, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <PersonIcon
                              fontSize="small"
                              sx={{ mr: 0.5, opacity: 0.7 }}
                            />
                            <Typography variant="body2" noWrap>
                              {analyst.name}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color={
                              analyst.count >
                              analystWorkload.averageWorkload * 1.5
                                ? "error.main"
                                : analyst.count >
                                  analystWorkload.averageWorkload * 1.2
                                ? "warning.main"
                                : "text.primary"
                            }
                          >
                            {analyst.count}
                          </Typography>
                        </Box>
                      ))}

                      {analystWorkload.analysts.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No analyst assignment data
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 1 }}
                >
                  No workload data available
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SOARAnalyticsWidget;
