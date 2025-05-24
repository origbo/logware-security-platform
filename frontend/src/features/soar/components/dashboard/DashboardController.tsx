/**
 * DashboardController Component
 *
 * Manages the dashboard layout, widget management, and persistence.
 * Provides drag-and-drop functionality for widget reorganization and
 * customizable layouts per user.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Undo as UndoIcon,
} from "@mui/icons-material";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { v4 as uuidv4 } from "uuid";

// Import widget components
import SecurityMetricsWidget from "../widgets/SecurityMetricsWidget";
import ThreatMapWidget from "../widgets/ThreatMapWidget";
// Import the SOAR dashboard hook that we've already developed
import {
  useSoarDashboard,
  SoarWidget,
  SoarWidgetType,
  WidgetSize,
} from "../../hooks/useSoarDashboard";

// Create a responsive grid layout component
const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget type to component mapping
const WIDGET_COMPONENTS: Record<string, React.FC<any>> = {
  [SoarWidgetType.ACTIVE_CASES]: () => <div>Active Cases Widget</div>,
  [SoarWidgetType.PLAYBOOK_PERFORMANCE]: () => (
    <div>Playbook Performance Widget</div>
  ),
  [SoarWidgetType.SOAR_ANALYTICS]: () => <div>SOAR Analytics Widget</div>,
  [SoarWidgetType.ALERT_TO_CASE]: () => <div>Alert Conversion Widget</div>,
  [SoarWidgetType.NETWORK_VISUALIZATION]: () => (
    <div>Network Visualization Widget</div>
  ),
  [SoarWidgetType.CASE_TIMELINE]: () => <div>Case Timeline Widget</div>,
  security_metrics: SecurityMetricsWidget,
  threat_map: ThreatMapWidget,
};

// List of available widgets for adding to the dashboard
const AVAILABLE_WIDGETS = [
  {
    type: SoarWidgetType.ACTIVE_CASES,
    title: "Active Cases",
    description: "Shows currently active security cases and their status",
    size: WidgetSize.MEDIUM,
  },
  {
    type: SoarWidgetType.PLAYBOOK_PERFORMANCE,
    title: "Playbook Performance",
    description: "Tracks success rate and execution metrics for playbooks",
    size: WidgetSize.MEDIUM,
  },
  {
    type: SoarWidgetType.SOAR_ANALYTICS,
    title: "SOAR Analytics",
    description: "Provides analytical insights into SOAR module usage",
    size: WidgetSize.LARGE,
  },
  {
    type: SoarWidgetType.ALERT_TO_CASE,
    title: "Alert Conversion",
    description: "Shows alert to case conversion rates and metrics",
    size: WidgetSize.MEDIUM,
  },
  {
    type: SoarWidgetType.NETWORK_VISUALIZATION,
    title: "Network Visualization",
    description: "Visualizes network connections and security events",
    size: WidgetSize.XLARGE,
  },
  {
    type: SoarWidgetType.CASE_TIMELINE,
    title: "Case Timeline",
    description: "Displays timeline of case creation and resolution",
    size: WidgetSize.LARGE,
  },
  {
    type: "security_metrics" as SoarWidgetType,
    title: "Security Metrics",
    description: "Displays key security metrics and KPIs",
    size: WidgetSize.MEDIUM,
  },
  {
    type: "threat_map" as SoarWidgetType,
    title: "Threat Map",
    description: "Visualizes geographic origin of security threats",
    size: WidgetSize.LARGE,
  },
];

// Layout breakpoints
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

interface DashboardControllerProps {
  userId: string;
}

const DashboardController: React.FC<DashboardControllerProps> = ({
  userId,
}) => {
  const theme = useTheme();

  // Use the SOAR dashboard hook
  const {
    dashboardState,
    isLoading,
    isEditMode,
    hasUnsavedChanges,
    toggleEditMode,
    updateLayout,
    addWidget,
    removeWidget,
    saveDashboard,
    resetDashboard,
  } = useSoarDashboard();

  // Local state
  const [addWidgetMenuAnchorEl, setAddWidgetMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [widgetConfigOpen, setWidgetConfigOpen] = useState(false);
  const [selectedWidgetTemplate, setSelectedWidgetTemplate] =
    useState<any>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning" | "error";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Open add widget menu
  const handleAddWidgetClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAddWidgetMenuAnchorEl(event.currentTarget);
  };

  // Close add widget menu
  const handleCloseAddWidgetMenu = () => {
    setAddWidgetMenuAnchorEl(null);
  };

  // Open widget configuration dialog
  const handleOpenWidgetConfig = (widget: any) => {
    setSelectedWidgetTemplate(widget);
    setCustomTitle(widget.title);
    setWidgetConfigOpen(true);
    handleCloseAddWidgetMenu();
  };

  // Add a widget to the dashboard
  const handleConfirmAddWidget = () => {
    if (selectedWidgetTemplate) {
      // Add the widget with custom title
      const widgetId = addWidget({
        type: selectedWidgetTemplate.type,
        title: customTitle || selectedWidgetTemplate.title,
        size: selectedWidgetTemplate.size,
      });

      setWidgetConfigOpen(false);
      setSelectedWidgetTemplate(null);
      setCustomTitle("");

      // Show notification
      setNotification({
        open: true,
        message: `Added "${
          customTitle || selectedWidgetTemplate.title
        }" widget`,
        severity: "success",
      });
    }
  };

  // Remove a widget from the dashboard
  const handleRemoveWidget = (widgetId: string) => {
    const widget = dashboardState.widgets.find((w) => w.id === widgetId);
    if (widget) {
      removeWidget(widgetId);

      // Show notification
      setNotification({
        open: true,
        message: `Removed "${widget.title}" widget`,
        severity: "info",
      });
    }
  };

  // Handle layout changes
  const handleLayoutChange = (currentBreakpoint: string, layouts: any[]) => {
    updateLayout(currentBreakpoint, layouts);
  };

  // Save the dashboard
  const handleSaveDashboard = () => {
    const success = saveDashboard();

    // Show notification
    setNotification({
      open: true,
      message: success
        ? "Dashboard saved successfully"
        : "Failed to save dashboard",
      severity: success ? "success" : "error",
    });
  };

  // Reset the dashboard to defaults
  const handleResetDashboard = () => {
    resetDashboard();

    // Show notification
    setNotification({
      open: true,
      message: "Dashboard reset to defaults",
      severity: "info",
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Render individual widget based on type
  const renderWidget = (widget: SoarWidget) => {
    const WidgetComponent =
      WIDGET_COMPONENTS[widget.type] ||
      (() => <div>Unknown Widget Type: {widget.type}</div>);

    return (
      <WidgetComponent
        title={widget.title}
        widgetId={widget.id}
        config={widget.config}
        onDelete={isEditMode ? handleRemoveWidget : undefined}
      />
    );
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography variant="h6" color="textSecondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Dashboard header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <DashboardIcon sx={{ mr: 1.5 }} />
          <Typography variant="h5" component="h1">
            Security Operations Dashboard
          </Typography>
        </Box>

        <Box>
          {isEditMode && (
            <>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddWidgetClick}
                sx={{ mr: 1 }}
              >
                Add Widget
              </Button>

              <Button
                variant="outlined"
                startIcon={<UndoIcon />}
                onClick={handleResetDashboard}
                sx={{ mr: 1 }}
              >
                Reset
              </Button>

              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveDashboard}
                disabled={!hasUnsavedChanges}
                sx={{ mr: 2 }}
              >
                Save
              </Button>
            </>
          )}

          <Button
            variant={isEditMode ? "contained" : "outlined"}
            color={isEditMode ? "secondary" : "primary"}
            startIcon={<SettingsIcon />}
            onClick={toggleEditMode}
          >
            {isEditMode ? "Done Editing" : "Edit Dashboard"}
          </Button>
        </Box>
      </Box>

      {/* Dashboard content */}
      <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={dashboardState.layouts}
          breakpoints={BREAKPOINTS}
          cols={COLS}
          rowHeight={80}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          margin={[16, 16]}
        >
          {dashboardState.widgets.map((widget) => (
            <div key={widget.id}>
              <Paper sx={{ height: "100%", overflow: "hidden" }}>
                {renderWidget(widget)}
              </Paper>
            </div>
          ))}
        </ResponsiveGridLayout>
      </Box>

      {/* Add Widget Menu */}
      <Menu
        anchorEl={addWidgetMenuAnchorEl}
        open={Boolean(addWidgetMenuAnchorEl)}
        onClose={handleCloseAddWidgetMenu}
        PaperProps={{
          style: {
            maxHeight: 300,
            width: 300,
          },
        }}
      >
        {AVAILABLE_WIDGETS.map((widget) => (
          <MenuItem
            key={widget.type}
            onClick={() => handleOpenWidgetConfig(widget)}
          >
            <Box>
              <Typography variant="subtitle2">{widget.title}</Typography>
              <Typography variant="caption" color="textSecondary">
                {widget.description}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Widget Configuration Dialog */}
      <Dialog
        open={widgetConfigOpen}
        onClose={() => setWidgetConfigOpen(false)}
      >
        <DialogTitle>Configure Widget</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              id="widget-title"
              label="Widget Title"
              type="text"
              fullWidth
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWidgetConfigOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAddWidget}
            variant="contained"
            color="primary"
          >
            Add Widget
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardController;
