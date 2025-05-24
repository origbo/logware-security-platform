import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../../store/store";

/**
 * GCP Security Service API
 * Handles interactions with Google Cloud Security Command Center and related backend endpoints
 */
export const gcpSecurityApi = createApi({
  reducerPath: "gcpSecurityApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/cloud-security/gcp",
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
    "SecurityCommandCenter",
    "GCPStorage",
    "GCPIdentity",
    "GCPNetwork",
  ],
  endpoints: (builder) => ({
    // Security Command Center endpoints
    getSecurityCommandCenterOverview: builder.query<
      any,
      { projectId?: string }
    >({
      query: ({ projectId }) => {
        let url = "/security-command-center/overview";
        if (projectId) {
          url += `?projectId=${projectId}`;
        }
        return url;
      },
      providesTags: ["SecurityCommandCenter"],
    }),
    getSecurityFindings: builder.query<
      any,
      { projectId?: string; severity?: string; state?: string; limit?: number }
    >({
      query: ({ projectId, severity, state, limit }) => {
        const params = new URLSearchParams();
        if (projectId) params.append("projectId", projectId);
        if (severity) params.append("severity", severity);
        if (state) params.append("state", state);
        if (limit) params.append("limit", limit.toString());

        return `/security-command-center/findings?${params}`;
      },
      providesTags: ["SecurityCommandCenter"],
    }),
    getSecurityHealthAnalytics: builder.query<any, { projectId?: string }>({
      query: ({ projectId }) => {
        let url = "/security-command-center/health-analytics";
        if (projectId) {
          url += `?projectId=${projectId}`;
        }
        return url;
      },
      providesTags: ["SecurityCommandCenter"],
    }),

    // GCP Storage Security endpoints
    getCloudStorageBuckets: builder.query<any, { projectId?: string }>({
      query: ({ projectId }) => {
        let url = "/storage/buckets";
        if (projectId) {
          url += `?projectId=${projectId}`;
        }
        return url;
      },
      providesTags: ["GCPStorage"],
    }),
    getBucketSecurity: builder.query<
      any,
      { bucketName: string; projectId?: string }
    >({
      query: ({ bucketName, projectId }) => {
        let url = `/storage/buckets/${bucketName}/security`;
        if (projectId) {
          url += `?projectId=${projectId}`;
        }
        return url;
      },
      providesTags: (result, error, arg) => [
        { type: "GCPStorage", id: arg.bucketName },
      ],
    }),
    runBucketSecurityScan: builder.mutation<
      any,
      { bucketName: string; projectId?: string }
    >({
      query: ({ bucketName, projectId }) => {
        const params = new URLSearchParams();
        if (projectId) params.append("projectId", projectId);

        return {
          url: `/storage/buckets/${bucketName}/scan?${params}`,
          method: "POST",
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: "GCPStorage", id: arg.bucketName },
      ],
    }),

    // IAM & Admin endpoints
    getIAMRoles: builder.query<any, { projectId?: string }>({
      query: ({ projectId }) => {
        let url = "/iam/roles";
        if (projectId) {
          url += `?projectId=${projectId}`;
        }
        return url;
      },
      providesTags: ["GCPIdentity"],
    }),
    getServiceAccounts: builder.query<any, { projectId?: string }>({
      query: ({ projectId }) => {
        let url = "/iam/service-accounts";
        if (projectId) {
          url += `?projectId=${projectId}`;
        }
        return url;
      },
      providesTags: ["GCPIdentity"],
    }),
    getIAMBindings: builder.query<any, { projectId?: string; roleId?: string }>(
      {
        query: ({ projectId, roleId }) => {
          const params = new URLSearchParams();
          if (projectId) params.append("projectId", projectId);
          if (roleId) params.append("roleId", roleId);

          return `/iam/bindings?${params}`;
        },
        providesTags: ["GCPIdentity"],
      }
    ),
    analyzeIAMPolicy: builder.query<
      any,
      { projectId?: string; resourceId?: string }
    >({
      query: ({ projectId, resourceId }) => {
        const params = new URLSearchParams();
        if (projectId) params.append("projectId", projectId);
        if (resourceId) params.append("resourceId", resourceId);

        return `/iam/policy-analysis?${params}`;
      },
      providesTags: ["GCPIdentity"],
    }),

    // VPC Network Security endpoints
    getVPCNetworks: builder.query<any, { projectId?: string }>({
      query: ({ projectId }) => {
        let url = "/network/vpc";
        if (projectId) {
          url += `?projectId=${projectId}`;
        }
        return url;
      },
      providesTags: ["GCPNetwork"],
    }),
    getFirewallRules: builder.query<
      any,
      { projectId?: string; networkId?: string }
    >({
      query: ({ projectId, networkId }) => {
        const params = new URLSearchParams();
        if (projectId) params.append("projectId", projectId);
        if (networkId) params.append("networkId", networkId);

        return `/network/firewall-rules?${params}`;
      },
      providesTags: ["GCPNetwork"],
    }),
    analyzeNetworkSecurity: builder.query<
      any,
      { projectId?: string; networkId?: string }
    >({
      query: ({ projectId, networkId }) => {
        const params = new URLSearchParams();
        if (projectId) params.append("projectId", projectId);
        if (networkId) params.append("networkId", networkId);

        return `/network/security-analysis?${params}`;
      },
      providesTags: ["GCPNetwork"],
    }),

    // Security Assessment
    runSecurityAssessment: builder.mutation<
      any,
      { projectId: string; scope?: string }
    >({
      query: ({ projectId, scope }) => {
        const params = new URLSearchParams();
        if (scope) params.append("scope", scope);

        return {
          url: `/security-command-center/${projectId}/assess?${params}`,
          method: "POST",
        };
      },
      invalidatesTags: [
        "SecurityCommandCenter",
        "GCPStorage",
        "GCPIdentity",
        "GCPNetwork",
      ],
    }),
  }),
});

export const {
  useGetSecurityCommandCenterOverviewQuery,
  useGetSecurityFindingsQuery,
  useGetSecurityHealthAnalyticsQuery,
  useGetCloudStorageBucketsQuery,
  useGetBucketSecurityQuery,
  useRunBucketSecurityScanMutation,
  useGetIAMRolesQuery,
  useGetServiceAccountsQuery,
  useGetIAMBindingsQuery,
  useAnalyzeIAMPolicyQuery,
  useGetVPCNetworksQuery,
  useGetFirewallRulesQuery,
  useAnalyzeNetworkSecurityQuery,
  useRunSecurityAssessmentMutation,
} = gcpSecurityApi;
