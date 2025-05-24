import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../store/store";
import {
  Dashboard,
  DashboardWidget,
  WidgetType,
  WidgetSize,
} from "../dashboard/dashboardService";

/**
 * API service for dashboard operations
 * Handles saving/loading dashboards, updating layouts, and managing widgets
 */
export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.REACT_APP_API_URL || "/api"}/dashboards`,
    prepareHeaders: (headers, { getState }) => {
      // Get JWT token from state
      const token = (getState() as RootState).auth.token;
      // Add authorization header if token exists
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Dashboard", "DashboardWidget"],
  endpoints: (builder) => ({
    // Get all dashboards for the current user
    getUserDashboards: builder.query<Dashboard[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Dashboard" as const, id })),
              { type: "Dashboard", id: "LIST" },
            ]
          : [{ type: "Dashboard", id: "LIST" }],
    }),

    // Get a specific dashboard by ID
    getDashboardById: builder.query<Dashboard, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Dashboard", id }],
    }),

    // Create a new dashboard
    createDashboard: builder.mutation<Dashboard, Partial<Dashboard>>({
      query: (dashboard) => ({
        url: "",
        method: "POST",
        body: dashboard,
      }),
      invalidatesTags: [{ type: "Dashboard", id: "LIST" }],
    }),

    // Update an existing dashboard
    updateDashboard: builder.mutation<
      Dashboard,
      { id: string; dashboard: Partial<Dashboard> }
    >({
      query: ({ id, dashboard }) => ({
        url: `/${id}`,
        method: "PUT",
        body: dashboard,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Dashboard", id }],
    }),

    // Delete a dashboard
    deleteDashboard: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Dashboard", id: "LIST" }],
    }),

    // Save dashboard layout (positions of widgets)
    saveDashboardLayout: builder.mutation<
      Dashboard,
      { dashboardId: string; widgets: Partial<DashboardWidget>[] }
    >({
      query: ({ dashboardId, widgets }) => ({
        url: `/${dashboardId}/layout`,
        method: "PUT",
        body: { widgets },
      }),
      invalidatesTags: (result, error, { dashboardId }) => [
        { type: "Dashboard", id: dashboardId },
      ],
    }),

    // Add a new widget to a dashboard
    addWidget: builder.mutation<
      DashboardWidget,
      {
        dashboardId: string;
        type: WidgetType;
        size?: WidgetSize;
        title?: string;
        position?: { x: number; y: number; w: number; h: number };
        settings?: Record<string, any>;
      }
    >({
      query: ({ dashboardId, ...widget }) => ({
        url: `/${dashboardId}/widgets`,
        method: "POST",
        body: widget,
      }),
      invalidatesTags: (result, error, { dashboardId }) => [
        { type: "Dashboard", id: dashboardId },
        { type: "DashboardWidget", id: "LIST" },
      ],
    }),

    // Update a widget
    updateWidget: builder.mutation<
      DashboardWidget,
      {
        dashboardId: string;
        widgetId: string;
        widget: Partial<DashboardWidget>;
      }
    >({
      query: ({ dashboardId, widgetId, widget }) => ({
        url: `/${dashboardId}/widgets/${widgetId}`,
        method: "PUT",
        body: widget,
      }),
      invalidatesTags: (result, error, { dashboardId, widgetId }) => [
        { type: "Dashboard", id: dashboardId },
        { type: "DashboardWidget", id: widgetId },
      ],
    }),

    // Delete a widget from a dashboard
    deleteWidget: builder.mutation<
      void,
      { dashboardId: string; widgetId: string }
    >({
      query: ({ dashboardId, widgetId }) => ({
        url: `/${dashboardId}/widgets/${widgetId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { dashboardId }) => [
        { type: "Dashboard", id: dashboardId },
        { type: "DashboardWidget", id: "LIST" },
      ],
    }),

    // Get widget data - fetches the actual data for a widget
    getWidgetData: builder.query<
      any,
      {
        widgetId: string;
        type: WidgetType;
        params?: Record<string, any>;
        timeRange?: string;
      }
    >({
      query: ({ widgetId, type, params, timeRange }) => ({
        url: `/widgets/${widgetId}/data`,
        method: "GET",
        params: { type, timeRange, ...params },
      }),
      // Cache data for a short time (15 seconds) since security data changes frequently
      keepUnusedDataFor: 15,
    }),

    // Share a dashboard with other users
    shareDashboard: builder.mutation<
      void,
      { dashboardId: string; users: string[]; isPublic?: boolean }
    >({
      query: ({ dashboardId, users, isPublic }) => ({
        url: `/${dashboardId}/share`,
        method: "POST",
        body: { users, isPublic },
      }),
      invalidatesTags: (result, error, { dashboardId }) => [
        { type: "Dashboard", id: dashboardId },
      ],
    }),

    // Set a dashboard as the default
    setDefaultDashboard: builder.mutation<void, string>({
      query: (dashboardId) => ({
        url: `/default/${dashboardId}`,
        method: "PUT",
      }),
      invalidatesTags: [{ type: "Dashboard", id: "LIST" }],
    }),

    // Clone an existing dashboard
    cloneDashboard: builder.mutation<
      Dashboard,
      { dashboardId: string; name: string; isDefault?: boolean }
    >({
      query: ({ dashboardId, name, isDefault }) => ({
        url: `/${dashboardId}/clone`,
        method: "POST",
        body: { name, isDefault },
      }),
      invalidatesTags: [{ type: "Dashboard", id: "LIST" }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetUserDashboardsQuery,
  useGetDashboardByIdQuery,
  useCreateDashboardMutation,
  useUpdateDashboardMutation,
  useDeleteDashboardMutation,
  useSaveDashboardLayoutMutation,
  useAddWidgetMutation,
  useUpdateWidgetMutation,
  useDeleteWidgetMutation,
  useGetWidgetDataQuery,
  useShareDashboardMutation,
  useSetDefaultDashboardMutation,
  useCloneDashboardMutation,
} = dashboardApi;
