import {
  ComplianceFramework,
  ComplianceControl,
  ComplianceAudit,
  AssessmentResult,
} from "../../pages/compliance/CompliancePage";

/**
 * Service for integrating compliance data with the reporting engine
 */
export interface ComplianceReportData {
  id: string;
  timestamp: Date;
  reportType: "assessment" | "framework" | "audit" | "executive";
  title: string;
  description: string;
  frameworkIds: string[];
  auditIds: string[];
  assessmentIds?: string[];
  startDate?: Date;
  endDate?: Date;
  format: "pdf" | "excel" | "csv" | "html";
  includeCharts: boolean;
  includeEvidence: boolean;
  includeRecommendations: boolean;
  sections: ComplianceReportSection[];
}

export interface ComplianceReportSection {
  title: string;
  content: string;
  charts?: ComplianceReportChart[];
  tables?: ComplianceReportTable[];
}

export interface ComplianceReportChart {
  type: "bar" | "pie" | "line" | "radar";
  title: string;
  data: any;
}

export interface ComplianceReportTable {
  title: string;
  headers: string[];
  rows: any[][];
}

/**
 * Generate data for compliance reports based on frameworks, audits, and assessments
 */
export const generateComplianceReportData = (
  frameworks: ComplianceFramework[],
  audits: ComplianceAudit[],
  assessmentResults?: AssessmentResult[]
): ComplianceReportData[] => {
  const reportData: ComplianceReportData[] = [];

  // Generate framework-specific reports
  frameworks.forEach((framework) => {
    // Create a report for this framework
    const frameworkReport: ComplianceReportData = {
      id: `framework-report-${framework.id}-${Date.now()}`,
      timestamp: new Date(),
      reportType: "framework",
      title: `Compliance Report: ${framework.name}`,
      description: `Detailed compliance report for ${framework.name} (${framework.version})`,
      frameworkIds: [framework.id],
      auditIds: audits
        .filter((a) => a.frameworkId === framework.id)
        .map((a) => a.id),
      format: "pdf",
      includeCharts: true,
      includeEvidence: true,
      includeRecommendations: true,
      sections: [],
    };

    // Executive summary section
    frameworkReport.sections.push({
      title: "Executive Summary",
      content: `This report provides an overview of the compliance status for ${framework.name}. Overall compliance score: ${framework.overallScore}%.`,
      charts: [
        {
          type: "pie",
          title: "Control Status Distribution",
          data: {
            labels: [
              "Compliant",
              "Partially Compliant",
              "Non-Compliant",
              "Pending",
            ],
            datasets: [
              {
                data: [
                  framework.controls.filter((c) => c.status === "compliant")
                    .length,
                  framework.controls.filter(
                    (c) => c.status === "partially-compliant"
                  ).length,
                  framework.controls.filter((c) => c.status === "non-compliant")
                    .length,
                  framework.controls.filter((c) => c.status === "pending")
                    .length,
                ],
              },
            ],
          },
        },
      ],
    });

    // Controls by category section
    const categories = [...new Set(framework.controls.map((c) => c.category))];

    frameworkReport.sections.push({
      title: "Controls by Category",
      content: `${framework.name} contains ${categories.length} control categories with a total of ${framework.controls.length} controls.`,
      charts: [
        {
          type: "bar",
          title: "Compliance by Category",
          data: {
            labels: categories,
            datasets: [
              {
                label: "Compliance Score (%)",
                data: categories.map((category) => {
                  const categoryControls = framework.controls.filter(
                    (c) => c.category === category
                  );
                  const categoryScore =
                    categoryControls.reduce((sum, c) => sum + c.score, 0) /
                    categoryControls.length;
                  return Math.round(categoryScore);
                }),
              },
            ],
          },
        },
      ],
      tables: [
        {
          title: "Control Categories Summary",
          headers: [
            "Category",
            "Controls",
            "Avg. Score",
            "Compliant",
            "Non-Compliant",
            "Remediation Needed",
          ],
          rows: categories.map((category) => {
            const categoryControls = framework.controls.filter(
              (c) => c.category === category
            );
            return [
              category,
              categoryControls.length,
              Math.round(
                categoryControls.reduce((sum, c) => sum + c.score, 0) /
                  categoryControls.length
              ),
              categoryControls.filter((c) => c.status === "compliant").length,
              categoryControls.filter((c) => c.status === "non-compliant")
                .length,
              categoryControls.filter((c) => c.status !== "compliant").length,
            ];
          }),
        },
      ],
    });

    // Non-compliant controls section
    const nonCompliantControls = framework.controls.filter(
      (c) => c.status === "non-compliant"
    );
    if (nonCompliantControls.length > 0) {
      frameworkReport.sections.push({
        title: "Non-Compliant Controls",
        content: `There are ${nonCompliantControls.length} non-compliant controls that require remediation.`,
        tables: [
          {
            title: "Non-Compliant Controls Detail",
            headers: [
              "Control ID",
              "Title",
              "Category",
              "Priority",
              "Score",
              "Due Date",
              "Owner",
            ],
            rows: nonCompliantControls.map((control) => [
              control.controlId,
              control.title,
              control.category,
              control.priority,
              control.score,
              control.dueDate
                ? control.dueDate.toLocaleDateString()
                : "Not set",
              control.owner || "Unassigned",
            ]),
          },
        ],
      });
    }

    // Remediation plan section
    frameworkReport.sections.push({
      title: "Remediation Plan",
      content:
        "The following controls require remediation actions to improve compliance score.",
      tables: [
        {
          title: "Controls Requiring Remediation",
          headers: [
            "Control ID",
            "Priority",
            "Remediation Plan",
            "Due Date",
            "Owner",
          ],
          rows: framework.controls
            .filter((c) => c.status !== "compliant" && c.remediationPlan)
            .map((control) => [
              control.controlId,
              control.priority,
              control.remediationPlan || "No plan defined",
              control.dueDate
                ? control.dueDate.toLocaleDateString()
                : "Not set",
              control.owner || "Unassigned",
            ]),
        },
      ],
    });

    reportData.push(frameworkReport);
  });

  // Add assessment reports if available
  if (assessmentResults && assessmentResults.length > 0) {
    assessmentResults.forEach((assessment) => {
      const framework = frameworks.find((f) => f.id === assessment.frameworkId);
      if (framework) {
        reportData.push({
          id: `assessment-report-${assessment.frameworkId}-${Date.now()}`,
          timestamp: new Date(),
          reportType: "assessment",
          title: `Assessment Report: ${assessment.frameworkName}`,
          description: `Results of compliance assessment for ${
            assessment.frameworkName
          } conducted on ${assessment.date.toLocaleDateString()}`,
          frameworkIds: [assessment.frameworkId],
          auditIds: [],
          assessmentIds: [assessment.frameworkId],
          format: "pdf",
          includeCharts: true,
          includeEvidence: true,
          includeRecommendations: true,
          sections: [
            {
              title: "Assessment Summary",
              content: `This assessment was conducted on ${assessment.date.toLocaleDateString()} and covered ${
                assessment.completedControls
              } of ${
                assessment.totalControls
              } controls. The overall compliance score is ${
                assessment.score
              }%.`,
              charts: [
                {
                  type: "pie",
                  title: "Assessment Results",
                  data: {
                    labels: [
                      "Compliant",
                      "Partially Compliant",
                      "Non-Compliant",
                    ],
                    datasets: [
                      {
                        data: [
                          assessment.answers.filter(
                            (a: any) => a.status === "compliant"
                          ).length,
                          assessment.answers.filter(
                            (a: any) => a.status === "partially-compliant"
                          ).length,
                          assessment.answers.filter(
                            (a: any) => a.status === "non-compliant"
                          ).length,
                        ],
                      },
                    ],
                  },
                },
              ],
            },
            {
              title: "Detailed Assessment Results",
              content: "Detailed results of the assessment by control.",
              tables: [
                {
                  title: "Control Assessment Details",
                  headers: ["Control ID", "Control Title", "Status", "Notes"],
                  rows: assessment.answers.map((answer: any) => [
                    answer.controlId,
                    answer.title,
                    answer.status,
                    answer.notes || "No notes provided",
                  ]),
                },
              ],
            },
          ],
        });
      }
    });
  }

  return reportData;
};

/**
 * Generate an executive summary report across all frameworks
 */
export const generateExecutiveSummaryReport = (
  frameworks: ComplianceFramework[],
  audits: ComplianceAudit[]
): ComplianceReportData => {
  return {
    id: `executive-report-${Date.now()}`,
    timestamp: new Date(),
    reportType: "executive",
    title: "Executive Compliance Summary",
    description:
      "High-level overview of compliance status across all frameworks",
    frameworkIds: frameworks.map((f) => f.id),
    auditIds: audits.map((a) => a.id),
    format: "pdf",
    includeCharts: true,
    includeEvidence: false,
    includeRecommendations: true,
    sections: [
      {
        title: "Executive Summary",
        content: `This report provides an executive overview of compliance status across ${
          frameworks.length
        } frameworks. The overall average compliance score is ${Math.round(
          frameworks.reduce((sum, f) => sum + f.overallScore, 0) /
            frameworks.length
        )}%.`,
        charts: [
          {
            type: "bar",
            title: "Framework Compliance Scores",
            data: {
              labels: frameworks.map((f) => f.name),
              datasets: [
                {
                  label: "Compliance Score (%)",
                  data: frameworks.map((f) => f.overallScore),
                },
              ],
            },
          },
        ],
      },
      {
        title: "Framework Summary",
        content: "Overview of compliance status for each framework.",
        tables: [
          {
            title: "Framework Compliance Status",
            headers: [
              "Framework",
              "Version",
              "Status",
              "Score",
              "Controls",
              "Last Updated",
              "Next Audit",
            ],
            rows: frameworks.map((framework) => [
              framework.name,
              framework.version,
              framework.status,
              framework.overallScore + "%",
              framework.controls.length,
              framework.lastUpdated.toLocaleDateString(),
              framework.nextAuditDate
                ? framework.nextAuditDate.toLocaleDateString()
                : "Not scheduled",
            ]),
          },
        ],
      },
      {
        title: "Critical Issues",
        content:
          "Summary of critical compliance issues requiring immediate attention.",
        tables: [
          {
            title: "Critical Non-Compliant Controls",
            headers: ["Framework", "Control ID", "Title", "Due Date", "Owner"],
            rows: frameworks.flatMap((framework) =>
              framework.controls
                .filter(
                  (control) =>
                    control.priority === "critical" &&
                    control.status === "non-compliant"
                )
                .map((control) => [
                  framework.name,
                  control.controlId,
                  control.title,
                  control.dueDate
                    ? control.dueDate.toLocaleDateString()
                    : "Not set",
                  control.owner || "Unassigned",
                ])
            ),
          },
        ],
      },
    ],
  };
};

/**
 * Send the generated report data to the reporting engine
 */
export const sendToReportingEngine = async (
  reportData: ComplianceReportData
): Promise<{ success: boolean; reportUrl?: string }> => {
  // In a real implementation, this would call an API endpoint
  // For now, we'll just simulate the process
  console.log("Sending report data to reporting engine:", reportData);

  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      reportUrl: `https://logware.example.com/reports/${reportData.id}`,
    };
  } catch (error) {
    console.error("Failed to send report to reporting engine:", error);
    return { success: false };
  }
};
