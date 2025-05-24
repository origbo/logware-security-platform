/**
 * ISO 27001 Compliance Dashboard Component
 *
 * Main dashboard for tracking ISO 27001 compliance status, controls,
 * and information security management system (ISMS) framework
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
  Policy as PolicyIcon,
  BusinessCenter as BusinessIcon,
  Visibility as VisibilityIcon,
  FileDownload as DownloadIcon,
  Assignment as DocumentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Help as HelpIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

// Import ISO 27001 types
import {
  ControlStatus,
  ControlCategory,
  RiskLevel,
  IsoControl,
} from "../../types/iso27001Types";

// Sample data - replace with API call in production
const sampleControls: IsoControl[] = [
  {
    id: "A.5.1.1",
    category: ControlCategory.INFORMATION_SECURITY_POLICIES,
    title: "Policies for information security",
    description:
      "A set of policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.",
    objective:
      "To provide management direction and support for information security in accordance with business requirements and relevant laws and regulations.",
    implementation:
      "Develop and maintain a comprehensive set of information security policies that are approved by management.",
    status: ControlStatus.IMPLEMENTED,
    lastAssessment: "2025-04-15T10:30:00Z",
    evidence: [
      {
        id: "ev-1",
        controlId: "A.5.1.1",
        title: "Information Security Policy Document",
        description: "Approved information security policy document",
        type: "POLICY",
        dateCollected: "2025-04-15T10:30:00Z",
        collectedBy: "John Smith",
        status: "APPROVED",
      },
    ],
  },
  {
    id: "A.6.1.1",
    category: ControlCategory.ORGANIZATION_OF_INFORMATION_SECURITY,
    title: "Information security roles and responsibilities",
    description:
      "All information security responsibilities shall be defined and allocated.",
    objective:
      "To establish a management framework to initiate and control the implementation and operation of information security within the organization.",
    implementation:
      "Define and document information security roles and responsibilities in job descriptions and organization charts.",
    status: ControlStatus.PARTIALLY_IMPLEMENTED,
    lastAssessment: "2025-04-10T14:45:00Z",
  },
  {
    id: "A.8.1.1",
    category: ControlCategory.ASSET_MANAGEMENT,
    title: "Inventory of assets",
    description:
      "Assets associated with information and information processing facilities shall be identified and an inventory of these assets shall be drawn up and maintained.",
    objective:
      "To identify organizational assets and define appropriate protection responsibilities.",
    implementation:
      "Establish and maintain an inventory of all information assets.",
    status: ControlStatus.NOT_IMPLEMENTED,
    lastAssessment: "2025-04-12T09:15:00Z",
  },
  {
    id: "A.9.1.1",
    category: ControlCategory.ACCESS_CONTROL,
    title: "Access control policy",
    description:
      "An access control policy shall be established, documented and reviewed based on business and information security requirements.",
    objective:
      "To limit access to information and information processing facilities.",
    implementation:
      "Develop and implement an access control policy based on business and security requirements.",
    status: ControlStatus.IMPLEMENTED,
    lastAssessment: "2025-04-18T11:20:00Z",
  },
  {
    id: "A.12.1.1",
    category: ControlCategory.OPERATIONS_SECURITY,
    title: "Documented operating procedures",
    description:
      "Operating procedures shall be documented and made available to all users who need them.",
    objective:
      "To ensure correct and secure operations of information processing facilities.",
    implementation:
      "Document and maintain operating procedures for all systems and make them available to authorized users.",
    status: ControlStatus.PARTIALLY_IMPLEMENTED,
    lastAssessment: "2025-04-05T15:10:00Z",
  },
  {
    id: "A.18.1.1",
    category: ControlCategory.COMPLIANCE,
    title:
      "Identification of applicable legislation and contractual requirements",
    description:
      "All relevant legislative statutory, regulatory, contractual requirements and the organization's approach to meet these requirements shall be explicitly identified, documented and kept up to date for each information system and the organization.",
    objective:
      "To avoid breaches of legal, statutory, regulatory or contractual obligations related to information security and of any security requirements.",
    implementation:
      "Establish a compliance register that identifies all applicable laws, regulations, and contractual requirements.",
    status: ControlStatus.IMPLEMENTED,
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
      id={`iso-tabpanel-${index}`}
      aria-labelledby={`iso-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
const a11yProps = (index: number) => {
  return {
    id: `iso-tab-${index}`,
    "aria-controls": `iso-tabpanel-${index}`,
  };
};

// ISO 27001 Compliance Dashboard component
const ISO27001ComplianceDashboard: React.FC = () => {
  const theme = useTheme();

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for data
  const [controls, setControls] = useState<IsoControl[]>([]);
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

        setControls(sampleControls);
        setError(null);
      } catch (err) {
        setError("Failed to load ISO 27001 compliance data");
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
    if (!controls.length)
      return { implemented: 0, partial: 0, notImplemented: 0, total: 0 };

    const implemented = controls.filter(
      (c) => c.status === ControlStatus.IMPLEMENTED
    ).length;
    const partial = controls.filter(
      (c) => c.status === ControlStatus.PARTIALLY_IMPLEMENTED
    ).length;
    const notImplemented = controls.filter(
      (c) => c.status === ControlStatus.NOT_IMPLEMENTED
    ).length;

    return {
      implemented,
      partial,
      notImplemented,
      total: controls.length,
      compliancePercent: Math.round((implemented / controls.length) * 100),
    };
  };

  const stats = calculateComplianceStatistics();

  // Format status chip
  const renderStatusChip = (status: ControlStatus) => {
    let color: "success" | "warning" | "error" | "default" = "default";
    let icon = <HelpIcon fontSize="small" />;

    switch (status) {
      case ControlStatus.IMPLEMENTED:
        color = "success";
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case ControlStatus.PARTIALLY_IMPLEMENTED:
        color = "warning";
        icon = <WarningIcon fontSize="small" />;
        break;
      case ControlStatus.NOT_IMPLEMENTED:
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
              ISO 27001 Compliance Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monitor and manage compliance with ISO 27001 Information Security
              Management System requirements.
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
                    Control Status
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
                        {stats.implemented}
                      </Typography>
                      <Typography variant="body2">Implemented</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="warning.main">
                        {stats.partial}
                      </Typography>
                      <Typography variant="body2">Partial</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="error.main">
                        {stats.notImplemented}
                      </Typography>
                      <Typography variant="body2">Not Implemented</Typography>
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
                    Documentation
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    24
                  </Typography>
                  <Typography variant="body2">
                    16 approved, 8 in review
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last update: May 10, 2025
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
                    Next Audit
                  </Typography>
                  <Typography variant="h6" component="div">
                    July 20, 2025
                  </Typography>
                  <Typography variant="body2">Internal audit</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" color="primary">
                      View Schedule
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
              aria-label="iso 27001 dashboard tabs"
            >
              <Tab
                icon={<AssessmentIcon />}
                label="Controls"
                {...a11yProps(0)}
              />
              <Tab
                icon={<DocumentIcon />}
                label="Documentation"
                {...a11yProps(1)}
              />
              <Tab
                icon={<BusinessIcon />}
                label="ISMS Framework"
                {...a11yProps(2)}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">ISO 27001 Controls</Typography>
              <Box>
                <Button variant="outlined" sx={{ mr: 1 }}>
                  Filter
                </Button>
                <Button variant="outlined">Sort</Button>
              </Box>
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              {controls.map((control, index) => (
                <React.Fragment key={control.id}>
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1">
                        {control.id} - {control.title}
                      </Typography>
                      <Box>
                        {renderStatusChip(control.status)}
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
                      {control.description}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Chip
                        label={control.category.split("_").join(" ")}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Last assessed:{" "}
                        {new Date(
                          control.lastAssessment || Date.now()
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  {index < controls.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              ISMS Documentation
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              This section will list all ISO 27001 related documentation
              including policies, procedures, and records.
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              ISMS Framework
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              This section will display the Information Security Management
              System (ISMS) framework structure.
            </Typography>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default ISO27001ComplianceDashboard;
