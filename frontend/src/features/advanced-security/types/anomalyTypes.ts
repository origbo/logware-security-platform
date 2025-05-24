/**
 * Anomaly Detection Types
 *
 * Type definitions for the ML-based anomaly detection feature
 */

export enum AnomalyType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  DATA_ACCESS = "DATA_ACCESS",
  PROCESS_EXECUTION = "PROCESS_EXECUTION",
  CONFIGURATION_CHANGE = "CONFIGURATION_CHANGE",
  CLOUD_RESOURCE = "CLOUD_RESOURCE",
}

export enum AnomalySeverity {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  INFO = "INFO",
}

export enum AnomalyStatus {
  NEW = "NEW",
  INVESTIGATING = "INVESTIGATING",
  FALSE_POSITIVE = "FALSE_POSITIVE",
  RESOLVED = "RESOLVED",
  IGNORED = "IGNORED",
}

export interface AnomalyEvent {
  id: string;
  timestamp: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  source: string;
  description: string;
  affectedResource: string;
  mlConfidence: number; // 0-100 percentage
  rawData: Record<string, any>;
  assignedTo?: string;
  tags: string[];
  relatedEvents?: string[];
}

export interface AnomalyDetectionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: AnomalyType;
  createdAt: string;
  updatedAt: string;
  parameters: Record<string, any>;
  thresholds: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
  baselineRequired: boolean;
  baselineStatus?: "PENDING" | "GENERATING" | "READY" | "FAILED";
  lastTraining?: string;
}

export interface AnomalyDetectionStats {
  total: number;
  bySeverity: Record<AnomalySeverity, number>;
  byType: Record<AnomalyType, number>;
  byStatus: Record<AnomalyStatus, number>;
  trend: {
    date: string;
    count: number;
  }[];
  topSources: {
    source: string;
    count: number;
  }[];
}

export interface AnomalySearchParams {
  startDate?: string;
  endDate?: string;
  severity?: AnomalySeverity[];
  status?: AnomalyStatus[];
  type?: AnomalyType[];
  source?: string[];
  confidence?: [number, number]; // min-max range
  query?: string;
  limit?: number;
  offset?: number;
}
