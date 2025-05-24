import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";
import {
  LoginCredentials,
  TwoFactorVerifyData,
  MFARequiredResponse,
  User,
} from "../types/authTypes";
import { adaptUserDataToUser, ensureUserFormat } from "../utils/authAdapters";
import AuthService, {
  UserData,
  RegisterData,
  PasswordResetData,
  TokenResponse,
  PasswordChangeData,
  ProfileData,
} from "../../../services/api/authService";

// Define the authentication state interface
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  require2FA: boolean;
  userId: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  initialized: boolean;
  verificationId: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: AuthService.isLoggedIn(),
  user: null,
  require2FA: false,
  userId: null,
  loading: false,
  error: null,
  success: null,
  initialized: false,
  verificationId: null,
};

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);

      // Handle 2FA requirement
      if ("require2FA" in response && response.require2FA) {
        return {
          require2FA: true,
          userId: response.userId,
          verificationId: response.verificationId,
        };
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

export const verify2FA = createAsyncThunk(
  "auth/verify2FA",
  async (data: TwoFactorVerifyData, { rejectWithValue }) => {
    try {
      return await AuthService.verify2FA(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid verification code."
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      return await AuthService.register(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await AuthService.getCurrentUser();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get user data."
      );
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      return await AuthService.refreshToken();
    } catch (error: any) {
      // Clear tokens if refresh failed
      AuthService.clearTokens();
      return rejectWithValue(
        error.response?.data?.message || "Session expired. Please login again."
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await AuthService.logout();
      return null;
    } catch (error: any) {
      // Still clear tokens on the frontend even if server request fails
      AuthService.clearTokens();
      return rejectWithValue(
        error.response?.data?.message || "Logout failed. Please try again."
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      return await AuthService.forgotPassword(email);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to send reset email. Please try again."
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { token, data }: { token: string; data: PasswordResetData },
    { rejectWithValue }
  ) => {
    try {
      return await AuthService.resetPassword(token, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (
    data: {
      currentPassword: string;
      newPassword: string;
      newPasswordConfirm: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await AuthService.updatePassword(
        data.currentPassword,
        data.newPassword,
        data.newPasswordConfirm
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update password. Please try again."
      );
    }
  }
);

export const setup2FA = createAsyncThunk(
  "auth/setup2FA",
  async (_, { rejectWithValue }) => {
    try {
      return await AuthService.setup2FA();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to setup 2FA. Please try again."
      );
    }
  }
);

export const enable2FA = createAsyncThunk(
  "auth/enable2FA",
  async (token: string, { rejectWithValue, dispatch }) => {
    try {
      const result = await AuthService.enable2FA(token);
      dispatch(getCurrentUser());
      return result;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to enable 2FA. Please try again."
      );
    }
  }
);

export const disable2FA = createAsyncThunk(
  "auth/disable2FA",
  async (token: string, { rejectWithValue, dispatch }) => {
    try {
      const result = await AuthService.disable2FA(token);
      dispatch(getCurrentUser());
      return result;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to disable 2FA. Please try again."
      );
    }
  }
);

// Create additional async thunks for user profile management
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data: any, { rejectWithValue }) => {
    try {
      return await AuthService.updateProfile(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (data: any, { rejectWithValue }) => {
    try {
      return await AuthService.changePassword(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    }
  }
);

export const toggle2FA = createAsyncThunk(
  "auth/toggle2FA",
  async (enabled: boolean, { rejectWithValue, dispatch }) => {
    try {
      const result = await AuthService.toggle2FA(enabled);
      dispatch(getCurrentUser());
      return result;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          `Failed to ${enabled ? "enable" : "disable"} 2FA. Please try again.`
      );
    }
  }
);

// Creating action types for MFA
export const setMfaRequired = createAsyncThunk(
  "auth/setMfaRequired",
  async (data: { userId: string; verificationId: string }, { dispatch }) => {
    return data;
  }
);

export const completeMfaVerification = createAsyncThunk(
  "auth/completeMfaVerification",
  async (
    tokens: { accessToken: string; refreshToken: string },
    { dispatch }
  ) => {
    // Store tokens
    AuthService.setTokens(tokens.accessToken, tokens.refreshToken);

    // Get user data
    const userData = await AuthService.getCurrentUser();

    return {
      tokens,
      user: userData,
    };
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set MFA required status
    mfaRequired: (state, action) => {
      state.require2FA = true;
      state.userId = action.payload.userId;
      state.verificationId = action.payload.verificationId;
    },

    // Complete MFA verification
    mfaVerificationComplete: (state, action) => {
      state.require2FA = false;
      state.userId = null;
      state.verificationId = null;
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },
    clearError(state) {
      state.error = null;
      state.success = null;
    },
    clearAuth(state) {
      AuthService.clearTokens();
      state.isAuthenticated = false;
      state.user = null;
      state.require2FA = false;
      state.userId = null;
      state.error = null;
      state.success = null;
      state.initialized = true;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setAuthenticated(state, action) {
      state.isAuthenticated = action.payload;
    },
    setInitialized(state, action) {
      state.initialized = action.payload;
    },
    clearAuthState(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.require2FA = false;
      state.userId = null;
      state.error = null;
      state.success = null;
    },
    setSuccess(state, action) {
      state.success = action.payload;
      state.error = null;
    },
    updateUserPreferences(state, action) {
      if (state.user) {
        state.user.preferences = {
          ...state.user.preferences,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    // Update profile reducers
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure proper conversion from UserData to User interface
        const userData = action.payload;
        if (state.user) {
          state.user = {
            ...state.user,
            ...adaptUserDataToUser(userData)
          };
        } else {
          state.user = adaptUserDataToUser(userData);
        }
        state.success = "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Change password reducers
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = "Password changed successfully";
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle 2FA reducers
    builder
      .addCase(toggle2FA.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(toggle2FA.fulfilled, (state) => {
        state.loading = false;
        state.success = "Two-factor authentication settings updated";
      })
      .addCase(toggle2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    // Login reducers
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;

        // Check if MFA is required
        if ("require2FA" in action.payload) {
          state.require2FA = true;
          state.userId = action.payload.userId;
          state.verificationId = action.payload.verificationId;
        } else {
          state.isAuthenticated = true;
          // Convert UserData to User interface format to fix the type mismatch
          const userData = action.payload.user;
          state.user = {
            id: userData.id,
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`,
            role: userData.role || "user",
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            mfaEnabled: userData.twoFactorEnabled,
            lastLogin: userData.lastLogin,
            preferences: userData.preferences
              ? {
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
                    digest: "daily",
                  },
                  language: "en-US",
                }
              : undefined,
          };
          state.require2FA = false;
          state.userId = null;
          state.verificationId = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 2FA verification reducers
    builder
      .addCase(verify2FA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Convert UserData to User interface
        const userData = action.payload.user;
        state.user = {
          id: userData.id,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role || "user",
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          mfaEnabled: userData.twoFactorEnabled,
          lastLogin: userData.lastLogin,
          preferences: userData.preferences
            ? {
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
                  digest: "daily",
                },
                language: "en-US",
              }
            : undefined,
        };
        state.require2FA = false;
        state.userId = null;
        state.verificationId = null;
        state.success = "MFA verification successful";
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register reducers
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Convert UserData to User interface
        const userData = action.payload.user;
        state.user = {
          id: userData.id,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role || "user",
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          mfaEnabled: userData.twoFactorEnabled,
          lastLogin: userData.lastLogin,
          preferences: userData.preferences
            ? {
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
                  digest: "daily",
                },
                language: "en-US",
              }
            : undefined,
        };
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Get current user reducers
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Convert UserData to User interface
        const userData = action.payload;
        state.user = {
          id: userData.id,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role || "user",
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          mfaEnabled: userData.twoFactorEnabled,
          lastLogin: userData.lastLogin,
          preferences: userData.preferences
            ? {
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
                  digest: "daily",
                },
                language: "en-US",
              }
            : undefined,
        };
        state.initialized = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.initialized = true;
      });

    // Refresh token reducers
    builder
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout reducers
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.require2FA = false;
        state.userId = null;
        state.verificationId = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Update password reducers
    builder
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        // Convert UserData to User interface
        const userData = action.payload.user;
        state.user = {
          id: userData.id,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role || "user",
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          mfaEnabled: userData.twoFactorEnabled,
          lastLogin: userData.lastLogin,
          preferences: userData.preferences
            ? {
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
                  digest: "daily",
                },
                language: "en-US",
              }
            : undefined,
        };
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Reset password reducers
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Convert UserData to User interface
        const userData = action.payload.user;
        state.user = {
          id: userData.id,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role || "user",
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          mfaEnabled: userData.twoFactorEnabled,
          lastLogin: userData.lastLogin,
          preferences: userData.preferences
            ? {
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
                  digest: "daily",
                },
                language: "en-US",
              }
            : undefined,
        };
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearError,
  clearAuth,
  updateUserPreferences,
  setUser,
  setAuthenticated,
  setInitialized,
  clearAuthState,
  setSuccess,
  mfaRequired,
  mfaVerificationComplete,
} = authSlice.actions;

// Export selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectRequire2FA = (state: RootState) => state.auth.require2FA;
// Properly typed selectors
export const selectUserId = (state: RootState) => state.auth.userId;
export const selectVerificationId = (state: RootState) =>
  state.auth.verificationId;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthSuccess = (state: RootState) => state.auth.success;
export const selectAuthInitialized = (state: RootState) =>
  state.auth.initialized;

export default authSlice.reducer;
