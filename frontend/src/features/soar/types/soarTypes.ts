/**
 * SOAR Module Type Definitions
 *
 * This file contains all the types used in the SOAR (Security Orchestration, Automation and Response) module.
 * Including playbooks, automation rules, response actions, case management, analytics, and collaboration.
 */

// Playbook Types
export interface Playbook {
  id: string;
  name: string;
  description: string;
  status: PlaybookStatus;
  triggerType: TriggerType;
  createdAt: string;
  updatedAt: string;
  owner: string;
  steps: PlaybookStep[];
  successCount: number;
  failureCount: number;
  tags?: string[];
  category?: string;
  version?: string;
}

export type PlaybookStatus = "draft" | "active" | "inactive" | "archived";
export type TriggerType =
  | "manual"
  | "scheduled"
  | "alert"
  | "webhook"
  | "event";

export interface PlaybookStep {
  id: string;
  name: string;
  type: StepType;
  description?: string;
  position: StepPosition;
  config: StepConfig;
  nextSteps: string[];
  status?: StepStatus;
  error?: string;
  executionTime?: number;
}

export interface StepPosition {
  x: number;
  y: number;
}

export type StepType =
  | "action"
  | "condition"
  | "trigger"
  | "integration"
  | "notification"
  | "input"
  | "output";
export type StepStatus = "idle" | "running" | "success" | "failure" | "waiting";

export interface StepConfig {
  [key: string]: any;
}

// Action Types
export interface ActionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: ActionParameter[];
  script?: string;
  returnSchema?: Record<string, any>;
  integrationId?: string;
}

export interface ActionParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "date";
  required: boolean;
  default?: any;
  description?: string;
  options?: any[];
}

// Case Management Types
export interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  severity: CaseSeverity;
  priority: CasePriority;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  tags: string[];
  artifacts: Artifact[];
  timeline: TimelineEvent[];
  relatedAlerts: string[];
  playbooks: PlaybookExecution[];
}

export type CaseStatus =
  | "open"
  | "investigating"
  | "containment"
  | "eradication"
  | "recovery"
  | "closed";
export type CaseSeverity = "critical" | "high" | "medium" | "low" | "info";
export type CasePriority = "p0" | "p1" | "p2" | "p3" | "p4";

export interface Artifact {
  id: string;
  type: ArtifactType;
  value: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  tags: string[];
  isMalicious?: boolean;
  source?: string;
  tlp?: "white" | "green" | "amber" | "red";
}

export type ArtifactType =
  | "ip"
  | "domain"
  | "url"
  | "file"
  | "hash"
  | "email"
  | "process"
  | "user"
  | "host"
  | "custom";

export interface TimelineEvent {
  id: string;
  caseId: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: string;
  category: EventCategory;
  data?: Record<string, any>;
  artifacts?: Artifact[];
}

export type EventCategory =
  | "case"
  | "artifact"
  | "playbook"
  | "alert"
  | "communication"
  | "action"
  | "note"
  | "evidence";

export enum ExecutionStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface PlaybookExecution {
  id: string;
  playbookId: string;
  startTime: Date;
  endTime?: Date;
  status: ExecutionStatus;
  stepResults: Record<string, ExecutionStepResult>;
  variables: Record<string, any>;
  logs: Array<{
    timestamp: Date;
    level: "info" | "warning" | "error" | "debug";
    message: string;
    stepId?: string;
    data?: any;
  }>;
  alertId?: string;
  caseId?: string;
  error?: string;
}

export interface ExecutionStepResult {
  stepId: string;
  startTime: Date;
  endTime?: Date;
  status: ExecutionStatus;
  output?: Record<string, any>;
  error?: string;
  duration?: number;
}

// SOAR Analytics Types
export interface PlaybookAnalytics {
  id: string;
  name: string;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecuted?: string;
  failureReasons: {
    reason: string;
    count: number;
  }[];
  usageByCase: {
    caseType: string;
    count: number;
  }[];
}

export interface CaseMetrics {
  totalCases: number;
  openCases: number;
  mttr: number; // Mean time to resolution
  casesByStatus: Record<CaseStatus, number>;
  casesBySeverity: Record<CaseSeverity, number>;
  casesByPriority: Record<CasePriority, number>;
  casesByAssignee: {
    assignee: string;
    count: number;
  }[];
}

// SOAR Search Filters
export interface PlaybookFilters {
  status?: PlaybookStatus[];
  triggerType?: TriggerType[];
  owner?: string[];
  tags?: string[];
  category?: string[];
  searchTerm?: string;
}

export interface CaseFilters {
  status?: CaseStatus[];
  severity?: CaseSeverity[];
  priority?: CasePriority[];
  assignedTo?: string[];
  createdBy?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}

// Automation Execution Types
export interface AutomationExecution {
  id: string;
  type: "rule" | "playbook" | "hunt";
  name: string;
  status: "queued" | "running" | "completed" | "failed" | "aborted";
  startTime: string;
  endTime?: string;
  duration?: number;
  triggeredBy: {
    type: "user" | "alert" | "schedule" | "event";
    id: string;
    name: string;
  };
  steps: ExecutionStep[];
  result?: any;
  error?: string;
  metrics?: {
    successSteps: number;
    failedSteps: number;
    totalDuration: number;
  };
}

export interface ExecutionStep {
  id: string;
  name: string;
  type: StepType;
  status: StepStatus;
  startTime?: string;
  endTime?: string;
  duration?: number;
  result?: any;
  error?: string;
  progress?: number;
}

// Automation Rule Types
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  actions: RuleAction[];
  runOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastExecuted?: string;
  executionStats: {
    totalExecutions: number;
    successCount: number;
    failureCount: number;
    avgDuration: number;
  };
}

export interface RuleTrigger {
  type: "alert" | "event" | "schedule" | "data_match";
  config: {
    sourceType?: string;
    sourceId?: string;
    schedule?: string;
    dataSource?: string;
    criteria?: Record<string, any>;
  };
}

export interface RuleCondition {
  id: string;
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than"
    | "in"
    | "not_in"
    | "regex_match";
  value: any;
  logicalOperator?: "AND" | "OR";
}

export interface RuleAction {
  id: string;
  type:
    | "execute_playbook"
    | "execute_action"
    | "send_notification"
    | "update_case"
    | "create_task"
    | "create_case";
  config: {
    targetId?: string;
    parameters?: Record<string, any>;
  };
}

// Response Action Types
export interface ResponseAction {
  id: string;
  name: string;
  description: string;
  category:
    | "containment"
    | "eradication"
    | "recovery"
    | "investigation"
    | "notification"
    | "data_collection";
  integrationId?: string;
  parameters: ActionParameter[];
  script?: string;
  isEnabled: boolean;
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  executionStats: {
    totalExecutions: number;
    successRate: number;
    avgDuration: number;
  };
}

// Threat Hunt Types
export interface ThreatHunt {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "draft" | "active" | "archived";
  technique: string;
  tactics: string[];
  dataSources: string[];
  query: string;
  schedule?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  executionStats: {
    totalRuns: number;
    totalHits: number;
    avgDuration: number;
  };
}

export interface ThreatHuntResult {
  id: string;
  huntId: string;
  huntName: string;
  executionId: string;
  status: "running" | "completed" | "failed";
  startTime: string;
  endTime?: string;
  duration?: number;
  totalHits: number;
  results: Array<Record<string, any>>;
  createdEntities?: {
    artifacts: number;
    cases: number;
    alerts: number;
  };
  error?: string;
}

// Incident Types
export interface Incident {
  id: string;
  title: string;
  description: string;
  status:
    | "new"
    | "in_progress"
    | "contained"
    | "remediated"
    | "resolved"
    | "closed";
  severity: "critical" | "high" | "medium" | "low";
  assignee?: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  source: string;
  category: string;
  tags: string[];
  relatedEntities: {
    type: "alert" | "case" | "artifact" | "host" | "user" | "other";
    id: string;
    name: string;
  }[];
  timeline: IncidentEvent[];
  metrics?: {
    timeToDetect?: number;
    timeToRespond?: number;
    timeToResolve?: number;
  };
}

export interface IncidentEvent {
  id: string;
  incidentId: string;
  timestamp: string;
  type:
    | "status_change"
    | "comment"
    | "action_performed"
    | "entity_linked"
    | "assignment_change";
  user: string;
  description: string;
  details?: Record<string, any>;
}

// Audit Log Types
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType:
    | "execution_started"
    | "execution_completed"
    | "execution_failed"
    | "action_executed"
    | "rule_triggered"
    | "playbook_executed"
    | "case_created"
    | "case_updated"
    | "case_closed"
    | "hunt_executed";
  executionId?: string;
  userId: string;
  userName: string;
  details: string;
  resource: {
    type: "playbook" | "rule" | "action" | "case" | "hunt" | "user" | "system";
    id: string;
    name: string;
  };
  severity: "info" | "warning" | "error" | "critical";
}

// Performance Metrics
export interface PerformanceMetric {
  id: string;
  name: string;
  type: "playbook" | "rule" | "action" | "integration";
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  successRate: number;
  trendsData: {
    date: string;
    executions: number;
    successRate: number;
    avgDuration: number;
  }[];
  errorDistribution: {
    error: string;
    count: number;
    percentage: number;
  }[];
}

// Collaboration Types
export interface CollaborationSession {
  id: string;
  title: string;
  description?: string;
  type: "incident_response" | "threat_hunt" | "investigation" | "training";
  status: "active" | "paused" | "closed";
  createdAt: string;
  createdBy: string;
  participants: {
    userId: string;
    userName: string;
    role: "owner" | "collaborator" | "viewer";
    joinedAt: string;
  }[];
  relatedResources: {
    type: "incident" | "case" | "playbook" | "hunt" | "dashboard";
    id: string;
    name: string;
  }[];
  messages: CollaborationMessage[];
  actions: CollaborationAction[];
}

export interface CollaborationMessage {
  id: string;
  sessionId: string;
  sender: string;
  senderName: string;
  timestamp: string;
  content: string;
  attachments?: {
    type: "file" | "image" | "link" | "snippet";
    name: string;
    url?: string;
    content?: string;
  }[];
}

export interface CollaborationAction {
  id: string;
  sessionId: string;
  type:
    | "task_assigned"
    | "resource_shared"
    | "action_executed"
    | "note_created";
  timestamp: string;
  user: string;
  userName: string;
  details: Record<string, any>;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "high" | "medium" | "low";
  assignee?: string;
  assigneeName?: string;
  createdAt: string;
  createdBy: string;
  dueDate?: string;
  completedAt?: string;
  relatedTo?: {
    type: "incident" | "case" | "playbook" | "hunt";
    id: string;
    name: string;
  };
}

// Redux State Interfaces
export interface SoarState {
  playbooks: PlaybooksState;
  cases: CasesState;
  actionTemplates: ActionTemplatesState;
  analytics: AnalyticsState;
  automationRules: AutomationRulesState;
  executions: ExecutionsState;
  threats: ThreatsState;
  incidents: IncidentsState;
  collaboration: CollaborationState;
}

export interface PlaybooksState {
  data: Record<string, Playbook>;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  filters: PlaybookFilters;
}

export interface CasesState {
  data: Record<string, Case>;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  filters: CaseFilters;
}

export interface ActionTemplatesState {
  data: Record<string, ActionTemplate>;
  loading: boolean;
  error: string | null;
}

export interface AnalyticsState {
  playbookMetrics: PlaybookAnalytics[];
  caseMetrics: CaseMetrics;
  performanceMetrics: PerformanceMetric[];
  loading: boolean;
  error: string | null;
}

export interface AutomationRulesState {
  data: Record<string, AutomationRule>;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

export interface ExecutionsState {
  active: AutomationExecution[];
  history: AutomationExecution[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

export interface ThreatsState {
  hunts: Record<string, ThreatHunt>;
  results: Record<string, ThreatHuntResult>;
  loading: boolean;
  error: string | null;
  selectedHuntId: string | null;
  selectedResultId: string | null;
}

export interface IncidentsState {
  data: Record<string, Incident>;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

export interface CollaborationState {
  sessions: Record<string, CollaborationSession>;
  tasks: Record<string, TaskItem>;
  activeSessionId: string | null;
  loading: boolean;
  error: string | null;
}
