/**
 * SOAR Module Configuration
 *
 * This file centralizes configuration options for the SOAR module,
 * making it easier to customize behavior across environments.
 */

// Feature flags to enable/disable specific features
export const FEATURE_FLAGS = {
  // Core features
  ENABLE_AUTOMATION: true,
  ENABLE_ANOMALY_DETECTION: true,
  ENABLE_THREAT_HUNTING: true,
  ENABLE_COLLABORATION: true,

  // Advanced features
  ENABLE_ML_EXPLANATIONS: true,
  ENABLE_REAL_TIME_METRICS: true,
  ENABLE_CASE_INTEGRATION: true,
  ENABLE_MULTI_TENANT: false, // Enterprise feature
  ENABLE_CUSTOM_PLAYBOOKS: true,
  ENABLE_THIRD_PARTY_INTEGRATIONS: true,

  // UI/UX features
  ENABLE_DARK_MODE: true,
  ENABLE_DASHBOARD_CUSTOMIZATION: true,
  ENABLE_EXPORT_FEATURES: true,
  ENABLE_NOTIFICATIONS: true,
};

// Module settings
export const SETTINGS = {
  // Data refresh intervals (in milliseconds)
  REFRESH_INTERVALS: {
    DASHBOARD: 60000, // 1 minute
    ACTIVE_EXECUTIONS: 10000, // 10 seconds
    ANOMALIES: 30000, // 30 seconds
    ALERTS: 15000, // 15 seconds
    COLLABORATION: 5000, // 5 seconds for real-time collaboration
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    PAGINATION_OPTIONS: [10, 20, 50, 100],
  },

  // Data visualization
  VISUALIZATION: {
    DEFAULT_CHART_HEIGHT: 300,
    DEFAULT_CHART_WIDTH: "100%",
    COLOR_PALETTE: [
      "#4285F4",
      "#34A853",
      "#FBBC05",
      "#EA4335", // Primary colors
      "#8AB4F8",
      "#7BC8A4",
      "#FDE293",
      "#F28B82", // Secondary colors
      "#D2E3FC",
      "#CEEAD6",
      "#FEEFE3",
      "#FCE8E6", // Tertiary colors
    ],
    DATE_RANGE_OPTIONS: [
      { label: "Last 24 hours", value: "24h" },
      { label: "Last 7 days", value: "7d" },
      { label: "Last 30 days", value: "30d" },
      { label: "Last 90 days", value: "90d" },
      { label: "Custom range", value: "custom" },
    ],
  },

  // Layouts and containers
  LAYOUTS: {
    DASHBOARD_GRID_COLUMNS: 12,
    DASHBOARD_GRID_ROW_HEIGHT: 50,
    DASHBOARD_DEFAULT_LAYOUTS: {
      xs: [
        { i: "metrics", x: 0, y: 0, w: 12, h: 6 },
        { i: "active-executions", x: 0, y: 6, w: 12, h: 8 },
        { i: "recent-alerts", x: 0, y: 14, w: 12, h: 8 },
      ],
      md: [
        { i: "metrics", x: 0, y: 0, w: 12, h: 4 },
        { i: "active-executions", x: 0, y: 4, w: 6, h: 8 },
        { i: "recent-alerts", x: 6, y: 4, w: 6, h: 8 },
      ],
      lg: [
        { i: "metrics", x: 0, y: 0, w: 12, h: 3 },
        { i: "active-executions", x: 0, y: 3, w: 6, h: 8 },
        { i: "recent-alerts", x: 6, y: 3, w: 6, h: 8 },
      ],
    },
  },

  // Resource limits
  LIMITS: {
    MAX_ACTIVE_EXECUTIONS: 20,
    MAX_CONCURRENT_PLAYBOOKS: 5,
    MAX_RULE_COMPLEXITY: 10,
    MAX_FILE_UPLOAD_SIZE: 25 * 1024 * 1024, // 25MB
    MAX_SEARCH_RESULTS: 500,
  },
};

// Default configuration for various components
export const DEFAULTS = {
  // Default filter settings
  FILTERS: {
    INCIDENT_STATUS: "all",
    INCIDENT_SEVERITY: "all",
    INCIDENT_ASSIGNEE: "all",
    INCIDENT_DATE_RANGE: "30d",

    HUNT_CATEGORY: "all",
    HUNT_STATUS: "all",
    HUNT_DATA_SOURCE: "all",

    EXECUTION_STATUS: "all",
    EXECUTION_TYPE: "all",
    EXECUTION_DATE_RANGE: "7d",

    ANOMALY_TYPES: [],
    ANOMALY_SEVERITIES: [],
    ANOMALY_STATUSES: ["new", "investigating"],
  },

  // Dashboard configuration
  DASHBOARD: {
    DEFAULT_TAB: 0,
    DEFAULT_AUTOMATION_TAB: 0,
    DEFAULT_ANOMALY_TAB: 0,
    DEFAULT_COLLABORATION_TAB: 0,
  },
};

// Environment-specific configuration
export const getEnvironmentConfig = () => {
  const isDev = process.env.NODE_ENV === "development";
  const isStaging = process.env.REACT_APP_ENV === "staging";

  // Configuration overrides for specific environments
  if (isDev) {
    return {
      // Development-specific settings
      MOCKS_ENABLED: true,
      FEATURE_FLAGS: {
        ...FEATURE_FLAGS,
        ENABLE_EXPERIMENTAL_FEATURES: true,
      },
      SETTINGS: {
        ...SETTINGS,
        REFRESH_INTERVALS: {
          ...SETTINGS.REFRESH_INTERVALS,
          // Slower refresh in development to reduce console noise
          DASHBOARD: 300000, // 5 minutes
          ACTIVE_EXECUTIONS: 30000, // 30 seconds
        },
      },
    };
  }

  if (isStaging) {
    return {
      // Staging-specific settings
      MOCKS_ENABLED: false,
      FEATURE_FLAGS: {
        ...FEATURE_FLAGS,
        ENABLE_EXPERIMENTAL_FEATURES: true,
      },
      SETTINGS: {
        ...SETTINGS,
      },
    };
  }

  // Production settings
  return {
    MOCKS_ENABLED: false,
    FEATURE_FLAGS,
    SETTINGS,
  };
};

export default {
  FEATURE_FLAGS,
  SETTINGS,
  DEFAULTS,
  getEnvironmentConfig,
};
