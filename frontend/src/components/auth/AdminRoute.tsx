import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/auth/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute component for protecting admin-only routes
 *
 * This component ensures only users with the 'admin' role
 * can access the wrapped routes.
 *
 * Example usage:
 * <Route path="/admin/users" element={
 *   <AdminRoute>
 *     <UserManagementPage />
 *   </AdminRoute>
 * } />
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // @ts-ignore - Auth context properties
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // If still loading auth state, don't render anything yet
  if (isLoading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  if (!hasRole("admin")) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and has admin role, render children
  return <>{children}</>;
};

export default AdminRoute;
