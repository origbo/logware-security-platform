/**
 * Multi-Cloud Security Dashboard Component
 *
 * Unified dashboard to visualize security data across AWS, Azure, and GCP
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  ViewModule as ResourcesIcon,
  Assessment as ComplianceIcon,
  NetworkCheck as NetworkIcon,
  AttachMoney as CostIcon,
  Dashboard as DashboardIcon,
  BarChart as ChartIcon,
  Share as ShareIcon,
  FileDownload as DownloadIcon,
} from "@mui/icons-material";

// Import AWS icons
const AwsIcon = () => (
  <Box
    component="img"
    src="/assets/icons/aws-logo.svg"
    alt="AWS"
    sx={{ width: 24, height: 24 }}
  />
);

// Import Azure icons
const AzureIcon = () => (
  <Box
    component="img"
    src="/assets/icons/azure-logo.svg"
    alt="Azure"
    sx={{ width: 24, height: 24 }}
  />
);

// Import GCP icons
const GcpIcon = () => (
  <Box
    component="img"
    src="/assets/icons/gcp-logo.svg"
    alt="GCP"
    sx={{ width: 24, height: 24 }}
  />
);

// Tab panel props interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`multi-cloud-tabpanel-${index}`}
      aria-labelledby={`multi-cloud-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Multi-Cloud Security Dashboard Props
interface MultiCloudDashboardProps {
  refreshInterval?: number; // Optional refresh interval in minutes
}

/**
 * Multi-Cloud Security Dashboard Component
 */
const MultiCloudDashboard: React.FC<MultiCloudDashboardProps> = ({
  refreshInterval = 30,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Security statistics (sample data)
  const [securityStats, setSecurityStats] = useState({
    resources: {
      total: 428,
      byProvider: {
        aws: 215,
        azure: 142,
        gcp: 71,
      },
      byType: {
        compute: 106,
        storage: 93,
        network: 87,
        database: 65,
        security: 42,
        other: 35,
      },
    },
    findings: {
      total: 124,
      byProvider: {
        aws: 65,
        azure: 38,
        gcp: 21,
      },
      bySeverity: {
        critical: 12,
        high: 28,
        medium: 46,
        low: 38,
      },
      byCategory: {
        accessControl: 36,
        encryption: 18,
        vulnerability: 23,
        configuration: 42,
        compliance: 5,
      },
    },
    compliance: {
      gdpr: {
        score: 78,
        controlsPassed: 94,
        controlsTotal: 120,
      },
      hipaa: {
        score: 82,
        controlsPassed: 48,
        controlsTotal: 58,
      },
      pciDss: {
        score: 75,
        controlsPassed: 189,
        controlsTotal: 251,
      },
      iso27001: {
        score: 80,
        controlsPassed: 104,
        controlsTotal: 130,
      },
    },
    costs: {
      total: 28750,
      byProvider: {
        aws: 14200,
        azure: 9650,
        gcp: 4900,
      },
      securityServices: 4250,
      potentialSavings: 3120,
    },
    securityScores: {
      overall: 72,
      aws: 76,
      azure: 68,
      gcp: 70,
    },
  });

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call with delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // In a real app, this would fetch actual data from an API

        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        console.error("Error fetching multi-cloud data:", err);
        setError("Failed to load multi-cloud security data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up refresh interval
    const intervalId = setInterval(() => {
      handleRefresh();
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, this would refresh actual data from an API

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error refreshing multi-cloud data:", err);
      setError("Failed to refresh multi-cloud security data");
    } finally {
      setRefreshing(false);
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Render loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <DashboardIcon color="primary" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              Multi-Cloud Security Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Unified view of security posture across AWS, Azure, and Google
              Cloud Platform
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Last updated: {lastUpdated.toLocaleString()}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                sx={{ mr: 1 }}
              >
                Share
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{ mr: 1 }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? <CircularProgress size={24} /> : "Refresh"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Security Score Overview */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Security Posture Overview
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Overall Security Score
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{ position: "relative", display: "inline-flex", mr: 2 }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={securityStats.securityScores.overall}
                      size={60}
                      thickness={5}
                      sx={{
                        color: getScoreColor(
                          securityStats.securityScores.overall
                        ),
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body2" component="div">
                        {securityStats.securityScores.overall}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2">
                    {securityStats.securityScores.overall >= 80
                      ? "Good"
                      : securityStats.securityScores.overall >= 60
                      ? "Fair"
                      : "Poor"}
                  </Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  By Cloud Provider
                </Typography>

                <Stack spacing={1}>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CloudIcon
                          fontSize="small"
                          sx={{ mr: 0.5, color: "#FF9900" }}
                        />
                        <Typography variant="body2">AWS</Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: getScoreColor(
                            securityStats.securityScores.aws
                          ),
                        }}
                      >
                        {securityStats.securityScores.aws}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={securityStats.securityScores.aws}
                      sx={{
                        height: 4,
                        borderRadius: 1,
                        bgcolor: theme.palette.grey[200],
                      }}
                      color={
                        securityStats.securityScores.aws >= 80
                          ? "success"
                          : securityStats.securityScores.aws >= 60
                          ? "warning"
                          : "error"
                      }
                    />
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CloudIcon
                          fontSize="small"
                          sx={{ mr: 0.5, color: "#0078D4" }}
                        />
                        <Typography variant="body2">Azure</Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: getScoreColor(
                            securityStats.securityScores.azure
                          ),
                        }}
                      >
                        {securityStats.securityScores.azure}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={securityStats.securityScores.azure}
                      sx={{
                        height: 4,
                        borderRadius: 1,
                        bgcolor: theme.palette.grey[200],
                      }}
                      color={
                        securityStats.securityScores.azure >= 80
                          ? "success"
                          : securityStats.securityScores.azure >= 60
                          ? "warning"
                          : "error"
                      }
                    />
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CloudIcon
                          fontSize="small"
                          sx={{ mr: 0.5, color: "#4285F4" }}
                        />
                        <Typography variant="body2">GCP</Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: getScoreColor(
                            securityStats.securityScores.gcp
                          ),
                        }}
                      >
                        {securityStats.securityScores.gcp}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={securityStats.securityScores.gcp}
                      sx={{
                        height: 4,
                        borderRadius: 1,
                        bgcolor: theme.palette.grey[200],
                      }}
                      color={
                        securityStats.securityScores.gcp >= 80
                          ? "success"
                          : securityStats.securityScores.gcp >= 60
                          ? "warning"
                          : "error"
                      }
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Security Findings
                </Typography>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  {securityStats.findings.total}
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  By Severity
                </Typography>

                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="error.main">
                      Critical
                    </Typography>
                    <Chip
                      label={securityStats.findings.bySeverity.critical}
                      size="small"
                      color="error"
                    />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="warning.main">
                      High
                    </Typography>
                    <Chip
                      label={securityStats.findings.bySeverity.high}
                      size="small"
                      color="warning"
                    />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="primary.main">
                      Medium
                    </Typography>
                    <Chip
                      label={securityStats.findings.bySeverity.medium}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="info.main">
                      Low
                    </Typography>
                    <Chip
                      label={securityStats.findings.bySeverity.low}
                      size="small"
                      color="info"
                    />
                  </Box>
                </Stack>

                <Typography variant="subtitle2" gutterBottom>
                  By Cloud Provider
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Chip
                    label={`AWS: ${securityStats.findings.byProvider.aws}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Azure: ${securityStats.findings.byProvider.azure}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`GCP: ${securityStats.findings.byProvider.gcp}`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Compliance Status
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2">GDPR</Typography>
                      <Typography variant="body2">
                        {securityStats.compliance.gdpr.controlsPassed} /{" "}
                        {securityStats.compliance.gdpr.controlsTotal}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        (securityStats.compliance.gdpr.controlsPassed /
                          securityStats.compliance.gdpr.controlsTotal) *
                        100
                      }
                      sx={{ height: 8, borderRadius: 1 }}
                      color={
                        securityStats.compliance.gdpr.score >= 80
                          ? "success"
                          : securityStats.compliance.gdpr.score >= 60
                          ? "warning"
                          : "error"
                      }
                    />
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2">HIPAA</Typography>
                      <Typography variant="body2">
                        {securityStats.compliance.hipaa.controlsPassed} /{" "}
                        {securityStats.compliance.hipaa.controlsTotal}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        (securityStats.compliance.hipaa.controlsPassed /
                          securityStats.compliance.hipaa.controlsTotal) *
                        100
                      }
                      sx={{ height: 8, borderRadius: 1 }}
                      color={
                        securityStats.compliance.hipaa.score >= 80
                          ? "success"
                          : securityStats.compliance.hipaa.score >= 60
                          ? "warning"
                          : "error"
                      }
                    />
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2">PCI-DSS</Typography>
                      <Typography variant="body2">
                        {securityStats.compliance.pciDss.controlsPassed} /{" "}
                        {securityStats.compliance.pciDss.controlsTotal}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        (securityStats.compliance.pciDss.controlsPassed /
                          securityStats.compliance.pciDss.controlsTotal) *
                        100
                      }
                      sx={{ height: 8, borderRadius: 1 }}
                      color={
                        securityStats.compliance.pciDss.score >= 80
                          ? "success"
                          : securityStats.compliance.pciDss.score >= 60
                          ? "warning"
                          : "error"
                      }
                    />
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2">ISO 27001</Typography>
                      <Typography variant="body2">
                        {securityStats.compliance.iso27001.controlsPassed} /{" "}
                        {securityStats.compliance.iso27001.controlsTotal}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        (securityStats.compliance.iso27001.controlsPassed /
                          securityStats.compliance.iso27001.controlsTotal) *
                        100
                      }
                      sx={{ height: 8, borderRadius: 1 }}
                      color={
                        securityStats.compliance.iso27001.score >= 80
                          ? "success"
                          : securityStats.compliance.iso27001.score >= 60
                          ? "warning"
                          : "error"
                      }
                    />
                  </Box>
                </Stack>

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button size="small" endIcon={<ComplianceIcon />}>
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Resource Summary
                </Typography>
                <Typography variant="h4">
                  {securityStats.resources.total}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Total resources monitored
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">
                      <span style={{ color: "#FF9900" }}>AWS:</span>{" "}
                      {securityStats.resources.byProvider.aws}
                    </Typography>
                    <Typography variant="body2">
                      {Math.round(
                        (securityStats.resources.byProvider.aws /
                          securityStats.resources.total) *
                          100
                      )}
                      %
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">
                      <span style={{ color: "#0078D4" }}>Azure:</span>{" "}
                      {securityStats.resources.byProvider.azure}
                    </Typography>
                    <Typography variant="body2">
                      {Math.round(
                        (securityStats.resources.byProvider.azure /
                          securityStats.resources.total) *
                          100
                      )}
                      %
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">
                      <span style={{ color: "#4285F4" }}>GCP:</span>{" "}
                      {securityStats.resources.byProvider.gcp}
                    </Typography>
                    <Typography variant="body2">
                      {Math.round(
                        (securityStats.resources.byProvider.gcp /
                          securityStats.resources.total) *
                          100
                      )}
                      %
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button size="small" endIcon={<ResourcesIcon />}>
                    View Inventory
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Features Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="multi-cloud security tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<ResourcesIcon />}
            iconPosition="start"
            label="Resource Inventory"
          />
          <Tab icon={<ChartIcon />} iconPosition="start" label="Risk Scoring" />
          <Tab
            icon={<ComplianceIcon />}
            iconPosition="start"
            label="Compliance Posture"
          />
          <Tab
            icon={<NetworkIcon />}
            iconPosition="start"
            label="Network Flow"
          />
          <Tab
            icon={<CostIcon />}
            iconPosition="start"
            label="Security Optimization"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Unified Resource Inventory
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            View and manage resources across all cloud providers in a unified
            inventory.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will display a unified inventory of resources across AWS,
            Azure, and GCP with filtering and search capabilities.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Cross-Cloud Risk Scoring
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Normalized risk metrics across all cloud providers to prioritize
            security efforts.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will display normalized risk scores across cloud
            providers with detailed breakdowns and trend analysis.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Compliance Posture View
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Monitor compliance status across all cloud environments with unified
            controls mapping.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will display compliance status for GDPR, HIPAA, PCI-DSS,
            and ISO 27001 across all cloud providers.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Multi-Cloud Network Flow Visualization
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Visualize network traffic between cloud environments to identify
            security risks.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will display network flow visualizations between cloud
            environments with security analysis capabilities.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Cloud Cost & Security Optimization
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Identify waste and security risks across cloud providers to optimize
            costs.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will display cost optimization recommendations related to
            security services and configurations.
          </Alert>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default MultiCloudDashboard;
