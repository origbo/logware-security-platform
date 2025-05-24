/**
 * Attack Path Modeling Service
 *
 * API service for attack path modeling and simulation
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Asset,
  Vulnerability,
  AttackVector,
  AttackPath,
  SecurityControl,
  AttackSimulationResult,
  AttackPathStats,
  AttackPathSearchParams,
} from "../types/attackPathTypes";

export const attackPathApi = createApi({
  reducerPath: "attackPathApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/advanced-security/attack-path",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Assets",
    "Vulnerabilities",
    "AttackVectors",
    "AttackPaths",
    "SecurityControls",
    "SimulationResults",
    "AttackPathStats",
  ],
  endpoints: (builder) => ({
    // Get assets with optional filtering
    getAssets: builder.query<
      Asset[],
      { type?: string; criticality?: string; query?: string }
    >({
      query: (params) => ({
        url: "/assets",
        params,
      }),
      providesTags: ["Assets"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): Asset[] => {
        return [
          {
            id: "asset-1",
            name: "Web Server 01",
            type: "SERVER",
            description: "Primary web server hosting company website",
            criticality: "HIGH",
            location: "Main Data Center",
            owner: "IT Operations",
            networkZone: "DMZ",
            ipAddresses: ["10.0.0.10", "2001:db8::1"],
            tags: ["web", "production", "internet-facing"],
            vulnerabilities: ["vuln-1", "vuln-3"],
            controls: ["control-1", "control-2"],
            attributes: {
              os: "Linux",
              osVersion: "20.04 LTS",
              patchLevel: "Latest",
              services: ["http", "https"],
            },
          },
          {
            id: "asset-2",
            name: "Database Server 01",
            type: "DATABASE",
            description: "Primary database server hosting customer data",
            criticality: "CRITICAL",
            location: "Main Data Center",
            owner: "Database Admin Team",
            networkZone: "Secure Zone",
            ipAddresses: ["10.0.1.20"],
            tags: ["database", "production", "customer-data"],
            vulnerabilities: ["vuln-2"],
            controls: ["control-3"],
            attributes: {
              os: "Linux",
              osVersion: "20.04 LTS",
              dbType: "PostgreSQL",
              dbVersion: "13.4",
              dataClassification: "Sensitive",
            },
          },
        ] as Asset[];
      },
    }),

    // Get a single asset by ID
    getAsset: builder.query<Asset, string>({
      query: (id) => `/assets/${id}`,
      providesTags: (result, error, id) => [{ type: "Assets", id }],
    }),

    // Create asset
    createAsset: builder.mutation<Asset, Omit<Asset, "id">>({
      query: (asset) => ({
        url: "/assets",
        method: "POST",
        body: asset,
      }),
      invalidatesTags: ["Assets", "AttackPathStats"],
    }),

    // Update asset
    updateAsset: builder.mutation<Asset, Partial<Asset> & { id: string }>(
      {
        query: (assetData) => {
          const { id, ...assetUpdate } = assetData;
          return {
            url: `/assets/${id}`,
            method: "PATCH",
            body: assetUpdate,
          };
        },
        invalidatesTags: (result, error, { id }) => [
          { type: "Assets", id },
          "AttackPaths",
          "AttackPathStats",
        ],
      }
    ),

    // Delete asset
    deleteAsset: builder.mutation<void, string>({
      query: (id) => ({
        url: `/assets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assets", "AttackPaths", "AttackPathStats"],
    }),

    // Get vulnerabilities with optional filtering
    getVulnerabilities: builder.query<
      Vulnerability[],
      { type?: string; severity?: string; status?: string; query?: string }
    >({
      query: (params) => ({
        url: "/vulnerabilities",
        params,
      }),
      providesTags: ["Vulnerabilities"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): Vulnerability[] => {
        return [
          {
            id: "vuln-1",
            name: "Log4Shell Vulnerability",
            type: "APPLICATION",
            description:
              "Remote code execution vulnerability in Log4j 2 versions prior to 2.15.0",
            severity: "CRITICAL",
            cveId: "CVE-2021-44228",
            cweId: "CWE-502",
            exploitability: "VERY_HIGH",
            cvssScore: 10,
            affected: ["asset-1"],
            status: "OPEN",
            discoveredAt: "2021-12-10T00:00:00Z",
            remediation: "Upgrade to Log4j 2.15.0 or later",
            references: [
              "https://nvd.nist.gov/vuln/detail/CVE-2021-44228",
              "https://logging.apache.org/log4j/2.x/security.html",
            ],
            exploitDetails:
              "Attackers can exploit this vulnerability by sending a specially crafted request that uses JNDI lookup.",
          },
          {
            id: "vuln-2",
            name: "Unpatched SQL Injection",
            type: "APPLICATION",
            description:
              "SQL injection vulnerability in the user login component",
            severity: "HIGH",
            cweId: "CWE-89",
            exploitability: "HIGH",
            cvssScore: 8.2,
            affected: ["asset-2"],
            status: "IN_PROGRESS",
            discoveredAt: "2023-01-15T00:00:00Z",
            remediation: "Implement parameterized queries and input validation",
            references: ["https://owasp.org/www-community/attacks/SQL_Injection"],
            exploitDetails:
              "User input is not sanitized before being included in SQL queries, allowing attackers to inject arbitrary SQL code.",
          },
          {
            id: "vuln-3",
            name: "Outdated SSL/TLS Version",
            type: "CONFIGURATION",
            description: "Server is using outdated TLS 1.0 protocol",
            severity: "MEDIUM",
            cweId: "CWE-326",
            exploitability: "MEDIUM",
            cvssScore: 5.9,
            affected: ["asset-1"],
            status: "OPEN",
            discoveredAt: "2023-02-10T00:00:00Z",
            remediation:
              "Disable TLS 1.0/1.1 and configure to use only TLS 1.2 or later",
            references: [
              "https://nvd.nist.gov/vuln/detail/CVE-2011-3389",
              "https://www.acunetix.com/blog/articles/tls-vulnerabilities-attacks-final-part/",
            ],
          },
        ] as Vulnerability[];
      },
    }),

    // Get a single vulnerability by ID
    getVulnerability: builder.query<Vulnerability, string>({
      query: (id) => `/vulnerabilities/${id}`,
      providesTags: (result, error, id) => [{ type: "Vulnerabilities", id }],
    }),

    // Create vulnerability
    createVulnerability: builder.mutation<
      Vulnerability,
      Omit<Vulnerability, "id">
    >({
      query: (vulnerability) => ({
        url: "/vulnerabilities",
        method: "POST",
        body: vulnerability,
      }),
      invalidatesTags: ["Vulnerabilities", "Assets", "AttackPathStats"],
    }),

    // Update vulnerability
    updateVulnerability: builder.mutation<
      Vulnerability,
      Partial<Vulnerability> & { id: string }
    >({
      query: (vulnerabilityData) => {
        const { id, ...vulnerabilityUpdate } = vulnerabilityData;
        return {
          url: `/vulnerabilities/${id}`,
          method: "PATCH",
          body: vulnerabilityUpdate,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Vulnerabilities", id },
        "Assets",
        "AttackPathStats",
      ],
    }),

    // Delete vulnerability
    deleteVulnerability: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vulnerabilities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vulnerabilities", "Assets", "AttackPathStats"],
    }),

    // Get attack vectors with optional filtering
    getAttackVectors: builder.query<
      AttackVector[],
      { technique?: string; probability?: string }
    >({
      query: (params) => ({
        url: "/vectors",
        params,
      }),
      providesTags: ["AttackVectors"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): AttackVector[] => {
        return [
          {
            id: "vector-1",
            name: "Log4Shell Exploitation",
            description: "Exploitation of Log4j vulnerability for remote code execution",
            technique: "EXECUTION",
            mitreTechnique: "T1059",
            probability: "HIGH",
            prerequisites: ["vuln-1"],
            impact: "CRITICAL",
            countermeasures: ["control-1"],
          },
          {
            id: "vector-2",
            name: "SQL Injection to Data Exfiltration",
            description: "Using SQL injection to extract sensitive data",
            technique: "EXFILTRATION",
            mitreTechnique: "T1030",
            probability: "MEDIUM",
            prerequisites: ["vuln-2"],
            impact: "HIGH",
            countermeasures: ["control-3"],
          },
        ] as AttackVector[];
      },
    }),

    // Get a single attack vector by ID
    getAttackVector: builder.query<AttackVector, string>({
      query: (id) => `/vectors/${id}`,
      providesTags: (result, error, id) => [{ type: "AttackVectors", id }],
    }),

    // Create attack vector
    createAttackVector: builder.mutation<
      AttackVector,
      Omit<AttackVector, "id">
    >({
      query: (vector) => ({
        url: "/vectors",
        method: "POST",
        body: vector,
      }),
      invalidatesTags: ["AttackVectors", "AttackPathStats"],
    }),

    // Update attack vector
    updateAttackVector: builder.mutation<
      AttackVector,
      Partial<AttackVector> & { id: string }
    >({
      query: (vectorData) => {
        const { id, ...vectorUpdate } = vectorData;
        return {
          url: `/vectors/${id}`,
          method: "PATCH",
          body: vectorUpdate,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "AttackVectors", id },
        "AttackPathStats",
      ],
    }),

    // Delete attack vector
    deleteAttackVector: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vectors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AttackVectors", "AttackPathStats"],
    }),

    // Get security controls with optional filtering
    getSecurityControls: builder.query<
      SecurityControl[],
      { type?: string; status?: string }
    >({
      query: (params) => ({
        url: "/controls",
        params,
      }),
      providesTags: ["SecurityControls"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): SecurityControl[] => {
        return [
          {
            id: "control-1",
            name: "WAF Implementation",
            description:
              "Web Application Firewall configured to block JNDI lookup requests",
            type: "PREVENTIVE",
            implementationStatus: "IMPLEMENTED",
            effectiveness: "HIGH",
            costToBenefit: "MEDIUM",
            assets: ["asset-1"],
            mitigates: ["vuln-1"],
            framework: "NIST",
            frameworkControlId: "SI-10",
            owner: "Security Team",
            lastReviewDate: "2023-01-15T00:00:00Z",
            nextReviewDate: "2023-07-15T00:00:00Z",
          },
          {
            id: "control-2",
            name: "Regular Patching",
            description: "Automated patch management for all production servers",
            type: "PREVENTIVE",
            implementationStatus: "IMPLEMENTED",
            effectiveness: "HIGH",
            costToBenefit: "HIGH",
            assets: ["asset-1"],
            mitigates: ["vuln-3"],
            framework: "NIST",
            frameworkControlId: "SI-2",
            owner: "IT Operations",
            lastReviewDate: "2023-02-01T00:00:00Z",
            nextReviewDate: "2023-05-01T00:00:00Z",
          },
          {
            id: "control-3",
            name: "Database Input Validation",
            description: "Input validation and parameterized queries for database access",
            type: "PREVENTIVE",
            implementationStatus: "IN_PROGRESS",
            effectiveness: "HIGH",
            costToBenefit: "HIGH",
            assets: ["asset-2"],
            mitigates: ["vuln-2"],
            framework: "OWASP",
            frameworkControlId: "A1:2021",
            owner: "Development Team",
            lastReviewDate: "2023-01-20T00:00:00Z",
            nextReviewDate: "2023-04-20T00:00:00Z",
          },
        ] as SecurityControl[];
      },
    }),

    // Get a single security control by ID
    getSecurityControl: builder.query<SecurityControl, string>({
      query: (id) => `/controls/${id}`,
      providesTags: (result, error, id) => [{ type: "SecurityControls", id }],
    }),

    // Create security control
    createSecurityControl: builder.mutation<
      SecurityControl,
      Omit<SecurityControl, "id">
    >({
      query: (control) => ({
        url: "/controls",
        method: "POST",
        body: control,
      }),
      invalidatesTags: ["SecurityControls", "Assets", "AttackPathStats"],
    }),

    // Update security control
    updateSecurityControl: builder.mutation<
      SecurityControl,
      Partial<SecurityControl> & { id: string }
    >({
      query: (controlData) => {
        const { id, ...controlUpdate } = controlData;
        return {
          url: `/controls/${id}`,
          method: "PATCH",
          body: controlUpdate,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "SecurityControls", id },
        "Assets",
        "AttackVectors",
        "AttackPathStats",
      ],
    }),

    // Delete security control
    deleteSecurityControl: builder.mutation<void, string>({
      query: (id) => ({
        url: `/controls/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SecurityControls", "Assets", "AttackPathStats"],
    }),

    // Get attack paths
    getAttackPaths: builder.query<AttackPath[], AttackPathSearchParams | void>({
      query: (params) => ({
        url: "/paths",
        params,
      }),
      providesTags: ["AttackPaths"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): AttackPath[] => {
        return [
          {
            id: "path-1",
            name: "Web to Database Attack Path",
            description:
              "Attack path from external access to sensitive database",
            startPoint: "asset-1",
            endPoint: "asset-2",
            steps: [
              {
                id: "step-1",
                description: "Exploit Log4Shell vulnerability on web server",
                vector: "vector-1",
                sourceAsset: "asset-1",
                targetAsset: "asset-1",
                probability: "HIGH",
                impact: "HIGH",
              },
              {
                id: "step-2",
                description: "Pivot to database server",
                vector: "vector-2",
                sourceAsset: "asset-1",
                targetAsset: "asset-2",
                probability: "MEDIUM",
                impact: "CRITICAL",
              },
            ],
            probability: "MEDIUM",
            impact: "CRITICAL",
            riskScore: 8.5,
            mitigationControls: ["control-1", "control-3"],
            tags: ["critical-path", "data-breach"],
            createdAt: "2023-02-01T00:00:00Z",
            updatedAt: "2023-02-15T00:00:00Z",
          },
        ] as AttackPath[];
      },
    }),

    // Get a single attack path by ID
    getAttackPath: builder.query<AttackPath, string>({
      query: (id) => `/paths/${id}`,
      providesTags: (result, error, id) => [{ type: "AttackPaths", id }],
    }),

    // Create attack path
    createAttackPath: builder.mutation<AttackPath, Omit<AttackPath, "id">>({
      query: (path) => ({
        url: "/paths",
        method: "POST",
        body: path,
      }),
      invalidatesTags: ["AttackPaths", "AttackPathStats"],
    }),

    // Update attack path
    updateAttackPath: builder.mutation<
      AttackPath,
      Partial<AttackPath> & { id: string }
    >({
      query: (pathData) => {
        const { id, ...pathUpdate } = pathData;
        return {
          url: `/paths/${id}`,
          method: "PATCH",
          body: pathUpdate,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "AttackPaths", id },
        "AttackPathStats",
      ],
    }),

    // Delete attack path
    deleteAttackPath: builder.mutation<void, string>({
      query: (id) => ({
        url: `/paths/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AttackPaths", "AttackPathStats"],
    }),

    // Run attack path simulation
    runSimulation: builder.mutation<
      AttackSimulationResult,
      {
        pathId: string;
        name: string;
        description?: string;
        options?: Record<string, any>;
      }
    >({
      query: (body) => ({
        url: "/simulate",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { pathId }) => [
        { type: "AttackPaths", id: pathId },
        "SimulationResults",
      ],
    }),

    // Get simulation results for an attack path
    getSimulationResults: builder.query<AttackSimulationResult[], string>({
      query: (pathId) => `/paths/${pathId}/simulations`,
      providesTags: (result, error, pathId) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "SimulationResults" as const,
                id,
              })),
              { type: "SimulationResults", id: pathId },
            ]
          : [{ type: "SimulationResults", id: pathId }],
    }),

    // Get attack path statistics
    getAttackPathStats: builder.query<AttackPathStats, void>({
      query: () => "/stats",
      providesTags: ["AttackPathStats"],
      // Mock data for development
      transformResponse: (baseQueryReturnValue: any): AttackPathStats => {
        return {
          totalAssets: 34,
          totalVulnerabilities: 86,
          criticalVulnerabilities: 12,
          totalAttackPaths: 28,
          criticalAttackPaths: 8,
          assetsByType: {
            SERVER: 10,
            WORKSTATION: 15,
            ROUTER: 3,
            FIREWALL: 2,
            DATABASE: 4,
            APPLICATION: 6,
            CONTAINER: 12,
            STORAGE: 2,
            IOT_DEVICE: 3,
            CLOUD_SERVICE: 8,
            NETWORK_SEGMENT: 4,
            USER: 25,
            IDENTITY: 15,
          },
          vulnerabilitiesBySeverity: {
            critical: 12,
            high: 24,
            medium: 35,
            low: 15,
          },
          topVulnerableAssets: [
            {
              assetId: "asset-1",
              name: "Web Server 01",
              vulnerabilityCount: 5,
              criticality: "HIGH",
            },
            {
              assetId: "asset-2",
              name: "Database Server 01",
              vulnerabilityCount: 3,
              criticality: "CRITICAL",
            },
          ],
          topAttackVectors: [
            {
              vectorId: "vector-1",
              name: "Log4Shell Exploitation",
              technique: "EXECUTION",
              frequency: 8,
            },
            {
              vectorId: "vector-2",
              name: "SQL Injection to Data Exfiltration",
              technique: "EXFILTRATION",
              frequency: 6,
            },
          ],
        } as AttackPathStats;
      },
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useGetAssetQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useGetVulnerabilitiesQuery,
  useGetVulnerabilityQuery,
  useCreateVulnerabilityMutation,
  useUpdateVulnerabilityMutation,
  useDeleteVulnerabilityMutation,
  useGetAttackVectorsQuery,
  useGetAttackVectorQuery,
  useCreateAttackVectorMutation,
  useUpdateAttackVectorMutation,
  useDeleteAttackVectorMutation,
  useGetSecurityControlsQuery,
  useGetSecurityControlQuery,
  useCreateSecurityControlMutation,
  useUpdateSecurityControlMutation,
  useDeleteSecurityControlMutation,
  useGetAttackPathsQuery,
  useGetAttackPathQuery,
  useCreateAttackPathMutation,
  useUpdateAttackPathMutation,
  useDeleteAttackPathMutation,
  useRunSimulationMutation,
  useGetSimulationResultsQuery,
  useGetAttackPathStatsQuery,
} = attackPathApi;
