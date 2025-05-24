/**
 * GDPR Compliance Dashboard
 *
 * Main dashboard component that integrates all GDPR compliance features
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Storage as StorageIcon,
  Person as PersonIcon,
  Error as ErrorIcon,
  VerifiedUser as VerifiedUserIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  PrivacyTip as PrivacyTipIcon,
  Checklist as ChecklistIcon,
  Visibility as VisibilityIcon,
  ArrowForward as ArrowForwardIcon,
  Flag as FlagIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import { Link as RouterLink } from "react-router-dom";

// Import GDPR components
import DataMappingInventory from "./DataMappingInventory";
import DataSubjectRightsManagement from "./DataSubjectRightsManagement";
import DataBreachManagement from "./DataBreachManagement";

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
      id={`gdpr-tabpanel-${index}`}
      aria-labelledby={`gdpr-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
function a11yProps(index: number) {
  return {
    id: `gdpr-tab-${index}`,
    "aria-controls": `gdpr-tabpanel-${index}`,
  };
}

// GDPR Dashboard Stats component
const DashboardStats: React.FC = () => {
  const theme = useTheme();

  // Sample stats for the dashboard
  const stats = {
    processingActivities: 24,
    highRiskActivities: 5,
    dataSystems: 18,
    dataRecipients: 12,
    dsrRequestsLastMonth: 8,
    dsrRequestsInProgress: 3,
    dataBreachesLastYear: 4,
    dpaReportableBreaches: 2,
    completedPIAs: 6,
    consentRecords: 25000,
    consentWithdrawals: 320,
  };

  // Compliance score card
  const complianceScores = [
    { area: "Data Mapping", score: 85, color: theme.palette.success.main },
    {
      area: "Data Subject Rights",
      score: 90,
      color: theme.palette.success.main,
    },
    { area: "Breach Management", score: 75, color: theme.palette.warning.main },
    {
      area: "Consent Management",
      score: 95,
      color: theme.palette.success.main,
    },
    { area: "Vendor Management", score: 70, color: theme.palette.warning.main },
    { area: "Risk Assessment", score: 80, color: theme.palette.success.main },
  ];

  // Recent activities
  const recentActivities = [
    {
      id: "activity-1",
      type: "DSR Request",
      title: "New Access Request",
      timestamp: "2 hours ago",
      details: "New access request received from john.doe@example.com",
    },
    {
      id: "activity-2",
      type: "Data Processing",
      title: "New Processing Activity",
      timestamp: "1 day ago",
      details: "Added new processing activity for Marketing Analytics",
    },
    {
      id: "activity-3",
      type: "Data Breach",
      title: "Breach Investigation Completed",
      timestamp: "2 days ago",
      details: "Investigation of email exposure incident has been completed",
    },
    {
      id: "activity-4",
      type: "DPIA",
      title: "DPIA Completed",
      timestamp: "3 days ago",
      details: "Privacy Impact Assessment for the new CRM system completed",
    },
  ];

  return (
    <Grid container spacing={3}>
      {/* GDPR Compliance Overview Cards */}
      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Data Processing Activities
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <StorageIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4">
                  {stats.processingActivities}
                </Typography>
                <Typography variant="body2" color="error">
                  {stats.highRiskActivities} high risk
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              DSR Requests
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PersonIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4">
                  {stats.dsrRequestsLastMonth}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  {stats.dsrRequestsInProgress} in progress
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Data Breaches (12 months)
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ErrorIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4">
                  {stats.dataBreachesLastYear}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  {stats.dpaReportableBreaches} reportable
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Consent Records
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <VerifiedUserIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4">
                  {(stats.consentRecords / 1000).toFixed(1)}K
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stats.consentWithdrawals} withdrawals
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Compliance Score */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              GDPR Compliance Scores
            </Typography>
            <Grid container spacing={2}>
              {complianceScores.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.area}>
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">{item.area}</Typography>
                      <Typography variant="body2" sx={{ color: item.color }}>
                        {item.score}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        position: "relative",
                        height: 4,
                        bgcolor: "grey.200",
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          height: "100%",
                          bgcolor: item.color,
                          borderRadius: 2,
                          width: `${item.score}%`,
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {activity.type === "DSR Request" ? (
                        <PersonIcon color="primary" fontSize="small" />
                      ) : activity.type === "Data Breach" ? (
                        <ErrorIcon color="error" fontSize="small" />
                      ) : activity.type === "Data Processing" ? (
                        <StorageIcon color="info" fontSize="small" />
                      ) : (
                        <AssessmentIcon color="warning" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textSecondary"
                          >
                            {activity.timestamp}
                          </Typography>
                          <Typography component="div" variant="body2">
                            {activity.details}
                          </Typography>
                        </>
                      }
                    />
                    <IconButton size="small">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
              <Button size="small" endIcon={<ArrowForwardIcon />}>
                View All Activity
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* GDPR Key Areas */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          GDPR Compliance Areas
        </Typography>
        <Grid container spacing={2}>
          {[
            {
              title: "Data Mapping & Inventory",
              icon: <StorageIcon />,
              description:
                "Maintain records of all personal data processing activities",
              path: "/data-mapping",
            },
            {
              title: "Data Subject Rights",
              icon: <PersonIcon />,
              description: "Manage and fulfill data subject rights requests",
              path: "/dsr-requests",
            },
            {
              title: "Breach Management",
              icon: <ErrorIcon />,
              description: "Detect, manage, and report data breaches",
              path: "/data-breaches",
            },
            {
              title: "Privacy Impact Assessments",
              icon: <AssessmentIcon />,
              description: "Conduct DPIAs for high-risk processing activities",
              path: "/privacy-assessments",
            },
            {
              title: "Policies & Documentation",
              icon: <DescriptionIcon />,
              description:
                "Maintain required privacy policies and documentation",
              path: "/privacy-policies",
            },
            {
              title: "Consent Management",
              icon: <VerifiedUserIcon />,
              description: "Manage consent collection, storage, and withdrawal",
              path: "/consent-management",
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardActionArea
                  component={RouterLink}
                  to={`/compliance/gdpr${item.path}`}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", mb: 1 }}>
                      <Box
                        sx={{
                          mr: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          bgcolor: "primary.light",
                          color: "primary.contrastText",
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" component="div">
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Resources Section */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            GDPR Resources & Documentation
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <BookIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  GDPR Compliance Guide
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Comprehensive guide to GDPR compliance requirements
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <ChecklistIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Compliance Checklists
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Step-by-step checklists for GDPR implementation
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Policy Templates</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Ready-to-use templates for privacy policies and notices
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <FlagIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Regulatory Updates</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Latest regulatory guidance and enforcement actions
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

// GDPR Compliance Dashboard component
const GDPRComplianceDashboard: React.FC = () => {
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
        <title>GDPR Compliance Dashboard | Logware Security Platform</title>
        <meta
          name="description"
          content="Comprehensive GDPR compliance management dashboard for managing data processing activities, data subject rights, breaches, and more."
        />
      </Helmet>

      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <PrivacyTipIcon fontSize="large" color="primary" />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              GDPR Compliance Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Comprehensive management of GDPR compliance requirements
            </Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary">
              Compliance Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="gdpr compliance tabs"
        >
          <Tab icon={<SecurityIcon />} label="Dashboard" {...a11yProps(0)} />
          <Tab icon={<StorageIcon />} label="Data Mapping" {...a11yProps(1)} />
          <Tab icon={<PersonIcon />} label="Subject Rights" {...a11yProps(2)} />
          <Tab
            icon={<ErrorIcon />}
            label="Breach Management"
            {...a11yProps(3)}
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <TabPanel value={tabValue} index={0}>
          <DashboardStats />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DataMappingInventory />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <DataSubjectRightsManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <DataBreachManagement />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default GDPRComplianceDashboard;
