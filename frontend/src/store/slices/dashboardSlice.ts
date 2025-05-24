import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DashboardWidget,
  DashboardLayout,
} from "../../services/dashboard/dashboardService";

// Define the dashboard state interface
export interface DashboardState {
  dashboards: DashboardLayout[];
  currentDashboardId: string | null;
  isEditMode: boolean;
  isLoading: boolean;
  error: string | null;
  sharedDashboards: DashboardLayout[];
  recentDashboards: string[]; // IDs of recently viewed dashboards
}

// Initial state
const initialState: DashboardState = {
  dashboards: [],
  currentDashboardId: null,
  isEditMode: false,
  isLoading: false,
  error: null,
  sharedDashboards: [],
  recentDashboards: [],
};

// Create the dashboard slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Set all dashboards
    setDashboards: (state, action: PayloadAction<DashboardLayout[]>) => {
      state.dashboards = action.payload;
      // If we have dashboards but no current dashboard, set the first one
      if (state.dashboards.length > 0 && !state.currentDashboardId) {
        const defaultDashboard = state.dashboards.find(
          (d: DashboardLayout) => d.isDefault
        );
        state.currentDashboardId = defaultDashboard
          ? defaultDashboard.id
          : state.dashboards[0].id;
      }
    },

    // Set the current dashboard by ID
    setCurrentDashboard: (state, action: PayloadAction<string>) => {
      state.currentDashboardId = action.payload;

      // Add to recent dashboards and maintain only the last 5
      if (!state.recentDashboards.includes(action.payload)) {
        state.recentDashboards = [
          action.payload,
          ...state.recentDashboards.slice(0, 4),
        ];
      } else {
        // Move to the front if already in the list
        state.recentDashboards = [
          action.payload,
          ...state.recentDashboards.filter(
            (id: string) => id !== action.payload
          ),
        ].slice(0, 5);
      }
    },

    // Toggle edit mode
    toggleEditMode: (state) => {
      state.isEditMode = !state.isEditMode;
    },

    // Set edit mode explicitly
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error message
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Add a new dashboard
    addDashboard: (state, action: PayloadAction<DashboardLayout>) => {
      state.dashboards.push(action.payload);
      state.currentDashboardId = action.payload.id;
    },

    // Update a dashboard
    updateDashboard: (state, action: PayloadAction<DashboardLayout>) => {
      const index = state.dashboards.findIndex(
        (dash: DashboardLayout) => dash.id === action.payload.id
      );
      if (index !== -1) {
        state.dashboards[index] = action.payload;
      }
    },

    // Delete a dashboard
    deleteDashboard: (state, action: PayloadAction<string>) => {
      state.dashboards = state.dashboards.filter(
        (dash: DashboardLayout) => dash.id !== action.payload
      );

      // If the deleted dashboard was the current one, select another
      if (action.payload === state.currentDashboardId) {
        // Try to select the default dashboard or the first available
        const defaultDash = state.dashboards.find(
          (d: DashboardLayout) => d.isDefault
        );
        state.currentDashboardId = defaultDash
          ? defaultDash.id
          : state.dashboards[0]?.id || null;
      }

      // Remove from recent dashboards
      state.recentDashboards = state.recentDashboards.filter(
        (id: string) => id !== action.payload
      );
    },

    // Add a widget to a dashboard
    addWidget: (
      state,
      action: PayloadAction<{ dashboardId: string; widget: DashboardWidget }>
    ) => {
      const { dashboardId, widget } = action.payload;
      const dashboardIndex = state.dashboards.findIndex(
        (dash) => dash.id === dashboardId
      );

      if (dashboardIndex !== -1) {
        state.dashboards[dashboardIndex].widgets.push(widget);
      }
    },

    // Update a widget
    updateWidget: (
      state,
      action: PayloadAction<{ dashboardId: string; widget: DashboardWidget }>
    ) => {
      const { dashboardId, widget } = action.payload;
      const dashboardIndex = state.dashboards.findIndex(
        (dash) => dash.id === dashboardId
      );

      if (dashboardIndex !== -1) {
        const widgetIndex = state.dashboards[dashboardIndex].widgets.findIndex(
          (w: DashboardWidget) => w.id === widget.id
        );
        if (widgetIndex !== -1) {
          state.dashboards[dashboardIndex].widgets[widgetIndex] = widget;
        }
      }
    },

    // Remove a widget
    removeWidget: (
      state,
      action: PayloadAction<{ dashboardId: string; widgetId: string }>
    ) => {
      const { dashboardId, widgetId } = action.payload;
      const dashboardIndex = state.dashboards.findIndex(
        (dash) => dash.id === dashboardId
      );

      if (dashboardIndex !== -1) {
        state.dashboards[dashboardIndex].widgets = state.dashboards[
          dashboardIndex
        ].widgets.filter((widget: DashboardWidget) => widget.id !== widgetId);
      }
    },

    // Set a dashboard as default
    setDefaultDashboard: (state, action: PayloadAction<string>) => {
      // Remove default flag from all dashboards
      state.dashboards = state.dashboards.map((dash: DashboardLayout) => ({
        ...dash,
        isDefault: dash.id === action.payload,
      }));
    },

    // Set shared dashboards
    setSharedDashboards: (state, action: PayloadAction<DashboardLayout[]>) => {
      state.sharedDashboards = action.payload;
    },

    // Add a shared dashboard
    addSharedDashboard: (state, action: PayloadAction<DashboardLayout>) => {
      state.sharedDashboards.push(action.payload);
    },

    // Remove a shared dashboard
    removeSharedDashboard: (state, action: PayloadAction<string>) => {
      state.sharedDashboards = state.sharedDashboards.filter(
        (dash: DashboardLayout) => dash.id !== action.payload
      );
    },
  },
});

// Export actions
export const {
  setDashboards,
  setCurrentDashboard,
  toggleEditMode,
  setEditMode,
  setLoading,
  setError,
  addDashboard,
  updateDashboard,
  deleteDashboard,
  addWidget,
  updateWidget,
  removeWidget,
  setDefaultDashboard,
  setSharedDashboards,
  addSharedDashboard,
  removeSharedDashboard,
} = dashboardSlice.actions;

// Export reducer
export default dashboardSlice.reducer;
