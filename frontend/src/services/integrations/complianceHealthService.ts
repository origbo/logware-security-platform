import {
  ComplianceFramework,
  ComplianceControl,
} from "../../pages/compliance/CompliancePage";

/**
 * Service for integrating compliance data with the Health Monitoring Module
 */
export interface HealthMetric {
  id: string;
  timestamp: Date;
  category: "compliance" | "security" | "performance" | "availability";
  name: string;
  value: number;
  unit: string;
  status: "critical" | "warning" | "normal" | "info";
  source: string;
  metadata: Record<string, any>;
}

export interface HealthAlert {
  id: string;
  timestamp: Date;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  source: string;
  category: string;
  affectedItems: string[];
  status: "active" | "acknowledged" | "resolved";
  metadata: Record<string, any>;
}

/**
 * Generate health metrics from compliance data
 */
export const generateComplianceHealthMetrics = (
  frameworks: ComplianceFramework[]
): HealthMetric[] => {
  const metrics: HealthMetric[] = [];
  const now = new Date();

  // Overall compliance score metric
  const overallScore = Math.round(
    frameworks.reduce((sum, f) => sum + f.overallScore, 0) / frameworks.length
  );
  metrics.push({
    id: `compliance-overall-score-${now.getTime()}`,
    timestamp: now,
    category: "compliance",
    name: "Overall Compliance Score",
    value: overallScore,
    unit: "%",
    status:
      overallScore < 50
        ? "critical"
        : overallScore < 70
        ? "warning"
        : overallScore < 90
        ? "normal"
        : "info",
    source: "compliance-module",
    metadata: {
      frameworkCount: frameworks.length,
      highestFramework: frameworks.reduce(
        (highest, f) =>
          f.overallScore > highest.score
            ? { name: f.name, score: f.overallScore }
            : highest,
        { name: "", score: 0 }
      ),
      lowestFramework: frameworks.reduce(
        (lowest, f) =>
          f.overallScore < lowest.score || lowest.score === 0
            ? { name: f.name, score: f.overallScore }
            : lowest,
        { name: "", score: 0 }
      ),
    },
  });

  // Framework-specific metrics
  frameworks.forEach((framework) => {
    // Framework compliance score
    metrics.push({
      id: `compliance-framework-score-${framework.id}-${now.getTime()}`,
      timestamp: now,
      category: "compliance",
      name: `${framework.name} Compliance Score`,
      value: framework.overallScore,
      unit: "%",
      status:
        framework.overallScore < 50
          ? "critical"
          : framework.overallScore < 70
          ? "warning"
          : framework.overallScore < 90
          ? "normal"
          : "info",
      source: "compliance-module",
      metadata: {
        frameworkId: framework.id,
        frameworkVersion: framework.version,
        totalControls: framework.controls.length,
        compliantControls: framework.controls.filter(
          (c) => c.status === "compliant"
        ).length,
        nonCompliantControls: framework.controls.filter(
          (c) => c.status === "non-compliant"
        ).length,
      },
    });

    // Critical controls health
    const criticalControls = framework.controls.filter(
      (c) => c.priority === "critical"
    );
    const criticalControlsCompliance =
      criticalControls.length > 0
        ? (criticalControls.filter((c) => c.status === "compliant").length /
            criticalControls.length) *
          100
        : 100;

    metrics.push({
      id: `compliance-critical-controls-${framework.id}-${now.getTime()}`,
      timestamp: now,
      category: "compliance",
      name: `${framework.name} Critical Controls Compliance`,
      value: Math.round(criticalControlsCompliance),
      unit: "%",
      status:
        criticalControlsCompliance < 50
          ? "critical"
          : criticalControlsCompliance < 80
          ? "warning"
          : criticalControlsCompliance < 95
          ? "normal"
          : "info",
      source: "compliance-module",
      metadata: {
        frameworkId: framework.id,
        frameworkName: framework.name,
        totalCriticalControls: criticalControls.length,
        compliantCriticalControls: criticalControls.filter(
          (c) => c.status === "compliant"
        ).length,
        nonCompliantCriticalControls: criticalControls.filter(
          (c) => c.status === "non-compliant"
        ).length,
      },
    });

    // Remediation progress metric
    const controlsNeedingRemediation = framework.controls.filter(
      (c) => c.status !== "compliant"
    );
    const controlsWithRemediationPlan = controlsNeedingRemediation.filter(
      (c) => c.remediationPlan && c.remediationPlan.trim() !== ""
    );
    const remediationCoverage =
      controlsNeedingRemediation.length > 0
        ? (controlsWithRemediationPlan.length /
            controlsNeedingRemediation.length) *
          100
        : 100;

    metrics.push({
      id: `compliance-remediation-coverage-${framework.id}-${now.getTime()}`,
      timestamp: now,
      category: "compliance",
      name: `${framework.name} Remediation Plan Coverage`,
      value: Math.round(remediationCoverage),
      unit: "%",
      status:
        remediationCoverage < 50
          ? "critical"
          : remediationCoverage < 70
          ? "warning"
          : remediationCoverage < 90
          ? "normal"
          : "info",
      source: "compliance-module",
      metadata: {
        frameworkId: framework.id,
        frameworkName: framework.name,
        controlsNeedingRemediation: controlsNeedingRemediation.length,
        controlsWithRemediationPlan: controlsWithRemediationPlan.length,
      },
    });
  });

  return metrics;
};

/**
 * Generate health alerts from compliance data
 */
export const generateComplianceHealthAlerts = (
  frameworks: ComplianceFramework[]
): HealthAlert[] => {
  const alerts: HealthAlert[] = [];
  const now = new Date();

  // Check for critical compliance issues across all frameworks
  frameworks.forEach((framework) => {
    // Alert for low overall scores
    if (framework.overallScore < 50) {
      alerts.push({
        id: `compliance-alert-critical-score-${framework.id}-${now.getTime()}`,
        timestamp: now,
        severity: "critical",
        title: `Critical compliance score for ${framework.name}`,
        description: `The overall compliance score for ${framework.name} is ${framework.overallScore}%, which is below the critical threshold of 50%.`,
        source: "compliance-module",
        category: "compliance",
        affectedItems: [framework.id],
        status: "active",
        metadata: {
          frameworkId: framework.id,
          frameworkName: framework.name,
          score: framework.overallScore,
          threshold: 50,
        },
      });
    } else if (framework.overallScore < 70) {
      alerts.push({
        id: `compliance-alert-warning-score-${framework.id}-${now.getTime()}`,
        timestamp: now,
        severity: "high",
        title: `Low compliance score for ${framework.name}`,
        description: `The overall compliance score for ${framework.name} is ${framework.overallScore}%, which is below the acceptable threshold of 70%.`,
        source: "compliance-module",
        category: "compliance",
        affectedItems: [framework.id],
        status: "active",
        metadata: {
          frameworkId: framework.id,
          frameworkName: framework.name,
          score: framework.overallScore,
          threshold: 70,
        },
      });
    }

    // Check for critical non-compliant controls
    const criticalNonCompliantControls = framework.controls.filter(
      (c) => c.priority === "critical" && c.status === "non-compliant"
    );

    if (criticalNonCompliantControls.length > 0) {
      alerts.push({
        id: `compliance-alert-critical-controls-${
          framework.id
        }-${now.getTime()}`,
        timestamp: now,
        severity: "critical",
        title: `${criticalNonCompliantControls.length} critical control${
          criticalNonCompliantControls.length > 1 ? "s" : ""
        } non-compliant in ${framework.name}`,
        description: `${criticalNonCompliantControls.length} critical control${
          criticalNonCompliantControls.length > 1 ? "s are" : " is"
        } non-compliant in the ${
          framework.name
        } framework, requiring immediate attention.`,
        source: "compliance-module",
        category: "compliance",
        affectedItems: criticalNonCompliantControls.map((c) => c.id),
        status: "active",
        metadata: {
          frameworkId: framework.id,
          frameworkName: framework.name,
          controls: criticalNonCompliantControls.map((c) => ({
            id: c.id,
            controlId: c.controlId,
            title: c.title,
            category: c.category,
          })),
        },
      });
    }

    // Check for approaching due dates
    const now = new Date();
    const controlsWithApproachingDueDates = framework.controls.filter(
      (c) =>
        c.status !== "compliant" &&
        c.dueDate &&
        (c.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 7
    );

    if (controlsWithApproachingDueDates.length > 0) {
      alerts.push({
        id: `compliance-alert-due-dates-${framework.id}-${now.getTime()}`,
        timestamp: now,
        severity: "high",
        title: `${controlsWithApproachingDueDates.length} control${
          controlsWithApproachingDueDates.length > 1 ? "s" : ""
        } with approaching due date in ${framework.name}`,
        description: `${controlsWithApproachingDueDates.length} control${
          controlsWithApproachingDueDates.length > 1 ? "s have" : " has"
        } a remediation due date within the next 7 days for the ${
          framework.name
        } framework.`,
        source: "compliance-module",
        category: "compliance",
        affectedItems: controlsWithApproachingDueDates.map((c) => c.id),
        status: "active",
        metadata: {
          frameworkId: framework.id,
          frameworkName: framework.name,
          controls: controlsWithApproachingDueDates.map((c) => ({
            id: c.id,
            controlId: c.controlId,
            title: c.title,
            dueDate: c.dueDate?.toISOString(),
            owner: c.owner,
          })),
        },
      });
    }
  });

  return alerts;
};

/**
 * Send compliance health metrics to the Health Monitoring System
 */
export const sendComplianceHealthMetrics = async (
  metrics: HealthMetric[]
): Promise<boolean> => {
  // In a real implementation, this would call an API endpoint
  console.log(
    "Sending compliance health metrics to Health Monitoring System:",
    metrics
  );

  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error("Failed to send compliance health metrics:", error);
    return false;
  }
};

/**
 * Send compliance health alerts to the Health Monitoring System
 */
export const sendComplianceHealthAlerts = async (
  alerts: HealthAlert[]
): Promise<boolean> => {
  // In a real implementation, this would call an API endpoint
  console.log(
    "Sending compliance health alerts to Health Monitoring System:",
    alerts
  );

  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error("Failed to send compliance health alerts:", error);
    return false;
  }
};

/**
 * Register compliance health checks with the Health Monitoring System
 */
export const registerComplianceHealthChecks = async (): Promise<boolean> => {
  // In a real implementation, this would call an API endpoint to register
  // the compliance module's health checks with the monitoring system
  console.log(
    "Registering compliance health checks with Health Monitoring System"
  );

  const healthChecks = [
    {
      id: "compliance-overall-score",
      name: "Overall Compliance Score",
      description:
        "Monitors the overall compliance score across all frameworks",
      interval: 3600, // Check every hour
      thresholds: {
        critical: 50,
        warning: 70,
        normal: 90,
      },
    },
    {
      id: "compliance-critical-controls",
      name: "Critical Controls Compliance",
      description: "Monitors the compliance status of critical controls",
      interval: 3600, // Check every hour
      thresholds: {
        critical: 50,
        warning: 80,
        normal: 95,
      },
    },
    {
      id: "compliance-remediation-coverage",
      name: "Remediation Plan Coverage",
      description:
        "Monitors the percentage of non-compliant controls with remediation plans",
      interval: 86400, // Check once a day
      thresholds: {
        critical: 50,
        warning: 70,
        normal: 90,
      },
    },
  ];

  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  } catch (error) {
    console.error("Failed to register compliance health checks:", error);
    return false;
  }
};
