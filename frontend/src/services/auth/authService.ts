import axios from "axios";
import jwtDecode from "jwt-decode";

// Types for authentication
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  lastLogin?: string;
  profileImage?: string;
  // Additional properties for Redux compatibility
  twoFactorEnabled?: boolean;
  preferences?: {
    theme: "light" | "dark" | "system";
    dashboardLayout?: Record<string, any>;
    notifications?: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
  };
  phone?: string;
  position?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  requiresMfa?: boolean;
  mfaMethods?: string[];
  mfaToken?: string;
  userId?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// API URLs
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
const AUTH_ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  LOGOUT: `${API_URL}/auth/logout`,
  REFRESH_TOKEN: `${API_URL}/auth/refresh-token`,
  VERIFY_MFA: `${API_URL}/auth/verify-mfa`,
  RESET_PASSWORD: `${API_URL}/auth/reset-password`,
  REQUEST_PASSWORD_RESET: `${API_URL}/auth/request-password-reset`,
  CHANGE_PASSWORD: `${API_URL}/auth/change-password`,
  SETUP_MFA: `${API_URL}/auth/setup-mfa`,
  VERIFY_EMAIL: `${API_URL}/auth/verify-email`,
};

// Local storage keys
const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "logware_access_token",
  REFRESH_TOKEN: "logware_refresh_token",
  TOKEN_EXPIRY: "logware_token_expiry",
  USER: "logware_user",
};

// Configure axios instance for auth requests
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to handle token refresh
authAxios.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle token refresh on expired tokens
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If tokens expired and we're not already refreshing
    if (!isRefreshing) {
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(
          AUTH_ENDPOINTS.REFRESH_TOKEN,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const {
          accessToken,
          refreshToken: newRefreshToken,
          expiresAt,
        } = response.data;

        // Update stored tokens
        setAuthTokens({
          accessToken,
          refreshToken: newRefreshToken,
          expiresAt,
        });

        // Update auth header for the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process all queued requests with the new token
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry the original request
        return authAxios(originalRequest);
      } catch (refreshError) {
        // Process failed queue
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear auth data and redirect to login
        clearAuthData();
        // window.location.href = '/login'; // Let the auth context handle this

        return Promise.reject(refreshError);
      }
    }

    // If we're already refreshing, queue this request
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return authAxios(originalRequest);
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }
);

/**
 * Login user with credentials
 */
export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  try {
    const response = await authAxios.post(AUTH_ENDPOINTS.LOGIN, credentials);
    const data = response.data;

    // If MFA is required, don't store tokens yet
    if (data.requiresMfa) {
      return data;
    }

    // Store tokens and user data
    setAuthTokens(data.tokens);
    setUserData(data.user);

    return data;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Complete MFA verification
 */
export const verifyMfa = async (
  username: string,
  mfaCode: string,
  mfaToken: string
): Promise<LoginResponse> => {
  try {
    const response = await authAxios.post(AUTH_ENDPOINTS.VERIFY_MFA, {
      username,
      mfaCode,
      mfaToken,
    });
    const data = response.data;

    // Store tokens and user data after successful MFA
    setAuthTokens(data.tokens);
    setUserData(data.user);

    return data;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Inform the server about logout to invalidate the token
      await authAxios.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always clear local auth data regardless of server response
    clearAuthData();
  }
};

/**
 * Refresh authentication tokens
 */
export const refreshTokens = async (): Promise<RefreshTokenResponse> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );

    const {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    } = response.data;

    // Update stored tokens
    setAuthTokens({
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken: newRefreshToken, expiresAt };
  } catch (error) {
    clearAuthData();
    throw handleAuthError(error);
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await authAxios.post(AUTH_ENDPOINTS.REQUEST_PASSWORD_RESET, { email });
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  try {
    await authAxios.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      token,
      newPassword,
    });
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Change password for authenticated user
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    await authAxios.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Setup MFA for current user
 */
export const setupMfa = async (
  mfaType: "app" | "sms" | "email"
): Promise<{ secret?: string; qrCodeUrl?: string }> => {
  try {
    const response = await authAxios.post(AUTH_ENDPOINTS.SETUP_MFA, {
      mfaType,
    });
    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Verify user's email address
 */
export const verifyEmail = async (token: string): Promise<void> => {
  try {
    await authAxios.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
  } catch (error) {
    throw handleAuthError(error);
  }
};

// Helper functions for token management

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Store authentication tokens
 */
export const setAuthTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  localStorage.setItem(
    AUTH_STORAGE_KEYS.TOKEN_EXPIRY,
    tokens.expiresAt.toString()
  );
};

/**
 * Store user data
 */
export const setUserData = (user: User): void => {
  localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
};

/**
 * Get stored user data
 */
export const getUserData = (): User | null => {
  const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  }
  return null;
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY);
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  // Also clear legacy tokens for compatibility
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  const expiryTimestamp = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRY);

  if (!token || !expiryTimestamp) {
    return false;
  }

  // Check if token is expired
  const expiry = parseInt(expiryTimestamp, 10);
  const now = Date.now();

  return now < expiry;
};

/**
 * Get user roles from token
 */
export const getUserRoles = (): string[] => {
  const user = getUserData();
  return user?.roles || [];
};

/**
 * Check if user has required role
 */
export const hasRole = (requiredRole: string): boolean => {
  const roles = getUserRoles();
  return roles.includes(requiredRole);
};

/**
 * Check if user has any of the required roles
 */
export const hasAnyRole = (requiredRoles: string[]): boolean => {
  const roles = getUserRoles();
  return requiredRoles.some((role) => roles.includes(role));
};

/**
 * Get user permissions from token
 */
export const getUserPermissions = (): string[] => {
  const user = getUserData();
  return user?.permissions || [];
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (requiredPermission: string): boolean => {
  const permissions = getUserPermissions();
  return permissions.includes(requiredPermission);
};

/**
 * Check if user has all required permissions
 */
export const hasAllPermissions = (requiredPermissions: string[]): boolean => {
  const permissions = getUserPermissions();
  return requiredPermissions.every((permission) =>
    permissions.includes(permission)
  );
};

/**
 * Check if user has any of the required permissions
 */
export const hasAnyPermission = (requiredPermissions: string[]): boolean => {
  const permissions = getUserPermissions();
  return requiredPermissions.some((permission) =>
    permissions.includes(permission)
  );
};

/**
 * Get decoded token data
 */
export const getDecodedToken = (): any | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Handle authentication errors
 */
const handleAuthError = (error: any): Error => {
  if (axios.isAxiosError(error) && error.response) {
    const { status, data } = error.response;

    if (status === 401) {
      // Clear auth data on unauthorized
      clearAuthData();
    }

    // Return more descriptive error message if available
    if (data && data.message) {
      return new Error(data.message);
    }
  }

  // Default error message
  return error instanceof Error
    ? error
    : new Error("An error occurred during authentication");
};

// Auth service export
const authService = {
  login,
  logout,
  verifyMfa,
  refreshTokens,
  requestPasswordReset,
  resetPassword,
  changePassword,
  setupMfa,
  verifyEmail,
  isAuthenticated,
  getAccessToken,
  getRefreshToken,
  getUserData,
  hasRole,
  hasAnyRole,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getUserRoles,
  getUserPermissions,
};

export default authService;
