/**
 * GDPR Compliance Types
 *
 * Type definitions for GDPR compliance functionality in the Logware Security Platform
 */

// Data Category - types of personal data
export enum DataCategory {
  BASIC_IDENTIFIERS = "BASIC_IDENTIFIERS", // name, ID numbers, etc.
  CONTACT_INFO = "CONTACT_INFO", // email, address, phone
  DEMOGRAPHIC = "DEMOGRAPHIC", // age, gender, etc.
  FINANCIAL = "FINANCIAL", // payment info, account numbers
  HEALTH = "HEALTH", // medical records, health information
  BIOMETRIC = "BIOMETRIC", // fingerprints, facial recognition
  LOCATION = "LOCATION", // GPS data, IP address
  COMMUNICATION = "COMMUNICATION", // messages, emails
  BEHAVIORAL = "BEHAVIORAL", // browsing history, purchase history
  SPECIAL_CATEGORY = "SPECIAL_CATEGORY", // race, ethnicity, political opinions, etc.
  CHILDREN = "CHILDREN", // data about minors
  OTHER = "OTHER",
}

// Legal Basis for processing
export enum ProcessingLegalBasis {
  CONSENT = "CONSENT",
  CONTRACT = "CONTRACT",
  LEGAL_OBLIGATION = "LEGAL_OBLIGATION",
  VITAL_INTERESTS = "VITAL_INTERESTS",
  PUBLIC_INTEREST = "PUBLIC_INTEREST",
  LEGITIMATE_INTERESTS = "LEGITIMATE_INTERESTS",
}

// Data Retention Policy
export interface DataRetentionPolicy {
  id: string;
  name: string;
  description: string;
  retentionPeriod: number; // in days
  automaticDeletion: boolean;
  legalJustification?: string;
  appliesTo: DataCategory[];
}

// Personal Data Processing Activity
export interface DataProcessingActivity {
  id: string;
  name: string;
  description: string;
  dataCategories: DataCategory[];
  purpose: string;
  legalBasis: ProcessingLegalBasis;
  dataSubjects: string[];
  retentionPolicy: string; // references DataRetentionPolicy.id
  internalSystems: DataSystemReference[];
  externalRecipients: DataRecipient[];
  crossBorderTransfers?: CrossBorderTransfer[];
  createdAt: string;
  updatedAt: string;
  assessmentStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  responsibleDPO?: string;
}

// Records of Processing Activities (ROPA)
export interface ROPA {
  id: string;
  activities: DataProcessingActivity[];
  company: string;
  dpo: string;
  lastUpdated: string;
  version: string;
  status: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "ARCHIVED";
}

// System storing personal data
export interface DataSystemReference {
  id: string;
  name: string;
  type:
    | "DATABASE"
    | "FILE_SYSTEM"
    | "APPLICATION"
    | "CLOUD_STORAGE"
    | "THIRD_PARTY"
    | "OTHER";
  location: string;
  securityMeasures: string[];
  dataSubjectAccessCapable: boolean;
  dataDeletionCapable: boolean;
  dataExportCapable: boolean;
  businessOwner: string;
  technicalOwner: string;
}

// External recipient of personal data
export interface DataRecipient {
  id: string;
  name: string;
  type: "PROCESSOR" | "CONTROLLER" | "JOINT_CONTROLLER" | "THIRD_PARTY";
  location: string;
  contractInPlace: boolean;
  contractExpiryDate?: string;
  dataProtectionAgreement: boolean;
  contacts: {
    name: string;
    role: string;
    email: string;
    phone?: string;
  }[];
}

// Cross-border data transfer
export interface CrossBorderTransfer {
  id: string;
  destination: string;
  transferMechanism:
    | "ADEQUACY_DECISION"
    | "APPROPRIATE_SAFEGUARDS"
    | "SCCs"
    | "BCRs"
    | "DEROGATION";
  details: string;
  documentationLink?: string;
}

// Data Subject Rights Request
export enum DSRRequestType {
  ACCESS = "ACCESS", // Right to access
  RECTIFICATION = "RECTIFICATION", // Right to rectification
  ERASURE = "ERASURE", // Right to be forgotten
  RESTRICT = "RESTRICT", // Right to restrict processing
  PORTABILITY = "PORTABILITY", // Right to data portability
  OBJECT = "OBJECT", // Right to object
  AUTOMATED_DECISION = "AUTOMATED_DECISION", // Rights related to automated decision making
  WITHDRAW_CONSENT = "WITHDRAW_CONSENT", // Right to withdraw consent
}

export enum DSRRequestStatus {
  RECEIVED = "RECEIVED",
  IDENTITY_VERIFICATION = "IDENTITY_VERIFICATION",
  IN_PROGRESS = "IN_PROGRESS",
  AWAITING_APPROVAL = "AWAITING_APPROVAL",
  COMPLETED = "COMPLETED",
  DENIED = "DENIED",
  PARTIAL = "PARTIAL",
}

// Data Subject Rights Request
export interface DSRRequest {
  id: string;
  requestType: DSRRequestType;
  status: DSRRequestStatus;
  dataSubject: {
    name: string;
    email: string;
    identificationVerified: boolean;
    verificationMethod?: string;
  };
  receivedDate: string;
  dueDate: string;
  completedDate?: string;
  assignedTo?: string;
  affectedSystems: DataSystemReference[];
  actions: {
    timestamp: string;
    action: string;
    performedBy: string;
    notes?: string;
  }[];
  denialReason?: string;
  requestDetails: string;
  responseDetails?: string;
  documents?: {
    name: string;
    type: string;
    url: string;
    uploadedBy: string;
    uploadedDate: string;
  }[];
}

// Data Breach
export enum BreachSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum BreachStatus {
  DETECTED = "DETECTED",
  INVESTIGATING = "INVESTIGATING",
  CONTAINED = "CONTAINED",
  REMEDIATED = "REMEDIATED",
  REPORTED = "REPORTED",
  CLOSED = "CLOSED",
}

// Data Breach Notification
export interface DataBreach {
  id: string;
  title: string;
  description: string;
  detectedDate: string;
  detectedBy: string;
  severity: BreachSeverity;
  status: BreachStatus;
  affectedDataCategories: DataCategory[];
  affectedDataSubjects: string;
  estimatedSubjectsCount: number;
  affectedSystems: DataSystemReference[];
  natureOfBreach: string;
  potentialConsequences: string;
  containmentMeasures: string;
  remedialActions: string;
  dpaNotificationRequired: boolean;
  dpaNotificationDate?: string;
  dpaNotificationDetails?: string;
  dataSubjectNotificationRequired: boolean;
  dataSubjectNotificationDate?: string;
  dataSubjectNotificationMethod?: string;
  rootCause?: string;
  timeline: {
    timestamp: string;
    event: string;
    performedBy?: string;
    notes?: string;
  }[];
  assignedTo?: string;
  documents?: {
    name: string;
    type: string;
    url: string;
    uploadedBy: string;
    uploadedDate: string;
  }[];
}

// Consent Record
export interface ConsentRecord {
  id: string;
  dataSubject: {
    id: string;
    identifier: string; // could be email, username, etc.
    identifierType: "EMAIL" | "USERNAME" | "CUSTOMER_ID" | "OTHER";
  };
  consentGiven: boolean;
  consentDate: string;
  expiryDate?: string;
  purposes: string[];
  version: string;
  collectionMethod:
    | "WEBSITE_FORM"
    | "MOBILE_APP"
    | "PAPER_FORM"
    | "PHONE"
    | "EMAIL"
    | "OTHER";
  collectionDetails?: string;
  withdrawalDate?: string;
  consentText: string;
  consentProof?: string; // URL to screenshot or document
  ipAddress?: string;
  location?: string;
  lastUpdated: string;
}

// DPIA/PIA Risk Assessment
export interface PrivacyImpactAssessment {
  id: string;
  name: string;
  description: string;
  processing: DataProcessingActivity;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "APPROVED" | "REJECTED";
  dpoReview?: {
    reviewedBy: string;
    reviewedDate: string;
    approved: boolean;
    comments: string;
  };
  startDate: string;
  completionDate?: string;
  conductedBy: string;
  necessityProportionalityAssessment: string;
  risks: {
    id: string;
    description: string;
    likelihood: "LOW" | "MEDIUM" | "HIGH";
    impact: "LOW" | "MEDIUM" | "HIGH";
    overallRisk: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
    mitigationMeasures: string;
    residualRisk: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  }[];
  consultationRequired: boolean;
  dpaConsultationDetails?: string;
  approvalDate?: string;
  approvedBy?: string;
  reviewDate?: string;
}
