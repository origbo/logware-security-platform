import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CloudProvider,
  SecurityFinding,
  CloudAccount,
  CloudResource,
} from "../types/cloudSecurityTypes";

/**
 * AWS Security Service
 * Handles API interactions for AWS security features
 */
export const awsSecurityApi = createApi({
  reducerPath: "awsSecurityApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/cloud-security/aws",
    prepareHeaders: (headers, { getState }) => {
      // Add authorization header with JWT token
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "AWSAccounts",
    "AWSFindings",
    "CloudTrail",
    "S3Buckets",
    "IAMPolicies",
  ],
  endpoints: (builder) => ({
    // CloudTrail Integration
    getCloudTrailEvents: builder.query<
      any[],
      { accountId: string; startTime?: string; endTime?: string; filter?: any }
    >({
      query: ({ accountId, startTime, endTime, filter }) => ({
        url: `${accountId}/cloudtrail/events`,
        params: { startTime, endTime, ...filter },
      }),
      providesTags: ["CloudTrail"],
    }),

    getCloudTrailEventsByService: builder.query<
      { service: string; count: number }[],
      { accountId: string; startTime?: string; endTime?: string }
    >({
      query: ({ accountId, startTime, endTime }) => ({
        url: `${accountId}/cloudtrail/events/by-service`,
        params: { startTime, endTime },
      }),
      providesTags: ["CloudTrail"],
    }),

    // S3 Bucket Security
    getS3Buckets: builder.query<CloudResource[], { accountId: string }>({
      query: ({ accountId }) => ({
        url: `${accountId}/s3/buckets`,
      }),
      providesTags: ["S3Buckets"],
    }),

    getS3BucketSecurityDetails: builder.query<
      any,
      { accountId: string; bucketName: string }
    >({
      query: ({ accountId, bucketName }) => ({
        url: `${accountId}/s3/buckets/${bucketName}`,
      }),
      providesTags: ["S3Buckets"],
    }),

    getS3BucketsWithFinding: builder.query<
      { bucket: CloudResource; findings: SecurityFinding[] }[],
      { accountId: string }
    >({
      query: ({ accountId }) => ({
        url: `${accountId}/s3/buckets/with-findings`,
      }),
      providesTags: ["S3Buckets", "AWSFindings"],
    }),

    // IAM Policy Analysis
    getIAMPolicies: builder.query<any[], { accountId: string }>({
      query: ({ accountId }) => ({
        url: `${accountId}/iam/policies`,
      }),
      providesTags: ["IAMPolicies"],
    }),

    getIAMRoles: builder.query<any[], { accountId: string }>({
      query: ({ accountId }) => ({
        url: `${accountId}/iam/roles`,
      }),
      providesTags: ["IAMPolicies"],
    }),

    getIAMUsers: builder.query<any[], { accountId: string }>({
      query: ({ accountId }) => ({
        url: `${accountId}/iam/users`,
      }),
      providesTags: ["IAMPolicies"],
    }),

    analyzePolicyDocument: builder.mutation<
      any,
      { accountId: string; policyDocument: any }
    >({
      query: ({ accountId, policyDocument }) => ({
        url: `${accountId}/iam/policy/analyze`,
        method: "POST",
        body: { policyDocument },
      }),
      invalidatesTags: ["IAMPolicies"],
    }),

    // AWS Security Findings
    getSecurityFindings: builder.query<
      SecurityFinding[],
      { accountId: string; filter?: any }
    >({
      query: ({ accountId, filter }) => ({
        url: `${accountId}/findings`,
        params: { ...filter },
      }),
      providesTags: ["AWSFindings"],
    }),

    updateFindingStatus: builder.mutation<
      SecurityFinding,
      { accountId: string; findingId: string; status: string }
    >({
      query: ({ accountId, findingId, status }) => ({
        url: `${accountId}/findings/${findingId}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["AWSFindings"],
    }),

    // AWS Accounts
    getAWSAccounts: builder.query<CloudAccount[], void>({
      query: () => ({
        url: "/accounts",
      }),
      providesTags: ["AWSAccounts"],
    }),

    connectAWSAccount: builder.mutation<
      CloudAccount,
      { name: string; accountId: string; roleArn: string }
    >({
      query: (credentials) => ({
        url: "/accounts/connect",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["AWSAccounts"],
    }),

    disconnectAWSAccount: builder.mutation<void, { accountId: string }>({
      query: ({ accountId }) => ({
        url: `/accounts/${accountId}/disconnect`,
        method: "POST",
      }),
      invalidatesTags: ["AWSAccounts"],
    }),

    syncAWSAccount: builder.mutation<void, { accountId: string }>({
      query: ({ accountId }) => ({
        url: `/accounts/${accountId}/sync`,
        method: "POST",
      }),
      invalidatesTags: [
        "AWSAccounts",
        "AWSFindings",
        "CloudTrail",
        "S3Buckets",
        "IAMPolicies",
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // CloudTrail hooks
  useGetCloudTrailEventsQuery,
  useGetCloudTrailEventsByServiceQuery,

  // S3 Bucket Security hooks
  useGetS3BucketsQuery,
  useGetS3BucketSecurityDetailsQuery,
  useGetS3BucketsWithFindingQuery,

  // IAM Policy Analysis hooks
  useGetIAMPoliciesQuery,
  useGetIAMRolesQuery,
  useGetIAMUsersQuery,
  useAnalyzePolicyDocumentMutation,

  // AWS Security Findings hooks
  useGetSecurityFindingsQuery,
  useUpdateFindingStatusMutation,

  // AWS Accounts hooks
  useGetAWSAccountsQuery,
  useConnectAWSAccountMutation,
  useDisconnectAWSAccountMutation,
  useSyncAWSAccountMutation,
} = awsSecurityApi;
