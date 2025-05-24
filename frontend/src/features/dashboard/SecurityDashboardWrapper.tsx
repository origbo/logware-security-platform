/**
 * SecurityDashboardWrapper Component
 * 
 * This wrapper adapts the SOAR DashboardController to match the props
 * expected by the SecurityDashboardPage, acting as a compatibility layer.
 */
import React from "react";
import DashboardController from "../soar/components/dashboard/DashboardController";

// Define props interface to match what SecurityDashboardPage expects to pass
export interface SecurityDashboardWrapperProps {
  defaultLayout: any;
  availableWidgets: any[];
  dashboardId: string;
  isDraggable: boolean;
  isResizable: boolean;
  allowAddingWidgets: boolean;
}

const SecurityDashboardWrapper: React.FC<SecurityDashboardWrapperProps> = (props) => {
  // The security dashboard uses a fixed user ID associated with the security role
  // In a real implementation, this would come from an authentication context
  const securityUserId = "security-dashboard-user";
  
  // We pass only the userId to the actual DashboardController since that's all it expects
  return <DashboardController userId={securityUserId} />;
};

export default SecurityDashboardWrapper;
