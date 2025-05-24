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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  Search as SearchIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import {
  useGetSecurityCenterOverviewQuery,
  useGetSecureScoreQuery,
  useGetSecurityAlertsQuery,
  useGetRecommendationsQuery,
  useRunSecurityAssessmentMutation,
} from "../../services/azureSecurityService";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`azure-security-tabpanel-${index}`}
      aria-labelledby={`azure-security-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Azure Security Center Component
 * Provides interface to interact with Azure Security Center features
 */
const SecurityCenter: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [subscriptionId, setSubscriptionId] = useState<string>("all");
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>("all");

  // Fetch Azure security data
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useGetSecurityCenterOverviewQuery({
    subscriptionId: subscriptionId !== "all" ? subscriptionId : undefined,
  });

  const { data: secureScoreData, isLoading: isScoreLoading } =
    useGetSecureScoreQuery({
      subscriptionId: subscriptionId !== "all" ? subscriptionId : undefined,
    });

  const { data: alertsData, isLoading: isAlertsLoading } =
    useGetSecurityAlertsQuery({
      subscriptionId: subscriptionId !== "all" ? subscriptionId : undefined,
      severity: alertSeverityFilter !== "all" ? alertSeverityFilter : undefined,
      limit: 10,
    });

  const { data: recommendationsData, isLoading: isRecommendationsLoading } =
    useGetRecommendationsQuery({
      subscriptionId: subscriptionId !== "all" ? subscriptionId : undefined,
    });

  const [runAssessment, { isLoading: isAssessing }] =
    useRunSecurityAssessmentMutation();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle subscription change
  const handleSubscriptionChange = (event: SelectChangeEvent) => {
    setSubscriptionId(event.target.value);
  };

  // Handle alert severity filter change
  const handleSeverityChange = (event: SelectChangeEvent) => {
    setAlertSeverityFilter(event.target.value);
  };

  // Run security assessment
  const handleRunAssessment = async () => {
    if (subscriptionId !== "all") {
      try {
        await runAssessment({ subscriptionId });
        refetchOverview();
      } catch (error) {
        console.error("Failed to run security assessment:", error);
      }
    }
  };

  // Get color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  // Get icon based on severity
  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return <ErrorIcon sx={{ color: getSeverityColor(severity) }} />;
      case "medium":
        return <WarningIcon sx={{ color: getSeverityColor(severity) }} />;
      case "low":
        return <InfoIcon sx={{ color: getSeverityColor(severity) }} />;
      default:
        return <InfoIcon sx={{ color: getSeverityColor(severity) }} />;
    }
  };

  // Get icon based on resource state
  const getStateIcon = (state: string) => {
    switch (state.toLowerCase()) {
      case "healthy":
      case "passed":
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case "unhealthy":
      case "failed":
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case "degraded":
      case "warning":
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Azure Security Center
            </Typography>
            <Typography variant="body1">
              Monitor and manage Azure security posture with Security Center
              insights.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FormControl sx={{ minWidth: 200, mr: 2 }}>
              <InputLabel id="subscription-select-label">
                Subscription
              </InputLabel>
              <Select
                labelId="subscription-select-label"
                id="subscription-select"
                value={subscriptionId}
                label="Subscription"
                onChange={handleSubscriptionChange}
              >
                <MenuItem value="all">All Subscriptions</MenuItem>
                {overviewData?.subscriptions?.map((sub: any) => (
                  <MenuItem key={sub.id} value={sub.id}>
                    {sub.name || sub.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SecurityIcon />}
              onClick={handleRunAssessment}
              disabled={isAssessing || subscriptionId === "all"}
            >
              {isAssessing ? "Running..." : "Run Assessment"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Secure Score
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isScoreLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  <>
                    <SpeedIcon
                      sx={{
                        mr: 1,
                        color:
                          secureScoreData?.score >= 70
                            ? theme.palette.success.main
                            : secureScoreData?.score >= 50
                            ? theme.palette.warning.main
                            : theme.palette.error.main,
                      }}
                    />
                    <Typography
                      variant="h4"
                      color={
                        secureScoreData?.score >= 70
                          ? "success.main"
                          : secureScoreData?.score >= 50
                          ? "warning.main"
                          : "error.main"
                      }
                    >
                      {secureScoreData?.score || 0}%
                    </Typography>
                  </>
                )}
              </Box>
              <Typography variant="caption" color="textSecondary">
                Overall security posture
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Security Alerts
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isOverviewLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  <>
                    <ErrorIcon
                      sx={{ mr: 1, color: theme.palette.error.main }}
                    />
                    <Typography variant="h4" color="error.main">
                      {overviewData?.alertsCount || 0}
                    </Typography>
                  </>
                )}
              </Box>
              <Typography variant="caption" color="textSecondary">
                Active security alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Recommendations
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isOverviewLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  <>
                    <AssignmentIcon
                      sx={{ mr: 1, color: theme.palette.warning.main }}
                    />
                    <Typography variant="h4" color="warning.main">
                      {overviewData?.recommendationsCount || 0}
                    </Typography>
                  </>
                )}
              </Box>
              <Typography variant="caption" color="textSecondary">
                Security recommendations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Resources Monitored
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isOverviewLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  <>
                    <StorageIcon
                      sx={{ mr: 1, color: theme.palette.info.main }}
                    />
                    <Typography variant="h4" color="info.main">
                      {overviewData?.resourcesCount || 0}
                    </Typography>
                  </>
                )}
              </Box>
              <Typography variant="caption" color="textSecondary">
                Azure resources monitored
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Tabs Content */}
      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="azure security tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<ErrorIcon />} iconPosition="start" label="Alerts" />
          <Tab
            icon={<AssignmentIcon />}
            iconPosition="start"
            label="Recommendations"
          />
          <Tab icon={<LockIcon />} iconPosition="start" label="Secure Score" />
        </Tabs>

        {/* Alerts Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Security Alerts</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FormControl sx={{ minWidth: 150, mr: 2 }}>
                <InputLabel id="severity-select-label">Severity</InputLabel>
                <Select
                  labelId="severity-select-label"
                  id="severity-select"
                  value={alertSeverityFilter}
                  label="Severity"
                  onChange={handleSeverityChange}
                  size="small"
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              <IconButton
                onClick={() => refetchOverview()}
                title="Refresh data"
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {isAlertsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : !alertsData || alertsData.length === 0 ? (
            <Alert severity="info">
              No security alerts found with the current filter settings.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Alert</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Detected</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alertsData.map((alert: any) => (
                    <TableRow key={alert.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {getSeverityIcon(alert.severity)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {alert.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{alert.resourceName}</TableCell>
                      <TableCell>
                        <Chip
                          label={alert.severity}
                          size="small"
                          sx={{
                            bgcolor: alpha(
                              getSeverityColor(alert.severity),
                              0.1
                            ),
                            color: getSeverityColor(alert.severity),
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.status}
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(alert.timeGenerated).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<SearchIcon />}
                        >
                          Investigate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Recommendations Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Security Recommendations</Typography>
            <IconButton onClick={() => refetchOverview()} title="Refresh data">
              <RefreshIcon />
            </IconButton>
          </Box>

          {isRecommendationsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : !recommendationsData || recommendationsData.length === 0 ? (
            <Alert severity="info">No security recommendations found.</Alert>
          ) : (
            <Grid container spacing={3}>
              {recommendationsData.map((recommendation: any) => (
                <Grid item xs={12} key={recommendation.id}>
                  <Card variant="outlined">
                    <CardHeader
                      avatar={getStateIcon(recommendation.state)}
                      title={recommendation.name}
                      subheader={`Resource: ${recommendation.resourceName} | Category: ${recommendation.category}`}
                      action={
                        <Chip
                          label={recommendation.severity}
                          size="small"
                          sx={{
                            bgcolor: alpha(
                              getSeverityColor(recommendation.severity),
                              0.1
                            ),
                            color: getSeverityColor(recommendation.severity),
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        />
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="body2" paragraph>
                        {recommendation.description}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          Last assessed:{" "}
                          {new Date(
                            recommendation.timeGenerated
                          ).toLocaleString()}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                        >
                          Remediate
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Secure Score Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Secure Score Details</Typography>
            <IconButton onClick={() => refetchOverview()} title="Refresh data">
              <RefreshIcon />
            </IconButton>
          </Box>

          {isScoreLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : !secureScoreData || !secureScoreData.controls ? (
            <Alert severity="info">No secure score data available.</Alert>
          ) : (
            <Grid container spacing={3}>
              {/* Overall Score Card */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Overall Secure Score: {secureScoreData.score}%
                    </Typography>
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Box sx={{ width: "100%", mr: 1 }}>
                        <Box
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: alpha(
                              secureScoreData.score >= 70
                                ? theme.palette.success.main
                                : secureScoreData.score >= 50
                                ? theme.palette.warning.main
                                : theme.palette.error.main,
                              0.2
                            ),
                          }}
                        >
                          <Box
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              width: `${secureScoreData.score}%`,
                              bgcolor:
                                secureScoreData.score >= 70
                                  ? theme.palette.success.main
                                  : secureScoreData.score >= 50
                                  ? theme.palette.warning.main
                                  : theme.palette.error.main,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {secureScoreData.maxScore
                        ? `${secureScoreData.currentScore} out of ${secureScoreData.maxScore} points`
                        : "Score calculated based on security controls"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Security Controls */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Security Controls
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Control Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Max Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {secureScoreData.controls.map((control: any) => (
                        <TableRow key={control.id} hover>
                          <TableCell>{control.name}</TableCell>
                          <TableCell>{control.category}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {getStateIcon(control.status)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {control.status}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{control.score}</TableCell>
                          <TableCell>{control.maxScore}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SecurityCenter;
