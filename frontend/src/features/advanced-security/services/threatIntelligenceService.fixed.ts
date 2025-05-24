/**
 * Threat Intelligence Service
 *
 * API service for the threat intelligence platform
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ThreatIndicator,
  ThreatIntelFeed,
  ThreatActor,
  ThreatReport,
  ThreatIntelStats,
  ThreatSearchParams,
} from "../types/threatIntelTypes";

export const threatIntelligenceApi = createApi({
  reducerPath: "threatIntelligenceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/advanced-security/threat-intel",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Indicators", "Feeds", "Actors", "Reports", "ThreatStats"],
  endpoints: (builder) => ({
    // Get threat indicators with optional filtering
    getThreatIndicators: builder.query<
      ThreatIndicator[],
      ThreatSearchParams | void
    >({
      query: (params) => ({
        url: "/indicators",
        params,
      }),
      providesTags: ["Indicators"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): ThreatIndicator[] => {
        return [
          {
            id: "indicator-1",
            type: "IP",
            value: "203.0.113.1",
            categories: ["COMMAND_AND_CONTROL", "BOTNET"],
            firstSeen: new Date(Date.now() - 30 * 86400000).toISOString(),
            lastSeen: new Date(Date.now() - 2 * 86400000).toISOString(),
            expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
            sources: ["feed-1", "feed-3"],
            confidence: 80,
            severity: "HIGH",
            tags: ["malware", "botnet", "suspicious"],
            context: "Associated with Emotet botnet activity",
            relatedIndicators: ["indicator-2"],
            status: "ACTIVE",
            assignedTo: "analyst",
            investigationStatus: "IN_PROGRESS",
          },
          {
            id: "indicator-2",
            type: "URL",
            value: "http://malicious-example.com/payload",
            categories: ["PHISHING", "MALWARE_DISTRIBUTION"],
            firstSeen: new Date(Date.now() - 15 * 86400000).toISOString(),
            lastSeen: new Date(Date.now() - 1 * 86400000).toISOString(),
            expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
            sources: ["feed-2"],
            confidence: 90,
            severity: "CRITICAL",
            tags: ["phishing", "malware", "ransomware"],
            context: "Distributes LockBit ransomware",
            relatedIndicators: ["indicator-3"],
            status: "ACTIVE",
            assignedTo: "admin",
            investigationStatus: "NOT_STARTED",
          },
          {
            id: "indicator-3",
            type: "DOMAIN",
            value: "malicious-example.com",
            categories: ["MALWARE_DISTRIBUTION"],
            firstSeen: new Date(Date.now() - 20 * 86400000).toISOString(),
            lastSeen: new Date(Date.now() - 1 * 86400000).toISOString(),
            expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
            sources: ["feed-1", "feed-2"],
            confidence: 85,
            severity: "HIGH",
            tags: ["malware", "dropper"],
            context: "Malware distribution domain",
            relatedIndicators: ["indicator-2"],
            status: "ACTIVE",
            assignedTo: null,
            investigationStatus: "NOT_STARTED",
          },
        ] as ThreatIndicator[];
      },
    }),

    // Get a single threat indicator by ID
    getThreatIndicator: builder.query<ThreatIndicator, string>({
      query: (id) => `/indicators/${id}`,
      providesTags: (result, error, id) => [{ type: "Indicators", id }],
    }),

    // Create threat indicator
    createThreatIndicator: builder.mutation<
      ThreatIndicator,
      Omit<ThreatIndicator, "id">
    >({
      query: (indicator) => ({
        url: "/indicators",
        method: "POST",
        body: indicator,
      }),
      invalidatesTags: ["Indicators", "ThreatStats"],
    }),

    // Update threat indicator
    updateThreatIndicator: builder.mutation<
      ThreatIndicator,
      Partial<ThreatIndicator> & { id: string }
    >({
      query: (indicatorData) => {
        const { id, ...indicatorUpdate } = indicatorData;
        return {
          url: `/indicators/${id}`,
          method: "PATCH",
          body: indicatorUpdate,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Indicators", id },
        "ThreatStats",
      ],
    }),

    // Delete threat indicator
    deleteThreatIndicator: builder.mutation<void, string>({
      query: (id) => ({
        url: `/indicators/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Indicators", "ThreatStats"],
    }),

    // Get threat intel feeds
    getThreatIntelFeeds: builder.query<ThreatIntelFeed[], void>({
      query: () => "/feeds",
      providesTags: ["Feeds"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): ThreatIntelFeed[] => {
        return [
          {
            id: "feed-1",
            name: "AlienVault OTX",
            description: "Open Threat Exchange",
            feedType: "OPEN_SOURCE",
            provider: "AlienVault",
            url: "https://otx.alienvault.com",
            apiKey: "****",
            status: "ACTIVE",
            indicatorCount: 2500,
            updateFrequency: "DAILY",
            lastUpdated: new Date(Date.now() - 1 * 86400000).toISOString(),
            categories: ["IP", "DOMAIN", "URL", "FILE_HASH"],
            reliability: "HIGH",
            enabled: true,
          },
          {
            id: "feed-2",
            name: "MISP Threat Sharing",
            description: "MISP Open Source Threat Intelligence Platform",
            feedType: "COMMUNITY",
            provider: "MISP Project",
            url: "https://www.misp-project.org",
            apiKey: "****",
            status: "ACTIVE",
            indicatorCount: 1800,
            updateFrequency: "DAILY",
            lastUpdated: new Date(Date.now() - 1 * 86400000).toISOString(),
            categories: ["IP", "DOMAIN", "URL", "FILE_HASH", "EMAIL"],
            reliability: "HIGH",
            enabled: true,
          },
          {
            id: "feed-3",
            name: "Commercial Threat Feed",
            description: "Premium commercial threat intelligence",
            feedType: "COMMERCIAL",
            provider: "Security Vendor",
            url: "https://example.com/threat-feed",
            apiKey: "****",
            status: "ACTIVE",
            indicatorCount: 5000,
            updateFrequency: "HOURLY",
            lastUpdated: new Date(Date.now() - 0.1 * 86400000).toISOString(),
            categories: ["IP", "DOMAIN", "URL", "FILE_HASH", "VULNERABILITY"],
            reliability: "VERY_HIGH",
            enabled: true,
          },
        ] as ThreatIntelFeed[];
      },
    }),

    // Update threat intel feed configuration
    updateThreatIntelFeed: builder.mutation<
      ThreatIntelFeed,
      Partial<ThreatIntelFeed> & { id: string }
    >({
      query: (feedData) => {
        const { id, ...feedUpdate } = feedData;
        return {
          url: `/feeds/${id}`,
          method: "PATCH",
          body: feedUpdate,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Feeds", id },
        "Indicators",
      ],
    }),

    // Get threat actors
    getThreatActors: builder.query<ThreatActor[], { search?: string }>({
      query: (params) => ({
        url: "/actors",
        params,
      }),
      providesTags: ["Actors"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): ThreatActor[] => {
        return [
          {
            id: "actor-1",
            name: "APT29",
            aliases: ["Cozy Bear", "The Dukes", "CozyDuke"],
            description:
              "APT29 is a threat group that has been attributed to the Russian government and has operated since at least 2008.",
            motivations: ["ESPIONAGE", "INFORMATION_THEFT"],
            threatLevel: "HIGH",
            targetSectors: [
              "GOVERNMENT",
              "DEFENSE",
              "THINK_TANKS",
              "HEALTHCARE",
            ],
            targetRegions: ["UNITED_STATES", "EUROPE", "NATO_COUNTRIES"],
            attackVectors: ["SPEAR_PHISHING", "WATERING_HOLE", "SUPPLY_CHAIN"],
            toolsAndMalware: [
              "MiniDuke",
              "CosmicDuke",
              "OnionDuke",
              "HAMMERTOSS",
            ],
            observedSince: "2008-01-01T00:00:00Z",
            lastUpdated: "2023-01-15T00:00:00Z",
            associatedIndicators: ["indicator-1"],
            associatedCampaigns: ["campaign-1"],
            mitreTactics: ["INITIAL_ACCESS", "EXECUTION", "PERSISTENCE"],
          },
          {
            id: "actor-2",
            name: "FIN7",
            aliases: ["Carbanak", "Navigator Group"],
            description:
              "FIN7 is a financially motivated threat group that has been active since at least 2015, primarily targeting the retail, restaurant, and hospitality sectors.",
            motivations: ["FINANCIAL_GAIN"],
            threatLevel: "HIGH",
            targetSectors: ["RETAIL", "HOSPITALITY", "RESTAURANT", "FINANCIAL"],
            targetRegions: ["UNITED_STATES", "EUROPE", "AUSTRALIA"],
            attackVectors: ["SPEAR_PHISHING", "SOCIAL_ENGINEERING", "MALWARE"],
            toolsAndMalware: ["Carbanak", "GRIFFON", "TEXTMATE", "BATELEUR"],
            observedSince: "2015-01-01T00:00:00Z",
            lastUpdated: "2023-02-01T00:00:00Z",
            associatedIndicators: ["indicator-2"],
            associatedCampaigns: ["campaign-2"],
            mitreTactics: [
              "INITIAL_ACCESS",
              "EXECUTION",
              "PERSISTENCE",
              "LATERAL_MOVEMENT",
            ],
          },
        ] as ThreatActor[];
      },
    }),

    // Get a single threat actor by ID
    getThreatActor: builder.query<ThreatActor, string>({
      query: (id) => `/actors/${id}`,
      providesTags: (result, error, id) => [{ type: "Actors", id }],
    }),

    // Update threat actor
    updateThreatActor: builder.mutation<
      ThreatActor,
      Partial<ThreatActor> & { id: string }
    >({
      query: (actorData) => {
        const { id, ...actorUpdate } = actorData;
        return {
          url: `/actors/${id}`,
          method: "PATCH",
          body: actorUpdate,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Actors", id },
        "Reports",
      ],
    }),

    // Get threat reports
    getThreatReports: builder.query<
      ThreatReport[],
      { search?: string; category?: string; limit?: number }
    >({
      query: (params) => ({
        url: "/reports",
        params,
      }),
      providesTags: ["Reports"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): ThreatReport[] => {
        return [
          {
            id: "report-1",
            title: "APT29 Campaign Targeting COVID-19 Research",
            category: "APT",
            summary:
              "APT29 has been targeting organizations involved in COVID-19 vaccine development.",
            content:
              "## Overview\n\nAPT29 (also known as 'Cozy Bear') has been identified conducting widespread campaigns targeting primarily COVID-19 vaccine development and research organizations. The group is using custom malware known as 'WellMess' and 'WellMail' to target these organizations.\n\n## Technical Details\n\n- Initial access through spear-phishing and exploitation of public-facing applications\n- Use of custom malware WellMess and WellMail for command and control\n- Targeting of external remote services for initial access\n- Deployment of legitimate utilities like Mimikatz for credential theft\n\n## Indicators of Compromise\n\n- File hashes and C2 servers listed in the Appendix\n\n## Recommendations\n\n- Implement multi-factor authentication\n- Keep systems patched and up to date\n- Use endpoint detection and response solutions\n- Monitor for suspicious network activity",
            publishedAt: "2023-01-20T00:00:00Z",
            updatedAt: "2023-01-25T00:00:00Z",
            severity: "HIGH",
            confidence: "HIGH",
            tlp: "AMBER",
            author: "Security Research Team",
            relatedIndicators: ["indicator-1"],
            relatedActors: ["actor-1"],
            tags: ["covid-19", "apt29", "vaccine", "research"],
            attachments: [],
          },
          {
            id: "report-2",
            title: "FIN7 Targeting Hospitality Sector with New Malware",
            category: "CRIMINAL",
            summary:
              "FIN7 has been observed using new malware in campaigns targeting the hospitality sector.",
            content:
              "## Overview\n\nFIN7, a financially motivated threat actor, has been observed using new malware variants in campaigns specifically targeting the hospitality sector. The group continues to evolve their tactics, techniques, and procedures (TTPs) to evade detection.\n\n## Technical Details\n\n- Initial access primarily through phishing emails containing malicious Word documents\n- New JavaScript backdoor used for persistent access\n- Lateral movement using stolen credentials and legitimate tools\n- Point-of-sale (POS) malware deployment for credit card theft\n\n## Indicators of Compromise\n\n- File hashes and C2 servers listed in the Appendix\n\n## Recommendations\n\n- Train employees to identify phishing attempts\n- Implement application whitelisting\n- Segment POS networks from corporate networks\n- Deploy modern endpoint protection solutions",
            publishedAt: "2023-02-05T00:00:00Z",
            updatedAt: "2023-02-05T00:00:00Z",
            severity: "HIGH",
            confidence: "MEDIUM",
            tlp: "GREEN",
            author: "Threat Research Team",
            relatedIndicators: ["indicator-2"],
            relatedActors: ["actor-2"],
            tags: ["fin7", "hospitality", "pos", "malware"],
            attachments: [],
          },
        ] as ThreatReport[];
      },
    }),

    // Get a single threat report by ID
    getThreatReport: builder.query<ThreatReport, string>({
      query: (id) => `/reports/${id}`,
      providesTags: (result, error, id) => [{ type: "Reports", id }],
    }),

    // Create threat report
    createThreatReport: builder.mutation<
      ThreatReport,
      Omit<ThreatReport, "id">
    >({
      query: (report) => ({
        url: "/reports",
        method: "POST",
        body: report,
      }),
      invalidatesTags: ["Reports"],
    }),

    // Update threat report
    updateThreatReport: builder.mutation<
      ThreatReport,
      Partial<ThreatReport> & { id: string }
    >({
      query: (reportData) => {
        const { id, ...reportUpdate } = reportData;
        return {
          url: `/reports/${id}`,
          method: "PATCH",
          body: reportUpdate,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: "Reports", id }],
    }),

    // Delete threat report
    deleteThreatReport: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reports/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reports"],
    }),

    // Get threat intelligence statistics
    getThreatIntelStats: builder.query<ThreatIntelStats, void>({
      query: () => "/stats",
      providesTags: ["ThreatStats"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): ThreatIntelStats => {
        return {
          totalIndicators: 12500,
          activeIndicators: 8750,
          indicatorsByType: {
            IP: 3500,
            DOMAIN: 2800,
            URL: 2200,
            FILE_HASH: 3000,
            EMAIL: 1000,
          },
          indicatorsBySeverity: {
            CRITICAL: 1250,
            HIGH: 3750,
            MEDIUM: 5000,
            LOW: 2500,
          },
          indicatorsByConfidence: {
            VERY_HIGH: 2000,
            HIGH: 3500,
            MEDIUM: 5000,
            LOW: 2000,
          },
          indicatorsByCategory: {
            MALWARE: 3000,
            PHISHING: 2500,
            COMMAND_AND_CONTROL: 2000,
            BOTNET: 1500,
            RANSOMWARE: 1000,
            APT: 1500,
            EXPLOIT: 1000,
          },
          recentActivityTimeline: [
            {
              date: new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0],
              count: 320,
            },
            {
              date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
              count: 280,
            },
            {
              date: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0],
              count: 350,
            },
            {
              date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0],
              count: 410,
            },
            {
              date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
              count: 380,
            },
            {
              date: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
              count: 420,
            },
            {
              date: new Date().toISOString().split("T")[0],
              count: 150,
            },
          ],
          topThreatActors: [
            {
              actorId: "actor-1",
              name: "APT29",
              indicatorCount: 450,
              threatLevel: "HIGH",
            },
            {
              actorId: "actor-2",
              name: "FIN7",
              indicatorCount: 380,
              threatLevel: "HIGH",
            },
          ],
          feedStats: [
            {
              feedId: "feed-1",
              name: "AlienVault OTX",
              indicatorCount: 2500,
              reliability: "HIGH",
            },
            {
              feedId: "feed-2",
              name: "MISP Threat Sharing",
              indicatorCount: 1800,
              reliability: "HIGH",
            },
            {
              feedId: "feed-3",
              name: "Commercial Threat Feed",
              indicatorCount: 5000,
              reliability: "VERY_HIGH",
            },
          ],
        } as ThreatIntelStats;
      },
    }),
  }),
});

export const {
  useGetThreatIndicatorsQuery,
  useGetThreatIndicatorQuery,
  useCreateThreatIndicatorMutation,
  useUpdateThreatIndicatorMutation,
  useDeleteThreatIndicatorMutation,
  useGetThreatIntelFeedsQuery,
  useUpdateThreatIntelFeedMutation,
  useGetThreatActorsQuery,
  useGetThreatActorQuery,
  useUpdateThreatActorMutation,
  useGetThreatReportsQuery,
  useGetThreatReportQuery,
  useCreateThreatReportMutation,
  useUpdateThreatReportMutation,
  useDeleteThreatReportMutation,
  useGetThreatIntelStatsQuery,
} = threatIntelligenceApi;
