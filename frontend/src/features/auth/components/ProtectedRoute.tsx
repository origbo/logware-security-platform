import React, { useEffect } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import useAuth from "../hooks/useAuth";

interface ProtectedRouteProps {
  requiredRole?: string | string[];
}

/**
 * Protected Route Component
 *
 * Restricts access to routes based on authentication status and user role
 * Redirects to login if user is not authenticated
 * Checks for required role if specified
 *
 * @param requiredRole - Optional role or roles that can access this route
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, user, loading, initialized } = useAuth();
  const location = useLocation();

  // Function to check if user has the required role
  const hasRequiredRole = (): boolean => {
    if (!requiredRole || !user) return true;

    // Check against an array of roles
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role || "user");
    }

    // Check against a single role
    return user.role === requiredRole;
  };

  // Loading state while checking authentication
  if (!initialized || loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Redirect to unauthorized page if user doesn't have the required role
  if (!hasRequiredRole()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and has required role, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
