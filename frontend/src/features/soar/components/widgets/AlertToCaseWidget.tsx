/**
 * AlertToCaseWidget Component
 *
 * Dashboard widget that displays alert-to-case conversion metrics including:
 * - Conversion rates
 * - False positive identification
 * - Automation opportunity metrics
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
  Button,
  Tooltip,
  Paper,
  LinearProgress,
} from "@mui/material";
import {
  Notifications as AlertIcon,
  NotificationsActive as AlertActiveIcon,
  AssignmentOutlined as CaseIcon,
  ErrorOutline as FalsePositiveIcon,
  AutoFixHigh as AutomationIcon,
  ArrowForward as ArrowIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Import API hooks
import { useGetAlertsQuery } from "../../services/alertIntegrationService";
import { useCases } from "../../hooks/useCases";

/**
 * Alert-to-Case Conversion Widget
 */
const AlertToCaseWidget: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Get alert data
  const {
    data: alertsData,
    isLoading: alertsLoading,
    error: alertsError,
  } = useGetAlertsQuery({ limit: 100 });

  // Get case data
  const { cases, loading: casesLoading, error: casesError } = useCases();

  // Calculate conversion metrics
  const conversionMetrics = useMemo(() => {
    if (!alertsData?.alerts || !cases) return null;

    const alerts = alertsData.alerts;

    // Count alerts by status
    const totalAlerts = alerts.length;
    const convertedAlerts = alerts.filter((alert) => alert.caseId).length;
    const falsePositiveAlerts = alerts.filter(
      (alert) => alert.status === "false_positive"
    ).length;
    const pendingAlerts = alerts.filter(
      (alert) => !alert.caseId && alert.status !== "false_positive"
    ).length;

    // Calculate percentages
    const conversionRate =
      totalAlerts > 0 ? (convertedAlerts / totalAlerts) * 100 : 0;
    const falsePositiveRate =
      totalAlerts > 0 ? (falsePositiveAlerts / totalAlerts) * 100 : 0;
    const pendingRate =
      totalAlerts > 0 ? (pendingAlerts / totalAlerts) * 100 : 0;

    // Calculate trend (comparing to previous period)
    // For demo purposes, using random values
    const conversionTrend = (Math.random() * 20 - 10).toFixed(1);
    const falsePositiveTrend = (Math.random() * 16 - 8).toFixed(1);

    // Calculate alert-to-case ratio (how many alerts typically become one case)
    const casesFromAlerts = cases.filter((c) => c.source === "alert").length;
    const alertToCaseRatio =
      casesFromAlerts > 0 ? convertedAlerts / casesFromAlerts : 0;

    // Calculate automation potential
    // For demo purposes, using a fixed percentage of pending alerts that could be automated
    const automationPotential = Math.round(pendingAlerts * 0.75);
    const automationSavings = automationPotential * 15; // Assuming 15 minutes saved per automated alert

    // Calculate alert categories for false positives
    const falsePositiveCategories: Record<string, number> = {};
    alerts
      .filter((alert) => alert.status === "false_positive")
      .forEach((alert) => {
        const category = alert.category || "uncategorized";
        falsePositiveCategories[category] =
          (falsePositiveCategories[category] || 0) + 1;
      });

    // Sort categories by count
    const topFalsePositiveCategories = Object.entries(falsePositiveCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({
        category:
          category.charAt(0).toUpperCase() +
          category.slice(1).replace("_", " "),
        count,
        percentage: (count / falsePositiveAlerts) * 100,
      }));

    return {
      totalAlerts,
      convertedAlerts,
      falsePositiveAlerts,
      pendingAlerts,
      conversionRate,
      falsePositiveRate,
      pendingRate,
      conversionTrend: parseFloat(conversionTrend),
      falsePositiveTrend: parseFloat(falsePositiveTrend),
      alertToCaseRatio,
      automationPotential,
      automationSavings,
      topFalsePositiveCategories,
    };
  }, [alertsData, cases]);

  // Format minutes in a more readable format
  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) {
      // less than a day
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  };

  // Handle navigation to alerts page
  const handleViewAlerts = () => {
    navigate("/soar/alerts");
  };

  // Loading state
  const isLoading = alertsLoading || casesLoading;
  if (isLoading) {
    return (
      <Card sx={{ height: "100%", minHeight: 300 }}>
        <CardHeader title="Alert to Case Conversion" />
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
  const hasError = alertsError || casesError;
  if (hasError) {
    return (
      <Card sx={{ height: "100%", minHeight: 300 }}>
        <CardHeader title="Alert to Case Conversion" />
        <CardContent>
          <Typography color="error">
            Failed to load alert conversion data. Please try again.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title="Alert to Case Conversion"
        action={
          <Button
            size="small"
            endIcon={<ArrowIcon />}
            onClick={handleViewAlerts}
          >
            View Alerts
          </Button>
        }
      />
      <Divider />

      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {conversionMetrics ? (
          <Grid container spacing={2}>
            {/* Conversion Rate Metrics */}
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Conversion Metrics
                </Typography>

                <Grid container spacing={2}>
                  {/* Conversion Rate */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AlertActiveIcon
                          color="primary"
                          sx={{ fontSize: 20, mr: 0.5 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Conversion Rate
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="h5" color="primary">
                          {conversionMetrics.conversionRate.toFixed(1)}%
                        </Typography>
                        {conversionMetrics.conversionTrend > 0 ? (
                          <Tooltip
                            title={`${conversionMetrics.conversionTrend}% increase from previous period`}
                          >
                            <TrendingUpIcon
                              color="success"
                              fontSize="small"
                              sx={{ ml: 0.5 }}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={`${Math.abs(
                              conversionMetrics.conversionTrend
                            )}% decrease from previous period`}
                          >
                            <TrendingDownIcon
                              color="error"
                              fontSize="small"
                              sx={{ ml: 0.5 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {conversionMetrics.convertedAlerts} of{" "}
                        {conversionMetrics.totalAlerts} alerts
                      </Typography>
                    </Box>
                  </Grid>

                  {/* False Positive Rate */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FalsePositiveIcon
                          color="error"
                          sx={{ fontSize: 20, mr: 0.5 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          False Positive Rate
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="h5" color="error">
                          {conversionMetrics.falsePositiveRate.toFixed(1)}%
                        </Typography>
                        {conversionMetrics.falsePositiveTrend < 0 ? (
                          <Tooltip
                            title={`${Math.abs(
                              conversionMetrics.falsePositiveTrend
                            )}% decrease from previous period`}
                          >
                            <TrendingDownIcon
                              color="success"
                              fontSize="small"
                              sx={{ ml: 0.5 }}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={`${conversionMetrics.falsePositiveTrend}% increase from previous period`}
                          >
                            <TrendingUpIcon
                              color="error"
                              fontSize="small"
                              sx={{ ml: 0.5 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {conversionMetrics.falsePositiveAlerts} false positives
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Pending Rate */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AlertIcon
                          color="warning"
                          sx={{ fontSize: 20, mr: 0.5 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Pending Rate
                        </Typography>
                      </Box>
                      <Typography variant="h5" color="warning.main">
                        {conversionMetrics.pendingRate.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {conversionMetrics.pendingAlerts} alerts awaiting triage
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* False Positive Analysis */}
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  height: "100%",
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                }}
              >
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <FalsePositiveIcon sx={{ mr: 0.5, fontSize: 20 }} />
                  False Positive Analysis
                </Typography>

                {conversionMetrics.topFalsePositiveCategories.length > 0 ? (
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Top sources of false positives:
                    </Typography>

                    {conversionMetrics.topFalsePositiveCategories.map(
                      (category, index) => (
                        <Box key={index} sx={{ mb: 1.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2">
                              {category.category}
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {category.percentage.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={category.percentage}
                            color="error"
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                      )
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 1 }}
                    >
                      Reduce false positives by tuning detection rules for these
                      categories.
                    </Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    No false positive data available.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Automation Opportunities */}
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  height: "100%",
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                }}
              >
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <AutomationIcon sx={{ mr: 0.5, fontSize: 20 }} />
                  Automation Opportunities
                </Typography>

                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Alerts per Case
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {conversionMetrics.alertToCaseRatio.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          avg alerts per incident
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          Automation Potential
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {conversionMetrics.automationPotential}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          alerts can be automated
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <TimerIcon sx={{ mr: 0.5, fontSize: 18 }} />
                      Estimated Time Savings
                    </Typography>
                    <Typography
                      variant="h5"
                      color="success.main"
                      sx={{ mt: 0.5 }}
                    >
                      {formatMinutes(conversionMetrics.automationSavings)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      that could be saved through automation
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", py: 3 }}
          >
            No alert conversion data available.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertToCaseWidget;
