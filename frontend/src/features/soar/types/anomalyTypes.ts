/**
 * Anomaly Detection Type Definitions
 *
 * This file contains all the types used in the ML-based Anomaly Detection features
 * of the SOAR (Security Orchestration, Automation and Response) module.
 */

import { CaseSeverity } from "./soarTypes";

// Base Anomaly Interface
export interface Anomaly {
  id: string;
  name: string;
  description: string;
  severity: CaseSeverity;
  confidence: number; // 0-100 confidence score
  detectedAt: string;
  source: AnomalySource;
  status: AnomalyStatus;
  relatedEntities: RelatedEntity[];
  analysisSummary: string;
  detectionMethod: DetectionMethod;
  metadata: Record<string, any>;
  falsePositive: boolean;
  assignedTo?: string;
  tags: string[];
}

// Specific Anomaly Types
export interface UserBehaviorAnomaly extends Anomaly {
  anomalyType: "user_behavior";
  userId: string;
  userName: string;
  userDepartment?: string;
  behaviorCategory: UserBehaviorCategory;
  baselineDeviation: number; // How much the behavior deviates from baseline (%)
  activities: UserActivity[];
  riskScore: number;
}

export interface NetworkAnomaly extends Anomaly {
  anomalyType: "network";
  sourceIp?: string;
  destinationIp?: string;
  protocol?: string;
  port?: number;
  flowVolume?: number;
  geoLocation?: GeoLocation;
  trafficCategory: TrafficCategory;
  packetSamples?: string[];
  communicationPattern?: string;
}

export interface SystemAnomaly extends Anomaly {
  anomalyType: "system";
  hostId: string;
  hostname: string;
  resourceType: ResourceType;
  metricName: string;
  currentValue: number;
  thresholdValue: number;
  systemCategory: SystemCategory;
  persistenceDuration: number; // Duration in seconds
}

// Supporting Types
export type AnomalySource =
  | "user_behavior_analytics"
  | "network_traffic_analysis"
  | "system_monitoring"
  | "threat_intelligence"
  | "log_analysis"
  | "custom_rule";

export type AnomalyStatus =
  | "new"
  | "investigating"
  | "resolved"
  | "false_positive"
  | "ignored";

export type DetectionMethod =
  | "statistical"
  | "machine_learning"
  | "deep_learning"
  | "rule_based"
  | "clustering"
  | "outlier_detection"
  | "pattern_recognition";

export type UserBehaviorCategory =
  | "authentication"
  | "data_access"
  | "resource_usage"
  | "administrative_action"
  | "communication"
  | "movement"
  | "privilege_escalation";

export type TrafficCategory =
  | "data_exfiltration"
  | "command_and_control"
  | "port_scanning"
  | "ddos"
  | "lateral_movement"
  | "protocol_violation"
  | "encrypted_traffic"
  | "unusual_destination";

export type SystemCategory =
  | "cpu_usage"
  | "memory_usage"
  | "disk_activity"
  | "network_activity"
  | "process_behavior"
  | "service_availability"
  | "registry_changes"
  | "file_system_activity";

export type ResourceType =
  | "server"
  | "workstation"
  | "container"
  | "vm"
  | "network_device"
  | "database"
  | "storage"
  | "cloud_resource";

export interface RelatedEntity {
  id: string;
  type: EntityType;
  name: string;
  relationship: string;
  confidence: number; // 0-100 confidence of relationship
}

export type EntityType =
  | "user"
  | "host"
  | "ip"
  | "process"
  | "file"
  | "url"
  | "domain"
  | "service"
  | "alert"
  | "case";

export interface UserActivity {
  timestamp: string;
  action: string;
  resource: string;
  outcome: string;
  metadata: Record<string, any>;
  anomalyScore: number;
}

export interface GeoLocation {
  country: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  asn?: string;
  isp?: string;
}

// ML Model Information
export interface AnomalyModel {
  id: string;
  name: string;
  description: string;
  modelType: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  status: ModelStatus;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingDataset: string;
  features: string[];
  hyperparameters: Record<string, any>;
  thresholds: Record<string, number>;
  lastTrainingDuration: number;
  supportedAnomalyTypes: string[];
}

export type ModelStatus =
  | "training"
  | "active"
  | "inactive"
  | "failed"
  | "deprecated";

// Alert Correlation
export interface AnomalyCorrelation {
  id: string;
  name: string;
  description: string;
  anomalyIds: string[];
  createdAt: string;
  severity: CaseSeverity;
  confidence: number;
  ttps: string[]; // Tactics, Techniques, and Procedures
  attackPatterns: string[];
  analysisNotes: string;
  recommendedActions: string[];
}

// Redux State Interface
export interface AnomalyState {
  userBehaviorAnomalies: Record<string, UserBehaviorAnomaly>;
  networkAnomalies: Record<string, NetworkAnomaly>;
  systemAnomalies: Record<string, SystemAnomaly>;
  models: Record<string, AnomalyModel>;
  correlations: Record<string, AnomalyCorrelation>;
  loading: boolean;
  error: string | null;
  selectedAnomalyId: string | null;
  filters: AnomalyFilters;
}

export interface AnomalyFilters {
  anomalyTypes?: string[];
  severities?: CaseSeverity[];
  statuses?: AnomalyStatus[];
  detectionMethods?: DetectionMethod[];
  sources?: AnomalySource[];
  dateRange?: {
    start: string;
    end: string;
  };
  confidenceRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}
