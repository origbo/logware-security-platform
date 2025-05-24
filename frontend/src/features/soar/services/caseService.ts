/**
 * Case Service
 *
 * This service provides API endpoints for managing security cases in the SOAR module.
 * It handles case creation, updates, evidence management, and linking with playbooks.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Case, CaseFilters, Artifact, TimelineEvent } from "../types/soarTypes";

// API base URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

export const caseApi = createApi({
  reducerPath: "caseApi",
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
  tagTypes: ["Case", "Artifact", "TimelineEvent"],
  endpoints: (builder) => ({
    // Get all cases with optional filters
    getCases: builder.query<Case[], CaseFilters | void>({
      query: (filters) => ({
        url: "/cases",
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Case" as const, id })),
              { type: "Case", id: "LIST" },
            ]
          : [{ type: "Case", id: "LIST" }],
    }),

    // Get a single case by ID
    getCase: builder.query<Case, string>({
      query: (id) => `/cases/${id}`,
      providesTags: (result, error, id) => [
        { type: "Case", id },
        ...(result?.artifacts?.map((artifact) => ({
          type: "Artifact" as const,
          id: artifact.id,
        })) || []),
        ...(result?.timeline?.map((event) => ({
          type: "TimelineEvent" as const,
          id: event.id,
        })) || []),
      ],
    }),

    // Create a new case
    createCase: builder.mutation<
      Case,
      Omit<
        Case,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "artifacts"
        | "timeline"
        | "playbooks"
      >
    >({
      query: (caseData) => ({
        url: "/cases",
        method: "POST",
        body: caseData,
      }),
      invalidatesTags: [{ type: "Case", id: "LIST" }],
    }),

    // Update an existing case
    updateCase: builder.mutation<Case, Partial<Case> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/cases/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Case", id },
        { type: "Case", id: "LIST" },
      ],
    }),

    // Close a case
    closeCase: builder.mutation<Case, { id: string; resolution: string }>({
      query: ({ id, resolution }) => ({
        url: `/cases/${id}/close`,
        method: "POST",
        body: { resolution },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Case", id },
        { type: "Case", id: "LIST" },
      ],
    }),

    // Reopen a closed case
    reopenCase: builder.mutation<Case, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/cases/${id}/reopen`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Case", id },
        { type: "Case", id: "LIST" },
      ],
    }),

    // Add an artifact to a case
    addArtifact: builder.mutation<
      Artifact,
      Omit<Artifact, "id" | "createdAt"> & { caseId: string }
    >({
      query: ({ caseId, ...artifact }) => ({
        url: `/cases/${caseId}/artifacts`,
        method: "POST",
        body: artifact,
      }),
      invalidatesTags: (result, error, { caseId }) => [
        { type: "Case", id: caseId },
        { type: "Artifact", id: "LIST" },
      ],
    }),

    // Update an artifact
    updateArtifact: builder.mutation<
      Artifact,
      Partial<Artifact> & { id: string; caseId: string }
    >({
      query: ({ id, caseId, ...patch }) => ({
        url: `/cases/${caseId}/artifacts/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id, caseId }) => [
        { type: "Artifact", id },
        { type: "Case", id: caseId },
      ],
    }),

    // Delete an artifact
    deleteArtifact: builder.mutation<void, { id: string; caseId: string }>({
      query: ({ id, caseId }) => ({
        url: `/cases/${caseId}/artifacts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id, caseId }) => [
        { type: "Artifact", id },
        { type: "Case", id: caseId },
      ],
    }),

    // Add a timeline event to a case
    addTimelineEvent: builder.mutation<
      TimelineEvent,
      Omit<TimelineEvent, "id" | "createdAt">
    >({
      query: ({ caseId, ...event }) => ({
        url: `/cases/${caseId}/timeline`,
        method: "POST",
        body: event,
      }),
      invalidatesTags: (result, error, { caseId }) => [
        { type: "Case", id: caseId },
        { type: "TimelineEvent", id: "LIST" },
      ],
    }),

    // Update a timeline event
    updateTimelineEvent: builder.mutation<
      TimelineEvent,
      Partial<TimelineEvent> & { id: string; caseId: string }
    >({
      query: ({ id, caseId, ...patch }) => ({
        url: `/cases/${caseId}/timeline/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id, caseId }) => [
        { type: "TimelineEvent", id },
        { type: "Case", id: caseId },
      ],
    }),

    // Delete a timeline event
    deleteTimelineEvent: builder.mutation<void, { id: string; caseId: string }>(
      {
        query: ({ id, caseId }) => ({
          url: `/cases/${caseId}/timeline/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, { id, caseId }) => [
          { type: "TimelineEvent", id },
          { type: "Case", id: caseId },
        ],
      }
    ),

    // Link a playbook to a case
    linkPlaybook: builder.mutation<
      void,
      { caseId: string; playbookId: string }
    >({
      query: ({ caseId, playbookId }) => ({
        url: `/cases/${caseId}/playbooks`,
        method: "POST",
        body: { playbookId },
      }),
      invalidatesTags: (result, error, { caseId }) => [
        { type: "Case", id: caseId },
      ],
    }),

    // Execute a playbook for a case
    executeCasePlaybook: builder.mutation<
      void,
      { caseId: string; playbookId: string; input?: Record<string, any> }
    >({
      query: ({ caseId, playbookId, input }) => ({
        url: `/cases/${caseId}/playbooks/${playbookId}/execute`,
        method: "POST",
        body: { input },
      }),
      invalidatesTags: (result, error, { caseId }) => [
        { type: "Case", id: caseId },
      ],
    }),

    // Get case metrics
    getCaseMetrics: builder.query<any, void>({
      query: () => "/cases/metrics",
    }),

    // Export a case report
    exportCaseReport: builder.query<
      string,
      { id: string; format: "pdf" | "csv" | "json" }
    >({
      query: ({ id, format }) => ({
        url: `/cases/${id}/export?format=${format}`,
        responseHandler: (response) => response.text(),
      }),
    }),
  }),
});

export const {
  useGetCasesQuery,
  useGetCaseQuery,
  useCreateCaseMutation,
  useUpdateCaseMutation,
  useCloseCaseMutation,
  useReopenCaseMutation,
  useAddArtifactMutation,
  useUpdateArtifactMutation,
  useDeleteArtifactMutation,
  useAddTimelineEventMutation,
  useUpdateTimelineEventMutation,
  useDeleteTimelineEventMutation,
  useLinkPlaybookMutation,
  useExecuteCasePlaybookMutation,
  useGetCaseMetricsQuery,
  useExportCaseReportQuery,
} = caseApi;

export default caseApi;
