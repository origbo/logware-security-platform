import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../../features/auth/components";
import useAuth from "../../features/auth/hooks/useAuth";

/**
 * Register Page Component
 * Contains the registration form and handles redirects based on auth state
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return <RegisterForm />;
};

export default RegisterPage;
