/**
 * GCP Security Types
 *
 * Type definitions for Google Cloud Platform security services and findings
 */

/**
 * GCP Region
 */
export enum GcpRegion {
  US_CENTRAL1 = "us-central1",
  US_EAST1 = "us-east1",
  US_EAST4 = "us-east4",
  US_WEST1 = "us-west1",
  US_WEST2 = "us-west2",
  US_WEST3 = "us-west3",
  US_WEST4 = "us-west4",
  NORTHAMERICA_NORTHEAST1 = "northamerica-northeast1",
  SOUTHAMERICA_EAST1 = "southamerica-east1",
  EUROPE_NORTH1 = "europe-north1",
  EUROPE_WEST1 = "europe-west1",
  EUROPE_WEST2 = "europe-west2",
  EUROPE_WEST3 = "europe-west3",
  EUROPE_WEST4 = "europe-west4",
  EUROPE_WEST6 = "europe-west6",
  ASIA_EAST1 = "asia-east1",
  ASIA_EAST2 = "asia-east2",
  ASIA_NORTHEAST1 = "asia-northeast1",
  ASIA_NORTHEAST2 = "asia-northeast2",
  ASIA_NORTHEAST3 = "asia-northeast3",
  ASIA_SOUTH1 = "asia-south1",
  ASIA_SOUTHEAST1 = "asia-southeast1",
  ASIA_SOUTHEAST2 = "asia-southeast2",
  AUSTRALIA_SOUTHEAST1 = "australia-southeast1",
  GLOBAL = "global",
}

/**
 * GCP Resource Type
 */
export enum GcpResourceType {
  COMPUTE_INSTANCE = "compute.googleapis.com/Instance",
  COMPUTE_DISK = "compute.googleapis.com/Disk",
  COMPUTE_FIREWALL = "compute.googleapis.com/Firewall",
  COMPUTE_NETWORK = "compute.googleapis.com/Network",
  COMPUTE_SUBNETWORK = "compute.googleapis.com/Subnetwork",
  STORAGE_BUCKET = "storage.googleapis.com/Bucket",
  STORAGE_OBJECT = "storage.googleapis.com/Object",
  CLOUDSQL_INSTANCE = "sqladmin.googleapis.com/Instance",
  BIGQUERY_DATASET = "bigquery.googleapis.com/Dataset",
  BIGQUERY_TABLE = "bigquery.googleapis.com/Table",
  GKE_CLUSTER = "container.googleapis.com/Cluster",
  GKE_NODEPOOLS = "container.googleapis.com/NodePool",
  KMS_KEYRING = "cloudkms.googleapis.com/KeyRing",
  KMS_CRYPTOKEY = "cloudkms.googleapis.com/CryptoKey",
  IAM_SERVICEACCOUNT = "iam.googleapis.com/ServiceAccount",
  IAM_ROLE = "iam.googleapis.com/Role",
  PUB_SUB_TOPIC = "pubsub.googleapis.com/Topic",
  PUB_SUB_SUBSCRIPTION = "pubsub.googleapis.com/Subscription",
  UNKNOWN = "Unknown",
}

/**
 * Finding Severity
 */
export enum GcpFindingSeverity {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  UNDEFINED = "UNDEFINED",
}

/**
 * Finding State
 */
export enum GcpFindingState {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  MUTED = "MUTED",
}

/**
 * Finding Category
 */
export enum GcpFindingCategory {
  VULNERABILITY = "VULNERABILITY",
  MISCONFIGURATION = "MISCONFIGURATION",
  MALWARE = "MALWARE",
  THREAT = "THREAT",
  DENIAL_OF_SERVICE = "DENIAL_OF_SERVICE",
  ACCESS_CONTROL = "ACCESS_CONTROL",
  DATA_EXFILTRATION = "DATA_EXFILTRATION",
  PERSISTENCE = "PERSISTENCE",
  BACKDOOR = "BACKDOOR",
  UNKNOWN_CATEGORY = "UNKNOWN_CATEGORY",
}

/**
 * Asset Type
 */
export enum GcpAssetType {
  RESOURCE = "RESOURCE",
  IAM_POLICY = "IAM_POLICY",
  ORG_POLICY = "ORG_POLICY",
}

/**
 * GCP Organization
 */
export interface GcpOrganization {
  id: string;
  displayName: string;
  createdAt: string;
  lifecycleState: "ACTIVE" | "DELETE_REQUESTED";
  isActive: boolean;
  lastScanned?: string;
}

/**
 * GCP Project
 */
export interface GcpProject {
  id: string;
  number: string;
  name: string;
  organizationId?: string;
  folderId?: string;
  labels?: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  lifecycleState: "ACTIVE" | "DELETE_REQUESTED" | "DELETE_IN_PROGRESS";
  lastScanned?: string;
}

/**
 * GCP Resource
 */
export interface GcpResource {
  id: string;
  selfLink?: string;
  name: string;
  displayName?: string;
  type: GcpResourceType;
  projectId: string;
  location?: GcpRegion | string;
  createdAt?: string;
  updatedAt?: string;
  labels?: Record<string, string>;
  metadata?: Record<string, any>;
}

/**
 * GCP Security Command Center Finding
 */
export interface GcpSecurityFinding {
  id: string;
  name: string;
  parentName: string;
  resourceName: string;
  state: GcpFindingState;
  category: string;
  severity: GcpFindingSeverity;
  sourceId: string;
  sourceName: string;
  projectId: string;
  organizationId?: string;
  eventTime: string;
  createTime: string;
  externalUri?: string;
  description?: string;
  securityMarks?: Record<string, string>;
  findingProperties?: Record<string, any>;
  vulnerability?: {
    cve?: string;
    cvss?: number;
  };
}

/**
 * GCP IAM Member
 */
export interface GcpIamMember {
  id: string;
  name?: string;
  type: "user" | "serviceAccount" | "group" | "domain";
  email?: string;
  permissions?: Array<{
    projectId: string;
    role: string;
    resource?: string;
    resourceType?: string;
  }>;
}

/**
 * GCP IAM Policy
 */
export interface GcpIamPolicy {
  version: number;
  etag: string;
  bindings: Array<{
    role: string;
    members: string[];
    condition?: {
      title: string;
      description?: string;
      expression: string;
    };
  }>;
}

/**
 * GCP Role
 */
export interface GcpRole {
  name: string;
  title?: string;
  description?: string;
  includedPermissions: string[];
  stage?: "GA" | "BETA" | "ALPHA" | "DEPRECATED";
  isCustom: boolean;
  createdAt?: string;
  deletedAt?: string;
  isActive: boolean;
}

/**
 * GCP Storage Bucket Security Info
 */
export interface GcpStorageBucketSecurity {
  id: string;
  name: string;
  location: string;
  projectId: string;
  iamConfiguration?: {
    publicAccessPrevention: "inherited" | "enforced";
    uniformBucketLevelAccess: {
      enabled: boolean;
      lockedTime?: string;
    };
  };
  encryption?: {
    defaultKmsKeyName?: string;
  };
  logging?: {
    logBucket?: string;
    logObjectPrefix?: string;
  };
  versioning?: {
    enabled: boolean;
  };
  policy?: GcpIamPolicy;
  issues?: string[];
}

/**
 * GCP Compute Instance Security Info
 */
export interface GcpComputeInstanceSecurity {
  id: string;
  name: string;
  zone: string;
  machineType: string;
  status:
    | "PROVISIONING"
    | "STAGING"
    | "RUNNING"
    | "STOPPING"
    | "SUSPENDED"
    | "TERMINATED";
  osDetails?: {
    osType: "LINUX" | "WINDOWS";
    osVersion?: string;
  };
  serviceAccounts?: Array<{
    email: string;
    scopes: string[];
  }>;
  networkInterfaces?: Array<{
    name: string;
    networkName: string;
    subnetworkName: string;
    accessConfigs?: Array<{
      type: string;
      natIP?: string;
    }>;
  }>;
  disks?: Array<{
    name: string;
    type: string;
    isBootDisk: boolean;
    isEncrypted: boolean;
    kmsKeyName?: string;
  }>;
  shieldedInstanceConfig?: {
    enableSecureBoot: boolean;
    enableVtpm: boolean;
    enableIntegrityMonitoring: boolean;
  };
  confidentialInstanceConfig?: {
    enableConfidentialCompute: boolean;
  };
  issues?: string[];
}

/**
 * GCP GKE Cluster Security Info
 */
export interface GcpGkeClusterSecurity {
  id: string;
  name: string;
  location: string;
  projectId: string;
  currentMasterVersion: string;
  masterAuthorizedNetworks?: {
    enabled: boolean;
    cidrBlocks?: Array<{
      displayName?: string;
      cidrBlock: string;
    }>;
  };
  privateClusterConfig?: {
    enablePrivateNodes: boolean;
    enablePrivateEndpoint: boolean;
    masterIpv4CidrBlock?: string;
  };
  networkPolicy?: {
    enabled: boolean;
    provider?: string;
  };
  masterAuth?: {
    clientCertificateConfig?: {
      issueClientCertificate: boolean;
    };
  };
  shieldedNodes?: {
    enabled: boolean;
  };
  nodePools?: Array<{
    name: string;
    version: string;
    machineType: string;
    diskSizeGb: number;
    serviceAccount?: string;
    securityConfig?: {
      secureBootEnabled: boolean;
      integrityMonitoringEnabled: boolean;
    };
  }>;
  issues?: string[];
}

/**
 * GCP BigQuery Security Info
 */
export interface GcpBigQuerySecurity {
  id: string;
  datasetId: string;
  projectId: string;
  location: string;
  access: Array<{
    role?: string;
    specialGroup?: string;
    userByEmail?: string;
    groupByEmail?: string;
    domain?: string;
    iamMember?: string;
  }>;
  defaultEncryptionConfiguration?: {
    kmsKeyName?: string;
  };
  tables?: Array<{
    id: string;
    tableId: string;
    encryptionConfiguration?: {
      kmsKeyName?: string;
    };
  }>;
  issues?: string[];
}

/**
 * GCP Audit Log Entry
 */
export interface GcpAuditLogEntry {
  id: string;
  insertId: string;
  logName: string;
  timestamp: string;
  severity:
    | "DEFAULT"
    | "DEBUG"
    | "INFO"
    | "NOTICE"
    | "WARNING"
    | "ERROR"
    | "CRITICAL"
    | "ALERT"
    | "EMERGENCY";
  protoPayload: {
    serviceName: string;
    methodName: string;
    resourceName?: string;
    authenticationInfo?: {
      principalEmail?: string;
      principalSubject?: string;
    };
    authorizationInfo?: Array<{
      resource: string;
      permission: string;
      granted: boolean;
    }>;
    requestMetadata?: {
      callerIp?: string;
      callerSuppliedUserAgent?: string;
    };
    serviceData?: Record<string, any>;
    status?: {
      code: number;
      message?: string;
    };
  };
  resource?: {
    type: string;
    labels: Record<string, string>;
  };
  isSuspicious?: boolean;
}

/**
 * GCP IAM Analyzer Result
 */
export interface GcpIamAnalyzerResult {
  projectId: string;
  excessiveRoleBindings: Array<{
    role: string;
    bindings: number;
    recommendedAction: string;
  }>;
  serviceAccountIssues: Array<{
    email: string;
    issues: Array<{
      type:
        | "KEY_ROTATION"
        | "EXCESSIVE_PERMISSIONS"
        | "EXTERNAL_ACCESS"
        | "UNUSED_ACCOUNT";
      description: string;
      severity: GcpFindingSeverity;
    }>;
  }>;
  publiclyAccessibleResources: Array<{
    resourceType: string;
    resourceName: string;
    publicAccessType: string;
  }>;
  privilegedAccounts: number;
  scoreOutOf100: number;
  recommendations: Array<{
    description: string;
    impact: string;
    remediation: string;
    severity: GcpFindingSeverity;
  }>;
}

/**
 * GCP Security Summary
 */
export interface GcpSecuritySummary {
  organizationId?: string;
  projectId: string;
  projectsCount?: number;
  findings: {
    total: number;
    byState: Record<GcpFindingState, number>;
    bySeverity: Record<GcpFindingSeverity, number>;
    byCategory: Partial<Record<GcpFindingCategory, number>>;
  };
  resources: {
    total: number;
    byType: Partial<Record<GcpResourceType, number>>;
  };
  complianceStatus?: Array<{
    standard: string;
    compliantControls: number;
    totalControls: number;
    compliancePercentage: number;
  }>;
  securityScore: number;
}
