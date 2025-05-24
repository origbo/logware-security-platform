import {
  ComplianceFramework,
  ComplianceControl,
  ComplianceAudit,
  AssessmentResult,
  ComplianceRequirement,
  ComplianceSection,
  ComplianceTemplate,
  DSARRequest,
  DataProcessingRecord,
} from "../../types/compliance";
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../config/constants";

// Types for API responses
export interface ApiResponseBase {
  success: boolean;
  timestamp: string;
  version: string;
}

export interface ComplianceApiResponse<T> extends ApiResponseBase {
  data: T;
}

export interface ComplianceErrorResponse extends ApiResponseBase {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ComplianceFrameworkApiModel {
  id: string;
  name: string;
  version: string;
  description: string;
  score: number;
  status: string;
  lastUpdated: string;
  lastAssessment?: string;
  nextAssessment?: string;
  controlCount: {
    total: number;
    compliant: number;
    nonCompliant: number;
    partiallyCompliant: number;
    notApplicable: number;
  };
  metadata?: Record<string, unknown>;
}

export interface ComplianceControlApiModel {
  id: string;
  controlId: string;
  frameworkId: string;
  frameworkName: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  status: string;
  priority: string;
  owner?: string;
  assignedTo?: string;
  dueDate?: string;
  evidence?: string[];
  lastUpdated: string;
  metadata?: Record<string, unknown>;
}

export interface ComplianceAuditApiModel {
  id: string;
  name: string;
  description: string;
  frameworkIds: string[];
  startDate: string;
  endDate?: string;
  status: string;
  auditorsCount: number;
  auditors: string[];
  progress: number;
  metadata?: Record<string, unknown>;
}

export interface AssessmentResultApiModel {
  id: string;
  frameworkId: string;
  auditId?: string;
  date: string;
  status: string;
  score: number;
  controlsAssessed: number;
  controlResults: {
    controlId: string;
    status: string;
    evidence?: string[];
    notes?: string;
  }[];
  metadata?: Record<string, unknown>;
}

// Converter functions to transform internal models to API models

/**
 * Convert internal ComplianceFramework to API model
 */
export function convertFrameworkToApiModel(
  framework: ComplianceFramework
): ComplianceFrameworkApiModel {
  const controlCount = {
    total: framework.controls.length,
    compliant: framework.controls.filter(
      (c: ComplianceControl) => c.status === "compliant"
    ).length,
    nonCompliant: framework.controls.filter(
      (c: ComplianceControl) => c.status === "non-compliant"
    ).length,
    partiallyCompliant: framework.controls.filter(
      (c: ComplianceControl) => c.status === "partially-compliant"
    ).length,
    notApplicable: framework.controls.filter(
      (c: ComplianceControl) => c.status === "not-applicable"
    ).length,
  };

  return {
    id: framework.id,
    name: framework.name,
    version: framework.version,
    description: framework.description || "",
    score: framework.score,
    status: framework.status,
    lastUpdated:
      framework.lastUpdated?.toISOString() || new Date().toISOString(),
    lastAssessment: framework.lastAssessment?.toISOString(),
    nextAssessment: framework.nextAssessment?.toISOString(),
    controlCount,
    metadata: framework.metadata,
  };
}

/**
 * Convert internal ComplianceControl to API model
 */
export function convertControlToApiModel(
  control: ComplianceControl,
  frameworkId: string,
  frameworkName: string
): ComplianceControlApiModel {
  return {
    id: control.id,
    controlId: control.controlId,
    frameworkId: frameworkId,
    frameworkName: frameworkName,
    title: control.title,
    description: control.description || "",
    category: control.category,
    subcategory: control.subcategory,
    status: control.status,
    priority: control.priority,
    owner: control.owner,
    assignedTo: control.assignedTo,
    dueDate: control.dueDate?.toISOString(),
    evidence: control.evidence,
    lastUpdated: control.lastUpdated?.toISOString() || new Date().toISOString(),
    metadata: control.metadata,
  };
}

/**
 * Convert internal ComplianceAudit to API model
 */
export function convertAuditToApiModel(
  audit: ComplianceAudit
): ComplianceAuditApiModel {
  return {
    id: audit.id,
    name: audit.name,
    description: audit.description || "",
    frameworkIds: audit.frameworkIds,
    startDate: audit.startDate?.toISOString() || new Date().toISOString(),
    endDate: audit.endDate?.toISOString(),
    status: audit.status,
    auditorsCount: audit.auditors?.length || 0,
    auditors: audit.auditors || [],
    progress: audit.progress || 0,
    metadata: audit.metadata,
  };
}

/**
 * Convert internal AssessmentResult to API model
 */
export function convertAssessmentResultToApiModel(
  assessment: AssessmentResult
): AssessmentResultApiModel {
  return {
    id: assessment.id,
    frameworkId: assessment.frameworkId,
    auditId: assessment.auditId,
    date: assessment.date?.toISOString() || new Date().toISOString(),
    status: assessment.status,
    score: assessment.score,
    controlsAssessed: assessment.controlResults?.length || 0,
    controlResults: assessment.controlResults || [],
    metadata: assessment.metadata,
  };
}

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(data: T): ComplianceApiResponse<T> {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    version: "1.0",
    data,
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown
): ComplianceErrorResponse {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    version: "1.0",
    error: {
      code,
      message,
      details,
    },
  };
}

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const COMPLIANCE_BASE_URL = `${API_BASE_URL}/api/compliance`;

/**
 * Get authorization headers for authenticated requests
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Helper function to handle API errors
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Handle 401 Unauthorized errors (token expired)
    if (response.status === 401) {
      // Clear stored tokens
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);

      // Redirect to login page
      window.location.href = "/auth/login";
      throw new Error("Your session has expired. Please log in again.");
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

/**
 * Get all compliance frameworks
 */
export async function getComplianceFrameworks(): Promise<
  ComplianceFrameworkApiModel[]
> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/frameworks`, {
    headers: getAuthHeaders(),
  });
  return handleApiResponse<
    ComplianceApiResponse<ComplianceFrameworkApiModel[]>
  >(response).then((data) => data.data);
}

/**
 * Get compliance framework by ID
 */
export async function getComplianceFramework(
  id: string
): Promise<ComplianceFrameworkApiModel> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/frameworks/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleApiResponse<ComplianceApiResponse<ComplianceFrameworkApiModel>>(
    response
  ).then((data) => data.data);
}

/**
 * Get compliance framework details with sections and requirements
 */
export async function getFrameworkDetails(frameworkId: string): Promise<{
  framework: ComplianceFrameworkApiModel;
  sections: ComplianceSection[];
  requirements: ComplianceRequirement[];
}> {
  const response = await fetch(
    `${COMPLIANCE_BASE_URL}/frameworks/${frameworkId}/details`
  );
  return handleApiResponse<
    ComplianceApiResponse<{
      framework: ComplianceFrameworkApiModel;
      sections: ComplianceSection[];
      requirements: ComplianceRequirement[];
    }>
  >(response).then((data) => data.data);
}

/**
 * Create a new compliance framework
 */
export async function createComplianceFramework(
  framework: Omit<
    ComplianceFramework,
    "id" | "controls" | "lastUpdated" | "score"
  >
): Promise<ComplianceFrameworkApiModel> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/frameworks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(framework),
  });
  return handleApiResponse<ComplianceApiResponse<ComplianceFrameworkApiModel>>(
    response
  ).then((data) => data.data);
}

/**
 * Update an existing compliance framework
 */
export async function updateComplianceFramework(
  id: string,
  framework: Partial<ComplianceFramework>
): Promise<ComplianceFrameworkApiModel> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/frameworks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(framework),
  });
  return handleApiResponse<ComplianceApiResponse<ComplianceFrameworkApiModel>>(
    response
  ).then((data) => data.data);
}

/**
 * Delete a compliance framework
 */
export async function deleteComplianceFramework(id: string): Promise<void> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/frameworks/${id}`, {
    method: "DELETE",
  });
  return handleApiResponse<ComplianceApiResponse<void>>(response).then(
    () => undefined
  );
}

/**
 * Get controls for a framework
 */
export async function getFrameworkControls(
  frameworkId: string
): Promise<ComplianceControlApiModel[]> {
  const response = await fetch(
    `${COMPLIANCE_BASE_URL}/frameworks/${frameworkId}/controls`
  );
  return handleApiResponse<ComplianceApiResponse<ComplianceControlApiModel[]>>(
    response
  ).then((data) => data.data);
}

/**
 * Get a specific control
 */
export async function getControl(
  controlId: string
): Promise<ComplianceControlApiModel> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/controls/${controlId}`);
  return handleApiResponse<ComplianceApiResponse<ComplianceControlApiModel>>(
    response
  ).then((data) => data.data);
}

/**
 * Update control status and evidence
 */
export async function updateControlStatus(
  controlId: string,
  status: string,
  evidence?: string[],
  notes?: string
): Promise<ComplianceControlApiModel> {
  const response = await fetch(
    `${COMPLIANCE_BASE_URL}/controls/${controlId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, evidence, notes }),
    }
  );
  return handleApiResponse<ComplianceApiResponse<ComplianceControlApiModel>>(
    response
  ).then((data) => data.data);
}

/**
 * Get all compliance audits
 */
export async function getComplianceAudits(): Promise<
  ComplianceAuditApiModel[]
> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/audits`);
  return handleApiResponse<ComplianceApiResponse<ComplianceAuditApiModel[]>>(
    response
  ).then((data) => data.data);
}

/**
 * Get compliance audit by ID
 */
export async function getComplianceAudit(
  id: string
): Promise<ComplianceAuditApiModel> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/audits/${id}`);
  return handleApiResponse<ComplianceApiResponse<ComplianceAuditApiModel>>(
    response
  ).then((data) => data.data);
}

/**
 * Create a new compliance audit
 */
export async function createComplianceAudit(
  audit: Omit<ComplianceAudit, "id" | "progress">
): Promise<ComplianceAuditApiModel> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/audits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(audit),
  });
  return handleApiResponse<ComplianceApiResponse<ComplianceAuditApiModel>>(
    response
  ).then((data) => data.data);
}

/**
 * Update an existing compliance audit
 */
export async function updateComplianceAudit(
  id: string,
  audit: Partial<ComplianceAudit>
): Promise<ComplianceAuditApiModel> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/audits/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(audit),
  });
  return handleApiResponse<ComplianceApiResponse<ComplianceAuditApiModel>>(
    response
  ).then((data) => data.data);
}

/**
 * Get assessments for a framework
 */
export async function getFrameworkAssessments(
  frameworkId: string
): Promise<AssessmentResultApiModel[]> {
  const response = await fetch(
    `${COMPLIANCE_BASE_URL}/frameworks/${frameworkId}/assessments`
  );
  return handleApiResponse<ComplianceApiResponse<AssessmentResultApiModel[]>>(
    response
  ).then((data) => data.data);
}

/**
 * Create a new assessment
 */
export async function createAssessment(
  assessment: Omit<AssessmentResult, "id" | "date" | "score">
): Promise<AssessmentResultApiModel> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/assessments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(assessment),
  });
  return handleApiResponse<ComplianceApiResponse<AssessmentResultApiModel>>(
    response
  ).then((data) => data.data);
}

/**
 * Submit response for a requirement in an assessment
 */
export async function submitAssessmentResponse(
  assessmentId: string,
  requirementId: string,
  status: string,
  evidence?: string[],
  notes?: string
): Promise<AssessmentResultApiModel> {
  const response = await fetch(
    `${COMPLIANCE_BASE_URL}/assessments/${assessmentId}/responses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requirementId,
        status,
        evidence,
        notes,
      }),
    }
  );
  return handleApiResponse<ComplianceApiResponse<AssessmentResultApiModel>>(
    response
  ).then((data) => data.data);
}

/**
 * Generate a compliance report
 */
export async function generateReport(
  assessmentId: string,
  format: "pdf" | "excel" | "json"
): Promise<string> {
  const response = await fetch(
    `${COMPLIANCE_BASE_URL}/assessments/${assessmentId}/report?format=${format}`,
    {
      method: "GET",
    }
  );
  return handleApiResponse<ComplianceApiResponse<string>>(response).then(
    (data) => data.data
  );
}

/**
 * Get data processing records for GDPR compliance
 */
export async function getDataProcessingRecords(): Promise<
  DataProcessingRecord[]
> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/gdpr/data-processing`);
  return handleApiResponse<ComplianceApiResponse<DataProcessingRecord[]>>(
    response
  ).then((data) => data.data);
}

/**
 * Create new data processing record
 */
export async function createDataProcessingRecord(
  record: Omit<DataProcessingRecord, "id">
): Promise<DataProcessingRecord> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/gdpr/data-processing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });
  return handleApiResponse<ComplianceApiResponse<DataProcessingRecord>>(
    response
  ).then((data) => data.data);
}

/**
 * Get data subject access requests
 */
export async function getDSARRequests(): Promise<DSARRequest[]> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/gdpr/dsar`);
  return handleApiResponse<ComplianceApiResponse<DSARRequest[]>>(response).then(
    (data) => data.data
  );
}

/**
 * Create new data subject access request
 */
export async function createDSARRequest(
  request: Omit<DSARRequest, "id" | "status" | "submittedDate">
): Promise<DSARRequest> {
  const response = await fetch(`${COMPLIANCE_BASE_URL}/gdpr/dsar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  return handleApiResponse<ComplianceApiResponse<DSARRequest>>(response).then(
    (data) => data.data
  );
}

/**
 * Update DSAR request status
 */
/**
 * Update DSAR request status
 *
 * @param id - ID of the DSAR request to update
 * @param status - New status for the request
 * @param notes - Optional notes regarding the status change
 * @returns Updated DSAR request
 */
export async function updateDSARRequestStatus(
  id: string,
  status: "in_progress" | "completed" | "denied",
  notes?: string
): Promise<DSARRequest> {
  const response = await fetch(
    `${COMPLIANCE_BASE_URL}/gdpr/dsar/${id}/status`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    }
  );
  return handleApiResponse<ComplianceApiResponse<DSARRequest>>(response).then(
    (data) => data.data
  );
}
