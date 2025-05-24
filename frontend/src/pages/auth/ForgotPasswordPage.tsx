import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ForgotPassword } from "../../features/auth/components";
import useAuth from "../../features/auth/hooks/useAuth";

/**
 * Forgot Password Page Component
 * Contains the forgot password form and handles redirects based on auth state
 */
const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return <ForgotPassword />;
};

export default ForgotPasswordPage;
