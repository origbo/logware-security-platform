export interface AutomationExecution {
  id: string;
  type: "playbook" | "rule";
  name: string;
  status: "running" | "completed" | "failed" | "aborted";
  startTime: string;
  endTime?: string;
  duration?: number;
  triggeredBy: {
    type: "user" | "alert" | "schedule" | "api";
    id: string;
    name: string;
  };
  steps: ExecutionStep[];
  sourceId: string; // ID of the playbook or rule
  sourceVersion: string;
  successRate?: number; // For completed executions
}

export interface ExecutionStep {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startTime?: string;
  endTime?: string;
  duration?: number;
  output?: any;
  error?: string;
  actionType?: string;
  order: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType:
    | "execution_started"
    | "execution_completed"
    | "execution_failed"
    | "step_started"
    | "step_completed"
    | "step_failed"
    | "execution_aborted"
    | "manual_intervention"
    | "configuration_changed";
  executionId?: string;
  stepId?: string;
  userId?: string;
  userName?: string;
  details: string;
  resource: {
    type: string;
    id: string;
    name: string;
  };
  severity: "info" | "warning" | "error";
}

export interface PerformanceMetric {
  id: string;
  name: string;
  type: "playbook" | "rule";
  period: "day" | "week" | "month";
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  successRate: number;
  frequencyRank: number; // Rank by execution frequency (1 = most frequent)
  errorDistribution: {
    category: string;
    count: number;
  }[];
  trendsData: {
    date: string;
    executions: number;
    successRate: number;
    avgDuration: number;
  }[];
}

// Mock data for active executions
export const mockActiveExecutions: AutomationExecution[] = [
  {
    id: "exec-001",
    type: "playbook",
    name: "Phishing Response",
    status: "running",
    startTime: "2025-05-19T09:10:23Z",
    triggeredBy: {
      type: "alert",
      id: "alert-123",
      name: "Suspicious Email Detected",
    },
    steps: [
      {
        id: "step-001",
        name: "Extract Email Headers",
        status: "completed",
        startTime: "2025-05-19T09:10:25Z",
        endTime: "2025-05-19T09:10:35Z",
        duration: 10,
        order: 1,
        actionType: "email_analysis",
      },
      {
        id: "step-002",
        name: "Extract URLs and Attachments",
        status: "completed",
        startTime: "2025-05-19T09:10:36Z",
        endTime: "2025-05-19T09:10:52Z",
        duration: 16,
        order: 2,
        actionType: "email_analysis",
      },
      {
        id: "step-003",
        name: "Check URLs Against Threat Intelligence",
        status: "running",
        startTime: "2025-05-19T09:10:53Z",
        order: 3,
        actionType: "threat_intelligence",
      },
      {
        id: "step-004",
        name: "Analyze Attachments",
        status: "pending",
        order: 4,
        actionType: "file_analysis",
      },
      {
        id: "step-005",
        name: "Create Incident Ticket",
        status: "pending",
        order: 5,
        actionType: "ticketing",
      },
    ],
    sourceId: "playbook-phishing-response",
    sourceVersion: "2.1",
  },
  {
    id: "exec-002",
    type: "rule",
    name: "High Severity Alert Triage",
    status: "running",
    startTime: "2025-05-19T09:18:45Z",
    triggeredBy: {
      type: "alert",
      id: "alert-456",
      name: "Multiple Failed Login Attempts",
    },
    steps: [
      {
        id: "step-001",
        name: "Enrich Alert Data",
        status: "completed",
        startTime: "2025-05-19T09:18:47Z",
        endTime: "2025-05-19T09:19:12Z",
        duration: 25,
        order: 1,
        actionType: "alert_enrichment",
      },
      {
        id: "step-002",
        name: "Check User Account Status",
        status: "running",
        startTime: "2025-05-19T09:19:13Z",
        order: 2,
        actionType: "user_management",
      },
      {
        id: "step-003",
        name: "Create High Priority Case",
        status: "pending",
        order: 3,
        actionType: "case_management",
      },
    ],
    sourceId: "rule-high-severity-triage",
    sourceVersion: "1.0",
  },
];

// Mock data for execution history
export const mockHistoricalExecutions: AutomationExecution[] = [
  {
    id: "exec-h001",
    type: "playbook",
    name: "Malware Alert Investigation",
    status: "completed",
    startTime: "2025-05-18T14:23:12Z",
    endTime: "2025-05-18T14:25:45Z",
    duration: 153,
    triggeredBy: {
      type: "alert",
      id: "alert-789",
      name: "Malware Detected: Emotet",
    },
    steps: [
      {
        id: "step-001",
        name: "Quarantine Infected Endpoint",
        status: "completed",
        startTime: "2025-05-18T14:23:15Z",
        endTime: "2025-05-18T14:23:45Z",
        duration: 30,
        order: 1,
        actionType: "endpoint_management",
      },
      {
        id: "step-002",
        name: "Collect Forensic Data",
        status: "completed",
        startTime: "2025-05-18T14:23:46Z",
        endTime: "2025-05-18T14:24:55Z",
        duration: 69,
        order: 2,
        actionType: "forensics",
      },
      {
        id: "step-003",
        name: "Create Incident Report",
        status: "completed",
        startTime: "2025-05-18T14:24:56Z",
        endTime: "2025-05-18T14:25:45Z",
        duration: 49,
        order: 3,
        actionType: "reporting",
      },
    ],
    sourceId: "playbook-malware-investigation",
    sourceVersion: "3.2",
    successRate: 1.0,
  },
  {
    id: "exec-h002",
    type: "rule",
    name: "New User Account Creation Alert",
    status: "failed",
    startTime: "2025-05-18T16:42:33Z",
    endTime: "2025-05-18T16:43:12Z",
    duration: 39,
    triggeredBy: {
      type: "alert",
      id: "alert-321",
      name: "Admin Account Created",
    },
    steps: [
      {
        id: "step-001",
        name: "Validate Account Creation",
        status: "completed",
        startTime: "2025-05-18T16:42:35Z",
        endTime: "2025-05-18T16:42:55Z",
        duration: 20,
        order: 1,
        actionType: "user_validation",
      },
      {
        id: "step-002",
        name: "Check Approval Workflow",
        status: "failed",
        startTime: "2025-05-18T16:42:56Z",
        endTime: "2025-05-18T16:43:12Z",
        duration: 16,
        error: "Failed to connect to approval workflow API: Connection timeout",
        order: 2,
        actionType: "workflow_check",
      },
    ],
    sourceId: "rule-new-admin-alert",
    sourceVersion: "1.1",
    successRate: 0.5,
  },
  {
    id: "exec-h003",
    type: "playbook",
    name: "Data Exfiltration Investigation",
    status: "completed",
    startTime: "2025-05-17T08:14:22Z",
    endTime: "2025-05-17T08:18:45Z",
    duration: 263,
    triggeredBy: {
      type: "user",
      id: "user-456",
      name: "John Smith",
    },
    steps: [
      {
        id: "step-001",
        name: "Check Firewall Logs",
        status: "completed",
        startTime: "2025-05-17T08:14:25Z",
        endTime: "2025-05-17T08:15:15Z",
        duration: 50,
        order: 1,
        actionType: "log_analysis",
      },
      {
        id: "step-002",
        name: "Check DLP Alerts",
        status: "completed",
        startTime: "2025-05-17T08:15:16Z",
        endTime: "2025-05-17T08:16:30Z",
        duration: 74,
        order: 2,
        actionType: "dlp_check",
      },
      {
        id: "step-003",
        name: "Analyze Network Traffic",
        status: "completed",
        startTime: "2025-05-17T08:16:31Z",
        endTime: "2025-05-17T08:18:15Z",
        duration: 104,
        order: 3,
        actionType: "network_analysis",
      },
      {
        id: "step-004",
        name: "Generate Summary Report",
        status: "completed",
        startTime: "2025-05-17T08:18:16Z",
        endTime: "2025-05-17T08:18:45Z",
        duration: 29,
        order: 4,
        actionType: "reporting",
      },
    ],
    sourceId: "playbook-data-exfiltration",
    sourceVersion: "2.0",
    successRate: 1.0,
  },
];

// Mock data for audit logs
export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "log-001",
    timestamp: "2025-05-19T09:10:23Z",
    eventType: "execution_started",
    executionId: "exec-001",
    userId: "system",
    userName: "System",
    details: 'Execution of playbook "Phishing Response" started',
    resource: {
      type: "playbook",
      id: "playbook-phishing-response",
      name: "Phishing Response",
    },
    severity: "info",
  },
  {
    id: "log-002",
    timestamp: "2025-05-19T09:10:35Z",
    eventType: "step_completed",
    executionId: "exec-001",
    stepId: "step-001",
    userId: "system",
    userName: "System",
    details: 'Step "Extract Email Headers" completed successfully',
    resource: {
      type: "playbook_step",
      id: "step-001",
      name: "Extract Email Headers",
    },
    severity: "info",
  },
  {
    id: "log-003",
    timestamp: "2025-05-19T09:18:45Z",
    eventType: "execution_started",
    executionId: "exec-002",
    userId: "system",
    userName: "System",
    details: 'Execution of rule "High Severity Alert Triage" started',
    resource: {
      type: "rule",
      id: "rule-high-severity-triage",
      name: "High Severity Alert Triage",
    },
    severity: "info",
  },
  {
    id: "log-004",
    timestamp: "2025-05-18T16:43:12Z",
    eventType: "execution_failed",
    executionId: "exec-h002",
    stepId: "step-002",
    userId: "system",
    userName: "System",
    details:
      'Execution failed during step "Check Approval Workflow": Failed to connect to approval workflow API: Connection timeout',
    resource: {
      type: "rule",
      id: "rule-new-admin-alert",
      name: "New User Account Creation Alert",
    },
    severity: "error",
  },
  {
    id: "log-005",
    timestamp: "2025-05-17T08:18:45Z",
    eventType: "execution_completed",
    executionId: "exec-h003",
    userId: "user-456",
    userName: "John Smith",
    details:
      'Execution of playbook "Data Exfiltration Investigation" completed successfully',
    resource: {
      type: "playbook",
      id: "playbook-data-exfiltration",
      name: "Data Exfiltration Investigation",
    },
    severity: "info",
  },
  {
    id: "log-006",
    timestamp: "2025-05-19T08:45:12Z",
    eventType: "configuration_changed",
    userId: "admin-123",
    userName: "Admin User",
    details:
      'Rule "High Severity Alert Triage" modified: Added new action "Send Slack Notification"',
    resource: {
      type: "rule",
      id: "rule-high-severity-triage",
      name: "High Severity Alert Triage",
    },
    severity: "warning",
  },
];

// Mock data for performance metrics
export const mockPerformanceMetrics: PerformanceMetric[] = [
  {
    id: "metric-001",
    name: "Phishing Response",
    type: "playbook",
    period: "week",
    totalExecutions: 27,
    successCount: 24,
    failureCount: 3,
    averageDuration: 142,
    successRate: 0.89,
    frequencyRank: 1,
    errorDistribution: [
      { category: "API Connection", count: 2 },
      { category: "Data Validation", count: 1 },
    ],
    trendsData: [
      { date: "2025-05-12", executions: 3, successRate: 1.0, avgDuration: 138 },
      {
        date: "2025-05-13",
        executions: 4,
        successRate: 0.75,
        avgDuration: 145,
      },
      { date: "2025-05-14", executions: 5, successRate: 0.8, avgDuration: 140 },
      { date: "2025-05-15", executions: 3, successRate: 1.0, avgDuration: 136 },
      { date: "2025-05-16", executions: 4, successRate: 1.0, avgDuration: 141 },
      { date: "2025-05-17", executions: 5, successRate: 0.8, avgDuration: 144 },
      { date: "2025-05-18", executions: 3, successRate: 1.0, avgDuration: 139 },
    ],
  },
  {
    id: "metric-002",
    name: "Malware Alert Investigation",
    type: "playbook",
    period: "week",
    totalExecutions: 18,
    successCount: 17,
    failureCount: 1,
    averageDuration: 178,
    successRate: 0.94,
    frequencyRank: 2,
    errorDistribution: [{ category: "Timeout", count: 1 }],
    trendsData: [
      { date: "2025-05-12", executions: 2, successRate: 1.0, avgDuration: 175 },
      { date: "2025-05-13", executions: 3, successRate: 1.0, avgDuration: 172 },
      { date: "2025-05-14", executions: 2, successRate: 1.0, avgDuration: 180 },
      {
        date: "2025-05-15",
        executions: 4,
        successRate: 0.75,
        avgDuration: 185,
      },
      { date: "2025-05-16", executions: 2, successRate: 1.0, avgDuration: 176 },
      { date: "2025-05-17", executions: 2, successRate: 1.0, avgDuration: 174 },
      { date: "2025-05-18", executions: 3, successRate: 1.0, avgDuration: 179 },
    ],
  },
  {
    id: "metric-003",
    name: "High Severity Alert Triage",
    type: "rule",
    period: "week",
    totalExecutions: 14,
    successCount: 12,
    failureCount: 2,
    averageDuration: 45,
    successRate: 0.86,
    frequencyRank: 3,
    errorDistribution: [
      { category: "API Connection", count: 1 },
      { category: "Data Validation", count: 1 },
    ],
    trendsData: [
      { date: "2025-05-12", executions: 1, successRate: 1.0, avgDuration: 40 },
      { date: "2025-05-13", executions: 2, successRate: 1.0, avgDuration: 42 },
      { date: "2025-05-14", executions: 2, successRate: 0.5, avgDuration: 48 },
      { date: "2025-05-15", executions: 3, successRate: 1.0, avgDuration: 44 },
      { date: "2025-05-16", executions: 2, successRate: 0.5, avgDuration: 47 },
      { date: "2025-05-17", executions: 2, successRate: 1.0, avgDuration: 45 },
      { date: "2025-05-18", executions: 2, successRate: 1.0, avgDuration: 43 },
    ],
  },
];
