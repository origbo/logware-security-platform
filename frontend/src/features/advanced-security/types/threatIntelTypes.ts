/**
 * Threat Intelligence Types
 *
 * Type definitions for the threat intelligence platform
 */

export enum ThreatCategory {
  MALWARE = "MALWARE",
  PHISHING = "PHISHING",
  COMMAND_AND_CONTROL = "COMMAND_AND_CONTROL",
  EXFILTRATION = "EXFILTRATION",
  EXPLOIT = "EXPLOIT",
  BOTNET = "BOTNET",
  APT = "APT",
  RANSOMWARE = "RANSOMWARE",
  DDOS = "DDOS",
}

export enum ThreatConfidence {
  VERY_HIGH = "VERY_HIGH",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  UNKNOWN = "UNKNOWN",
}

export enum ThreatIntelSource {
  INTERNAL = "INTERNAL",
  COMMERCIAL = "COMMERCIAL",
  OPEN_SOURCE = "OPEN_SOURCE",
  GOVERNMENT = "GOVERNMENT",
  COMMUNITY = "COMMUNITY",
}

export enum ThreatIndicatorType {
  IP = "IP",
  DOMAIN = "DOMAIN",
  URL = "URL",
  FILE_HASH = "FILE_HASH",
  EMAIL = "EMAIL",
  USER_AGENT = "USER_AGENT",
  FILE_PATH = "FILE_PATH",
  REGISTRY_KEY = "REGISTRY_KEY",
  PROCESS_NAME = "PROCESS_NAME",
  NETWORK_PORT = "NETWORK_PORT",
  ATTACK_PATTERN = "ATTACK_PATTERN",
  MALWARE_NAME = "MALWARE_NAME",
}

export interface ThreatIntelFeed {
  id: string;
  name: string;
  description: string;
  source: ThreatIntelSource;
  url?: string;
  enabled: boolean;
  categories: ThreatCategory[];
  refreshInterval: number; // in minutes
  lastRefreshed?: string;
  indicatorCount: number;
  apiKey?: string;
  requiresAuthentication: boolean;
  format: "STIX" | "CSV" | "JSON" | "XML" | "TEXT";
  customParser?: boolean;
}

export interface ThreatIndicator {
  id: string;
  type: ThreatIndicatorType;
  value: string;
  categories: ThreatCategory[];
  firstSeen: string;
  lastSeen: string;
  expiresAt?: string;
  sources: string[]; // feed ids
  confidence: ThreatConfidence;
  description?: string;
  tags: string[];
  attributes: Record<string, any>;
  relatedIndicators?: string[];
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases?: string[];
  description: string;
  motivations: string[];
  sophistication: "LOW" | "MEDIUM" | "HIGH" | "ADVANCED";
  firstSeen: string;
  lastSeen: string;
  country?: string;
  targets: string[];
  ttps: string[]; // tactics, techniques, procedures
  indicators: string[]; // indicator ids
  reports: string[]; // report ids
  attributes: Record<string, any>;
}

export interface ThreatReport {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedDate: string;
  source: string;
  sourceUrl?: string;
  indicators: string[]; // indicator ids
  actors: string[]; // actor ids
  categories: ThreatCategory[];
  confidence: ThreatConfidence;
  tlp: "WHITE" | "GREEN" | "AMBER" | "RED"; // Traffic Light Protocol
  attachments?: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  tags: string[];
}

export interface ThreatIntelStats {
  totalIndicators: number;
  activeIndicators: number;
  totalFeeds: number;
  activeFeeds: number;
  byCategory: Record<ThreatCategory, number>;
  byType: Record<ThreatIndicatorType, number>;
  byConfidence: Record<ThreatConfidence, number>;
  recent: {
    date: string;
    count: number;
  }[];
}

export interface ThreatSearchParams {
  indicatorTypes?: ThreatIndicatorType[];
  categories?: ThreatCategory[];
  confidence?: ThreatConfidence[];
  sources?: string[];
  startDate?: string;
  endDate?: string;
  query?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}
