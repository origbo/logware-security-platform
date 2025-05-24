import { TokenExpiredError, ErrorType, ErrorSeverity, ErrorResponse } from "../types/errors";
import { store } from "../store/store";
import { logout } from "../features/auth/slice/authSlice";

// We now import ErrorResponse from ../types/errors

// Error callback function type
export type ErrorCallback = (error: ErrorResponse) => void;

// Global error handler class
class ErrorHandler {
  private static instance: ErrorHandler;
  private globalCallbacks: ErrorCallback[] = [];
  private errorLog: ErrorResponse[] = [];
  private maxLogSize = 100;

  private constructor() {
    // Initialize with default error handling
  }

  // Get singleton instance
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Register global error callback
  public registerCallback(callback: ErrorCallback): void {
    this.globalCallbacks.push(callback);
  }

  // Remove a callback
  public removeCallback(callback: ErrorCallback): void {
    this.globalCallbacks = this.globalCallbacks.filter((cb) => cb !== callback);
  }

  // Handle error and trigger callbacks
  public handleError(error: any): ErrorResponse {
    const errorResponse = this.parseError(error);

    // Add to error log
    this.logError(errorResponse);

    // Trigger all callbacks
    this.globalCallbacks.forEach((callback) => {
      try {
        callback(errorResponse);
      } catch (callbackError) {
        console.error("Error in error callback:", callbackError);
      }
    });

    // Handle token expiration
    if (
      errorResponse.type === ErrorType.AUTHENTICATION &&
      errorResponse.code === "TOKEN_EXPIRED"
    ) {
      this.handleTokenExpired();
    }

    return errorResponse;
  }

  // Handle token expired error
  private handleTokenExpired(): void {
    // Dispatch logout action to clear auth state
    store.dispatch(logout());

    // You could also redirect to login page here
    // window.location.href = '/login';
  }

  // Parse various error types into standard format
  private parseError(error: any): ErrorResponse {
    const now = new Date().toISOString();

    // Handle axios errors
    if (error.isAxiosError) {
      return this.parseAxiosError(error, now);
    }

    // Handle TokenExpiredError
    if (error instanceof TokenExpiredError) {
      return {
        type: ErrorType.AUTHENTICATION,
        severity: ErrorSeverity.ERROR,
        message: "Your session has expired. Please login again.",
        code: "TOKEN_EXPIRED",
        timestamp: now,
      };
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.ERROR,
        message: error.message || "An unknown error occurred",
        timestamp: now,
      };
    }

    // Handle string errors
    if (typeof error === "string") {
      return {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.ERROR,
        message: error,
        timestamp: now,
      };
    }

    // Default error response
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      message: "An unknown error occurred",
      timestamp: now,
      details: error,
    };
  }

  // Parse axios error into standard format
  private parseAxiosError(error: any, timestamp: string): ErrorResponse {
    const status = error.response?.status;
    const data = error.response?.data;

    // No response (network error)
    if (!error.response) {
      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.ERROR,
        message: "Network error. Please check your internet connection.",
        code: "NETWORK_ERROR",
        timestamp,
      };
    }

    // Handle based on status code
    switch (status) {
      case 400:
        return {
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.WARNING,
          message: data?.message || "Invalid request",
          code: data?.code || "VALIDATION_ERROR",
          details: data?.errors || data?.details,
          timestamp,
        };

      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.ERROR,
          message: data?.message || "Authentication failed",
          code: data?.code || "AUTHENTICATION_ERROR",
          timestamp,
        };

      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          severity: ErrorSeverity.ERROR,
          message:
            data?.message ||
            "You do not have permission to perform this action",
          code: data?.code || "AUTHORIZATION_ERROR",
          timestamp,
        };

      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          severity: ErrorSeverity.WARNING,
          message: data?.message || "The requested resource was not found",
          code: data?.code || "NOT_FOUND",
          timestamp,
        };

      case 408:
      case 504:
        return {
          type: ErrorType.TIMEOUT,
          severity: ErrorSeverity.WARNING,
          message: data?.message || "Request timed out",
          code: data?.code || "TIMEOUT",
          timestamp,
        };

      case 500:
      case 502:
      case 503:
        return {
          type: ErrorType.SERVER,
          severity: ErrorSeverity.ERROR,
          message: data?.message || "Server error. Please try again later.",
          code: data?.code || "SERVER_ERROR",
          details: data?.errors || data?.details,
          timestamp,
        };

      default:
        return {
          type: ErrorType.UNKNOWN,
          severity: ErrorSeverity.ERROR,
          message:
            data?.message ||
            `Error ${status}: ${error.message || "Unknown error"}`,
          code: data?.code,
          details: data,
          timestamp,
        };
    }
  }

  // Add error to log
  private logError(error: ErrorResponse): void {
    this.errorLog.unshift(error);

    // Limit log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV !== "production") {
      console.error("Error handled:", error);
    }
  }

  // Get error log
  public getErrorLog(): ErrorResponse[] {
    return [...this.errorLog];
  }

  // Clear error log
  public clearErrorLog(): void {
    this.errorLog = [];
  }
}

export const errorHandler = ErrorHandler.getInstance();
export default errorHandler;
