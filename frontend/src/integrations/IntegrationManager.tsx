/**
 * Integration Manager Component
 *
 * Centralized manager for all external tool integrations in the security platform.
 * Provides UI for configuring, testing, and managing third-party integrations.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Tab,
  Tabs,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

// Integration types
export interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  description: string;
  apiUrl: string;
  apiKey: string;
  status: "active" | "inactive" | "error";
  lastSyncTime?: string;
  options: Record<string, any>;
  capabilities: string[];
}

// Helper type for mocked data that may have string status rather than specific enum values
type MockIntegrationConfig = Omit<IntegrationConfig, 'status'> & {
  status: string;
}

export const INTEGRATION_TYPES = {
  SIEM: [
    {
      id: "splunk",
      name: "Splunk",
      icon: "🔍",
      capabilities: ["data_ingestion", "alerts", "dashboards"],
    },
    {
      id: "elastic",
      name: "Elastic Security",
      icon: "🔎",
      capabilities: ["data_ingestion", "alerts", "dashboards"],
    },
    {
      id: "qradar",
      name: "IBM QRadar",
      icon: "📊",
      capabilities: ["data_ingestion", "alerts", "dashboards"],
    },
  ],
  THREAT_INTEL: [
    {
      id: "misp",
      name: "MISP",
      icon: "🌐",
      capabilities: ["indicators", "reports", "feeds"],
    },
    {
      id: "threatconnect",
      name: "ThreatConnect",
      icon: "🔗",
      capabilities: ["indicators", "reports", "feeds"],
    },
    {
      id: "anomali",
      name: "Anomali",
      icon: "🔔",
      capabilities: ["indicators", "reports", "feeds"],
    },
  ],
  TICKETING: [
    {
      id: "jira",
      name: "Jira",
      icon: "🎫",
      capabilities: ["ticket_creation", "status_sync", "comments"],
    },
    {
      id: "servicenow",
      name: "ServiceNow",
      icon: "🔧",
      capabilities: ["ticket_creation", "status_sync", "comments"],
    },
    {
      id: "zendesk",
      name: "Zendesk",
      icon: "🎯",
      capabilities: ["ticket_creation", "status_sync", "comments"],
    },
  ],
  SCANNER: [
    {
      id: "nessus",
      name: "Tenable Nessus",
      icon: "🔍",
      capabilities: ["vulnerability_scans", "reports", "api"],
    },
    {
      id: "qualys",
      name: "Qualys",
      icon: "🛡️",
      capabilities: ["vulnerability_scans", "reports", "api"],
    },
    {
      id: "nexpose",
      name: "Rapid7 Nexpose",
      icon: "📡",
      capabilities: ["vulnerability_scans", "reports", "api"],
    },
  ],
  CLOUD: [
    {
      id: "aws_security_hub",
      name: "AWS Security Hub",
      icon: "☁️",
      capabilities: ["alerts", "findings", "compliance"],
    },
    {
      id: "azure_sentinel",
      name: "Azure Sentinel",
      icon: "🔮",
      capabilities: ["alerts", "findings", "compliance"],
    },
    {
      id: "gcp_security",
      name: "Google Cloud Security",
      icon: "🌩️",
      capabilities: ["alerts", "findings", "compliance"],
    },
  ],
};

export const IntegrationManager: React.FC = () => {
  const theme = useTheme();

  // State
  const [activeTab, setActiveTab] = useState<string>("all");
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<IntegrationConfig | null>(null);
  const [formValues, setFormValues] = useState<Partial<IntegrationConfig>>({
    name: "",
    type: "",
    description: "",
    apiUrl: "",
    apiKey: "",
    options: {},
    capabilities: [],
  });

  // Load integrations
  useEffect(() => {
    // Simulate API call to load integrations
    const loadIntegrations = async () => {
      setLoading(true);

      try {
        // Mock data - in a real app, this would be an API call
        setTimeout(() => {
          const mockIntegrations: IntegrationConfig[] = [
            {
              id: "1",
              name: "Splunk Enterprise",
              type: "SIEM",
              description:
                "Splunk integration for log ingestion and correlation",
              apiUrl: "https://splunk.example.com/api/v2",
              apiKey: "••••••••••••••••",
              status: "active",
              lastSyncTime: "2025-05-20T10:12:45Z",
              options: {
                indexName: "security_events",
                batchSize: 500,
                syncInterval: 300,
              },
              capabilities: ["data_ingestion", "alerts", "dashboards"],
            },
            {
              id: "2",
              name: "MISP Threat Sharing",
              type: "THREAT_INTEL",
              description: "MISP integration for threat intelligence",
              apiUrl: "https://misp.example.com/api",
              apiKey: "••••••••••••••••",
              status: "active",
              lastSyncTime: "2025-05-20T11:30:15Z",
              options: {
                syncTags: true,
                pullInterval: 3600,
                pushEvents: true,
              },
              capabilities: ["indicators", "reports", "feeds"],
            },
            {
              id: "3",
              name: "Jira Service Management",
              type: "TICKETING",
              description: "Jira integration for ticket management",
              apiUrl: "https://jira.example.com/rest/api/2",
              apiKey: "••••••••••••••••",
              status: "inactive",
              options: {
                projectKey: "SEC",
                defaultAssignee: "security-team",
                createComments: true,
              },
              capabilities: ["ticket_creation", "status_sync", "comments"],
            },
          ];

          setIntegrations(mockIntegrations);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to load integrations:", error);
        setLoading(false);
      }
    };

    loadIntegrations();
  }, []);

  // Filter integrations by type
  const filteredIntegrations =
    activeTab === "all"
      ? integrations
      : integrations.filter((integration) => integration.type === activeTab);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Handle dialog open
  const handleOpenDialog = (integration?: IntegrationConfig) => {
    if (integration) {
      // Edit mode
      setEditMode(true);
      setSelectedIntegration(integration);
      setFormValues({ ...integration });
    } else {
      // Add mode
      setEditMode(false);
      setSelectedIntegration(null);
      setFormValues({
        name: "",
        type: "",
        description: "",
        apiUrl: "",
        apiKey: "",
        options: {},
        capabilities: [],
      });
    }

    setDialogOpen(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditMode(false);
    setSelectedIntegration(null);
  };

  // Handle form change
  const handleFormChange = (field: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle integration save
  const handleSaveIntegration = () => {
    if (editMode && selectedIntegration) {
      // Update existing integration
      const updatedIntegrations = integrations.map((integration) =>
        integration.id === selectedIntegration.id
          ? { ...integration, ...formValues }
          : integration
      );

      setIntegrations(updatedIntegrations);
    } else {
      // Add new integration
      const newIntegration: IntegrationConfig = {
        id: Date.now().toString(),
        name: formValues.name || "",
        type: formValues.type || "",
        description: formValues.description || "",
        apiUrl: formValues.apiUrl || "",
        apiKey: formValues.apiKey || "",
        status: "inactive",
        options: formValues.options || {},
        capabilities: formValues.capabilities || [],
      };

      setIntegrations([...integrations, newIntegration]);
    }

    handleCloseDialog();
  };

  // Handle integration delete
  const handleDeleteIntegration = (id: string) => {
    const updatedIntegrations = integrations.filter(
      (integration) => integration.id !== id
    );
    setIntegrations(updatedIntegrations);
  };

  // Handle integration status toggle
  const handleToggleStatus = (id: string) => {
    setIntegrations([
      ...integrations.map((item) => {
        if (item.id === id) {
          const newStatus =
            item.status === "active" ? "inactive" : "active";
          // Type assertion to satisfy TypeScript
          return { ...item, status: newStatus } as IntegrationConfig;
        }
        return item;
      }),
    ]);
  };

  // Handle integration test
  const handleTestIntegration = (id: string) => {
    // Simulate API test - in a real app, this would make an API call
    setIntegrations([
      ...integrations.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: "active",
            lastSyncTime: new Date().toISOString(),
          } as IntegrationConfig;
        }
        return item;
      }),
    ]);

    // Show success message (in a real app, this would be a toast notification)
    console.log("Integration test successful");
  };

  // Get integration type details
  const getIntegrationTypeDetails = (type: string, id?: string) => {
    if (!type) return null;

    const typeKey = type as keyof typeof INTEGRATION_TYPES;
    if (!INTEGRATION_TYPES[typeKey]) return null;

    if (id) {
      return INTEGRATION_TYPES[typeKey].find((item) => item.id === id) || null;
    }

    return INTEGRATION_TYPES[typeKey];
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return theme.palette.success.main;
      case "inactive":
        return theme.palette.warning.main;
      case "error":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckIcon fontSize="small" />;
      case "inactive":
        return <WarningIcon fontSize="small" />;
      case "error":
        return <ErrorIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Integration Manager</Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Integration
        </Button>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
      >
        <Tab label="All Integrations" value="all" />
        <Tab label="SIEM" value="SIEM" />
        <Tab label="Threat Intel" value="THREAT_INTEL" />
        <Tab label="Ticketing" value="TICKETING" />
        <Tab label="Scanners" value="SCANNER" />
        <Tab label="Cloud Security" value="CLOUD" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredIntegrations.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No integrations found. Click "Add Integration" to set up a new
          integration.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredIntegrations.map((integration) => (
            <Grid item xs={12} md={6} lg={4} key={integration.id}>
              <Card variant="outlined">
                <CardHeader
                  title={integration.name}
                  subheader={integration.type}
                  action={
                    <Tooltip
                      title={
                        integration.status === "active" ? "Active" : "Inactive"
                      }
                    >
                      <Chip
                        icon={getStatusIcon(integration.status)}
                        label={integration.status}
                        size="small"
                        color={
                          integration.status === "active"
                            ? "success"
                            : "default"
                        }
                      />
                    </Tooltip>
                  }
                />

                <CardContent>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {integration.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      Capabilities
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 0.5,
                      }}
                    >
                      {integration.capabilities.map((capability) => (
                        <Chip
                          key={capability}
                          label={capability.replace("_", " ")}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        API Endpoint
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {integration.apiUrl}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Last Sync
                      </Typography>
                      <Typography variant="body2">
                        {integration.lastSyncTime
                          ? new Date(integration.lastSyncTime).toLocaleString()
                          : "Never"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: "space-between" }}>
                  <Box>
                    <Tooltip title="Edit Integration">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(integration)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Integration">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteIntegration(integration.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box>
                    <Tooltip title="Test Connection">
                      <IconButton
                        size="small"
                        onClick={() => handleTestIntegration(integration.id)}
                        color="primary"
                      >
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={integration.status === "active"}
                          onChange={() => handleToggleStatus(integration.id)}
                        />
                      }
                      label={
                        integration.status === "active" ? "Enabled" : "Disabled"
                      }
                    />
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Integration Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Integration" : "Add New Integration"}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Integration Name"
                value={formValues.name || ""}
                onChange={(e) => handleFormChange("name", e.target.value)}
                margin="normal"
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Integration Type</InputLabel>
                <Select
                  value={formValues.type || ""}
                  onChange={(e) => handleFormChange("type", e.target.value)}
                  label="Integration Type"
                >
                  {Object.keys(INTEGRATION_TYPES).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formValues.description || ""}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API URL"
                value={formValues.apiUrl || ""}
                onChange={(e) => handleFormChange("apiUrl", e.target.value)}
                margin="normal"
                required
                placeholder="https://example.com/api"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API Key"
                value={formValues.apiKey || ""}
                onChange={(e) => handleFormChange("apiKey", e.target.value)}
                margin="normal"
                required
                type="password"
              />
            </Grid>

            {formValues.type && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Available Capabilities
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {getIntegrationTypeDetails(formValues.type)?.map((item) => (
                    <Chip
                      key={item.id}
                      label={item.name}
                      icon={<span>{item.icon}</span>}
                      variant={
                        formValues.capabilities?.includes(item.capabilities[0])
                          ? "filled"
                          : "outlined"
                      }
                      onClick={() => {
                        const capability = item.capabilities[0];
                        const currentCapabilities =
                          formValues.capabilities || [];

                        if (currentCapabilities.includes(capability)) {
                          handleFormChange(
                            "capabilities",
                            currentCapabilities.filter((c) => c !== capability)
                          );
                        } else {
                          handleFormChange("capabilities", [
                            ...currentCapabilities,
                            capability,
                          ]);
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveIntegration}
            disabled={
              !formValues.name ||
              !formValues.type ||
              !formValues.apiUrl ||
              !formValues.apiKey
            }
          >
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
