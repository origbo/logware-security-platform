import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Import SOAR components
import CaseManagement from "../components/CaseManagement";
import CaseDetailView from "../components/CaseDetailView";
import PlaybookList from "../components/PlaybookList";
import PlaybookEditor from "../components/PlaybookEditor";
import PlaybookDesignerV2 from "../components/PlaybookDesignerV2";
import SoarDashboard from "../components/Dashboard";
import ActionLibrary from "../components/ActionLibrary";

/**
 * SOAR module route configuration
 * Defines all available routes within the SOAR module
 */
const SoarRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Dashboard is the default landing page for SOAR */}
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<SoarDashboard />} />

      {/* Case Management Routes */}
      <Route path="cases" element={<CaseManagement />} />
      <Route path="cases/:caseId" element={<CaseDetailView />} />

      {/* Playbook Routes */}
      <Route path="playbooks" element={<PlaybookList />} />
      <Route path="playbooks/new" element={<PlaybookEditor />} />
      <Route path="playbooks/:playbookId" element={<PlaybookEditor />} />
      <Route
        path="playbooks/:playbookId/designer"
        element={<PlaybookDesignerV2 />}
      />

      {/* Action Library */}
      <Route path="actions" element={<ActionLibrary />} />
    </Routes>
  );
};

export default SoarRoutes;
