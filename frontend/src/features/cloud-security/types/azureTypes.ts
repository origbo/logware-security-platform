/**
 * Azure Security Types
 *
 * Type definitions for Azure security services and findings
 */

/**
 * Azure Resource Group
 */
export interface AzureResourceGroup {
  id: string;
  name: string;
  location: string;
  tags?: Record<string, string>;
}

/**
 * Azure Location/Region
 */
export enum AzureLocation {
  EAST_US = "eastus",
  EAST_US_2 = "eastus2",
  SOUTH_CENTRAL_US = "southcentralus",
  WEST_US_2 = "westus2",
  WEST_US_3 = "westus3",
  WEST_CENTRAL_US = "westcentralus",
  CENTRAL_US = "centralus",
  NORTH_CENTRAL_US = "northcentralus",
  WEST_US = "westus",
  WEST_EUROPE = "westeurope",
  NORTH_EUROPE = "northeurope",
  UK_SOUTH = "uksouth",
  UK_WEST = "ukwest",
  FRANCE_CENTRAL = "francecentral",
  FRANCE_SOUTH = "francesouth",
  SWITZERLAND_NORTH = "switzerlandnorth",
  SWITZERLAND_WEST = "switzerlandwest",
  GERMANY_WEST_CENTRAL = "germanywestcentral",
  NORWAY_EAST = "norwayeast",
  NORWAY_WEST = "norwaywest",
  BRAZIL_SOUTH = "brazilsouth",
  BRAZIL_SOUTHEAST = "brazilsoutheast",
  ASIA_PACIFIC = "asiapacific",
  AUSTRALIA_EAST = "australiaeast",
  AUSTRALIA_SOUTHEAST = "australiasoutheast",
  AUSTRALIA_CENTRAL = "australiacentral",
  AUSTRALIA_CENTRAL_2 = "australiacentral2",
  JAPAN_EAST = "japaneast",
  JAPAN_WEST = "japanwest",
  KOREA_CENTRAL = "koreacentral",
  KOREA_SOUTH = "koreasouth",
  SOUTH_INDIA = "southindia",
  CENTRAL_INDIA = "centralindia",
  WEST_INDIA = "westindia",
  CANADA_CENTRAL = "canadacentral",
  CANADA_EAST = "canadaeast",
  UAE_CENTRAL = "uaecentral",
  UAE_NORTH = "uaenorth",
  SOUTH_AFRICA_NORTH = "southafricanorth",
  SOUTH_AFRICA_WEST = "southafricawest",
}

/**
 * Azure Resource Type
 */
export enum AzureResourceType {
  VIRTUAL_MACHINE = "Microsoft.Compute/virtualMachines",
  VIRTUAL_NETWORK = "Microsoft.Network/virtualNetworks",
  NETWORK_SECURITY_GROUP = "Microsoft.Network/networkSecurityGroups",
  STORAGE_ACCOUNT = "Microsoft.Storage/storageAccounts",
  APP_SERVICE = "Microsoft.Web/sites",
  SQL_SERVER = "Microsoft.Sql/servers",
  SQL_DATABASE = "Microsoft.Sql/servers/databases",
  KEY_VAULT = "Microsoft.KeyVault/vaults",
  COSMOS_DB = "Microsoft.DocumentDB/databaseAccounts",
  AKS_CLUSTER = "Microsoft.ContainerService/managedClusters",
  AZURE_FUNCTION = "Microsoft.Web/sites/functions",
  APP_GATEWAY = "Microsoft.Network/applicationGateways",
  LOG_ANALYTICS = "Microsoft.OperationalInsights/workspaces",
  UNKNOWN = "Unknown",
}

/**
 * Azure Assessment Status
 */
export enum AzureAssessmentStatus {
  HEALTHY = "Healthy",
  UNHEALTHY = "Unhealthy",
  NOT_APPLICABLE = "NotApplicable",
}

/**
 * Azure Finding Severity
 */
export enum AzureFindingSeverity {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
  INFORMATIONAL = "Informational",
}

/**
 * Azure Tenant
 */
export interface AzureTenant {
  id: string;
  name: string;
  defaultDomain: string;
  isActive: boolean;
  lastScanned?: string;
  subscriptions?: AzureSubscription[];
}

/**
 * Azure Subscription
 */
export interface AzureSubscription {
  id: string;
  displayName: string;
  state: "Enabled" | "Disabled" | "Deleted" | "PastDue" | "Warned";
  tenantId: string;
  resourceGroups?: AzureResourceGroup[];
  isActive: boolean;
  lastScanned?: string;
}

/**
 * Azure Resource
 */
export interface AzureResource {
  id: string;
  name: string;
  type: AzureResourceType;
  location: AzureLocation;
  resourceGroup: string;
  subscriptionId: string;
  tenantId: string;
  tags?: Record<string, string>;
  properties?: Record<string, any>;
  createdTime?: string;
  changedTime?: string;
}

/**
 * Azure Security Assessment
 */
export interface AzureSecurityAssessment {
  id: string;
  name: string;
  displayName: string;
  description: string;
  resourceId: string;
  status: AzureAssessmentStatus;
  severity: AzureFindingSeverity;
  additionalData?: Record<string, any>;
  timeGenerated: string;
}

/**
 * Azure Security Alert
 */
export interface AzureSecurityAlert {
  id: string;
  alertDisplayName: string;
  alertType: string;
  description: string;
  severity: AzureFindingSeverity;
  status: "Active" | "Resolved" | "Dismissed";
  startTimeUtc: string;
  endTimeUtc?: string;
  resourceId?: string;
  resourceType?: AzureResourceType;
  resourceName?: string;
  subscriptionId: string;
  entities?: Array<{
    type: string;
    name?: string;
    address?: string;
    hostName?: string;
    id?: string;
  }>;
  extendedProperties?: Record<string, any>;
}

/**
 * Azure AD User
 */
export interface AzureAdUser {
  id: string;
  userPrincipalName: string;
  displayName: string;
  isActive: boolean;
  isGuest: boolean;
  createdDateTime: string;
  lastSignInDateTime?: string;
  mfaEnabled?: boolean;
  roles?: string[];
}

/**
 * Azure Role Assignment
 */
export interface AzureRoleAssignment {
  id: string;
  roleDefinitionName: string;
  roleDefinitionId: string;
  principalId: string;
  principalType: "User" | "Group" | "ServicePrincipal";
  principalName?: string;
  scope: string;
}

/**
 * Azure Storage Account Security Info
 */
export interface AzureStorageSecurityInfo {
  id: string;
  name: string;
  isHttpsTrafficOnly: boolean;
  allowBlobPublicAccess: boolean;
  minimumTlsVersion?: string;
  supportsHttpsTrafficOnly: boolean;
  networkRuleSet?: {
    bypass: string;
    defaultAction: "Allow" | "Deny";
    ipRules: Array<{
      action: string;
      value: string;
    }>;
  };
  encryption?: {
    keySource: "Microsoft.Storage" | "Microsoft.Keyvault";
    keyVaultProperties?: {
      keyName: string;
      keyVersion: string;
      keyVaultUri: string;
    };
  };
  issues?: string[];
}

/**
 * Azure Virtual Machine Security Info
 */
export interface AzureVMSecurityInfo {
  id: string;
  name: string;
  osType: "Windows" | "Linux";
  osVersion?: string;
  vmSize: string;
  availabilityZone?: string;
  powerState?: "running" | "deallocated" | "stopped";
  diskEncryption?: boolean;
  networkSecurityGroups?: Array<{
    id: string;
    name: string;
    securityRules: Array<{
      name: string;
      protocol: string;
      sourceAddressPrefix: string;
      sourcePortRange: string;
      destinationAddressPrefix: string;
      destinationPortRange: string;
      access: "Allow" | "Deny";
      direction: "Inbound" | "Outbound";
    }>;
  }>;
  updateStatus?: {
    lastAssessmentDate?: string;
    needsReboot: boolean;
    pendingUpdates: number;
  };
  vulnerabilities?: {
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  issues?: string[];
}

/**
 * Azure Key Vault Security Info
 */
export interface AzureKeyVaultSecurityInfo {
  id: string;
  name: string;
  enableSoftDelete: boolean;
  enablePurgeProtection?: boolean;
  enabledForDeployment?: boolean;
  enabledForDiskEncryption?: boolean;
  enabledForTemplateDeployment?: boolean;
  networkAcls?: {
    bypass: string;
    defaultAction: "Allow" | "Deny";
    ipRules: string[];
    virtualNetworkRules: string[];
  };
  issues?: string[];
}

/**
 * Azure AKS Cluster Security Info
 */
export interface AzureAKSSecurityInfo {
  id: string;
  name: string;
  kubernetesVersion: string;
  nodeResourceGroup: string;
  enableRBAC: boolean;
  networkProfile?: {
    networkPlugin: string;
    networkPolicy?: string;
    podCidr?: string;
    serviceCidr?: string;
    dockerBridgeCidr?: string;
  };
  apiServerAccessProfile?: {
    enablePrivateCluster?: boolean;
    authorizedIpRanges?: string[];
  };
  addonProfiles?: {
    httpApplicationRouting?: {
      enabled: boolean;
    };
    omsagent?: {
      enabled: boolean;
    };
    aciConnectorLinux?: {
      enabled: boolean;
    };
    azurepolicy?: {
      enabled: boolean;
    };
  };
  issues?: string[];
}

/**
 * Azure Activity Log Event
 */
export interface AzureActivityLogEvent {
  id: string;
  caller: string;
  operationName: string;
  status: "Succeeded" | "Failed" | "Started" | "Accepted" | "Rejected";
  resourceType?: string;
  resourceId?: string;
  resourceGroup?: string;
  subscriptionId: string;
  eventTimestamp: string;
  category:
    | "Administrative"
    | "ServiceHealth"
    | "Alert"
    | "Autoscale"
    | "Security"
    | "Policy"
    | "Recommendation";
  level: "Critical" | "Error" | "Warning" | "Informational" | "Verbose";
  properties?: Record<string, any>;
  correlationId?: string;
  isSuspicious?: boolean;
}

/**
 * Azure Defender for Cloud Status
 */
export interface AzureDefenderStatus {
  subscriptionId: string;
  pricingTiers: Record<
    string,
    {
      status: "Enabled" | "Disabled";
      tier: "Free" | "Standard";
    }
  >;
  securityContacts?: {
    emails: string[];
    phone?: string;
    alertNotifications: boolean;
    alertsToAdmins: boolean;
  };
  autoProvisioning?: {
    logAnalytics: boolean;
    securityAgent: boolean;
  };
  score?: number;
}

/**
 * Azure Security Summary
 */
export interface AzureSecuritySummary {
  tenantId: string;
  subscriptionCount: number;
  resourceCount: number;
  assessments: {
    total: number;
    byStatus: Record<AzureAssessmentStatus, number>;
    bySeverity: Record<AzureFindingSeverity, number>;
  };
  alerts: {
    total: number;
    byStatus: Record<string, number>;
    bySeverity: Record<AzureFindingSeverity, number>;
  };
  securityScore: number;
  complianceStatus: Record<
    string,
    {
      status: "Compliant" | "Non-Compliant" | "Not-Applicable";
      standardName: string;
    }
  >;
}
