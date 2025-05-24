/**
 * Type declarations for the Authentication Context in Logware Security Platform
 */

// Declare the auth context module
declare module '../../context/auth/AuthContext' {
  import * as React from 'react';
  
  export interface User {
    id: string;
    username?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    permissions: string[];
    createdAt?: string;
    updatedAt?: string;
    mfaEnabled?: boolean;
    preferences?: Record<string, any>;
  }

  export interface LoginCredentials {
    username: string;
    password: string;
    rememberMe?: boolean;
  }

  export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }

  export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    token: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    verifyMfa: (
      username: string,
      mfaCode: string,
      mfaToken: string
    ) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    changePassword: (
      currentPassword: string,
      newPassword: string
    ) => Promise<void>;
    setupMfa: (
      mfaType: "app" | "sms" | "email"
    ) => Promise<{ secret?: string; qrCodeUrl?: string }>;
    clearError: () => void;
    hasRole: (role: string | string[]) => boolean;
    hasPermission: (permission: string | string[]) => boolean;
    refreshUserData: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
  }
  
  export interface AuthProviderProps {
    children: React.ReactNode;
  }
  
  export const AuthContext: React.Context<AuthContextType>;
  export const AuthProvider: React.FC<AuthProviderProps>;
  
  export default AuthContext;
}

// Declare the auth context index module
declare module '../../context/auth' {
  export { default as AuthContext, AuthProvider } from '../../context/auth/AuthContext';
}

// Declare the auth hook module
declare module '../../hooks/auth/useAuth' {
  import { AuthContextType } from '../../context/auth/AuthContext';
  
  export default function useAuth(): AuthContextType;
}

// Declare the auth service
declare module '../../services/auth/authService' {
  import { User, LoginCredentials, AuthTokens } from '../../context/auth/AuthContext';
  
  export function login(credentials: LoginCredentials): Promise<{
    user: User;
    token: AuthTokens;
    requiresMfa: boolean;
    mfaToken?: string;
  }>;
  
  export function logout(): Promise<void>;
  
  export function verifyMfa(
    username: string,
    mfaCode: string,
    mfaToken: string
  ): Promise<{
    user: User;
    token: AuthTokens;
  }>;
  
  export function isAuthenticated(): boolean;
  
  export function getUserData(): User | null;
  
  export function refreshTokens(): Promise<AuthTokens>;
  
  export function changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void>;
  
  export function resetPassword(
    token: string,
    newPassword: string
  ): Promise<void>;
  
  export function requestPasswordReset(email: string): Promise<void>;
  
  export function setupMfa(
    mfaType: "app" | "sms" | "email"
  ): Promise<{ secret?: string; qrCodeUrl?: string }>;
  
  export function clearAuthData(): void;
  
  export { User, LoginCredentials, AuthTokens };
  
  const authService: {
    login: typeof login;
    logout: typeof logout;
    verifyMfa: typeof verifyMfa;
    isAuthenticated: typeof isAuthenticated;
    getUserData: typeof getUserData;
    refreshTokens: typeof refreshTokens;
    changePassword: typeof changePassword;
    resetPassword: typeof resetPassword;
    requestPasswordReset: typeof requestPasswordReset;
    setupMfa: typeof setupMfa;
    clearAuthData: typeof clearAuthData;
  };
  
  export default authService;
}

// Declare the auth redux adapter
declare module '../../services/auth/authReduxAdapter' {
  import { User, LoginCredentials } from '../../context/auth/AuthContext';
  import { AppDispatch } from '../../store/store';
  
  export function loginAndUpdateRedux(
    credentials: LoginCredentials,
    dispatch: AppDispatch
  ): Promise<{
    user: User;
    requiresMfa: boolean;
    mfaToken?: string;
  }>;
  
  export function verifyMfaAndUpdateRedux(
    username: string,
    mfaCode: string,
    mfaToken: string,
    dispatch: AppDispatch
  ): Promise<{
    user: User;
  }>;
  
  export function logoutAndUpdateRedux(dispatch: AppDispatch): Promise<void>;
  
  export function clearReduxError(dispatch: AppDispatch): void;
  
  export function updateReduxUserPreferences(
    dispatch: AppDispatch,
    preferences: Record<string, any>
  ): void;
}
