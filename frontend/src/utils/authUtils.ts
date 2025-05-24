import { TOKEN_KEY, REFRESH_TOKEN_KEY } from "../config/constants";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

/**
 * Gets the authentication headers for API requests
 * @returns Object with Authorization header if token exists
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Check if the token is expired
 * @param token JWT token
 * @returns boolean indicating if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Add a buffer of 30 seconds to account for any time differences
    return decoded.exp < currentTime - 30;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

/**
 * Get the user role from JWT token
 * @param token JWT token
 * @returns User role or null if not found
 */
export const getUserRoleFromToken = (token: string): string | null => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.role || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if token exists and is valid
 * @returns boolean indicating if token is valid
 */
export const hasValidToken = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  return !isTokenExpired(token);
};

/**
 * Initialize axios interceptors for token refresh
 * @param authRefreshFunction Function to refresh the token
 */
export const initializeAuthInterceptors = (
  authRefreshFunction: () => Promise<string>
) => {
  // Request interceptor
  axios.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem(TOKEN_KEY);

      // If token exists and is expired, try to refresh it
      if (token && isTokenExpired(token)) {
        try {
          const newToken = await authRefreshFunction();

          // If we have a new token, update the request
          if (newToken) {
            config.headers["Authorization"] = `Bearer ${newToken}`;
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          // Token refresh failed, continue with request and let response handler deal with 401
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for handling 401 Unauthorized
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't already tried to refresh the token
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const newToken = await authRefreshFunction();

          // If we got a new token, retry the original request
          if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error("Error in refresh token:", refreshError);
          // Token refresh failed, redirect to login or dispatch logout action
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Clear all authentication tokens from storage
 */
export const clearAuthTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Set authentication tokens in storage
 * @param token Access token
 * @param refreshToken Refresh token
 */
export const setAuthTokens = (token: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Extract user ID from token
 * @param token JWT token
 * @returns User ID or null if not found
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.sub || decoded.userId || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if user has a specific role
 * @param requiredRole Role to check for
 * @returns boolean indicating if user has the required role
 */
export const hasRole = (requiredRole: string): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  try {
    const userRole = getUserRoleFromToken(token);
    return userRole === requiredRole;
  } catch (error) {
    return false;
  }
};

/**
 * Get token expiration time in seconds
 * @param token JWT token
 * @returns Expiration time in seconds or 0 if error
 */
export const getTokenExpirationTime = (token: string): number => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp || 0;
  } catch (error) {
    console.error("Error decoding token:", error);
    return 0;
  }
};
