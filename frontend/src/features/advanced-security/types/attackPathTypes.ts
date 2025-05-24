/**
 * Attack Path Modeling Types
 *
 * Type definitions for attack path modeling and simulation
 */

export enum AssetType {
  SERVER = "SERVER",
  WORKSTATION = "WORKSTATION",
  ROUTER = "ROUTER",
  FIREWALL = "FIREWALL",
  DATABASE = "DATABASE",
  APPLICATION = "APPLICATION",
  CONTAINER = "CONTAINER",
  STORAGE = "STORAGE",
  IOT_DEVICE = "IOT_DEVICE",
  CLOUD_SERVICE = "CLOUD_SERVICE",
  NETWORK_SEGMENT = "NETWORK_SEGMENT",
  USER = "USER",
  IDENTITY = "IDENTITY",
}

export enum VulnerabilityType {
  NETWORK = "NETWORK",
  APPLICATION = "APPLICATION",
  SYSTEM = "SYSTEM",
  CONFIGURATION = "CONFIGURATION",
  IDENTITY = "IDENTITY",
  PHYSICAL = "PHYSICAL",
  SUPPLY_CHAIN = "SUPPLY_CHAIN",
}

export enum AttackTechnique {
  INITIAL_ACCESS = "INITIAL_ACCESS",
  EXECUTION = "EXECUTION",
  PERSISTENCE = "PERSISTENCE",
  PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION",
  DEFENSE_EVASION = "DEFENSE_EVASION",
  CREDENTIAL_ACCESS = "CREDENTIAL_ACCESS",
  DISCOVERY = "DISCOVERY",
  LATERAL_MOVEMENT = "LATERAL_MOVEMENT",
  COLLECTION = "COLLECTION",
  EXFILTRATION = "EXFILTRATION",
  COMMAND_AND_CONTROL = "COMMAND_AND_CONTROL",
  IMPACT = "IMPACT",
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  description?: string;
  criticality: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  location?: string;
  owner?: string;
  networkZone?: string;
  ipAddresses?: string[];
  tags: string[];
  vulnerabilities: string[]; // vulnerability ids
  controls: string[]; // security control ids
  attributes: Record<string, any>;
  children?: string[]; // child asset ids
  parent?: string; // parent asset id
}

export interface Vulnerability {
  id: string;
  name: string;
  type: VulnerabilityType;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  cveId?: string;
  cweId?: string;
  exploitability: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  cvssScore?: number;
  affected: string[]; // asset ids
  status: "OPEN" | "IN_PROGRESS" | "MITIGATED" | "ACCEPTED" | "RESOLVED";
  discoveredAt: string;
  remediation?: string;
  references: string[];
  exploitDetails?: string;
}

export interface AttackVector {
  id: string;
  name: string;
  description: string;
  technique: AttackTechnique;
  mitreTechnique?: string; // MITRE ATT&CK technique ID
  probability: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  prerequisites: string[]; // vulnerability ids or other attack vector ids
  impact: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  countermeasures: string[]; // security control ids
}

export interface AttackPath {
  id: string;
  name: string;
  description: string;
  startPoint: string; // asset id
  endPoint: string; // asset id
  steps: {
    stepId: string;
    assetId: string;
    vectorId: string;
    vulnerabilityId?: string;
    description: string;
    probability: number; // 0-1
    impact: number; // 0-10
  }[];
  overallProbability: number; // 0-1
  overallImpact: number; // 0-10
  createdAt: string;
  updatedAt: string;
  simulationResults?: AttackSimulationResult[];
}

export interface SecurityControl {
  id: string;
  name: string;
  description: string;
  type: "PREVENTIVE" | "DETECTIVE" | "CORRECTIVE" | "DETERRENT";
  status: "PLANNED" | "IMPLEMENTED" | "OPERATIONAL" | "DEGRADED" | "FAILED";
  effectiveness: number; // 0-1
  assets: string[]; // asset ids
  mitigatesVectors: string[]; // attack vector ids
  mitigatesVulnerabilities: string[]; // vulnerability ids
  implementationCost: "LOW" | "MEDIUM" | "HIGH";
  implementationComplexity: "LOW" | "MEDIUM" | "HIGH";
  implementationTime: number; // in days
}

export interface AttackSimulationResult {
  id: string;
  pathId: string;
  name: string;
  description: string;
  timestamp: string;
  duration: number; // in milliseconds
  success: boolean;
  pathTaken: {
    stepId: string;
    assetId: string;
    vectorId: string;
    vulnerabilityId?: string;
    success: boolean;
    controlsEncountered: string[]; // security control ids
    controlsEffective: boolean[];
    timeTaken: number; // in milliseconds
  }[];
  compromisedAssets: string[]; // asset ids
  effectiveControls: string[]; // security control ids
  ineffectiveControls: string[]; // security control ids
  recommendations: {
    type: "CONTROL" | "PATCH" | "CONFIGURATION" | "ARCHITECTURE";
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    estimatedEffectiveness: number; // 0-1
    estimatedCost: "LOW" | "MEDIUM" | "HIGH";
    targetAssets: string[]; // asset ids
  }[];
}

export interface AttackPathStats {
  totalAssets: number;
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  totalAttackPaths: number;
  criticalAttackPaths: number;
  assetsByType: Record<AssetType, number>;
  vulnerabilitiesBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  topVulnerableAssets: {
    assetId: string;
    name: string;
    vulnerabilityCount: number;
    criticality: string;
  }[];
  topAttackVectors: {
    vectorId: string;
    name: string;
    technique: string;
    frequency: number;
  }[];
}

export interface AttackPathSearchParams {
  assetTypes?: AssetType[];
  vulnerabilityTypes?: VulnerabilityType[];
  techniques?: AttackTechnique[];
  criticality?: ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")[];
  severity?: ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")[];
  probability?: ("LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH")[];
  impactRange?: [number, number]; // min-max range for impact
  query?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}
