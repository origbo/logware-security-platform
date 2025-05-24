import { ComplianceFramework } from "../../pages/compliance/CompliancePage";

/**
 * Service for admin configuration of compliance monitoring parameters
 */
export interface ComplianceConfiguration {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  thresholds: {
    critical: number; // Minimum score to avoid critical status
    warning: number; // Minimum score to avoid warning status
    good: number; // Minimum score for good status
  };
  assessmentFrequency: {
    value: number;
    unit: "days" | "weeks" | "months" | "quarters" | "years";
  };
  notificationSettings: {
    enabledChannels: Array<"email" | "slack" | "teams" | "sms" | "dashboard">;
    recipients: string[];
    escalation: {
      threshold: number; // Hours until escalation
      recipients: string[];
    };
  };
  automationSettings: {
    enabled: boolean;
    actions: ComplianceAutomationAction[];
  };
}

export interface ComplianceAutomationAction {
  id: string;
  name: string;
  description: string;
  trigger: {
    type:
      | "score_threshold"
      | "control_status"
      | "assessment_complete"
      | "due_date_approaching";
    condition: string; // E.g., "score < 70" or "control.status === 'non-compliant' && control.priority === 'critical'"
  };
  action: {
    type:
      | "create_ticket"
      | "send_notification"
      | "schedule_assessment"
      | "generate_report";
    parameters: Record<string, any>;
  };
  enabled: boolean;
}

/**
 * Default configuration settings for each framework
 */
export const getDefaultFrameworkConfigurations = (
  frameworks: ComplianceFramework[]
): Record<string, ComplianceConfiguration> => {
  const configurations: Record<string, ComplianceConfiguration> = {};

  frameworks.forEach((framework) => {
    configurations[framework.id] = {
      id: `config-${framework.id}`,
      name: `${framework.name} Configuration`,
      description: `Configuration settings for ${framework.name} compliance monitoring`,
      enabled: true,
      thresholds: {
        critical: 50,
        warning: 70,
        good: 90,
      },
      assessmentFrequency: {
        value: framework.name === "PCI DSS" ? 3 : 6, // More frequent for PCI DSS
        unit: "months",
      },
      notificationSettings: {
        enabledChannels: ["email", "dashboard"],
        recipients: ["compliance@example.com", "security@example.com"],
        escalation: {
          threshold: 72, // 3 days
          recipients: ["ciso@example.com", "ceo@example.com"],
        },
      },
      automationSettings: {
        enabled: true,
        actions: [
          {
            id: `action-${framework.id}-1`,
            name: "Create Ticket for Critical Controls",
            description:
              "Automatically create a ticket when a critical control is non-compliant",
            trigger: {
              type: "control_status",
              condition:
                "control.status === 'non-compliant' && control.priority === 'critical'",
            },
            action: {
              type: "create_ticket",
              parameters: {
                assignee: "compliance-team",
                priority: "high",
                dueDate: 'control.dueDate || "+7d"', // 7 days if no specific due date
                description:
                  "Critical control {controlId} is non-compliant: {controlTitle}",
              },
            },
            enabled: true,
          },
          {
            id: `action-${framework.id}-2`,
            name: "Schedule Assessment on Low Score",
            description:
              "Schedule a new assessment when overall score drops below threshold",
            trigger: {
              type: "score_threshold",
              condition: "score < 70",
            },
            action: {
              type: "schedule_assessment",
              parameters: {
                timeframe: "+30d", // Schedule in 30 days
                notifyTeam: true,
                priority: "high",
              },
            },
            enabled: true,
          },
        ],
      },
    };
  });

  return configurations;
};

/**
 * Save compliance configuration settings
 */
export const saveComplianceConfiguration = async (
  frameworkId: string,
  configuration: ComplianceConfiguration
): Promise<boolean> => {
  // In a real implementation, this would call an API endpoint
  console.log(
    `Saving compliance configuration for framework ${frameworkId}:`,
    configuration
  );

  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    console.error("Failed to save compliance configuration:", error);
    return false;
  }
};

/**
 * Apply compliance configuration settings across the system
 */
export const applyComplianceConfiguration = async (
  frameworkId: string
): Promise<boolean> => {
  // In a real implementation, this would call an API endpoint
  console.log(`Applying compliance configuration for framework ${frameworkId}`);

  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    return true;
  } catch (error) {
    console.error("Failed to apply compliance configuration:", error);
    return false;
  }
};
