/**
 * Type declarations for the useAuth hook
 */

declare module '*/hooks/useAuth' {
  export interface User {
    id: string;
    email: string;
    name: string;
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
    email: string;
    password: string;
    rememberMe?: boolean;
  }

  export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    token: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    verifyMfa: (code: string, method?: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    setupMfa: (enable: boolean, method?: "app" | "sms" | "email") => Promise<{ secret?: string; qrCodeUrl?: string }>;
    clearError: () => void;
    hasRole: (role: string | string[]) => boolean;
    hasPermission: (permission: string | string[]) => boolean;
    refreshUserData: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
  }

  export function useAuth(): AuthContextType;
  export default useAuth;
}

// Also make it available when imported from the auth context
declare module '*/context/auth/AuthContext' {
  import { AuthContextType, User, LoginCredentials } from '*/hooks/useAuth';
  export { AuthContextType, User, LoginCredentials };
  export function useAuth(): AuthContextType;
  export const AuthContext: React.Context<AuthContextType>;
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
}
