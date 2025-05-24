/**
 * Cloud Security Reporting Service
 *
 * API service for report generation, scheduling, and management
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ReportConfigType } from "../components/reporting/ReportConfiguration";

// Report template interface
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  tags: string[];
  lastUsed: string | null;
}

// Report interface
export interface Report {
  id: string;
  name: string;
  template: string;
  generatedAt: string;
  generatedBy: string;
  cloudProviders: string[];
  size: string;
  format: string;
  downloads: number;
  url?: string;
}

// Schedule interface
export interface ReportSchedule {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  day: string;
  time: string;
  recipients: string[];
  nextRun: string;
  templateId: string;
  active: boolean;
  config: Partial<ReportConfigType>;
}

// Generate report request
export interface GenerateReportRequest {
  templateId: string;
  config: ReportConfigType;
}

// Create schedule request
export interface CreateScheduleRequest {
  name: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  day: string;
  time: string;
  recipients: string[];
  active: boolean;
  templateId: string;
  config: Partial<ReportConfigType>;
}

/**
 * Report API Service
 */
export const reportingService = createApi({
  reducerPath: "reportingService",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || "http://localhost:3001/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Templates", "Reports", "Schedules"],
  endpoints: (builder) => ({
    // Get all report templates
    getReportTemplates: builder.query<ReportTemplate[], void>({
      query: () => "/reports/templates",
      providesTags: ["Templates"],
    }),

    // Get report configuration options
    getReportConfigOptions: builder.query<any, void>({
      query: () => "/reports/config-options",
    }),

    // Get a single report template
    getReportTemplate: builder.query<ReportTemplate, string>({
      query: (id) => `/reports/templates/${id}`,
      providesTags: (result, error, id) => [{ type: "Templates", id }],
    }),

    // Get report history
    getReportHistory: builder.query<
      Report[],
      { accountId?: string; limit?: number }
    >({
      query: ({ accountId, limit = 50 }) => ({
        url: "/reports/history",
        params: { accountId, limit },
      }),
      providesTags: ["Reports"],
    }),

    // Generate a new report
    generateReport: builder.mutation<Report, GenerateReportRequest>({
      query: (request) => ({
        url: "/reports/generate",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["Reports"],
    }),

    // Download a report
    downloadReport: builder.query<Blob, string>({
      query: (reportId) => ({
        url: `/reports/download/${reportId}`,
        responseHandler: async (response) => await response.blob(),
      }),
    }),

    // Get report schedules
    getReportSchedules: builder.query<ReportSchedule[], void>({
      query: () => "/reports/schedules",
      providesTags: ["Schedules"],
    }),

    // Create a report schedule
    createReportSchedule: builder.mutation<
      ReportSchedule,
      CreateScheduleRequest
    >({
      query: (schedule) => ({
        url: "/reports/schedules",
        method: "POST",
        body: schedule,
      }),
      invalidatesTags: ["Schedules"],
    }),

    // Update a report schedule
    updateReportSchedule: builder.mutation<
      ReportSchedule,
      { id: string; schedule: Partial<CreateScheduleRequest> }
    >({
      query: ({ id, schedule }) => ({
        url: `/reports/schedules/${id}`,
        method: "PATCH",
        body: schedule,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Schedules", id }],
    }),

    // Delete a report schedule
    deleteReportSchedule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reports/schedules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Schedules"],
    }),

    // Toggle schedule active status
    toggleScheduleActive: builder.mutation<
      ReportSchedule,
      { id: string; active: boolean }
    >({
      query: ({ id, active }) => ({
        url: `/reports/schedules/${id}/toggle`,
        method: "PATCH",
        body: { active },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Schedules", id }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetReportTemplatesQuery,
  useGetReportTemplateQuery,
  useGetReportConfigOptionsQuery,
  useGetReportHistoryQuery,
  useGenerateReportMutation,
  useDownloadReportQuery,
  useGetReportSchedulesQuery,
  useCreateReportScheduleMutation,
  useUpdateReportScheduleMutation,
  useDeleteReportScheduleMutation,
  useToggleScheduleActiveMutation,
} = reportingService;
