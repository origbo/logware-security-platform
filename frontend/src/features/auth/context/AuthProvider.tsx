import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useDispatch, useSelector } from "../../../store/hooks";
import { RootState } from "../../../store/store";
import {
  login,
  logout,
  verify2FA,
  mfaRequired,
  mfaVerificationComplete,
  selectUserId,
  selectVerificationId,
  selectUser,
  selectRequire2FA,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  getCurrentUser,
  clearError as clearAuthError,
} from "../slice/authSlice";
import MFAVerification from "../components/MFAVerification";
import { MFAMethodType } from "../../../services/auth/mfaService";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useNotification } from "../../../components/common/NotificationProvider";
import errorAnalytics from "../../../services/analytics/errorAnalyticsService";
import { ErrorSeverity, ErrorType } from "../../../types/errors";
import authService from "../../../services/api/authService";
import {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  MFA_STORAGE_KEY,
  MFA_USER_ID_KEY,
} from "../../../config/constants";
import {
  AuthContextProps,
  User,
  LoginCredentials,
  TwoFactorVerifyData,
} from "../types/authTypes";

// Create auth context
export const AuthContext = createContext<AuthContextProps | null>(null);

// Modal style for MFA verification
const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth functionality via React Context
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Redux
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const require2FA = useSelector(selectRequire2FA);
  const userId = useSelector(selectUserId);
  const verificationId = useSelector(selectVerificationId);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Local state
  const [mfaModalOpen, setMfaModalOpen] = useState<boolean>(false);

  // Notifications
  const { showNotification } = useNotification() as { showNotification: (message: string, type: "success" | "info" | "warning" | "error", duration?: number) => void };

  // Open MFA modal when required
  useEffect(() => {
    setMfaModalOpen(!!require2FA && !!verificationId);
  }, [require2FA, verificationId]);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already logged in (has valid token)
        if (authService.isLoggedIn()) {
          try {
            // Get current user data
            const userData = await authService.getCurrentUser();

            // If successful, dispatch user data
            dispatch(getCurrentUser());

            // Track successful authentication
            errorAnalytics.addBreadcrumb({
              category: "auth",
              action: "auto-login",
              message: "User authenticated from stored token",
              data: { userId: userData.id },
            });
          } catch (error) {
            console.error("Error fetching user data:", error);

            // Try to refresh the token
            try {
              const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
              if (refreshToken) {
                await authService.refreshToken(refreshToken);
                const userData = await authService.getCurrentUser();
                dispatch(getCurrentUser());
              } else {
                // No refresh token, clear auth state
                handleLogout();
              }
            } catch (refreshError) {
              console.error("Error refreshing token:", refreshError);
              handleLogout();

              // Track refresh token failure
              errorAnalytics.logCustomError(
                "Token refresh failed during initialization",
                ErrorSeverity.WARNING,
                ErrorType.AUTHENTICATION,
                { error: refreshError }
              );
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);

        // Track error
        errorAnalytics.logCustomError(
          "Auth initialization error",
          ErrorSeverity.ERROR,
          ErrorType.AUTHENTICATION,
          { error }
        );
      }
    };

    initAuth();
  }, [dispatch]);

  // Login handler
  const handleLogin = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      const credentials: LoginCredentials = { email, password };
      const response = await authService.login(credentials);

      // Track login attempt
      errorAnalytics.addBreadcrumb({
        category: "auth",
        action: "login-attempt",
        data: { email },
      });

      // Check if MFA is required
      if ("require2FA" in response && response.require2FA) {
        // Set MFA related state
        dispatch(
          mfaRequired({
            userId: response.userId,
            verificationId: response.verificationId,
          })
        );

        // Save to local storage as backup
        localStorage.setItem(MFA_STORAGE_KEY, response.verificationId);
        localStorage.setItem(MFA_USER_ID_KEY, response.userId);

        // Track MFA requirement
        errorAnalytics.addBreadcrumb({
          category: "auth",
          action: "mfa-required",
          data: { userId: response.userId },
        });

        return;
      }

      // No MFA required, proceed with login
      dispatch(
        login({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
        })
      );

      showNotification("Login successful", "success");

      // Track successful login
      errorAnalytics.addBreadcrumb({
        category: "auth",
        action: "login-success",
        data: { userId: response.user.id },
      });
    } catch (error: any) {
      console.error("Login error:", error);

      showNotification(
        error?.response?.data?.message ||
          "Login failed. Please check your credentials.",
        "error"
      );

      // Track login error
      errorAnalytics.logCustomError(
        "Login failed",
        ErrorSeverity.ERROR,
        ErrorType.AUTHENTICATION,
        { error }
      );
    }
  };

  // Register handler
  const handleRegister = async (userData: any): Promise<void> => {
    try {
      await authService.register(userData);
      showNotification(
        "Registration successful! You can now log in.",
        "success"
      );

      // Track registration
      errorAnalytics.addBreadcrumb({
        category: "auth",
        action: "registration-success",
        data: { email: userData.email },
      });
    } catch (error: any) {
      showNotification(
        error?.response?.data?.message ||
          "Registration failed. Please try again.",
        "error"
      );

      // Track registration error
      errorAnalytics.logCustomError(
        "Registration failed",
        ErrorSeverity.ERROR,
        ErrorType.AUTHENTICATION,
        { error }
      );

      throw error;
    }
  };

  // Logout handler
  const handleLogout = (): void => {
    try {
      // Clear tokens first to prevent further authenticated requests
      authService.clearTokens();

      // Log out on server (non-critical)
      authService.logout().catch((error) => {
        console.warn(
          "Logout from server failed, but tokens were cleared:",
          error
        );
      });

      // Dispatch logout action to clear Redux state
      dispatch(logout());

      showNotification("You have been logged out successfully", "success");

      // Track logout
      errorAnalytics.addBreadcrumb({
        category: "auth",
        action: "logout-success",
      });
    } catch (error) {
      console.error("Logout error:", error);

      // Still clear any tokens if logout fails
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);

      // Force logout
      dispatch(logout());

      // Track logout error
      errorAnalytics.logCustomError(
        "Logout error",
        ErrorSeverity.WARNING,
        ErrorType.AUTHENTICATION,
        { error }
      );
    }
  };

  // Handle MFA verification completion
  const completeMfaVerification = async (tokens: {
    accessToken: string;
    refreshToken: string;
  }): Promise<void> => {
    try {
      // Store tokens from verification
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

      // Clear MFA storage
      localStorage.removeItem(MFA_STORAGE_KEY);
      localStorage.removeItem(MFA_USER_ID_KEY);

      // Get user data after successful verification
      const userData = await authService.getCurrentUser();

      // Update state
      dispatch(
        mfaVerificationComplete({
          tokens,
          user: userData,
        })
      );

      // Close modal
      setMfaModalOpen(false);

      showNotification("Authentication successful", "success");

      // Track MFA success
      errorAnalytics.addBreadcrumb({
        category: "auth",
        action: "mfa-verification-success",
        data: { userId: userData.id },
      });
    } catch (error) {
      console.error("Error after MFA verification:", error);

      showNotification("Error completing authentication", "error");

      // Track MFA completion error
      errorAnalytics.logCustomError(
        "MFA verification completion error",
        ErrorSeverity.ERROR,
        ErrorType.AUTHENTICATION,
        { error }
      );
    }
  };

  // Cancel MFA verification
  const cancelMfaVerification = (): void => {
    // Clear MFA storage
    localStorage.removeItem(MFA_STORAGE_KEY);
    localStorage.removeItem(MFA_USER_ID_KEY);

    // Reset state
    dispatch(logout());

    // Close modal
    setMfaModalOpen(false);

    showNotification("Authentication cancelled", "info");

    // Track MFA cancellation
    errorAnalytics.addBreadcrumb({
      category: "auth",
      action: "mfa-verification-cancelled",
    });
  };

  // Clear error message
  const clearError = (): void => {
    dispatch(clearAuthError());
  };

  // Create context value
  const authContextValue: AuthContextProps = {
    isAuthenticated,
    user,
    loading,
    error,
    mfaRequired: !!require2FA,
    mfaVerificationId: verificationId,
    tempUserId: userId,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    clearError,
    completeMfaVerification,
    cancelMfaVerification,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}

      {/* MFA Verification Modal */}
      {/* @ts-ignore - Modal typing issue */}
      <Modal
        open={mfaModalOpen}
        onClose={() => {}} // Prevent closing by clicking outside
        aria-labelledby="mfa-verification-modal"
        aria-describedby="mfa-verification-modal-description"
      >
        {/* @ts-ignore - Box typing issue */}
        <Box sx={modalStyle}>
          {require2FA && verificationId && userId && (
            <MFAVerification
              verificationId={verificationId}
              userId={userId}
              onComplete={completeMfaVerification}
              onCancel={cancelMfaVerification}
            />
          )}
        </Box>
      </Modal>
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextProps => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthProvider;
