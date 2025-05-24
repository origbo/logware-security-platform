/**
 * Azure Security Dashboard Component
 *
 * Main dashboard for Azure security features integrating Defender for Cloud,
 * storage security, and Active Directory components
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
  LinearProgress,
  useTheme,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  AccountTree as ResourcesIcon,
  Shield as DefenderIcon,
  History as ActivityIcon,
  CloudCircle as CloudIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  MoreVert as MoreIcon,
  CompareArrows as MigrateIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Import types
import {
  AzureTenant,
  AzureSubscription,
  AzureFindingSeverity,
} from "../../types/azureTypes";

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
      id={`azure-tabpanel-${index}`}
      aria-labelledby={`azure-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Azure Security Dashboard props
interface AzureSecurityDashboardProps {
  tenantId?: string; // Optional tenant ID to pre-select
}

// Sample data - replace with API calls in production
const sampleTenants: AzureTenant[] = [
  {
    id: "tenant-1",
    name: "Primary Enterprise Tenant",
    defaultDomain: "contoso.onmicrosoft.com",
    isActive: true,
    lastScanned: "2025-05-19T14:30:00Z",
    subscriptions: [
      {
        id: "sub-1",
        displayName: "Production Subscription",
        state: "Enabled",
        tenantId: "tenant-1",
        isActive: true,
        lastScanned: "2025-05-19T14:30:00Z",
      },
      {
        id: "sub-2",
        displayName: "Development Subscription",
        state: "Enabled",
        tenantId: "tenant-1",
        isActive: true,
        lastScanned: "2025-05-19T14:30:00Z",
      },
    ],
  },
  {
    id: "tenant-2",
    name: "Test Environment",
    defaultDomain: "fabrikam.onmicrosoft.com",
    isActive: false,
    lastScanned: "2025-05-15T10:45:00Z",
  },
];

/**
 * Azure Security Dashboard Component
 */
const AzureSecurityDashboard: React.FC<AzureSecurityDashboardProps> = ({
  tenantId,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(
    tenantId || null
  );
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<AzureTenant[]>([]);
  const [syncingTenant, setSyncingTenant] = useState<string | null>(null);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTenantMenu, setActiveTenantMenu] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call with delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Set sample data
        setTenants(sampleTenants);

        // Select first tenant by default if none provided
        if (!selectedTenantId && sampleTenants.length > 0) {
          setSelectedTenantId(sampleTenants[0].id);

          // Select first subscription by default if available
          if (
            sampleTenants[0].subscriptions &&
            sampleTenants[0].subscriptions.length > 0
          ) {
            setSelectedSubscriptionId(sampleTenants[0].subscriptions[0].id);
          }
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching Azure tenants:", err);
        setError("Failed to load Azure tenants");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTenantId]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle tenant selection
  const handleTenantSelect = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    setSelectedSubscriptionId(null); // Reset subscription selection

    // Find tenant
    const tenant = tenants.find((t) => t.id === tenantId);

    // Select first subscription by default if available
    if (tenant?.subscriptions && tenant.subscriptions.length > 0) {
      setSelectedSubscriptionId(tenant.subscriptions[0].id);
    }
  };

  // Handle subscription selection
  const handleSubscriptionSelect = (subscriptionId: string) => {
    setSelectedSubscriptionId(subscriptionId);
  };

  // Sync tenant data
  const handleSyncTenant = async (tenantId: string) => {
    try {
      setSyncingTenant(tenantId);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Update last scanned time
      setTenants((prevTenants) =>
        prevTenants.map((tenant) =>
          tenant.id === tenantId
            ? { ...tenant, lastScanned: new Date().toISOString() }
            : tenant
        )
      );
    } catch (err) {
      console.error("Error syncing tenant:", err);
      setError("Failed to sync tenant data");
    } finally {
      setSyncingTenant(null);
    }
  };

  // Handle menu open
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    tenantId: string
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveTenantMenu(tenantId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveTenantMenu(null);
  };

  // Get selected tenant
  const selectedTenant = tenants.find(
    (tenant) => tenant.id === selectedTenantId
  );

  // Get selected subscription
  const selectedSubscription = selectedTenant?.subscriptions?.find(
    (subscription) => subscription.id === selectedSubscriptionId
  );

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

  // If no tenants are available
  if (tenants.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <CloudIcon
          sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }}
        />
        <Typography variant="h5" gutterBottom>
          No Azure Tenants Connected
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Connect an Azure tenant to start monitoring security.
        </Typography>
        <Button variant="contained" color="primary">
          Connect Azure Tenant
        </Button>
      </Paper>
    );
  }

  // If no tenant is selected (should not happen, but just in case)
  if (!selectedTenant) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        Please select an Azure tenant to view security information.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header and tenant selection */}
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
              Azure Security Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monitor and manage security for your Azure resources and
              subscriptions.
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
                selectedTenantId && handleSyncTenant(selectedTenantId)
              }
              disabled={!selectedTenantId || syncingTenant === selectedTenantId}
            >
              {syncingTenant === selectedTenantId ? (
                <CircularProgress size={24} />
              ) : (
                "Refresh Data"
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tenant and Subscription Selection */}
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
          Tenant:
        </Typography>

        {tenants.map((tenant) => (
          <Box key={tenant.id} sx={{ position: "relative" }}>
            <Chip
              label={tenant.name}
              color={tenant.id === selectedTenantId ? "primary" : "default"}
              onClick={() => handleTenantSelect(tenant.id)}
              sx={{ mr: 0.5 }}
            />
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, tenant.id)}
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
          Add Tenant
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
            <ListItemText>Sync Tenant</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tenant Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <MigrateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Migrate Resources</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={handleMenuClose}
            sx={{ color: theme.palette.error.main }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Remove Tenant</ListItemText>
          </MenuItem>
        </Menu>

        {selectedTenant &&
          selectedTenant.subscriptions &&
          selectedTenant.subscriptions.length > 0 && (
            <>
              <Divider orientation="vertical" flexItem />
              <Typography variant="subtitle1" sx={{ ml: 2, mr: 2 }}>
                Subscription:
              </Typography>

              {selectedTenant.subscriptions.map((subscription) => (
                <Chip
                  key={subscription.id}
                  label={subscription.displayName}
                  color={
                    subscription.id === selectedSubscriptionId
                      ? "primary"
                      : "default"
                  }
                  variant={
                    subscription.id === selectedSubscriptionId
                      ? "filled"
                      : "outlined"
                  }
                  onClick={() => handleSubscriptionSelect(subscription.id)}
                  sx={{ mr: 0.5 }}
                />
              ))}
            </>
          )}
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
          Security Overview
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
                    Secure Score
                  </Typography>
                  <DefenderIcon color="primary" />
                </Box>

                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={generateSecurityScore()}
                    size={80}
                    thickness={8}
                    sx={{ color: getScoreColor(generateSecurityScore()) }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h6" component="div">
                      {generateSecurityScore()}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    {generateSecurityScore() >= 80
                      ? "Good"
                      : generateSecurityScore() >= 60
                      ? "Fair"
                      : "Poor"}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Last updated: {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Security Recommendations
                </Typography>
                <Typography variant="h4">28</Typography>

                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="error.main">
                      High Priority
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      8
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={30}
                    color="error"
                    sx={{ height: 6, borderRadius: 1, mb: 1 }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="warning.main">
                      Medium Priority
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      12
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={42}
                    color="warning"
                    sx={{ height: 6, borderRadius: 1, mb: 1 }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="info.main">
                      Low Priority
                    </Typography>
                    <Typography variant="body2" color="info.main">
                      8
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={28}
                    color="info"
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Resource Summary
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Virtual Machines</Typography>
                    <Chip label="24" size="small" variant="outlined" />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Storage Accounts</Typography>
                    <Chip label="16" size="small" variant="outlined" />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Key Vaults</Typography>
                    <Chip label="8" size="small" variant="outlined" />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">SQL Databases</Typography>
                    <Chip label="12" size="small" variant="outlined" />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">
                      Network Security Groups
                    </Typography>
                    <Chip label="18" size="small" variant="outlined" />
                  </Box>
                </Box>

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button size="small" endIcon={<ResourcesIcon />}>
                    View All
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Security Alerts
                </Typography>
                <Typography variant="h4">12</Typography>

                <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Chip label="4 Critical" size="small" color="error" />
                  <Chip label="6 High" size="small" color="warning" />
                  <Chip label="2 Medium" size="small" color="info" />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Last updated: {new Date().toLocaleDateString()}
                  </Typography>
                </Box>

                <Box
                  sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button size="small">Investigate</Button>
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
          aria-label="Azure security tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<DefenderIcon />}
            iconPosition="start"
            label="Defender for Cloud"
          />
          <Tab
            icon={<StorageIcon />}
            iconPosition="start"
            label="Storage Security"
          />
          <Tab
            icon={<ActivityIcon />}
            iconPosition="start"
            label="Activity Logs"
          />
          <Tab
            icon={<SecurityIcon />}
            iconPosition="start"
            label="Identity & Access"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Microsoft Defender for Cloud
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            View and manage Defender for Cloud recommendations, secure score,
            and compliance standards.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will be implemented to display Microsoft Defender for
            Cloud findings, recommendations, and security posture.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Storage Account Security
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Monitor security of storage accounts, detect public access, and
            ensure proper encryption.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will be implemented to display storage account security
            configurations and vulnerabilities.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Activity Logs
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Monitor administrative actions, service health events, and security
            alerts.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will be implemented to display Azure Activity Log events
            with filtering and anomaly detection.
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Identity & Access Management
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Monitor Azure AD identities, privileged access, and role
            assignments.
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            This panel will be implemented to display Azure AD security posture,
            user accounts, and role assignments.
          </Alert>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AzureSecurityDashboard;
