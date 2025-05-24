/**
 * Anomaly Detection Service
 *
 * API service for ML-based anomaly detection
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AnomalyEvent,
  AnomalyDetectionRule,
  AnomalyDetectionStats,
  AnomalySearchParams,
  AnomalyType,
  AnomalySeverity,
  AnomalyStatus,
} from "../types/anomalyTypes";

// Define return types for better type safety
type AnomalyRuleResponse = AnomalyDetectionRule;
type AnomalyEventResponse = AnomalyEvent;
type AnomalyStatsResponse = AnomalyDetectionStats;
type BaselineResponse = { status: string; message: string; ruleId: string };

// Define request types for mutations
type CreateRuleRequest = Omit<AnomalyDetectionRule, "id" | "createdAt" | "updatedAt">;
type UpdateRuleRequest = { id: string; rule: Partial<AnomalyDetectionRule> };
type UpdateEventStatusRequest = { id: string; status: string; assignedTo?: string; notes?: string };
type GenerateBaselineRequest = { ruleId: string; timeWindow?: string };

/**
 * This API provides access to the anomaly detection functionality
 * Uses RTK Query for efficient data fetching and caching
 */
export const anomalyDetectionApi = createApi({
  reducerPath: "anomalyDetectionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/advanced-security/anomaly-detection",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["AnomalyEvents", "AnomalyRules", "AnomalyStats"],
  endpoints: (builder) => ({
    // Get anomaly events with optional filtering
    getAnomalyEvents: builder.query<AnomalyEvent[], AnomalySearchParams | void>({
        query: (params) => ({
          url: "/events",
          params,
        }),
        providesTags: ["AnomalyEvents"],
        // Mock data for development
        // @ts-ignore - Override transform response to return mock data
        // This bypasses the TypeScript error: "Type is not assignable to type 'void | AnomalySearchParams'"
        transformResponse: (baseQueryReturnValue: any): AnomalyEvent[] => {
          // In a real implementation, we would transform the API response here
          // For now, we're returning mock data
          return [
            {
              id: "anomaly-1",
              timestamp: new Date().toISOString(),
              type: "AUTHENTICATION",
              severity: "HIGH",
              status: "NEW",
              source: "auth-service",
              description:
                "Unusual login pattern detected for user admin from new location",
              affectedResource: "user:admin",
              mlConfidence: 87,
              rawData: {
                userId: "admin",
                ipAddress: "203.0.113.1",
                loginTime: new Date().toISOString(),
                browser: "Chrome",
                os: "Windows",
              },
              tags: ["authentication", "admin-user"],
            },
            {
              id: "anomaly-2",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              type: "DATA_ACCESS",
              severity: "CRITICAL",
              status: "INVESTIGATING",
              source: "data-access-monitor",
              description:
                "Unusual data access pattern: User accessed 150 customer records in 5 minutes",
              affectedResource: "database:customers",
              mlConfidence: 94,
              rawData: {
                userId: "jsmith",
                records: 150,
                timeWindow: "5min",
                databaseName: "customers",
                queryType: "SELECT",
              },
              assignedTo: "security-team",
              tags: ["data-access", "customer-data"],
            },
          ] as AnomalyEvent[];
        },
      }
    ),

    // Get a single anomaly event by ID
    getAnomalyEvent: builder.query<AnomalyEventResponse, string>({
      query: (id) => `/events/${id}`,
      providesTags: (result, error, id) => [{ type: "AnomalyEvents", id }],
    }),

    // Update anomaly event status
    updateAnomalyEventStatus: builder.mutation<
      AnomalyEventResponse,
      UpdateEventStatusRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/events/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AnomalyEvents", id },
        "AnomalyStats",
      ],
    }),

    // Get anomaly detection rules
    getAnomalyRules: builder.query<AnomalyRuleResponse[], void>({
      query: () => "/rules",
      providesTags: ["AnomalyRules"],
    }),

    // Get a single anomaly detection rule
    getAnomalyRule: builder.query<AnomalyRuleResponse, string>({
      query: (id) => `/rules/${id}`,
      providesTags: (result, error, id) => [{ type: "AnomalyRules", id }],
    }),

    // Create anomaly detection rule
    createAnomalyRule: builder.mutation<
      AnomalyRuleResponse,
      CreateRuleRequest
    >({
      query: (rule) => ({
        url: "/rules",
        method: "POST",
        body: rule,
      }),
      invalidatesTags: ["AnomalyRules"],
    }),

    // Update anomaly detection rule
    updateAnomalyRule: builder.mutation<
      AnomalyRuleResponse,
      UpdateRuleRequest
    >({
      // @ts-ignore - Property 'rule' access is valid per our type definition
      query: ({ id, rule }) => ({
        url: `/rules/${id}`,
        method: "PATCH",
        body: rule,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AnomalyRules", id },
      ],
    }),

    // Delete anomaly detection rule
    deleteAnomalyRule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/rules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AnomalyRules"],
    }),

    // Generate ML model baseline
    generateBaseline: builder.mutation<
      BaselineResponse,
      GenerateBaselineRequest
    >({
      query: (body) => ({
        url: "/baseline",
        method: "POST",
        body,
      }),
      // @ts-ignore - RTK Query type mismatch: invalidatesTags expects response type (BaselineResponse) as arg
      // but we need the request type (GenerateBaselineRequest) to access ruleId
      invalidatesTags: (_result, _error, arg) => [
        { type: "AnomalyRules", id: arg.ruleId },
      ],
    }),

    // Get anomaly detection statistics
    getAnomalyStats: builder.query<
      AnomalyStatsResponse,
      { timeRange?: string }
    >({
      query: (params) => ({
        url: "/stats",
        params,
      }),
      providesTags: ["AnomalyStats"],
      // Mock data for development
      // @ts-ignore - Override transform response to return mock data
      // This bypasses the TypeScript error: "Type is not assignable to type '{ timeRange?: string; }'"
      transformResponse: (baseQueryReturnValue: any): AnomalyDetectionStats => {
        // In a real implementation, we would transform the API response here
        // For now, we're returning mock data
        return {
          total: 47,
          bySeverity: {
            [AnomalySeverity.CRITICAL]: 5,
            [AnomalySeverity.HIGH]: 12,
            [AnomalySeverity.MEDIUM]: 18,
            [AnomalySeverity.LOW]: 10,
            [AnomalySeverity.INFO]: 2,
          },
          byType: {
            [AnomalyType.NETWORK]: 8,
            [AnomalyType.AUTHENTICATION]: 15,
            [AnomalyType.DATA_ACCESS]: 12,
            [AnomalyType.PROCESS_EXECUTION]: 5,
            [AnomalyType.CONFIGURATION_CHANGE]: 4,
            [AnomalyType.CLOUD_RESOURCE]: 3,
          },
          byStatus: {
            [AnomalyStatus.NEW]: 20,
            [AnomalyStatus.INVESTIGATING]: 12,
            [AnomalyStatus.FALSE_POSITIVE]: 8,
            [AnomalyStatus.RESOLVED]: 5,
            [AnomalyStatus.IGNORED]: 2,
          },
          trend: [
            {
              date: new Date(Date.now() - 6 * 86400000)
                .toISOString()
                .split("T")[0],
              count: 3,
            },
            {
              date: new Date(Date.now() - 5 * 86400000)
                .toISOString()
                .split("T")[0],
              count: 5,
            },
            {
              date: new Date(Date.now() - 4 * 86400000)
                .toISOString()
                .split("T")[0],
              count: 8,
            },
            {
              date: new Date(Date.now() - 3 * 86400000)
                .toISOString()
                .split("T")[0],
              count: 7,
            },
            {
              date: new Date(Date.now() - 2 * 86400000)
                .toISOString()
                .split("T")[0],
              count: 9,
            },
            {
              date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
              count: 12,
            },
            { date: new Date().toISOString().split("T")[0], count: 3 },
          ],
          topSources: [
            { source: "auth-service", count: 15 },
            { source: "data-access-monitor", count: 12 },
            { source: "network-monitor", count: 8 },
            { source: "cloud-resource-monitor", count: 7 },
            { source: "system-monitor", count: 5 },
          ],
        } as AnomalyDetectionStats;
      },
    }),
  }),
});

/**
 * Export generated hooks for use in React components
 * This is the recommended pattern for using RTK Query
 * It provides automatic caching, refetching, and type safety
 */
export const {
  // Queries - use these hooks in components to fetch data
  useGetAnomalyEventsQuery,
  useGetAnomalyEventQuery,
  useGetAnomalyRulesQuery,
  useGetAnomalyRuleQuery,
  useGetAnomalyStatsQuery,
  
  // Mutations - use these hooks in components to update data
  useUpdateAnomalyEventStatusMutation,
  useCreateAnomalyRuleMutation,
  useUpdateAnomalyRuleMutation,
  useDeleteAnomalyRuleMutation,
  useGenerateBaselineMutation,
} = anomalyDetectionApi;
