import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Layouts } from "react-grid-layout";
import { TOKEN_KEY } from "../../config/constants";

// Define the base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// User preferences types
export interface UserThemePreference {
  mode: "light" | "dark";
  primaryColor?: string;
  secondaryColor?: string;
}

export interface UserDashboardPreference {
  layouts: Layouts;
  activeWidgets: string[];
  defaultDashboardId: string;
}

export interface UserNotificationPreference {
  email: boolean;
  push: boolean;
  inApp: boolean;
  alertTypes: Record<string, boolean>;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: UserThemePreference;
  dashboard: UserDashboardPreference;
  notifications: UserNotificationPreference;
  updatedAt: string;
}

// Define the User Preferences API using RTK Query
export const userPreferencesApi = createApi({
  reducerPath: "userPreferencesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/user-preferences/`,
    prepareHeaders: (headers) => {
      // Get token from localStorage
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["UserPreferences"],
  endpoints: (builder) => ({
    // Get user preferences
    getUserPreferences: builder.query<UserPreferences, void>({
      query: () => "",
      providesTags: ["UserPreferences"],
    }),

    // Update theme preferences
    updateThemePreferences: builder.mutation<
      UserPreferences,
      UserThemePreference
    >({
      query: (theme) => ({
        url: "theme",
        method: "PUT",
        body: theme,
      }),
      invalidatesTags: ["UserPreferences"],
    }),

    // Update dashboard preferences
    updateDashboardPreferences: builder.mutation<
      UserPreferences,
      UserDashboardPreference
    >({
      query: (dashboard) => ({
        url: "dashboard",
        method: "PUT",
        body: dashboard,
      }),
      invalidatesTags: ["UserPreferences"],
    }),

    // Update notification preferences
    updateNotificationPreferences: builder.mutation<
      UserPreferences,
      UserNotificationPreference
    >({
      query: (notifications) => ({
        url: "notifications",
        method: "PUT",
        body: notifications,
      }),
      invalidatesTags: ["UserPreferences"],
    }),

    // Reset to default preferences
    resetToDefaultPreferences: builder.mutation<UserPreferences, void>({
      query: () => ({
        url: "reset",
        method: "POST",
      }),
      invalidatesTags: ["UserPreferences"],
    }),
  }),
});

// Default preferences for new users
export const defaultUserPreferences: UserPreferences = {
  id: "default",
  userId: "",
  theme: {
    mode: "light",
    primaryColor: "#2196f3",
    secondaryColor: "#f50057",
  },
  dashboard: {
    layouts: {
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
    },
    activeWidgets: [
      "security-alerts",
      "vulnerability-management",
      "recent-cases",
      "playbook-status",
      "gdpr-compliance",
      "threat-intel",
    ],
    defaultDashboardId: "default-dashboard",
  },
  notifications: {
    email: true,
    push: true,
    inApp: true,
    alertTypes: {
      securityAlerts: true,
      systemHealth: true,
      complianceIssues: true,
      auditFindings: true,
    },
  },
  updatedAt: new Date().toISOString(),
};

// Create a hook for user preferences
export const useUserPreferences = () => {
  const {
    data: preferences,
    isLoading,
    error,
  } = userPreferencesApi.useGetUserPreferencesQuery();

  const [updateTheme] = userPreferencesApi.useUpdateThemePreferencesMutation();
  const [updateDashboard] =
    userPreferencesApi.useUpdateDashboardPreferencesMutation();
  const [updateNotifications] =
    userPreferencesApi.useUpdateNotificationPreferencesMutation();
  const [resetPreferences] =
    userPreferencesApi.useResetToDefaultPreferencesMutation();

  // Default to default preferences if none found
  const userPreferences = preferences || defaultUserPreferences;

  return {
    preferences: userPreferences,
    isLoading,
    error,
    updateTheme,
    updateDashboard,
    updateNotifications,
    resetPreferences,
  };
};

// Export hooks for using the API endpoints
export const {
  useGetUserPreferencesQuery,
  useUpdateThemePreferencesMutation,
  useUpdateDashboardPreferencesMutation,
  useUpdateNotificationPreferencesMutation,
  useResetToDefaultPreferencesMutation,
} = userPreferencesApi;
