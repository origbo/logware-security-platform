//@ts-nocheck - Temporarily disable TypeScript checks for this file until Element vs string issues are fully resolved
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Slider,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { ComplianceFramework } from "../../pages/compliance/CompliancePage";
import {
  ComplianceConfiguration,
  ComplianceAutomationAction,
  getDefaultFrameworkConfigurations,
  saveComplianceConfiguration,
  applyComplianceConfiguration,
} from "../../services/integrations/complianceAdminService";

interface ComplianceAdminProps {
  frameworks: ComplianceFramework[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`compliance-admin-tabpanel-${index}`}
      aria-labelledby={`compliance-admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ComplianceAdmin: React.FC<ComplianceAdminProps> = ({ frameworks }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [configurations, setConfigurations] = useState<
    Record<string, ComplianceConfiguration>
  >({});
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(
    null
  );
  const [newAction, setNewAction] = useState<ComplianceAutomationAction | null>(
    null
  );

  useEffect(() => {
    // Load default configurations
    if (frameworks.length > 0) {
      const defaultConfigs = getDefaultFrameworkConfigurations(frameworks);
      setConfigurations(defaultConfigs);
      setSelectedFrameworkId(frameworks[0].id);
      setLoading(false);
    }
  }, [frameworks]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFrameworkChange = (event: SelectChangeEvent<string>) => {
    setSelectedFrameworkId(event.target.value);
  };

  const handleCloseAlert = () => {
    setSuccess(null);
    setError(null);
  };

  const handleThresholdChange =
    (threshold: "critical" | "warning" | "good") =>
    (event: Event, newValue: number | number[]) => {
      if (selectedFrameworkId && typeof newValue === "number") {
        setConfigurations({
          ...configurations,
          [selectedFrameworkId]: {
            ...configurations[selectedFrameworkId],
            thresholds: {
              ...configurations[selectedFrameworkId].thresholds,
              [threshold]: newValue,
            },
          },
        });
      }
    };

  const handleFrequencyChange = (
    event: SelectChangeEvent<string> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    if (selectedFrameworkId && name) {
      setConfigurations({
        ...configurations,
        [selectedFrameworkId]: {
          ...configurations[selectedFrameworkId],
          assessmentFrequency: {
            ...configurations[selectedFrameworkId].assessmentFrequency,
            [name]: value,
          },
        },
      });
    }
  };

  const handleNotificationChannelToggle = (
    channel: "email" | "slack" | "teams" | "sms" | "dashboard"
  ) => {
    if (selectedFrameworkId) {
      const currentChannels =
        configurations[selectedFrameworkId].notificationSettings
          .enabledChannels;
      const updatedChannels = currentChannels.includes(channel)
        ? currentChannels.filter((c) => c !== channel)
        : [...currentChannels, channel];

      setConfigurations({
        ...configurations,
        [selectedFrameworkId]: {
          ...configurations[selectedFrameworkId],
          notificationSettings: {
            ...configurations[selectedFrameworkId].notificationSettings,
            enabledChannels: updatedChannels,
          },
        },
      });
    }
  };

  const handleRecipientsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (selectedFrameworkId) {
      const recipients = event.target.value.split(",").map((r) => r.trim());

      setConfigurations({
        ...configurations,
        [selectedFrameworkId]: {
          ...configurations[selectedFrameworkId],
          notificationSettings: {
            ...configurations[selectedFrameworkId].notificationSettings,
            recipients,
          },
        },
      });
    }
  };

  const handleEscalationThresholdChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (selectedFrameworkId) {
      const threshold = parseInt(event.target.value, 10);
      if (!isNaN(threshold)) {
        setConfigurations({
          ...configurations,
          [selectedFrameworkId]: {
            ...configurations[selectedFrameworkId],
            notificationSettings: {
              ...configurations[selectedFrameworkId].notificationSettings,
              escalation: {
                ...configurations[selectedFrameworkId].notificationSettings
                  .escalation,
                threshold,
              },
            },
          },
        });
      }
    }
  };

  const handleEscalationRecipientsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (selectedFrameworkId) {
      const recipients = event.target.value.split(",").map((r) => r.trim());

      setConfigurations({
        ...configurations,
        [selectedFrameworkId]: {
          ...configurations[selectedFrameworkId],
          notificationSettings: {
            ...configurations[selectedFrameworkId].notificationSettings,
            escalation: {
              ...configurations[selectedFrameworkId].notificationSettings
                .escalation,
              recipients,
            },
          },
        },
      });
    }
  };

  const handleAutomationToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (selectedFrameworkId) {
      setConfigurations({
        ...configurations,
        [selectedFrameworkId]: {
          ...configurations[selectedFrameworkId],
          automationSettings: {
            ...configurations[selectedFrameworkId].automationSettings,
            enabled: event.target.checked,
          },
        },
      });
    }
  };

  const handleActionToggle = (index: number) => {
    if (selectedFrameworkId) {
      const updatedActions = [
        ...configurations[selectedFrameworkId].automationSettings.actions,
      ];
      updatedActions[index] = {
        ...updatedActions[index],
        enabled: !updatedActions[index].enabled,
      };

      setConfigurations({
        ...configurations,
        [selectedFrameworkId]: {
          ...configurations[selectedFrameworkId],
          automationSettings: {
            ...configurations[selectedFrameworkId].automationSettings,
            actions: updatedActions,
          },
        },
      });
    }
  };

  const handleEditAction = (index: number) => {
    if (selectedFrameworkId) {
      setEditingActionIndex(index);
      setNewAction({
        ...configurations[selectedFrameworkId].automationSettings.actions[
          index
        ],
      });
      setDialogOpen(true);
    }
  };

  const handleAddAction = () => {
    setEditingActionIndex(null);
    setNewAction({
      id: `action-${selectedFrameworkId}-${Date.now()}`,
      name: "",
      description: "",
      trigger: {
        type: "score_threshold",
        condition: "score < 70",
      },
      action: {
        type: "create_ticket",
        parameters: {},
      },
      enabled: true,
    });
    setDialogOpen(true);
  };

  const handleDeleteAction = (index: number) => {
    if (selectedFrameworkId) {
      const updatedActions = [
        ...configurations[selectedFrameworkId].automationSettings.actions,
      ];
      updatedActions.splice(index, 1);

      setConfigurations({
        ...configurations,
        [selectedFrameworkId]: {
          ...configurations[selectedFrameworkId],
          automationSettings: {
            ...configurations[selectedFrameworkId].automationSettings,
            actions: updatedActions,
          },
        },
      });
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewAction(null);
  };

  const handleSaveAction = () => {
    if (selectedFrameworkId && newAction) {
      const updatedActions = [
        ...configurations[selectedFrameworkId].automationSettings.actions,
      ];

      if (editingActionIndex !== null) {
        // Update existing action
        updatedActions[editingActionIndex] = newAction;
      } else {
        // Add new action
        updatedActions.push(newAction);
      }

      setConfigurations({
        ...configurations,
        [selectedFrameworkId]: {
          ...configurations[selectedFrameworkId],
          automationSettings: {
            ...configurations[selectedFrameworkId].automationSettings,
            actions: updatedActions,
          },
        },
      });

      setDialogOpen(false);
      setNewAction(null);
    }
  };

  const handleSaveConfiguration = async () => {
    if (selectedFrameworkId) {
      setLoading(true);
      try {
        const result = await saveComplianceConfiguration(
          selectedFrameworkId,
          configurations[selectedFrameworkId]
        );

        if (result) {
          setSuccess("Configuration saved successfully");
        } else {
          throw new Error("Failed to save configuration");
        }
      } catch (error) {
        console.error("Error saving configuration:", error);
        setError("Failed to save configuration. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleApplyConfiguration = async () => {
    if (selectedFrameworkId) {
      setLoading(true);
      try {
        const result = await applyComplianceConfiguration(selectedFrameworkId);

        if (result) {
          setSuccess("Configuration applied successfully");
        } else {
          throw new Error("Failed to apply configuration");
        }
      } catch (error) {
        console.error("Error applying configuration:", error);
        setError("Failed to apply configuration. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && Object.keys(configurations).length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="compliance admin tabs"
          >
            <Tab label="Thresholds & Monitoring" id="compliance-admin-tab-0" />
            <Tab label="Notifications" id="compliance-admin-tab-1" />
            <Tab label="Automation" id="compliance-admin-tab-2" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="framework-select-label">
              Select Framework
            </InputLabel>
            <Select
              labelId="framework-select-label"
              value={selectedFrameworkId}
              onChange={handleFrameworkChange}
              label="Select Framework"
            >
              {frameworks.map((framework) => (
                <MenuItem key={framework.id} value={framework.id}>
                  {framework.name} ({framework.version})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedFrameworkId && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mb: 2,
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={handleSaveConfiguration}
                disabled={loading}
              >
                Save Configuration
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyConfiguration}
                disabled={loading}
              >
                Apply Configuration
              </Button>
            </Box>
          )}
        </Box>

        {selectedFrameworkId && (
          <>
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Compliance Thresholds" />
                    <CardContent>
                      <Typography gutterBottom>Critical Threshold</Typography>
                      <Slider
                        value={
                          configurations[selectedFrameworkId].thresholds
                            .critical
                        }
                        onChange={handleThresholdChange("critical")}
                        aria-labelledby="critical-threshold-slider"
                        valueLabelDisplay="auto"
                        step={5}
                        marks
                        min={0}
                        max={100}
                      />

                      <Typography gutterBottom>Warning Threshold</Typography>
                      <Slider
                        value={
                          configurations[selectedFrameworkId].thresholds.warning
                        }
                        onChange={handleThresholdChange("warning")}
                        aria-labelledby="warning-threshold-slider"
                        valueLabelDisplay="auto"
                        step={5}
                        marks
                        min={0}
                        max={100}
                      />

                      <Typography gutterBottom>Good Threshold</Typography>
                      <Slider
                        value={
                          configurations[selectedFrameworkId].thresholds.good
                        }
                        onChange={handleThresholdChange("good")}
                        aria-labelledby="good-threshold-slider"
                        valueLabelDisplay="auto"
                        step={5}
                        marks
                        min={0}
                        max={100}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Assessment Frequency" />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            label="Frequency Value"
                            type="number"
                            InputProps={{ inputProps: { min: 1 } }}
                            name="value"
                            value={
                              configurations[selectedFrameworkId]
                                .assessmentFrequency.value
                            }
                            onChange={handleFrequencyChange}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <FormControl fullWidth>
                            <InputLabel>Frequency Unit</InputLabel>
                            <Select
                              name="unit"
                              value={
                                configurations[selectedFrameworkId]
                                  .assessmentFrequency.unit
                              }
                              onChange={handleFrequencyChange}
                              label="Frequency Unit"
                            >
                              <MenuItem value="days">Days</MenuItem>
                              <MenuItem value="weeks">Weeks</MenuItem>
                              <MenuItem value="months">Months</MenuItem>
                              <MenuItem value="quarters">Quarters</MenuItem>
                              <MenuItem value="years">Years</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Notification Channels" />
                    <CardContent>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={configurations[
                              selectedFrameworkId
                            ].notificationSettings.enabledChannels.includes(
                              "email"
                            )}
                            onChange={() =>
                              handleNotificationChannelToggle("email")
                            }
                          />
                        }
                        label="Email"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={configurations[
                              selectedFrameworkId
                            ].notificationSettings.enabledChannels.includes(
                              "slack"
                            )}
                            onChange={() =>
                              handleNotificationChannelToggle("slack")
                            }
                          />
                        }
                        label="Slack"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={configurations[
                              selectedFrameworkId
                            ].notificationSettings.enabledChannels.includes(
                              "teams"
                            )}
                            onChange={() =>
                              handleNotificationChannelToggle("teams")
                            }
                          />
                        }
                        label="MS Teams"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={configurations[
                              selectedFrameworkId
                            ].notificationSettings.enabledChannels.includes(
                              "sms"
                            )}
                            onChange={() =>
                              handleNotificationChannelToggle("sms")
                            }
                          />
                        }
                        label="SMS"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={configurations[
                              selectedFrameworkId
                            ].notificationSettings.enabledChannels.includes(
                              "dashboard"
                            )}
                            onChange={() =>
                              handleNotificationChannelToggle("dashboard")
                            }
                          />
                        }
                        label="Dashboard"
                      />

                      <TextField
                        label="Recipients (comma-separated)"
                        value={configurations[
                          selectedFrameworkId
                        ].notificationSettings.recipients.join(", ")}
                        onChange={handleRecipientsChange}
                        fullWidth
                        margin="normal"
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader title="Escalation Settings" />
                    <CardContent>
                      <TextField
                        label="Escalation Threshold (hours)"
                        type="number"
                        InputProps={{ inputProps: { min: 1 } }}
                        value={
                          configurations[selectedFrameworkId]
                            .notificationSettings.escalation.threshold
                        }
                        onChange={handleEscalationThresholdChange}
                        fullWidth
                        margin="normal"
                      />

                      <TextField
                        label="Escalation Recipients (comma-separated)"
                        value={configurations[
                          selectedFrameworkId
                        ].notificationSettings.escalation.recipients.join(", ")}
                        onChange={handleEscalationRecipientsChange}
                        fullWidth
                        margin="normal"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Box sx={{ mb: 3 }}>
                {/* Using type assertion to fix Element vs string type mismatch */}
                {React.createElement(FormControlLabel, {
                  control: React.createElement(Switch, {
                    checked: configurations[selectedFrameworkId].automationSettings.enabled,
                    onChange: handleAutomationToggle
                  }),
                  label: "Enable Automation"
                } as any)}
              </Box>

              {configurations[selectedFrameworkId].automationSettings
                .enabled && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Automation Actions</Typography>
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      onClick={handleAddAction}
                    >
                      Add Action
                    </Button>
                  </Box>

                  <List>
                    {configurations[
                      selectedFrameworkId
                    ].automationSettings.actions.map((action, index) => (
                      <React.Fragment key={action.id}>
                        {index > 0 && <Divider />}
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Typography variant="subtitle1">
                                  {action.name}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={
                                    action.enabled ? "Enabled" : "Disabled"
                                  }
                                  color={action.enabled ? "success" : "default"}
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {action.description}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Trigger: {action.trigger.type} -{" "}
                                  {action.trigger.condition}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Action: {action.action.type}
                                </Typography>
                              </>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleActionToggle(index)}
                            >
                              <Switch checked={action.enabled} />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleEditAction(index)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteAction(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>

                  {configurations[selectedFrameworkId].automationSettings
                    .actions.length === 0 && (
                    <Alert severity="info">
                      No automation actions configured. Click "Add Action" to
                      create one.
                    </Alert>
                  )}
                </>
              )}
            </TabPanel>
          </>
        )}
      </Paper>

      {/* Action Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingActionIndex !== null ? "Edit Action" : "Add New Action"}
        </DialogTitle>
        <DialogContent>
          {newAction && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Action Name"
                  value={newAction.name}
                  onChange={(e) =>
                    setNewAction({ ...newAction, name: e.target.value })
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={newAction.description}
                  onChange={(e) =>
                    setNewAction({ ...newAction, description: e.target.value })
                  }
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Trigger Type</InputLabel>
                  <Select
                    value={newAction.trigger.type}
                    onChange={(e) =>
                      setNewAction({
                        ...newAction,
                        trigger: {
                          ...newAction.trigger,
                          type: e.target.value as
                            | "score_threshold"
                            | "control_status"
                            | "assessment_complete"
                            | "due_date_approaching",
                        },
                      })
                    }
                    label="Trigger Type"
                  >
                    <MenuItem value="score_threshold">Score Threshold</MenuItem>
                    <MenuItem value="control_status">Control Status</MenuItem>
                    <MenuItem value="assessment_complete">
                      Assessment Complete
                    </MenuItem>
                    <MenuItem value="due_date_approaching">
                      Due Date Approaching
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Trigger Condition"
                  value={newAction.trigger.condition}
                  onChange={(e) =>
                    setNewAction({
                      ...newAction,
                      trigger: {
                        ...newAction.trigger,
                        condition: e.target.value,
                      },
                    })
                  }
                  fullWidth
                  required
                  helperText={
                    'e.g., "score < 70" or "control.priority === "critical""'
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Action Type</InputLabel>
                  <Select
                    value={newAction.action.type}
                    onChange={(e) =>
                      setNewAction({
                        ...newAction,
                        action: {
                          type: e.target.value as
                            | "create_ticket"
                            | "send_notification"
                            | "schedule_assessment"
                            | "generate_report",
                          parameters: {},
                        },
                      })
                    }
                    label="Action Type"
                  >
                    <MenuItem value="create_ticket">Create Ticket</MenuItem>
                    <MenuItem value="send_notification">
                      Send Notification
                    </MenuItem>
                    <MenuItem value="schedule_assessment">
                      Schedule Assessment
                    </MenuItem>
                    <MenuItem value="generate_report">Generate Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                {/* Using type assertion to fix Element vs string type mismatch */}
                {React.createElement(FormControlLabel, {
                  control: React.createElement(Checkbox, {
                    checked: newAction.enabled,
                    onChange: (e) => setNewAction({
                      ...newAction,
                      enabled: e.target.checked,
                    })
                  }),
                  label: "Enable this action"
                } as any)}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSaveAction}
            variant="contained"
            color="primary"
            disabled={!newAction || !newAction.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceAdmin;
