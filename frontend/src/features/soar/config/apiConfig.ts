/**
 * API Configuration for SOAR module
 *
 * This file centralizes API configuration to facilitate:
 * 1. Environment-specific API endpoints (dev, staging, prod)
 * 2. Consistent timeout and retry policies
 * 3. Common error handling
 */

// Environment detection
const isDevelopment = process.env.NODE_ENV === "development";
const isStaging = process.env.REACT_APP_ENV === "staging";

// Base URL configuration
const API_URLS = {
  development: "http://localhost:8080/api",
  staging: "https://staging-api.logware-security.com/api",
  production: "https://api.logware-security.com/api",
};

// Determine which base URL to use
let baseUrl = API_URLS.production;
if (isDevelopment) {
  baseUrl = API_URLS.development;
} else if (isStaging) {
  baseUrl = API_URLS.staging;
}

// Module-specific endpoints
export const SOAR_API_ENDPOINTS = {
  BASE: `${baseUrl}/soar`,
  PLAYBOOKS: `${baseUrl}/soar/playbooks`,
  RULES: `${baseUrl}/soar/rules`,
  ACTIONS: `${baseUrl}/soar/actions`,
  EXECUTIONS: `${baseUrl}/soar/executions`,
  HUNTS: `${baseUrl}/soar/hunts`,
  INCIDENTS: `${baseUrl}/soar/incidents`,
  AUDIT_LOGS: `${baseUrl}/soar/audit-logs`,
  COLLABORATION: `${baseUrl}/soar/collaboration`,
};

export const ANOMALY_API_ENDPOINTS = {
  BASE: `${baseUrl}/soar/anomaly`,
  USER_BEHAVIOR: `${baseUrl}/soar/anomaly/user-behavior`,
  NETWORK: `${baseUrl}/soar/anomaly/network`,
  SYSTEM: `${baseUrl}/soar/anomaly/system`,
  MODELS: `${baseUrl}/soar/anomaly/models`,
  CORRELATIONS: `${baseUrl}/soar/anomaly/correlations`,
  ANALYTICS: `${baseUrl}/soar/anomaly/analytics`,
};

// API request configuration
export const API_CONFIG = {
  // Default timeout in milliseconds
  TIMEOUT: 30000,

  // Retry configuration for transient errors
  RETRY: {
    MAX_RETRIES: 3,
    BASE_DELAY: 1000, // milliseconds
    MAX_DELAY: 5000, // milliseconds
  },

  // Request headers
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Error codes mapping for consistent error handling
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error messages for user-friendly display
export const ERROR_MESSAGES = {
  DEFAULT: "An unexpected error occurred.",
  NETWORK: "Network error. Please check your internet connection.",
  TIMEOUT: "Request timed out. Please try again.",
  SERVER: "Server error. Our team has been notified.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
};

export default {
  SOAR_API_ENDPOINTS,
  ANOMALY_API_ENDPOINTS,
  API_CONFIG,
  ERROR_CODES,
  ERROR_MESSAGES,
};
