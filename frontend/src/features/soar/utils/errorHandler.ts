import { ERROR_CODES, ERROR_MESSAGES } from "../config/apiConfig";
import { Notification } from "../components/common/FeedbackSnackbar";

/**
 * Centralized error handling for the SOAR module
 *
 * This utility provides:
 * 1. Consistent error formatting
 * 2. Error classification
 * 3. User-friendly error messages
 * 4. Error logging
 */

// Error categories
export enum ErrorCategory {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  PERMISSION = "permission",
  VALIDATION = "validation",
  SERVER = "server",
  CLIENT = "client",
  UNKNOWN = "unknown",
}

// Error severity for logging and display
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

// Interface for detailed error information
export interface ErrorDetails {
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  code?: number;
  source?: string;
  timestamp: Date;
  raw?: any; // Original error object
  stackTrace?: string;
}

/**
 * Process and categorize an error from any source
 */
export function processError(error: any): ErrorDetails {
  const timestamp = new Date();
  let category = ErrorCategory.UNKNOWN;
  let severity = ErrorSeverity.ERROR;
  let message = ERROR_MESSAGES.DEFAULT;
  let code;
  let source;
  let stackTrace;

  // Handle network errors (from fetch)
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    category = ErrorCategory.NETWORK;
    message = ERROR_MESSAGES.NETWORK;
  }
  // Handle timeout errors
  else if (error.name === "TimeoutError" || error.code === "ETIMEDOUT") {
    category = ErrorCategory.NETWORK;
    message = ERROR_MESSAGES.TIMEOUT;
  }
  // Handle API errors with status codes
  else if (error.status) {
    code = error.status;

    // Extract message if available
    if (error.data?.message) {
      message = error.data.message;
    }

    // Categorize based on status code
    if (code === ERROR_CODES.UNAUTHORIZED) {
      category = ErrorCategory.AUTHENTICATION;
      message = ERROR_MESSAGES.UNAUTHORIZED;
      severity = ErrorSeverity.WARNING;
    } else if (code === ERROR_CODES.FORBIDDEN) {
      category = ErrorCategory.PERMISSION;
      message = ERROR_MESSAGES.UNAUTHORIZED;
      severity = ErrorSeverity.WARNING;
    } else if (code === ERROR_CODES.NOT_FOUND) {
      category = ErrorCategory.CLIENT;
      message = ERROR_MESSAGES.NOT_FOUND;
      severity = ErrorSeverity.WARNING;
    } else if (code >= 400 && code < 500) {
      category = ErrorCategory.VALIDATION;
      message = error.data?.message || ERROR_MESSAGES.VALIDATION;
      severity = ErrorSeverity.WARNING;
    } else if (code >= 500) {
      category = ErrorCategory.SERVER;
      message = ERROR_MESSAGES.SERVER;
      severity = ErrorSeverity.ERROR;
    }
  }
  // Handle validation errors
  else if (error.validationErrors || error.name === "ValidationError") {
    category = ErrorCategory.VALIDATION;
    message = error.message || ERROR_MESSAGES.VALIDATION;
    severity = ErrorSeverity.WARNING;
  }
  // Handle other errors with messages
  else if (error.message) {
    message = error.message;
  }

  // Get source if available
  if (error.source) {
    source = error.source;
  } else if (error.config?.url) {
    source = error.config.url;
  }

  // Get stack trace if available (and in development)
  if (process.env.NODE_ENV === "development" && error.stack) {
    stackTrace = error.stack;
  }

  return {
    message,
    category,
    severity,
    code,
    source,
    timestamp,
    raw: error,
    stackTrace,
  };
}

/**
 * Create a notification from an error
 */
export function createErrorNotification(
  error: any,
  id = `error-${Date.now()}`
): Notification {
  const errorDetails = processError(error);

  return {
    id,
    message: "Error Occurred",
    description: errorDetails.message,
    type: errorDetails.severity === ErrorSeverity.WARNING ? "warning" : "error",
    autoHideDuration: 6000,
  };
}

/**
 * Log an error to the console and potentially to a logging service
 */
export function logError(error: any): void {
  const errorDetails = processError(error);

  // Always log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("SOAR Module Error:", errorDetails);

    if (errorDetails.stackTrace) {
      console.error(errorDetails.stackTrace);
    }
  }

  // TODO: Send to logging service in production
  // This would typically use an analytics or logging service
  if (process.env.NODE_ENV === "production") {
    // Example: sendToLoggingService(errorDetails);
    // For now, just log critical errors to console
    if (errorDetails.severity === ErrorSeverity.CRITICAL) {
      console.error("CRITICAL ERROR:", errorDetails.message);
    }
  }
}

/**
 * Handle an error completely - process, notify, and log
 */
export function handleError(
  error: any,
  notificationCallback?: (notification: Notification) => void
): ErrorDetails {
  const errorDetails = processError(error);

  // Log the error
  logError(error);

  // Create notification if callback provided
  if (notificationCallback) {
    const notification = createErrorNotification(error);
    notificationCallback(notification);
  }

  return errorDetails;
}

export default {
  processError,
  createErrorNotification,
  logError,
  handleError,
  ErrorCategory,
  ErrorSeverity,
};
