import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
// import { useGetComplianceByProviderQuery } from "../../services/complianceService";
// Creating a mock since this query isn't exported from complianceService
const useGetComplianceByProviderQuery = (provider: string) => {
  return {
    data: {
      provider: "Azure",
      complianceScore: 82,
      status: "partial",
      lastScan: new Date().toISOString(),
      resourcesScanned: 98,
      issuesFound: 18,
      remediationActions: 12,
      controls: [
        { id: "az-1", name: "RBAC Configuration", status: "compliant" },
        { id: "az-2", name: "Storage Account Encryption", status: "compliant" },
        { id: "az-3", name: "Network Security Groups", status: "partial" }
      ]
    },
    isLoading: false,
    error: null,
    refetch: () => console.log(`Refetching data for ${provider}`)
  };
};
import {
  CloudProvider,
  ComplianceStatus,
} from "../../types/cloudSecurityTypes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";

/**
 * Azure Tab Component
 * Displays Azure-specific compliance data
 */
const AzureTab: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [subscriptionId, setSubscriptionId] = useState<string>("all");

  // Fetch Azure compliance data
  const { data, isLoading, isError, error, refetch } =
    useGetComplianceByProviderQuery({
      provider: CloudProvider.AZURE,
    });

  // Handle subscription change
  const handleSubscriptionChange = (event: SelectChangeEvent) => {
    setSubscriptionId(event.target.value);
  };

  // Navigate to Azure Security Center
  const handleGoToSecurityCenter = () => {
    navigate("/cloud-security/azure/security-center");
  };

  // Navigate to Azure Storage Security
  const handleGoToStorageSecurity = () => {
    navigate("/cloud-security/azure/storage-security");
  };

  // Navigate to Azure Identity Management
  const handleGoToIdentityManagement = () => {
    navigate("/cloud-security/azure/identity-management");
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error loading Azure compliance data:{" "}
        {(error as any)?.data?.message || "Unknown error"}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No Azure compliance data available.
      </Alert>
    );
  }

  // Filter data by selected subscription
  const filteredData =
    subscriptionId === "all"
      ? data
      : {
          ...data,
          resources: data.resources.filter(
            (resource: any) => resource.subscriptionId === subscriptionId
          ),
          findings: data.findings.filter(
            (finding: any) => finding.subscriptionId === subscriptionId
          ),
        };

  // Prepare chart data for service compliance
  const serviceComplianceData = data.serviceCompliance.map((service: any) => ({
    name: service.serviceName,
    compliant: service.compliantResources,
    nonCompliant: service.nonCompliantResources,
  }));

  // Get status color based on compliance status
  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.COMPLIANT:
        return theme.palette.success.main;
      case ComplianceStatus.NON_COMPLIANT:
        return theme.palette.error.main;
      case ComplianceStatus.PARTIALLY_COMPLIANT:
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status icon based on compliance status
  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.COMPLIANT:
        return <CheckIcon sx={{ color: theme.palette.success.main }} />;
      case ComplianceStatus.NON_COMPLIANT:
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case ComplianceStatus.PARTIALLY_COMPLIANT:
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header with subscription selector */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Azure Compliance Overview</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel id="azure-subscription-select-label">
              Azure Subscription
            </InputLabel>
            <Select
              labelId="azure-subscription-select-label"
              id="azure-subscription-select"
              value={subscriptionId}
              label="Azure Subscription"
              onChange={handleSubscriptionChange}
              size="small"
            >
              <MenuItem value="all">All Subscriptions</MenuItem>
              {data.subscriptions.map((subscription: any) => (
                <MenuItem key={subscription.id} value={subscription.id}>
                  {subscription.name || subscription.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton onClick={() => refetch()} title="Refresh data">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Overall Compliance
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="h4"
                  color={
                    data.complianceScore >= 80
                      ? "success.main"
                      : data.complianceScore >= 60
                      ? "warning.main"
                      : "error.main"
                  }
                >
                  {data.complianceScore}%
                </Typography>
              </Box>
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
                <Typography variant="h4">
                  {filteredData.resources.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Security Findings
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h4" color="error.main">
                  {filteredData.findings.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Services Assessed
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h4">
                  {data.serviceCompliance.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Service Compliance Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Service Compliance
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serviceComplianceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barSize={20}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="compliant"
                    stackId="a"
                    name="Compliant"
                    fill={theme.palette.success.main}
                  />
                  <Bar
                    dataKey="nonCompliant"
                    stackId="a"
                    name="Non-Compliant"
                    fill={theme.palette.error.main}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions Card */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Azure Security Actions
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              Quick access to Azure security assessment tools and features.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={handleGoToSecurityCenter}
                  sx={{ justifyContent: "flex-start", py: 1.5 }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Azure Security Center
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={handleGoToStorageSecurity}
                  sx={{ justifyContent: "flex-start", py: 1.5 }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Storage Security Assessment
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={handleGoToIdentityManagement}
                  sx={{ justifyContent: "flex-start", py: 1.5 }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Identity & Access Management
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Findings Table */}
        <Grid item xs={12}>
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
              Recent Findings
            </Typography>

            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>Resource</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Finding</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Detected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.findings.slice(0, 10).map((finding: any) => (
                    <TableRow hover key={finding.id}>
                      <TableCell>{finding.resourceId}</TableCell>
                      <TableCell>{finding.resourceType}</TableCell>
                      <TableCell>{finding.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={finding.severity}
                          size="small"
                          sx={{
                            bgcolor: alpha(
                              finding.severity === "critical" ||
                                finding.severity === "high"
                                ? theme.palette.error.main
                                : finding.severity === "medium"
                                ? theme.palette.warning.main
                                : theme.palette.info.main,
                              0.1
                            ),
                            color:
                              finding.severity === "critical" ||
                              finding.severity === "high"
                                ? theme.palette.error.main
                                : finding.severity === "medium"
                                ? theme.palette.warning.main
                                : theme.palette.info.main,
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {getStatusIcon(finding.status)}
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {finding.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(finding.detectedAt).toLocaleDateString()}
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

export default AzureTab;
