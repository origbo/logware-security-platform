import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getMockDataForWidget } from "../mock/dashboardMockData";

// Define the base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Dashboard widget types
export enum WidgetType {
  ALERTS_SUMMARY = "alertsSummary",
  SYSTEM_HEALTH = "systemHealth",
  ACTIVITY_TIMELINE = "activityTimeline",
  LOGS_OVERVIEW = "logsOverview",
  COMPLIANCE_STATUS = "complianceStatus",
  QUICK_ACTIONS = "quickActions",
  THREAT_MAP = "threatMap",
  NETWORK_STATUS = "networkStatus",
  CUSTOM_CHART = "customChart",
  // New widget types
  GDPR_COMPLIANCE = "gdprCompliance",
  SECURITY_SCORE = "securityScore",
  PLAYBOOK_STATUS = "playbookStatus",
  CLOUD_SECURITY = "cloudSecurity",
  THREAT_INTEL_SUMMARY = "threatIntelSummary",
  RECENT_CASES = "recentCases",
}

// Dashboard widget size options
export enum WidgetSize {
  SMALL = "small", // 1x1
  MEDIUM = "medium", // 2x1
  LARGE = "large", // 2x2
  XLARGE = "xlarge", // 4x2
}

// Dashboard widget interface
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  settings?: Record<string, any>;
}

// Dashboard layout interface
export interface DashboardLayout {
  id: string;
  name: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
}

// Dashboard data interface
export interface DashboardData {
  layouts: DashboardLayout[];
  activeLayoutId: string;
}

// Define the Dashboard API using RTK Query
export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/dashboard/`,
    prepareHeaders: (headers) => {
      // Get token from localStorage
      const token = localStorage.getItem("logware_access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Dashboard", "Widget"],
  endpoints: (builder) => ({
    // Get user dashboard layouts
    getDashboardLayouts: builder.query<DashboardLayout[], void>({
      query: () => "layouts",
      providesTags: ["Dashboard"],
    }),

    // Get active dashboard layout
    getActiveDashboard: builder.query<DashboardLayout, void>({
      query: () => "active",
      providesTags: ["Dashboard"],
    }),

    // Create new dashboard layout
    createDashboardLayout: builder.mutation<
      DashboardLayout,
      Partial<DashboardLayout>
    >({
      query: (layout) => ({
        url: "layouts",
        method: "POST",
        body: layout,
      }),
      invalidatesTags: ["Dashboard"],
    }),

    // Update dashboard layout
    updateDashboardLayout: builder.mutation<
      DashboardLayout,
      Partial<DashboardLayout>
    >({
      query: (layout) => ({
        url: `layouts/${layout.id}`,
        method: "PUT",
        body: layout,
      }),
      invalidatesTags: ["Dashboard"],
    }),

    // Delete dashboard layout
    deleteDashboardLayout: builder.mutation<void, string>({
      query: (id) => ({
        url: `layouts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Dashboard"],
    }),

    // Set active dashboard layout
    setActiveDashboardLayout: builder.mutation<void, string>({
      query: (id) => ({
        url: "active",
        method: "PUT",
        body: { layoutId: id },
      }),
      invalidatesTags: ["Dashboard"],
    }),

    // Add widget to dashboard
    addWidget: builder.mutation<
      DashboardLayout,
      { layoutId: string; widget: Partial<DashboardWidget> }
    >({
      query: ({ layoutId, widget }) => ({
        url: `/${layoutId}/widgets`,
        method: "POST",
        body: widget,
      }),
      invalidatesTags: ["Dashboard", "Widget"],
    }),

    // Update widget
    updateWidget: builder.mutation<
      DashboardLayout,
      { layoutId: string; widget: Partial<DashboardWidget> }
    >({
      query: ({ layoutId, widget }) => ({
        url: `/${layoutId}/widgets/${widget.id}`,
        method: "PUT",
        body: widget,
      }),
      invalidatesTags: ["Dashboard", "Widget"],
    }),

    // Delete widget
    deleteWidget: builder.mutation<
      DashboardLayout,
      { layoutId: string; widgetId: string }
    >({
      query: ({ layoutId, widgetId }) => ({
        url: `/${layoutId}/widgets/${widgetId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Dashboard", "Widget"],
    }),

    // Get widget data
    getWidgetData: builder.query<any, { widgetId: string; type: WidgetType }>({
      query: ({ widgetId, type }) => `/widgets/${widgetId}/data?type=${type}`,
      providesTags: (result, error, { widgetId }) => [
        { type: "Widget", id: widgetId },
      ],
    }),
  }),
});

// Mock dashboard data for development
export const mockDefaultDashboard: DashboardLayout = {
  id: "default-dashboard",
  name: "Default Dashboard",
  isDefault: true,
  widgets: [
    {
      id: "alerts-summary",
      type: WidgetType.ALERTS_SUMMARY,
      title: "Alerts Summary",
      size: WidgetSize.MEDIUM,
      position: { x: 0, y: 0, w: 2, h: 1 },
    },
    {
      id: "system-health",
      type: WidgetType.SYSTEM_HEALTH,
      title: "System Health",
      size: WidgetSize.MEDIUM,
      position: { x: 2, y: 0, w: 2, h: 1 },
    },
    {
      id: "activity-timeline",
      type: WidgetType.ACTIVITY_TIMELINE,
      title: "Activity Timeline",
      size: WidgetSize.LARGE,
      position: { x: 0, y: 1, w: 4, h: 2 },
    },
    {
      id: "quick-actions",
      type: WidgetType.QUICK_ACTIONS,
      title: "Quick Actions",
      size: WidgetSize.SMALL,
      position: { x: 0, y: 3, w: 1, h: 1 },
    },
    {
      id: "compliance-status",
      type: WidgetType.COMPLIANCE_STATUS,
      title: "Compliance Status",
      size: WidgetSize.MEDIUM,
      position: { x: 1, y: 3, w: 2, h: 1 },
    },
    {
      id: "logs-overview",
      type: WidgetType.LOGS_OVERVIEW,
      title: "Logs Overview",
      size: WidgetSize.SMALL,
      position: { x: 3, y: 3, w: 1, h: 1 },
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Export hooks for using the API endpoints
export const {
  useGetDashboardLayoutsQuery,
  useGetActiveDashboardQuery,
  useCreateDashboardLayoutMutation,
  useUpdateDashboardLayoutMutation,
  useDeleteDashboardLayoutMutation,
  useSetActiveDashboardLayoutMutation,
  useAddWidgetMutation,
  useUpdateWidgetMutation,
  useDeleteWidgetMutation,
  useGetWidgetDataQuery,
} = dashboardApi;
