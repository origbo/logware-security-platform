import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Toolbar,
  Snackbar,
  Alert,
  Paper,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  RestartAlt as ResetIcon,
} from "@mui/icons-material";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Import the custom dashboard hook for state management and persistence
import {
  useSoarDashboard,
  SoarWidgetType,
  WidgetSize,
} from "../hooks/useSoarDashboard";

// Import dialog components
import AddWidgetDialog, { AddWidgetFormData } from "./dialogs/AddWidgetDialog";

// Import widgets
import ActiveCasesWidget from "./widgets/ActiveCasesWidget";
import PlaybookPerformanceWidget from "./widgets/PlaybookPerformanceWidget";
import SOARAnalyticsWidget from "./widgets/SOARAnalyticsWidget";
import AlertToCaseWidget from "./widgets/AlertToCaseWidget";

// Configure the responsive grid layout with auto width adjustment
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * SOAR Dashboard with draggable widgets and layout persistence
 * Implements Phase 2 requirements for customizable dashboard
 */
const SoarDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Dashboard state management with custom hook
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

  // UI state
  const [addWidgetDialogOpen, setAddWidgetDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  // Handle layout changes
  const handleLayoutChange = useCallback(
    (currentLayout: Layout[], allLayouts: any) => {
      if (!isEditMode) return;

      // Get current breakpoint
      const breakpoint =
        Object.keys(allLayouts).find((key) => {
          return (
            JSON.stringify(allLayouts[key]) === JSON.stringify(currentLayout)
          );
        }) || "lg";

      updateLayout(breakpoint, currentLayout);
    },
    [isEditMode, updateLayout]
  );

  // Handle saving dashboard layout
  const handleSaveLayout = useCallback(() => {
    const success = saveDashboard();
    if (success) {
      setSnackbarMessage("Dashboard layout saved successfully");
      setSnackbarSeverity("success");
    } else {
      setSnackbarMessage("Failed to save dashboard layout");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
  }, [saveDashboard]);

  // Handle adding a new widget
  const handleAddWidget = useCallback(
    (widgetData: AddWidgetFormData) => {
      const widgetId = addWidget(widgetData);
      if (widgetId) {
        setSnackbarMessage(`${widgetData.title} widget added successfully`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    },
    [addWidget]
  );

  // Render the appropriate widget based on type
  const renderWidget = useCallback(
    (widgetId: string, widgetType: SoarWidgetType) => {
      switch (widgetType) {
        case SoarWidgetType.ACTIVE_CASES:
          return <ActiveCasesWidget />;
        case SoarWidgetType.PLAYBOOK_PERFORMANCE:
          return <PlaybookPerformanceWidget />;
        case SoarWidgetType.SOAR_ANALYTICS:
          return <SOARAnalyticsWidget />;
        case SoarWidgetType.ALERT_TO_CASE:
          return <AlertToCaseWidget />;
        default:
          return (
            <Paper
              elevation={1}
              sx={{
                height: "100%",
                p: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Widget type {widgetType} not implemented yet
              </Typography>
            </Paper>
          );
      }
    },
    []
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          SOAR Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Security Orchestration, Automation, and Response metrics and key
          performance indicators
        </Typography>
      </Box>

      {/* Dashboard Toolbar */}
      <Toolbar
        variant="dense"
        disableGutters
        sx={{
          mb: 2,
          display: "flex",
          gap: 1,
          p: 1,
          borderRadius: 1,
          bgcolor: "background.paper",
          boxShadow: 1,
        }}
      >
        <Button
          size="small"
          startIcon={isEditMode ? <SaveIcon /> : <EditIcon />}
          variant={isEditMode ? "contained" : "outlined"}
          color={isEditMode ? "primary" : "inherit"}
          onClick={toggleEditMode}
        >
          {isEditMode ? "Done Editing" : "Edit Layout"}
        </Button>

        {isEditMode && (
          <>
            <Button
              size="small"
              startIcon={<SaveIcon />}
              variant="outlined"
              color="success"
              disabled={!hasUnsavedChanges}
              onClick={handleSaveLayout}
            >
              Save Layout
            </Button>

            <Button
              size="small"
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() => setAddWidgetDialogOpen(true)}
            >
              Add Widget
            </Button>

            <Button
              size="small"
              startIcon={<ResetIcon />}
              variant="outlined"
              color="warning"
              onClick={resetDashboard}
            >
              Reset
            </Button>
          </>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ ml: "auto", alignSelf: "center" }}
        >
          {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
          {dashboardState.lastSaved &&
            !hasUnsavedChanges &&
            ` • Last saved: ${new Date(
              dashboardState.lastSaved
            ).toLocaleString()}`}
        </Typography>
      </Toolbar>

      {/* Dashboard Grid */}
      <Box sx={{ mt: 2 }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={dashboardState.layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 1 }}
          rowHeight={60}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          margin={[16, 16]}
        >
          {dashboardState.widgets.map((widget) => (
            <div key={widget.id} data-grid={widget.layout}>
              <Box
                sx={{
                  height: "100%",
                  position: "relative",
                  "&:hover .widget-controls": {
                    display: isEditMode ? "flex" : "none",
                  },
                }}
              >
                {/* The actual widget content */}
                {renderWidget(widget.id, widget.type)}

                {/* Widget controls overlay for edit mode */}
                {isEditMode && (
                  <Box
                    className="widget-controls"
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      display: "none",
                      alignItems: "center",
                      gap: 0.5,
                      p: 1,
                      zIndex: 10,
                      bgcolor: "rgba(0,0,0,0.7)",
                      borderRadius: "0 0 0 4px",
                    }}
                  >
                    <Tooltip title="Remove Widget">
                      <Button
                        size="small"
                        color="error"
                        variant="contained"
                        onClick={() => removeWidget(widget.id)}
                      >
                        Remove
                      </Button>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </div>
          ))}
        </ResponsiveGridLayout>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Add Widget Dialog */}
      <AddWidgetDialog
        open={addWidgetDialogOpen}
        onClose={() => setAddWidgetDialogOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </Box>
  );
};

export default SoarDashboard;
