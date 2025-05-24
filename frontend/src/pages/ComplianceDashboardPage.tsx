/**
 * Compliance Dashboard Page
 *
 * Main entry point for all compliance frameworks (GDPR, PCI-DSS, HIPAA, ISO 27001)
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
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  PrivacyTip as GDPRIcon,
  CreditCard as PCIDSSIcon,
  HealthAndSafety as HIPAAIcon,
  Security as ISOIcon,
  Assignment as AssignmentIcon,
  DateRange as DateRangeIcon,
  Checklist as ChecklistIcon,
  Settings as SettingsIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Import GDPR Dashboard
import GDPRComplianceDashboard from "../features/compliance/components/gdpr/GDPRComplianceDashboard";

// Note: These would be imported once implemented
// import PCIDSSComplianceDashboard from '../features/compliance/components/pcidss/PCIDSSComplianceDashboard';
// import HIPAAComplianceDashboard from '../features/compliance/components/hipaa/HIPAAComplianceDashboard';
// import ISO27001ComplianceDashboard from '../features/compliance/components/iso27001/ISO27001ComplianceDashboard';

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
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
function a11yProps(index: number) {
  return {
    id: `compliance-tab-${index}`,
    "aria-controls": `compliance-tabpanel-${index}`,
  };
}

// Compliance Summary Dashboard
const ComplianceSummaryDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Sample compliance status data
  const complianceStatus = [
    {
      framework: "GDPR",
      status: "Compliant",
      score: 85,
      lastAssessment: "2025-03-15",
      nextAssessment: "2025-09-15",
      criticalFindings: 0,
      highFindings: 3,
      color: theme.palette.success.main,
      icon: <GDPRIcon />,
      path: "/compliance/gdpr",
    },
    {
      framework: "PCI-DSS",
      status: "Partially Compliant",
      score: 72,
      lastAssessment: "2025-02-20",
      nextAssessment: "2025-08-20",
      criticalFindings: 1,
      highFindings: 5,
      color: theme.palette.warning.main,
      icon: <PCIDSSIcon />,
      path: "/compliance/pcidss",
    },
    {
      framework: "HIPAA",
      status: "Compliant",
      score: 90,
      lastAssessment: "2025-04-10",
      nextAssessment: "2025-10-10",
      criticalFindings: 0,
      highFindings: 1,
      color: theme.palette.success.main,
      icon: <HIPAAIcon />,
      path: "/compliance/hipaa",
    },
    {
      framework: "ISO 27001",
      status: "In Progress",
      score: 65,
      lastAssessment: "2025-01-30",
      nextAssessment: "2025-07-30",
      criticalFindings: 2,
      highFindings: 7,
      color: theme.palette.warning.main,
      icon: <ISOIcon />,
      path: "/compliance/iso27001",
    },
  ];

  // Recent compliance activities
  const recentActivities = [
    {
      id: "1",
      framework: "GDPR",
      activity: "DSR Request Completed",
      timestamp: "2 hours ago",
      details: "Data access request for john.doe@example.com was fulfilled",
    },
    {
      id: "2",
      framework: "PCI-DSS",
      activity: "Quarterly Scan Completed",
      timestamp: "1 day ago",
      details:
        "Vulnerability scan detected 3 medium issues requiring remediation",
    },
    {
      id: "3",
      framework: "ISO 27001",
      activity: "Control Assessment Updated",
      timestamp: "2 days ago",
      details: "A.8.3 Media Handling controls were assessed and documented",
    },
    {
      id: "4",
      framework: "HIPAA",
      activity: "Policy Updated",
      timestamp: "3 days ago",
      details: "Privacy policy was updated to reflect new regulatory guidance",
    },
  ];

  // Upcoming compliance deadlines
  const upcomingDeadlines = [
    {
      id: "1",
      framework: "PCI-DSS",
      deadline: "7 days",
      task: "Quarterly Vulnerability Remediation",
      priority: "High",
    },
    {
      id: "2",
      framework: "GDPR",
      deadline: "14 days",
      task: "Annual DPO Review",
      priority: "Medium",
    },
    {
      id: "3",
      framework: "ISO 27001",
      deadline: "30 days",
      task: "Management Review Meeting",
      priority: "Medium",
    },
    {
      id: "4",
      framework: "HIPAA",
      deadline: "45 days",
      task: "Security Awareness Training",
      priority: "Medium",
    },
  ];

  // Navigate to framework
  const navigateToFramework = (path: string) => {
    navigate(path);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Overall Compliance Status */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Compliance Framework Status
          </Typography>
          <Grid container spacing={2}>
            {complianceStatus.map((framework) => (
              <Grid item xs={12} md={6} lg={3} key={framework.framework}>
                <Card
                  sx={{
                    height: "100%",
                    borderLeft: `4px solid ${framework.color}`,
                  }}
                >
                  <CardActionArea
                    sx={{ height: "100%" }}
                    onClick={() => navigateToFramework(framework.path)}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Box
                          sx={{
                            mr: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: "primary.light",
                            color: "white",
                          }}
                        >
                          {framework.icon}
                        </Box>
                        <Typography variant="h6">
                          {framework.framework}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 1.5 }}>
                        <Chip
                          label={framework.status}
                          color={
                            framework.status === "Compliant"
                              ? "success"
                              : framework.status === "Partially Compliant"
                              ? "warning"
                              : "default"
                          }
                          size="small"
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" color="textSecondary">
                          Compliance Score:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: framework.color, fontWeight: "bold" }}
                        >
                          {framework.score}%
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          position: "relative",
                          height: 4,
                          bgcolor: "grey.200",
                          borderRadius: 2,
                          mb: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            bgcolor: framework.color,
                            borderRadius: 2,
                            width: `${framework.score}%`,
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            display="block"
                            color="textSecondary"
                          >
                            Last Assessment:{" "}
                            {new Date(
                              framework.lastAssessment
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography
                            variant="caption"
                            display="block"
                            color="textSecondary"
                          >
                            Next Due:{" "}
                            {new Date(
                              framework.nextAssessment
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: "right" }}>
                          {(framework.criticalFindings > 0 ||
                            framework.highFindings > 0) && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <WarningIcon
                                fontSize="small"
                                color="error"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography variant="caption" color="error">
                                {framework.criticalFindings > 0
                                  ? `${framework.criticalFindings} critical, `
                                  : ""}
                                {framework.highFindings} high
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Compliance Resources */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Compliance Resources
          </Typography>
          <Grid container spacing={2}>
            {[
              {
                title: "Reports & Documentation",
                description:
                  "Generate compliance reports and required documentation",
                icon: <AssignmentIcon />,
                path: "/compliance/reports",
              },
              {
                title: "Compliance Calendar",
                description: "View and manage compliance deadlines and tasks",
                icon: <DateRangeIcon />,
                path: "/compliance/calendar",
              },
              {
                title: "Compliance Checklists",
                description:
                  "Step-by-step checklists for implementing controls",
                icon: <ChecklistIcon />,
                path: "/compliance/checklists",
              },
              {
                title: "Settings & Configuration",
                description: "Configure compliance settings and integrations",
                icon: <SettingsIcon />,
                path: "/compliance/settings",
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardActionArea
                    sx={{ height: "100%" }}
                    onClick={() => navigateToFramework(item.path)}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                      >
                        <Box
                          sx={{
                            mr: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: "primary.light",
                            color: "white",
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography variant="h6">{item.title}</Typography>
                      </Box>

                      <Typography variant="body2" color="textSecondary">
                        {item.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Recent Activity & Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Recent Compliance Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List sx={{ p: 0 }}>
              {recentActivities.map((activity) => (
                <ListItem
                  key={activity.id}
                  alignItems="flex-start"
                  sx={{ px: 0 }}
                >
                  <ListItemIcon sx={{ minWidth: 42 }}>
                    {activity.framework === "GDPR" ? (
                      <GDPRIcon color="primary" fontSize="small" />
                    ) : activity.framework === "PCI-DSS" ? (
                      <PCIDSSIcon color="warning" fontSize="small" />
                    ) : activity.framework === "HIPAA" ? (
                      <HIPAAIcon color="success" fontSize="small" />
                    ) : (
                      <ISOIcon color="info" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.activity}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textSecondary"
                        >
                          {activity.timestamp} • {activity.framework}
                        </Typography>
                        <Typography component="div" variant="body2">
                          {activity.details}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button size="small" endIcon={<ArrowForwardIcon />}>
                View All Activity
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Compliance Deadlines
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List sx={{ p: 0 }}>
              {upcomingDeadlines.map((deadline) => (
                <ListItem
                  key={deadline.id}
                  alignItems="flex-start"
                  sx={{ px: 0 }}
                >
                  <ListItemIcon sx={{ minWidth: 42 }}>
                    <FlagIcon
                      fontSize="small"
                      color={
                        deadline.priority === "High"
                          ? "error"
                          : deadline.priority === "Medium"
                          ? "warning"
                          : "info"
                      }
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="subtitle2">
                          {deadline.task}
                        </Typography>
                        <Chip
                          label={`Due in ${deadline.deadline}`}
                          size="small"
                          color={
                            deadline.deadline.includes("7")
                              ? "error"
                              : deadline.deadline.includes("14")
                              ? "warning"
                              : "default"
                          }
                        />
                      </Box>
                    }
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="textSecondary"
                      >
                        {deadline.framework} • {deadline.priority} Priority
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button size="small" endIcon={<ArrowForwardIcon />}>
                View Compliance Calendar
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Compliance Dashboard Page
const ComplianceDashboardPage: React.FC = () => {
  const theme = useTheme();

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* SEO */}
      <Helmet>
        <title>Compliance Dashboard | Logware Security Platform</title>
        <meta
          name="description"
          content="Comprehensive compliance management dashboard for GDPR, PCI-DSS, HIPAA, and ISO 27001 compliance frameworks."
        />
      </Helmet>

      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <ChecklistIcon fontSize="large" color="primary" />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              Compliance Management Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Comprehensive management of regulatory compliance across multiple
              frameworks
            </Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary">
              Generate Compliance Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="compliance framework tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<DashboardIcon />} label="Overview" {...a11yProps(0)} />
          <Tab icon={<GDPRIcon />} label="GDPR" {...a11yProps(1)} />
          <Tab icon={<PCIDSSIcon />} label="PCI-DSS" {...a11yProps(2)} />
          <Tab icon={<HIPAAIcon />} label="HIPAA" {...a11yProps(3)} />
          <Tab icon={<ISOIcon />} label="ISO 27001" {...a11yProps(4)} />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: "auto", mt: 2 }}>
        <Container maxWidth="xl">
          <TabPanel value={tabValue} index={0}>
            <ComplianceSummaryDashboard />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <GDPRComplianceDashboard />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                PCI-DSS Compliance Framework - Coming Soon
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                HIPAA Compliance Framework - Coming Soon
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                ISO 27001 Compliance Framework - Coming Soon
              </Typography>
            </Box>
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
};

export default ComplianceDashboardPage;
