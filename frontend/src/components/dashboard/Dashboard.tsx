import React, { useState } from "react";
// Properly importing types from react-grid-layout
import { Layout } from "react-grid-layout";
import { Responsive, WidthProvider } from "react-grid-layout";
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
  SelectChangeEvent,
  FormControl,
  InputLabel,
  FormHelperText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { useDashboard } from "../../hooks/dashboard/useDashboard";
import {
  DashboardWidget,
  WidgetType,
  WidgetSize,
} from "../../services/dashboard/dashboardService";
import { WidgetFactory } from "./WidgetFactory";
import { 
  ExtendedDashboardWidget,
  UseDashboardResult 
} from "../../features/dashboard/types";

// Configure the responsive grid layout
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * Main Dashboard component
 * Renders a customizable grid of widgets using react-grid-layout
 */
const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Dashboard state management with custom hook using our standardized types
  const {
    dashboard,
    isEditMode,
    loading,
    error,
    toggleEditMode,
    saveLayout,
    addNewWidget,
    removeWidget,
    updateWidgetPositions,
  } = useDashboard() as UseDashboardResult;

  // Local state for widget actions
  const [addWidgetAnchorEl, setAddWidgetAnchorEl] =
    useState<null | HTMLElement>(null);
  const [activeWidget, setActiveWidget] = useState<ExtendedDashboardWidget | null>(null);
  const [widgetMenuAnchorEl, setWidgetMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [newWidgetDialog, setNewWidgetDialog] = useState(false);
  const [newWidgetForm, setNewWidgetForm] = useState({
    type: WidgetType.ALERTS_SUMMARY,
    title: "",
    size: WidgetSize.MEDIUM,
  });

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

  // Handle new widget form changes for text fields
  const handleNewWidgetFormChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setNewWidgetForm({
      ...newWidgetForm,
      [name as string]: value,
    });
  };

  // Handle dropdown select changes
  const handleSelectChange = (e: SelectChangeEvent<WidgetType | WidgetSize>, fieldName: string) => {
    setNewWidgetForm({
      ...newWidgetForm,
      [fieldName]: e.target.value,
    });
  };

  // Handle adding a new widget
  const handleAddNewWidget = () => {
    addNewWidget(newWidgetForm.type, newWidgetForm.size, newWidgetForm.title);
    setNewWidgetDialog(false);
  };

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
      // New widget types
      case WidgetType.GDPR_COMPLIANCE:
        return "GDPR Compliance";
      case WidgetType.SECURITY_SCORE:
        return "Security Score";
      case WidgetType.PLAYBOOK_STATUS:
        return "Playbook Status";
      case WidgetType.CLOUD_SECURITY:
        return "Cloud Security";
      case WidgetType.THREAT_INTEL_SUMMARY:
        return "Threat Intelligence";
      case WidgetType.RECENT_CASES:
        return "Recent Cases";
      default:
        return "New Widget";
    }
  };

  // If loading, show spinner
  if (loading) {
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
  if (!dashboard) {
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
  const layoutItems = dashboard.widgets.map((widget) => ({
    i: widget.id,
    x: widget.position.x,
    y: widget.position.y,
    w: widget.position.w,
    h: widget.position.h,
    minW: getMinSize(widget.type).w,
    minH: getMinSize(widget.type).h,
    maxW: getMaxSize(widget.type).w,
    maxH: getMaxSize(widget.type).h,
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
          {dashboard.name || "Dashboard"}
        </Typography>
        <Box>
          {isEditMode ? (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={saveLayout}
                sx={{ mr: 1 }}
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
                sx={{ mr: 1 }}
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
          onLayoutChange={(currentLayout: Layout[]) => {
            if (!isEditMode) return;
            // In a real app, save the layout to state or persist to backend
            updateWidgetPositions(currentLayout);
          }}
        >
          {dashboard.widgets.map((widget) => (
            <Box key={widget.id} data-grid={{
              x: widget.position.x,
              y: widget.position.y,
              w: widget.position.w,
              h: widget.position.h,
              minW: getMinSize(widget.type).w,
              minH: getMinSize(widget.type).h,
              maxW: getMaxSize(widget.type).w,
              maxH: getMaxSize(widget.type).h,
            }}>
              {/* We need this extra div to capture events correctly with grid layout */}
              <div className="widget-inner" key={`inner-${widget.id}`}>
                <Paper
                  elevation={1}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    position: "relative",
                    // Only show if the widget is not hidden
                    ...((widget as ExtendedDashboardWidget).isHidden && {
                      display: "none"
                    }),
                    ...(isEditMode && {
                      outline: `2px dashed ${theme.palette.primary.main}`,
                      outlineOffset: -2,
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
                      bgcolor: isEditMode ? "action.hover" : "background.paper",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium" noWrap>
                      {widget.title}
                    </Typography>
                    {isEditMode && (
                      <IconButton
                        size="small"
                        aria-label="widget options"
                        onClick={(e) => handleWidgetMenuOpen(e, widget as ExtendedDashboardWidget)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {/* Widget content */}
                  <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
                    <WidgetFactory widget={widget} />
                  </Box>
                </Paper>
              </div>
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
        <MenuItem onClick={handleRemoveWidget}>
          <CloseIcon fontSize="small" sx={{ mr: 1 }} />
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
              onChange={(e) => handleSelectChange(e, "type")}
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
              {/* New widget types */}
              <MenuItem value={WidgetType.GDPR_COMPLIANCE}>
                GDPR Compliance
              </MenuItem>
              <MenuItem value={WidgetType.SECURITY_SCORE}>
                Security Score
              </MenuItem>
              <MenuItem value={WidgetType.PLAYBOOK_STATUS}>
                Playbook Status
              </MenuItem>
              <MenuItem value={WidgetType.CLOUD_SECURITY}>
                Cloud Security
              </MenuItem>
              <MenuItem value={WidgetType.THREAT_INTEL_SUMMARY}>
                Threat Intelligence
              </MenuItem>
              <MenuItem value={WidgetType.RECENT_CASES}>Recent Cases</MenuItem>
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
              onChange={(e) => handleSelectChange(e, "size")}
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
    </Box>
  );
};

// Helper function to get minimum size constraints for different widget types
function getMinSize(type: WidgetType): { w: number; h: number } {
  switch (type) {
    case WidgetType.ACTIVITY_TIMELINE:
      return { w: 2, h: 2 };
    case WidgetType.THREAT_MAP:
      return { w: 2, h: 2 };
    case WidgetType.CUSTOM_CHART:
      return { w: 2, h: 1 };
    default:
      return { w: 1, h: 1 };
  }
}

// Helper function to get maximum size constraints for different widget types
function getMaxSize(type: WidgetType): { w: number; h: number } {
  switch (type) {
    case WidgetType.QUICK_ACTIONS:
      return { w: 2, h: 2 };
    case WidgetType.THREAT_MAP:
    case WidgetType.CUSTOM_CHART:
      return { w: 4, h: 3 };
    default:
      return { w: 4, h: 3 };
  }
}

export default Dashboard;
