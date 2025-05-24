import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../../features/auth/components";
import useAuth from "../../features/auth/hooks/useAuth";

/**
 * Login Page Component
 * Contains the login form and handles redirects based on auth state
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, require2FA } = useAuth();

  // Redirect authenticated users to dashboard
  // Redirect users requiring 2FA to the verification page
  useEffect(() => {
    if (isAuthenticated && !require2FA) {
      navigate("/dashboard");
    } else if (require2FA) {
      navigate("/auth/two-factor");
    }
  }, [isAuthenticated, require2FA, navigate]);

  return <LoginForm />;
};

export default LoginPage;
