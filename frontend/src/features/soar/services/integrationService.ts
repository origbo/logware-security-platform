/**
 * Integration Service
 *
 * Provides interfaces and API functions for connecting to external security tools
 * and systems. Manages the communication between the SOAR platform and integrated
 * security tools for automation workflows.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../../config";

// Integration types
export type IntegrationType =
  | "siem" // Security Information and Event Management
  | "edr" // Endpoint Detection and Response
  | "soar" // Security Orchestration, Automation and Response
  | "ndr" // Network Detection and Response
  | "idp" // Identity Provider
  | "waf" // Web Application Firewall
  | "xdr" // Extended Detection and Response
  | "dlp" // Data Loss Prevention
  | "vm" // Vulnerability Management
  | "threat_intel" // Threat Intelligence Platform
  | "ticketing" // Ticketing System
  | "firewall" // Firewall
  | "email_security" // Email Security
  | "custom"; // Custom Integration

// Integration status
export type IntegrationStatus = "configured" | "active" | "disabled" | "error";

// Base integration interface
export interface Integration {
  id: string;
  name: string;
  description: string;
  type: IntegrationType;
  vendor: string;
  version: string;
  status: IntegrationStatus;
  credentialId?: string;
  createdAt: string;
  updatedAt: string;
  lastConnected?: string;
  configuration: Record<string, any>;
  capabilities: string[];
  tags: string[];
  healthStatus?: {
    status: "healthy" | "degraded" | "unhealthy";
    lastChecked: string;
    message?: string;
  };
}

// Action parameter interface
export interface ActionParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  default?: any;
  options?: any[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

// Integration action interface
export interface IntegrationAction {
  id: string;
  integrationId: string;
  name: string;
  description: string;
  parameters: ActionParameter[];
  resultSchema?: Record<string, any>;
  exampleResult?: any;
  category: string;
  tags: string[];
}

// Action result interface
export interface ActionResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  executionTime: number;
  timestamp: string;
}

// Integration connection test result
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * RTK Query API service for security tool integrations
 */
export const integrationApi = createApi({
  reducerPath: "integrationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/soar/integrations`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Integration", "Action"],
  endpoints: (builder) => ({
    // Get all integrations with optional filters
    getIntegrations: builder.query<
      Integration[],
      {
        type?: IntegrationType;
        status?: IntegrationStatus;
        vendor?: string;
        tags?: string[];
      }
    >({
      query: (params) => {
        let queryParams = "";
        if (params.type) queryParams += `type=${params.type}&`;
        if (params.status) queryParams += `status=${params.status}&`;
        if (params.vendor) queryParams += `vendor=${params.vendor}&`;
        if (params.tags && params.tags.length > 0) {
          params.tags.forEach((tag) => {
            queryParams += `tags=${tag}&`;
          });
        }
        return `?${queryParams}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Integration" as const, id })),
              { type: "Integration", id: "LIST" },
            ]
          : [{ type: "Integration", id: "LIST" }],
    }),

    // Get an integration by ID
    getIntegrationById: builder.query<Integration, string>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: "Integration", id }],
    }),

    // Create a new integration
    createIntegration: builder.mutation<
      Integration,
      Omit<Integration, "id" | "createdAt" | "updatedAt">
    >({
      query: (integration) => ({
        url: "",
        method: "POST",
        body: integration,
      }),
      invalidatesTags: [{ type: "Integration", id: "LIST" }],
    }),

    // Update an existing integration
    updateIntegration: builder.mutation<
      Integration,
      Partial<Integration> & { id: string }
    >({
      query: ({ id, ...integration }) => ({
        url: `/${id}`,
        method: "PUT",
        body: integration,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Integration", id }],
    }),

    // Delete an integration
    deleteIntegration: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [{ type: "Integration", id }],
    }),

    // Test integration connection
    testIntegrationConnection: builder.mutation<ConnectionTestResult, string>({
      query: (id) => ({
        url: `/${id}/test`,
        method: "POST",
      }),
    }),

    // Enable an integration
    enableIntegration: builder.mutation<Integration, string>({
      query: (id) => ({
        url: `/${id}/enable`,
        method: "POST",
      }),
      invalidatesTags: (_, __, id) => [{ type: "Integration", id }],
    }),

    // Disable an integration
    disableIntegration: builder.mutation<Integration, string>({
      query: (id) => ({
        url: `/${id}/disable`,
        method: "POST",
      }),
      invalidatesTags: (_, __, id) => [{ type: "Integration", id }],
    }),

    // Get all actions for an integration
    getIntegrationActions: builder.query<IntegrationAction[], string>({
      query: (integrationId) => `/${integrationId}/actions`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Action" as const, id })),
              { type: "Action", id: "LIST" },
            ]
          : [{ type: "Action", id: "LIST" }],
    }),

    // Get action by ID
    getActionById: builder.query<
      IntegrationAction,
      { integrationId: string; actionId: string }
    >({
      query: ({ integrationId, actionId }) =>
        `/${integrationId}/actions/${actionId}`,
      providesTags: (_, __, { actionId }) => [{ type: "Action", id: actionId }],
    }),

    // Execute an action
    executeAction: builder.mutation<
      ActionResult,
      {
        integrationId: string;
        actionId: string;
        parameters: Record<string, any>;
      }
    >({
      query: ({ integrationId, actionId, parameters }) => ({
        url: `/${integrationId}/actions/${actionId}/execute`,
        method: "POST",
        body: { parameters },
      }),
    }),

    // Get health status of all integrations
    getIntegrationsHealth: builder.query<
      {
        [key: string]: {
          status: "healthy" | "degraded" | "unhealthy";
          lastChecked: string;
          message?: string;
        };
      },
      void
    >({
      query: () => `/health`,
    }),

    // Get available integration templates (pre-configured integration settings)
    getIntegrationTemplates: builder.query<
      {
        id: string;
        name: string;
        type: IntegrationType;
        vendor: string;
        description: string;
      }[],
      void
    >({
      query: () => `/templates`,
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetIntegrationsQuery,
  useGetIntegrationByIdQuery,
  useCreateIntegrationMutation,
  useUpdateIntegrationMutation,
  useDeleteIntegrationMutation,
  useTestIntegrationConnectionMutation,
  useEnableIntegrationMutation,
  useDisableIntegrationMutation,
  useGetIntegrationActionsQuery,
  useGetActionByIdQuery,
  useExecuteActionMutation,
  useGetIntegrationsHealthQuery,
  useGetIntegrationTemplatesQuery,
} = integrationApi;

/**
 * Integration Categories
 */
export const integrationCategories = [
  {
    id: "siem",
    name: "Security Information and Event Management",
    description: "Collect, analyze, and correlate security event data",
    vendors: [
      "Splunk",
      "IBM QRadar",
      "Elastic Security",
      "ArcSight",
      "LogRhythm",
    ],
  },
  {
    id: "edr",
    name: "Endpoint Detection and Response",
    description: "Monitor and respond to threats on endpoints",
    vendors: [
      "CrowdStrike",
      "SentinelOne",
      "Carbon Black",
      "Microsoft Defender for Endpoint",
      "Symantec",
    ],
  },
  {
    id: "ndr",
    name: "Network Detection and Response",
    description: "Monitor network traffic for threats",
    vendors: [
      "Darktrace",
      "Vectra AI",
      "Cisco Secure Network Analytics",
      "ExtraHop",
    ],
  },
  {
    id: "threat_intel",
    name: "Threat Intelligence",
    description: "Gather and analyze threat intelligence",
    vendors: [
      "ThreatConnect",
      "Recorded Future",
      "Anomali",
      "MISP",
      "VirusTotal",
    ],
  },
  {
    id: "ticketing",
    name: "Ticketing Systems",
    description: "Create and manage service tickets",
    vendors: ["ServiceNow", "Jira", "Zendesk", "Freshdesk", "BMC Remedy"],
  },
  {
    id: "vm",
    name: "Vulnerability Management",
    description: "Identify and manage vulnerabilities",
    vendors: ["Tenable", "Qualys", "Rapid7", "OpenVAS", "Nessus"],
  },
  {
    id: "email_security",
    name: "Email Security",
    description: "Protect against email-based threats",
    vendors: [
      "Proofpoint",
      "Mimecast",
      "Microsoft Defender for Office 365",
      "Barracuda",
    ],
  },
  {
    id: "firewall",
    name: "Firewalls",
    description: "Control network traffic and protect against threats",
    vendors: [
      "Palo Alto Networks",
      "Fortinet",
      "Cisco Firepower",
      "Check Point",
      "Juniper Networks",
    ],
  },
  {
    id: "idp",
    name: "Identity Providers",
    description: "Manage user identities and access",
    vendors: ["Okta", "Azure AD", "Ping Identity", "OneLogin", "Auth0"],
  },
];

/**
 * Common action types by integration category
 */
export const commonActionsByCategory: Record<string, string[]> = {
  siem: [
    "Search Logs",
    "Get Alerts",
    "Create Alert",
    "Update Alert",
    "Get Events",
    "Run Query",
    "Get Dashboard",
  ],
  edr: [
    "Isolate Endpoint",
    "Unisolate Endpoint",
    "Scan Endpoint",
    "Get Endpoint Info",
    "Get Detections",
    "Run Script",
    "Kill Process",
    "Delete File",
  ],
  ndr: [
    "Get Network Traffic",
    "Block IP",
    "Unblock IP",
    "Get Alerts",
    "Get Network Devices",
    "Run Query",
  ],
  threat_intel: [
    "Lookup Indicator",
    "Submit Indicator",
    "Get Intelligence Report",
    "Check Reputation",
    "Enrich Indicator",
    "Get Related Indicators",
  ],
  ticketing: [
    "Create Ticket",
    "Update Ticket",
    "Get Ticket",
    "Add Comment",
    "Close Ticket",
    "Assign Ticket",
    "Get Tickets",
  ],
  vm: [
    "Start Scan",
    "Get Scan Results",
    "Get Vulnerabilities",
    "Get Asset Info",
    "Generate Report",
  ],
  email_security: [
    "Block Sender",
    "Unblock Sender",
    "Get Quarantined Messages",
    "Release Message",
    "Delete Message",
    "Search Messages",
  ],
  firewall: [
    "Add Rule",
    "Remove Rule",
    "Get Rules",
    "Block IP",
    "Unblock IP",
    "Get Blocked IPs",
  ],
  idp: [
    "Get User",
    "Create User",
    "Update User",
    "Disable User",
    "Enable User",
    "Reset Password",
    "Get Groups",
  ],
};
