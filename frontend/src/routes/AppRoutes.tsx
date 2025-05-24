import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Layout component
import MainLayout from "../components/layout/MainLayout";

// Route components
import AuthRoutes from "../components/auth/AuthRoutes";
import DashboardRoutes from "./DashboardRoutes";

// Auth hook
import { useAuth } from "@auth/hooks";

/**
 * AppRoutes Component
 *
 * Main routing configuration for the entire application
 * Handles public routes, protected routes, and layout integration
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth routes (login, register, forgot password, etc.) */}
      <Route path="/auth/*" element={<AuthRoutes />} />

      {/* Protected application routes with main layout */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <MainLayout>
              <Routes>
                {/* Dashboard routes */}
                <Route path="/dashboard/*" element={<DashboardRoutes />} />

                {/* Redirect to dashboard if accessing root */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />

                {/* 404 catch-all */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </MainLayout>
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
