import React, { useState, useCallback, useEffect, useRef } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Snackbar,
  Alert,
  Fade,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  DragIndicator as DragIcon,
  Delete as DeleteIcon,
  Fullscreen as FullscreenIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useDashboardWithPersistence } from "../../hooks/dashboard/useDashboardWithPersistence";
import {
  DashboardWidget,
  WidgetType,
  WidgetSize,
} from "../../services/dashboard/dashboardService";
import { ExtendedDashboardWidget } from "../../features/dashboard/types";
import { WidgetFactory } from "./WidgetFactory";

// Configure the responsive grid layout
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * Enhanced Dashboard component with drag-and-drop functionality
 * Renders a customizable grid of widgets using react-grid-layout
 * with full persistence and real-time updates
 */
const DashboardWithDragDrop: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const fullScreenRef = useRef<HTMLDivElement>(null);

  // Dashboard state management with persistence hook
  const {
    currentDashboard,
    isLoading,
    error,
    isEditMode,
    hasUnsavedChanges,
    toggleEditMode,
    saveLayout,
    updateWidgetPositions,
    addNewWidget,
    removeWidget,
    refreshDashboard,
  } = useDashboardWithPersistence();

  // Local state for UI
  const [addWidgetAnchorEl, setAddWidgetAnchorEl] =
    useState<null | HTMLElement>(null);
  const [activeWidget, setActiveWidget] = useState<ExtendedDashboardWidget | null>(null);
  const [widgetMenuAnchorEl, setWidgetMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [newWidgetDialog, setNewWidgetDialog] = useState(false);
  const [fullScreenWidget, setFullScreenWidget] =
    useState<ExtendedDashboardWidget | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("info");
  const [isDragging, setIsDragging] = useState(false);
  const [newWidgetForm, setNewWidgetForm] = useState({
    type: WidgetType.ALERTS_SUMMARY,
    title: "",
    size: WidgetSize.MEDIUM,
  });

  // Update title when widget type changes
  useEffect(() => {
    setNewWidgetForm((prev) => ({
      ...prev,
      title: getDefaultWidgetTitle(prev.type),
    }));
  }, [newWidgetForm.type]);

  // Handle opening the "Add Widget" menu
  const handleAddWidgetClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAddWidgetAnchorEl(event.currentTarget);
  };

  // Handle closing the "Add Widget" menu
  const handleAddWidgetClose = () => {
    setAddWidgetAnchorEl(null);
  };

  // Handle opening the widget options menu
  const handleWidgetMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    widget: ExtendedDashboardWidget
  ) => {
    event.stopPropagation();
    setActiveWidget(widget);
    setWidgetMenuAnchorEl(event.currentTarget);
  };

  // Handle closing the widget options menu
  const handleWidgetMenuClose = () => {
    setWidgetMenuAnchorEl(null);
  };

  // Handle opening widget settings dialog
  const handleOpenWidgetSettings = () => {
    setWidgetMenuAnchorEl(null);
    setShowWidgetSettings(true);
  };

  // Handle removing a widget
  const handleRemoveWidget = () => {
    if (activeWidget) {
      removeWidget(activeWidget.id);
      showSnackbar("Widget removed", "info");
    }
    setWidgetMenuAnchorEl(null);
  };

  // Handle opening the new widget dialog
  const handleNewWidgetDialogOpen = (type?: WidgetType) => {
    if (type) {
      setNewWidgetForm({
        ...newWidgetForm,
        type,
        title: getDefaultWidgetTitle(type),
      });
    }
    setAddWidgetAnchorEl(null);
    setNewWidgetDialog(true);
  };

  // Handle closing the new widget dialog
  const handleNewWidgetDialogClose = () => {
    setNewWidgetDialog(false);
  };

  // Handle new widget form changes
  const handleNewWidgetFormChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setNewWidgetForm({
      ...newWidgetForm,
      [name as string]: value,
    });
  };

  // Handle adding a new widget
  const handleAddNewWidget = async () => {
    try {
      await addNewWidget(
        newWidgetForm.type,
        newWidgetForm.size,
        newWidgetForm.title
      );
      setNewWidgetDialog(false);
      showSnackbar("Widget added successfully", "success");
    } catch (error) {
      showSnackbar("Failed to add widget", "error");
    }
  };

  // Handle refreshing all widgets
  const handleRefreshDashboard = async () => {
    try {
      await refreshDashboard();
      showSnackbar("Dashboard refreshed", "success");
    } catch (error) {
      showSnackbar("Failed to refresh dashboard", "error");
    }
  };

  // Handle saving layout
  const handleSaveLayout = async () => {
    try {
      await saveLayout();
      showSnackbar("Dashboard layout saved", "success");
    } catch (error) {
      showSnackbar("Failed to save layout", "error");
    }
  };

  // Handle toggling fullscreen for a widget
  const handleFullscreenWidget = (widget: ExtendedDashboardWidget | null) => {
    setFullScreenWidget(widget);
    setWidgetMenuAnchorEl(null);
  };

  // Helper to show snackbar notifications
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle drag stop
  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Helper to get default widget title based on type
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

  // Helper for getting the minimum widget size based on type
  const getMinSize = (type: WidgetType): { w: number; h: number } => {
    switch (type) {
      case WidgetType.ACTIVITY_TIMELINE:
      case WidgetType.THREAT_MAP:
      case WidgetType.CUSTOM_CHART:
        return { w: 2, h: 2 };
      case WidgetType.LOGS_OVERVIEW:
      case WidgetType.NETWORK_STATUS:
        return { w: 2, h: 1 };
      default:
        return { w: 1, h: 1 };
    }
  };

  // Helper for getting the maximum widget size based on type
  const getMaxSize = (type: WidgetType): { w: number; h: number } => {
    switch (type) {
      case WidgetType.QUICK_ACTIONS:
        return { w: 2, h: 2 };
      case WidgetType.THREAT_MAP:
      case WidgetType.CUSTOM_CHART:
        return { w: 4, h: 3 };
      default:
        return { w: 4, h: 3 };
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
          height: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // If dashboard is not available, show error or empty state
  if (!currentDashboard) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          p: 3,
        }}
      >
        <DashboardIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          No Dashboard Available
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          paragraph
        >
          {error ||
            "We couldn't find any dashboard layouts. Create a new one to get started."}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => addNewWidget(WidgetType.ALERTS_SUMMARY)}
        >
          Create Dashboard
        </Button>
      </Box>
    );
  }

  // Convert dashboard widgets to react-grid-layout format
  const layoutItems = currentDashboard.widgets
    .filter((widget) => !widget.isHidden)
    .map((widget) => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: getMinSize(widget.type).w,
      minH: getMinSize(widget.type).h,
      maxW: getMaxSize(widget.type).w,
      maxH: getMaxSize(widget.type).h,
      static: !isEditMode,
    }));

  // Define layouts for different screen sizes
  const layouts = {
    lg: layoutItems,
    md: layoutItems.map((item) => ({ ...item, w: Math.min(item.w, 3) })),
    sm: layoutItems.map((item) => ({ ...item, w: Math.min(item.w, 2), x: 0 })),
    xs: layoutItems.map((item) => ({
      ...item,
      w: 1,
      h: Math.max(item.h, 2),
      x: 0,
    })),
  };

  return (
    <Box sx={{ p: 2, height: "100%" }}>
      {/* Dashboard header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          {currentDashboard.name || "Dashboard"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh all widgets">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshDashboard}
              size="small"
            >
              Refresh
            </Button>
          </Tooltip>

          {isEditMode ? (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveLayout}
                disabled={!hasUnsavedChanges}
              >
                Save Layout
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={toggleEditMode}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddWidgetClick}
              >
                Add Widget
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={toggleEditMode}
              >
                Edit Layout
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Dashboard edit mode indicator */}
      {isEditMode && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 2,
            borderLeft: 3,
            borderColor: "warning.main",
            bgcolor: alpha(theme.palette.warning.main, 0.05),
          }}
        >
          <Typography>
            <b>Edit Mode:</b> Drag widgets to reposition them, or resize by
            dragging the bottom-right corner.
            {hasUnsavedChanges && " Don't forget to save your changes!"}
          </Typography>
        </Paper>
      )}

      {/* Dashboard grid layout */}
      <Box sx={{ mt: 2 }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 4, md: 3, sm: 2, xs: 1 }}
          rowHeight={200}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={(currentLayout) =>
            updateWidgetPositions(currentLayout)
          }
          onDragStart={handleDragStart}
          onDragStop={handleDragStop}
          draggableHandle=".drag-handle"
          useCSSTransforms={true}
        >
          {currentDashboard.widgets
            .filter((widget) => !widget.isHidden)
            .map((widget) => (
              <Box key={widget.id} data-grid={{ x: 0, y: 0, w: 1, h: 1 }}>
                <Paper
                  elevation={2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    ...(isEditMode && {
                      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                      "&:hover": {
                        boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                      },
                    }),
                    ...(isDragging && {
                      opacity: 0.8,
                      transform: "scale(1.02)",
                    }),
                  }}
                >
                  {/* Widget header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2,
                      py: 1,
                      borderBottom: 1,
                      borderColor: "divider",
                      bgcolor: isEditMode
                        ? alpha(theme.palette.primary.main, 0.05)
                        : "background.paper",
                      cursor: isEditMode ? "move" : "default",
                    }}
                    className="drag-handle"
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {isEditMode && (
                        <DragIcon
                          fontSize="small"
                          sx={{ mr: 1, color: theme.palette.text.secondary }}
                        />
                      )}
                      <Typography
                        variant="subtitle1"
                        fontWeight="medium"
                        noWrap
                      >
                        {widget.title}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        aria-label="fullscreen widget"
                        onClick={() => handleFullscreenWidget(widget)}
                      >
                        <FullscreenIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="widget options"
                        onClick={(e) => handleWidgetMenuOpen(e, widget)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Widget content */}
                  <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
                    <WidgetFactory widget={widget} />
                  </Box>
                </Paper>
              </Box>
            ))}
        </ResponsiveGridLayout>
      </Box>

      {/* Add Widget Menu */}
      <Menu
        anchorEl={addWidgetAnchorEl}
        open={Boolean(addWidgetAnchorEl)}
        onClose={handleAddWidgetClose}
      >
        <MenuItem
          onClick={() => handleNewWidgetDialogOpen(WidgetType.ALERTS_SUMMARY)}
        >
          Alerts Summary
        </MenuItem>
        <MenuItem
          onClick={() => handleNewWidgetDialogOpen(WidgetType.SYSTEM_HEALTH)}
        >
          System Health
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleNewWidgetDialogOpen(WidgetType.ACTIVITY_TIMELINE)
          }
        >
          Activity Timeline
        </MenuItem>
        <MenuItem
          onClick={() => handleNewWidgetDialogOpen(WidgetType.LOGS_OVERVIEW)}
        >
          Logs Overview
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleNewWidgetDialogOpen(WidgetType.COMPLIANCE_STATUS)
          }
        >
          Compliance Status
        </MenuItem>
        <MenuItem
          onClick={() => handleNewWidgetDialogOpen(WidgetType.QUICK_ACTIONS)}
        >
          Quick Actions
        </MenuItem>
        <MenuItem
          onClick={() => handleNewWidgetDialogOpen(WidgetType.THREAT_MAP)}
        >
          Threat Map
        </MenuItem>
        <MenuItem
          onClick={() => handleNewWidgetDialogOpen(WidgetType.NETWORK_STATUS)}
        >
          Network Status
        </MenuItem>
        <MenuItem
          onClick={() => handleNewWidgetDialogOpen(WidgetType.CUSTOM_CHART)}
        >
          Custom Chart
        </MenuItem>
      </Menu>

      {/* Widget Options Menu */}
      <Menu
        anchorEl={widgetMenuAnchorEl}
        open={Boolean(widgetMenuAnchorEl)}
        onClose={handleWidgetMenuClose}
      >
        <MenuItem onClick={handleOpenWidgetSettings}>
          <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={() => handleFullscreenWidget(activeWidget)}>
          <FullscreenIcon fontSize="small" sx={{ mr: 1 }} />
          Fullscreen
        </MenuItem>
        <MenuItem onClick={handleRemoveWidget}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
          Remove
        </MenuItem>
      </Menu>

      {/* Add New Widget Dialog */}
      <Dialog open={newWidgetDialog} onClose={handleNewWidgetDialogClose}>
        <DialogTitle>Add New Widget</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="widget-type-label">Widget Type</InputLabel>
            <Select
              labelId="widget-type-label"
              id="widget-type"
              name="type"
              value={newWidgetForm.type}
              label="Widget Type"
              onChange={handleNewWidgetFormChange}
            >
              <MenuItem value={WidgetType.ALERTS_SUMMARY}>
                Alerts Summary
              </MenuItem>
              <MenuItem value={WidgetType.SYSTEM_HEALTH}>
                System Health
              </MenuItem>
              <MenuItem value={WidgetType.ACTIVITY_TIMELINE}>
                Activity Timeline
              </MenuItem>
              <MenuItem value={WidgetType.LOGS_OVERVIEW}>
                Logs Overview
              </MenuItem>
              <MenuItem value={WidgetType.COMPLIANCE_STATUS}>
                Compliance Status
              </MenuItem>
              <MenuItem value={WidgetType.QUICK_ACTIONS}>
                Quick Actions
              </MenuItem>
              <MenuItem value={WidgetType.THREAT_MAP}>Threat Map</MenuItem>
              <MenuItem value={WidgetType.NETWORK_STATUS}>
                Network Status
              </MenuItem>
              <MenuItem value={WidgetType.CUSTOM_CHART}>Custom Chart</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            id="widget-title"
            name="title"
            label="Widget Title"
            type="text"
            fullWidth
            value={newWidgetForm.title}
            onChange={handleNewWidgetFormChange}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="widget-size-label">Widget Size</InputLabel>
            <Select
              labelId="widget-size-label"
              id="widget-size"
              name="size"
              value={newWidgetForm.size}
              label="Widget Size"
              onChange={handleNewWidgetFormChange}
            >
              <MenuItem value={WidgetSize.SMALL}>Small (1x1)</MenuItem>
              <MenuItem value={WidgetSize.MEDIUM}>Medium (2x1)</MenuItem>
              <MenuItem value={WidgetSize.LARGE}>Large (2x2)</MenuItem>
              <MenuItem value={WidgetSize.XLARGE}>Extra Large (4x2)</MenuItem>
            </Select>
            <FormHelperText>
              Size may be adjusted automatically based on widget type and screen
              size
            </FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewWidgetDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddNewWidget}
            disabled={!newWidgetForm.title}
          >
            Add Widget
          </Button>
        </DialogActions>
      </Dialog>

      {/* Widget Settings Dialog */}
      {activeWidget && (
        <Dialog
          open={showWidgetSettings}
          onClose={() => setShowWidgetSettings(false)}
        >
          <DialogTitle>Widget Settings: {activeWidget.title}</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              id="widget-settings-title"
              label="Widget Title"
              type="text"
              fullWidth
              defaultValue={activeWidget.title}
              // This would be connected to actual settings update in a real implementation
            />
            {/* Additional settings would be rendered based on widget type */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowWidgetSettings(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowWidgetSettings(false)}
            >
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Fullscreen Widget Dialog */}
      <Dialog
        open={!!fullScreenWidget}
        onClose={() => handleFullscreenWidget(null)}
        fullScreen
        TransitionComponent={Fade}
      >
        {fullScreenWidget && (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="h6">{fullScreenWidget.title}</Typography>
              <IconButton onClick={() => handleFullscreenWidget(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box
              ref={fullScreenRef}
              sx={{
                height: "calc(100vh - 64px)",
                p: 3,
                overflow: "auto",
              }}
            >
              <WidgetFactory widget={fullScreenWidget} />
            </Box>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
    </Box>
  );
};

export default DashboardWithDragDrop;
