// Core compliance types for the application

export enum ComplianceFrameworkType {
  GDPR = "gdpr",
  HIPAA = "hipaa",
  PCI_DSS = "pci_dss",
  ISO_27001 = "iso_27001",
  SOC2 = "soc2",
  NIST_800_53 = "nist_800_53",
  CUSTOM = "custom",
}

// Framework structure
export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description?: string;
  status: "active" | "draft" | "archived";
  score: number;
  controls: ComplianceControl[];
  lastUpdated?: Date;
  lastAssessment?: Date;
  nextAssessment?: Date;
  metadata?: Record<string, unknown>;
}

export interface ComplianceControl {
  id: string;
  controlId: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  status:
    | "compliant"
    | "non-compliant"
    | "partially-compliant"
    | "not-applicable";
  priority: "critical" | "high" | "medium" | "low";
  owner?: string;
  assignedTo?: string;
  dueDate?: Date;
  evidence?: string[];
  lastUpdated?: Date;
  metadata?: Record<string, unknown>;
}

// Audit structure
export interface ComplianceAudit {
  id: string;
  name: string;
  description?: string;
  frameworkIds: string[];
  startDate?: Date;
  endDate?: Date;
  status: "planned" | "in-progress" | "completed" | "cancelled";
  auditors?: string[];
  progress?: number;
  metadata?: Record<string, unknown>;
}

export interface AssessmentResult {
  id: string;
  frameworkId: string;
  auditId?: string;
  date?: Date;
  status: "draft" | "in-progress" | "completed";
  score: number;
  controlResults?: {
    controlId: string;
    status:
      | "compliant"
      | "non-compliant"
      | "partially-compliant"
      | "not-applicable";
    evidence?: string[];
    notes?: string;
  }[];
  metadata?: Record<string, unknown>;
}

// Compliance template engine types
export interface ComplianceRequirement {
  id: string;
  sectionId: string;
  frameworkId: string;
  title: string;
  description: string;
  references?: string[];
  implementationGuidance?: string;
  assessmentProcedure?: string;
  controlMappings?: {
    frameworkId: string;
    controlIds: string[];
  }[];
}

export interface ComplianceSection {
  id: string;
  frameworkId: string;
  title: string;
  description?: string;
  order: number;
  parentId?: string;
}

export interface ComplianceTemplate {
  id: string;
  type: ComplianceFrameworkType;
  name: string;
  version: string;
  description: string;
  officialUrl?: string;
  lastUpdated: string;
  isCustom: boolean;
}

// GDPR-specific types
export interface DataProcessingRecord {
  id: string;
  purpose: string;
  dataCategories: string[];
  dataSubjects: string[];
  retention: string;
  legalBasis:
    | "consent"
    | "contract"
    | "legal_obligation"
    | "vital_interests"
    | "public_interest"
    | "legitimate_interests";
  recipients: string[];
  transfers: {
    country: string;
    safeguards: string;
  }[];
}

export interface DSARRequest {
  id: string;
  type:
    | "access"
    | "rectification"
    | "erasure"
    | "restriction"
    | "portability"
    | "object";
  status: "new" | "in_progress" | "completed" | "denied";
  submittedDate: string;
  completedDate?: string;
  subjectEmail: string;
  notes?: string;
}
