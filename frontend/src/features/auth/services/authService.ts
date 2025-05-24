/**
 * Authentication Service
 *
 * Handles JWT-based authentication with refresh token rotation and MFA support.
 * Provides methods for login, logout, token refreshing, and session management.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../../store/store";

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  mfaEnabled: boolean;
  lastLogin?: string;
  preferences?: Record<string, any>;
}

export type UserRole = "admin" | "analyst" | "viewer" | "auditor";

export type Permission =
  | "manage_users"
  | "manage_playbooks"
  | "manage_cases"
  | "run_playbooks"
  | "view_analytics"
  | "manage_integrations"
  | "manage_settings";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  requiresMfa: boolean;
  mfaToken?: string;
}

export interface MfaVerifyRequest {
  mfaToken: string;
  otp: string;
}

export interface MfaVerifyResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Auth API Service
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/auth",
    prepareHeaders: (headers, { getState }) => {
      // Get the token from auth state
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),

    verifyMfa: builder.mutation<MfaVerifyResponse, MfaVerifyRequest>({
      query: (mfaData) => ({
        url: "/mfa/verify",
        method: "POST",
        body: mfaData,
      }),
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (refreshData) => ({
        url: "/refresh",
        method: "POST",
        body: refreshData,
      }),
    }),

    setupMfa: builder.mutation<{ secretKey: string; qrCode: string }, void>({
      query: () => ({
        url: "/mfa/setup",
        method: "POST",
      }),
    }),

    enableMfa: builder.mutation<
      { success: boolean },
      { secretKey: string; otp: string }
    >({
      query: (data) => ({
        url: "/mfa/enable",
        method: "POST",
        body: data,
      }),
    }),

    disableMfa: builder.mutation<{ success: boolean }, { password: string }>({
      query: (data) => ({
        url: "/mfa/disable",
        method: "POST",
        body: data,
      }),
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => "/me",
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyMfaMutation,
  useRefreshTokenMutation,
  useSetupMfaMutation,
  useEnableMfaMutation,
  useDisableMfaMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;

// Helper function for token refresh
export const refreshAuthToken = async (
  refreshToken: string,
  dispatch: any,
  refreshTokenMutation: any
) => {
  try {
    const response = await refreshTokenMutation({ refreshToken }).unwrap();
    // Typically you'd dispatch an action to update your auth state with the new tokens
    return response;
  } catch (error) {
    // Handle refresh token failure
    return null;
  }
};

// Function to check if a user has a specific permission
export const hasPermission = (user: User | null, permission: Permission) => {
  if (!user) return false;

  // Admins have all permissions
  if (user.role === "admin") return true;

  // Check specific permission
  return user.permissions.includes(permission);
};

// Function to check if a token is expired
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    return true;
  }
};
