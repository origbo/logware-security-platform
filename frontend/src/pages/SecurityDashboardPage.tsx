/**
 * SecurityDashboardPage
 *
 * Main dashboard for the security monitoring features in Logware Security Platform.
 * Integrates widgets from alerts, logs, vulnerabilities, and network monitoring.
 */
import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Container, Grid, Paper, Typography, Button } from "@mui/material";
import {
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";

// Import DashboardController
import SecurityDashboardWrapper from "../features/dashboard/SecurityDashboardWrapper";

// Import widgets
import AlertsSummaryWidget from "../features/soar/components/widgets/AlertsSummaryWidget";
import AlertTrendsWidget from "../features/soar/components/widgets/AlertTrendsWidget";
import ThreatMapWidget from "../features/soar/components/widgets/ThreatMapWidget";
import PlaybookStatusWidget from "../features/soar/components/widgets/PlaybookStatusWidget";
import VulnerabilityWidget from "../features/soar/components/widgets/VulnerabilityWidget";

// Default layout configuration
const defaultLayout = {
  lg: [
    { i: "alerts-summary", x: 0, y: 0, w: 4, h: 2 },
    { i: "alert-trends", x: 4, y: 0, w: 4, h: 2 },
    { i: "threat-map", x: 8, y: 0, w: 4, h: 2 },
    { i: "vulnerability-summary", x: 0, y: 2, w: 4, h: 2 },
    { i: "playbook-status", x: 4, y: 2, w: 4, h: 2 },
  ],
  md: [
    { i: "alerts-summary", x: 0, y: 0, w: 6, h: 2 },
    { i: "alert-trends", x: 6, y: 0, w: 6, h: 2 },
    { i: "threat-map", x: 0, y: 2, w: 6, h: 2 },
    { i: "vulnerability-summary", x: 6, y: 2, w: 6, h: 2 },
    { i: "playbook-status", x: 0, y: 4, w: 12, h: 2 },
  ],
  sm: [
    { i: "alerts-summary", x: 0, y: 0, w: 6, h: 2 },
    { i: "alert-trends", x: 0, y: 2, w: 6, h: 2 },
    { i: "threat-map", x: 0, y: 4, w: 6, h: 2 },
    { i: "vulnerability-summary", x: 0, y: 6, w: 6, h: 2 },
    { i: "playbook-status", x: 0, y: 8, w: 6, h: 2 },
  ],
};

// Available widgets configuration
const availableWidgets = [
  {
    id: "alerts-summary",
    title: "Alerts Summary",
    description: "Summary of security alerts across the platform",
    component: AlertsSummaryWidget,
    defaultSize: { w: 4, h: 2 },
  },
  {
    id: "alert-trends",
    title: "Alert Trends",
    description: "Trends in security alerts over time",
    component: AlertTrendsWidget,
    defaultSize: { w: 4, h: 2 },
  },
  {
    id: "threat-map",
    title: "Threat Map",
    description: "Geographic visualization of security threats",
    component: ThreatMapWidget,
    defaultSize: { w: 4, h: 2 },
  },
  {
    id: "vulnerability-summary",
    title: "Vulnerability Summary",
    description: "Overview of system vulnerabilities",
    component: VulnerabilityWidget,
    defaultSize: { w: 4, h: 2 },
  },
  {
    id: "playbook-status",
    title: "Playbook Status",
    description: "Status of security automation playbooks",
    component: PlaybookStatusWidget,
    defaultSize: { w: 4, h: 2 },
  },
];

const SecurityDashboardPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Security Dashboard | Logware Security Platform</title>
      </Helmet>

      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Container
          maxWidth={false}
          sx={{ flexGrow: 1, py: 3, display: "flex", flexDirection: "column" }}
        >
          {/* Header */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <DashboardIcon fontSize="large" color="primary" />
              </Grid>
              <Grid item xs>
                <Typography variant="h5" component="h1" gutterBottom>
                  Security Dashboard
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Monitor security events, alerts, vulnerabilities, and network
                  activity from a single view.
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  sx={{ mr: 1 }}
                >
                  Dashboard Settings
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Dashboard */}
          <Box sx={{ flexGrow: 1 }}>
            <SecurityDashboardWrapper
              defaultLayout={defaultLayout}
              availableWidgets={availableWidgets}
              dashboardId="security-dashboard"
              isDraggable={true}
              isResizable={true}
              allowAddingWidgets={true}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default SecurityDashboardPage;
