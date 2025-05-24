import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  AppBar,
  Tabs,
  Tab,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  AssignmentTurnedIn as AssignmentIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  BugReport as BugReportIcon,
  Visibility as VisibilityIcon,
  AutoGraph as AutoGraphIcon,
  LibraryBooks as LibraryBooksIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  DonutLarge as DonutLargeIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

// Import SOAR components
import ThreatHuntingDashboard from "./hunting/ThreatHuntingDashboard";
import CollaborativeResponseHub from "./collaboration/CollaborativeResponseHub";
import AutomationRulesManager from "./automation/AutomationRulesManager";
import PlaybookOrchestrator from "./automation/PlaybookOrchestrator";
import ResponseActionsLibrary from "./automation/ResponseActionsLibrary";
import AutomationExecutionDashboard from "./automation/AutomationExecutionDashboard";
import ExplainableAI from "./anomaly/ExplainableAI";
import UserBehaviorAnalytics from "./anomaly/UserBehaviorAnalytics";
import NetworkTrafficAnalysis from "./anomaly/NetworkTrafficAnalysis";

// Import our new dashboard components
import DashboardController from "./dashboard/DashboardController";
import SecurityMetricsWidget from "./widgets/SecurityMetricsWidget";
import ThreatMapWidget from "./widgets/ThreatMapWidget";
import AlertsSummaryWidget from "./widgets/AlertsSummaryWidget";
import AlertTrendsWidget from "./widgets/AlertTrendsWidget";

// Mock data for SOAR overview
const activeIncidents = [
  {
    id: "inc-001",
    title: "Unusual Login Activity - Finance Dept",
    severity: "high",
    timeAgo: "15m",
    assignee: "John Smith",
  },
  {
    id: "inc-002",
    title: "Malware Detected - Marketing Workstation",
    severity: "critical",
    timeAgo: "45m",
    assignee: "Sarah Williams",
  },
  {
    id: "inc-003",
    title: "Data Exfiltration Attempt",
    severity: "medium",
    timeAgo: "2h",
    assignee: "Unassigned",
  },
];

const recentAutomations = [
  {
    id: "auto-001",
    name: "Phishing Response",
    type: "playbook",
    status: "running",
    timeAgo: "10m",
  },
  {
    id: "auto-002",
    name: "Malware Containment",
    type: "playbook",
    status: "completed",
    timeAgo: "1h",
  },
  {
    id: "auto-003",
    name: "High Severity Alert Triage",
    type: "rule",
    status: "completed",
    timeAgo: "3h",
  },
];

const soarMetrics = [
  { name: "MTTR", value: "45m", change: -15, isGood: true },
  { name: "Automation Rate", value: "78%", change: 8, isGood: true },
  { name: "Success Rate", value: "93%", change: 2, isGood: true },
  { name: "Active Hunts", value: "6", change: 0, isGood: true },
];

interface SOARDashboardProps {
  activeTab: number;
  onTabChange: (newValue: number) => void;
  activeAutomationTab: number;
  onAutomationTabChange: (newValue: number) => void;
  activeAnomalyTab: number;
  onAnomalyTabChange: (newValue: number) => void;
}

const SOARDashboard: React.FC<SOARDashboardProps> = ({
  activeTab,
  onTabChange,
  activeAutomationTab,
  onAutomationTabChange,
  activeAnomalyTab,
  onAnomalyTabChange,
}) => {
  const theme = useTheme();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    onTabChange(newValue);
  };

  // Main component mapping
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 0: // Overview
        return <SOAROverview />;
      case 1: // Automation
        return (
          <AutomationSection
            activeTab={activeAutomationTab}
            onTabChange={onAutomationTabChange}
          />
        );
      case 2: // Hunting
        return <ThreatHuntingDashboard />;
      case 3: // Anomaly Detection
        return (
          <AnomalyDetectionSection
            activeTab={activeAnomalyTab}
            onTabChange={onAnomalyTabChange}
          />
        );
      case 4: // Collaboration
        return <CollaborativeResponseHub />;
      default:
        return <SOAROverview />;
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <SecurityIcon sx={{ mr: 1 }} />
            SOAR Platform
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton sx={{ ml: 1 }}>
              <SearchIcon />
            </IconButton>
            <IconButton sx={{ ml: 1 }}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ bgcolor: "background.paper" }}
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<AutoGraphIcon />} label="Automation" />
          <Tab icon={<SearchIcon />} label="Hunting" />
          <Tab icon={<VisibilityIcon />} label="Anomaly Detection" />
          <Tab icon={<PeopleIcon />} label="Collaboration" />
        </Tabs>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: "auto", p: 3 }}>
        {renderActiveComponent()}
      </Box>
    </Box>
  );
};

// SOAR Overview Component
const SOAROverview: React.FC = () => {
  const theme = useTheme();
  const userId = "current-user"; // In a real app, this would come from auth context

  // Tabs to show different dashboard views
  const [dashboardView, setDashboardView] = useState<"classic" | "custom">(
    "custom"
  );

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">SOAR Overview</Typography>

        <Box>
          <Tabs
            value={dashboardView}
            onChange={(_, value) => setDashboardView(value)}
            aria-label="dashboard view tabs"
          >
            <Tab label="Custom Dashboard" value="custom" />
            <Tab label="Classic View" value="classic" />
          </Tabs>
        </Box>
      </Box>

      {dashboardView === "custom" ? (
        <Box sx={{ height: "calc(100vh - 200px)" }}>
          {/* Use our new DashboardController */}
          <DashboardController userId={userId} />
        </Box>
      ) : (
        <>
          {/* Summary Metrics */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {soarMetrics.map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      gutterBottom
                    >
                      {metric.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="h4" component="div">
                        {metric.value}
                      </Typography>
                      <Chip
                        label={`${metric.change > 0 ? "+" : ""}${
                          metric.change
                        }%`}
                        color={metric.isGood ? "success" : "error"}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {/* Active Incidents */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Active Incidents</Typography>
                  <IconButton size="small">
                    <Badge badgeContent={activeIncidents.length} color="error">
                      <WarningIcon />
                    </Badge>
                  </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {activeIncidents.map((incident) => (
                    <ListItem key={incident.id} sx={{ px: 1, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {incident.severity === "critical" ? (
                          <ErrorIcon color="error" />
                        ) : incident.severity === "high" ? (
                          <WarningIcon color="warning" />
                        ) : (
                          <InfoIcon color="info" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={incident.title}
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.75rem",
                            }}
                          >
                            <span>{incident.timeAgo} ago</span>
                            <span>Assigned to: {incident.assignee}</span>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button variant="outlined" size="small">
                    View All Incidents
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Recent Automations */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Recent Automations</Typography>
                  <IconButton size="small">
                    <PlayArrowIcon />
                  </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {recentAutomations.map((automation) => (
                    <ListItem key={automation.id} sx={{ px: 1, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {automation.type === "playbook" ? (
                          <PlayArrowIcon color="primary" />
                        ) : (
                          <AutoGraphIcon color="secondary" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={automation.name}
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.75rem",
                            }}
                          >
                            <span>{automation.timeAgo} ago</span>
                            <span>
                              Status:{" "}
                              <Chip
                                label={automation.status}
                                size="small"
                                color={
                                  automation.status === "running"
                                    ? "warning"
                                    : "success"
                                }
                                sx={{ height: 20, fontSize: "0.65rem" }}
                              />
                            </span>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button variant="outlined" size="small">
                    View Automation History
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Quick Access */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Access
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4} md={2}>
                  <ShortcutCard
                    title="Create Playbook"
                    description="Design new response workflows"
                    icon={<PlayArrowIcon fontSize="large" />}
                    color={theme.palette.primary.main}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <ShortcutCard
                    title="Hunt Dashboard"
                    description="Start threat hunting"
                    icon={<SearchIcon fontSize="large" />}
                    color={theme.palette.secondary.main}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <ShortcutCard
                    title="Response Hub"
                    description="Coordinate team response"
                    icon={<PeopleIcon fontSize="large" />}
                    color={theme.palette.success.main}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <ShortcutCard
                    title="Incident Reports"
                    description="View security incidents"
                    icon={<AssignmentIcon fontSize="large" />}
                    color={theme.palette.info.main}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <ShortcutCard
                    title="Actions Library"
                    description="Browse response actions"
                    icon={<LibraryBooksIcon fontSize="large" />}
                    color={theme.palette.error.main}
                  />
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <ShortcutCard
                    title="Anomaly Detection"
                    description="Discover unusual patterns"
                    icon={<AutoGraphIcon fontSize="large" />}
                    color={theme.palette.warning.main}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

// Automation Section Component
interface AutomationSectionProps {
  activeTab: number;
  onTabChange: (newValue: number) => void;
}

const AutomationSection: React.FC<AutomationSectionProps> = ({
  activeTab: automationTab,
  onTabChange: onAutomationTabChange,
}) => {
  const handleAutomationTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    onAutomationTabChange(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Security Automation
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={automationTab}
          onChange={handleAutomationTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Rules Manager" />
          <Tab label="Playbook Orchestrator" />
          <Tab label="Actions Library" />
          <Tab label="Execution Dashboard" />
        </Tabs>
      </Paper>

      <Box role="tabpanel" hidden={automationTab !== 0}>
        {automationTab === 0 && <AutomationRulesManager />}
      </Box>

      <Box role="tabpanel" hidden={automationTab !== 1}>
        {automationTab === 1 && <PlaybookOrchestrator />}
      </Box>

      <Box role="tabpanel" hidden={automationTab !== 2}>
        {automationTab === 2 && <ResponseActionsLibrary />}
      </Box>

      <Box role="tabpanel" hidden={automationTab !== 3}>
        {automationTab === 3 && <AutomationExecutionDashboard />}
      </Box>
    </Box>
  );
};

// Anomaly Detection Section Component
interface AnomalyDetectionSectionProps {
  activeTab: number;
  onTabChange: (newValue: number) => void;
}

const AnomalyDetectionSection: React.FC<AnomalyDetectionSectionProps> = ({
  activeTab: anomalyTab,
  onTabChange: onAnomalyTabChange,
}) => {
  const handleAnomalyTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    onAnomalyTabChange(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Anomaly Detection
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={anomalyTab}
          onChange={handleAnomalyTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="User Behavior" />
          <Tab label="Network Traffic" />
          <Tab label="Explainable AI" />
        </Tabs>
      </Paper>

      <Box role="tabpanel" hidden={anomalyTab !== 0}>
        {anomalyTab === 0 && <UserBehaviorAnalytics />}
      </Box>

      <Box role="tabpanel" hidden={anomalyTab !== 1}>
        {anomalyTab === 1 && <NetworkTrafficAnalysis />}
      </Box>

      <Box role="tabpanel" hidden={anomalyTab !== 2}>
        {anomalyTab === 2 && <ExplainableAI />}
      </Box>
    </Box>
  );
};

// Shortcut Card Component
const ShortcutCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, description, icon, color }) => {
  return (
    <Card>
      <CardActionArea>
        <CardContent sx={{ textAlign: "center", p: 2 }}>
          <Box
            sx={{
              mb: 2,
              color: "white",
              backgroundColor: color,
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              margin: "0 auto",
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default SOARDashboard;
