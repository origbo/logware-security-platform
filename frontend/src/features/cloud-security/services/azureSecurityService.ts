import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../../store/store";

/**
 * Azure Security Service API
 * Handles interactions with Azure Security Center and related backend endpoints
 */
export const azureSecurityApi = createApi({
  reducerPath: "azureSecurityApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/cloud-security/azure",
    prepareHeaders: (headers, { getState }) => {
      // Get token from state
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "AzureSecurityCenter",
    "AzureStorage",
    "AzureIdentity",
    "AzureNetwork",
  ],
  endpoints: (builder) => ({
    // Azure Security Center endpoints
    getSecurityCenterOverview: builder.query<any, { subscriptionId?: string }>({
      query: ({ subscriptionId }) => {
        let url = "/security-center/overview";
        if (subscriptionId) {
          url += `?subscriptionId=${subscriptionId}`;
        }
        return url;
      },
      providesTags: ["AzureSecurityCenter"],
    }),
    getSecureScore: builder.query<any, { subscriptionId?: string }>({
      query: ({ subscriptionId }) => {
        let url = "/security-center/secure-score";
        if (subscriptionId) {
          url += `?subscriptionId=${subscriptionId}`;
        }
        return url;
      },
      providesTags: ["AzureSecurityCenter"],
    }),
    getSecurityAlerts: builder.query<
      any,
      {
        subscriptionId?: string;
        severity?: string;
        status?: string;
        limit?: number;
      }
    >({
      query: ({ subscriptionId, severity, status, limit }) => {
        const params = new URLSearchParams();
        if (subscriptionId) params.append("subscriptionId", subscriptionId);
        if (severity) params.append("severity", severity);
        if (status) params.append("status", status);
        if (limit) params.append("limit", limit.toString());

        return `/security-center/alerts?${params}`;
      },
      providesTags: ["AzureSecurityCenter"],
    }),
    getRecommendations: builder.query<
      any,
      { subscriptionId?: string; resourceType?: string; status?: string }
    >({
      query: ({ subscriptionId, resourceType, status }) => {
        const params = new URLSearchParams();
        if (subscriptionId) params.append("subscriptionId", subscriptionId);
        if (resourceType) params.append("resourceType", resourceType);
        if (status) params.append("status", status);

        return `/security-center/recommendations?${params}`;
      },
      providesTags: ["AzureSecurityCenter"],
    }),

    // Azure Storage Security endpoints
    getStorageAccounts: builder.query<any, { subscriptionId?: string }>({
      query: ({ subscriptionId }) => {
        let url = "/storage/accounts";
        if (subscriptionId) {
          url += `?subscriptionId=${subscriptionId}`;
        }
        return url;
      },
      providesTags: ["AzureStorage"],
    }),
    getStorageAccountSecurity: builder.query<any, { accountId: string }>({
      query: ({ accountId }) => `/storage/accounts/${accountId}/security`,
      providesTags: (result, error, arg) => [
        { type: "AzureStorage", id: arg.accountId },
      ],
    }),
    runStorageSecurityScan: builder.mutation<any, { accountId: string }>({
      query: ({ accountId }) => ({
        url: `/storage/accounts/${accountId}/scan`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "AzureStorage", id: arg.accountId },
      ],
    }),

    // Azure Identity and Access Management endpoints
    getAzureADUsers: builder.query<any, { filter?: string; limit?: number }>({
      query: ({ filter, limit }) => {
        const params = new URLSearchParams();
        if (filter) params.append("filter", filter);
        if (limit) params.append("limit", limit.toString());

        return `/identity/users?${params}`;
      },
      providesTags: ["AzureIdentity"],
    }),
    getAzureADGroups: builder.query<any, { filter?: string; limit?: number }>({
      query: ({ filter, limit }) => {
        const params = new URLSearchParams();
        if (filter) params.append("filter", filter);
        if (limit) params.append("limit", limit.toString());

        return `/identity/groups?${params}`;
      },
      providesTags: ["AzureIdentity"],
    }),
    getAzureRoleAssignments: builder.query<
      any,
      { subscriptionId?: string; principalId?: string }
    >({
      query: ({ subscriptionId, principalId }) => {
        const params = new URLSearchParams();
        if (subscriptionId) params.append("subscriptionId", subscriptionId);
        if (principalId) params.append("principalId", principalId);

        return `/identity/role-assignments?${params}`;
      },
      providesTags: ["AzureIdentity"],
    }),
    analyzeIdentityRisks: builder.query<any, { subscriptionId?: string }>({
      query: ({ subscriptionId }) => {
        let url = "/identity/risk-analysis";
        if (subscriptionId) {
          url += `?subscriptionId=${subscriptionId}`;
        }
        return url;
      },
      providesTags: ["AzureIdentity"],
    }),

    // Azure Network Security endpoints
    getNetworkSecurityGroups: builder.query<any, { subscriptionId?: string }>({
      query: ({ subscriptionId }) => {
        let url = "/network/security-groups";
        if (subscriptionId) {
          url += `?subscriptionId=${subscriptionId}`;
        }
        return url;
      },
      providesTags: ["AzureNetwork"],
    }),
    getNetworkSecurityGroupRules: builder.query<any, { nsgId: string }>({
      query: ({ nsgId }) => `/network/security-groups/${nsgId}/rules`,
      providesTags: (result, error, arg) => [
        { type: "AzureNetwork", id: arg.nsgId },
      ],
    }),
    analyzeNetworkSecurity: builder.query<any, { subscriptionId?: string }>({
      query: ({ subscriptionId }) => {
        let url = "/network/security-analysis";
        if (subscriptionId) {
          url += `?subscriptionId=${subscriptionId}`;
        }
        return url;
      },
      providesTags: ["AzureNetwork"],
    }),

    // Azure Resource Analysis
    runSecurityAssessment: builder.mutation<
      any,
      { subscriptionId: string; resourceType?: string }
    >({
      query: ({ subscriptionId, resourceType }) => {
        const params = new URLSearchParams();
        if (resourceType) params.append("resourceType", resourceType);

        return {
          url: `/security-center/${subscriptionId}/assess?${params}`,
          method: "POST",
        };
      },
      invalidatesTags: [
        "AzureSecurityCenter",
        "AzureStorage",
        "AzureIdentity",
        "AzureNetwork",
      ],
    }),
  }),
});

export const {
  useGetSecurityCenterOverviewQuery,
  useGetSecureScoreQuery,
  useGetSecurityAlertsQuery,
  useGetRecommendationsQuery,
  useGetStorageAccountsQuery,
  useGetStorageAccountSecurityQuery,
  useRunStorageSecurityScanMutation,
  useGetAzureADUsersQuery,
  useGetAzureADGroupsQuery,
  useGetAzureRoleAssignmentsQuery,
  useAnalyzeIdentityRisksQuery,
  useGetNetworkSecurityGroupsQuery,
  useGetNetworkSecurityGroupRulesQuery,
  useAnalyzeNetworkSecurityQuery,
  useRunSecurityAssessmentMutation,
} = azureSecurityApi;
