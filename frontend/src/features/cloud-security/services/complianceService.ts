import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../../store/store";
import {
  ComplianceFramework,
  ComplianceAssessment,
  ComplianceControl,
  CloudProvider,
  ComplianceStatus,
} from "../types/cloudSecurityTypes";

/**
 * Compliance Service API
 * Handles interactions with compliance-related backend endpoints
 */
export const complianceApi = createApi({
  reducerPath: "complianceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/compliance",
    prepareHeaders: (headers, { getState }) => {
      // Get JWT token from localStorage or auth state
      const token = localStorage.getItem("auth_token");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      } else {
        // Fallback to user session if available
        const authState = (getState() as RootState).auth;
        if (authState.isAuthenticated && authState.user?.id) {
          // Set session header or other authentication method
          headers.set("x-user-id", authState.user.id);
        }
      }
      return headers;
    },
  }),
  tagTypes: [
    "ComplianceFramework",
    "ComplianceAssessment",
    "FrameworkTemplate",
    "ComplianceControl",
    "GDPRAssessment",
  ],
  endpoints: (builder) => ({
    // Multi-cloud compliance overview endpoint
    getMultiCloudComplianceOverview: builder.query<any, void>({
      query: () => "overview/multi-cloud",
      providesTags: ["ComplianceFramework"],
    }),
    // Framework endpoints
    getComplianceFrameworks: builder.query<ComplianceFramework[], void>({
      query: () => "frameworks",
      providesTags: ["ComplianceFramework"],
    }),
    getComplianceFramework: builder.query<
      ComplianceFramework,
      { frameworkId: string }
    >({
      query: ({ frameworkId }) => `frameworks/${frameworkId}`,
      providesTags: (result, error, arg) => [
        { type: "ComplianceFramework", id: arg.frameworkId },
      ],
    }),
    createComplianceFramework: builder.mutation<
      ComplianceFramework,
      Partial<ComplianceFramework>
    >({
      query: (framework) => ({
        url: "frameworks",
        method: "POST",
        body: framework,
      }),
      invalidatesTags: ["ComplianceFramework"],
    }),
    updateComplianceFramework: builder.mutation<
      ComplianceFramework,
      { frameworkId: string; framework: Partial<ComplianceFramework> }
    >({
      query: ({ frameworkId, framework }) => ({
        url: `frameworks/${frameworkId}`,
        method: "PUT",
        body: framework,
      }),
      invalidatesTags: (result, error, arg) => [
        "ComplianceFramework",
        { type: "ComplianceFramework", id: arg.frameworkId },
      ],
    }),
    deleteComplianceFramework: builder.mutation<void, { frameworkId: string }>({
      query: ({ frameworkId }) => ({
        url: `frameworks/${frameworkId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ComplianceFramework"],
    }),

    // Framework template endpoints
    getFrameworkTemplates: builder.query<ComplianceFramework[], void>({
      query: () => "templates",
      providesTags: ["FrameworkTemplate"],
    }),
    getFrameworkTemplate: builder.query<
      ComplianceFramework,
      { templateId: string }
    >({
      query: ({ templateId }) => `templates/${templateId}`,
      providesTags: (result, error, arg) => [
        { type: "FrameworkTemplate", id: arg.templateId },
      ],
    }),
    createFrameworkFromTemplate: builder.mutation<
      ComplianceFramework,
      { templateId: string; name: string; description: string }
    >({
      query: ({ templateId, name, description }) => ({
        url: `templates/${templateId}/create`,
        method: "POST",
        body: { name, description },
      }),
      invalidatesTags: ["ComplianceFramework"],
    }),
    exportFrameworkAsTemplate: builder.mutation<
      ComplianceFramework,
      { frameworkId: string; name: string; description: string }
    >({
      query: ({ frameworkId, name, description }) => ({
        url: `frameworks/${frameworkId}/export-template`,
        method: "POST",
        body: { name, description },
      }),
      invalidatesTags: ["FrameworkTemplate"],
    }),

    // Control endpoints
    getFrameworkControls: builder.query<
      ComplianceControl[],
      { frameworkId: string }
    >({
      query: ({ frameworkId }) => `frameworks/${frameworkId}/controls`,
      providesTags: (result, error, arg) => [
        { type: "ComplianceControl", id: arg.frameworkId },
      ],
    }),
    addFrameworkControl: builder.mutation<
      ComplianceControl,
      { frameworkId: string; control: Partial<ComplianceControl> }
    >({
      query: ({ frameworkId, control }) => ({
        url: `frameworks/${frameworkId}/controls`,
        method: "POST",
        body: control,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ComplianceControl", id: arg.frameworkId },
        { type: "ComplianceFramework", id: arg.frameworkId },
      ],
    }),
    updateFrameworkControl: builder.mutation<
      ComplianceControl,
      {
        frameworkId: string;
        controlId: string;
        control: Partial<ComplianceControl>;
      }
    >({
      query: ({ frameworkId, controlId, control }) => ({
        url: `frameworks/${frameworkId}/controls/${controlId}`,
        method: "PUT",
        body: control,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ComplianceControl", id: arg.frameworkId },
        { type: "ComplianceFramework", id: arg.frameworkId },
      ],
    }),
    deleteFrameworkControl: builder.mutation<
      void,
      { frameworkId: string; controlId: string }
    >({
      query: ({ frameworkId, controlId }) => ({
        url: `frameworks/${frameworkId}/controls/${controlId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ComplianceControl", id: arg.frameworkId },
        { type: "ComplianceFramework", id: arg.frameworkId },
      ],
    }),

    // Assessment endpoints
    getComplianceAssessments: builder.query<ComplianceAssessment[], {}>({
      query: () => "assessments",
      providesTags: ["ComplianceAssessment"],
    }),
    getComplianceAssessment: builder.query<
      ComplianceAssessment,
      { assessmentId: string }
    >({
      query: ({ assessmentId }) => `assessments/${assessmentId}`,
      providesTags: (result, error, arg) => [
        { type: "ComplianceAssessment", id: arg.assessmentId },
      ],
    }),
    createComplianceAssessment: builder.mutation<
      ComplianceAssessment,
      { frameworkId: string; accountId: string; provider: CloudProvider }
    >({
      query: ({ frameworkId, accountId, provider }) => ({
        url: "assessments",
        method: "POST",
        body: { frameworkId, accountId, provider },
      }),
      invalidatesTags: ["ComplianceAssessment"],
    }),

    updateControlAssessment: builder.mutation<
      ComplianceAssessment,
      {
        assessmentId: string;
        controlId: string;
        status: ComplianceStatus;
        notes?: string;
      }
    >({
      query: ({ assessmentId, controlId, status, notes }) => ({
        url: `/assessments/${assessmentId}/controls/${controlId}`,
        method: "PUT",
        body: { status, notes },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ComplianceAssessment", id: arg.assessmentId },
      ],
    }),

    // GDPR Compliance Assessment is defined below

    // GDPR Compliance Assessment
    runGdprAssessment: builder.mutation<
      { assessmentId: string; status: ComplianceStatus },
      {
        cloudProvider: CloudProvider;
        accountId: string;
        answers: Record<string, string>;
      }
    >({
      query: (data) => ({
        url: "/gdpr/assessment",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["GDPRAssessment"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Multi-cloud overview hook
  useGetMultiCloudComplianceOverviewQuery,

  // Framework hooks
  useGetComplianceFrameworksQuery,
  useGetComplianceFrameworkQuery,
  useCreateComplianceFrameworkMutation,
  useUpdateComplianceFrameworkMutation,
  useDeleteComplianceFrameworkMutation,

  // Control hooks
  useGetFrameworkControlsQuery,
  useAddFrameworkControlMutation,
  useUpdateFrameworkControlMutation,
  useDeleteFrameworkControlMutation,

  // Assessment hooks
  useGetComplianceAssessmentsQuery,
  useGetComplianceAssessmentQuery,
  useCreateComplianceAssessmentMutation,
  useUpdateControlAssessmentMutation,

  // Template hooks
  useGetFrameworkTemplatesQuery,
  useCreateFrameworkFromTemplateMutation,
  useExportFrameworkAsTemplateMutation,

  // GDPR hooks
  useRunGdprAssessmentMutation,
} = complianceApi;
