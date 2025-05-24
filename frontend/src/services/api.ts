import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "../store/auth/authSlice";

// Define API base URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// Define common response types
interface ApiResponse<T> {
  status: string;
  data: T;
}

// Alert types
export interface Alert {
  _id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  source: string;
  status: "new" | "acknowledged" | "resolved" | "false-positive";
  assignedTo?: string;
  acknowledgedBy?: {
    userId: string;
    timestamp: string;
  };
  resolvedBy?: {
    userId: string;
    timestamp: string;
    notes: string;
  };
  affectedAssets: string[];
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AlertsResponse {
  alerts: Alert[];
  total: number;
  page: number;
  limit: number;
}

export interface AlertFilters {
  severity?: ("critical" | "high" | "medium" | "low" | "info")[];
  status?: ("new" | "acknowledged" | "resolved" | "false-positive")[];
  source?: string[];
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Log types
export interface Log {
  _id: string;
  timestamp: string;
  source: string;
  sourceType: string;
  level: "debug" | "info" | "warning" | "error" | "critical";
  message: string;
  details: Record<string, any>;
  host: string;
  tags: string[];
}

export interface LogsResponse {
  logs: Log[];
  total: number;
  page: number;
  limit: number;
}

export interface LogFilters {
  level?: ("debug" | "info" | "warning" | "error" | "critical")[];
  source?: string[];
  sourceType?: string[];
  startDate?: string;
  endDate?: string;
  host?: string[];
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Vulnerability types
export interface Vulnerability {
  _id: string;
  title: string;
  description: string;
  cvssScore: number;
  cvssVector: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  affectedAssets: {
    assetId: string;
    assetName: string;
    assetType: string;
  }[];
  status: "open" | "in-progress" | "remediated" | "accepted" | "false-positive";
  remediation: {
    steps: string;
    deadline?: string;
    assignedTo?: string;
  };
  cveIds: string[];
  references: string[];
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface VulnerabilitiesResponse {
  vulnerabilities: Vulnerability[];
  total: number;
  page: number;
  limit: number;
}

export interface VulnerabilityFilters {
  severity?: ("critical" | "high" | "medium" | "low" | "info")[];
  status?: (
    | "open"
    | "in-progress"
    | "remediated"
    | "accepted"
    | "false-positive"
  )[];
  cveIds?: string[];
  minCvssScore?: number;
  maxCvssScore?: number;
  affectedAssetIds?: string[];
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Compliance types
export interface ComplianceFramework {
  _id: string;
  name: string;
  description: string;
  version: string;
  controls: ComplianceControl[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceControl {
  _id: string;
  controlId: string;
  name: string;
  description: string;
  category: string;
  requirements: string;
  status:
    | "compliant"
    | "non-compliant"
    | "partially-compliant"
    | "not-applicable";
  evidence?: string[];
  assignedTo?: string;
  dueDate?: string;
  lastAssessment?: {
    date: string;
    assessor: string;
    notes: string;
  };
}

export interface ComplianceAssessment {
  _id: string;
  frameworkId: string;
  name: string;
  description: string;
  status: "planned" | "in-progress" | "completed";
  progress: {
    total: number;
    compliant: number;
    nonCompliant: number;
    partiallyCompliant: number;
    notApplicable: number;
  };
  startDate: string;
  completionDate?: string;
  assessors: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Network types
export interface NetworkAsset {
  _id: string;
  hostname: string;
  ipAddress: string;
  assetType:
    | "server"
    | "workstation"
    | "network-device"
    | "iot-device"
    | "other";
  operatingSystem?: string;
  department?: string;
  owner?: string;
  location?: string;
  criticality: "critical" | "high" | "medium" | "low";
  tags: string[];
  lastSeen: string;
  services: {
    port: number;
    protocol: string;
    service: string;
    version?: string;
  }[];
  vulnerabilities: {
    count: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface NetworkMap {
  nodes: {
    id: string;
    type: string;
    label: string;
    data: NetworkAsset;
  }[];
  edges: {
    source: string;
    target: string;
    type: string;
    data?: any;
  }[];
}

// User management types
export interface UserListItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface UserManagementResponse {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
}

// Define the API service
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = localStorage.getItem("accessToken");

      // If token exists, add to headers
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Alert",
    "Log",
    "Vulnerability",
    "Compliance",
    "NetworkAsset",
    "Dashboard",
  ],
  endpoints: (builder) => ({
    // User endpoints
    getCurrentUser: builder.query<User, void>({
      query: () => "/auth/me",
      transformResponse: (response: ApiResponse<{ user: User }>) =>
        response.data.user,
      providesTags: ["User"],
    }),

    updateUserProfile: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: "/users/profile",
        method: "PATCH",
        body: userData,
      }),
      transformResponse: (response: ApiResponse<{ user: User }>) =>
        response.data.user,
      invalidatesTags: ["User"],
    }),

    // Alerts endpoints
    getAlerts: builder.query<AlertsResponse, AlertFilters | void>({
      query: (filters = {}) => ({
        url: "/alerts",
        params: filters,
      }),
      transformResponse: (response: ApiResponse<AlertsResponse>) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.alerts.map(({ _id }) => ({
                type: "Alert" as const,
                id: _id,
              })),
              { type: "Alert", id: "LIST" },
            ]
          : [{ type: "Alert", id: "LIST" }],
    }),

    getAlertById: builder.query<Alert, string>({
      query: (id) => `/alerts/${id}`,
      transformResponse: (response: ApiResponse<{ alert: Alert }>) =>
        response.data.alert,
      providesTags: (result, error, id) => [{ type: "Alert", id }],
    }),

    acknowledgeAlert: builder.mutation<Alert, string>({
      query: (id) => ({
        url: `/alerts/${id}/acknowledge`,
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<{ alert: Alert }>) =>
        response.data.alert,
      invalidatesTags: (result, error, id) => [
        { type: "Alert", id },
        { type: "Alert", id: "LIST" },
        { type: "Dashboard", id: "ALERTS" },
      ],
    }),

    resolveAlert: builder.mutation<Alert, { id: string; notes: string }>({
      query: ({ id, notes }) => ({
        url: `/alerts/${id}/resolve`,
        method: "POST",
        body: { notes },
      }),
      transformResponse: (response: ApiResponse<{ alert: Alert }>) =>
        response.data.alert,
      invalidatesTags: (result, error, arg) => [
        { type: "Alert", id: arg.id },
        { type: "Alert", id: "LIST" },
        { type: "Dashboard", id: "ALERTS" },
      ],
    }),

    // Logs endpoints
    getLogs: builder.query<LogsResponse, LogFilters | void>({
      query: (filters = {}) => ({
        url: "/logs",
        params: filters,
      }),
      transformResponse: (response: ApiResponse<LogsResponse>) => response.data,
      providesTags: [{ type: "Log", id: "LIST" }],
    }),

    getLogById: builder.query<Log, string>({
      query: (id) => `/logs/${id}`,
      transformResponse: (response: ApiResponse<{ log: Log }>) =>
        response.data.log,
      providesTags: (result, error, id) => [{ type: "Log", id }],
    }),

    // Vulnerabilities endpoints
    getVulnerabilities: builder.query<
      VulnerabilitiesResponse,
      VulnerabilityFilters | void
    >({
      query: (filters = {}) => ({
        url: "/vulnerabilities",
        params: filters,
      }),
      transformResponse: (response: ApiResponse<VulnerabilitiesResponse>) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.vulnerabilities.map(({ _id }) => ({
                type: "Vulnerability" as const,
                id: _id,
              })),
              { type: "Vulnerability", id: "LIST" },
            ]
          : [{ type: "Vulnerability", id: "LIST" }],
    }),

    getVulnerabilityById: builder.query<Vulnerability, string>({
      query: (id) => `/vulnerabilities/${id}`,
      transformResponse: (
        response: ApiResponse<{ vulnerability: Vulnerability }>
      ) => response.data.vulnerability,
      providesTags: (result, error, id) => [{ type: "Vulnerability", id }],
    }),

    updateVulnerabilityStatus: builder.mutation<
      Vulnerability,
      { id: string; status: Vulnerability["status"]; notes?: string }
    >({
      query: ({ id, status, notes }) => ({
        url: `/vulnerabilities/${id}/status`,
        method: "PATCH",
        body: { status, notes },
      }),
      transformResponse: (
        response: ApiResponse<{ vulnerability: Vulnerability }>
      ) => response.data.vulnerability,
      invalidatesTags: (result, error, arg) => [
        { type: "Vulnerability", id: arg.id },
        { type: "Vulnerability", id: "LIST" },
        { type: "Dashboard", id: "VULNERABILITIES" },
      ],
    }),

    // Compliance endpoints
    getComplianceFrameworks: builder.query<ComplianceFramework[], void>({
      query: () => "/compliance/frameworks",
      transformResponse: (
        response: ApiResponse<{ frameworks: ComplianceFramework[] }>
      ) => response.data.frameworks,
      providesTags: [{ type: "Compliance", id: "FRAMEWORKS" }],
    }),

    getComplianceFrameworkById: builder.query<ComplianceFramework, string>({
      query: (id) => `/compliance/frameworks/${id}`,
      transformResponse: (
        response: ApiResponse<{ framework: ComplianceFramework }>
      ) => response.data.framework,
      providesTags: (result, error, id) => [{ type: "Compliance", id }],
    }),

    getComplianceAssessments: builder.query<ComplianceAssessment[], void>({
      query: () => "/compliance/assessments",
      transformResponse: (
        response: ApiResponse<{ assessments: ComplianceAssessment[] }>
      ) => response.data.assessments,
      providesTags: [{ type: "Compliance", id: "ASSESSMENTS" }],
    }),

    // Network endpoints
    getNetworkAssets: builder.query<NetworkAsset[], void>({
      query: () => "/network/assets",
      transformResponse: (response: ApiResponse<{ assets: NetworkAsset[] }>) =>
        response.data.assets,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "NetworkAsset" as const,
                id: _id,
              })),
              { type: "NetworkAsset", id: "LIST" },
            ]
          : [{ type: "NetworkAsset", id: "LIST" }],
    }),

    getNetworkMap: builder.query<NetworkMap, void>({
      query: () => "/network/map",
      transformResponse: (response: ApiResponse<{ map: NetworkMap }>) =>
        response.data.map,
      providesTags: [{ type: "NetworkAsset", id: "MAP" }],
    }),

    // Dashboard endpoints
    getDashboardSummary: builder.query<any, void>({
      query: () => "/dashboard/summary",
      providesTags: [
        { type: "Dashboard", id: "SUMMARY" },
        { type: "Alert", id: "LIST" },
        { type: "Vulnerability", id: "LIST" },
      ],
    }),

    // User management (admin) endpoints
    getUsers: builder.query<
      UserManagementResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params = {}) => ({
        url: "/admin/users",
        params,
      }),
      transformResponse: (response: ApiResponse<UserManagementResponse>) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ _id }) => ({
                type: "User" as const,
                id: _id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    createUser: builder.mutation<
      User,
      Omit<User, "_id" | "createdAt" | "updatedAt">
    >({
      query: (userData) => ({
        url: "/admin/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation<User, { id: string; userData: Partial<User> }>(
      {
        query: ({ id, userData }) => ({
          url: `/admin/users/${id}`,
          method: "PATCH",
          body: userData,
        }),
        invalidatesTags: (result, error, arg) => [
          { type: "User", id: arg.id },
          { type: "User", id: "LIST" },
        ],
      }
    ),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
  }),
});

// Export hooks
export const {
  // User hooks
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,

  // Alerts hooks
  useGetAlertsQuery,
  useGetAlertByIdQuery,
  useAcknowledgeAlertMutation,
  useResolveAlertMutation,

  // Logs hooks
  useGetLogsQuery,
  useGetLogByIdQuery,

  // Vulnerabilities hooks
  useGetVulnerabilitiesQuery,
  useGetVulnerabilityByIdQuery,
  useUpdateVulnerabilityStatusMutation,

  // Compliance hooks
  useGetComplianceFrameworksQuery,
  useGetComplianceFrameworkByIdQuery,
  useGetComplianceAssessmentsQuery,

  // Network hooks
  useGetNetworkAssetsQuery,
  useGetNetworkMapQuery,

  // Dashboard hooks
  useGetDashboardSummaryQuery,

  // User management hooks
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = api;
