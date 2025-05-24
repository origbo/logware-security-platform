/**
 * Alert Types
 *
 * Type definitions for security alerts in the Logware Security Platform
 */

// Alert severity levels
export enum AlertSeverity {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

// Alert status values
export enum AlertStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  FALSE_POSITIVE = "FALSE_POSITIVE",
  CLOSED = "CLOSED",
}

// Alert source systems
export enum AlertSource {
  IDS = "IDS",
  SIEM = "SIEM",
  EDR = "EDR",
  FIREWALL = "FIREWALL",
  AV = "ANTIVIRUS",
  WAF = "WAF",
  CLOUD = "CLOUD",
  VULNERABILITY_SCANNER = "VULNERABILITY_SCANNER",
  THREAT_INTEL = "THREAT_INTEL",
  AUDIT = "AUDIT",
  MANUAL = "MANUAL",
}

// Comment interface for alert discussions
export interface AlertComment {
  id?: string;
  content: string;
  user: string;
  timestamp: string;
}

// Action taken on an alert
export interface AlertAction {
  id?: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
  status: "success" | "failure" | "pending";
  details?: any;
}

// Main Alert interface
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: AlertSource;
  type?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  ipAddress?: string;
  hostname?: string;
  userName?: string;
  details?: any;
  tags?: string[];
  comments?: AlertComment[];
  actions?: AlertAction[];
  mitreAttack?: string[];
  relatedAlerts?: string[];
  falsePositiveReason?: string;
  cve?: string;
}

// Interface for updating an alert
export interface AlertUpdate {
  status?: AlertStatus;
  severity?: AlertSeverity;
  assignedTo?: string;
  assignedToName?: string;
  tags?: string[];
  falsePositiveReason?: string;
}

// Interface for bulk updating alerts
export interface BulkAlertUpdate {
  ids: string[];
  updates: AlertUpdate;
}

// Alert filter parameters for API queries
export interface AlertQueryParams {
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  source?: AlertSource[];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  assignedTo?: string;
  limit?: number;
  page?: number;
  tags?: string[];
}
