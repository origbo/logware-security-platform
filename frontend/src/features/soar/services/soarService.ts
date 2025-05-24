import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Playbook,
  AutomationRule,
  AutomationExecution,
  ResponseAction,
  ThreatHunt,
  ThreatHuntResult,
  Incident,
  AuditLogEntry,
  CollaborationSession,
} from "../types/soarTypes";

// Define the SOAR API service
export const soarApi = createApi({
  reducerPath: "soarApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/soar" }),
  tagTypes: [
    "Playbook",
    "Rule",
    "Execution",
    "Action",
    "Hunt",
    "HuntResult",
    "Incident",
    "AuditLog",
    "CollaborationSession",
  ],
  endpoints: (builder) => ({
    // Playbook endpoints
    getPlaybooks: builder.query<Playbook[], void>({
      query: () => "/playbooks",
      providesTags: ["Playbook"],
    }),
    getPlaybookById: builder.query<Playbook, string>({
      query: (id) => `/playbooks/${id}`,
      providesTags: (result, error, id) => [{ type: "Playbook", id }],
    }),
    createPlaybook: builder.mutation<Playbook, Partial<Playbook>>({
      query: (playbook) => ({
        url: "/playbooks",
        method: "POST",
        body: playbook,
      }),
      invalidatesTags: ["Playbook"],
    }),
    updatePlaybook: builder.mutation<Playbook, Partial<Playbook>>({
      query: ({ id, ...rest }) => ({
        url: `/playbooks/${id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Playbook", id }],
    }),
    deletePlaybook: builder.mutation<void, string>({
      query: (id) => ({
        url: `/playbooks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Playbook"],
    }),
    executePlaybook: builder.mutation<
      AutomationExecution,
      { id: string; params?: Record<string, any> }
    >({
      query: ({ id, params }) => ({
        url: `/playbooks/${id}/execute`,
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["Execution"],
    }),

    // Automation Rules endpoints
    getRules: builder.query<AutomationRule[], void>({
      query: () => "/rules",
      providesTags: ["Rule"],
    }),
    getRuleById: builder.query<AutomationRule, string>({
      query: (id) => `/rules/${id}`,
      providesTags: (result, error, id) => [{ type: "Rule", id }],
    }),
    createRule: builder.mutation<AutomationRule, Partial<AutomationRule>>({
      query: (rule) => ({
        url: "/rules",
        method: "POST",
        body: rule,
      }),
      invalidatesTags: ["Rule"],
    }),
    updateRule: builder.mutation<AutomationRule, Partial<AutomationRule>>({
      query: ({ id, ...rest }) => ({
        url: `/rules/${id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Rule", id }],
    }),
    deleteRule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/rules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Rule"],
    }),
    toggleRuleStatus: builder.mutation<
      AutomationRule,
      { id: string; isEnabled: boolean }
    >({
      query: ({ id, isEnabled }) => ({
        url: `/rules/${id}/status`,
        method: "PATCH",
        body: { isEnabled },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Rule", id }],
    }),
    testRule: builder.mutation<
      AutomationExecution,
      { id: string; testData?: Record<string, any> }
    >({
      query: ({ id, testData }) => ({
        url: `/rules/${id}/test`,
        method: "POST",
        body: testData,
      }),
    }),

    // Executions endpoints
    getActiveExecutions: builder.query<AutomationExecution[], void>({
      query: () => "/executions/active",
      providesTags: ["Execution"],
    }),
    getExecutionHistory: builder.query<
      AutomationExecution[],
      {
        page?: number;
        limit?: number;
        type?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({
        url: "/executions/history",
        params,
      }),
      providesTags: ["Execution"],
    }),
    getExecutionById: builder.query<AutomationExecution, string>({
      query: (id) => `/executions/${id}`,
      providesTags: (result, error, id) => [{ type: "Execution", id }],
    }),
    abortExecution: builder.mutation<void, string>({
      query: (id) => ({
        url: `/executions/${id}/abort`,
        method: "POST",
      }),
      invalidatesTags: ["Execution"],
    }),

    // Response Actions endpoints
    getActions: builder.query<ResponseAction[], { category?: string }>({
      query: (params) => ({
        url: "/actions",
        params,
      }),
      providesTags: ["Action"],
    }),
    getActionById: builder.query<ResponseAction, string>({
      query: (id) => `/actions/${id}`,
      providesTags: (result, error, id) => [{ type: "Action", id }],
    }),
    createAction: builder.mutation<ResponseAction, Partial<ResponseAction>>({
      query: (action) => ({
        url: "/actions",
        method: "POST",
        body: action,
      }),
      invalidatesTags: ["Action"],
    }),
    updateAction: builder.mutation<ResponseAction, Partial<ResponseAction>>({
      query: ({ id, ...rest }) => ({
        url: `/actions/${id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Action", id }],
    }),
    deleteAction: builder.mutation<void, string>({
      query: (id) => ({
        url: `/actions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Action"],
    }),
    testAction: builder.mutation<
      any,
      { id: string; params: Record<string, any> }
    >({
      query: ({ id, params }) => ({
        url: `/actions/${id}/test`,
        method: "POST",
        body: params,
      }),
    }),

    // Threat Hunting endpoints
    getHunts: builder.query<
      ThreatHunt[],
      { category?: string; status?: string }
    >({
      query: (params) => ({
        url: "/hunts",
        params,
      }),
      providesTags: ["Hunt"],
    }),
    getHuntById: builder.query<ThreatHunt, string>({
      query: (id) => `/hunts/${id}`,
      providesTags: (result, error, id) => [{ type: "Hunt", id }],
    }),
    createHunt: builder.mutation<ThreatHunt, Partial<ThreatHunt>>({
      query: (hunt) => ({
        url: "/hunts",
        method: "POST",
        body: hunt,
      }),
      invalidatesTags: ["Hunt"],
    }),
    updateHunt: builder.mutation<ThreatHunt, Partial<ThreatHunt>>({
      query: ({ id, ...rest }) => ({
        url: `/hunts/${id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Hunt", id }],
    }),
    deleteHunt: builder.mutation<void, string>({
      query: (id) => ({
        url: `/hunts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Hunt"],
    }),
    executeHunt: builder.mutation<ThreatHuntResult, string>({
      query: (id) => ({
        url: `/hunts/${id}/execute`,
        method: "POST",
      }),
      invalidatesTags: ["HuntResult"],
    }),
    getHuntResults: builder.query<ThreatHuntResult[], { huntId?: string }>({
      query: (params) => ({
        url: "/hunt-results",
        params,
      }),
      providesTags: ["HuntResult"],
    }),
    getHuntResultById: builder.query<ThreatHuntResult, string>({
      query: (id) => `/hunt-results/${id}`,
      providesTags: (result, error, id) => [{ type: "HuntResult", id }],
    }),

    // Incidents endpoints
    getIncidents: builder.query<
      Incident[],
      {
        status?: string;
        severity?: string;
        assignee?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: "/incidents",
        params,
      }),
      providesTags: ["Incident"],
    }),
    getIncidentById: builder.query<Incident, string>({
      query: (id) => `/incidents/${id}`,
      providesTags: (result, error, id) => [{ type: "Incident", id }],
    }),
    createIncident: builder.mutation<Incident, Partial<Incident>>({
      query: (incident) => ({
        url: "/incidents",
        method: "POST",
        body: incident,
      }),
      invalidatesTags: ["Incident"],
    }),
    updateIncident: builder.mutation<Incident, Partial<Incident>>({
      query: ({ id, ...rest }) => ({
        url: `/incidents/${id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Incident", id }],
    }),
    closeIncident: builder.mutation<
      Incident,
      { id: string; resolution: string }
    >({
      query: ({ id, resolution }) => ({
        url: `/incidents/${id}/close`,
        method: "POST",
        body: { resolution },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Incident", id }],
    }),

    // Audit Logs endpoints
    getAuditLogs: builder.query<
      AuditLogEntry[],
      {
        severity?: string;
        eventType?: string;
        startDate?: string;
        endDate?: string;
        resourceType?: string;
        userId?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: "/audit-logs",
        params,
      }),
      providesTags: ["AuditLog"],
    }),

    // Collaboration endpoints
    getCollaborationSessions: builder.query<
      CollaborationSession[],
      {
        status?: string;
        type?: string;
        incidentId?: string;
      }
    >({
      query: (params) => ({
        url: "/collaboration/sessions",
        params,
      }),
      providesTags: ["CollaborationSession"],
    }),
    getSessionById: builder.query<CollaborationSession, string>({
      query: (id) => `/collaboration/sessions/${id}`,
      providesTags: (result, error, id) => [
        { type: "CollaborationSession", id },
      ],
    }),
    createSession: builder.mutation<
      CollaborationSession,
      Partial<CollaborationSession>
    >({
      query: (session) => ({
        url: "/collaboration/sessions",
        method: "POST",
        body: session,
      }),
      invalidatesTags: ["CollaborationSession"],
    }),
    updateSession: builder.mutation<
      CollaborationSession,
      Partial<CollaborationSession>
    >({
      query: ({ id, ...rest }) => ({
        url: `/collaboration/sessions/${id}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "CollaborationSession", id },
      ],
    }),
    closeSession: builder.mutation<void, string>({
      query: (id) => ({
        url: `/collaboration/sessions/${id}/close`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "CollaborationSession", id },
      ],
    }),
    joinSession: builder.mutation<void, string>({
      query: (id) => ({
        url: `/collaboration/sessions/${id}/join`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "CollaborationSession", id },
      ],
    }),
    leaveSession: builder.mutation<void, string>({
      query: (id) => ({
        url: `/collaboration/sessions/${id}/leave`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "CollaborationSession", id },
      ],
    }),
  }),
});

// Export the auto-generated hooks
export const {
  // Playbooks
  useGetPlaybooksQuery,
  useGetPlaybookByIdQuery,
  useCreatePlaybookMutation,
  useUpdatePlaybookMutation,
  useDeletePlaybookMutation,
  useExecutePlaybookMutation,

  // Rules
  useGetRulesQuery,
  useGetRuleByIdQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useToggleRuleStatusMutation,
  useTestRuleMutation,

  // Executions
  useGetActiveExecutionsQuery,
  useGetExecutionHistoryQuery,
  useGetExecutionByIdQuery,
  useAbortExecutionMutation,

  // Actions
  useGetActionsQuery,
  useGetActionByIdQuery,
  useCreateActionMutation,
  useUpdateActionMutation,
  useDeleteActionMutation,
  useTestActionMutation,

  // Hunts
  useGetHuntsQuery,
  useGetHuntByIdQuery,
  useCreateHuntMutation,
  useUpdateHuntMutation,
  useDeleteHuntMutation,
  useExecuteHuntMutation,
  useGetHuntResultsQuery,
  useGetHuntResultByIdQuery,

  // Incidents
  useGetIncidentsQuery,
  useGetIncidentByIdQuery,
  useCreateIncidentMutation,
  useUpdateIncidentMutation,
  useCloseIncidentMutation,

  // Audit Logs
  useGetAuditLogsQuery,

  // Collaboration
  useGetCollaborationSessionsQuery,
  useGetSessionByIdQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useCloseSessionMutation,
  useJoinSessionMutation,
  useLeaveSessionMutation,
} = soarApi;
