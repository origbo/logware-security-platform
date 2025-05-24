import { useState, useEffect, useCallback } from "react";
import { Layout } from "react-grid-layout";

// Types for SOAR dashboard widgets
export enum SoarWidgetType {
  ACTIVE_CASES = "active_cases",
  PLAYBOOK_PERFORMANCE = "playbook_performance",
  SOAR_ANALYTICS = "soar_analytics",
  ALERT_TO_CASE = "alert_to_case",
  NETWORK_VISUALIZATION = "network_visualization",
  CASE_TIMELINE = "case_timeline",
}

export enum WidgetSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  XLARGE = "xlarge",
}

export interface SoarWidget {
  id: string;
  type: SoarWidgetType;
  title: string;
  size: WidgetSize;
  layout?: Layout;
  config?: Record<string, any>;
}

export interface SoarDashboardState {
  widgets: SoarWidget[];
  layouts: { [breakpoint: string]: Layout[] };
  lastSaved?: Date;
}

const DEFAULT_WIDGETS: SoarWidget[] = [
  {
    id: "active-cases-widget",
    type: SoarWidgetType.ACTIVE_CASES,
    title: "Active Cases",
    size: WidgetSize.MEDIUM,
  },
  {
    id: "playbook-performance-widget",
    type: SoarWidgetType.PLAYBOOK_PERFORMANCE,
    title: "Playbook Performance",
    size: WidgetSize.MEDIUM,
  },
  {
    id: "soar-analytics-widget",
    type: SoarWidgetType.SOAR_ANALYTICS,
    title: "SOAR Analytics",
    size: WidgetSize.LARGE,
  },
  {
    id: "alert-to-case-widget",
    type: SoarWidgetType.ALERT_TO_CASE,
    title: "Alert Conversion",
    size: WidgetSize.MEDIUM,
  },
];

// Default layouts for responsive grid
const DEFAULT_LAYOUTS = {
  lg: [
    { i: "active-cases-widget", x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    {
      i: "playbook-performance-widget",
      x: 6,
      y: 0,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3,
    },
    { i: "soar-analytics-widget", x: 0, y: 4, w: 8, h: 6, minW: 6, minH: 4 },
    { i: "alert-to-case-widget", x: 8, y: 4, w: 4, h: 6, minW: 3, minH: 3 },
  ],
  md: [
    { i: "active-cases-widget", x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    {
      i: "playbook-performance-widget",
      x: 6,
      y: 0,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3,
    },
    { i: "soar-analytics-widget", x: 0, y: 4, w: 8, h: 6, minW: 6, minH: 4 },
    { i: "alert-to-case-widget", x: 8, y: 4, w: 4, h: 6, minW: 3, minH: 3 },
  ],
  sm: [
    { i: "active-cases-widget", x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
    {
      i: "playbook-performance-widget",
      x: 6,
      y: 0,
      w: 6,
      h: 4,
      minW: 3,
      minH: 3,
    },
    { i: "soar-analytics-widget", x: 0, y: 4, w: 12, h: 6, minW: 6, minH: 4 },
    { i: "alert-to-case-widget", x: 0, y: 10, w: 12, h: 4, minW: 3, minH: 3 },
  ],
  xs: [
    { i: "active-cases-widget", x: 0, y: 0, w: 12, h: 4, minW: 3, minH: 3 },
    {
      i: "playbook-performance-widget",
      x: 0,
      y: 4,
      w: 12,
      h: 4,
      minW: 3,
      minH: 3,
    },
    { i: "soar-analytics-widget", x: 0, y: 8, w: 12, h: 6, minW: 6, minH: 4 },
    { i: "alert-to-case-widget", x: 0, y: 14, w: 12, h: 4, minW: 3, minH: 3 },
  ],
};

const STORAGE_KEY = "soar_dashboard_state";

/**
 * Custom hook to manage SOAR dashboard state with persistence
 * Handles layout changes, adding/removing widgets, and saving user preferences
 */
export const useSoarDashboard = () => {
  // Dashboard state
  const [dashboardState, setDashboardState] = useState<SoarDashboardState>({
    widgets: DEFAULT_WIDGETS,
    layouts: DEFAULT_LAYOUTS,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load saved dashboard from localStorage
  useEffect(() => {
    const loadDashboard = () => {
      try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setDashboardState(parsedState);
        }
      } catch (error) {
        console.error("Failed to load dashboard state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  // Update layout when user drags/resizes widgets
  const updateLayout = useCallback(
    (currentBreakpoint: string, layouts: Layout[]) => {
      setDashboardState((prev) => ({
        ...prev,
        layouts: {
          ...prev.layouts,
          [currentBreakpoint]: layouts,
        },
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  // Add a new widget to the dashboard
  const addWidget = useCallback((widget: Omit<SoarWidget, "id">) => {
    const id = `widget-${Date.now()}`;
    const newWidget: SoarWidget = {
      ...widget,
      id,
    };

    setDashboardState((prev) => {
      // Create new layouts with the added widget
      const updatedLayouts = { ...prev.layouts };
      Object.keys(updatedLayouts).forEach((breakpoint) => {
        const lastItem =
          updatedLayouts[breakpoint][updatedLayouts[breakpoint].length - 1];
        const newY = lastItem ? lastItem.y + lastItem.h : 0;

        let width = 6; // Default width
        let height = 4; // Default height

        if (widget.size === WidgetSize.LARGE) {
          width = breakpoint === "xs" ? 12 : 8;
          height = 6;
        } else if (widget.size === WidgetSize.XLARGE) {
          width = 12;
          height = 8;
        } else if (widget.size === WidgetSize.SMALL) {
          width = breakpoint === "xs" ? 12 : 4;
          height = 3;
        }

        updatedLayouts[breakpoint].push({
          i: id,
          x: 0,
          y: newY,
          w: width,
          h: height,
          minW: 3,
          minH: 3,
        });
      });

      return {
        ...prev,
        widgets: [...prev.widgets, newWidget],
        layouts: updatedLayouts,
      };
    });

    setHasUnsavedChanges(true);
    return id;
  }, []);

  // Remove a widget from the dashboard
  const removeWidget = useCallback((widgetId: string) => {
    setDashboardState((prev) => {
      // Remove widget from layouts
      const updatedLayouts = { ...prev.layouts };
      Object.keys(updatedLayouts).forEach((breakpoint) => {
        updatedLayouts[breakpoint] = updatedLayouts[breakpoint].filter(
          (item) => item.i !== widgetId
        );
      });

      return {
        ...prev,
        widgets: prev.widgets.filter((w) => w.id !== widgetId),
        layouts: updatedLayouts,
      };
    });

    setHasUnsavedChanges(true);
  }, []);

  // Save dashboard state to localStorage
  const saveDashboard = useCallback(() => {
    try {
      const updatedState = {
        ...dashboardState,
        lastSaved: new Date(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      setDashboardState(updatedState);
      setHasUnsavedChanges(false);

      return true;
    } catch (error) {
      console.error("Failed to save dashboard state:", error);
      return false;
    }
  }, [dashboardState]);

  // Reset dashboard to defaults
  const resetDashboard = useCallback(() => {
    setDashboardState({
      widgets: DEFAULT_WIDGETS,
      layouts: DEFAULT_LAYOUTS,
    });
    setHasUnsavedChanges(true);
  }, []);

  return {
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
  };
};
