import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN_KEY } from "../../config/constants";
import {
  UserPreferences,
  DashboardLayout,
} from "../../features/auth/types/authTypes";

// Define the base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// User preferences API service
export const userPreferencesApi = createApi({
  reducerPath: "userPreferencesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/user/preferences/`,
    prepareHeaders: (headers) => {
      // Get token from localStorage
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["UserPreferences", "DashboardLayout"],
  endpoints: (builder) => ({
    // Get user preferences
    getUserPreferences: builder.query<UserPreferences, void>({
      query: () => "",
      providesTags: ["UserPreferences"],
    }),

    // Update user preferences
    updateUserPreferences: builder.mutation<
      UserPreferences,
      Partial<UserPreferences>
    >({
      query: (data) => ({
        url: "",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["UserPreferences"],
    }),

    // Get dashboard layout
    getDashboardLayout: builder.query<DashboardLayout, void>({
      query: () => "dashboard-layout",
      providesTags: ["DashboardLayout"],
    }),

    // Update dashboard layout
    updateDashboardLayout: builder.mutation<DashboardLayout, DashboardLayout>({
      query: (data) => ({
        url: "dashboard-layout",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["DashboardLayout"],
      // Optimistic update
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        // Update cache immediately for better UX
        const patchResult = dispatch(
          userPreferencesApi.util.updateQueryData(
            "getDashboardLayout",
            undefined,
            () => data
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on failure
          patchResult.undo();
        }
      },
    }),

    // Set theme preference
    setThemePreference: builder.mutation<{ theme: string }, string>({
      query: (theme) => ({
        url: "theme",
        method: "PUT",
        body: { theme },
      }),
      invalidatesTags: ["UserPreferences"],
    }),

    // Set notification preferences
    setNotificationPreferences: builder.mutation<
      {
        notifications: {
          email: boolean;
          inApp: boolean;
          push: boolean;
          digest: string;
        };
      },
      {
        email: boolean;
        inApp: boolean;
        push: boolean;
        digest: "daily" | "weekly" | "none";
      }
    >({
      query: (data) => ({
        url: "notifications",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["UserPreferences"],
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useGetDashboardLayoutQuery,
  useUpdateDashboardLayoutMutation,
  useSetThemePreferenceMutation,
  useSetNotificationPreferencesMutation,
} = userPreferencesApi;

// Helper function for managing dashboard layout
export const DashboardLayoutManager = {
  // Save layout to localStorage as backup
  saveLayoutLocally(layout: DashboardLayout): void {
    try {
      localStorage.setItem("dashboard_layout", JSON.stringify(layout));
    } catch (error) {
      console.error("Error saving dashboard layout to localStorage:", error);
    }
  },

  // Get layout from localStorage if API fails
  getLocalLayout(): DashboardLayout | null {
    try {
      const layoutString = localStorage.getItem("dashboard_layout");
      if (layoutString) {
        return JSON.parse(layoutString);
      }
    } catch (error) {
      console.error(
        "Error retrieving dashboard layout from localStorage:",
        error
      );
    }
    return null;
  },

  // Get default layout
  getDefaultLayout(): DashboardLayout {
    return {
      widgets: [
        // Default widgets with positions
        {
          id: "threat-summary",
          type: "ThreatIntelSummary",
          position: { x: 0, y: 0, w: 6, h: 3 },
          visible: true,
        },
        {
          id: "recent-cases",
          type: "RecentCases",
          position: { x: 6, y: 0, w: 6, h: 3 },
          visible: true,
        },
        {
          id: "compliance-summary",
          type: "GDPRCompliance",
          position: { x: 0, y: 3, w: 4, h: 4 },
          visible: true,
        },
        {
          id: "active-alerts",
          type: "ActiveAlerts",
          position: { x: 4, y: 3, w: 8, h: 4 },
          visible: true,
        },
        {
          id: "system-health",
          type: "SystemHealth",
          position: { x: 0, y: 7, w: 12, h: 3 },
          visible: true,
        },
      ],
      lastModified: new Date().toISOString(),
    };
  },

  // Merge remote and local layouts with conflict resolution
  mergeLayouts(
    remote: DashboardLayout | null,
    local: DashboardLayout | null
  ): DashboardLayout {
    // If no layouts exist, return default
    if (!remote && !local) {
      return this.getDefaultLayout();
    }

    // If only one exists, return it
    if (!remote) return local!;
    if (!local) return remote;

    // Compare timestamps for most recent
    const remoteDate = new Date(remote.lastModified);
    const localDate = new Date(local.lastModified);

    // Use more recent layout
    if (remoteDate > localDate) {
      return remote;
    } else {
      return local;
    }
  },
};

export default userPreferencesApi;
