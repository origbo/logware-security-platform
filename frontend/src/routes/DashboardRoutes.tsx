import React from "react";
// @ts-ignore - Bypassing type errors due to react-router-dom version mismatch (v6.6.0 vs @types/react-router-dom v5.3)
import { Route, Routes } from "react-router-dom";

import DashboardPage from "../pages/DashboardPage";
import DashboardSettingsPage from "../pages/DashboardSettingsPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";

/**
 * DashboardRoutes Component
 *
 * Defines all the routes related to dashboard functionality
 * with proper authentication protection
 */
const DashboardRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/:dashboardId"
        element={
          <ProtectedRoute>
            <DashboardSettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default DashboardRoutes;
