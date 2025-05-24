/**
 * HIPAA Compliance Dashboard Component
 *
 * Main dashboard for tracking HIPAA compliance status, PHI data tracking,
 * and business associate management
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
  LinearProgress,
  Chip,
  Divider,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Folder as FolderIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
  FileDownload as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Help as HelpIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

// Import PHI Data Tracking component
import PHIDataTracking from "./PHIDataTracking";

// Import HIPAA types
import {
  ComplianceStatus,
  PhiType,
  RuleCategory,
  HipaaRequirement,
} from "../../types/hipaaTypes";

// Sample data - replace with API call in production
const sampleRequirements: HipaaRequirement[] = [
  {
    id: "P1",
    ruleId: "164.502",
    title: "Uses and Disclosures of PHI",
    description:
      "General rules for the use and disclosure of protected health information",
    category: RuleCategory.PRIVACY_RULE,
    status: ComplianceStatus.COMPLIANT,
    lastAssessment: "2025-04-15T10:30:00Z",
  },
  {
    id: "P2",
    ruleId: "164.504",
    title: "Uses and Disclosures: Organization Requirements",
    description:
      "Requirements for group health plans, providers and clearinghouses",
    category: RuleCategory.PRIVACY_RULE,
    status: ComplianceStatus.PARTIALLY_COMPLIANT,
    lastAssessment: "2025-04-10T14:45:00Z",
  },
  {
    id: "S1",
    ruleId: "164.308",
    title: "Administrative Safeguards",
    description: "Administrative safeguards for ePHI protection",
    category: RuleCategory.SECURITY_RULE,
    status: ComplianceStatus.NON_COMPLIANT,
    lastAssessment: "2025-04-12T09:15:00Z",
  },
  {
    id: "S2",
    ruleId: "164.310",
    title: "Physical Safeguards",
    description: "Physical safeguards for ePHI protection",
    category: RuleCategory.SECURITY_RULE,
    status: ComplianceStatus.COMPLIANT,
    lastAssessment: "2025-04-18T11:20:00Z",
  },
  {
    id: "S3",
    ruleId: "164.312",
    title: "Technical Safeguards",
    description: "Technical safeguards for ePHI protection",
    category: RuleCategory.SECURITY_RULE,
    status: ComplianceStatus.PARTIALLY_COMPLIANT,
    lastAssessment: "2025-04-05T15:10:00Z",
  },
  {
    id: "B1",
    ruleId: "164.402",
    title: "Breach Definition and Notification",
    description: "Rules for breach identification and notification",
    category: RuleCategory.BREACH_NOTIFICATION,
    status: ComplianceStatus.COMPLIANT,
    lastAssessment: "2025-04-02T10:05:00Z",
  },
];

// Interface for tab panel props
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
      id={`hipaa-tabpanel-${index}`}
      aria-labelledby={`hipaa-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
const a11yProps = (index: number) => {
  return {
    id: `hipaa-tab-${index}`,
    "aria-controls": `hipaa-tabpanel-${index}`,
  };
};

// HIPAA Compliance Dashboard component
const HIPAAComplianceDashboard: React.FC = () => {
  const theme = useTheme();

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for data
  const [requirements, setRequirements] = useState<HipaaRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setRequirements(sampleRequirements);
        setError(null);
      } catch (err) {
        setError("Failed to load HIPAA compliance data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate compliance statistics
  const calculateComplianceStatistics = () => {
    if (!requirements.length)
      return { compliant: 0, partial: 0, nonCompliant: 0, total: 0 };

    const compliant = requirements.filter(
      (r) => r.status === ComplianceStatus.COMPLIANT
    ).length;
    const partial = requirements.filter(
      (r) => r.status === ComplianceStatus.PARTIALLY_COMPLIANT
    ).length;
    const nonCompliant = requirements.filter(
      (r) => r.status === ComplianceStatus.NON_COMPLIANT
    ).length;

    return {
      compliant,
      partial,
      nonCompliant,
      total: requirements.length,
      compliancePercent: Math.round((compliant / requirements.length) * 100),
    };
  };

  const stats = calculateComplianceStatistics();

  // Format status chip
  const renderStatusChip = (status: ComplianceStatus) => {
    let color: "success" | "warning" | "error" | "default" = "default";
    let icon = <HelpIcon fontSize="small" />;

    switch (status) {
      case ComplianceStatus.COMPLIANT:
        color = "success";
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case ComplianceStatus.PARTIALLY_COMPLIANT:
        color = "warning";
        icon = <WarningIcon fontSize="small" />;
        break;
      case ComplianceStatus.NON_COMPLIANT:
        color = "error";
        icon = <ErrorIcon fontSize="small" />;
        break;
    }

    return (
      <Chip
        label={status.replace("_", " ")}
        color={color}
        size="small"
        icon={icon}
      />
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              HIPAA Compliance Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monitor and manage compliance with Health Insurance Portability
              and Accountability Act requirements.
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ mr: 1 }}
            >
              Export Report
            </Button>
            <Button variant="contained" startIcon={<AssessmentIcon />}>
              Start Assessment
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Overall Compliance
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography variant="h4" component="div" sx={{ mr: 1 }}>
                      {stats.compliancePercent}%
                    </Typography>
                    {stats.compliancePercent > 75 ? (
                      <CheckCircleIcon color="success" />
                    ) : stats.compliancePercent > 50 ? (
                      <WarningIcon color="warning" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.compliancePercent}
                    sx={{ height: 8, borderRadius: 1 }}
                    color={
                      stats.compliancePercent > 75
                        ? "success"
                        : stats.compliancePercent > 50
                        ? "warning"
                        : "error"
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Requirement Status
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-around",
                      py: 1,
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="success.main">
                        {stats.compliant}
                      </Typography>
                      <Typography variant="body2">Compliant</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="warning.main">
                        {stats.partial}
                      </Typography>
                      <Typography variant="body2">Partial</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="error.main">
                        {stats.nonCompliant}
                      </Typography>
                      <Typography variant="body2">Non-Compliant</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    PHI Tracking
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    8
                  </Typography>
                  <Typography variant="body2">
                    8 PHI locations tracked
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last scan: May 15, 2025
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Business Associates
                  </Typography>
                  <Typography variant="h6" component="div">
                    12 Active
                  </Typography>
                  <Typography variant="body2">
                    2 pending BAA renewals
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" color="primary">
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="hipaa dashboard tabs"
            >
              <Tab
                icon={<AssessmentIcon />}
                label="Requirements"
                {...a11yProps(0)}
              />
              <Tab
                icon={<FolderIcon />}
                label="PHI Tracking"
                {...a11yProps(1)}
              />
              <Tab
                icon={<BusinessIcon />}
                label="Business Associates"
                {...a11yProps(2)}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              {requirements.map((requirement, index) => (
                <React.Fragment key={requirement.id}>
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1">
                        {requirement.ruleId} - {requirement.title}
                      </Typography>
                      <Box>
                        {renderStatusChip(requirement.status)}
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      {requirement.description}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Chip
                        label={requirement.category.replace(/_/g, " ")}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Last assessed:{" "}
                        {new Date(
                          requirement.lastAssessment || Date.now()
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  {index < requirements.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <PHIDataTracking />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Business Associates
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              This section will list all business associates, their BAA status,
              and risk assessments.
            </Typography>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default HIPAAComplianceDashboard;
