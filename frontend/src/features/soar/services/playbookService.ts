/**
 * Playbook Service
 *
 * This service provides API endpoints for managing playbooks in the SOAR module.
 * It uses RTK Query for efficient data fetching and caching.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Playbook,
  PlaybookExecution,
  PlaybookFilters,
} from "../types/soarTypes";

// API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

export const playbookApi = createApi({
  reducerPath: "playbookApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/soar`,
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Playbook", "PlaybookExecution"],
  endpoints: (builder) => ({
    // Get all playbooks with optional filters
    getPlaybooks: builder.query<Playbook[], PlaybookFilters | void>({
      query: (filters) => ({
        url: "/playbooks",
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Playbook" as const, id })),
              { type: "Playbook", id: "LIST" },
            ]
          : [{ type: "Playbook", id: "LIST" }],
    }),

    // Get a single playbook by ID
    getPlaybook: builder.query<Playbook, string>({
      query: (id) => `/playbooks/${id}`,
      providesTags: (result, error, id) => [{ type: "Playbook", id }],
    }),

    // Create a new playbook
    createPlaybook: builder.mutation<
      Playbook,
      Omit<
        Playbook,
        "id" | "createdAt" | "updatedAt" | "successCount" | "failureCount"
      >
    >({
      query: (playbook) => ({
        url: "/playbooks",
        method: "POST",
        body: playbook,
      }),
      invalidatesTags: [{ type: "Playbook", id: "LIST" }],
    }),

    // Update an existing playbook
    updatePlaybook: builder.mutation<
      Playbook,
      Partial<Playbook> & { id: string }
    >({
      query: ({ id, ...patch }) => ({
        url: `/playbooks/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Playbook", id },
        { type: "Playbook", id: "LIST" },
      ],
    }),

    // Delete a playbook
    deletePlaybook: builder.mutation<void, string>({
      query: (id) => ({
        url: `/playbooks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Playbook", id },
        { type: "Playbook", id: "LIST" },
      ],
    }),

    // Execute a playbook
    executePlaybook: builder.mutation<
      PlaybookExecution,
      { playbookId: string; input?: Record<string, any> }
    >({
      query: ({ playbookId, input }) => ({
        url: `/playbooks/${playbookId}/execute`,
        method: "POST",
        body: { input },
      }),
      invalidatesTags: (result, error, { playbookId }) => [
        { type: "Playbook", id: playbookId },
        { type: "PlaybookExecution", id: "LIST" },
      ],
    }),

    // Get executions for a playbook
    getPlaybookExecutions: builder.query<PlaybookExecution[], string>({
      query: (playbookId) => `/playbooks/${playbookId}/executions`,
      providesTags: (result, error, playbookId) => [
        { type: "PlaybookExecution", id: playbookId },
        { type: "PlaybookExecution", id: "LIST" },
      ],
    }),

    // Get specific execution details
    getExecutionDetails: builder.query<PlaybookExecution, string>({
      query: (executionId) => `/executions/${executionId}`,
      providesTags: (result, error, id) => [{ type: "PlaybookExecution", id }],
    }),

    // Clone an existing playbook
    clonePlaybook: builder.mutation<Playbook, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/playbooks/${id}/clone`,
        method: "POST",
        body: { name },
      }),
      invalidatesTags: [{ type: "Playbook", id: "LIST" }],
    }),

    // Export a playbook as JSON
    exportPlaybook: builder.query<string, string>({
      query: (id) => ({
        url: `/playbooks/${id}/export`,
        responseHandler: (response) => response.text(),
      }),
    }),

    // Import a playbook from JSON
    importPlaybook: builder.mutation<Playbook, { playbook: string }>({
      query: ({ playbook }) => ({
        url: "/playbooks/import",
        method: "POST",
        body: { playbook },
      }),
      invalidatesTags: [{ type: "Playbook", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPlaybooksQuery,
  useGetPlaybookQuery,
  useCreatePlaybookMutation,
  useUpdatePlaybookMutation,
  useDeletePlaybookMutation,
  useExecutePlaybookMutation,
  useGetPlaybookExecutionsQuery,
  useGetExecutionDetailsQuery,
  useClonePlaybookMutation,
  useExportPlaybookQuery,
  useImportPlaybookMutation,
} = playbookApi;

export default playbookApi;
