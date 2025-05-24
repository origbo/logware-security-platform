import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Anomaly,
  UserBehaviorAnomaly,
  NetworkAnomaly,
  SystemAnomaly,
  AnomalyModel,
  AnomalyCorrelation,
  AnomalyFilters,
} from "../types/anomalyTypes";

/**
 * API service for handling anomaly detection and ML-based analysis
 */
export const anomalyApi = createApi({
  reducerPath: "anomalyApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/soar/anomaly/" }),
  tagTypes: ["Anomalies", "Models", "Correlations"],
  endpoints: (builder) => ({
    // Anomalies
    getAnomalies: builder.query<Anomaly[], AnomalyFilters | void>({
      query: (filters) => ({
        url: "",
        method: "GET",
        params: filters || undefined,
      }),
      providesTags: ["Anomalies"],
    }),

    getUserBehaviorAnomalies: builder.query<
      UserBehaviorAnomaly[],
      AnomalyFilters | void
    >({
      query: (filters) => ({
        url: "user-behavior",
        method: "GET",
        params: filters || undefined,
      }),
      providesTags: ["Anomalies"],
    }),

    getNetworkAnomalies: builder.query<NetworkAnomaly[], AnomalyFilters | void>(
      {
        query: (filters) => ({
          url: "network",
          method: "GET",
          params: filters || undefined,
        }),
        providesTags: ["Anomalies"],
      }
    ),

    getSystemAnomalies: builder.query<SystemAnomaly[], AnomalyFilters | void>({
      query: (filters) => ({
        url: "system",
        method: "GET",
        params: filters || undefined,
      }),
      providesTags: ["Anomalies"],
    }),

    getAnomalyById: builder.query<Anomaly, string>({
      query: (id) => `${id}`,
      providesTags: (result, error, id) => [{ type: "Anomalies", id }],
    }),

    updateAnomalyStatus: builder.mutation<void, { id: string; status: string }>(
      {
        query: ({ id, status }) => ({
          url: `${id}/status`,
          method: "PATCH",
          body: { status },
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "Anomalies", id }],
      }
    ),

    markAsFalsePositive: builder.mutation<void, { id: string; reason: string }>(
      {
        query: ({ id, reason }) => ({
          url: `${id}/false-positive`,
          method: "POST",
          body: { reason },
        }),
        invalidatesTags: (result, error, { id }) => [{ type: "Anomalies", id }],
      }
    ),

    assignAnomaly: builder.mutation<void, { id: string; userId: string }>({
      query: ({ id, userId }) => ({
        url: `${id}/assign`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Anomalies", id }],
    }),

    // ML Models
    getModels: builder.query<AnomalyModel[], void>({
      query: () => "models",
      providesTags: ["Models"],
    }),

    getModelById: builder.query<AnomalyModel, string>({
      query: (id) => `models/${id}`,
      providesTags: (result, error, id) => [{ type: "Models", id }],
    }),

    updateModelStatus: builder.mutation<void, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `models/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Models", id }],
    }),

    trainModel: builder.mutation<
      void,
      { id: string; params: Record<string, any> }
    >({
      query: ({ id, params }) => ({
        url: `models/${id}/train`,
        method: "POST",
        body: params,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Models", id }],
    }),

    updateModelThresholds: builder.mutation<
      void,
      { id: string; thresholds: Record<string, number> }
    >({
      query: ({ id, thresholds }) => ({
        url: `models/${id}/thresholds`,
        method: "PATCH",
        body: { thresholds },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Models", id }],
    }),

    // Correlations
    getCorrelations: builder.query<AnomalyCorrelation[], void>({
      query: () => "correlations",
      providesTags: ["Correlations"],
    }),

    getCorrelationById: builder.query<AnomalyCorrelation, string>({
      query: (id) => `correlations/${id}`,
      providesTags: (result, error, id) => [{ type: "Correlations", id }],
    }),

    createCorrelation: builder.mutation<
      AnomalyCorrelation,
      Partial<AnomalyCorrelation>
    >({
      query: (correlation) => ({
        url: "correlations",
        method: "POST",
        body: correlation,
      }),
      invalidatesTags: ["Correlations"],
    }),

    // Analytics
    getUserRiskScores: builder.query<
      { userId: string; userName: string; riskScore: number }[],
      void
    >({
      query: () => "analytics/user-risk-scores",
    }),

    getAnomalyTrends: builder.query<
      { date: string; count: number; byType: Record<string, number> }[],
      { period: string }
    >({
      query: ({ period }) => ({
        url: "analytics/trends",
        params: { period },
      }),
    }),

    getAnomalyHotspots: builder.query<
      { category: string; count: number; severity: string }[],
      void
    >({
      query: () => "analytics/hotspots",
    }),

    // Run on-demand analysis
    runUserBehaviorAnalysis: builder.mutation<
      void,
      { userId?: string; timeRange?: { start: string; end: string } }
    >({
      query: (params) => ({
        url: "analyze/user-behavior",
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["Anomalies"],
    }),

    runNetworkTrafficAnalysis: builder.mutation<
      void,
      {
        sourceIp?: string;
        destinationIp?: string;
        timeRange?: { start: string; end: string };
      }
    >({
      query: (params) => ({
        url: "analyze/network-traffic",
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["Anomalies"],
    }),

    runSystemBehaviorAnalysis: builder.mutation<
      void,
      {
        hostId?: string;
        resourceType?: string;
        timeRange?: { start: string; end: string };
      }
    >({
      query: (params) => ({
        url: "analyze/system-behavior",
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["Anomalies"],
    }),

    // Explain AI results
    explainAnomaly: builder.query<
      {
        explanation: string;
        factors: { factor: string; weight: number; description: string }[];
        similarIncidents: { id: string; name: string; similarity: number }[];
        visualData?: Record<string, any>;
      },
      string
    >({
      query: (id) => `${id}/explain`,
    }),
  }),
});

export const {
  // Anomalies
  useGetAnomaliesQuery,
  useGetUserBehaviorAnomaliesQuery,
  useGetNetworkAnomaliesQuery,
  useGetSystemAnomaliesQuery,
  useGetAnomalyByIdQuery,
  useUpdateAnomalyStatusMutation,
  useMarkAsFalsePositiveMutation,
  useAssignAnomalyMutation,

  // ML Models
  useGetModelsQuery,
  useGetModelByIdQuery,
  useUpdateModelStatusMutation,
  useTrainModelMutation,
  useUpdateModelThresholdsMutation,

  // Correlations
  useGetCorrelationsQuery,
  useGetCorrelationByIdQuery,
  useCreateCorrelationMutation,

  // Analytics
  useGetUserRiskScoresQuery,
  useGetAnomalyTrendsQuery,
  useGetAnomalyHotspotsQuery,

  // Run on-demand analysis
  useRunUserBehaviorAnalysisMutation,
  useRunNetworkTrafficAnalysisMutation,
  useRunSystemBehaviorAnalysisMutation,

  // Explain AI results
  useExplainAnomalyQuery,
} = anomalyApi;
