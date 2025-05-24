/**
 * Alerts API Service
 *
 * RTK Query service for interacting with security alerts endpoints.
 * Provides hooks for querying, creating, updating, and managing alerts.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../../store";
import {
  Alert,
  AlertUpdate,
  BulkAlertUpdate,
  AlertQueryParams,
} from "../types/alertTypes";

// API slice for alerts management
export const alertsApi = createApi({
  reducerPath: "alertsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || "http://localhost:3001/api",
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = (getState() as RootState).auth.token;

      // Set token if it exists
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Alert"],
  endpoints: (builder) => ({
    // Get alerts with optional filtering
    getAlerts: builder.query<Alert[], AlertQueryParams | void>({
      query: (params) => {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params) {
          if (params.severity && params.severity.length > 0) {
            params.severity.forEach((severity) =>
              queryParams.append("severity", severity)
            );
          }

          if (params.status && params.status.length > 0) {
            params.status.forEach((status) =>
              queryParams.append("status", status)
            );
          }

          if (params.source && params.source.length > 0) {
            params.source.forEach((source) =>
              queryParams.append("source", source)
            );
          }

          if (params.startDate) {
            queryParams.append("startDate", params.startDate);
          }

          if (params.endDate) {
            queryParams.append("endDate", params.endDate);
          }

          if (params.searchTerm) {
            queryParams.append("searchTerm", params.searchTerm);
          }

          if (params.assignedTo) {
            queryParams.append("assignedTo", params.assignedTo);
          }

          if (params.limit) {
            queryParams.append("limit", params.limit.toString());
          }

          if (params.page) {
            queryParams.append("page", params.page.toString());
          }

          if (params.tags && params.tags.length > 0) {
            params.tags.forEach((tag) => queryParams.append("tag", tag));
          }
        }

        // Return query with params
        return {
          url: `/alerts?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Alert" as const, id })),
              { type: "Alert", id: "LIST" },
            ]
          : [{ type: "Alert", id: "LIST" }],
    }),

    // Get a single alert by ID
    getAlert: builder.query<Alert, string>({
      query: (id) => `/alerts/${id}`,
      providesTags: (_, __, id) => [{ type: "Alert", id }],
    }),

    // Create a new alert
    createAlert: builder.mutation<Alert, Partial<Alert>>({
      query: (alert) => ({
        url: "/alerts",
        method: "POST",
        body: alert,
      }),
      invalidatesTags: [{ type: "Alert", id: "LIST" }],
    }),

    // Update an existing alert
    updateAlert: builder.mutation<Alert, { id: string; updates: AlertUpdate }>({
      query: ({ id, updates }) => ({
        url: `/alerts/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Alert", id },
        { type: "Alert", id: "LIST" },
      ],
    }),

    // Bulk update multiple alerts
    bulkUpdateAlerts: builder.mutation<{ success: boolean }, BulkAlertUpdate>({
      query: (bulkUpdate) => ({
        url: "/alerts/bulk",
        method: "PATCH",
        body: bulkUpdate,
      }),
      invalidatesTags: [{ type: "Alert", id: "LIST" }],
    }),

    // Delete an alert
    deleteAlert: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/alerts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Alert", id },
        { type: "Alert", id: "LIST" },
      ],
    }),

    // Add a comment to an alert
    addComment: builder.mutation<
      Alert,
      { alertId: string; content: string; user: string }
    >({
      query: ({ alertId, content, user }) => ({
        url: `/alerts/${alertId}/comments`,
        method: "POST",
        body: { content, user },
      }),
      invalidatesTags: (_, __, { alertId }) => [{ type: "Alert", id: alertId }],
    }),

    // Run a playbook on an alert
    runPlaybook: builder.mutation<
      { success: boolean },
      { alertIds: string[]; playbookId: string }
    >({
      query: ({ alertIds, playbookId }) => ({
        url: "/alerts/run-playbook",
        method: "POST",
        body: { alertIds, playbookId },
      }),
      invalidatesTags: (_, __, { alertIds }) => [
        ...alertIds.map((id) => ({ type: "Alert" as const, id })),
        { type: "Alert", id: "LIST" },
      ],
    }),

    // Get alert statistics
    getAlertStats: builder.query<
      {
        bySeverity: Record<string, number>;
        byStatus: Record<string, number>;
        bySource: Record<string, number>;
        total: number;
        newLast24Hours: number;
        resolvedLast24Hours: number;
        averageResolutionTime: number;
      },
      void
    >({
      query: () => "/alerts/stats",
      providesTags: [{ type: "Alert", id: "STATS" }],
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetAlertsQuery,
  useGetAlertQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useBulkUpdateAlertsMutation,
  useDeleteAlertMutation,
  useAddCommentMutation,
  useRunPlaybookMutation,
  useGetAlertStatsQuery,
} = alertsApi;
