import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import CloudIcon from "@mui/icons-material/Cloud";
import SecurityIcon from "@mui/icons-material/Security";
import StorageIcon from "@mui/icons-material/Storage";
import EmailIcon from "@mui/icons-material/Email";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BugReportIcon from "@mui/icons-material/BugReport";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  lastSync?: string;
  configuration: Record<string, any>;
}

const IntegrationSettings: React.FC = () => {
  // State for integrations
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "1",
      name: "Slack Notifications",
      type: "slack",
      status: "active",
      lastSync: "2025-05-14 14:32:45",
      configuration: {
        webhookUrl:
          "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
        channel: "#security-alerts",
        notifyOn: ["critical", "high"],
      },
    },
    {
      id: "2",
      name: "Jira Issue Tracker",
      type: "jira",
      status: "active",
      lastSync: "2025-05-14 14:00:12",
      configuration: {
        url: "https://example.atlassian.net",
        project: "SEC",
        username: "jira-integration",
        createIssuesFor: ["vulnerabilities", "incidents"],
      },
    },
    {
      id: "3",
      name: "AWS CloudWatch",
      type: "aws",
      status: "inactive",
      configuration: {
        region: "us-east-1",
        logGroups: [
          "/aws/lambda/security-function",
          "/aws/ec2/security-group-changes",
        ],
      },
    },
    {
      id: "4",
      name: "Microsoft Teams Alerts",
      type: "teams",
      status: "error",
      lastSync: "2025-05-13 09:45:22",
      configuration: {
        webhookUrl:
          "https://example.webhook.office.com/webhookb2/X-X-X-X/IncomingWebhook/X-X-X/X-X-X",
        notifyOn: ["critical", "high", "medium"],
      },
    },
  ]);

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "edit">("add");
  const [currentIntegration, setCurrentIntegration] =
    useState<Integration | null>(null);

  // State for form
  const [formValues, setFormValues] = useState({
    name: "",
    type: "slack",
    configuration: {} as Record<string, any>,
  });

  // State for success/error messages
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  // Integration types
  const integrationTypes = [
    { value: "slack", label: "Slack", icon: <NotificationsIcon /> },
    { value: "teams", label: "Microsoft Teams", icon: <NotificationsIcon /> },
    { value: "jira", label: "Jira", icon: <BugReportIcon /> },
    { value: "aws", label: "AWS CloudWatch", icon: <CloudIcon /> },
    { value: "azure", label: "Azure Monitor", icon: <CloudIcon /> },
    { value: "gcp", label: "Google Cloud Monitoring", icon: <CloudIcon /> },
    { value: "splunk", label: "Splunk", icon: <StorageIcon /> },
    { value: "elasticsearch", label: "Elasticsearch", icon: <StorageIcon /> },
    { value: "pagerduty", label: "PagerDuty", icon: <EventIcon /> },
    { value: "email", label: "Email Integration", icon: <EmailIcon /> },
    { value: "siem", label: "SIEM", icon: <SecurityIcon /> },
  ];

  // Get integration icon
  const getIntegrationIcon = (type: string) => {
    const integration = integrationTypes.find((i) => i.value === type);
    return integration?.icon || <LinkIcon />;
  };

  // Get status chip
  const getStatusChip = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Chip
            size="small"
            color="success"
            icon={<CheckCircleIcon />}
            label="Active"
          />
        );
      case "inactive":
        return (
          <Chip
            size="small"
            color="default"
            label="Inactive"
            variant="outlined"
          />
        );
      case "error":
        return (
          <Chip size="small" color="error" icon={<ErrorIcon />} label="Error" />
        );
      default:
        return <Chip size="small" color="default" label={status} />;
    }
  };

  // Handle opening the dialog
  const handleOpenDialog = (
    type: "add" | "edit",
    integration?: Integration
  ) => {
    setDialogType(type);

    if (type === "edit" && integration) {
      setCurrentIntegration(integration);
      setFormValues({
        name: integration.name,
        type: integration.type,
        configuration: { ...integration.configuration },
      });
    } else {
      setCurrentIntegration(null);
      setFormValues({
        name: "",
        type: "slack",
        configuration: {},
      });
    }

    setDialogOpen(true);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setError("");
  };

  // Handle form value changes
  const handleInputChange = (name: string, value: any) => {
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  // Handle configuration changes
  const handleConfigChange = (key: string, value: any) => {
    setFormValues({
      ...formValues,
      configuration: {
        ...formValues.configuration,
        [key]: value,
      },
    });
  };

  // Handle saving integration
  const handleSaveIntegration = () => {
    // Validation
    if (!formValues.name.trim()) {
      setError("Integration name is required");
      return;
    }

    // Specific validation based on integration type
    if (formValues.type === "slack" && !formValues.configuration?.webhookUrl) {
      setError("Webhook URL is required for Slack integration");
      return;
    }

    if (
      formValues.type === "jira" &&
      (!formValues.configuration?.url || !formValues.configuration?.project)
    ) {
      setError("URL and project key are required for Jira integration");
      return;
    }

    // Create or update integration
    if (dialogType === "add") {
      // Create new integration
      const newIntegration: Integration = {
        id: Math.random().toString(36).substring(2, 9), // Simple ID generation
        name: formValues.name,
        type: formValues.type,
        status: "inactive", // New integrations start as inactive
        configuration: formValues.configuration,
      };

      setIntegrations([...integrations, newIntegration]);
    } else if (dialogType === "edit" && currentIntegration) {
      // Update existing integration
      const updatedIntegrations = integrations.map((integration) =>
        integration.id === currentIntegration.id
          ? {
              ...integration,
              name: formValues.name,
              type: formValues.type,
              configuration: formValues.configuration,
            }
          : integration
      );

      setIntegrations(updatedIntegrations);
    }

    // Close dialog and show success message
    setDialogOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handle deleting integration
  const handleDeleteIntegration = (id: string) => {
    const updatedIntegrations = integrations.filter(
      (integration) => integration.id !== id
    );
    setIntegrations(updatedIntegrations);
  };

  // Handle toggling integration status
  const handleToggleStatus = (id: string) => {
    const updatedIntegrations = integrations.map((integration) =>
      integration.id === id
        ? {
            ...integration,
            status: integration.status === "active" ? "inactive" : "active",
          }
        : integration
    );

    setIntegrations(updatedIntegrations);
  };

  // Render configuration form based on integration type
  const renderConfigurationForm = () => {
    switch (formValues.type) {
      case "slack":
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Webhook URL"
              value={formValues.configuration?.webhookUrl || ""}
              onChange={(e) => handleConfigChange("webhookUrl", e.target.value)}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Channel"
              value={formValues.configuration?.channel || ""}
              onChange={(e) => handleConfigChange("channel", e.target.value)}
              placeholder="#security-alerts"
              helperText="Leave empty for default channel in webhook"
            />
          </>
        );

      case "teams":
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Webhook URL"
              value={formValues.configuration?.webhookUrl || ""}
              onChange={(e) => handleConfigChange("webhookUrl", e.target.value)}
              required
            />
          </>
        );

      case "jira":
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Jira URL"
              value={formValues.configuration?.url || ""}
              onChange={(e) => handleConfigChange("url", e.target.value)}
              required
              placeholder="https://example.atlassian.net"
            />
            <TextField
              fullWidth
              margin="normal"
              label="Project Key"
              value={formValues.configuration?.project || ""}
              onChange={(e) => handleConfigChange("project", e.target.value)}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              value={formValues.configuration?.username || ""}
              onChange={(e) => handleConfigChange("username", e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="API Token"
              type="password"
              value={formValues.configuration?.apiToken || ""}
              onChange={(e) => handleConfigChange("apiToken", e.target.value)}
            />
          </>
        );

      case "aws":
      case "azure":
      case "gcp":
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Region"
              value={formValues.configuration?.region || ""}
              onChange={(e) => handleConfigChange("region", e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="API Key"
              type="password"
              value={formValues.configuration?.apiKey || ""}
              onChange={(e) => handleConfigChange("apiKey", e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Secret Key"
              type="password"
              value={formValues.configuration?.secretKey || ""}
              onChange={(e) => handleConfigChange("secretKey", e.target.value)}
            />
          </>
        );

      default:
        return (
          <Typography color="textSecondary">
            Please select an integration type to configure.
          </Typography>
        );
    }
  };

  return (
    <Box>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Integration settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Connected Integrations</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog("add")}
            >
              Add Integration
            </Button>
          </Box>

          <Card>
            <List>
              {integrations.map((integration) => (
                <React.Fragment key={integration.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getIntegrationIcon(integration.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="subtitle1" component="span">
                            {integration.name}
                          </Typography>
                          <Box sx={{ ml: 2 }}>
                            {getStatusChip(integration.status)}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            component="span"
                            color="textSecondary"
                          >
                            Type:{" "}
                            {integrationTypes.find(
                              (i) => i.value === integration.type
                            )?.label || integration.type}
                          </Typography>
                          {integration.lastSync && (
                            <>
                              <Typography
                                variant="body2"
                                component="span"
                                color="textSecondary"
                                sx={{ ml: 2 }}
                              >
                                Last Sync: {integration.lastSync}
                              </Typography>
                            </>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={integration.status === "active"}
                            onChange={() => handleToggleStatus(integration.id)}
                            color="primary"
                            disabled={integration.status === "error"}
                          />
                        }
                        label=""
                      />
                      <Tooltip title="Edit">
                        <IconButton
                          edge="end"
                          onClick={() => handleOpenDialog("edit", integration)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          edge="end"
                          onClick={() =>
                            handleDeleteIntegration(integration.id)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}

              {integrations.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No integrations configured"
                    secondary="Click 'Add Integration' to connect external services"
                  />
                </ListItem>
              )}
            </List>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Integrations
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                {integrationTypes.map((type) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={type.value}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Box sx={{ mr: 1 }}>{type.icon}</Box>
                          <Typography variant="subtitle1">
                            {type.label}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {integrations.some((i) => i.type === type.value)
                            ? `${
                                integrations.filter(
                                  (i) => i.type === type.value
                                ).length
                              } configured`
                            : "Not configured"}
                        </Typography>
                      </CardContent>
                      <Box sx={{ px: 2, pb: 2 }}>
                        <Button
                          size="small"
                          onClick={() => {
                            setFormValues({
                              ...formValues,
                              type: type.value,
                            });
                            handleOpenDialog("add");
                          }}
                          disabled={
                            integrationTypes.find((t) => t.value === type.value)
                              ?.value === "siem"
                          }
                        >
                          Configure
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Integration Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === "add" ? "Add Integration" : "Edit Integration"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            margin="normal"
            label="Integration Name"
            value={formValues.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />

          <TextField
            select
            fullWidth
            margin="normal"
            label="Integration Type"
            value={formValues.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            required
            disabled={dialogType === "edit"} // Don't allow changing type when editing
            SelectProps={{
              native: true,
            }}
          >
            {integrationTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TextField>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Configuration
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {renderConfigurationForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveIntegration} color="primary">
            {dialogType === "add" ? "Add Integration" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationSettings;
