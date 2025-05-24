/**
 * Advanced Visualization Service
 *
 * API service for advanced security data visualization components
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  VisualizationType,
  VisualizationConfig,
  VisualizationDataResponse,
  VisualizationSearchParams,
  VisualizationSaveRequest,
  VisualizationExportOptions,
} from "../types/visualizationTypes";

export const visualizationApi = createApi({
  reducerPath: "visualizationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/advanced-security/visualizations",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Visualizations", "VisualizationData"],
  endpoints: (builder) => ({
    // Get visualization configurations with optional filtering
    getVisualizations: builder.query<VisualizationConfig[], VisualizationSearchParams | void>({
      query: (params) => ({
        url: "/configs",
        params,
      }),
      providesTags: ["Visualizations"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): VisualizationConfig[] => {
        return [
          {
            id: "viz-1",
            name: "Global Threat Intelligence Map",
            type: "THREAT_MAP",
            description:
              "World map showing threat intelligence indicators and activity",
            colorTheme: "SEVERITY",
            interactionMode: "INTERACTIVE",
            showLegend: true,
            showTooltips: true,
            showLabels: false,
            autoRefresh: true,
            refreshInterval: 300, // 5 minutes
            animations: true,
            dateRange: {
              start: "2023-01-01T00:00:00Z",
              end: "2023-03-01T00:00:00Z",
            },
            filters: {
              threatTypes: ["malware", "ransomware", "phishing"],
              severity: ["high", "critical"],
            },
            savedAt: "2023-02-15T10:30:00Z",
            createdBy: "admin",
          },
          {
            id: "viz-2",
            name: "Attack Path Visualization",
            type: "ATTACK_GRAPH",
            description: "Interactive graph of attack paths through the network",
            colorTheme: "RISK_BASED",
            layout: "force",
            interactionMode: "INTERACTIVE",
            showLegend: true,
            showTooltips: true,
            showLabels: true,
            animations: true,
            customParams: {
              showVulnerabilities: true,
              highlightCriticalPaths: true,
              groupByAssetType: false,
            },
            savedAt: "2023-02-10T14:15:00Z",
            createdBy: "admin",
          },
          {
            id: "viz-3",
            name: "Security Incidents Timeline",
            type: "TIMELINE",
            description: "Timeline of security incidents and events",
            colorTheme: "BLUE_SCALE",
            interactionMode: "PAN_ZOOM",
            showLegend: true,
            showTooltips: true,
            showLabels: true,
            dateRange: {
              start: "2022-01-01T00:00:00Z",
              end: "2023-03-01T00:00:00Z",
            },
            filters: {
              eventTypes: ["alert", "incident", "vulnerability"],
              severity: ["medium", "high", "critical"],
            },
            savedAt: "2023-01-20T09:45:00Z",
            createdBy: "analyst",
          },
        ] as VisualizationConfig[];
      },
    }),

    // Get a single visualization configuration by ID
    getVisualization: builder.query<VisualizationConfig, string>({
      query: (id) => `/configs/${id}`,
      providesTags: (result, error, id) => [{ type: "Visualizations", id }],
    }),

    // Create visualization configuration
    createVisualization: builder.mutation<
      VisualizationConfig,
      Omit<VisualizationConfig, "id">
    >({
      query: (config) => ({
        url: "/configs",
        method: "POST",
        body: config,
      }),
      invalidatesTags: ["Visualizations"],
    }),

    // Update visualization configuration
    updateVisualization: builder.mutation<
      VisualizationConfig,
      Partial<VisualizationConfig> & { id: string }
    >({
      query: (configData) => {
        const { id, ...configUpdate } = configData;
        return {
          url: `/configs/${id}`,
          method: "PATCH",
          body: configUpdate,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Visualizations", id },
      ],
    }),

    // Delete visualization configuration
    deleteVisualization: builder.mutation<void, string>({
      query: (id) => ({
        url: `/configs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Visualizations"],
    }),

    // Get visualization data for a specific configuration
    getVisualizationData: builder.query<
      VisualizationDataResponse,
      { id: string; params?: Record<string, any> }
    >({
      query: ({ id, params }) => ({
        url: `/data/${id}`,
        params,
      }),
      providesTags: (result, error, { id }) => [
        { type: "VisualizationData", id },
      ],
    }),

    // Export visualization
    exportVisualization: builder.query<
      { url: string },
      { id: string; options: VisualizationExportOptions }
    >({
      query: ({ id, options }) => ({
        url: `/export/${id}`,
        params: options,
      }),
    }),

    // Save visualization
    saveVisualization: builder.mutation<
      VisualizationConfig,
      VisualizationSaveRequest
    >({
      query: (request) => ({
        url: "/save",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["Visualizations"],
    }),
  }),
});

export const {
  useGetVisualizationsQuery,
  useGetVisualizationQuery,
  useCreateVisualizationMutation,
  useUpdateVisualizationMutation,
  useDeleteVisualizationMutation,
  useGetVisualizationDataQuery,
  useExportVisualizationQuery,
  useSaveVisualizationMutation,
} = visualizationApi;
