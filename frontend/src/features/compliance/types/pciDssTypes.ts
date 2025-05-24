/**
 * PCI-DSS Compliance Types
 */

// PCI-DSS Requirement Status
export enum ComplianceStatus {
  COMPLIANT = "COMPLIANT",
  NON_COMPLIANT = "NON_COMPLIANT",
  PARTIALLY_COMPLIANT = "PARTIALLY_COMPLIANT",
  NOT_APPLICABLE = "NOT_APPLICABLE",
  UNDER_REVIEW = "UNDER_REVIEW",
}

// PCI-DSS Risk Level
export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// PCI-DSS System Component Type
export enum SystemComponentType {
  NETWORK_DEVICE = "NETWORK_DEVICE",
  SERVER = "SERVER",
  APPLICATION = "APPLICATION",
  DATABASE = "DATABASE",
  POINT_OF_SALE = "POINT_OF_SALE",
  PAYMENT_TERMINAL = "PAYMENT_TERMINAL",
  WORKSTATION = "WORKSTATION",
  MOBILE_DEVICE = "MOBILE_DEVICE",
  VIRTUAL_COMPONENT = "VIRTUAL_COMPONENT",
  CLOUD_SERVICE = "CLOUD_SERVICE",
  OTHER = "OTHER",
}

// PCI-DSS Environment Type
export enum EnvironmentType {
  CDE = "CDE", // Cardholder Data Environment
  CONNECTED = "CONNECTED", // Connected to CDE
  SEGMENTED = "SEGMENTED", // Segmented from CDE
  OUT_OF_SCOPE = "OUT_OF_SCOPE", // Out of scope for PCI-DSS
}

// PCI-DSS Requirement Category
export enum RequirementCategory {
  NETWORK_SECURITY = "NETWORK_SECURITY",
  DATA_PROTECTION = "DATA_PROTECTION",
  VULNERABILITY_MANAGEMENT = "VULNERABILITY_MANAGEMENT",
  ACCESS_CONTROL = "ACCESS_CONTROL",
  SECURITY_MONITORING = "SECURITY_MONITORING",
  SECURITY_POLICY = "SECURITY_POLICY",
}

// PCI-DSS Requirement interface
export interface PciRequirement {
  id: string; // e.g., "1.1", "2.3", etc.
  title: string; // Requirement title
  description: string; // Full description
  category: RequirementCategory; // Category of the requirement
  subRequirements?: PciRequirement[]; // Sub-requirements (e.g., 1.1.1, 1.1.2)
  status: ComplianceStatus; // Current compliance status
  evidence?: Evidence[]; // Evidence of compliance
  assignedTo?: string; // Person responsible
  dueDate?: string; // Due date for remediation
  lastAssessment?: string; // Date of last assessment
  notes?: string; // Additional notes
}

// PCI-DSS System Component interface
export interface SystemComponent {
  id: string; // Unique identifier
  name: string; // Component name
  type: SystemComponentType; // Type of component
  description: string; // Description
  environment: EnvironmentType; // Environment type
  location: string; // Physical or cloud location
  ownerId: string; // Owner ID
  ownerName: string; // Owner name
  ipAddress?: string; // IP address if applicable
  function: string; // Business function
  software?: string[]; // Installed software
  vulnerabilities?: Vulnerability[]; // Known vulnerabilities
  securityControls: string[]; // Implemented security controls
  inScope: boolean; // Is in scope for PCI-DSS
  lastScan?: string; // Date of last vulnerability scan
  createdAt: string; // Creation date
  updatedAt: string; // Last update date
}

// PCI-DSS Vulnerability interface
export interface Vulnerability {
  id: string; // Unique identifier
  name: string; // Vulnerability name
  description: string; // Description
  severity: RiskLevel; // Severity level
  affectedComponents: string[]; // Affected component IDs
  discoveryDate: string; // Date discovered
  remediated: boolean; // Remediation status
  remediationDate?: string; // Date remediated
  cveId?: string; // CVE identifier if applicable
  remediationPlan?: string; // Plan for remediation
  remediationOwner?: string; // Person responsible for remediation
}

// Evidence for compliance
export interface Evidence {
  id: string; // Unique identifier
  requirementId: string; // Related requirement ID
  title: string; // Evidence title
  description: string; // Description
  type: "DOCUMENT" | "SCREENSHOT" | "SCAN_RESULT" | "ATTESTATION" | "OTHER";
  fileUrl?: string; // URL to file if applicable
  dateCollected: string; // Date collected
  collectedBy: string; // Collected by
  status: "APPROVED" | "REJECTED" | "PENDING"; // Approval status
  comments?: string; // Additional comments
}

// PCI-DSS Assessment interface
export interface PciAssessment {
  id: string; // Unique identifier
  name: string; // Assessment name
  description: string; // Description
  scope: string; // Assessment scope
  startDate: string; // Start date
  endDate: string; // End date
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  assessor: string; // Assessor name
  results?: {
    // Assessment results
    compliantCount: number;
    nonCompliantCount: number;
    partiallyCompliantCount: number;
    notApplicableCount: number;
    underReviewCount: number;
    overallStatus: ComplianceStatus;
  };
  reportUrl?: string; // URL to assessment report
  findings?: string[]; // Key findings
  remediationPlan?: string; // Remediation plan
  nextAssessmentDate?: string; // Next assessment date
}
