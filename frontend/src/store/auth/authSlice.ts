import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import jwtDecode from "jwt-decode";

// Create reference to the store for the axios interceptor
import { store } from "../store";

// Define API base URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// Define types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  preferences: {
    theme: "light" | "dark" | "system";
    dashboardLayout: Record<string, any>;
    notifications: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface JwtPayload {
  id: string;
  type: string;
  iat: number;
  exp: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  require2FA: boolean;
  userId2FA: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

interface TwoFactorCredentials {
  userId: string;
  token: string;
}

interface AuthResponse {
  status: string;
  accessToken: string;
  refreshToken: string;
  data: {
    user: User;
  };
  require2FA?: boolean;
  userId?: string;
}

interface RefreshTokenResponse {
  status: string;
  accessToken: string;
  refreshToken: string;
}

// Create token refresh interceptor
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to request headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers!.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // No refresh token, logout
          store.dispatch(logout());
          return Promise.reject(error);
        }

        // Attempt to refresh token
        const response = await axios.post<RefreshTokenResponse>(
          `${API_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Update original request auth header and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        "/auth/login",
        credentials
      );

      // Handle 2FA requirement
      if (response.data.require2FA) {
        return {
          require2FA: true,
          userId2FA: response.data.userId,
        };
      }

      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

export const verify2FA = createAsyncThunk(
  "auth/verify2FA",
  async (credentials: TwoFactorCredentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        "/auth/verify-2fa",
        credentials
      );

      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid 2FA code. Please try again."
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        "/auth/register",
        credentials
      );

      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        // Send logout request to invalidate token on server
        await axiosInstance.post("/auth/logout", { refreshToken });
      }

      // Clear tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return true;
    } catch (error: any) {
      // Clear tokens from localStorage even if server request fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return rejectWithValue(
        error.response?.data?.message || "Logout failed. Please try again."
      );
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        return rejectWithValue("No refresh token available");
      }

      const response = await axios.post<RefreshTokenResponse>(
        `${API_URL}/auth/refresh-token`,
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      return response.data;
    } catch (error: any) {
      // Clear tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return rejectWithValue(
        error.response?.data?.message || "Session expired. Please log in again."
      );
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        return rejectWithValue("No tokens available");
      }

      // Check if access token is expired
      const decoded = jwtDecode<JwtPayload>(accessToken);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Access token expired, try to refresh
        return dispatch(refreshToken()).unwrap();
      }

      // Token is valid, fetch current user
      const response = await axiosInstance.get<{
        status: string;
        data: { user: User };
      }>("/auth/me");

      return {
        user: response.data.data.user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // Clear tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return rejectWithValue("Authentication failed");
    }
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  error: null,
  require2FA: false,
  userId2FA: null,
};

// Create the auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    reset2FARequirement: (state) => {
      state.require2FA = false;
      state.userId2FA = null;
    },
    updateUserPreferences: (
      state,
      action: PayloadAction<Partial<User["preferences"]>>
    ) => {
      if (state.user) {
        state.user.preferences = {
          ...state.user.preferences,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;

      // Handle 2FA requirement
      if (action.payload.require2FA) {
        state.require2FA = true;
        state.userId2FA = action.payload.userId2FA;
        return;
      }

      // Regular login success
      state.isAuthenticated = true;
      state.user = action.payload.data.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Verify 2FA
    builder.addCase(verify2FA.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verify2FA.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.require2FA = false;
      state.userId2FA = null;
    });
    builder.addCase(verify2FA.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    });
    builder.addCase(logout.rejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    });

    // Check auth
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;

      if (action.payload.user) {
        state.user = action.payload.user;
      }

      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    });

    // Refresh token
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    });
    builder.addCase(refreshToken.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    });
  },
});

export const { clearError, reset2FARequirement, updateUserPreferences } =
  authSlice.actions;

export default authSlice.reducer;
