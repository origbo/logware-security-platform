/**
 * SOAR Module (Security Orchestration, Automation, and Response)
 *
 * This file exports all components, services, and types from the SOAR module
 * to make them easy to import from other parts of the application.
 */

// Main container component (entry point)
export { default as SOARDashboardContainer } from "./containers/SOARDashboardContainer";

// Components
export { default as SOARDashboard } from "./components/SOARDashboard";
export { default as AutomationRulesManager } from "./components/automation/AutomationRulesManager";
export { default as PlaybookOrchestrator } from "./components/automation/PlaybookOrchestrator";
export { default as ResponseActionsLibrary } from "./components/automation/ResponseActionsLibrary";
export { default as AutomationExecutionDashboard } from "./components/automation/AutomationExecutionDashboard";
export { default as ThreatHuntingDashboard } from "./components/hunting/ThreatHuntingDashboard";
export { default as CollaborativeResponseHub } from "./components/collaboration/CollaborativeResponseHub";
export { default as UserBehaviorAnalytics } from "./components/anomaly/UserBehaviorAnalytics";
export { default as NetworkTrafficAnalysis } from "./components/anomaly/NetworkTrafficAnalysis";
export { default as ExplainableAI } from "./components/anomaly/ExplainableAI";

// Services
export { soarApi } from "./services/soarService";
export { anomalyApi } from "./services/anomalyService";

// Slices
export {
  default as soarReducer,
  // Actions
  setActiveSoarTab,
  setActiveAutomationTab,
  setActiveAnomalyTab,
  setActiveCollaborationTab,
  setIncidentFilters,
  resetIncidentFilters,
  setHuntFilters,
  resetHuntFilters,
  setExecutionFilters,
  resetExecutionFilters,
  setActiveCollaborationSession,
  setActiveIncidentId,
  // Selectors
  selectActiveSoarTab,
  selectActiveAutomationTab,
  selectActiveAnomalyTab,
  selectActiveCollaborationTab,
  selectIncidentFilters,
  selectHuntFilters,
  selectExecutionFilters,
} from "./slices/soarSlice";
