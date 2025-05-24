import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  useGetUserDashboardsQuery,
  useGetDashboardByIdQuery,
  useCreateDashboardMutation,
  useUpdateDashboardMutation,
  useDeleteDashboardMutation,
  useSaveDashboardLayoutMutation,
  useAddWidgetMutation,
  useDeleteWidgetMutation,
  useCloneDashboardMutation,
  useSetDefaultDashboardMutation,
} from "../../services/api/dashboardApiService";
import {
  Dashboard,
  DashboardWidget,
  WidgetType,
  WidgetSize,
  createDefaultWidget,
} from "../../services/dashboard/dashboardService";

// Layout item interface from react-grid-layout
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

/**
 * Enhanced useDashboard hook with persistence and real-time capabilities
 * Manages dashboard state with backend API integration
 */
export const useDashboardWithPersistence = () => {
  // Redux auth state
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Local state
  const [currentDashboardId, setCurrentDashboardId] = useState<string | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingLayoutChanges, setPendingLayoutChanges] = useState<
    LayoutItem[]
  >([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // RTK Query hooks
  const {
    data: dashboards = [],
    isLoading: isDashboardsLoading,
    error: dashboardsError,
    refetch: refetchDashboards,
  } = useGetUserDashboardsQuery(undefined, {
    skip: !isAuthenticated,
    // Poll for updates every 30 seconds
    pollingInterval: 30000,
  });

  const {
    data: currentDashboard,
    isLoading: isCurrentDashboardLoading,
    error: currentDashboardError,
    refetch: refetchCurrentDashboard,
  } = useGetDashboardByIdQuery(currentDashboardId || "", {
    skip: !currentDashboardId || !isAuthenticated,
  });

  // Mutation hooks
  const [createDashboard] = useCreateDashboardMutation();
  const [updateDashboard] = useUpdateDashboardMutation();
  const [deleteDashboard] = useDeleteDashboardMutation();
  const [saveDashboardLayout] = useSaveDashboardLayoutMutation();
  const [addWidget] = useAddWidgetMutation();
  const [deleteWidget] = useDeleteWidgetMutation();
  const [cloneDashboard] = useCloneDashboardMutation();
  const [setDefaultDashboard] = useSetDefaultDashboardMutation();

  // When dashboards load, set current dashboard to default or first one
  useEffect(() => {
    if (dashboards.length > 0 && !currentDashboardId) {
      // Find default dashboard or use first one
      const defaultDashboard =
        dashboards.find((d) => d.isDefault) || dashboards[0];
      setCurrentDashboardId(defaultDashboard.id);
    }
  }, [dashboards, currentDashboardId]);

  // Set current dashboard
  const setCurrentDashboard = useCallback((dashboard: Dashboard) => {
    setCurrentDashboardId(dashboard.id);
  }, []);

  // Load a specific dashboard
  const loadDashboard = useCallback(
    async (dashboardId: string) => {
      setCurrentDashboardId(dashboardId);
      await refetchCurrentDashboard();
    },
    [refetchCurrentDashboard]
  );

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    // If leaving edit mode without saving changes, discard them
    if (isEditMode && hasUnsavedChanges) {
      setPendingLayoutChanges([]);
      setHasUnsavedChanges(false);
    }
    setIsEditMode((prev) => !prev);
  }, [isEditMode, hasUnsavedChanges]);

  // Save layout changes
  const saveLayout = useCallback(async () => {
    if (
      currentDashboardId &&
      currentDashboard &&
      pendingLayoutChanges.length > 0
    ) {
      // Convert layout items to widget positions
      const updatedWidgets = currentDashboard.widgets.map((widget) => {
        const layoutItem = pendingLayoutChanges.find(
          (item) => item.i === widget.id
        );
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

      try {
        // Save changes to API
        await saveDashboardLayout({
          dashboardId: currentDashboardId,
          widgets: updatedWidgets.map((w) => ({
            id: w.id,
            position: w.position,
          })),
        }).unwrap();

        // Clear pending changes
        setPendingLayoutChanges([]);
        setHasUnsavedChanges(false);
        setIsEditMode(false);

        // Refresh current dashboard
        await refetchCurrentDashboard();
      } catch (error) {
        console.error("Failed to save dashboard layout:", error);
      }
    }
  }, [
    currentDashboardId,
    currentDashboard,
    pendingLayoutChanges,
    saveDashboardLayout,
    refetchCurrentDashboard,
  ]);

  // Update widget positions when layout changes
  const updateWidgetPositions = useCallback(
    (layout: LayoutItem[]) => {
      if (isEditMode) {
        setPendingLayoutChanges(layout);
        setHasUnsavedChanges(true);
      }
    },
    [isEditMode]
  );

  // Create a new dashboard
  const createNewDashboard = useCallback(
    async (name: string) => {
      try {
        const result = await createDashboard({
          name,
          widgets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: dashboards.length === 0, // Set as default if it's the first dashboard
          isShared: false,
          refreshInterval: 0,
          userId: user?.id || "",
        }).unwrap();

        // Refresh dashboards list
        await refetchDashboards();

        // Set as current dashboard
        setCurrentDashboardId(result.id);

        return result;
      } catch (error) {
        console.error("Failed to create dashboard:", error);
        throw error;
      }
    },
    [createDashboard, dashboards.length, refetchDashboards, user?.id]
  );

  // Add a new widget to the dashboard
  const addNewWidget = useCallback(
    async (type: WidgetType, size?: WidgetSize, title?: string) => {
      if (currentDashboardId && currentDashboard) {
        try {
          // Create widget position based on dashboard state
          const position = calculateNewWidgetPosition(
            currentDashboard.widgets,
            size
          );

          // Create new widget via API
          const newWidget = await addWidget({
            dashboardId: currentDashboardId,
            type,
            size: size || WidgetSize.MEDIUM,
            title: title || getDefaultWidgetTitle(type),
            position,
          }).unwrap();

          // Refresh current dashboard
          await refetchCurrentDashboard();

          return newWidget;
        } catch (error) {
          console.error("Failed to add widget:", error);
          throw error;
        }
      }
    },
    [currentDashboardId, currentDashboard, addWidget, refetchCurrentDashboard]
  );

  // Remove a widget from the dashboard
  const removeWidget = useCallback(
    async (widgetId: string) => {
      if (currentDashboardId) {
        try {
          await deleteWidget({
            dashboardId: currentDashboardId,
            widgetId,
          }).unwrap();

          // Refresh current dashboard
          await refetchCurrentDashboard();
        } catch (error) {
          console.error("Failed to remove widget:", error);
          throw error;
        }
      }
    },
    [currentDashboardId, deleteWidget, refetchCurrentDashboard]
  );

  // Clone a dashboard
  const cloneDashboardWithNewName = useCallback(
    async (dashboardId: string, newName: string) => {
      try {
        const result = await cloneDashboard({
          dashboardId,
          name: newName,
        }).unwrap();

        // Refresh dashboards list
        await refetchDashboards();

        return result;
      } catch (error) {
        console.error("Failed to clone dashboard:", error);
        throw error;
      }
    },
    [cloneDashboard, refetchDashboards]
  );

  // Set a dashboard as the default
  const makeDefaultDashboard = useCallback(
    async (dashboardId: string) => {
      try {
        await setDefaultDashboard(dashboardId).unwrap();

        // Refresh dashboards list
        await refetchDashboards();
      } catch (error) {
        console.error("Failed to set default dashboard:", error);
        throw error;
      }
    },
    [setDefaultDashboard, refetchDashboards]
  );

  // Delete a dashboard
  const deleteDashboardById = useCallback(
    async (dashboardId: string) => {
      try {
        await deleteDashboard(dashboardId).unwrap();

        // Refresh dashboards list
        await refetchDashboards();

        // If the deleted dashboard was the current one, select another
        if (dashboardId === currentDashboardId && dashboards.length > 1) {
          const otherDashboard = dashboards.find((d) => d.id !== dashboardId);
          if (otherDashboard) {
            setCurrentDashboardId(otherDashboard.id);
          } else {
            setCurrentDashboardId(null);
          }
        }
      } catch (error) {
        console.error("Failed to delete dashboard:", error);
        throw error;
      }
    },
    [deleteDashboard, refetchDashboards, currentDashboardId, dashboards]
  );

  // Helper function to calculate position for a new widget
  const calculateNewWidgetPosition = (
    widgets: DashboardWidget[],
    size?: WidgetSize
  ) => {
    // Default size
    const widgetSize = size || WidgetSize.MEDIUM;

    // Default width and height based on size
    let w = 1,
      h = 1;

    switch (widgetSize) {
      case WidgetSize.SMALL:
        w = 1;
        h = 1;
        break;
      case WidgetSize.MEDIUM:
        w = 2;
        h = 1;
        break;
      case WidgetSize.LARGE:
        w = 2;
        h = 2;
        break;
      case WidgetSize.XLARGE:
        w = 4;
        h = 2;
        break;
    }

    // Find the lowest available y position (simple algorithm for now)
    const maxY = widgets.reduce((max, widget) => {
      const bottom = widget.position.y + widget.position.h;
      return bottom > max ? bottom : max;
    }, 0);

    return { x: 0, y: maxY, w, h };
  };

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

  // Combine loading states
  const isLoading = isDashboardsLoading || isCurrentDashboardLoading;

  // Combine errors
  const error =
    dashboardsError || currentDashboardError
      ? "Failed to load dashboard data"
      : null;

  return {
    dashboards,
    currentDashboard,
    isLoading,
    error,
    isEditMode,
    hasUnsavedChanges,
    setCurrentDashboard,
    loadDashboard,
    toggleEditMode,
    saveLayout,
    updateWidgetPositions,
    createNewDashboard,
    addNewWidget,
    removeWidget,
    cloneDashboard: cloneDashboardWithNewName,
    deleteDashboard: deleteDashboardById,
    makeDefaultDashboard,
    refreshDashboard: refetchCurrentDashboard,
  };
};

export default useDashboardWithPersistence;
