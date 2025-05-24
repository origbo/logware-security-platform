import React from "react";
// @ts-ignore - Bypassing type errors due to react-router-dom version mismatch (v6.6.0 vs @types/react-router-dom v5.3)
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
  RouteObject,
} from "react-router-dom";
// @ts-ignore - Bypassing type errors for react-router-dom types
import type { IndexRouteProps, PathRouteProps } from "react-router-dom";

// Layouts
import AppLayout from "../layouts/AppLayout";

// Auth Components & Routes
import { ProtectedRoute } from "../features/auth/components";
import authRoutes from "./auth.routes";
import soarRoutes from "./soarRoutes";

// Pages
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import LandingPage from "../pages/LandingPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";

// Security Monitoring Pages (Phase 2)
import SecurityDashboardPage from "../pages/SecurityDashboardPage";
import VulnerabilityManagementPage from "../pages/VulnerabilityManagementPage";
import NetworkMonitoringPage from "../pages/NetworkMonitoringPage";

// Compliance Management Pages (Phase 3)
import ComplianceDashboardPage from "../pages/ComplianceDashboardPage";

// Cloud Security Monitoring Pages (Phase 3)
import CloudSecurityDashboardPage from "../pages/CloudSecurityDashboardPage";

/**
 * Main application router
 *
 * Configures all application routes, including:
 * - Authentication routes (/auth/*)
 * - Protected application routes that require authentication
 * - Role-based protected routes
 * - Fallback routes for unauthorized access and not found pages
 */
// Fix TypeScript errors with route definitions
const router = createBrowserRouter(
  createRoutesFromElements(
    // Use Fragment instead of plain Route to fix TypeScript errors
    <React.Fragment>
      {" "}
      {/* Root route */}
      {/* Auth routes */}
      {/* Use type assertion to fix TypeScript error with RouteObject vs RouteProps */}
      <Route
        path={authRoutes.path}
        element={authRoutes.element}
      >
        {authRoutes.children?.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />
      {/* Protected application routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* User Profile */}
          <Route path="profile" element={<ProfilePage />} />

          {/* Security Monitoring (Phase 2) */}
          <Route
            path="security-dashboard"
            element={<SecurityDashboardPage />}
          />
          <Route
            path="vulnerabilities"
            element={<VulnerabilityManagementPage />}
          />
          <Route path="network" element={<NetworkMonitoringPage />} />

          {/* Compliance Management (Phase 3) */}
          <Route path="compliance/*" element={<ComplianceDashboardPage />} />

          {/* Cloud Security Monitoring (Phase 3) */}
          <Route path="cloud-security">
            <Route index element={<CloudSecurityDashboardPage />} />
            <Route path=":provider" element={<CloudSecurityDashboardPage />} />
          </Route>

          {/* SOAR Module */}
          <Route
            path="soar/*"
            element={<Navigate to="/soar/dashboard" replace />}
          />

          {/* Admin routes - protected by role */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route
              path="admin/*"
              element={<div>Admin Panel (to be implemented)</div>}
            />
          </Route>

          {/* Settings routes - protected by role (admin or manager) */}
          <Route
            element={<ProtectedRoute requiredRole={["admin", "manager"]} />}
          >
            <Route
              path="settings/*"
              element={<div>Settings (to be implemented)</div>}
            />
          </Route>
        </Route>
      </Route>
      {/* Unauthorized Page */}
      <Route path="unauthorized" element={<UnauthorizedPage />} />
      {/* Not Found Page */}
      <Route path="*" element={<NotFoundPage />} />
    </React.Fragment>
  )
);

export default router;
