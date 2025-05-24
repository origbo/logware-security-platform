/**
 * HIPAA Compliance Types
 */

// HIPAA Compliance Status
export enum ComplianceStatus {
  COMPLIANT = "COMPLIANT",
  NON_COMPLIANT = "NON_COMPLIANT",
  PARTIALLY_COMPLIANT = "PARTIALLY_COMPLIANT",
  NOT_APPLICABLE = "NOT_APPLICABLE",
  UNDER_REVIEW = "UNDER_REVIEW",
}

// HIPAA Risk Level
export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// HIPAA PHI (Protected Health Information) Type
export enum PhiType {
  DEMOGRAPHIC = "DEMOGRAPHIC", // Names, addresses, etc.
  FINANCIAL = "FINANCIAL", // Payment information
  MEDICAL_RECORDS = "MEDICAL_RECORDS", // Healthcare records
  MEDICATION = "MEDICATION", // Medication information
  DIAGNOSTIC = "DIAGNOSTIC", // Diagnostic results
  TREATMENT = "TREATMENT", // Treatment information
  INSURANCE = "INSURANCE", // Insurance information
  APPOINTMENT = "APPOINTMENT", // Appointment scheduling
  PROVIDER = "PROVIDER", // Healthcare provider details
  OTHER = "OTHER", // Other PHI
}

// HIPAA Rule Category
export enum RuleCategory {
  PRIVACY_RULE = "PRIVACY_RULE", // Privacy Rule requirements
  SECURITY_RULE = "SECURITY_RULE", // Security Rule requirements
  BREACH_NOTIFICATION = "BREACH_NOTIFICATION", // Breach Notification requirements
  ENFORCEMENT_RULE = "ENFORCEMENT_RULE", // Enforcement Rule requirements
}

// HIPAA Security Rule Category
export enum SecurityCategory {
  ADMINISTRATIVE = "ADMINISTRATIVE", // Administrative safeguards
  PHYSICAL = "PHYSICAL", // Physical safeguards
  TECHNICAL = "TECHNICAL", // Technical safeguards
  ORGANIZATIONAL = "ORGANIZATIONAL", // Organizational requirements
}

// HIPAA Requirement interface
export interface HipaaRequirement {
  id: string; // Unique identifier (e.g., "P1", "S2")
  ruleId: string; // Rule identifier (e.g., "164.308")
  title: string; // Requirement title
  description: string; // Full description
  category: RuleCategory; // Rule category
  securityCategory?: SecurityCategory; // Security category if applicable
  status: ComplianceStatus; // Current compliance status
  implementation?: string; // Implementation details
  evidence?: Evidence[]; // Evidence of compliance
  assignedTo?: string; // Person responsible
  dueDate?: string; // Due date for remediation
  lastAssessment?: string; // Date of last assessment
  notes?: string; // Additional notes
}

// HIPAA PHI Location interface
export interface PhiLocation {
  id: string; // Unique identifier
  name: string; // Location name
  description: string; // Description
  phiTypes: PhiType[]; // Types of PHI stored
  systemType:
    | "DATABASE"
    | "APPLICATION"
    | "PHYSICAL"
    | "CLOUD"
    | "DEVICE"
    | "OTHER";
  location: string; // Physical or cloud location
  dataOwner: string; // Data owner
  technicalOwner: string; // Technical owner
  securityControls: string[]; // Implemented security controls
  encryptionInPlace: boolean; // Is encryption implemented
  accessControls: string[]; // Access control methods
  retentionPolicy: string; // Retention policy
  backupStrategy: string; // Backup strategy
  lastRiskAssessment?: string; // Date of last risk assessment
  riskLevel: RiskLevel; // Risk level
  createdAt: string; // Creation date
  updatedAt: string; // Last update date
}

// HIPAA Business Associate interface
export interface BusinessAssociate {
  id: string; // Unique identifier
  name: string; // BA name
  description: string; // Description
  contactName: string; // Contact person
  contactEmail: string; // Contact email
  contactPhone: string; // Contact phone
  serviceProvided: string; // Service provided
  phiAccessed: PhiType[]; // Types of PHI accessed
  agreementStatus: "SIGNED" | "PENDING" | "EXPIRED" | "NONE";
  agreementDate?: string; // Agreement signing date
  agreementExpiration?: string; // Agreement expiration date
  agreementUrl?: string; // URL to agreement document
  riskAssessmentStatus: "COMPLETED" | "PENDING" | "OVERDUE" | "NOT_STARTED";
  riskAssessmentDate?: string; // Risk assessment date
  riskLevel: RiskLevel; // Risk level
  securityQuestionnaire?: {
    // Security questionnaire
    completed: boolean;
    date?: string;
    score?: number;
    url?: string;
  };
  incidentHistory?: {
    // Incident history
    count: number;
    lastIncident?: string;
    resolved: number;
  };
  notes?: string; // Additional notes
}

// HIPAA Disclosure interface
export interface PhiDisclosure {
  id: string; // Unique identifier
  date: string; // Disclosure date
  phiTypes: PhiType[]; // Types of PHI disclosed
  purpose: string; // Purpose of disclosure
  recipient: string; // Recipient
  authorizedBy: string; // Authorized by
  disclosureType: "AUTHORIZED" | "TPO" | "PUBLIC_HEALTH" | "LEGAL" | "OTHER";
  documentation?: string; // Documentation link
  notes?: string; // Additional notes
}

// Evidence for HIPAA compliance
export interface Evidence {
  id: string; // Unique identifier
  requirementId: string; // Related requirement ID
  title: string; // Evidence title
  description: string; // Description
  type:
    | "DOCUMENT"
    | "SCREENSHOT"
    | "POLICY"
    | "AUDIT_LOG"
    | "ATTESTATION"
    | "OTHER";
  fileUrl?: string; // URL to file if applicable
  dateCollected: string; // Date collected
  collectedBy: string; // Collected by
  status: "APPROVED" | "REJECTED" | "PENDING"; // Approval status
  comments?: string; // Additional comments
}

// HIPAA Breach interface
export interface HipaaBreach {
  id: string; // Unique identifier
  discoveryDate: string; // Date discovered
  occurrenceDate?: string; // Date occurred if known
  description: string; // Description
  phiTypes: PhiType[]; // Types of PHI affected
  affectedIndividuals: number; // Number of affected individuals
  severityLevel: RiskLevel; // Severity level
  rootCause?: string; // Root cause
  status: "INVESTIGATION" | "NOTIFICATION" | "REMEDIATION" | "CLOSED";
  notificationRequired: boolean; // Is notification required
  notificationDate?: string; // Notification date
  notifiedHhs: boolean; // HHS notified
  notifiedIndividuals: boolean; // Individuals notified
  notifiedMedia: boolean; // Media notified
  remediationSteps: string[]; // Remediation steps
  remediationComplete: boolean; // Remediation complete
  assignedTo: string; // Person responsible
  documentation?: string[]; // Related documentation
  postMortem?: string; // Post-mortem analysis
}
