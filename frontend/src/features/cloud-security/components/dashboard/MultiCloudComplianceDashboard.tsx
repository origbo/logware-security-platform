import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  CloudCircle as CloudCircleIcon,
  CloudQueue as CloudQueueIcon,
  Cloud as CloudIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { useGetMultiCloudComplianceOverviewQuery } from "../../services/complianceService";
import {
  CloudProvider,
  ComplianceStatus,
} from "../../types/cloudSecurityTypes";
import OverviewTab from "./OverviewTab";
import AWSTab from "./AWSTab";
import AzureTab from "./AzureTab";
import GCPTab from "./GCPTab";
import TrendsTab from "./TrendsTab";

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
      id={`cloud-compliance-tabpanel-${index}`}
      aria-labelledby={`cloud-compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Multi-Cloud Compliance Dashboard Component
 * Provides a unified view of compliance status across AWS, Azure, and GCP
 */
const MultiCloudComplianceDashboard: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Fetch multi-cloud compliance overview data
  const {
    data: overviewData,
    isLoading,
    isError,
    error,
  } = useGetMultiCloudComplianceOverviewQuery();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate totals for the header cards
  const calculateTotals = () => {
    if (!overviewData) {
      return {
        totalResources: 0,
        compliantResources: 0,
        nonCompliantResources: 0,
        complianceScore: 0,
        frameworkCount: 0,
        assessmentCount: 0,
      };
    }

    const totalResources = overviewData.resources.total;
    const compliantResources = overviewData.resources.compliant;
    const nonCompliantResources = overviewData.resources.nonCompliant;
    const complianceScore =
      Math.round((compliantResources / totalResources) * 100) || 0;
    const frameworkCount = overviewData.frameworks.count;
    const assessmentCount = overviewData.assessments.count;

    return {
      totalResources,
      compliantResources,
      nonCompliantResources,
      complianceScore,
      frameworkCount,
      assessmentCount,
    };
  };

  const totals = calculateTotals();

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Multi-Cloud Compliance Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
          Monitor and manage compliance across AWS, Azure, and Google Cloud
          Platform.
        </Typography>
      </Paper>

      {/* Totals Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SecurityIcon
                  sx={{ color: theme.palette.primary.main, mr: 1 }}
                />
                <Typography variant="h6">Overall Compliance</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "baseline" }}>
                <Typography
                  variant="h3"
                  color={
                    totals.complianceScore >= 80
                      ? "success.main"
                      : totals.complianceScore >= 60
                      ? "warning.main"
                      : "error.main"
                  }
                >
                  {isLoading ? "—" : `${totals.complianceScore}%`}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  compliance score
                </Typography>
              </Box>

              {!isLoading && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {totals.compliantResources} of {totals.totalResources}{" "}
                  resources compliant
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CloudCircleIcon
                  sx={{ color: theme.palette.info.main, mr: 1 }}
                />
                <Typography variant="h6">Cloud Resources</Typography>
              </Box>

              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="h4">
                        {overviewData?.providers.find(
                          (p: {
                            provider: CloudProvider;
                            resourceCount: number;
                          }) => p.provider === CloudProvider.AWS
                        )?.resourceCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        AWS
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4">
                        {overviewData?.providers.find(
                          (p: {
                            provider: CloudProvider;
                            resourceCount: number;
                          }) => p.provider === CloudProvider.AZURE
                        )?.resourceCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Azure
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4">
                        {overviewData?.providers.find(
                          (p: {
                            provider: CloudProvider;
                            resourceCount: number;
                          }) => p.provider === CloudProvider.GCP
                        )?.resourceCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        GCP
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    {totals.totalResources} total resources monitored
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TimelineIcon
                  sx={{ color: theme.palette.success.main, mr: 1 }}
                />
                <Typography variant="h6">Compliance Frameworks</Typography>
              </Box>

              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Box sx={{ display: "flex", alignItems: "baseline" }}>
                    <Typography variant="h3">
                      {totals.frameworkCount}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      frameworks
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {totals.assessmentCount} assessments conducted
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="cloud compliance tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<CloudIcon />} iconPosition="start" label="AWS" />
          <Tab icon={<CloudIcon />} iconPosition="start" label="Azure" />
          <Tab icon={<CloudIcon />} iconPosition="start" label="GCP" />
          <Tab icon={<TimelineIcon />} iconPosition="start" label="Trends" />
        </Tabs>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              Error loading compliance data:{" "}
              {(error as any)?.data?.message || "Unknown error"}
            </Alert>
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <OverviewTab overviewData={overviewData} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <AWSTab />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <AzureTab />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <GCPTab />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <TrendsTab />
            </TabPanel>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default MultiCloudComplianceDashboard;
