import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import { DashboardLayout, UserPreferences } from "../auth/types/authTypes";
import { THEME_STORAGE_KEY, DEFAULT_THEME } from "../../config/constants";

// Interface for our preferences state
interface PreferencesState {
  theme: "light" | "dark";
  dashboardLayout: DashboardLayout | null;
  language: string;
  notifications: {
    email: boolean;
    inApp: boolean;
    push: boolean;
    digest: "daily" | "weekly" | "none";
  };
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

// Get initial theme from localStorage or default
const getInitialTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    // Check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  }

  return DEFAULT_THEME === "dark" ? "dark" : "light";
};

// Initial state with default values
const initialState: PreferencesState = {
  theme: getInitialTheme(),
  dashboardLayout: null,
  language: "en-US",
  notifications: {
    email: false,
    inApp: true,
    push: false,
    digest: "daily",
  },
  initialized: false,
  loading: false,
  error: null,
};

// Create the preferences slice
const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    // Set the theme
    setTheme(state, action: PayloadAction<"light" | "dark">) {
      state.theme = action.payload;

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, action.payload);
      }
    },

    // Set dashboard layout
    setDashboardLayout(state, action: PayloadAction<DashboardLayout>) {
      state.dashboardLayout = action.payload;
    },

    // Set language
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },

    // Set notification preferences
    setNotificationPreferences(
      state,
      action: PayloadAction<{
        email?: boolean;
        inApp?: boolean;
        push?: boolean;
        digest?: "daily" | "weekly" | "none";
      }>
    ) {
      state.notifications = {
        ...state.notifications,
        ...action.payload,
      };
    },

    // Set all user preferences at once (e.g. from user profile)
    setAllPreferences(state, action: PayloadAction<UserPreferences>) {
      if (action.payload.theme) {
        state.theme = action.payload.theme;
        localStorage.setItem(THEME_STORAGE_KEY, action.payload.theme);
      }

      if (action.payload.dashboardLayout) {
        state.dashboardLayout = action.payload.dashboardLayout;
      }

      if (action.payload.language) {
        state.language = action.payload.language;
      }

      if (action.payload.notifications) {
        state.notifications = action.payload.notifications;
      }

      state.initialized = true;
    },

    // Sync user preferences with server
    syncPreferencesStart(state) {
      state.loading = true;
      state.error = null;
    },

    syncPreferencesSuccess(state) {
      state.loading = false;
      state.error = null;
    },

    syncPreferencesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// Export actions
export const {
  setTheme,
  setDashboardLayout,
  setLanguage,
  setNotificationPreferences,
  setAllPreferences,
  syncPreferencesStart,
  syncPreferencesSuccess,
  syncPreferencesFailure,
} = preferencesSlice.actions;

// Export selectors
export const selectTheme = (state: RootState) => state.preferences.theme;
export const selectDashboardLayout = (state: RootState) =>
  state.preferences.dashboardLayout;
export const selectLanguage = (state: RootState) => state.preferences.language;
export const selectNotifications = (state: RootState) =>
  state.preferences.notifications;
export const selectAllPreferences = (state: RootState): UserPreferences => ({
  theme: state.preferences.theme,
  dashboardLayout: state.preferences.dashboardLayout || undefined,
  language: state.preferences.language,
  notifications: state.preferences.notifications,
});

export default preferencesSlice.reducer;
