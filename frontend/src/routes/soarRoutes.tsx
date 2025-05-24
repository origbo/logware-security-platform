import React from "react";
// @ts-ignore - Bypassing type errors due to react-router-dom version mismatch (v6.6.0 vs @types/react-router-dom v5.3)
import { Navigate, RouteObject } from "react-router-dom";
import { SOARDashboardContainer } from "../features/soar";
import { ProtectedRoute } from "../features/auth/components";

/**
 * Route configuration for the SOAR (Security Orchestration, Automation and Response) module
 */
const soarRoutes: RouteObject[] = [
  {
    path: "soar",
    element: <SOARDashboardContainer />,
    children: [
      {
        path: "",
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <SOARDashboardContainer />,
      },
    ],
  },
];

export default soarRoutes;
