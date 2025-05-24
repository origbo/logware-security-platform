/**
 * ISO 27001 Compliance Types
 */

// ISO 27001 Control Status
export enum ControlStatus {
  IMPLEMENTED = "IMPLEMENTED",
  PARTIALLY_IMPLEMENTED = "PARTIALLY_IMPLEMENTED",
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
  NOT_APPLICABLE = "NOT_APPLICABLE",
  PLANNED = "PLANNED",
}

// ISO 27001 Risk Level
export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// ISO 27001 Control Category
export enum ControlCategory {
  INFORMATION_SECURITY_POLICIES = "A.5",
  ORGANIZATION_OF_INFORMATION_SECURITY = "A.6",
  HUMAN_RESOURCE_SECURITY = "A.7",
  ASSET_MANAGEMENT = "A.8",
  ACCESS_CONTROL = "A.9",
  CRYPTOGRAPHY = "A.10",
  PHYSICAL_ENVIRONMENTAL_SECURITY = "A.11",
  OPERATIONS_SECURITY = "A.12",
  COMMUNICATIONS_SECURITY = "A.13",
  SYSTEM_ACQUISITION = "A.14",
  SUPPLIER_RELATIONSHIPS = "A.15",
  INFORMATION_SECURITY_INCIDENT_MANAGEMENT = "A.16",
  BUSINESS_CONTINUITY = "A.17",
  COMPLIANCE = "A.18",
}

// ISO 27001 Document Type
export enum DocumentType {
  POLICY = "POLICY",
  PROCEDURE = "PROCEDURE",
  STANDARD = "STANDARD",
  GUIDELINE = "GUIDELINE",
  RECORD = "RECORD",
  EVIDENCE = "EVIDENCE",
  RISK_ASSESSMENT = "RISK_ASSESSMENT",
  AUDIT_REPORT = "AUDIT_REPORT",
  CORRECTIVE_ACTION = "CORRECTIVE_ACTION",
  OTHER = "OTHER",
}

// ISO 27001 Control interface
export interface IsoControl {
  id: string; // Unique identifier (e.g., "A.5.1.1")
  category: ControlCategory; // Control category
  title: string; // Control title
  description: string; // Full description
  objective: string; // Control objective
  implementation: string; // Implementation guidance
  status: ControlStatus; // Current status
  assignedTo?: string; // Person responsible
  dueDate?: string; // Implementation due date
  lastAssessment?: string; // Date of last assessment
  evidence?: Evidence[]; // Evidence of implementation
  applicabilityStatement?: string; // Statement of Applicability notes
  riskAssessment?: {
    // Related risk assessment
    riskId: string;
    riskLevel: RiskLevel;
    treatmentDecision: "MITIGATE" | "ACCEPT" | "TRANSFER" | "AVOID";
  };
  notes?: string; // Additional notes
}

// ISO 27001 Asset interface
export interface InformationAsset {
  id: string; // Unique identifier
  name: string; // Asset name
  description: string; // Description
  type:
    | "INFORMATION"
    | "SOFTWARE"
    | "PHYSICAL"
    | "SERVICE"
    | "PEOPLE"
    | "INTANGIBLE";
  classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  owner: string; // Asset owner
  custodian?: string; // Asset custodian
  location: string; // Physical or logical location
  value: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  risks: string[]; // Associated risks
  controls: string[]; // Applied controls
  lastReview: string; // Last review date
  createdAt: string; // Creation date
  updatedAt: string; // Last update date
}

// ISO 27001 Risk interface
export interface Risk {
  id: string; // Unique identifier
  title: string; // Risk title
  description: string; // Description
  assets: string[]; // Affected assets
  threatSource: string; // Source of threat
  vulnerability: string; // Vulnerability description
  likelihood: "LOW" | "MEDIUM" | "HIGH"; // Likelihood of occurrence
  impact: "LOW" | "MEDIUM" | "HIGH"; // Impact if realized
  inherentRiskLevel: RiskLevel; // Inherent risk level
  controls: string[]; // Applied controls
  residualRiskLevel: RiskLevel; // Residual risk level
  treatment: "MITIGATE" | "ACCEPT" | "TRANSFER" | "AVOID";
  treatmentPlan?: string; // Treatment plan
  treatmentOwner?: string; // Treatment owner
  reviewFrequency: "MONTHLY" | "QUARTERLY" | "BIANNUALLY" | "ANNUALLY";
  nextReview: string; // Next review date
  status: "OPEN" | "TREATED" | "ACCEPTED" | "CLOSED";
  createdAt: string; // Creation date
  updatedAt: string; // Last update date
}

// ISO 27001 Document interface
export interface IsoDocument {
  id: string; // Unique identifier
  title: string; // Document title
  documentId: string; // Document identifier
  type: DocumentType; // Document type
  description: string; // Description
  version: string; // Version number
  status: "DRAFT" | "REVIEW" | "APPROVED" | "OBSOLETE";
  approver: string; // Approver
  approvalDate?: string; // Approval date
  nextReview: string; // Next review date
  relatedControls: string[]; // Related controls
  fileUrl?: string; // URL to document
  createdBy: string; // Created by
  createdAt: string; // Creation date
  updatedAt: string; // Last update date
}

// Evidence for ISO 27001 compliance
export interface Evidence {
  id: string; // Unique identifier
  controlId: string; // Related control ID
  title: string; // Evidence title
  description: string; // Description
  type: DocumentType; // Evidence type
  fileUrl?: string; // URL to file if applicable
  dateCollected: string; // Date collected
  collectedBy: string; // Collected by
  status: "APPROVED" | "REJECTED" | "PENDING"; // Approval status
  comments?: string; // Additional comments
}

// ISO 27001 Audit interface
export interface Audit {
  id: string; // Unique identifier
  title: string; // Audit title
  description: string; // Description
  type: "INTERNAL" | "EXTERNAL" | "SURVEILLANCE" | "CERTIFICATION";
  scope: string; // Audit scope
  auditor: string; // Auditor
  startDate: string; // Start date
  endDate: string; // End date
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  findings: {
    // Audit findings
    nonConformities: number;
    observations: number;
    opportunities: number;
  };
  nonConformities?: {
    // Non-conformities
    id: string;
    description: string;
    controlId: string;
    severity: "MINOR" | "MAJOR";
    correctiveActionId?: string;
    status: "OPEN" | "CLOSED";
  }[];
  reportUrl?: string; // URL to audit report
  nextAudit?: string; // Next audit date
  createdAt: string; // Creation date
  updatedAt: string; // Last update date
}

// ISO 27001 Corrective Action interface
export interface CorrectiveAction {
  id: string; // Unique identifier
  title: string; // Action title
  description: string; // Description
  rootCause: string; // Root cause analysis
  nonConformityId?: string; // Related non-conformity
  controlId?: string; // Related control
  assignedTo: string; // Person responsible
  priority: "LOW" | "MEDIUM" | "HIGH"; // Priority level
  dueDate: string; // Due date
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "VERIFIED";
  verificationMethod: string; // Method of verification
  verificationDate?: string; // Date of verification
  verifiedBy?: string; // Verified by
  effectiveness?: string; // Effectiveness evaluation
  notes?: string; // Additional notes
  createdAt: string; // Creation date
  updatedAt: string; // Last update date
}
