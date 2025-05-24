import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useDispatch } from "react-redux";
import authService, {
  User,
  LoginCredentials,
  AuthTokens,
  clearAuthData,
} from "../../services/auth/authService";
import {
  loginAndUpdateRedux,
  verifyMfaAndUpdateRedux,
  logoutAndUpdateRedux,
  clearReduxError,
  updateReduxUserPreferences,
} from "../../services/auth/authReduxAdapter";
import { AppDispatch } from "../../store/store";

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  verifyMfa: (
    username: string,
    mfaCode: string,
    mfaToken: string
  ) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  setupMfa: (
    mfaType: "app" | "sms" | "email"
  ) => Promise<{ secret?: string; qrCodeUrl?: string }>;
  clearError: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  refreshUserData: () => void;
}

// Authentication context default values
const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  verifyMfa: async () => {},
  resetPassword: async () => {},
  requestPasswordReset: async () => {},
  changePassword: async () => {},
  setupMfa: async () => ({ secret: "", qrCodeUrl: "" }),
  clearError: () => {},
  hasRole: () => false,
  hasPermission: () => false,
  refreshUserData: () => {},
};

// Create auth context
export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTokenTimeout, setRefreshTokenTimeout] =
    useState<NodeJS.Timeout | null>(null);

  // Redux integration
  const dispatch = useDispatch<AppDispatch>();

  // Clear error function
  const clearError = () => {
    setError(null);
    clearReduxError(dispatch);
  };

  // Load user from storage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUserData();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            setupTokenRefresh();
          } else {
            // If no user data but token exists, try refresh tokens
            try {
              await authService.refreshTokens();
              const refreshedUserData = authService.getUserData();
              if (refreshedUserData) {
                setUser(refreshedUserData);
                setIsAuthenticated(true);
                setupTokenRefresh();
              } else {
                handleAuthFailure();
              }
            } catch {
              handleAuthFailure();
            }
          }
        } else {
          handleAuthFailure();
        }
      } catch (err) {
        handleAuthFailure();
        setError(err instanceof Error ? err.message : "Authentication error");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Clean up token refresh on unmount
    return () => {
      if (refreshTokenTimeout) {
        clearTimeout(refreshTokenTimeout);
      }
    };
  }, []);

  // Handle auth failure (clear state, etc)
  const handleAuthFailure = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearAuthData(); // Use directly imported function
    if (refreshTokenTimeout) {
      clearTimeout(refreshTokenTimeout);
      setRefreshTokenTimeout(null);
    }
  };

  // Setup token refresh mechanism
  const setupTokenRefresh = () => {
    // Clear any existing refresh timeouts
    if (refreshTokenTimeout) {
      clearTimeout(refreshTokenTimeout);
    }

    const tokenExpiryStr = localStorage.getItem("logware_token_expiry");
    if (!tokenExpiryStr) return;

    const expiry = parseInt(tokenExpiryStr, 10);
    const now = Date.now();

    // Calculate time until token needs refresh (5 minutes before expiry)
    const timeUntilRefresh = Math.max(0, expiry - now - 5 * 60 * 1000);

    // Set timeout to refresh token
    const timeout = setTimeout(async () => {
      try {
        await authService.refreshTokens();
        setupTokenRefresh(); // Setup next refresh
      } catch (err) {
        handleAuthFailure();
        setError("Session expired. Please log in again.");
      }
    }, timeUntilRefresh);

    setRefreshTokenTimeout(timeout);
  };

  // Login handler
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    clearError();

    try {
      // Use adapter to login and update Redux
      const response = await loginAndUpdateRedux(credentials, dispatch);

      if (response.requiresMfa) {
        // Don't set user or authenticated state yet
        setError(null);
        return response;
      }

      setUser(response.user);
      setIsAuthenticated(true);
      setupTokenRefresh();
      return response;
    } catch (err) {
      handleAuthFailure();
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // MFA verification handler
  const verifyMfa = async (
    username: string,
    mfaCode: string,
    mfaToken: string
  ) => {
    setIsLoading(true);
    clearError();

    try {
      // Use adapter to verify MFA and update Redux
      const response = await verifyMfaAndUpdateRedux(
        username,
        mfaCode,
        mfaToken,
        dispatch
      );
      setUser(response.user);
      setIsAuthenticated(true);
      setupTokenRefresh();
      return response;
    } catch (err) {
      handleAuthFailure();
      setError(err instanceof Error ? err.message : "MFA verification failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setIsLoading(true);
    try {
      // Use adapter to logout and update Redux
      await logoutAndUpdateRedux(dispatch);
      handleAuthFailure();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    clearError();

    try {
      await authService.requestPasswordReset(email);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to request password reset"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    clearError();

    try {
      await authService.resetPassword(token, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    setIsLoading(true);
    clearError();

    try {
      await authService.changePassword(currentPassword, newPassword);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Setup MFA
  const setupMfa = async (mfaType: "app" | "sms" | "email") => {
    setIsLoading(true);
    clearError();

    try {
      return await authService.setupMfa(mfaType);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set up MFA");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has required role
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  // Check if user has required permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  // Refresh user data
  const refreshUserData = () => {
    const userData = authService.getUserData();
    if (userData) {
      setUser(userData);
      // Update Redux with the latest user data
      updateReduxUserPreferences(dispatch, userData.preferences || {});
    }
  };

  // Context value that will be provided
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    verifyMfa,
    resetPassword,
    requestPasswordReset,
    changePassword,
    setupMfa,
    clearError,
    hasRole,
    hasPermission,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
