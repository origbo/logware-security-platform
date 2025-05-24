import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN_KEY } from "../../config/constants";
import {
  ErrorResponse,
  ErrorSeverity,
  ErrorType
} from "../../types/errors";

// Define the base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Extended error analytics type
export interface ErrorAnalyticsReport extends ErrorResponse {
  userAgent: string;
  platform: string;
  screenSize: string;
  url: string;
  route: string;
  userId?: string;
  userRole?: string;
  sessionId: string;
  breadcrumbs: ErrorBreadcrumb[];
}

// Error categories for easier classification
export enum ErrorCategory {
  NAVIGATION = "navigation",
  UI = "ui",
  NETWORK = "network",
  USER = "user",
  SYSTEM = "system",
  AUTH = "auth",
}

// Error breadcrumb for tracking user actions before error
export interface ErrorBreadcrumb {
  timestamp: string;
  category: ErrorCategory | string;
  action: string;
  data?: Record<string, any>;
  message?: string;
  label?: string;
  value?: number;
  error?: Error | unknown;
}

// Error analytics service class
class ErrorAnalyticsService {
  private static instance: ErrorAnalyticsService;
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private sessionId: string;
  private initialized = false;

  private constructor() {
    // Generate unique session ID
    this.sessionId = this.generateSessionId();

    // Initialize event listeners
    this.init();
  }

  // Get singleton instance
  public static getInstance(): ErrorAnalyticsService {
    if (!ErrorAnalyticsService.instance) {
      ErrorAnalyticsService.instance = new ErrorAnalyticsService();
    }
    return ErrorAnalyticsService.instance;
  }

  // Initialize the service
  private init(): void {
    if (this.initialized) {
      return;
    }

    // Track navigation events
    if (typeof window !== "undefined") {
      // Track page navigation
      window.addEventListener("popstate", () => {
        this.addBreadcrumb({
          category: "navigation",
          action: "popstate",
          data: { url: window.location.href },
        });
      });

      // Track network errors - capture failed fetch/XHR requests
      const originalFetch = window.fetch;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        try {
          const response = await originalFetch(input, init);
          if (!response.ok) {
            this.addBreadcrumb({
              category: "network",
              action: "fetch-error",
              data: {
                url: typeof input === "string" ? input : input.toString(),
                status: response.status,
                statusText: response.statusText,
              },
            });
          }
          return response;
        } catch (error) {
          this.addBreadcrumb({
            category: "network",
            action: "fetch-exception",
            data: {
              url: typeof input === "string" ? input : input.toString(),
              error: error instanceof Error ? error.message : String(error),
            },
          });
          throw error;
        }
      };

      // Track clicks
      document.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        if (target && target.tagName) {
          this.addBreadcrumb({
            category: "ui",
            action: "click",
            data: {
              tagName: target.tagName.toLowerCase(),
              id: target.id || undefined,
              className: target.className || undefined,
              text: target.textContent?.substring(0, 50) || undefined,
            },
          });
        }
      });

      this.initialized = true;
    }
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Add a breadcrumb of user activity
  public addBreadcrumb(breadcrumb: Omit<ErrorBreadcrumb, "timestamp">): void {
    const fullBreadcrumb: ErrorBreadcrumb = {
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    };

    // Add to beginning of array for newest-first order
    this.breadcrumbs.unshift(fullBreadcrumb);

    // Limit breadcrumb count
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(0, this.maxBreadcrumbs);
    }
  }

  // Get all breadcrumbs
  public getBreadcrumbs(): ErrorBreadcrumb[] {
    return [...this.breadcrumbs];
  }

  // Clear breadcrumbs
  public clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  // Create error analytics report from error response
  public createErrorReport(
    error: ErrorResponse,
    userId?: string,
    userRole?: string
  ): ErrorAnalyticsReport {
    return {
      ...error,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      url: window.location.href,
      route: window.location.pathname,
      userId,
      userRole,
      sessionId: this.sessionId,
      breadcrumbs: this.getBreadcrumbs(),
    };
  }

  // Log custom error
  public logCustomError(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    type: ErrorType = ErrorType.UNKNOWN,
    details?: Record<string, any>
  ): void {
    const error: ErrorResponse = {
      type,
      severity,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    // Report to analytics API
    this.reportError(error);
  }

  // Report error to analytics API
  public async reportError(
    error: ErrorResponse,
    userId?: string,
    userRole?: string
  ): Promise<void> {
    try {
      const report = this.createErrorReport(error, userId, userRole);

      // Log to console in development
      if (process.env.NODE_ENV !== "production") {
        console.group("Error Analytics Report");
        console.error(report.message);
        console.info("Error details:", report);
        console.groupEnd();
      }

      // Send to API
      const token = localStorage.getItem(TOKEN_KEY);

      const response = await fetch(`${API_URL}/analytics/errors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        console.error("Failed to send error report to analytics API");
      }
    } catch (reportError) {
      // Don't let reporting errors cause more issues
      console.error("Error while reporting error:", reportError);
    }
  }
}

// Create and export singleton instance
export const errorAnalytics = ErrorAnalyticsService.getInstance();

// RTK Query API for error analytics
export const errorAnalyticsApi = createApi({
  reducerPath: "errorAnalyticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/analytics/`,
    prepareHeaders: (headers) => {
      // Get token from localStorage
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ErrorStats"],
  endpoints: (builder) => ({
    // Get error statistics for dashboard
    getErrorStatistics: builder.query<ErrorStatistics, TimeRange>({
      query: ({ startDate, endDate }) =>
        `errors/statistics?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ["ErrorStats"],
    }),

    // Get recent errors
    getRecentErrors: builder.query<ErrorAnalyticsReport[], { limit?: number }>({
      query: ({ limit = 10 }) => `errors/recent?limit=${limit}`,
      providesTags: ["ErrorStats"],
    }),

    // Get error details
    getErrorDetails: builder.query<ErrorAnalyticsReport, string>({
      query: (errorId) => `errors/${errorId}`,
    }),
  }),
});

// Time range for queries
export interface TimeRange {
  startDate: string;
  endDate: string;
}

// Error statistics interface
export interface ErrorStatistics {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByTime: {
    timestamp: string;
    count: number;
  }[];
  topErrors: {
    message: string;
    count: number;
    type: ErrorType;
    lastSeen: string;
  }[];
}

// Function to easily log events for analytics
export function logEvent(eventData: {
  category: ErrorCategory | string;
  action: string;
  label?: string;
  value?: number;
  error?: Error | unknown;
  data?: Record<string, any>;
}): void {
  const { category, action, label, value, error, data } = eventData;

  // Create breadcrumb data
  const breadcrumbData: Omit<ErrorBreadcrumb, "timestamp"> = {
    category,
    action,
    data: { ...data },
  };

  // Add optional fields if provided
  if (label) breadcrumbData.label = label;
  if (value !== undefined) breadcrumbData.value = value;
  if (error) breadcrumbData.error = error;

  // Add to breadcrumbs
  errorAnalytics.addBreadcrumb(breadcrumbData);

  // If this is an error event, also log to error reporting
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errorAnalytics.logCustomError(
      `${action}: ${errorMessage}`,
      ErrorSeverity.ERROR,
      ErrorType.UNKNOWN,
      { category, action, label, value, error: errorMessage }
    );
  }
}

// Export hooks for using the API
export const {
  useGetErrorStatisticsQuery,
  useGetRecentErrorsQuery,
  useGetErrorDetailsQuery,
} = errorAnalyticsApi;

export default errorAnalytics;
