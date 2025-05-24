/**
 * Cloud Security Module Type Definitions
 * Contains all shared types for cloud security components
 */

// Cloud Provider Types
export enum CloudProvider {
  AWS = "aws",
  AZURE = "azure",
  GCP = "gcp",
}

// General Cloud Resource interface
export interface CloudResource {
  id: string;
  name: string;
  type: string;
  provider: CloudProvider;
  region: string;
  createdAt: string;
  tags?: Record<string, string>;
  status?: string;
}

// Cloud Account information
export interface CloudAccount {
  id: string;
  name: string;
  provider: CloudProvider;
  accountId: string;
  status: "connected" | "disconnected" | "error";
  lastSyncTime?: string;
  syncStatus?: "syncing" | "completed" | "failed";
  resources?: number;
  findings?: number;
}

// Security Finding Severity
export enum FindingSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  INFORMATIONAL = "informational",
}

// Security Finding Status
export enum FindingStatus {
  ACTIVE = "active",
  SUPPRESSED = "suppressed",
  RESOLVED = "resolved",
  IGNORED = "ignored",
}

// Generic Security Finding interface
export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  provider: CloudProvider;
  accountId: string;
  resource: {
    id: string;
    type: string;
    name?: string;
  };
  region: string;
  severity: FindingSeverity;
  status: FindingStatus;
  createdAt: string;
  updatedAt?: string;
  remediation?: {
    recommendation: string;
    url?: string;
    code?: string;
  };
  compliance?: {
    standard: string;
    requirements: string[];
  }[];
  details?: Record<string, any>;
}

// Compliance Status
export enum ComplianceStatus {
  COMPLIANT = "compliant",
  PARTIALLY_COMPLIANT = "partially_compliant",
  NON_COMPLIANT = "non_compliant",
  NOT_APPLICABLE = "not_applicable",
  INSUFFICIENT_DATA = "insufficient_data",
}

// Compliance Framework
export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  controls: ComplianceControl[];
  categories?: ComplianceCategory[];
}

// Compliance Category
export interface ComplianceCategory {
  id: string;
  name: string;
  description: string;
  controlIds: string[];
}

// Compliance Control
export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  categoryId?: string;
  requirements: string[];
  cloudProviders: CloudProvider[];
  testProcedure?: string;
  remediation?: string;
  status?: ComplianceStatus;
  findings?: SecurityFinding[];
}

// Compliance Assessment
export interface ComplianceAssessment {
  id: string;
  frameworkId: string;
  frameworkName: string;
  accountId: string;
  provider: CloudProvider;
  status: ComplianceStatus;
  compliantControls: number;
  nonCompliantControls: number;
  notApplicableControls: number;
  insufficientDataControls: number;
  lastAssessedAt: string;
  controlAssessments: {
    controlId: string;
    status: ComplianceStatus;
    findings?: SecurityFinding[];
  }[];
}
