import { ComplianceFramework } from "../../pages/compliance/CompliancePage";
import {
  generateComplianceHealthMetrics,
  generateComplianceHealthAlerts,
  sendComplianceHealthMetrics,
  sendComplianceHealthAlerts,
  registerComplianceHealthChecks,
  HealthMetric,
  HealthAlert,
} from "../integrations/complianceHealthService";

/**
 * Service for scheduling and managing compliance health checks
 */

// Store for active schedules
interface ScheduledCheck {
  id: string;
  name: string;
  interval: number; // milliseconds
  lastRun: Date;
  nextRun: Date;
  active: boolean;
  handler: () => Promise<void>;
  timerId?: NodeJS.Timeout;
}

// Service singleton
class ComplianceHealthMonitoringService {
  private static instance: ComplianceHealthMonitoringService;
  private scheduledChecks: Map<string, ScheduledCheck> = new Map();
  private initialized = false;
  private historyMetrics: HealthMetric[] = [];
  private historyAlerts: HealthAlert[] = [];
  private callbackFn?: (metrics: HealthMetric[], alerts: HealthAlert[]) => void;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): ComplianceHealthMonitoringService {
    if (!ComplianceHealthMonitoringService.instance) {
      ComplianceHealthMonitoringService.instance =
        new ComplianceHealthMonitoringService();
    }
    return ComplianceHealthMonitoringService.instance;
  }

  /**
   * Initialize health monitoring service
   */
  public async initialize(
    frameworks: ComplianceFramework[],
    callback?: (metrics: HealthMetric[], alerts: HealthAlert[]) => void
  ): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      this.callbackFn = callback;

      // Register health checks with the monitoring system
      await registerComplianceHealthChecks();

      // Set up default scheduled checks
      this.setupDefaultSchedules(frameworks);

      // Run initial health check
      await this.runComplianceHealthCheck(frameworks);

      this.initialized = true;
      return true;
    } catch (error) {
      console.error(
        "Failed to initialize compliance health monitoring:",
        error
      );
      return false;
    }
  }

  /**
   * Set up default scheduled health checks
   */
  private setupDefaultSchedules(frameworks: ComplianceFramework[]): void {
    // Overall compliance score check - every hour
    this.scheduleCheck({
      id: "compliance-overall-check",
      name: "Overall Compliance Health Check",
      interval: 60 * 60 * 1000, // 1 hour
      handler: async () => {
        await this.runComplianceHealthCheck(frameworks);
      },
    });

    // Critical controls check - every 6 hours
    this.scheduleCheck({
      id: "compliance-critical-check",
      name: "Critical Controls Health Check",
      interval: 6 * 60 * 60 * 1000, // 6 hours
      handler: async () => {
        await this.runCriticalControlsCheck(frameworks);
      },
    });

    // Due dates check - once a day
    this.scheduleCheck({
      id: "compliance-due-dates-check",
      name: "Compliance Due Dates Check",
      interval: 24 * 60 * 60 * 1000, // 24 hours
      handler: async () => {
        await this.runDueDatesCheck(frameworks);
      },
    });
  }

  /**
   * Schedule a regular health check
   */
  public scheduleCheck(
    check: Omit<ScheduledCheck, "lastRun" | "nextRun" | "active" | "timerId">
  ): void {
    const now = new Date();
    const nextRun = new Date(now.getTime() + check.interval);

    const scheduledCheck: ScheduledCheck = {
      ...check,
      lastRun: new Date(0), // Jan 1, 1970
      nextRun,
      active: true,
    };

    // Set up timer
    scheduledCheck.timerId = setInterval(() => {
      this.executeScheduledCheck(scheduledCheck.id);
    }, check.interval);

    // Store in map
    this.scheduledChecks.set(check.id, scheduledCheck);
  }

  /**
   * Cancel a scheduled health check
   */
  public cancelScheduledCheck(id: string): boolean {
    const check = this.scheduledChecks.get(id);
    if (check && check.timerId) {
      clearInterval(check.timerId);
      check.active = false;
      this.scheduledChecks.set(id, check);
      return true;
    }
    return false;
  }

  /**
   * Execute a specific scheduled check
   */
  private async executeScheduledCheck(id: string): Promise<void> {
    const check = this.scheduledChecks.get(id);
    if (!check || !check.active) {
      return;
    }

    try {
      await check.handler();

      // Update check timing
      const now = new Date();
      check.lastRun = now;
      check.nextRun = new Date(now.getTime() + check.interval);
      this.scheduledChecks.set(id, check);
    } catch (error) {
      console.error(`Error executing scheduled check ${id}:`, error);
    }
  }

  /**
   * Run a full compliance health check
   */
  public async runComplianceHealthCheck(
    frameworks: ComplianceFramework[]
  ): Promise<void> {
    try {
      // Generate health metrics and alerts
      const metrics = generateComplianceHealthMetrics(frameworks);
      const alerts = generateComplianceHealthAlerts(frameworks);

      // Send to health monitoring system
      await Promise.all([
        sendComplianceHealthMetrics(metrics),
        sendComplianceHealthAlerts(alerts),
      ]);

      // Store in history
      this.historyMetrics = [...this.historyMetrics, ...metrics].slice(-100); // Keep last 100 metrics
      this.historyAlerts = [...this.historyAlerts, ...alerts].slice(-50); // Keep last 50 alerts

      // Call callback if registered
      if (this.callbackFn) {
        this.callbackFn(metrics, alerts);
      }
    } catch (error) {
      console.error("Error running compliance health check:", error);
    }
  }

  /**
   * Run a check focusing on critical controls
   */
  private async runCriticalControlsCheck(
    frameworks: ComplianceFramework[]
  ): Promise<void> {
    try {
      // Filter metrics and alerts to focus on critical controls
      const criticalControlsMetrics = frameworks.flatMap((framework) => {
        const criticalControls = framework.controls.filter(
          (c) => c.priority === "critical"
        );
        if (criticalControls.length === 0) return [];

        const criticalControlsCompliance =
          criticalControls.length > 0
            ? (criticalControls.filter((c) => c.status === "compliant").length /
                criticalControls.length) *
              100
            : 100;

        return [
          {
            id: `compliance-critical-controls-${framework.id}-${Date.now()}`,
            timestamp: new Date(),
            category: "compliance" as const,
            name: `${framework.name} Critical Controls Compliance`,
            value: Math.round(criticalControlsCompliance),
            unit: "%",
            status:
              criticalControlsCompliance < 50
                ? ("critical" as const)
                : criticalControlsCompliance < 80
                ? ("warning" as const)
                : criticalControlsCompliance < 95
                ? ("normal" as const)
                : ("info" as const),
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
          },
        ];
      });

      const criticalControlsAlerts = frameworks.flatMap((framework) => {
        const criticalNonCompliantControls = framework.controls.filter(
          (c) => c.priority === "critical" && c.status === "non-compliant"
        );

        if (criticalNonCompliantControls.length === 0) return [];

        return [
          {
            id: `compliance-alert-critical-controls-${
              framework.id
            }-${Date.now()}`,
            timestamp: new Date(),
            severity: "critical" as const,
            title: `${criticalNonCompliantControls.length} critical control${
              criticalNonCompliantControls.length > 1 ? "s" : ""
            } non-compliant in ${framework.name}`,
            description: `${
              criticalNonCompliantControls.length
            } critical control${
              criticalNonCompliantControls.length > 1 ? "s are" : " is"
            } non-compliant in the ${
              framework.name
            } framework, requiring immediate attention.`,
            source: "compliance-module",
            category: "compliance",
            affectedItems: criticalNonCompliantControls.map((c) => c.id),
            status: "active" as const,
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
          },
        ];
      });

      // Send to health monitoring system
      if (criticalControlsMetrics.length > 0) {
        await sendComplianceHealthMetrics(criticalControlsMetrics);
        this.historyMetrics = [
          ...this.historyMetrics,
          ...criticalControlsMetrics,
        ].slice(-100);
      }

      if (criticalControlsAlerts.length > 0) {
        await sendComplianceHealthAlerts(criticalControlsAlerts);
        this.historyAlerts = [
          ...this.historyAlerts,
          ...criticalControlsAlerts,
        ].slice(-50);

        // Call callback if registered
        if (this.callbackFn) {
          this.callbackFn(criticalControlsMetrics, criticalControlsAlerts);
        }
      }
    } catch (error) {
      console.error("Error running critical controls check:", error);
    }
  }

  /**
   * Run a check for approaching due dates
   */
  private async runDueDatesCheck(
    frameworks: ComplianceFramework[]
  ): Promise<void> {
    try {
      const now = new Date();

      // Find controls with approaching due dates
      const approachingDueDatesAlerts = frameworks.flatMap((framework) => {
        const controlsWithApproachingDueDates = framework.controls.filter(
          (c) =>
            c.status !== "compliant" &&
            c.dueDate &&
            (c.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 7
        );

        if (controlsWithApproachingDueDates.length === 0) return [];

        return [
          {
            id: `compliance-alert-due-dates-${framework.id}-${now.getTime()}`,
            timestamp: now,
            severity: "high" as const,
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
            status: "active" as const,
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
          },
        ];
      });

      if (approachingDueDatesAlerts.length > 0) {
        await sendComplianceHealthAlerts(approachingDueDatesAlerts);
        this.historyAlerts = [
          ...this.historyAlerts,
          ...approachingDueDatesAlerts,
        ].slice(-50);

        // Call callback if registered
        if (this.callbackFn) {
          this.callbackFn([], approachingDueDatesAlerts);
        }
      }
    } catch (error) {
      console.error("Error running due dates check:", error);
    }
  }

  /**
   * Get the history of health metrics
   */
  public getHistoryMetrics(): HealthMetric[] {
    return this.historyMetrics;
  }

  /**
   * Get the history of health alerts
   */
  public getHistoryAlerts(): HealthAlert[] {
    return this.historyAlerts;
  }

  /**
   * Get all scheduled checks
   */
  public getScheduledChecks(): ScheduledCheck[] {
    return Array.from(this.scheduledChecks.values());
  }

  /**
   * Clean up service resources
   */
  public cleanup(): void {
    // Cancel all scheduled checks
    for (const [id, check] of this.scheduledChecks.entries()) {
      if (check.timerId) {
        clearInterval(check.timerId);
      }
    }

    this.scheduledChecks.clear();
    this.initialized = false;
  }
}

// Export singleton instance
export const complianceHealthMonitoring =
  ComplianceHealthMonitoringService.getInstance();

// Convenience function to initialize the service
export const initializeComplianceHealthMonitoring = async (
  frameworks: ComplianceFramework[],
  callback?: (metrics: HealthMetric[], alerts: HealthAlert[]) => void
): Promise<boolean> => {
  return complianceHealthMonitoring.initialize(frameworks, callback);
};
