import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectTheme,
  selectDashboardLayout,
  selectLanguage,
  selectNotifications,
  setTheme,
  setDashboardLayout,
  setLanguage,
  setNotificationPreferences,
  setAllPreferences,
} from "./preferencesSlice";
import {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} from "../../services/api/userPreferencesService";
import { DashboardLayout, UserPreferences } from "../auth/types/authTypes";
import { selectUser } from "../auth/slice/authSlice";
import {
  logEvent,
  ErrorCategory,
} from "../../services/analytics/errorAnalyticsService";

/**
 * Custom hook for managing user preferences
 * Handles synchronization between Redux store and backend
 */
export const useUserPreferences = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const dashboardLayout = useSelector(selectDashboardLayout);
  const language = useSelector(selectLanguage);
  const notifications = useSelector(selectNotifications);
  const user = useSelector(selectUser);

  // API interactions
  const { data: remotePreferences, isLoading } = useGetUserPreferencesQuery(
    undefined,
    {
      skip: !user, // Skip if user is not logged in
    }
  );

  const [updatePreferences, { isLoading: isUpdating, error: updateError }] =
    useUpdateUserPreferencesMutation();

  // When user logs in and remote preferences are loaded, update local state
  useEffect(() => {
    if (remotePreferences && !isLoading) {
      dispatch(setAllPreferences(remotePreferences));

      // Log the event
      logEvent({
        category: ErrorCategory.USER,
        action: "preferences_loaded",
        data: { hasTheme: !!remotePreferences.theme },
      });
    }
  }, [remotePreferences, isLoading, dispatch]);

  // When user preferences in Redux change and user is logged in, sync to backend
  const savePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      // Update Redux first for responsive UI
      if (preferences.theme) dispatch(setTheme(preferences.theme));
      if (preferences.dashboardLayout)
        dispatch(setDashboardLayout(preferences.dashboardLayout));
      if (preferences.language) dispatch(setLanguage(preferences.language));
      if (preferences.notifications)
        dispatch(setNotificationPreferences(preferences.notifications));

      // Then sync to backend
      await updatePreferences(preferences).unwrap();

      // Log successful update
      logEvent({
        category: ErrorCategory.USER,
        action: "preferences_updated",
        data: { updatedFields: Object.keys(preferences) },
      });
    } catch (error) {
      // Log error
      logEvent({
        category: ErrorCategory.USER,
        action: "preferences_update_failed",
        error,
      });

      console.error("Failed to update preferences:", error);
    }
  };

  // Helper function to toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    savePreferences({ theme: newTheme });
  };

  // Helper function to save dashboard layout
  const saveDashboardLayout = (layout: DashboardLayout) => {
    savePreferences({ dashboardLayout: layout });
  };

  return {
    theme,
    dashboardLayout,
    language,
    notifications,
    isLoading: isLoading || isUpdating,
    error: updateError,
    toggleTheme,
    savePreferences,
    saveDashboardLayout,
  };
};

export default useUserPreferences;
