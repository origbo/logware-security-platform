import axios from "axios";
import {
  API_BASE_URL,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from "../../config/constants";
import { MFAMethodType } from "../auth/mfaService";

// Auth service types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface TwoFactorVerifyData {
  userId: string;
  verificationId: string;
  code: string;
  method: MFAMethodType;
}

export interface PasswordResetData {
  password: string;
  passwordConfirm: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}

export interface MFARequiredResponse {
  require2FA: true;
  userId: string;
  verificationId: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  message: string;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  fullName: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  preferences: {
    theme: "light" | "dark" | "system";
    dashboardLayout: Record<string, any>;
    notifications: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// Create axios instance for auth operations
const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  withCredentials: true, // Needed to send and receive cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach auth token
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth service methods
const AuthService = {
  // Login with email and password
  async login(
    credentials: LoginCredentials
  ): Promise<TokenResponse | MFARequiredResponse> {
    const response = await authAPI.post("/login", credentials);

    // If 2FA is required, return the special response
    if (response.data.require2FA) {
      return {
        require2FA: true,
        userId: response.data.userId,
        verificationId: response.data.verificationId,
      };
    }

    // Otherwise store tokens and return response
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  // Verify 2FA token
  async verify2FA(data: TwoFactorVerifyData): Promise<TokenResponse> {
    const response = await authAPI.post("/verify-2fa", data);
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  // Register new user
  async register(data: RegisterData): Promise<TokenResponse> {
    const response = await authAPI.post("/register", data);
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  // Get current user profile
  async getCurrentUser(): Promise<UserData> {
    const response = await authAPI.get("/me");
    return response.data.user || response.data.data.user;
  },

  // Refresh access token using refresh token
  async refreshToken(
    refreshTokenValue?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken =
      refreshTokenValue || localStorage.getItem(REFRESH_TOKEN_KEY);
    const response = await authAPI.post("/refresh-token", { refreshToken });
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    await authAPI.post("/logout", { refreshToken });
    this.clearTokens();
  },

  // Request password reset
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await authAPI.post("/forgot-password", { email });
    return response.data;
  },

  // Reset password with token
  async resetPassword(
    token: string,
    data: PasswordResetData
  ): Promise<TokenResponse> {
    const response = await authAPI.post(`/reset-password/${token}`, data);
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  // Update password when logged in
  async updatePassword(
    currentPassword: string,
    newPassword: string,
    newPasswordConfirm: string
  ): Promise<TokenResponse> {
    const response = await authAPI.patch("/update-password", {
      currentPassword,
      newPassword,
      newPasswordConfirm,
    });
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  // Setup 2FA (get QR code)
  async setup2FA(): Promise<TwoFactorSetupResponse> {
    const response = await authAPI.post("/setup-2fa");
    return response.data.data;
  },

  // Toggle 2FA (enable/disable in one method)
  async toggle2FA(enabled: boolean): Promise<{ message: string }> {
    if (enabled) {
      return this.setup2FA();
    } else {
      const response = await authAPI.post("/disable-2fa");
      return response.data;
    }
  },

  // Update user profile
  async updateProfile(data: ProfileData): Promise<UserData> {
    const response = await authAPI.patch("/profile", data);
    return response.data.data.user;
  },

  // Change password
  async changePassword(data: PasswordChangeData): Promise<{ message: string }> {
    const response = await authAPI.patch("/change-password", {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      newPasswordConfirm: data.confirmPassword,
    });
    return response.data;
  },

  // Validate token
  async validateToken(token: string): Promise<UserData> {
    const response = await authAPI.post("/validate-token", { token });
    return response.data.data.user;
  },

  // Set auth token for API calls
  setAuthToken(token: string): void {
    authAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  // Enable 2FA after setup
  async enable2FA(token: string): Promise<{ message: string }> {
    const response = await authAPI.post("/enable-2fa", { token });
    return response.data;
  },

  // Disable 2FA
  async disable2FA(token: string): Promise<{ message: string }> {
    const response = await authAPI.post("/disable-2fa", { token });
    return response.data;
  },

  // Helper methods to manage tokens
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.setAuthToken(accessToken);
  },

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    authAPI.defaults.headers.common["Authorization"] = "";
  },

  // Check if user is logged in based on token existence
  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default AuthService;
