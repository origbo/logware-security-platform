/**
 * Evidence Types
 *
 * Types and interfaces for the Evidence Collection System
 */

/**
 * Evidence status enum
 */
export enum EvidenceStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

/**
 * Evidence type enum
 */
export enum EvidenceType {
  DOCUMENT = "document",
  SCREENSHOT = "screenshot",
  LOG = "log",
  CONFIG = "config",
  REPORT = "report",
  ATTESTATION = "attestation",
  OTHER = "other",
}

/**
 * Evidence format enum
 */
export enum EvidenceFormat {
  PDF = "pdf",
  WORD = "word",
  EXCEL = "excel",
  IMAGE = "image",
  TEXT = "text",
  JSON = "json",
  XML = "xml",
  OTHER = "other",
}

/**
 * Evidence item interface
 */
export interface EvidenceItem {
  id: string;
  name: string;
  description?: string;
  type: EvidenceType | string;
  format: EvidenceFormat | string;
  framework: string;
  requirement: string;
  uploadedBy: string;
  uploadedAt: string;
  expiresAt?: string;
  status: EvidenceStatus | string;
  tags: string[];
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

/**
 * Evidence filters interface
 */
export interface EvidenceFilters {
  status?: string;
  type?: string;
  framework?: string;
  searchQuery?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

/**
 * Evidence collection campaign
 */
export interface EvidenceCampaign {
  id: string;
  name: string;
  description?: string;
  framework: string;
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "completed" | "archived";
  created: string;
  createdBy: string;
  items: EvidenceCampaignItem[];
}

/**
 * Evidence campaign item
 */
export interface EvidenceCampaignItem {
  id: string;
  requirement: string;
  description: string;
  status: "pending" | "collected" | "verified" | "rejected";
  assignedTo?: string;
  dueDate?: string;
  evidenceId?: string;
  notes?: string;
}
