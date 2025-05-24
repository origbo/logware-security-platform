/**
 * Auth Slice
 *
 * Redux slice for managing authentication state including user data,
 * tokens, and multi-factor authentication state.
 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./services/authService";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  requiresMfa: boolean;
  mfaToken: string | null;
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: Boolean(localStorage.getItem("accessToken")),
  requiresMfa: false,
  mfaToken: null,
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user?: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;

      // Update state
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.error = null;

      if (user) {
        state.user = user;
      }

      // Store tokens in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    setMfaRequired: (
      state,
      action: PayloadAction<{ requiresMfa: boolean; mfaToken?: string }>
    ) => {
      state.requiresMfa = action.payload.requiresMfa;
      state.mfaToken = action.payload.mfaToken || null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    logOut: (state) => {
      // Clear auth state
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.requiresMfa = false;
      state.mfaToken = null;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const {
  setCredentials,
  setUser,
  setMfaRequired,
  setError,
  clearError,
  setLoading,
  logOut,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectRequiresMfa = (state: { auth: AuthState }) =>
  state.auth.requiresMfa;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
