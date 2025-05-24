import * as React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import useAuth from "../../hooks/auth/useAuth";

interface ProtectedRouteProps {
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireAllRoles?: boolean;
  requireAllPermissions?: boolean;
}

/**
 * ProtectedRoute component that restricts access to authenticated users
 * with specific roles and/or permissions
 *
 * This component can be used in the following ways:
 *
 * 1. Basic protection (requires authentication only):
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 *
 * 2. Role-based protection:
 * <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
 *   <Route path="/admin" element={<AdminPanel />} />
 * </Route>
 *
 * 3. Permission-based protection:
 * <Route element={<ProtectedRoute requiredPermissions={['edit_users']} />}>
 *   <Route path="/users/edit" element={<UserEditor />} />
 * </Route>
 *
 * 4. Combined protection:
 * <Route
 *   element={
 *     <ProtectedRoute
 *       requiredRoles={['admin']}
 *       requiredPermissions={['manage_system']}
 *       requireAllRoles={true}
 *       requireAllPermissions={true}
 *     />
 *   }
 * >
 *   <Route path="/system/config" element={<SystemConfig />} />
 * </Route>
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRoles = [],
  requiredPermissions = [],
  requireAllRoles = false,
  requireAllPermissions = false,
}) => {
  // @ts-ignore - Auth context properties
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading indicator while authentication state is being determined
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (requiredRoles.length > 0) {
    // No user data or no roles
    if (!user || !user.roles || user.roles.length === 0) {
      return <Navigate to="/unauthorized" replace />;
    }

    // If we require all roles
    if (requireAllRoles) {
      const hasAllRoles = requiredRoles.every((role) =>
        user.roles.includes(role)
      );
      if (!hasAllRoles) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
    // If we require any of the roles
    else {
      const hasAnyRole = requiredRoles.some((role) =>
        user.roles.includes(role)
      );
      if (!hasAnyRole) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  // Check permission-based access if permissions are specified
  if (requiredPermissions.length > 0) {
    // No user data or no permissions
    if (!user || !user.permissions || user.permissions.length === 0) {
      return <Navigate to="/unauthorized" replace />;
    }

    // If we require all permissions
    if (requireAllPermissions) {
      const hasAllPermissions = requiredPermissions.every((permission) =>
        user.permissions.includes(permission)
      );
      if (!hasAllPermissions) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
    // If we require any of the permissions
    else {
      const hasAnyPermission = requiredPermissions.some((permission) =>
        user.permissions.includes(permission)
      );
      if (!hasAnyPermission) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  // If all checks pass, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
