/**
 * Cloud Security Dashboard Page
 *
 * Centralized dashboard for cloud security monitoring across AWS, Azure, and GCP
 */
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Cloud as CloudIcon,
  CloudCircle as AzureIcon,
  Storage as GCPIcon,
  Dashboard as DashboardIcon,
  Language as MultiCloudIcon,
  Description as ReportIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

// Import cloud security components
import AWSSecurityDashboard from "../features/cloud-security/components/aws/AWSSecurityDashboard";
import DefenderForCloudIntegration from "../features/cloud-security/components/azure/DefenderForCloudIntegration";
import SecurityCommandCenterDashboard from "../features/cloud-security/components/gcp/SecurityCommandCenterDashboard";
import MultiCloudComplianceDashboard from "../features/cloud-security/components/dashboard/MultiCloudComplianceDashboard";
import CloudSecurityReportingEngine from "../features/cloud-security/components/reporting/CloudSecurityReportingEngine";

// Mock data for account/project selection
const mockCloudAccounts = {
  aws: [
    { id: "aws-account-1", name: "AWS Production Account" },
    { id: "aws-account-2", name: "AWS Development Account" },
  ],
  azure: [
    { id: "azure-tenant-1", name: "Azure Production Tenant" },
    { id: "azure-tenant-2", name: "Azure Development Tenant" },
  ],
  gcp: [
    { id: "gcp-project-1", name: "GCP Production Project" },
    { id: "gcp-project-2", name: "GCP Development Project" },
  ],
};

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cloud-security-tabpanel-${index}`}
      aria-labelledby={`cloud-security-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
function a11yProps(index: number) {
  return {
    id: `cloud-security-tab-${index}`,
    "aria-controls": `cloud-security-tabpanel-${index}`,
  };
}

/**
 * Cloud Security Dashboard Page
 */
const CloudSecurityDashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { provider } = useParams();

  // Determine initial tab based on URL provider parameter
  const getInitialTab = () => {
    switch (provider) {
      case "aws":
        return 1;
      case "azure":
        return 2;
      case "gcp":
        return 3;
      case "reporting":
        return 4;
      default:
        return 0;
    }
  };

  // State for tabs
  const [tabValue, setTabValue] = useState(getInitialTab());

  // State for selected accounts
  const [selectedAwsAccount, setSelectedAwsAccount] = useState(
    mockCloudAccounts.aws[0].id
  );
  const [selectedAzureTenant, setSelectedAzureTenant] = useState(
    mockCloudAccounts.azure[0].id
  );
  const [selectedGcpProject, setSelectedGcpProject] = useState(
    mockCloudAccounts.gcp[0].id
  );

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    // Update URL when tab changes
    switch (newValue) {
      case 0:
        navigate("/cloud-security");
        break;
      case 1:
        navigate("/cloud-security/aws");
        break;
      case 2:
        navigate("/cloud-security/azure");
        break;
      case 3:
        navigate("/cloud-security/gcp");
        break;
      case 4:
        navigate("/cloud-security/reporting");
        break;
      default:
        navigate("/cloud-security");
    }
  };

  // Cloud provider overviews
  const cloudProviderOverviews = [
    {
      provider: "AWS",
      title: "AWS Security Integration",
      description:
        "Monitor IAM permissions, CloudTrail events, S3 security, EC2/EKS vulnerabilities, and integrate with AWS GuardDuty & Security Hub.",
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      tabIndex: 1,
    },
    {
      provider: "Azure",
      title: "Azure Security Integration",
      description:
        "Integrate with Microsoft Defender for Cloud, monitor Azure AD, track resource security, analyze logs, and view security across tenants.",
      icon: <AzureIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      tabIndex: 2,
    },
    {
      provider: "GCP",
      title: "GCP Security Integration",
      description:
        "Integrate with Security Command Center, analyze IAM permissions, process audit logs, monitor GKE security, and track data storage security.",
      icon: <GCPIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      tabIndex: 3,
    },
  ];

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* SEO */}
      <Helmet>
        <title>Cloud Security Dashboard | Logware Security Platform</title>
        <meta
          name="description"
          content="Comprehensive cloud security monitoring across AWS, Azure, and GCP, with detailed security findings and compliance tracking."
        />
      </Helmet>

      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <SecurityIcon fontSize="large" color="primary" />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              Cloud Security Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monitor and manage security across AWS, Azure, and Google Cloud
              Platform resources
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<MultiCloudIcon />}
              onClick={() => setTabValue(0)}
            >
              Multi-Cloud View
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="cloud security tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<DashboardIcon />} label="Overview" {...a11yProps(0)} />
          <Tab icon={<CloudIcon />} label="AWS" {...a11yProps(1)} />
          <Tab icon={<AzureIcon />} label="Azure" {...a11yProps(2)} />
          <Tab icon={<GCPIcon />} label="GCP" {...a11yProps(3)} />
          <Tab icon={<ReportIcon />} label="Reporting" {...a11yProps(4)} />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: "auto", mt: 2 }}>
        <Container maxWidth="xl">
          <TabPanel value={tabValue} index={0}>
            {/* Overview Tab */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Multi-Cloud Security Dashboard
              </Typography>

              <MultiCloudComplianceDashboard />

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Cloud Security Integrations
                </Typography>

                <Grid container spacing={3}>
                  {cloudProviderOverviews.map((cloud) => (
                    <Grid item xs={12} md={4} key={cloud.provider}>
                      <Card
                        sx={{
                          height: "100%",
                          borderLeft: `4px solid ${cloud.color}`,
                        }}
                      >
                        <CardActionArea
                          sx={{ height: "100%" }}
                          onClick={() => setTabValue(cloud.tabIndex)}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  mr: 1.5,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 48,
                                  height: 48,
                                  borderRadius: "50%",
                                  bgcolor: cloud.color + "20",
                                  color: cloud.color,
                                }}
                              >
                                {cloud.icon}
                              </Box>
                              <Typography variant="h6">
                                {cloud.title}
                              </Typography>
                            </Box>

                            <Typography variant="body2" color="textSecondary">
                              {cloud.description}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* AWS Tab */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">AWS Security Dashboard</Typography>

                <Box>
                  <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                    Select Account:{" "}
                    {
                      mockCloudAccounts.aws.find(
                        (acc) => acc.id === selectedAwsAccount
                      )?.name
                    }
                  </Button>
                  <Button variant="outlined" color="primary" size="small">
                    Add AWS Account
                  </Button>
                </Box>
              </Box>

              <AWSSecurityDashboard accountId={selectedAwsAccount} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Azure Tab */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">Azure Security Dashboard</Typography>

                <Box>
                  <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                    Select Tenant:{" "}
                    {
                      mockCloudAccounts.azure.find(
                        (acc) => acc.id === selectedAzureTenant
                      )?.name
                    }
                  </Button>
                  <Button variant="outlined" color="primary" size="small">
                    Add Azure Tenant
                  </Button>
                </Box>
              </Box>

              <DefenderForCloudIntegration tenantId={selectedAzureTenant} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* GCP Tab */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">GCP Security Dashboard</Typography>

                <Box>
                  <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                    Select Project:{" "}
                    {
                      mockCloudAccounts.gcp.find(
                        (acc) => acc.id === selectedGcpProject
                      )?.name
                    }
                  </Button>
                  <Button variant="outlined" color="primary" size="small">
                    Add GCP Project
                  </Button>
                </Box>
              </Box>

              <SecurityCommandCenterDashboard projectId={selectedGcpProject} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            {/* Reporting Tab */}
            <CloudSecurityReportingEngine accountId={selectedAwsAccount} />
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
};

export default CloudSecurityDashboardPage;
