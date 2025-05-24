/**
 * GDPR Types
 *
 * Types used for GDPR compliance features including data subject rights,
 * data breach management, and data mapping inventory.
 */

/**
 * Data Subject Right Request Types
 */
export enum DSRRequestType {
  AccessRequest = 'access',
  Rectification = 'rectification',
  Erasure = 'erasure',
  Restriction = 'restriction',
  Portability = 'portability',
  Objection = 'objection',
  AutomatedDecision = 'automatedDecision'
}

/**
 * Data Subject Right Request Status
 */
export enum DSRRequestStatus {
  New = 'new',
  InProgress = 'inProgress',
  PendingVerification = 'pendingVerification',
  IdentityVerified = 'identityVerified',
  PendingApproval = 'pendingApproval',
  InfoGathering = 'infoGathering',
  ProcessingRequest = 'processingRequest',
  Complete = 'complete',
  Denied = 'denied',
  Expired = 'expired'
}

/**
 * Data System Reference
 * References a data system that stores personal data
 */
export interface DataSystemReference {
  id: string;
  name: string;
  type: 'database' | 'fileSystem' | 'thirdParty' | 'application' | 'other';
  location?: string;
  category?: string;
  description?: string;
  dataRetentionPeriod?: number;
  containsSensitiveData?: boolean;
}

/**
 * Data Subject Rights Request
 */
export interface DSRRequest {
  id: string;
  requestType: DSRRequestType;
  status: DSRRequestStatus;
  requestDate: string;
  dueDate: string;
  completedDate?: string;
  dataSubject: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    identityVerified: boolean;
    identityVerificationMethod?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  affectedSystems: DataSystemReference[];
  notes?: string[];
  history: {
    timestamp: string;
    action: string;
    user: string;
    details?: string;
  }[];
  documents?: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    url: string;
  }[];
}

/**
 * Data Breach Types
 */
export enum DataBreachSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export enum DataBreachStatus {
  New = 'new',
  Investigating = 'investigating',
  ContainmentInProgress = 'containmentInProgress',
  Contained = 'contained',
  Remediated = 'remediated',
  Reported = 'reported',
  Closed = 'closed'
}

/**
 * Data Breach Record
 */
export interface DataBreach {
  id: string;
  title: string;
  description: string;
  severity: DataBreachSeverity;
  status: DataBreachStatus;
  discoveryDate: string;
  breachDate?: string;
  reportDate?: string;
  reportedToAuthorities: boolean;
  affectedDataSubjects: number;
  affectedDataCategories: string[];
  affectedSystems: DataSystemReference[];
  containmentMeasures?: string[];
  remediationSteps?: string[];
  responsibleParty?: string;
  riskAssessment?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    potentialImpact: string;
    likelihoodOfHarm: string;
  };
  notifications?: {
    dataSubjectsNotified: boolean;
    notificationDate?: string;
    notificationMethod?: string;
    notificationTemplate?: string;
  };
  documents?: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    url: string;
  }[];
}

/**
 * Data Mapping Inventory Types
 */
export interface DataMapping {
  id: string;
  dataCategory: string;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legalObligation' | 'vitalInterests' | 'publicInterest' | 'legitimateInterests';
  dataSubjectCategory: string;
  retentionPeriod: number; // in months
  retentionJustification: string;
  systemsUsed: DataSystemReference[];
  dataTransfers?: {
    recipient: string;
    country: string;
    adequacyMechanism?: string;
    transferDetails?: string;
  }[];
  sensitiveData: boolean;
  dpia?: {
    required: boolean;
    completed?: boolean;
    date?: string;
    outcome?: string;
    url?: string;
  };
}
