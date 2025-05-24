/**
 * Anomaly Detection Rules
 *
 * Component for managing ML-based anomaly detection rules
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import {
  useGetDetectionRulesQuery,
  useCreateDetectionRuleMutation,
  useUpdateDetectionRuleMutation,
  useDeleteDetectionRuleMutation,
  useEnableDetectionRuleMutation,
} from "../../services/anomalyDetectionService";
import {
  AnomalyType,
  AnomalySeverity,
  DetectionRule,
} from "../../types/anomalyTypes";

const AnomalyDetectionRules: React.FC = () => {
  const theme = useTheme();

  // Query for fetching rules
  const {
    data: rules = [],
    isLoading,
    error,
    refetch,
  } = useGetDetectionRulesQuery();

  // Mutations for rule management
  const [createRule, { isLoading: isCreating }] =
    useCreateDetectionRuleMutation();
  const [updateRule, { isLoading: isUpdating }] =
    useUpdateDetectionRuleMutation();
  const [deleteRule, { isLoading: isDeleting }] =
    useDeleteDetectionRuleMutation();
  const [enableRule, { isLoading: isToggling }] =
    useEnableDetectionRuleMutation();

  // State for rule form
  const [openRuleDialog, setOpenRuleDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRule, setCurrentRule] = useState<DetectionRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    description: "",
    type: "",
    severity: "",
    threshold: 75,
    enabled: true,
    sources: [] as string[],
    parameters: {} as Record<string, any>,
  });

  // State for delete confirmation
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<DetectionRule | null>(null);

  // Filter state
  const [filter, setFilter] = useState("");

  // Handle rule form open
  const handleOpenRuleForm = (rule?: DetectionRule) => {
    if (rule) {
      // Edit existing rule
      setEditMode(true);
      setCurrentRule(rule);
      setRuleForm({
        name: rule.name,
        description: rule.description,
        type: rule.type,
        severity: rule.severity,
        threshold: rule.threshold,
        enabled: rule.enabled,
        sources: rule.sources || [],
        parameters: rule.parameters || {},
      });
    } else {
      // Create new rule
      setEditMode(false);
      setCurrentRule(null);
      setRuleForm({
        name: "",
        description: "",
        type: "",
        severity: "",
        threshold: 75,
        enabled: true,
        sources: [],
        parameters: {},
      });
    }
    setOpenRuleDialog(true);
  };

  // Handle rule form close
  const handleCloseRuleForm = () => {
    setOpenRuleDialog(false);
  };

  // Handle rule form change
  const handleRuleFormChange = (name: string, value: any) => {
    setRuleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle source change
  const handleSourceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRuleForm((prev) => ({
      ...prev,
      sources: event.target.value as string[],
    }));
  };

  // Handle parameter change
  const handleParameterChange = (key: string, value: any) => {
    setRuleForm((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value,
      },
    }));
  };

  // Handle rule save
  const handleSaveRule = async () => {
    try {
      if (editMode && currentRule) {
        // Update existing rule
        await updateRule({
          id: currentRule.id,
          ...ruleForm,
        }).unwrap();
      } else {
        // Create new rule
        await createRule(ruleForm).unwrap();
      }

      // Close dialog and refetch
      setOpenRuleDialog(false);
      refetch();
    } catch (error) {
      console.error("Failed to save rule:", error);
    }
  };

  // Handle rule enable/disable toggle
  const handleToggleRule = async (rule: DetectionRule) => {
    try {
      await enableRule({
        id: rule.id,
        enabled: !rule.enabled,
      }).unwrap();

      // Refetch rules
      refetch();
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    }
  };

  // Handle rule deletion
  const handleOpenDeleteDialog = (rule: DetectionRule) => {
    setRuleToDelete(rule);
    setOpenDeleteDialog(true);
  };

  // Confirm rule deletion
  const handleConfirmDelete = async () => {
    if (ruleToDelete) {
      try {
        await deleteRule(ruleToDelete.id).unwrap();

        // Close dialog and refetch
        setOpenDeleteDialog(false);
        setRuleToDelete(null);
        refetch();
      } catch (error) {
        console.error("Failed to delete rule:", error);
      }
    }
  };

  // Filter rules
  const filteredRules = rules.filter(
    (rule) =>
      filter === "" ||
      rule.name.toLowerCase().includes(filter.toLowerCase()) ||
      rule.description.toLowerCase().includes(filter.toLowerCase()) ||
      rule.type.toLowerCase().includes(filter.toLowerCase())
  );

  // Get source options
  const sourceOptions = [
    "Authentication Logs",
    "Network Traffic",
    "Firewall Logs",
    "Database Access Logs",
    "API Access Logs",
    "Cloud Resource Logs",
    "System Logs",
    "Application Logs",
  ];

  // Get parameter fields based on type
  const getParameterFields = () => {
    switch (ruleForm.type) {
      case "AUTHENTICATION":
        return (
          <>
            <TextField
              label="Failed Attempts Threshold"
              type="number"
              fullWidth
              margin="normal"
              value={ruleForm.parameters.failedAttemptsThreshold || ""}
              onChange={(e) =>
                handleParameterChange(
                  "failedAttemptsThreshold",
                  parseInt(e.target.value)
                )
              }
            />
            <TextField
              label="Time Window (minutes)"
              type="number"
              fullWidth
              margin="normal"
              value={ruleForm.parameters.timeWindowMinutes || ""}
              onChange={(e) =>
                handleParameterChange(
                  "timeWindowMinutes",
                  parseInt(e.target.value)
                )
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={
                    ruleForm.parameters.detectGeoImpossibleTravel || false
                  }
                  onChange={(e) =>
                    handleParameterChange(
                      "detectGeoImpossibleTravel",
                      e.target.checked
                    )
                  }
                  color="primary"
                />
              }
              label="Detect Geo-Impossible Travel"
            />
          </>
        );
      case "NETWORK":
        return (
          <>
            <TextField
              label="Connection Rate Threshold"
              type="number"
              fullWidth
              margin="normal"
              value={ruleForm.parameters.connectionRateThreshold || ""}
              onChange={(e) =>
                handleParameterChange(
                  "connectionRateThreshold",
                  parseInt(e.target.value)
                )
              }
            />
            <TextField
              label="Data Transfer Threshold (MB)"
              type="number"
              fullWidth
              margin="normal"
              value={ruleForm.parameters.dataTransferThresholdMB || ""}
              onChange={(e) =>
                handleParameterChange(
                  "dataTransferThresholdMB",
                  parseInt(e.target.value)
                )
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={ruleForm.parameters.detectPortScanning || false}
                  onChange={(e) =>
                    handleParameterChange(
                      "detectPortScanning",
                      e.target.checked
                    )
                  }
                  color="primary"
                />
              }
              label="Detect Port Scanning"
            />
          </>
        );
      case "DATA_ACCESS":
        return (
          <>
            <TextField
              label="Access Count Threshold"
              type="number"
              fullWidth
              margin="normal"
              value={ruleForm.parameters.accessCountThreshold || ""}
              onChange={(e) =>
                handleParameterChange(
                  "accessCountThreshold",
                  parseInt(e.target.value)
                )
              }
            />
            <TextField
              label="Sensitive Data Types (comma separated)"
              fullWidth
              margin="normal"
              value={ruleForm.parameters.sensitiveDataTypes || ""}
              onChange={(e) =>
                handleParameterChange("sensitiveDataTypes", e.target.value)
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={ruleForm.parameters.detectAfterHoursAccess || false}
                  onChange={(e) =>
                    handleParameterChange(
                      "detectAfterHoursAccess",
                      e.target.checked
                    )
                  }
                  color="primary"
                />
              }
              label="Detect After-Hours Access"
            />
          </>
        );
      case "PROCESS_EXECUTION":
        return (
          <>
            <TextField
              label="Suspicious Process Patterns (comma separated)"
              fullWidth
              margin="normal"
              value={ruleForm.parameters.suspiciousProcessPatterns || ""}
              onChange={(e) =>
                handleParameterChange(
                  "suspiciousProcessPatterns",
                  e.target.value
                )
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={
                    ruleForm.parameters.detectPrivilegeEscalation || false
                  }
                  onChange={(e) =>
                    handleParameterChange(
                      "detectPrivilegeEscalation",
                      e.target.checked
                    )
                  }
                  color="primary"
                />
              }
              label="Detect Privilege Escalation"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
          Anomaly Detection Rules
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search rules..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            size="small"
            sx={{ width: 240 }}
            InputProps={{
              startAdornment: (
                <SearchIcon
                  fontSize="small"
                  sx={{ mr: 1, color: theme.palette.text.secondary }}
                />
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenRuleForm()}
          >
            Create Rule
          </Button>
        </Stack>
      </Box>

      {/* Rules Grid */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading detection rules. Please try again.
        </Alert>
      ) : filteredRules.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            No detection rules found {filter && `matching "${filter}"`}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenRuleForm()}
            sx={{ mt: 2 }}
          >
            Create Your First Rule
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredRules.map((rule) => (
            <Grid item xs={12} md={6} lg={4} key={rule.id}>
              <Card
                variant="outlined"
                sx={{
                  position: "relative",
                  borderLeft: `4px solid ${
                    rule.severity === "CRITICAL"
                      ? theme.palette.error.main
                      : rule.severity === "HIGH"
                      ? theme.palette.warning.main
                      : rule.severity === "MEDIUM"
                      ? theme.palette.info.main
                      : theme.palette.success.main
                  }`,
                  opacity: rule.enabled ? 1 : 0.7,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <Tooltip
                    title={rule.enabled ? "Disable Rule" : "Enable Rule"}
                  >
                    <Switch
                      checked={rule.enabled}
                      onChange={() => handleToggleRule(rule)}
                      disabled={isToggling}
                      size="small"
                    />
                  </Tooltip>
                </Box>

                <CardContent sx={{ pt: 2, pb: 2 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {rule.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    {rule.description}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mt: 2, mb: 2 }}>
                    <Chip
                      label={rule.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={rule.severity}
                      size="small"
                      color={
                        rule.severity === "CRITICAL"
                          ? "error"
                          : rule.severity === "HIGH"
                          ? "warning"
                          : rule.severity === "MEDIUM"
                          ? "info"
                          : "success"
                      }
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    <strong>Threshold:</strong> {rule.threshold}%
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                    noWrap
                  >
                    <strong>Sources:</strong>{" "}
                    {rule.sources?.join(", ") || "All sources"}
                  </Typography>

                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                  >
                    <Tooltip title="Edit Rule">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenRuleForm(rule)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate Rule">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newRule = {
                            ...rule,
                            name: `${rule.name} (Copy)`,
                            id: undefined,
                          };
                          handleOpenRuleForm(newRule as DetectionRule);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <DuplicateIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Rule">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(rule)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Rule Dialog */}
      <Dialog
        open={openRuleDialog}
        onClose={handleCloseRuleForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Detection Rule" : "Create Detection Rule"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Rule Name"
                fullWidth
                required
                value={ruleForm.name}
                onChange={(e) => handleRuleFormChange("name", e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  value={ruleForm.type}
                  onChange={(e) => handleRuleFormChange("type", e.target.value)}
                  label="Type"
                  required
                >
                  <MenuItem value="">
                    <em>Select type</em>
                  </MenuItem>
                  {Object.values(AnomalyType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={ruleForm.description}
                onChange={(e) =>
                  handleRuleFormChange("description", e.target.value)
                }
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={ruleForm.severity}
                  onChange={(e) =>
                    handleRuleFormChange("severity", e.target.value)
                  }
                  label="Severity"
                  required
                >
                  <MenuItem value="">
                    <em>Select severity</em>
                  </MenuItem>
                  {Object.values(AnomalySeverity).map((severity) => (
                    <MenuItem key={severity} value={severity}>
                      {severity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="ML Threshold (%)"
                type="number"
                fullWidth
                required
                value={ruleForm.threshold}
                onChange={(e) =>
                  handleRuleFormChange("threshold", parseInt(e.target.value))
                }
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
                helperText="Minimum ML confidence score to trigger this rule"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Data Sources</InputLabel>
                <Select
                  multiple
                  value={ruleForm.sources}
                  onChange={handleSourceChange}
                  label="Data Sources"
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {sourceOptions.map((source) => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="textSecondary">
                Leave empty to apply to all sources
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={ruleForm.enabled}
                    onChange={(e) =>
                      handleRuleFormChange("enabled", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Enable Rule"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Rule Parameters
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {ruleForm.type ? (
                getParameterFields()
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Select a rule type to configure parameters
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRuleForm} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveRule}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={
              isCreating ||
              isUpdating ||
              !ruleForm.name ||
              !ruleForm.type ||
              !ruleForm.severity
            }
          >
            Save Rule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the rule "{ruleToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnomalyDetectionRules;
