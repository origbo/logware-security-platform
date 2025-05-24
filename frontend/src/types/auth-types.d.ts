/**
 * Type declarations for authentication-related components and hooks
 */

// Auth context and hook types
interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  mfaEnabled?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
  token?: string;
  refreshToken?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface MfaSetupData {
  phoneNumber?: string;
  email?: string;
  type: 'sms' | 'email' | 'app';
}

interface AuthContextType {
  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<AuthUser> & { password: string; confirmPassword: string }) => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
  
  // Password management
  changePassword: (data: PasswordChangeData) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<void>;
  
  // MFA
  setupMfa: (data: MfaSetupData) => Promise<{ secret?: string; qrCode?: string }>;
  verifyMfa: (token: string, code: string) => Promise<void>;
  disableMfa: () => Promise<void>;
  
  // Role-based access control
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

interface ProtectedRouteProps {
  element: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string | string[];
  redirectPath?: string;
}

interface AdminRouteProps {
  element: React.ReactNode;
  redirectPath?: string;
}

declare module 'hooks/auth/useAuth' {
  const useAuth: () => AuthContextType;
  export default useAuth;
}

// Extend the React namespace to include components using auth types
declare namespace React {
  interface FunctionComponent<P = {}> {
    (props: P & { children?: React.ReactNode }): React.ReactElement<any, any> | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }
}

// Specific component prop types
interface SecuritySettingsProps {
  className?: string;
}

interface UserProfileProps {
  className?: string;
}

interface TwoFactorVerificationProps {
  onVerify?: (verified: boolean) => void;
  token?: string;
}

interface ResetPasswordProps {
  token?: string;
}
