// @ts-ignore - Bypassing type errors due to react-router-dom version mismatch (v6.6.0 vs @types/react-router-dom v5.3)
import { RouteObject } from "react-router-dom";
import { AuthLayout } from "../features/auth/components";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  TwoFactorPage,
} from "../pages/auth";

/**
 * Authentication routes configuration
 * Defines all authentication-related routes under the /auth path
 * All routes use the AuthLayout for consistent styling
 */
const authRoutes: RouteObject = {
  path: "auth",
  element: <AuthLayout />,
  children: [
    {
      path: "login",
      element: <LoginPage />,
    },
    {
      path: "register",
      element: <RegisterPage />,
    },
    {
      path: "forgot-password",
      element: <ForgotPasswordPage />,
    },
    {
      path: "reset-password/:token",
      element: <ResetPasswordPage />,
    },
    {
      path: "two-factor",
      element: <TwoFactorPage />,
    },
    {
      // Redirect to login page by default
      path: "",
      element: <LoginPage />,
    },
  ],
};

export default authRoutes;
