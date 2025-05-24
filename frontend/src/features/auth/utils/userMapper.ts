import { User, UserPreferences } from "../types/authTypes";
import { UserData } from "../../../services/api/authService";

/**
 * Converts the UserData object returned from the API to the User format used in the Redux store
 *
 * @param userData - The user data returned from the API
 * @returns A User object compatible with the Redux store
 */
export function mapUserDataToUser(userData: UserData): User {
  return {
    id: userData.id,
    email: userData.email,
    name: `${userData.firstName} ${userData.lastName}`,
    role: userData.role || "user",
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
    mfaEnabled: userData.twoFactorEnabled,
    lastLogin: userData.lastLogin,
    preferences: mapUserPreferences(userData.preferences),
  };
}

/**
 * Maps the API user preferences format to the application's UserPreferences type
 *
 * @param apiPreferences - The preferences from the API
 * @returns UserPreferences object
 */
function mapUserPreferences(apiPreferences: any): UserPreferences | undefined {
  if (!apiPreferences) return undefined;

  return {
    theme: apiPreferences.theme === "system" ? "light" : apiPreferences.theme,
    dashboardLayout: apiPreferences.dashboardLayout
      ? {
          widgets: [],
          lastModified: new Date().toISOString(),
        }
      : undefined,
    notifications: {
      email: apiPreferences.notifications?.email || false,
      inApp: apiPreferences.notifications?.browser || false,
      push: apiPreferences.notifications?.mobile || false,
      digest: "daily",
    },
    language: "en-US",
  };
}

/**
 * Creates a default user object with empty/default values
 * Useful for testing or creating placeholder user data
 */
export function createDefaultUser(): User {
  return {
    id: "",
    email: "",
    name: "",
    role: "user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mfaEnabled: false,
    preferences: {
      theme: "light",
      notifications: {
        email: false,
        inApp: true,
        push: false,
        digest: "weekly",
      },
      language: "en-US",
    },
  };
}
