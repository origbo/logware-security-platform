import { User, LoginCredentials } from "./authService";

// We're using any types for Redux payloads to accommodate the existing structure
// without causing TypeScript errors during this transition phase.
import authService from "./authService";
import { AppDispatch } from "../../store/store";
import {
  login as reduxLogin,
  logout as reduxLogout,
  verify2FA as reduxVerify2FA,
  clearError as reduxClearError,
  updateUserPreferences,
} from "../../store/auth/authSlice";

/**
 * Auth Redux Adapter
 *
 * This adapter bridges the gap between our Auth Context/Service
 * and the Redux store. It ensures that both state management systems
 * stay in sync and allows for a gradual migration.
 */

/**
 * Map our auth service user to the Redux user format
 */
export const mapUserToReduxFormat = (user: User | null): any => {
  if (!user) return null;

  return {
    _id: user.id,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    role: user.roles[0] || "user", // Take first role as primary
    twoFactorEnabled: user.twoFactorEnabled || false,
    preferences: user.preferences || {
      theme: "light",
      dashboardLayout: {},
      notifications: {
        email: true,
        browser: true,
        mobile: false,
      },
    },
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  };
};

/**
 * Perform login and update Redux store
 */
export const loginAndUpdateRedux = async (
  credentials: LoginCredentials,
  dispatch: AppDispatch
): Promise<any> => {
  try {
    // Log in using our auth service
    const response = await authService.login(credentials);

    // If MFA is required
    if (response.requiresMfa) {
      // Dispatch to redux store with proper types
      // @ts-ignore - Ignoring type mismatch as we're adapting to existing Redux structure
      dispatch(
        reduxLogin({
          require2FA: true,
          userId2FA: response.user.id,
        })
      );

      return {
        requiresMfa: true,
        mfaToken: response.mfaToken || "",
        mfaMethods: response.mfaMethods || ["app"],
      };
    }

    // Standard login success - update Redux store
    // @ts-ignore - Ignoring type mismatch as we're adapting to existing Redux structure
    dispatch(
      reduxLogin({
        data: {
          user: mapUserToReduxFormat(response.user),
        },
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
      })
    );

    return response;
  } catch (error) {
    // Let the error propagate to be handled by the context
    throw error;
  }
};

/**
 * Verify MFA and update Redux store
 */
export const verifyMfaAndUpdateRedux = async (
  username: string,
  mfaCode: string,
  mfaToken: string,
  dispatch: AppDispatch
): Promise<any> => {
  try {
    // Verify MFA using our auth service
    const response = await authService.verifyMfa(username, mfaCode, mfaToken);

    // Update Redux store
    // @ts-ignore - Ignoring type mismatch as we're adapting to existing Redux structure
    dispatch(
      reduxVerify2FA({
        data: {
          user: mapUserToReduxFormat(response.user),
        },
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
      })
    );

    return response;
  } catch (error) {
    // Let the error propagate to be handled by the context
    throw error;
  }
};

/**
 * Perform logout and update Redux store
 */
export const logoutAndUpdateRedux = async (
  dispatch: AppDispatch
): Promise<void> => {
  try {
    // Log out using our auth service
    await authService.logout();

    // Update Redux store
    dispatch(reduxLogout());
  } catch (error) {
    // Still dispatch logout to Redux even if the API call fails
    dispatch(reduxLogout());
    throw error;
  }
};

/**
 * Clear error in Redux store
 */
export const clearReduxError = (dispatch: AppDispatch): void => {
  dispatch(reduxClearError());
};

/**
 * Update user preferences in Redux store
 */
export const updateReduxUserPreferences = (
  dispatch: AppDispatch,
  preferences: any
): void => {
  dispatch(updateUserPreferences(preferences));
};

export default {
  mapUserToReduxFormat,
  loginAndUpdateRedux,
  verifyMfaAndUpdateRedux,
  logoutAndUpdateRedux,
  clearReduxError,
  updateReduxUserPreferences,
};
