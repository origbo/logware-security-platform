import {
  ComplianceFramework,
  ComplianceControl,
  AssessmentResult,
} from "../../pages/compliance/CompliancePage";

/**
 * Service for generating alerts based on compliance status changes
 */
export interface ComplianceAlert {
  id: string;
  timestamp: Date;
  type: "assessment" | "framework" | "control" | "audit";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  relatedItemId: string;
  relatedItemName: string;
}

/**
 * Generate alerts for frameworks that have crossed compliance thresholds
 */
export const generateComplianceAlerts = (
  frameworks: ComplianceFramework[],
  assessmentResults?: AssessmentResult
): ComplianceAlert[] => {
  const alerts: ComplianceAlert[] = [];

  // Check for critical compliance issues
  frameworks.forEach((framework) => {
    // Alert for low overall scores
    if (framework.overallScore < 70) {
      alerts.push({
        id: `compliance-alert-${framework.id}-score`,
        timestamp: new Date(),
        type: "framework",
        severity: framework.overallScore < 50 ? "critical" : "high",
        title: `Low compliance score for ${framework.name}`,
        description: `The overall compliance score for ${framework.name} is ${framework.overallScore}%, which is below the acceptable threshold.`,
        relatedItemId: framework.id,
        relatedItemName: framework.name,
      });
    }

    // Alert for critical controls that are non-compliant
    framework.controls
      .filter(
        (control) =>
          control.priority === "critical" && control.status === "non-compliant"
      )
      .forEach((control) => {
        alerts.push({
          id: `compliance-alert-${control.id}`,
          timestamp: new Date(),
          type: "control",
          severity: "critical",
          title: `Critical control non-compliant: ${control.controlId}`,
          description: `Critical control ${control.controlId}: ${control.title} is non-compliant and requires immediate attention.`,
          relatedItemId: control.id,
          relatedItemName: control.title,
        });
      });

    // Alert for approaching due dates
    const now = new Date();
    framework.controls
      .filter(
        (control) =>
          control.status !== "compliant" &&
          control.dueDate &&
          (control.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <
            7
      )
      .forEach((control) => {
        alerts.push({
          id: `compliance-alert-${control.id}-due`,
          timestamp: new Date(),
          type: "control",
          severity: "high",
          title: `Approaching due date for ${control.controlId}`,
          description: `Remediation for control ${control.controlId} is due soon.`,
          relatedItemId: control.id,
          relatedItemName: control.title,
        });
      });
  });

  // Create alert for recent assessment if provided
  if (assessmentResults) {
    const severity =
      assessmentResults.score < 50
        ? "critical"
        : assessmentResults.score < 70
        ? "high"
        : assessmentResults.score < 90
        ? "medium"
        : "low";

    alerts.push({
      id: `compliance-assessment-${
        assessmentResults.frameworkId
      }-${Date.now()}`,
      timestamp: assessmentResults.date,
      type: "assessment",
      severity,
      title: `New compliance assessment for ${assessmentResults.frameworkName}`,
      description: `A compliance assessment for ${assessmentResults.frameworkName} was completed with a score of ${assessmentResults.score}%. ${assessmentResults.completedControls} of ${assessmentResults.totalControls} controls were evaluated.`,
      relatedItemId: assessmentResults.frameworkId,
      relatedItemName: assessmentResults.frameworkName,
    });
  }

  return alerts;
};

/**
 * Send compliance alerts to the alert management system
 */
export const sendComplianceAlerts = async (
  alerts: ComplianceAlert[]
): Promise<boolean> => {
  // In a real implementation, this would call an API endpoint
  // For now, we'll just log to console
  console.log("Sending compliance alerts:", alerts);

  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error("Failed to send compliance alerts:", error);
    return false;
  }
};
