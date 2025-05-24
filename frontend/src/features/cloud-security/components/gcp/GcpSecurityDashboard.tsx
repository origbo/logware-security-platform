/**
 * Google Cloud Platform Security Dashboard Component
 *
 * Main dashboard for GCP security features integrating Security Command Center,
 * IAM, and resource security monitoring
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Code as ResourcesIcon,
  Shield as CommandCenterIcon,
  History as AuditIcon,
  VpnKey as IAMIcon,
  Cloud as CloudIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  BarChart as ChartIcon,
} from "@mui/icons-material";

// Import types
import {
  GcpOrganization,
  GcpProject,
  GcpFindingSeverity,
} from "../../types/gcpTypes";

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
      id={`gcp-tabpanel-${index}`}
      aria-labelledby={`gcp-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// GCP Security Dashboard props
interface GcpSecurityDashboardProps {
  projectId?: string; // Optional project ID to pre-select
  organizationId?: string; // Optional organization ID to pre-select
}

// Sample data - replace with API calls in production
const sampleProjects: GcpProject[] = [
  {
    id: "sample-project-1",
    number: "123456789012",
    name: "Production Environment",
    organizationId: "org-1",
    isActive: true,
    createdAt: "2024-01-15T10:30:00Z",
    lifecycleState: "ACTIVE",
    lastScanned: "2025-05-19T14:30:00Z",
  },
  {
    id: "sample-project-2",
    number: "234567890123",
    name: "Development Environment",
    organizationId: "org-1",
    isActive: true,
    createdAt: "2024-01-20T11:45:00Z",
    lifecycleState: "ACTIVE",
    lastScanned: "2025-05-18T09:15:00Z",
  },
  {
    id: "sample-project-3",
    number: "345678901234",
    name: "Testing Environment",
    organizationId: "org-1",
    isActive: false,
    createdAt: "2024-01-25T14:20:00Z",
    lifecycleState: "ACTIVE",
    lastScanned: "2025-05-15T16:40:00Z",
  },
];

const sampleOrganizations: GcpOrganization[] = [
  {
    id: "org-1",
    displayName: "Example Organization",
    createdAt: "2023-12-10T08:00:00Z",
    lifecycleState: "ACTIVE",
    isActive: true,
    lastScanned: "2025-05-19T14:30:00Z",
  },
];

/**
 * GCP Security Dashboard Component
 */
const GcpSecurityDashboard: React.FC<GcpSecurityDashboardProps> = ({
  projectId,
  organizationId,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(
    organizationId || null
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projectId || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<GcpOrganization[]>([]);
  const [projects, setProjects] = useState<GcpProject[]>([]);
  const [syncingProject, setSyncingProject] = useState<string | null>(null);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeProjectMenu, setActiveProjectMenu] = useState<string | null>(
    null
  );

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call with delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Set sample data
        setOrganizations(sampleOrganizations);
        setProjects(sampleProjects);

        // Select first org by default if none provided
        if (!selectedOrgId && sampleOrganizations.length > 0) {
          setSelectedOrgId(sampleOrganizations[0].id);
        }

        // Select first project by default if none provided
        if (!selectedProjectId && sampleProjects.length > 0) {
          setSelectedProjectId(sampleProjects[0].id);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching GCP data:", err);
        setError("Failed to load GCP projects and organizations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedOrgId, selectedProjectId]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  // Sync project data
  const handleSyncProject = async (projectId: string) => {
    try {
      setSyncingProject(projectId);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Update last scanned time
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId
            ? { ...project, lastScanned: new Date().toISOString() }
            : project
        )
      );
    } catch (err) {
      console.error("Error syncing project:", err);
      setError("Failed to sync project data");
    } finally {
      setSyncingProject(null);
    }
  };

  // Handle menu open
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    projectId: string
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveProjectMenu(projectId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveProjectMenu(null);
  };

  // Get selected project
  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  // Get selected organization
  const selectedOrg = organizations.find((org) => org.id === selectedOrgId);

  // Generate security score (simulated)
  const generateSecurityScore = () => {
    return Math.floor(Math.random() * 41) + 60; // Random score between 60-100
  };

  // Get security score color
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

  // If no projects are available
  if (projects.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <CloudIcon
          sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }}
        />
        <Typography variant="h5" gutterBottom>
          No GCP Projects Connected
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Connect a Google Cloud Platform project to start monitoring security.
        </Typography>
        <Button variant="contained" color="primary">
          Connect GCP Project
        </Button>
      </Paper>
    );
  }

  // If no project is selected (should not happen, but just in case)
  if (!selectedProject) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        Please select a GCP project to view security information.
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
            <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              Google Cloud Security Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monitor and manage security for your Google Cloud Platform
              resources and projects.
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              sx={{ mr: 1 }}
            >
              Settings
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() =>
                selectedProjectId && handleSyncProject(selectedProjectId)
              }
              disabled={
                !selectedProjectId || syncingProject === selectedProjectId
              }
            >
              {syncingProject === selectedProjectId ? (
                <CircularProgress size={24} />
              ) : (
                "Refresh Data"
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Project Selection */}
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1" sx={{ mr: 2 }}>
          Project:
        </Typography>

        {projects.map((project) => (
          <Box key={project.id} sx={{ position: "relative" }}>
            <Chip
              label={project.name}
              color={project.id === selectedProjectId ? "primary" : "default"}
              onClick={() => handleProjectSelect(project.id)}
              sx={{ mr: 0.5 }}
            />
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, project.id)}
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  bgcolor: theme.palette.action.hover,
                },
                width: 20,
                height: 20,
              }}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        <Button startIcon={<CloudIcon />} size="small" sx={{ ml: "auto" }}>
          Add Project
        </Button>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SyncIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sync Project</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Project Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleMenuClose}
            sx={{ color: theme.palette.error.main }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Remove Project</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>

      {/* Security Overview */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Security Overview: {selectedProject.name}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Security Health Analytics
                  </Typography>
                  <CommandCenterIcon color="primary" />
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  <Chip label="4 Critical" size="small" color="error" />
                  <Chip label="8 High" size="small" color="warning" />
                  <Chip label="12 Medium" size="small" color="info" />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Last updated:{" "}
                    {new Date(
                      selectedProject.lastScanned || Date.now()
                    ).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button size="small" endIcon={<CommandCenterIcon />}>
                    View Findings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Web Security Scanner
                  </Typography>
                  <SecurityIcon color="primary" />
                </Box>

                <Typography variant="h5">6</Typography>
                <Typography variant="body2">
                  Vulnerabilities detected
                </Typography>

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="body2">
                    <span style={{ color: theme.palette.error.main }}>2</span>{" "}
                    XSS vulnerabilities
                  </Typography>
                  <Typography variant="body2">
                    <span style={{ color: theme.palette.warning.main }}>3</span>{" "}
                    CSRF issues
                  </Typography>
                  <Typography variant="body2">
                    <span style={{ color: theme.palette.info.main }}>1</span>{" "}
                    Mixed content
                  </Typography>
                </Box>

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button size="small">View Scans</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    IAM Analyzer
                  </Typography>
                  <IAMIcon color="primary" />
                </Box>

                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Service Accounts</Typography>
                    <Typography variant="body2">12</Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">
                      Excessive Permissions
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      3
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Unused Accounts</Typography>
                    <Typography variant="body2" color="warning.main">
                      2
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">External Access</Typography>
                    <Typography variant="body2" color="error.main">
                      1
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button size="small" endIcon={<IAMIcon />}>
                    View IAM
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Resource Summary
                  </Typography>
                  <ResourcesIcon color="primary" />
                </Box>

                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Compute Instances</Typography>
                    <Chip label="16" size="small" variant="outlined" />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Storage Buckets</Typography>
                    <Chip label="24" size="small" variant="outlined" />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">GKE Clusters</Typography>
                    <Chip label="2" size="small" variant="outlined" />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">BigQuery Datasets</Typography>
                    <Chip label="8" size="small" variant="outlined" />
                  </Box>
                </Stack>

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button size="small" endIcon={<ResourcesIcon />}>
                    View Resources
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Security Features Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="GCP security tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<CommandCenterIcon />}
            iconPosition="start"
            label="Security Command Center"
          />
          <Tab icon={<IAMIcon />} iconPosition="start" label="IAM Security" />
          <Tab
            icon={<StorageIcon />}
            iconPosition="start"
            label="Storage Security"
          />
          <Tab icon={<AuditIcon />} iconPosition="start" label="Audit Logs" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Security Command Center
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            View and manage findings from Security Command Center, including
            vulnerabilities, misconfigurations, and threats.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will be implemented to display Security Command Center
            findings and recommendations.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            IAM Security
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Analyze and manage IAM policies, service accounts, and access
            controls.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will be implemented to display IAM analyzer results,
            including service account issues and excessive permissions.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Storage Security
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Monitor security of Cloud Storage buckets, BigQuery datasets, and
            other data storage resources.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will be implemented to display storage resource security
            issues, including public buckets and encryption status.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Audit Logs
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            View and analyze audit logs to detect suspicious activities and
            compliance violations.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will be implemented to display Cloud Audit Logs with
            filtering and anomaly detection capabilities.
          </Alert>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default GcpSecurityDashboard;
