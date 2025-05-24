import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  DashboardLayout,
  DashboardWidget,
  WidgetType,
  WidgetSize,
  useGetActiveDashboardQuery,
  useUpdateDashboardLayoutMutation,
  useAddWidgetMutation,
  useDeleteWidgetMutation,
  mockDefaultDashboard,
} from "../../services/dashboard/dashboardService";

/**
 * Custom hook for dashboard management
 * Handles loading dashboard data, widget manipulation, and layout persistence
 */
export const useDashboard = () => {
  // Local state for dashboard layout
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // RTK Query hooks
  const {
    data: serverLayout,
    isLoading,
    isError,
  } = useGetActiveDashboardQuery();
  const [updateDashboardLayout] = useUpdateDashboardLayoutMutation();
  const [addWidget] = useAddWidgetMutation();
  const [deleteWidget] = useDeleteWidgetMutation();

  // Load dashboard layout from server or use mock data for development
  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }

    if (isError) {
      setError("Failed to load dashboard. Using default layout.");
      setCurrentLayout(mockDefaultDashboard);
    } else if (serverLayout) {
      setCurrentLayout(serverLayout);
      setError(null);
    } else {
      // If no layout is available, use the mock default
      setCurrentLayout(mockDefaultDashboard);
    }

    setLoading(false);
  }, [serverLayout, isLoading, isError]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  // Save dashboard layout changes
  const saveLayout = useCallback(async () => {
    if (!currentLayout) return;

    setLoading(true);
    try {
      await updateDashboardLayout(currentLayout).unwrap();
      setIsEditMode(false);
      setError(null);
    } catch (err) {
      setError("Failed to save dashboard layout.");
      console.error("Save layout error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentLayout, updateDashboardLayout]);

  // Add a new widget to the dashboard
  const addNewWidget = useCallback(
    async (
      type: WidgetType,
      size: WidgetSize = WidgetSize.MEDIUM,
      title?: string
    ) => {
      if (!currentLayout) return;

      const newWidget: Partial<DashboardWidget> = {
        id: uuidv4(),
        type,
        title: title || getDefaultWidgetTitle(type),
        size,
        position: calculateWidgetPosition(currentLayout.widgets, size),
        settings: {},
      };

      try {
        if (currentLayout.id) {
          // If we have a server layout, update it
          await addWidget({
            layoutId: currentLayout.id,
            widget: newWidget,
          }).unwrap();
        } else {
          // Otherwise just update local state
          setCurrentLayout((prevLayout) => {
            if (!prevLayout) return null;
            return {
              ...prevLayout,
              widgets: [...prevLayout.widgets, newWidget as DashboardWidget],
            };
          });
        }
      } catch (err) {
        setError("Failed to add widget.");
        console.error("Add widget error:", err);
      }
    },
    [currentLayout, addWidget]
  );

  // Remove a widget from the dashboard
  const removeWidget = useCallback(
    async (widgetId: string) => {
      if (!currentLayout) return;

      try {
        if (currentLayout.id) {
          // If we have a server layout, update it
          await deleteWidget({ layoutId: currentLayout.id, widgetId }).unwrap();
        } else {
          // Otherwise just update local state
          setCurrentLayout((prevLayout) => {
            if (!prevLayout) return null;
            return {
              ...prevLayout,
              widgets: prevLayout.widgets.filter((w) => w.id !== widgetId),
            };
          });
        }
      } catch (err) {
        setError("Failed to remove widget.");
        console.error("Remove widget error:", err);
      }
    },
    [currentLayout, deleteWidget]
  );

  // Update widget positions after drag/resize
  const updateWidgetPositions = useCallback(
    (layouts: any[]) => {
      if (!currentLayout) return;

      // Convert from react-grid-layout format to our format
      const updatedWidgets = currentLayout.widgets.map((widget) => {
        const layoutItem = layouts.find((item) => item.i === widget.id);
        if (layoutItem) {
          return {
            ...widget,
            position: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            },
          };
        }
        return widget;
      });

      setCurrentLayout((prevLayout) => {
        if (!prevLayout) return null;
        return {
          ...prevLayout,
          widgets: updatedWidgets,
        };
      });
    },
    [currentLayout]
  );

  // Helper function to get default title for a widget type
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

  // Helper function to calculate position for a new widget
  const calculateWidgetPosition = (
    widgets: DashboardWidget[],
    size: WidgetSize
  ) => {
    // Default size mapping
    const sizeMap = {
      [WidgetSize.SMALL]: { w: 1, h: 1 },
      [WidgetSize.MEDIUM]: { w: 2, h: 1 },
      [WidgetSize.LARGE]: { w: 2, h: 2 },
      [WidgetSize.XLARGE]: { w: 4, h: 2 },
    };

    // If no widgets, place at the top
    if (widgets.length === 0) {
      return { x: 0, y: 0, ...sizeMap[size] };
    }

    // Find the maximum 'y + h' to place the new widget below all existing ones
    const maxY = Math.max(...widgets.map((w) => w.position.y + w.position.h));
    return { x: 0, y: maxY, ...sizeMap[size] };
  };

  return {
    dashboard: currentLayout,
    isEditMode,
    loading,
    error,
    toggleEditMode,
    saveLayout,
    addNewWidget,
    removeWidget,
    updateWidgetPositions,
  };
};

export default useDashboard;
