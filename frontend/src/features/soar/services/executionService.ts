/**
 * Playbook Execution Service
 *
 * Handles backend communication for executing playbooks and managing execution state.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../../config";
import {
  Playbook,
  PlaybookExecution,
  PlaybookExecutionStatus,
  PlaybookStep,
  StepExecution,
} from "../types/soarTypes";

/**
 * API service for playbook execution
 */
export const executionApi = createApi({
  reducerPath: "executionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/soar`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["PlaybookExecution"],
  endpoints: (builder) => ({
    // Execute a playbook
    executePlaybook: builder.mutation<
      PlaybookExecution,
      { playbookId: string; inputs?: Record<string, any> }
    >({
      query: ({ playbookId, inputs = {} }) => ({
        url: `/playbooks/${playbookId}/execute`,
        method: "POST",
        body: { inputs },
      }),
      invalidatesTags: ["PlaybookExecution"],
    }),

    // Get execution by ID
    getExecution: builder.query<PlaybookExecution, string>({
      query: (executionId) => `/executions/${executionId}`,
      providesTags: ["PlaybookExecution"],
    }),

    // Get execution history for a playbook
    getExecutionHistory: builder.query<PlaybookExecution[], string>({
      query: (playbookId) => `/playbooks/${playbookId}/executions`,
      providesTags: ["PlaybookExecution"],
    }),

    // Get all executions with optional filters
    getExecutions: builder.query<
      PlaybookExecution[],
      { status?: PlaybookExecutionStatus; limit?: number }
    >({
      query: ({ status, limit = 50 }) => {
        let url = `/executions?limit=${limit}`;
        if (status) {
          url += `&status=${status}`;
        }
        return url;
      },
      providesTags: ["PlaybookExecution"],
    }),

    // Pause an execution
    pauseExecution: builder.mutation<void, string>({
      query: (executionId) => ({
        url: `/executions/${executionId}/pause`,
        method: "POST",
      }),
      invalidatesTags: ["PlaybookExecution"],
    }),

    // Resume an execution
    resumeExecution: builder.mutation<void, string>({
      query: (executionId) => ({
        url: `/executions/${executionId}/resume`,
        method: "POST",
      }),
      invalidatesTags: ["PlaybookExecution"],
    }),

    // Cancel an execution
    cancelExecution: builder.mutation<void, string>({
      query: (executionId) => ({
        url: `/executions/${executionId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["PlaybookExecution"],
    }),

    // Get step execution details
    getStepExecution: builder.query<
      StepExecution,
      { executionId: string; stepId: string }
    >({
      query: ({ executionId, stepId }) =>
        `/executions/${executionId}/steps/${stepId}`,
      providesTags: ["PlaybookExecution"],
    }),

    // Override a step execution (manual intervention)
    overrideStepExecution: builder.mutation<
      void,
      {
        executionId: string;
        stepId: string;
        output: Record<string, any>;
        status: "success" | "failed";
      }
    >({
      query: ({ executionId, stepId, output, status }) => ({
        url: `/executions/${executionId}/steps/${stepId}/override`,
        method: "POST",
        body: { output, status },
      }),
      invalidatesTags: ["PlaybookExecution"],
    }),

    // Get execution analytics
    getExecutionAnalytics: builder.query<
      {
        totalExecutions: number;
        successRate: number;
        averageDuration: number;
        byStatus: Record<PlaybookExecutionStatus, number>;
      },
      { playbookId?: string; timeRange?: string }
    >({
      query: ({ playbookId, timeRange = "7d" }) => {
        let url = `/analytics/executions?timeRange=${timeRange}`;
        if (playbookId) {
          url += `&playbookId=${playbookId}`;
        }
        return url;
      },
    }),
  }),
});

// Export hooks for each endpoint
export const {
  useExecutePlaybookMutation,
  useGetExecutionQuery,
  useGetExecutionHistoryQuery,
  useGetExecutionsQuery,
  usePauseExecutionMutation,
  useResumeExecutionMutation,
  useCancelExecutionMutation,
  useGetStepExecutionQuery,
  useOverrideStepExecutionMutation,
  useGetExecutionAnalyticsQuery,
} = executionApi;

/**
 * Utility function to calculate execution progress
 */
export const calculateExecutionProgress = (
  execution: PlaybookExecution
): number => {
  if (!execution.steps || execution.steps.length === 0) return 0;

  const completedSteps = execution.steps.filter(
    (step) =>
      step.status === "completed" ||
      step.status === "failed" ||
      step.status === "skipped"
  ).length;

  return Math.floor((completedSteps / execution.steps.length) * 100);
};

/**
 * Utility function to determine if execution is in a terminal state
 */
export const isExecutionComplete = (
  status: PlaybookExecutionStatus
): boolean => {
  return ["completed", "failed", "cancelled"].includes(status);
};

/**
 * Formats execution duration in a human-readable way
 */
export const formatExecutionDuration = (
  startTime: string,
  endTime?: string
): string => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const durationMs = end - start;

  // Less than a minute
  if (durationMs < 60000) {
    return `${Math.floor(durationMs / 1000)}s`;
  }

  // Less than an hour
  if (durationMs < 3600000) {
    return `${Math.floor(durationMs / 60000)}m ${Math.floor(
      (durationMs % 60000) / 1000
    )}s`;
  }

  // Hours and minutes
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};
