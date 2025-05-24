// Type definitions for authentication
import { MFAMethodType } from "../../../services/auth/mfaService";

// User interface defining the structure of user data
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  mfaEnabled?: boolean;
  preferredMfaMethod?: MFAMethodType;
  lastLogin?: string;
  profileImageUrl?: string;
  preferences?: UserPreferences;
}

// User preferences interface for dashboard layout and app settings
export interface UserPreferences {
  dashboardLayout?: DashboardLayout;
  theme?: "light" | "dark";
  notifications?: NotificationPreferences;
  language?: string;
}

// Dashboard layout preferences
export interface DashboardLayout {
  widgets: WidgetPosition[];
  lastModified: string;
}

// Widget position in the dashboard
export interface WidgetPosition {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  visible: boolean;
}

// Notification preferences
export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  push: boolean;
  digest: "daily" | "weekly" | "none";
}

// Authentication state in Redux - defined later in file with more properties

// Authentication context properties
export interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  mfaRequired: boolean;
  mfaVerificationId: string | null;
  tempUserId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  clearError: () => void;
  completeMfaVerification: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => void;
  cancelMfaVerification: () => void;
}

// MFA verification data
export interface MFAVerificationData {
  code: string;
  method: MFAMethodType;
  verificationId: string;
  userId: string;
}

// Login credentials type
export interface LoginCredentials {
  email: string;
  password: string;
}

// Token response from successful login
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Response when MFA is required
export interface MFARequiredResponse {
  require2FA: true;
  userId: string;
  verificationId: string;
}

// Two-factor verification data
export interface TwoFactorVerifyData {
  code: string;
  method: MFAMethodType;
  verificationId: string;
  userId: string;
}

// Auth state for Redux
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  require2FA: boolean;
  userId: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  initialized: boolean;
  verificationId: string | null;
}

// Enum for auth action types
export enum AuthActionTypes {
  LOGIN_REQUEST = "auth/loginRequest",
  LOGIN_SUCCESS = "auth/loginSuccess",
  LOGIN_FAILURE = "auth/loginFailure",
  LOGOUT = "auth/logout",
  REGISTER_REQUEST = "auth/registerRequest",
  REGISTER_SUCCESS = "auth/registerSuccess",
  REGISTER_FAILURE = "auth/registerFailure",
  REFRESH_TOKEN_REQUEST = "auth/refreshTokenRequest",
  REFRESH_TOKEN_SUCCESS = "auth/refreshTokenSuccess",
  REFRESH_TOKEN_FAILURE = "auth/refreshTokenFailure",
  MFA_REQUIRED = "auth/mfaRequired",
  MFA_VERIFICATION_COMPLETE = "auth/mfaVerificationComplete",
  CLEAR_ERROR = "auth/clearError",
}

// MFA verification data
export interface MFAVerificationData {
  verificationId: string;
  userId: string;
  method: MFAMethodType;
}
