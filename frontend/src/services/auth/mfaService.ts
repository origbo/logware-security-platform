import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TOKEN_KEY } from "../../config/constants";

// Define the base API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// MFA Method Types
export enum MFAMethodType {
  APP = "app",
  SMS = "sms",
  EMAIL = "email",
  RECOVERY = "recovery",
}

// MFA Method Status
export enum MFAMethodStatus {
  ACTIVE = "active",
  PENDING = "pending",
  DISABLED = "disabled",
}

// MFA Method interface
export interface MFAMethod {
  id: string;
  userId: string;
  type: MFAMethodType;
  status: MFAMethodStatus;
  identifier?: string; // Phone number or email (partially masked)
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

// MFA Setup response
export interface MFASetupResponse {
  secret?: string;
  qrCode?: string;
  recoveryBackupCodes?: string[];
  verificationRequired: boolean;
  verificationId: string;
}

// MFA verification data
export interface MFAVerificationData {
  code: string;
  method: MFAMethodType;
  verificationId: string;
  userId: string;
}

// MFA Verification request
export interface MFAVerificationRequest {
  method: MFAMethodType;
  code: string;
  verificationId: string;
  userId: string;
}

// MFA Setup request
export interface MFASetupRequest {
  method: MFAMethodType;
  phoneNumber?: string;
  email?: string;
}

// Define the MFA API
export const mfaApi = createApi({
  reducerPath: "mfaApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/auth/mfa/`,
    prepareHeaders: (headers) => {
      // Get token from localStorage
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["MFAMethods"],
  endpoints: (builder) => ({
    // Get available MFA methods for the current user
    getMFAMethods: builder.query<MFAMethod[], void>({
      query: () => "methods",
      providesTags: ["MFAMethods"],
    }),

    // Set up a new MFA method
    setupMFAMethod: builder.mutation<MFASetupResponse, MFASetupRequest>({
      query: (body) => ({
        url: "setup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MFAMethods"],
    }),

    // Verify a code during setup
    verifyMFASetup: builder.mutation<
      { success: boolean },
      MFAVerificationRequest
    >({
      query: (body) => ({
        url: "verify-setup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MFAMethods"],
    }),

    // Disable an MFA method
    disableMFAMethod: builder.mutation<{ success: boolean }, string>({
      query: (methodId) => ({
        url: `methods/${methodId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MFAMethods"],
    }),

    // Generate new recovery codes
    generateRecoveryCodes: builder.mutation<{ codes: string[] }, void>({
      query: () => ({
        url: "recovery-codes",
        method: "POST",
      }),
    }),

    // Verify a token during authentication
    verifyMFALogin: builder.mutation<
      { accessToken: string; refreshToken: string; user: any },
      {
        code: string;
        method: MFAMethodType;
        verificationId: string;
        userId: string;
      }
    >({
      query: (body) => ({
        url: "verify",
        method: "POST",
        body,
      }),
    }),

    // Send a verification code via SMS or Email
    sendVerificationCode: builder.mutation<
      { success: boolean; verificationId: string },
      { method: MFAMethodType.SMS | MFAMethodType.EMAIL }
    >({
      query: (body) => ({
        url: "send-code",
        method: "POST",
        body,
      }),
    }),
  }),
});

// Export hooks for using the API
export const {
  useGetMFAMethodsQuery,
  useSetupMFAMethodMutation,
  useVerifyMFASetupMutation,
  useDisableMFAMethodMutation,
  useGenerateRecoveryCodesMutation,
  useVerifyMFALoginMutation,
  useSendVerificationCodeMutation,
} = mfaApi;
