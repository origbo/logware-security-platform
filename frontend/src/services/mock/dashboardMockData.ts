import { WidgetType } from "../dashboard/dashboardService";

// Mock data for various dashboard widgets

// GDPR Compliance Mock Data
export const gdprComplianceData = {
  complianceScore: 87,
  requirements: [
    { id: "gdpr-1", name: "Data Processing", status: "compliant", score: 92 },
    {
      id: "gdpr-2",
      name: "Consent Management",
      status: "compliant",
      score: 95,
    },
    { id: "gdpr-3", name: "Right to Access", status: "compliant", score: 90 },
    {
      id: "gdpr-4",
      name: "Right to be Forgotten",
      status: "at-risk",
      score: 78,
    },
    {
      id: "gdpr-5",
      name: "Data Breach Notification",
      status: "compliant",
      score: 88,
    },
    {
      id: "gdpr-6",
      name: "Data Protection Officers",
      status: "non-compliant",
      score: 65,
    },
  ],
  dsarStats: {
    pending: 12,
    completed: 87,
    overdue: 3,
    avgResolutionTime: "5.2 days",
  },
  lastUpdated: new Date().toISOString(),
};

// Security Score Mock Data
export const securityScoreData = {
  overallScore: 83,
  categories: [
    { id: "sec-1", name: "Network Security", score: 92, trend: "up" },
    { id: "sec-2", name: "Endpoint Security", score: 78, trend: "down" },
    { id: "sec-3", name: "Application Security", score: 85, trend: "stable" },
    { id: "sec-4", name: "Data Security", score: 89, trend: "up" },
    { id: "sec-5", name: "Identity & Access", score: 75, trend: "stable" },
  ],
  riskFactors: [
    { id: "risk-1", name: "Unpatched Systems", severity: "high", count: 12 },
    { id: "risk-2", name: "Weak Passwords", severity: "medium", count: 23 },
    { id: "risk-3", name: "Exposed Services", severity: "high", count: 5 },
  ],
  recommendations: [
    {
      id: "rec-1",
      title: "Deploy MFA for all admin accounts",
      priority: "high",
    },
    {
      id: "rec-2",
      title: "Patch 12 critical vulnerabilities",
      priority: "high",
    },
    {
      id: "rec-3",
      title: "Update endpoint protection policy",
      priority: "medium",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

// Playbook Status Mock Data
export const playbookStatusData = {
  activePlaybooks: 7,
  completedToday: 12,
  automationRate: 68,
  playbooks: [
    {
      id: "pb-1",
      name: "Phishing Response",
      status: "active",
      progress: 45,
      priority: "high",
    },
    {
      id: "pb-2",
      name: "Malware Containment",
      status: "active",
      progress: 75,
      priority: "critical",
    },
    {
      id: "pb-3",
      name: "User Account Compromise",
      status: "active",
      progress: 30,
      priority: "high",
    },
    {
      id: "pb-4",
      name: "Network Scan Response",
      status: "active",
      progress: 90,
      priority: "medium",
    },
    {
      id: "pb-5",
      name: "Data Exfiltration",
      status: "standby",
      progress: 0,
      priority: "high",
    },
  ],
  automationSavings: {
    hoursPerWeek: 37,
    percentImprovement: 22,
  },
  lastUpdated: new Date().toISOString(),
};

// Cloud Security Mock Data
export const cloudSecurityData = {
  resourcesProtected: 235,
  securityFindings: {
    critical: 3,
    high: 8,
    medium: 15,
    low: 27,
  },
  environments: [
    {
      id: "cloud-1",
      name: "AWS Production",
      status: "secure",
      resources: 94,
      findings: 6,
    },
    {
      id: "cloud-2",
      name: "Azure Development",
      status: "at-risk",
      resources: 58,
      findings: 14,
    },
    {
      id: "cloud-3",
      name: "GCP Data Processing",
      status: "secure",
      resources: 83,
      findings: 5,
    },
  ],
  topRisks: [
    {
      id: "cr-1",
      description: "Public S3 bucket with sensitive data",
      service: "AWS S3",
      severity: "critical",
    },
    {
      id: "cr-2",
      description: "Unrestricted security group",
      service: "AWS EC2",
      severity: "high",
    },
    {
      id: "cr-3",
      description: "Unencrypted database",
      service: "Azure SQL",
      severity: "high",
    },
  ],
  complianceStatus: {
    awsWellArchitected: 87,
    hipaa: 92,
    pci: 95,
  },
  lastUpdated: new Date().toISOString(),
};

// Threat Intel Summary Mock Data
export const threatIntelData = {
  activeThreatFeeds: 8,
  newIndicators: 342,
  blockedThreats: 76,
  threatCategories: [
    { id: "threat-1", name: "Ransomware", count: 18, trend: "up" },
    { id: "threat-2", name: "APT Groups", count: 12, trend: "stable" },
    { id: "threat-3", name: "Malware", count: 45, trend: "down" },
    { id: "threat-4", name: "Phishing", count: 67, trend: "up" },
  ],
  recentIOCs: [
    {
      id: "ioc-1",
      type: "IP",
      value: "192.168.2.1",
      source: "AlienVault",
      confidence: "high",
      age: "2 hours",
    },
    {
      id: "ioc-2",
      type: "Domain",
      value: "malicious-site.com",
      source: "MISP",
      confidence: "medium",
      age: "5 hours",
    },
    {
      id: "ioc-3",
      type: "Hash",
      value: "44d88612fea8a8f36de82e1278abb02f",
      source: "VirusTotal",
      confidence: "high",
      age: "1 day",
    },
  ],
  targetedIndustries: [
    { id: "ind-1", name: "Healthcare", threatLevel: "high" },
    { id: "ind-2", name: "Financial", threatLevel: "high" },
    { id: "ind-3", name: "Manufacturing", threatLevel: "medium" },
  ],
  lastUpdated: new Date().toISOString(),
};

// Recent Cases Mock Data
export const recentCasesData = {
  totalCases: 127,
  openCases: 42,
  casesRequiringAction: 15,
  casesByPriority: {
    critical: 5,
    high: 12,
    medium: 18,
    low: 7,
  },
  recentCases: [
    {
      id: "case-001",
      title: "Suspicious Login Activity",
      status: "investigating",
      priority: "high",
      assignee: "John Smith",
      timestamp: "2023-06-15T10:23:15Z",
      type: "Potential Account Compromise",
    },
    {
      id: "case-002",
      title: "Ransomware Detection",
      status: "remediation",
      priority: "critical",
      assignee: "Emma Johnson",
      timestamp: "2023-06-15T08:42:11Z",
      type: "Malware",
    },
    {
      id: "case-003",
      title: "Data Loss Prevention Alert",
      status: "triage",
      priority: "medium",
      assignee: "Unassigned",
      timestamp: "2023-06-15T11:17:33Z",
      type: "DLP Violation",
    },
    {
      id: "case-004",
      title: "Brute Force Attack",
      status: "closed",
      priority: "high",
      assignee: "Michael Brown",
      timestamp: "2023-06-14T22:45:09Z",
      type: "Network Attack",
    },
    {
      id: "case-005",
      title: "Phishing Campaign",
      status: "investigating",
      priority: "high",
      assignee: "Sarah Wilson",
      timestamp: "2023-06-15T09:30:27Z",
      type: "Phishing",
    },
  ],
  metrics: {
    averageResolutionTime: "6.5 hours",
    escalationRate: "22%",
    casesTrend: "down",
  },
  lastUpdated: new Date().toISOString(),
};

// Mock data getter function based on widget type
export const getMockDataForWidget = (widgetType: WidgetType) => {
  switch (widgetType) {
    case WidgetType.GDPR_COMPLIANCE:
      return gdprComplianceData;
    case WidgetType.SECURITY_SCORE:
      return securityScoreData;
    case WidgetType.PLAYBOOK_STATUS:
      return playbookStatusData;
    case WidgetType.CLOUD_SECURITY:
      return cloudSecurityData;
    case WidgetType.THREAT_INTEL_SUMMARY:
      return threatIntelData;
    case WidgetType.RECENT_CASES:
      return recentCasesData;
    default:
      return null;
  }
};
