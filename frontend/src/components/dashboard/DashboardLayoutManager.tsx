import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
// @ts-ignore - Temporarily ignore react-grid-layout module resolution issues
import { Responsive, WidthProvider, Layout, Layouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";

// Import all available widgets
import GDPRComplianceWidget from "./widgets/GDPRComplianceWidget";
import ThreatIntelSummaryWidget from "./widgets/ThreatIntelSummaryWidget";
import PlaybookStatusWidget from "./widgets/PlaybookStatusWidget";
import RecentCasesWidget from "./widgets/RecentCasesWidget";
import SecurityAlertsSummaryWidget from "./widgets/SecurityAlertsSummaryWidget";
import VulnerabilityManagementWidget from "./widgets/VulnerabilityManagementWidget";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import useAuth from "../../features/auth/hooks/useAuth";
import {
  DashboardWidget,
  WidgetType,
  WidgetSize,
} from "../../services/dashboard/dashboardService";
import { useUserPreferences } from "../../services/userPreferences/userPreferencesService";
import { useNotification } from "../common/NotificationProvider";
import ErrorBoundary from "../common/ErrorBoundary";

// Make the grid responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget component mapping - key is the widget ID prefix
const widgetComponents: Record<string, React.FC<any>> = {
  "gdpr-compliance": GDPRComplianceWidget,
  "threat-intel": ThreatIntelSummaryWidget,
  "playbook-status": PlaybookStatusWidget,
  "recent-cases": RecentCasesWidget,
  "security-alerts": SecurityAlertsSummaryWidget,
  "vulnerability-management": VulnerabilityManagementWidget,
};

// Extended widget interface for our dashboard layout needs
interface ExtendedDashboardWidget extends Omit<DashboardWidget, "position"> {
  description: string;
  minW: number;
  minH: number;
  defaultW: number;
  defaultH: number;
}

// Available widget definitions
const availableWidgets: ExtendedDashboardWidget[] = [
  {
    id: "gdpr-compliance",
    title: "GDPR Compliance",
    type: WidgetType.GDPR_COMPLIANCE,
    description: "Shows GDPR compliance metrics and status",
    size: WidgetSize.LARGE,
    minW: 3,
    minH: 2,
    defaultW: 4,
    defaultH: 3,
  },
  {
    id: "threat-intel",
    title: "Threat Intelligence",
    type: WidgetType.THREAT_INTEL_SUMMARY,
    description: "Displays threat intelligence summary and indicators",
    size: WidgetSize.LARGE,
    minW: 3,
    minH: 2,
    defaultW: 4,
    defaultH: 3,
  },
  {
    id: "playbook-status",
    title: "Playbook Status",
    type: WidgetType.PLAYBOOK_STATUS,
    description: "Shows status of active playbooks and automations",
    size: WidgetSize.LARGE,
    minW: 3,
    minH: 2,
    defaultW: 4,
    defaultH: 3,
  },
  {
    id: "recent-cases",
    title: "Recent Cases",
    type: WidgetType.RECENT_CASES,
    description: "Lists recent security cases and incidents",
    size: WidgetSize.LARGE,
    minW: 3,
    minH: 2,
    defaultW: 4,
    defaultH: 3,
  },
  {
    id: "security-alerts",
    title: "Security Alerts Summary",
    type: WidgetType.ALERTS_SUMMARY,
    description: "Summarizes recent security alerts and notifications",
    size: WidgetSize.LARGE,
    minW: 3,
    minH: 2,
    defaultW: 4,
    defaultH: 3,
  },
  {
    id: "vulnerability-management",
    title: "Vulnerability Management",
    type: WidgetType.COMPLIANCE_STATUS, // Using compliance status as a close match since there's no vulnerability specific type
    description: "Displays vulnerability metrics and critical issues",
    size: WidgetSize.LARGE,
    minW: 3,
    minH: 2,
    defaultW: 6,
    defaultH: 3,
  },
];

// Default layout
const defaultLayouts: Layouts = {
  lg: [
    { i: "security-alerts", x: 0, y: 0, w: 6, h: 4 },
    { i: "vulnerability-management", x: 6, y: 0, w: 6, h: 4 },
    { i: "recent-cases", x: 0, y: 4, w: 6, h: 4 },
    { i: "playbook-status", x: 6, y: 4, w: 6, h: 4 },
    { i: "gdpr-compliance", x: 0, y: 8, w: 6, h: 4 },
    { i: "threat-intel", x: 6, y: 8, w: 6, h: 4 },
  ],
  md: [
    { i: "security-alerts", x: 0, y: 0, w: 5, h: 4 },
    { i: "vulnerability-management", x: 5, y: 0, w: 5, h: 4 },
    { i: "recent-cases", x: 0, y: 4, w: 5, h: 4 },
    { i: "playbook-status", x: 5, y: 4, w: 5, h: 4 },
    { i: "gdpr-compliance", x: 0, y: 8, w: 5, h: 4 },
    { i: "threat-intel", x: 5, y: 8, w: 5, h: 4 },
  ],
  sm: [
    { i: "security-alerts", x: 0, y: 0, w: 6, h: 4 },
    { i: "vulnerability-management", x: 0, y: 4, w: 6, h: 4 },
    { i: "recent-cases", x: 0, y: 8, w: 6, h: 4 },
    { i: "playbook-status", x: 0, y: 12, w: 6, h: 4 },
    { i: "gdpr-compliance", x: 0, y: 16, w: 6, h: 4 },
    { i: "threat-intel", x: 0, y: 20, w: 6, h: 4 },
  ],
};

interface DashboardLayoutManagerProps {
  onLayoutChange?: (layout: Layout[], allLayouts: Layouts) => void;
}

/**
 * DashboardLayoutManager Component
 *
 * Manages the dashboard layout with customizable widgets
 */
const DashboardLayoutManager: React.FC<DashboardLayoutManagerProps> = ({
  onLayoutChange,
}) => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { showNotification } = useNotification();
  const {
    preferences,
    isLoading: isPreferencesLoading,
    updateDashboard,
  } = useUserPreferences();
  const [layouts, setLayouts] = useState(defaultLayouts);
  const [activeWidgets, setActiveWidgets] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
  const [widgetMenuAnchor, setWidgetMenuAnchor] = useState<{
    element: HTMLElement | null;
    widgetId: string | null;
  }>({ element: null, widgetId: null });
  const [isLayoutLoading, setIsLayoutLoading] = useState(true);
  const dispatch = useDispatch();

  // Fetch user layout preferences on mount
  useEffect(() => {
    if (isAuthenticated && !isPreferencesLoading && preferences) {
      try {
        // Load saved preferences from the server
        if (preferences.dashboard && preferences.dashboard.layouts) {
          setLayouts(preferences.dashboard.layouts);
        } else {
          setLayouts(defaultLayouts);
        }

        if (preferences.dashboard && preferences.dashboard.activeWidgets) {
          setActiveWidgets(preferences.dashboard.activeWidgets);
        } else {
          // Default to all widgets if nothing saved
          setActiveWidgets(availableWidgets.map((widget) => widget.id));
        }
      } catch (error) {
        console.error("Error loading saved layout:", error);
        setLayouts(defaultLayouts);
        setActiveWidgets(availableWidgets.map((widget) => widget.id));
      } finally {
        setIsLayoutLoading(false);
      }
    } else if (!isPreferencesLoading) {
      // Set defaults if not authenticated or no preferences
      setLayouts(defaultLayouts);
      setActiveWidgets(availableWidgets.map((widget) => widget.id));
      setIsLayoutLoading(false);
    }
  }, [isAuthenticated, isPreferencesLoading, preferences]);

  // Handle layout changes
  const handleLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);

    if (onLayoutChange) {
      onLayoutChange(currentLayout, allLayouts);
    }
  };

  // Save layout to server
  const saveLayout = async () => {
    if (isAuthenticated) {
      try {
        // Save to the server using userPreferences API
        await updateDashboard({
          layouts,
          activeWidgets,
          defaultDashboardId:
            preferences?.dashboard?.defaultDashboardId || "default-dashboard",
        });

        // As fallback, also save to localStorage
        localStorage.setItem("dashboard_layout", JSON.stringify(layouts));
        localStorage.setItem(
          "dashboard_active_widgets",
          JSON.stringify(activeWidgets)
        );

        showNotification("Dashboard layout saved successfully", "success");
      } catch (error) {
        console.error("Error saving layout:", error);
        showNotification("Failed to save dashboard layout", "error");
      }
    }
  };

  // Reset to default layout
  const resetLayout = () => {
    setLayouts(defaultLayouts);
    setActiveWidgets(availableWidgets.map((widget) => widget.id));
    showNotification("Dashboard layout reset to default", "info");
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);

    if (editMode) {
      // Save layout when exiting edit mode
      saveLayout();
    }
  };

  // Open add widget menu
  const handleAddWidgetClick = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  // Close add widget menu
  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
  };

  // Open widget menu
  const handleWidgetMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    widgetId: string
  ) => {
    event.stopPropagation();
    setWidgetMenuAnchor({
      element: event.currentTarget,
      widgetId,
    });
  };

  // Close widget menu
  const handleWidgetMenuClose = () => {
    setWidgetMenuAnchor({
      element: null,
      widgetId: null,
    });
  };

  // Add widget to dashboard
  const addWidget = (widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      setActiveWidgets([...activeWidgets, widgetId]);

      // Add to layout
      const widget = availableWidgets.find((w) => w.id === widgetId);

      if (widget) {
        const newLayouts = { ...layouts };

        // Add to all breakpoints
        for (const breakpoint in newLayouts) {
          if (Object.prototype.hasOwnProperty.call(newLayouts, breakpoint)) {
            const layout = newLayouts[breakpoint as keyof Layouts];

            // Find position for new widget
            let maxY = 0;
            layout.forEach((item: Layout) => {
              const itemBottom = item.y + item.h;
              if (itemBottom > maxY) maxY = itemBottom;
            });

            // Add new widget at the bottom
            layout.push({
              i: widgetId,
              x: 0,
              y: maxY,
              w: widget.defaultW || 4,
              h: widget.defaultH || 3,
              minW: widget.minW,
              minH: widget.minH,
            });
          }
        }

        setLayouts(newLayouts);
      }
    }

    handleAddMenuClose();
  };

  // Remove widget from dashboard
  const removeWidget = (widgetId: string) => {
    setActiveWidgets(activeWidgets.filter((id) => id !== widgetId));

    // Remove from layout
    const newLayouts = { ...layouts };

    for (const breakpoint in newLayouts) {
      if (Object.prototype.hasOwnProperty.call(newLayouts, breakpoint)) {
        newLayouts[breakpoint as keyof Layouts] = newLayouts[
          breakpoint as keyof Layouts
        ].filter((layout: Layout) => layout.i !== widgetId);
      }
    }

    setLayouts(newLayouts);
    handleWidgetMenuClose();
  };

  // Refresh widget data
  const refreshWidget = (widgetId: string) => {
    // In a real implementation, this would trigger a data refresh for the specific widget
    showNotification(`Refreshing ${widgetId} data...`, "info");
    handleWidgetMenuClose();
  };

  // Check if a widget is available to add
  const isWidgetAvailable = (widgetId: string) => {
    return !activeWidgets.includes(widgetId);
  };

  if (isLayoutLoading || isPreferencesLoading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography variant="h6">Loading dashboard layout...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Dashboard Controls */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Dashboard</Typography>

        <Box>
          <Button
            variant={editMode ? "contained" : "outlined"}
            startIcon={<SettingsIcon />}
            onClick={toggleEditMode}
            sx={{ mr: 1 }}
          >
            {editMode ? "Save Layout" : "Edit Layout"}
          </Button>

          {editMode && (
            <>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddWidgetClick}
                sx={{ mr: 1 }}
              >
                Add Widget
              </Button>

              <Button variant="outlined" color="warning" onClick={resetLayout}>
                Reset
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Dashboard Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={editMode}
        isResizable={editMode}
        compactType="vertical"
      >
        {activeWidgets.map((widgetId) => {
          const widget = availableWidgets.find((w) => w.id === widgetId);
          const WidgetComponent = widgetComponents[widgetId];

          if (!widget || !WidgetComponent) return null;

          return (
            <Paper
              key={widgetId}
              sx={{
                height: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: editMode
                  ? `2px dashed ${theme.palette.divider}`
                  : "none",
              }}
            >
              {/* Widget Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(0,0,0,0.2)"
                      : "rgba(0,0,0,0.03)",
                }}
              >
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {widget.title}
                </Typography>

                <IconButton
                  size="small"
                  onClick={(e) => handleWidgetMenuClick(e, widgetId)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>

                {editMode && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeWidget(widgetId)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              {/* Widget Content */}
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <ErrorBoundary>
                  <WidgetComponent data={{}} widget={widget} />
                </ErrorBoundary>
              </Box>
            </Paper>
          );
        })}
      </ResponsiveGridLayout>

      {/* Add Widget Menu */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleAddMenuClose}
      >
        {availableWidgets.map((widget) => (
          <MenuItem
            key={widget.id}
            onClick={() => addWidget(widget.id)}
            disabled={!isWidgetAvailable(widget.id)}
          >
            {widget.title}
          </MenuItem>
        ))}
      </Menu>

      {/* Widget Action Menu */}
      <Menu
        anchorEl={widgetMenuAnchor.element}
        open={Boolean(widgetMenuAnchor.element)}
        onClose={handleWidgetMenuClose}
      >
        <MenuItem
          onClick={() =>
            widgetMenuAnchor.widgetId &&
            refreshWidget(widgetMenuAnchor.widgetId)
          }
        >
          <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
          Refresh
        </MenuItem>
        <MenuItem
          onClick={() =>
            widgetMenuAnchor.widgetId && removeWidget(widgetMenuAnchor.widgetId)
          }
        >
          <CloseIcon fontSize="small" sx={{ mr: 1 }} />
          Remove
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DashboardLayoutManager;
