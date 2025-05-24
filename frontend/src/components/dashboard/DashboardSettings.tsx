import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ExtendedDashboardWidget, ExtendedDashboardLayout, UseDashboardResult } from "../../features/dashboard/types";
import { DashboardWidget, WidgetType } from "../../services/dashboard/dashboardService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
  Box,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip,
  CircularProgress,
  Paper,
  FormControl,
  FormGroup,
  Select,
  InputLabel,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ContentCopy as CloneIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Public as PublicIcon,
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useDashboard } from "../../hooks/dashboard/useDashboard";

interface DashboardSettingsProps {
  dashboardId?: string;
}

/**
 * DashboardSettings Component
 *
 * Allows users to manage dashboard settings including renaming,
 * layout management, widget visibility, and sharing options
 */
const DashboardSettings: React.FC<DashboardSettingsProps> = ({
  dashboardId: propDashboardId,
}) => {
  const navigate = useNavigate();
  const { dashboardId: routeDashboardId } = useParams<{ dashboardId: string }>();

  // Use dashboard ID from props or route parameters
  const dashboardId = propDashboardId || routeDashboardId;

  // Dashboard state and operations from custom hook
  // Use the proper type for the dashboard hook result
  const dashboardResult = useDashboard() as UseDashboardResult;
  
  // Extract the properties we need with their proper types
  const { 
    dashboard,
    loading: isLoading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error,
    loadDashboard: rawLoadDashboard,
    updateDashboard: rawUpdateDashboard,
    deleteDashboard: rawDeleteDashboard,
    cloneDashboard: rawCloneDashboard,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dashboards = [],
  } = dashboardResult;

  // Safely cast dashboard to ExtendedDashboardLayout
  const currentDashboard = dashboard as ExtendedDashboardLayout;
  
  // Create type-safe versions of the dashboard operations
  const loadDashboard = useCallback((id: string) => {
    return rawLoadDashboard(id);
  }, [rawLoadDashboard]);
  
  const updateDashboard = useCallback((dashboard: Record<string, unknown>) => {
    return rawUpdateDashboard(dashboard);
  }, [rawUpdateDashboard]);
  
  const deleteDashboard = useCallback((id: string) => {
    return rawDeleteDashboard(id);
  }, [rawDeleteDashboard]);
  
  const cloneDashboard = useCallback((id: string, newName: string) => {
    return rawCloneDashboard(id, newName);
  }, [rawCloneDashboard]);

  // Local state for form values
  const [dashboardName, setDashboardName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("info");
  const [shareLink, setShareLink] = useState("");
  const [shareUsers, setShareUsers] = useState<string[]>([]);
  const [newShareUser, setNewShareUser] = useState("");

  // Initialize form with current dashboard data
  useEffect(() => {
    if (dashboardId) {
      loadDashboard(dashboardId);
    }
  }, [dashboardId, loadDashboard]);

  // Update form when dashboard loads
  useEffect(() => {
    if (currentDashboard) {
      setDashboardName(currentDashboard.name);
      setIsDefault(currentDashboard.isDefault || false);
      setIsShared(currentDashboard.isShared || false);
      setRefreshInterval(currentDashboard.refreshInterval || 0);

      // Generate a mock share link for demonstration
      const baseUrl = window.location.origin;
      setShareLink(`${baseUrl}/shared/dashboard/${currentDashboard.id}`);

      // Set mock shared users from the ExtendedDashboardLayout type
      const sharedWith = currentDashboard.sharedWith || [];
      setShareUsers(sharedWith);
    }
  }, [currentDashboard]);

  // Handle save dashboard settings
  const handleSaveSettings = async () => {
    if (!currentDashboard) return;

    try {
      await updateDashboard({
        ...currentDashboard,
        name: dashboardName,
        isDefault,
        // These properties are now properly typed with our ExtendedDashboardLayout
        isShared,
        refreshInterval,
        sharedWith: shareUsers,
      });

      showSnackbar("Dashboard settings saved successfully", "success");
    } catch (err) {
      showSnackbar("Failed to save dashboard settings", "error");
    }
  };

  // Handle dashboard deletion
  const handleDeleteDashboard = async () => {
    if (!currentDashboard) return;

    try {
      await deleteDashboard(currentDashboard.id);
      setDeleteDialogOpen(false);
      showSnackbar("Dashboard deleted successfully", "success");

      // Navigate back to main dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setDeleteDialogOpen(false);
      showSnackbar("Failed to delete dashboard", "error");
    }
  };

  // Handle dashboard cloning
  const handleCloneDashboard = async () => {
    if (!currentDashboard) return;

    try {
      const newDashboard = await cloneDashboard(
        currentDashboard.id,
        `${dashboardName} (Copy)`
      );
      showSnackbar("Dashboard cloned successfully", "success");

      // Navigate to the new dashboard
      setTimeout(() => {
        navigate(`/dashboard/settings/${newDashboard.id}`);
      }, 1500);
    } catch (err) {
      showSnackbar("Failed to clone dashboard", "error");
    }
  };

  // Handle sharing dashboard
  const handleShareDashboard = () => {
    setIsShared(true);
    setShareDialogOpen(true);
  };

  // Handle adding a user to share with
  const handleAddShareUser = () => {
    if (newShareUser && !shareUsers.includes(newShareUser)) {
      setShareUsers([...shareUsers, newShareUser]);
      setNewShareUser("");
    }
  };

  // Handle removing a user from share list
  const handleRemoveShareUser = (user: string) => {
    setShareUsers(shareUsers.filter((u) => u !== user));
  };

  // Handle copy share link to clipboard
  const handleCopyShareLink = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        showSnackbar("Share link copied to clipboard", "success");
      })
      .catch(() => {
        showSnackbar("Failed to copy share link", "error");
      });
  };

  // Show snackbar with message
  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/dashboard");
  };

  // Handle toggling widget visibility
  const handleToggleWidgetVisibility = (widgetId: string) => {
    if (!currentDashboard || !currentDashboard.widgets) return;

    // Create a deep copy of the widgets array
    const updatedWidgets = [...currentDashboard.widgets].map((widget) => {
      if (widget.id === widgetId) {
        // Cast to ExtendedDashboardWidget to access isHidden property
        const extendedWidget = widget as ExtendedDashboardWidget;
        return {
          ...widget,
          isHidden: !extendedWidget.isHidden
        };
      }
      return widget;
    });

    updateDashboard({
      ...currentDashboard,
      widgets: updatedWidgets,
    });
  };

  // Get widget type label
  const getWidgetTypeLabel = (type: WidgetType): string => {
    switch (type) {
      case WidgetType.ALERTS_SUMMARY:
        return "Alerts Summary";
      case WidgetType.SYSTEM_HEALTH:
        return "System Health";
      case WidgetType.ACTIVITY_TIMELINE:
        return "Activity Timeline";
      default:
        return "Unknown Type";
    }
  };

  // If loading, show spinner
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          p: 3,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header section with back button and save */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          variant="outlined"
        >
          Back to Dashboard
        </Button>
        <Box>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      <Typography variant="h5" gutterBottom>Dashboard Settings</Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* Widget management section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, height: "100%" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <DashboardIcon sx={{ mr: 1 }} />
              Dashboard Widgets
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <List sx={{ width: "100%" }}>
              {currentDashboard && currentDashboard.widgets && currentDashboard.widgets.length > 0 ? (
                currentDashboard.widgets.map((widget: DashboardWidget) => (
                  <ListItem key={widget.id} divider>
                    <ListItemIcon>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={widget.title}
                      secondary={`Type: ${getWidgetTypeLabel(widget.type)}`}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip
                        title={
                          (widget as ExtendedDashboardWidget).isHidden
                            ? "Show Widget"
                            : "Hide Widget"
                        }
                      >
                        <IconButton
                          edge="end"
                          onClick={() => handleToggleWidgetVisibility(widget.id)}
                        >
                          {(widget as ExtendedDashboardWidget).isHidden ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ my: 2, textAlign: "center" }}
                >
                  No widgets in this dashboard. Add widgets from the dashboard
                  view.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* General settings section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, height: "100%" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <SettingsIcon sx={{ mr: 1 }} />
              General Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <TextField
                label="Dashboard Name"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
              />
            </FormControl>

            <FormGroup sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    color="primary"
                  />
                }
                label="Set as default dashboard"
              />
            </FormGroup>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="refresh-interval-label">Refresh Interval</InputLabel>
              <Select
                labelId="refresh-interval-label"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                label="Refresh Interval"
              >
                <MenuItem value={0}>No auto-refresh</MenuItem>
                <MenuItem value={30}>30 seconds</MenuItem>
                <MenuItem value={60}>1 minute</MenuItem>
                <MenuItem value={300}>5 minutes</MenuItem>
                <MenuItem value={600}>10 minutes</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CloneIcon />}
                onClick={handleCloneDashboard}
              >
                Clone Dashboard
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Dashboard
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Sharing Options */}
        <Grid item xs={12}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <ShareIcon sx={{ mr: 1 }} />
              Sharing Options
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FormGroup sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isShared}
                    onChange={(e) => setIsShared(e.target.checked)}
                    color="primary"
                  />
                }
                label="Share this dashboard with others"
              />
            </FormGroup>

            {isShared && (
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShareDashboard}
                sx={{ mb: 2 }}
              >
                Manage Sharing
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Dashboard</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the dashboard &quot;{dashboardName}&quot;?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteDashboard}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Dashboard</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Share Link
          </Typography>
          <Box sx={{ display: "flex", mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={shareLink}
              InputProps={{
                readOnly: true,
              }}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleCopyShareLink}
              sx={{ ml: 1 }}
            >
              Copy
            </Button>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Share with Users
          </Typography>
          <Box sx={{ display: "flex", mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Enter email or username"
              variant="outlined"
              value={newShareUser}
              onChange={(e) => setNewShareUser(e.target.value)}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleAddShareUser}
              disabled={!newShareUser}
              sx={{ ml: 1 }}
            >
              Add
            </Button>
          </Box>

          <List sx={{ width: "100%" }}>
            {shareUsers.map((user) => (
              <ListItem key={user} divider>
                <ListItemIcon>
                  <PublicIcon />
                </ListItemIcon>
                <ListItemText primary={user} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveShareUser(user)}
                  >
                    <CloseIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {shareUsers.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ my: 2, textAlign: "center" }}
            >
              No users added yet.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          <Button
            onClick={() => {
              setShareDialogOpen(false);
              handleSaveSettings();
            }}
            color="primary"
            variant="contained"
          >
            Save Sharing Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardSettings;
