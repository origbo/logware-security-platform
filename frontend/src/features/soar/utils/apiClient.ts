import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { API_CONFIG, ERROR_MESSAGES } from "../config/apiConfig";
import { logError } from "./errorHandler";

/**
 * Centralized API client for SOAR module
 *
 * Features:
 * - Authorization header injection
 * - Consistent error handling
 * - Request/response logging
 * - Request timeout handling
 * - Retry logic for failed requests
 */

class ApiClient {
  private client: AxiosInstance;
  private retryCount = 0;

  constructor() {
    this.client = axios.create({
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  /**
   * Configure request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Get auth token from storage or state management
        const token = localStorage.getItem("auth_token");

        // Add authorization header if token exists
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in development
        if (process.env.NODE_ENV === "development") {
          console.log(
            `API Request: ${config.method?.toUpperCase()} ${config.url}`
          );
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Reset retry count on successful response
        this.retryCount = 0;

        // Log responses in development
        if (process.env.NODE_ENV === "development") {
          console.log(
            `API Response: ${response.status} ${response.config.url}`
          );
        }

        return response;
      },
      async (error: AxiosError) => {
        // Log error details
        logError(error);

        // Handle expired auth token
        if (error.response?.status === 401) {
          // Attempt to refresh token or logout user
          const refreshed = await this.refreshAuthToken();
          if (refreshed && error.config) {
            // Retry the request with new token
            return this.client(error.config);
          } else {
            // Force logout if token refresh fails
            this.handleAuthFailure();
          }
        }

        // Retry logic for certain errors
        if (this.shouldRetry(error) && error.config) {
          const retryConfig = error.config;
          this.retryCount++;

          // Calculate delay with exponential backoff
          const delay = Math.min(
            API_CONFIG.RETRY.BASE_DELAY * Math.pow(2, this.retryCount - 1),
            API_CONFIG.RETRY.MAX_DELAY
          );

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Retry the request
          return this.client(retryConfig);
        }

        // Normalize error response
        const errorMessage = this.getErrorMessage(error);

        return Promise.reject({
          ...error,
          userMessage: errorMessage,
        });
      }
    );
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    // Don't retry if we've hit the max retry count
    if (this.retryCount >= API_CONFIG.RETRY.MAX_RETRIES) {
      return false;
    }

    // Don't retry for client errors (except timeout/network errors)
    if (
      error.response &&
      error.response.status >= 400 &&
      error.response.status < 500
    ) {
      return false;
    }

    // Retry server errors
    if (error.response && error.response.status >= 500) {
      return true;
    }

    // Retry network errors
    if (error.code === "ECONNABORTED" || !error.response) {
      return true;
    }

    return false;
  }

  /**
   * Extract user-friendly error message
   */
  private getErrorMessage(error: AxiosError): string {
    // API returned an error message
    if (error.response?.data && typeof error.response.data === "object") {
      const data = error.response.data as any;
      if (data.message) return data.message;
      if (data.error?.message) return data.error.message;
    }

    // Network or timeout error
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return ERROR_MESSAGES.TIMEOUT;
      }
      return ERROR_MESSAGES.NETWORK;
    }

    // HTTP status error
    switch (error.response.status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 500:
        return ERROR_MESSAGES.SERVER;
      default:
        return ERROR_MESSAGES.DEFAULT;
    }
  }

  /**
   * Refresh the authentication token
   */
  private async refreshAuthToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        return false;
      }

      // Call token refresh endpoint
      const response = await axios.post("/api/auth/refresh", {
        refreshToken,
      });

      // Save new tokens
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem("refresh_token", response.data.refreshToken);
        }
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle authentication failure
   */
  private handleAuthFailure(): void {
    // Clear tokens
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");

    // Redirect to login
    window.location.href = "/login?session=expired";
  }

  /**
   * Execute GET request
   */
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get<T>(url, config).then((response) => response.data);
  }

  /**
   * Execute POST request
   */
  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.client
      .post<T>(url, data, config)
      .then((response) => response.data);
  }

  /**
   * Execute PUT request
   */
  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.client
      .put<T>(url, data, config)
      .then((response) => response.data);
  }

  /**
   * Execute PATCH request
   */
  public patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.client
      .patch<T>(url, data, config)
      .then((response) => response.data);
  }

  /**
   * Execute DELETE request
   */
  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete<T>(url, config).then((response) => response.data);
  }
}

// Export a singleton instance of the API client
export const apiClient = new ApiClient();

export default apiClient;
