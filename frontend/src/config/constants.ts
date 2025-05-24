/**
 * Application-wide constants
 */

// API configuration
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

// Auth related constants
export const TOKEN_KEY = "logware_token";
export const REFRESH_TOKEN_KEY = "logware_refresh_token";
export const USER_STORAGE_KEY = "logware_user";

// MFA related constants
export const MFA_STORAGE_KEY = "logware_mfa_verification";
export const MFA_USER_ID_KEY = "logware_mfa_user_id";

// Theme constants
export const THEME_STORAGE_KEY = "logware_theme";
export const DEFAULT_THEME = "light";
export const DARK_THEME = "dark";

// User preferences
export const USER_PREFERENCES_KEY = "logware_user_preferences";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Date format
export const DEFAULT_DATE_FORMAT = "MMM DD, YYYY";
export const DEFAULT_TIME_FORMAT = "HH:mm:ss";
export const DEFAULT_DATETIME_FORMAT = "MMM DD, YYYY HH:mm:ss";

// Animation durations
export const ANIMATION_DURATION = 300; // ms

// Error reporting
export const ERROR_REPORTING_ENDPOINT = "/api/error-reporting";
export const MAX_ERROR_BREADCRUMBS = 50;
