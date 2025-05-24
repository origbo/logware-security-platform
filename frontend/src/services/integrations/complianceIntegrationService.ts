import {
  ComplianceFramework,
  ComplianceAudit,
  AssessmentResult,
} from "../../pages/compliance/CompliancePage";
import {
  generateComplianceAlerts,
  sendComplianceAlerts,
} from "./complianceAlertService";
import {
  generateComplianceReportData,
  sendComplianceReportToDashboard,
} from "./complianceReportingService";
import { initializeComplianceHealthMonitoring } from "../scheduling/complianceHealthMonitoring";
import {
  getFrameworksForExternalApi,
  getFrameworkControlsForExternalApi,
  getComplianceStatisticsForExternalApi,
} from "./complianceApiService";

/**
 * Integration service to initialize and connect all compliance module features
 */

interface ComplianceIntegrationOptions {
  enableAlerts?: boolean;
  enableReporting?: boolean;
  enableHealthMonitoring?: boolean;
  enableApiGateway?: boolean;
  alertCallback?: (alerts: any[]) => void;
  reportCallback?: (reports: any[]) => void;
  healthCallback?: (metrics: any[], alerts: any[]) => void;
}

/**
 * Initialize all compliance integrations
 */
export const initializeComplianceIntegrations = async (
  frameworks: ComplianceFramework[],
  audits: ComplianceAudit[],
  assessmentResults: AssessmentResult[],
  options: ComplianceIntegrationOptions = {}
): Promise<boolean> => {
  try {
    console.log("Initializing compliance integrations...");

    const {
      enableAlerts = true,
      enableReporting = true,
      enableHealthMonitoring = true,
      enableApiGateway = true,
      alertCallback,
      reportCallback,
      healthCallback,
    } = options;

    const results: boolean[] = [];

    // Initialize alert service integration
    if (enableAlerts) {
      console.log("Initializing compliance alert integration...");
      const latestAssessment =
        assessmentResults.length > 0
          ? assessmentResults[assessmentResults.length - 1]
          : undefined;

      const alerts = generateComplianceAlerts(frameworks, latestAssessment);
      if (alerts.length > 0) {
        const alertResult = await sendComplianceAlerts(alerts);
        results.push(alertResult);

        if (alertCallback) {
          alertCallback(alerts);
        }
      } else {
        results.push(true);
      }
    }

    // Initialize reporting service integration
    if (enableReporting) {
      console.log("Initializing compliance reporting integration...");
      // Generate reports
      const reportData = generateComplianceReportData(
        frameworks,
        audits,
        assessmentResults
      );
      if (reportData.length > 0) {
        // Send most recent report to dashboard
        const reportResult = await sendComplianceReportToDashboard(
          reportData[0]
        );
        results.push(reportResult.success);

        if (reportCallback) {
          reportCallback(reportData);
        }
      } else {
        results.push(true);
      }
    }

    // Initialize health monitoring integration
    if (enableHealthMonitoring) {
      console.log("Initializing compliance health monitoring...");
      const healthResult = await initializeComplianceHealthMonitoring(
        frameworks,
        healthCallback
      );
      results.push(healthResult);
    }

    // Initialize API gateway integration
    if (enableApiGateway) {
      console.log("Initializing compliance API gateway...");
      // We don't need to do anything immediately for the API gateway
      // as the endpoints are already defined. We're just making sure
      // the functions are ready to be called.

      // Test API response
      const apiResult = await getComplianceStatisticsForExternalApi(frameworks);
      results.push(apiResult.success);
    }

    // Consider the initialization successful if all enabled features were initialized
    const successfulInit = results.every((result) => result);

    console.log(
      `Compliance integrations initialized: ${
        successfulInit ? "SUCCESS" : "PARTIAL FAILURE"
      }`
    );
    return successfulInit;
  } catch (error) {
    console.error("Error initializing compliance integrations:", error);
    return false;
  }
};

/**
 * Process a new assessment result and trigger appropriate integrations
 */
export const processNewAssessmentResult = async (
  frameworks: ComplianceFramework[],
  audits: ComplianceAudit[],
  newAssessment: AssessmentResult,
  options: ComplianceIntegrationOptions = {}
): Promise<{
  alertsSent: boolean;
  reportGenerated: boolean;
  healthUpdated: boolean;
}> => {
  const result = {
    alertsSent: false,
    reportGenerated: false,
    healthUpdated: false,
  };

  try {
    // Generate and send alerts
    const alerts = generateComplianceAlerts(frameworks, newAssessment);
    if (alerts.length > 0) {
      result.alertsSent = await sendComplianceAlerts(alerts);

      if (options.alertCallback) {
        options.alertCallback(alerts);
      }
    }

    // Generate a new report for this assessment
    const reportData = generateComplianceReportData(frameworks, audits, [
      newAssessment,
    ]);

    if (reportData.length > 0) {
      const reportResult = await sendComplianceReportToDashboard(reportData[0]);
      result.reportGenerated = reportResult.success;

      if (options.reportCallback) {
        options.reportCallback(reportData);
      }
    }

    // Update health monitoring
    if (options.healthCallback) {
      // Trigger a new health check
      await initializeComplianceHealthMonitoring(
        frameworks,
        options.healthCallback
      );
      result.healthUpdated = true;
    }

    return result;
  } catch (error) {
    console.error("Error processing new assessment result:", error);
    return result;
  }
};

/**
 * Utility function to connect compliance module to application-wide notifications
 */
export const setupComplianceNotificationListeners = (
  onAlert: (alert: any) => void,
  onReport: (report: any) => void,
  onHealthIssue: (issue: any) => void
): (() => void) => {
  // In a real application, this would set up event listeners
  // for compliance events. For now, we'll just return a cleanup function.

  console.log("Setting up compliance notification listeners...");

  // Return a cleanup function
  return () => {
    console.log("Removing compliance notification listeners...");
    // Cleanup code would go here in a real application
  };
};

/**
 * Get compliance module status for system health reporting
 */
export const getComplianceModuleStatus = async (): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  lastUpdated: string;
  components: {
    name: string;
    status: "operational" | "degraded" | "offline";
    message?: string;
  }[];
}> => {
  // In a real application, this would check actual service health
  return {
    status: "healthy",
    lastUpdated: new Date().toISOString(),
    components: [
      {
        name: "Compliance Alert Service",
        status: "operational",
      },
      {
        name: "Compliance Reporting Service",
        status: "operational",
      },
      {
        name: "Compliance Health Monitoring",
        status: "operational",
      },
      {
        name: "Compliance API Gateway",
        status: "operational",
      },
    ],
  };
};
