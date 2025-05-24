import { User } from "../types/authTypes";
import { UserData } from "../../../services/api/authService";

/**
 * Adapts UserData from the API service to the User interface used in the Redux store
 */
export function adaptUserDataToUser(userData: UserData): User {
  return {
    id: userData.id,
    email: userData.email,
    name: `${userData.firstName} ${userData.lastName}`, // Combine first and last name
    role: userData.role || "user", // Default to 'user' if no role provided
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
    mfaEnabled: userData.twoFactorEnabled,
    lastLogin: userData.lastLogin,
    preferences: {
      theme:
        userData.preferences.theme === "system"
          ? "light"
          : userData.preferences.theme,
      dashboardLayout: userData.preferences.dashboardLayout
        ? {
            widgets: [],
            lastModified: new Date().toISOString(),
          }
        : undefined,
      notifications: {
        email: userData.preferences.notifications.email,
        inApp: userData.preferences.notifications.browser,
        push: userData.preferences.notifications.mobile,
        digest: "daily", // Default to daily digest
      },
      language: "en-US", // Default language
    },
  };
}

/**
 * Adapts User from the Redux store to UserData for API requests
 */
export function adaptUserToUserData(user: User): UserData {
  // Extract first and last name from the full name
  const nameParts = user.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  return {
    id: user.id,
    email: user.email,
    firstName: firstName,
    lastName: lastName,
    fullName: user.name,
    role: user.role,
    twoFactorEnabled: user.mfaEnabled || false,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    preferences: {
      theme: user.preferences?.theme || "light",
      dashboardLayout: user.preferences?.dashboardLayout || {},
      notifications: {
        email: user.preferences?.notifications?.email || false,
        browser: user.preferences?.notifications?.inApp || false,
        mobile: user.preferences?.notifications?.push || false,
      },
    },
  };
}

/**
 * Safely converts any user object type to the User interface
 */
export function ensureUserFormat(user: UserData | User | null): User | null {
  if (!user) return null;

  // Check if this is already a User object by looking for properties specific to User
  if ("name" in user) {
    return user as User;
  }

  // It must be UserData, so convert it
  return adaptUserDataToUser(user as UserData);
}
