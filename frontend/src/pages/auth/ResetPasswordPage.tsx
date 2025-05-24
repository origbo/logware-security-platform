import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ResetPassword } from "../../features/auth/components";
import useAuth from "../../features/auth/hooks/useAuth";

/**
 * Reset Password Page Component
 * Contains the reset password form and handles redirects based on auth state
 */
const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return <ResetPassword />;
};

export default ResetPasswordPage;
