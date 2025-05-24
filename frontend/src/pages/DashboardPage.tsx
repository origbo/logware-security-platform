import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Import new components
import DashboardLayoutManager from "../components/dashboard/DashboardLayoutManager";
import DashboardToolbar from "../components/dashboard/DashboardToolbar";
import { useDashboardWithPersistence } from "../hooks/dashboard/useDashboardWithPersistence";
import { WidgetType, WidgetSize } from "../services/dashboard/dashboardService";
import { RootState } from "../store/store";
import ErrorBoundary from "../components/common/ErrorBoundary";
import { useNotification } from "../components/common/NotificationProvider";
import errorHandler from "../utils/errorHandler";

/**
 * DashboardPage Component
 *
 * Main container for the dashboard feature that handles loading user dashboards,
 * dashboard selection, and dashboard management with enhanced features:
 * - Drag and drop widget arrangement
 * - Real-time data updates
 * - Dashboard sharing
 * - Multiple widget types
 */
const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Use enhanced dashboard hook with persistence
  const {
    dashboards,
    currentDashboard,
    isLoading,
    error,
    isEditMode,
    hasUnsavedChanges,
    setCurrentDashboard,
    toggleEditMode,
    saveLayout,
    createNewDashboard,
    addNewWidget,
    removeWidget,
    cloneDashboard,
    deleteDashboard,
    makeDefaultDashboard,
  } = useDashboardWithPersistence();

  // Use our notification system instead of local snackbar state
  const { showNotification } = useNotification();
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);
  const [newWidgetForm, setNewWidgetForm] = useState({
    type: WidgetType.ALERTS_SUMMARY,
    title: "Alerts Summary",
    size: WidgetSize.MEDIUM,
  });

  // Navigate to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle creating a new dashboard
  const handleCreateDashboard = async (name: string) => {
    try {
      await createNewDashboard(name);
      showNotification(`Dashboard "${name}" created successfully`, "success");
    } catch (error) {
      console.error("Error creating dashboard:", error);
      showNotification("Failed to create dashboard", "error");
    }
  };

  // Handle cloning a dashboard
  const handleCloneDashboard = async (dashboardId: string, newName: string) => {
    try {
      await cloneDashboard(dashboardId, newName);
      showNotification(`Dashboard cloned as "${newName}"`, "success");
    } catch (error) {
      console.error("Error cloning dashboard:", error);
      showNotification("Failed to clone dashboard", "error");
    }
  };

  // Handle deleting a dashboard
  const handleDeleteDashboard = async (dashboardId: string) => {
    try {
      await deleteDashboard(dashboardId);
      showNotification("Dashboard deleted", "success");
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      showNotification("Failed to delete dashboard", "error");
    }
  };

  // Handle setting a dashboard as default
  const handleSetDefaultDashboard = async (dashboardId: string) => {
    try {
      await makeDefaultDashboard(dashboardId);
      showNotification("Default dashboard updated", "success");
    } catch (error) {
      console.error("Error setting default dashboard:", error);
      showNotification("Failed to set default dashboard", "error");
    }
  };

  // Open add widget dialog
  const handleOpenAddWidgetDialog = () => {
    setNewWidgetForm({
      type: WidgetType.ALERTS_SUMMARY,
      title: "Alerts Summary",
      size: WidgetSize.MEDIUM,
    });
    setIsAddWidgetDialogOpen(true);
  };

  // Handle widget form change
  const handleWidgetFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWidgetForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update title based on type if it matches a default name
    if (name === "type") {
      const widgetType = value as WidgetType;
      setNewWidgetForm((prev) => ({
        ...prev,
        title: getDefaultWidgetTitle(widgetType),
      }));
    }
  };

  // Add a new widget
  const handleAddWidget = async () => {
    try {
      await addNewWidget(
        newWidgetForm.type as WidgetType,
        newWidgetForm.size as WidgetSize,
        newWidgetForm.title
      );
      setIsAddWidgetDialogOpen(false);
      showNotification("Widget added successfully", "success");
    } catch (error) {
      console.error("Error adding widget:", error);
      showNotification("Failed to add widget", "error");
    }
  };

  // Helper to get default title for widget type
  const getDefaultWidgetTitle = (type: WidgetType): string => {
    switch (type) {
      case WidgetType.ALERTS_SUMMARY:
        return "Alerts Summary";
      case WidgetType.SYSTEM_HEALTH:
        return "System Health";
      case WidgetType.ACTIVITY_TIMELINE:
        return "Activity Timeline";
      case WidgetType.LOGS_OVERVIEW:
        return "Logs Overview";
      case WidgetType.COMPLIANCE_STATUS:
        return "Compliance Status";
      case WidgetType.QUICK_ACTIONS:
        return "Quick Actions";
      case WidgetType.THREAT_MAP:
        return "Threat Map";
      case WidgetType.NETWORK_STATUS:
        return "Network Status";
      case WidgetType.CUSTOM_CHART:
        return "Custom Chart";
      default:
        return "New Widget";
    }
  };

  // If loading, display spinner
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <DashboardIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Typography>
      </Breadcrumbs>

      {/* Dashboard Toolbar */}
      <DashboardToolbar
        currentDashboard={currentDashboard}
        dashboards={dashboards}
        isEditMode={isEditMode}
        hasUnsavedChanges={hasUnsavedChanges}
        onToggleEditMode={toggleEditMode}
        onSaveLayout={saveLayout}
        onCreateNewDashboard={handleCreateDashboard}
        onSelectDashboard={setCurrentDashboard}
        onCloneDashboard={handleCloneDashboard}
        onDeleteDashboard={handleDeleteDashboard}
        onSetDefaultDashboard={handleSetDefaultDashboard}
        onAddWidget={handleOpenAddWidgetDialog}
      />

      {/* Main dashboard component */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          height: "calc(100vh - 200px)",
          minHeight: "500px",
          overflow: "hidden",
        }}
      >
        <ErrorBoundary>
          <DashboardLayoutManager
            onLayoutChange={(layout, allLayouts) => {
              // Save layout changes if needed
              if (hasUnsavedChanges) {
                saveLayout();
              }
            }}
          />
        </ErrorBoundary>
      </Paper>

      {/* Add Widget Dialog */}
      <Dialog
        open={isAddWidgetDialogOpen}
        onClose={() => setIsAddWidgetDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add New Widget</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              label="Widget Type"
              name="type"
              value={newWidgetForm.type}
              onChange={handleWidgetFormChange}
              fullWidth
              margin="normal"
              SelectProps={{
                native: true,
              }}
            >
              {Object.values(WidgetType).map((type) => (
                <option key={type} value={type}>
                  {getDefaultWidgetTitle(type as WidgetType)}
                </option>
              ))}
            </TextField>

            <TextField
              label="Widget Title"
              name="title"
              value={newWidgetForm.title}
              onChange={handleWidgetFormChange}
              fullWidth
              margin="normal"
            />

            <TextField
              select
              label="Widget Size"
              name="size"
              value={newWidgetForm.size}
              onChange={handleWidgetFormChange}
              fullWidth
              margin="normal"
              SelectProps={{
                native: true,
              }}
            >
              <option value={WidgetSize.SMALL}>Small (1x1)</option>
              <option value={WidgetSize.MEDIUM}>Medium (2x1)</option>
              <option value={WidgetSize.LARGE}>Large (2x2)</option>
              <option value={WidgetSize.XLARGE}>Extra Large (4x2)</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddWidgetDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleAddWidget}>
            Add Widget
          </Button>
        </DialogActions>
      </Dialog>

      {/* We're now using the NotificationProvider instead of local snackbar */}
    </Container>
  );
};

export default DashboardPage;
