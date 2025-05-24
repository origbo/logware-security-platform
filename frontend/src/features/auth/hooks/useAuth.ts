import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  login,
  register,
  logout,
  verify2FA,
  getCurrentUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  updatePassword,
  setup2FA,
  enable2FA,
  disable2FA,
  clearError,
  selectAuth,
  selectIsAuthenticated,
  selectUser,
  selectRequire2FA,
  // selectTempUserId removed as it's not exported from the slice
  selectAuthLoading,
  selectAuthError,
  selectAuthInitialized,
} from "../slice/authSlice";
import type {
  LoginCredentials,
  RegisterData,
  TwoFactorVerifyData,
  PasswordResetData,
} from "../../../services/api/authService";

/**
 * Custom hook for authentication functionality
 * Provides authentication state and methods to interact with auth features
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Select auth state from Redux store
  const authState = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const require2FA = useSelector(selectRequire2FA);
  // Using selectUserId instead since selectTempUserId is not exported
  const tempUserId = useSelector(selectUserId);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const initialized = useSelector(selectAuthInitialized);

  // Initialize auth state
  useEffect(() => {
    if (isAuthenticated && !user && !initialized) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, user, initialized]);

  // Set up token refresh interval
  useEffect(() => {
    if (isAuthenticated) {
      // Refresh token every 10 minutes if authenticated
      const refreshInterval = setInterval(() => {
        dispatch(refreshToken());
      }, 10 * 60 * 1000); // 10 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [dispatch, isAuthenticated]);

  // Login function
  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const resultAction = await dispatch(login(credentials));

        if (login.fulfilled.match(resultAction)) {
          const payload = resultAction.payload as any;

          // Handle 2FA requirement
          if (payload.require2FA) {
            navigate("/auth/two-factor");
          } else {
            // Get redirect URL from location state or default to dashboard
            const from =
              (location.state as any)?.from?.pathname || "/dashboard";
            navigate(from);
          }

          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [dispatch, navigate, location]
  );

  // 2FA verification function
  const handleVerify2FA = useCallback(
    async (verificationData: TwoFactorVerifyData) => {
      try {
        const resultAction = await dispatch(verify2FA(verificationData));

        if (verify2FA.fulfilled.match(resultAction)) {
          // Redirect to dashboard after successful 2FA verification
          navigate("/dashboard");
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [dispatch, navigate]
  );

  // Register function
  const handleRegister = useCallback(
    async (registerData: RegisterData) => {
      try {
        const resultAction = await dispatch(register(registerData));

        if (register.fulfilled.match(resultAction)) {
          navigate("/dashboard");
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [dispatch, navigate]
  );

  // Logout function
  const handleLogout = useCallback(async () => {
    await dispatch(logout());
    navigate("/auth/login");
  }, [dispatch, navigate]);

  // Forgot password function
  const handleForgotPassword = useCallback(
    async (email: string) => {
      try {
        const resultAction = await dispatch(forgotPassword(email));
        return forgotPassword.fulfilled.match(resultAction);
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  // Reset password function
  const handleResetPassword = useCallback(
    async (token: string, data: PasswordResetData) => {
      try {
        const resultAction = await dispatch(resetPassword({ token, data }));

        if (resetPassword.fulfilled.match(resultAction)) {
          navigate("/dashboard");
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [dispatch, navigate]
  );

  // Update password function
  const handleUpdatePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
      newPasswordConfirm: string
    ) => {
      try {
        const resultAction = await dispatch(
          updatePassword({ currentPassword, newPassword, newPasswordConfirm })
        );
        return updatePassword.fulfilled.match(resultAction);
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  // Update profile function
  const handleUpdateProfile = useCallback(
    async (profileData: ProfileData) => {
      try {
        const resultAction = await dispatch(updateProfile(profileData));
        return updateProfile.fulfilled.match(resultAction);
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  // Change password function
  const handleChangePassword = useCallback(
    async (passwordChangeData: PasswordChangeData) => {
      try {
        const resultAction = await dispatch(changePassword(passwordChangeData));
        return changePassword.fulfilled.match(resultAction);
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  // 2FA setup function
  const handleSetup2FA = useCallback(async () => {
    try {
      const resultAction = await dispatch(setup2FA());
      return setup2FA.fulfilled.match(resultAction)
        ? resultAction.payload
        : null;
    } catch (error) {
      return null;
    }
  }, [dispatch]);

  // 2FA enable function
  const handleEnable2FA = useCallback(
    async (token: string) => {
      try {
        const resultAction = await dispatch(enable2FA(token));
        return enable2FA.fulfilled.match(resultAction);
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  // 2FA disable function
  const handleDisable2FA = useCallback(
    async (token: string) => {
      try {
        const resultAction = await dispatch(disable2FA(token));
        return disable2FA.fulfilled.match(resultAction);
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  // Toggle 2FA function
  const handleToggle2FA = useCallback(
    async (enabled: boolean) => {
      try {
        const resultAction = await dispatch(toggle2FA(enabled));
        return toggle2FA.fulfilled.match(resultAction);
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  // Clear error function
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // Auth state
    isAuthenticated,
    user,
    require2FA,
    tempUserId,
    loading,
    error,
    initialized,

    // Auth methods
    login: handleLogin,
    verify2FA: handleVerify2FA,
    register: handleRegister,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    setup2FA: handleSetup2FA,
    enable2FA: handleEnable2FA,
    disable2FA: handleDisable2FA,
    clearError: handleClearError,
  };
};

export default useAuth;
