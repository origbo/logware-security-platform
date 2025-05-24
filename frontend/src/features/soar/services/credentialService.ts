/**
 * Credential Management Service
 *
 * Provides secure API functions for managing credentials used in SOAR playbooks
 * and integration with external security tools. Handles encryption, storage, and
 * retrieval of sensitive authentication data.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "../../../config";

// Credential types
export type CredentialType =
  | "api_key"
  | "username_password"
  | "oauth2"
  | "certificate"
  | "ssh_key"
  | "aws_key"
  | "azure_key"
  | "gcp_key"
  | "custom";

// Base credential interface
export interface Credential {
  id: string;
  name: string;
  description: string;
  type: CredentialType;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastUsed?: string;
  targetSystem: string;
  tags: string[];
}

// API Key credentials
export interface ApiKeyCredential extends Credential {
  type: "api_key";
  config: {
    apiKey: string;
    headerName?: string;
    queryParamName?: string;
    expirationDate?: string;
  };
}

// Username/Password credentials
export interface UsernamePasswordCredential extends Credential {
  type: "username_password";
  config: {
    username: string;
    password: string;
    domain?: string;
  };
}

// OAuth2 credentials
export interface OAuth2Credential extends Credential {
  type: "oauth2";
  config: {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    refreshToken?: string;
    accessToken?: string;
    tokenExpiration?: string;
    scope?: string;
  };
}

// Certificate credentials
export interface CertificateCredential extends Credential {
  type: "certificate";
  config: {
    certificate: string;
    privateKey?: string;
    passphrase?: string;
  };
}

// SSH Key credentials
export interface SshKeyCredential extends Credential {
  type: "ssh_key";
  config: {
    username: string;
    privateKey: string;
    passphrase?: string;
    hostKey?: string;
  };
}

// AWS credentials
export interface AwsKeyCredential extends Credential {
  type: "aws_key";
  config: {
    accessKeyId: string;
    secretAccessKey: string;
    region?: string;
    sessionToken?: string;
  };
}

// Azure credentials
export interface AzureKeyCredential extends Credential {
  type: "azure_key";
  config: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    subscriptionId?: string;
  };
}

// GCP credentials
export interface GcpKeyCredential extends Credential {
  type: "gcp_key";
  config: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
  };
}

// Custom credentials
export interface CustomCredential extends Credential {
  type: "custom";
  config: Record<string, any>;
}

// Union type for all credential types
export type CredentialWithConfig =
  | ApiKeyCredential
  | UsernamePasswordCredential
  | OAuth2Credential
  | CertificateCredential
  | SshKeyCredential
  | AwsKeyCredential
  | AzureKeyCredential
  | GcpKeyCredential
  | CustomCredential;

// Response type for testing credentials
export interface CredentialTestResult {
  success: boolean;
  message: string;
  details?: string;
  timestamp: string;
}

/**
 * RTK Query API service for credential management
 */
export const credentialApi = createApi({
  reducerPath: "credentialApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/soar/credentials`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Credential"],
  endpoints: (builder) => ({
    // Get all credentials with optional filters
    getCredentials: builder.query<
      Credential[],
      { type?: CredentialType; targetSystem?: string; tags?: string[] }
    >({
      query: (params) => {
        let queryParams = "";
        if (params.type) queryParams += `type=${params.type}&`;
        if (params.targetSystem)
          queryParams += `targetSystem=${params.targetSystem}&`;
        if (params.tags && params.tags.length > 0) {
          params.tags.forEach((tag) => {
            queryParams += `tags=${tag}&`;
          });
        }
        return `?${queryParams}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Credential" as const, id })),
              { type: "Credential", id: "LIST" },
            ]
          : [{ type: "Credential", id: "LIST" }],
    }),

    // Get a credential by ID
    getCredentialById: builder.query<CredentialWithConfig, string>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: "Credential", id }],
    }),

    // Create a new credential
    createCredential: builder.mutation<
      Credential,
      Omit<CredentialWithConfig, "id" | "createdAt" | "updatedAt">
    >({
      query: (credential) => ({
        url: "",
        method: "POST",
        body: credential,
      }),
      invalidatesTags: [{ type: "Credential", id: "LIST" }],
    }),

    // Update an existing credential
    updateCredential: builder.mutation<
      Credential,
      Partial<CredentialWithConfig> & { id: string }
    >({
      query: ({ id, ...credential }) => ({
        url: `/${id}`,
        method: "PUT",
        body: credential,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Credential", id }],
    }),

    // Delete a credential
    deleteCredential: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [{ type: "Credential", id }],
    }),

    // Test a credential
    testCredential: builder.mutation<
      CredentialTestResult,
      { id: string; params?: Record<string, any> }
    >({
      query: ({ id, params }) => ({
        url: `/${id}/test`,
        method: "POST",
        body: params || {},
      }),
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetCredentialsQuery,
  useGetCredentialByIdQuery,
  useCreateCredentialMutation,
  useUpdateCredentialMutation,
  useDeleteCredentialMutation,
  useTestCredentialMutation,
} = credentialApi;

/**
 * Utility functions for working with credentials
 */

/**
 * Mask sensitive data in credentials for display purposes
 */
export const maskCredential = (
  credential: CredentialWithConfig
): CredentialWithConfig => {
  const masked = { ...credential };

  // Create a deep copy of config
  masked.config = { ...credential.config };

  switch (credential.type) {
    case "api_key":
      masked.config.apiKey = maskValue(credential.config.apiKey);
      break;

    case "username_password":
      masked.config.password = maskValue(credential.config.password);
      break;

    case "oauth2":
      masked.config.clientSecret = maskValue(credential.config.clientSecret);
      masked.config.accessToken = credential.config.accessToken
        ? maskValue(credential.config.accessToken)
        : undefined;
      masked.config.refreshToken = credential.config.refreshToken
        ? maskValue(credential.config.refreshToken)
        : undefined;
      break;

    case "certificate":
      masked.config.certificate = maskValue(credential.config.certificate, 15);
      masked.config.privateKey = credential.config.privateKey
        ? maskValue(credential.config.privateKey, 15)
        : undefined;
      masked.config.passphrase = credential.config.passphrase
        ? maskValue(credential.config.passphrase)
        : undefined;
      break;

    case "ssh_key":
      masked.config.privateKey = maskValue(credential.config.privateKey, 15);
      masked.config.passphrase = credential.config.passphrase
        ? maskValue(credential.config.passphrase)
        : undefined;
      break;

    case "aws_key":
      masked.config.accessKeyId = maskValue(credential.config.accessKeyId);
      masked.config.secretAccessKey = maskValue(
        credential.config.secretAccessKey
      );
      masked.config.sessionToken = credential.config.sessionToken
        ? maskValue(credential.config.sessionToken)
        : undefined;
      break;

    case "azure_key":
      masked.config.clientSecret = maskValue(credential.config.clientSecret);
      break;

    case "gcp_key":
      masked.config.privateKey = maskValue(credential.config.privateKey, 15);
      break;

    case "custom":
      // For custom credentials, mask any property that might contain sensitive data
      Object.keys(credential.config).forEach((key) => {
        if (
          key.toLowerCase().includes("key") ||
          key.toLowerCase().includes("secret") ||
          key.toLowerCase().includes("password") ||
          key.toLowerCase().includes("token")
        ) {
          masked.config[key] = maskValue(credential.config[key]);
        }
      });
      break;
  }

  return masked;
};

/**
 * Get a display-friendly credential type
 */
export const getCredentialTypeLabel = (type: CredentialType): string => {
  switch (type) {
    case "api_key":
      return "API Key";
    case "username_password":
      return "Username/Password";
    case "oauth2":
      return "OAuth 2.0";
    case "certificate":
      return "Certificate";
    case "ssh_key":
      return "SSH Key";
    case "aws_key":
      return "AWS Credentials";
    case "azure_key":
      return "Azure Credentials";
    case "gcp_key":
      return "Google Cloud Credentials";
    case "custom":
      return "Custom Credentials";
    default:
      return "Unknown";
  }
};

/**
 * Helper to mask a string value
 */
function maskValue(value: string, showChars = 4): string {
  if (!value) return "";
  if (value.length <= showChars) return "*".repeat(value.length);

  return (
    value.substring(0, showChars) +
    "*".repeat(Math.min(20, value.length - showChars))
  );
}
