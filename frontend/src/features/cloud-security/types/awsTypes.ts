/**
 * AWS Security Types
 *
 * Type definitions for AWS security services and findings
 */

/**
 * AWS Regions
 */
export enum AwsRegion {
  US_EAST_1 = "us-east-1",
  US_EAST_2 = "us-east-2",
  US_WEST_1 = "us-west-1",
  US_WEST_2 = "us-west-2",
  AF_SOUTH_1 = "af-south-1",
  AP_EAST_1 = "ap-east-1",
  AP_SOUTH_1 = "ap-south-1",
  AP_NORTHEAST_1 = "ap-northeast-1",
  AP_NORTHEAST_2 = "ap-northeast-2",
  AP_NORTHEAST_3 = "ap-northeast-3",
  AP_SOUTHEAST_1 = "ap-southeast-1",
  AP_SOUTHEAST_2 = "ap-southeast-2",
  CA_CENTRAL_1 = "ca-central-1",
  EU_CENTRAL_1 = "eu-central-1",
  EU_WEST_1 = "eu-west-1",
  EU_WEST_2 = "eu-west-2",
  EU_WEST_3 = "eu-west-3",
  EU_NORTH_1 = "eu-north-1",
  EU_SOUTH_1 = "eu-south-1",
  ME_SOUTH_1 = "me-south-1",
  SA_EAST_1 = "sa-east-1",
}

/**
 * AWS Resource Type
 */
export enum AwsResourceType {
  EC2_INSTANCE = "AWS::EC2::Instance",
  IAM_USER = "AWS::IAM::User",
  IAM_ROLE = "AWS::IAM::Role",
  IAM_POLICY = "AWS::IAM::Policy",
  S3_BUCKET = "AWS::S3::Bucket",
  S3_OBJECT = "AWS::S3::Object",
  EKS_CLUSTER = "AWS::EKS::Cluster",
  LAMBDA_FUNCTION = "AWS::Lambda::Function",
  RDS_INSTANCE = "AWS::RDS::DBInstance",
  DYNAMODB_TABLE = "AWS::DynamoDB::Table",
  CLOUDTRAIL_TRAIL = "AWS::CloudTrail::Trail",
  VPC = "AWS::EC2::VPC",
  SECURITY_GROUP = "AWS::EC2::SecurityGroup",
  KMS_KEY = "AWS::KMS::Key",
  SNS_TOPIC = "AWS::SNS::Topic",
  SQS_QUEUE = "AWS::SQS::Queue",
  CLOUDFRONT_DISTRIBUTION = "AWS::CloudFront::Distribution",
  UNKNOWN = "Unknown",
}

/**
 * Finding Severity
 */
export enum FindingSeverity {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  INFORMATIONAL = "INFORMATIONAL",
  UNKNOWN = "UNKNOWN",
}

/**
 * Finding Status
 */
export enum FindingStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  RESOLVED = "RESOLVED",
  SUPPRESSED = "SUPPRESSED",
}

/**
 * Finding Source
 */
export enum FindingSource {
  SECURITY_HUB = "SECURITY_HUB",
  GUARD_DUTY = "GUARD_DUTY",
  INSPECTOR = "INSPECTOR",
  CONFIG = "CONFIG",
  IAM_ACCESS_ANALYZER = "IAM_ACCESS_ANALYZER",
  TRUSTED_ADVISOR = "TRUSTED_ADVISOR",
  MANUAL = "MANUAL",
}

/**
 * AWS Account
 */
export interface AwsAccount {
  id: string;
  name: string;
  regions: AwsRegion[];
  isActive: boolean;
  lastScanned?: string;
}

/**
 * AWS Resource
 */
export interface AwsResource {
  id: string;
  arn: string;
  type: AwsResourceType;
  region: AwsRegion;
  accountId: string;
  name?: string;
  tags?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

/**
 * AWS Security Finding
 */
export interface AwsSecurityFinding {
  id: string;
  title: string;
  description: string;
  source: FindingSource;
  severity: FindingSeverity;
  resources: AwsResource[];
  status: FindingStatus;
  region: AwsRegion;
  accountId: string;
  firstObservedAt: string;
  lastObservedAt: string;
  remediation?: {
    recommendation: string;
    url?: string;
  };
  complianceStatus?: Record<string, boolean>;
  vulnerabilityData?: {
    cveId?: string;
    cvss?: number;
    vulnerablePackages?: string[];
  };
  originalFindingId?: string;
  originalFindingJson?: string;
}

/**
 * AWS IAM Principal
 */
export interface AwsIamPrincipal {
  id: string;
  arn: string;
  name: string;
  type: "USER" | "ROLE" | "GROUP";
  createdAt: string;
  lastActivity?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

/**
 * AWS IAM Permission
 */
export interface AwsIamPermission {
  action: string;
  resource: string;
  condition?: Record<string, any>;
  effect: "Allow" | "Deny";
}

/**
 * AWS IAM Policy
 */
export interface AwsIamPolicy {
  id: string;
  arn: string;
  name: string;
  type: "MANAGED" | "INLINE" | "CUSTOM";
  permissions: AwsIamPermission[];
  attachedTo?: AwsIamPrincipal[];
  isAwsManaged: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * AWS S3 Bucket Security Info
 */
export interface AwsS3BucketSecurity {
  bucketName: string;
  isPublic: boolean;
  hasPublicAcls: boolean;
  serverSideEncryption?: {
    enabled: boolean;
    type?: string;
  };
  versioning?: boolean;
  logging?: boolean;
  lifecycleRules?: boolean;
  blockPublicAccess?: boolean;
  issues?: string[];
}

/**
 * AWS CloudTrail Event
 */
export interface AwsCloudTrailEvent {
  id: string;
  eventTime: string;
  eventSource: string;
  eventName: string;
  awsRegion: AwsRegion;
  sourceIPAddress: string;
  userIdentity: {
    type: string;
    principalId: string;
    arn: string;
    accountId: string;
    userName?: string;
  };
  resources?: Array<{
    resourceType: string;
    resourceName: string;
  }>;
  errorCode?: string;
  errorMessage?: string;
  readOnly: boolean;
  requestParameters?: Record<string, any>;
  responseElements?: Record<string, any>;
  isSuspicious?: boolean;
}

/**
 * AWS EC2 Security Info
 */
export interface AwsEc2SecurityInfo {
  instanceId: string;
  securityGroups: Array<{
    groupId: string;
    groupName: string;
    inboundRules: Array<{
      protocol: string;
      port: string;
      source: string;
      isPublic: boolean;
    }>;
  }>;
  patchStatus?: {
    patched: boolean;
    pendingPatches?: number;
  };
  encryptedVolumes: boolean;
  imdsv2Required?: boolean;
  issues?: string[];
}

/**
 * AWS EKS Security Info
 */
export interface AwsEksSecurityInfo {
  clusterName: string;
  version: string;
  endpointPublicAccess: boolean;
  endpointPrivateAccess: boolean;
  encryptionEnabled: boolean;
  loggingEnabled: boolean;
  networkPolicy?: boolean;
  podSecurityPolicy?: boolean;
  issues?: string[];
}

/**
 * AWS Lambda Security Info
 */
export interface AwsLambdaSecurityInfo {
  functionName: string;
  runtime: string;
  hasVpcConfig: boolean;
  environmentVariablesEncrypted: boolean;
  permissionsBoundary?: boolean;
  resourceBasedPolicy?: boolean;
  issues?: string[];
}

/**
 * AWS GuardDuty Finding Type
 */
export enum AwsGuardDutyFindingType {
  BACKDOOR = "Backdoor",
  BEHAVIOR = "Behavior",
  CRYPTOCURRENCY = "CryptoCurrency",
  PENTEST = "PenTest",
  PERSISTENCE = "Persistence",
  POLICY = "Policy",
  PRIVILEGEESCALATION = "PrivilegeEscalation",
  RECON = "Recon",
  RESOURCECONSUMPTION = "ResourceConsumption",
  STEALTH = "Stealth",
  TROJAN = "Trojan",
  UNAUTHORIZEDACCESS = "UnauthorizedAccess",
}

/**
 * AWS GuardDuty Finding
 */
export interface AwsGuardDutyFinding extends AwsSecurityFinding {
  findingType: AwsGuardDutyFindingType;
  threatDetectionName: string;
  actor?: string;
  action?: string;
  resourceRole?: string;
  serviceName?: string;
  count?: number;
}

/**
 * AWS Security Hub Finding
 */
export interface AwsSecurityHubFinding extends AwsSecurityFinding {
  productArn: string;
  standardsControlArn?: string;
  complianceRelatedFindings?: Array<{
    standardIdentifier: string;
    standardsControlIdentifier: string;
    requirementId: string;
    description: string;
  }>;
}

/**
 * AWS Security Group Analysis
 */
export interface AwsSecurityGroupAnalysis {
  groupId: string;
  groupName: string;
  vpcId: string;
  riskLevel: FindingSeverity;
  exposedPorts: number;
  publicAccess: boolean;
  inboundRules: number;
  outboundRules: number;
  issues?: string[];
}

/**
 * AWS IAM Analysis Result
 */
export interface AwsIamAnalysisResult {
  accountId: string;
  unusedCredentials: number;
  passwordPolicy: {
    exists: boolean;
    minimumLength?: number;
    requireSymbols?: boolean;
    requireNumbers?: boolean;
    requireUppercaseCharacters?: boolean;
    requireLowercaseCharacters?: boolean;
    allowUsersToChangePassword?: boolean;
    expirePasswords?: boolean;
    maxPasswordAge?: number;
    passwordReusePrevention?: number;
  };
  privilegedUsers: number;
  usersWithoutMfa: number;
  accessKeysRotation: {
    oldKeys: number;
    totalKeys: number;
  };
  rootAccountActivity?: {
    lastUsed?: string;
    mfaEnabled: boolean;
    accessKeysExist: boolean;
  };
  scoreOutOf100: number;
  issues: string[];
}

/**
 * AWS Security Summary
 */
export interface AwsSecuritySummary {
  accountId: string;
  findings: {
    total: number;
    byStatus: Record<FindingStatus, number>;
    bySeverity: Record<FindingSeverity, number>;
    bySource: Record<FindingSource, number>;
  };
  resources: {
    total: number;
    byType: Record<string, number>;
  };
  complianceStatus: Record<
    string,
    {
      status: "COMPLIANT" | "NON_COMPLIANT" | "NOT_APPLICABLE";
      controlsPassed: number;
      controlsFailed: number;
      controlsTotal: number;
    }
  >;
  securityScore: number;
}
