import {
  ComplianceFramework,
  ComplianceControl,
  ComplianceAudit,
  AssessmentResult,
} from "../../pages/compliance/CompliancePage";

/**
 * Service for exposing compliance data through the API Gateway
 */

// Interface for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// External API models - simplified for external consumption
export interface ExternalComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  score: number;
  status: string;
  lastUpdated: string;
  controlsCount: {
    total: number;
    compliant: number;
    partiallyCompliant: number;
    nonCompliant: number;
    pending: number;
  };
}

export interface ExternalComplianceControl {
  id: string;
  frameworkId: string;
  controlId: string;
  category: string;
  title: string;
  description: string;
  requirement: string;
  status: string;
  score: number;
  priority: string;
  lastAssessed: string;
  dueDate?: string;
  owner?: string;
}

export interface ExternalComplianceAssessment {
  id: string;
  frameworkId: string;
  frameworkName: string;
  date: string;
  score: number;
  status: string;
  completedControls: number;
  totalControls: number;
}

/**
 * Transform internal compliance framework model to external API model
 */
export const transformFrameworkForApi = (
  framework: ComplianceFramework
): ExternalComplianceFramework => {
  return {
    id: framework.id,
    name: framework.name,
    version: framework.version,
    description: framework.description,
    score: framework.overallScore,
    status: framework.status,
    lastUpdated: framework.lastUpdated.toISOString(),
    controlsCount: {
      total: framework.controls.length,
      compliant: framework.controls.filter((c) => c.status === "compliant")
        .length,
      partiallyCompliant: framework.controls.filter(
        (c) => c.status === "partially-compliant"
      ).length,
      nonCompliant: framework.controls.filter(
        (c) => c.status === "non-compliant"
      ).length,
      pending: framework.controls.filter((c) => c.status === "pending").length,
    },
  };
};

/**
 * Transform internal compliance control model to external API model
 */
export const transformControlForApi = (
  control: ComplianceControl
): ExternalComplianceControl => {
  return {
    id: control.id,
    frameworkId: control.frameworkId,
    controlId: control.controlId,
    category: control.category,
    title: control.title,
    description: control.description,
    requirement: control.requirement,
    status: control.status,
    score: control.score,
    priority: control.priority,
    lastAssessed: control.lastAssessed.toISOString(),
    dueDate: control.dueDate?.toISOString(),
    owner: control.owner,
  };
};

/**
 * Transform internal assessment result to external API model
 */
export const transformAssessmentForApi = (
  assessment: AssessmentResult,
  id: string
): ExternalComplianceAssessment => {
  return {
    id,
    frameworkId: assessment.frameworkId,
    frameworkName: assessment.frameworkName,
    date: assessment.date.toISOString(),
    score: assessment.score,
    status: assessment.status,
    completedControls: assessment.completedControls,
    totalControls: assessment.totalControls,
  };
};

/**
 * Get all compliance frameworks in external API format
 */
export const getFrameworksForExternalApi = async (
  frameworks: ComplianceFramework[],
  page = 1,
  pageSize = 20
): Promise<ApiResponse<ExternalComplianceFramework[]>> => {
  try {
    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const totalItems = frameworks.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get items for the current page
    const paginatedItems = frameworks.slice(startIndex, endIndex);

    // Transform to external format
    const externalFrameworks = paginatedItems.map(transformFrameworkForApi);

    return {
      success: true,
      data: externalFrameworks,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error preparing frameworks for external API:", error);
    return {
      success: false,
      error: "Failed to retrieve compliance frameworks",
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get all controls for a specific framework in external API format
 */
export const getFrameworkControlsForExternalApi = async (
  frameworkId: string,
  frameworks: ComplianceFramework[],
  page = 1,
  pageSize = 50,
  filters?: {
    status?: "compliant" | "non-compliant" | "partially-compliant" | "pending";
    priority?: "critical" | "high" | "medium" | "low";
    category?: string;
  }
): Promise<ApiResponse<ExternalComplianceControl[]>> => {
  try {
    // Find the framework
    const framework = frameworks.find((f) => f.id === frameworkId);
    if (!framework) {
      return {
        success: false,
        error: `Framework with ID ${frameworkId} not found`,
        timestamp: new Date().toISOString(),
      };
    }

    // Apply filters if provided
    let controls = [...framework.controls];

    if (filters) {
      if (filters.status) {
        controls = controls.filter((c) => c.status === filters.status);
      }

      if (filters.priority) {
        controls = controls.filter((c) => c.priority === filters.priority);
      }

      if (filters.category) {
        controls = controls.filter((c) => c.category === filters.category);
      }
    }

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const totalItems = controls.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get items for the current page
    const paginatedItems = controls.slice(startIndex, endIndex);

    // Transform to external format
    const externalControls = paginatedItems.map(transformControlForApi);

    return {
      success: true,
      data: externalControls,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  } catch (error) {
    console.error(
      `Error preparing controls for framework ${frameworkId} for external API:`,
      error
    );
    return {
      success: false,
      error: `Failed to retrieve controls for framework ${frameworkId}`,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get compliance statistics for executive dashboard through API
 */
export const getComplianceStatisticsForExternalApi = async (
  frameworks: ComplianceFramework[]
): Promise<ApiResponse<any>> => {
  try {
    const statistics = {
      overallScore: Math.round(
        frameworks.reduce((sum, f) => sum + f.overallScore, 0) /
          frameworks.length
      ),
      frameworkCount: frameworks.length,
      controlsCount: {
        total: frameworks.reduce((sum, f) => sum + f.controls.length, 0),
        compliant: frameworks.reduce(
          (sum, f) =>
            sum + f.controls.filter((c) => c.status === "compliant").length,
          0
        ),
        partiallyCompliant: frameworks.reduce(
          (sum, f) =>
            sum +
            f.controls.filter((c) => c.status === "partially-compliant").length,
          0
        ),
        nonCompliant: frameworks.reduce(
          (sum, f) =>
            sum + f.controls.filter((c) => c.status === "non-compliant").length,
          0
        ),
        pending: frameworks.reduce(
          (sum, f) =>
            sum + f.controls.filter((c) => c.status === "pending").length,
          0
        ),
      },
      criticalIssues: frameworks.reduce(
        (sum, f) =>
          sum +
          f.controls.filter(
            (c) => c.status === "non-compliant" && c.priority === "critical"
          ).length,
        0
      ),
      frameworkScores: frameworks.map((f) => ({
        name: f.name,
        score: f.overallScore,
      })),
      trendData: {
        // In a real system, this would be historical data
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Overall Compliance Score",
            data: [65, 68, 72, 75, 78, 80],
          },
        ],
      },
    };

    return {
      success: true,
      data: statistics,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      "Error preparing compliance statistics for external API:",
      error
    );
    return {
      success: false,
      error: "Failed to retrieve compliance statistics",
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * API endpoints documentation for compliance module
 */
export const complianceApiEndpoints = [
  {
    path: "/api/v1/compliance/frameworks",
    method: "GET",
    description: "Get all compliance frameworks",
    parameters: [
      {
        name: "page",
        type: "query",
        required: false,
        description: "Page number for pagination",
      },
      {
        name: "pageSize",
        type: "query",
        required: false,
        description: "Number of items per page",
      },
    ],
    responses: {
      "200": { description: "List of compliance frameworks" },
      "401": { description: "Unauthorized" },
      "500": { description: "Internal server error" },
    },
  },
  {
    path: "/api/v1/compliance/frameworks/{frameworkId}",
    method: "GET",
    description: "Get a specific compliance framework by ID",
    parameters: [
      {
        name: "frameworkId",
        type: "path",
        required: true,
        description: "ID of the framework",
      },
    ],
    responses: {
      "200": { description: "Compliance framework details" },
      "401": { description: "Unauthorized" },
      "404": { description: "Framework not found" },
      "500": { description: "Internal server error" },
    },
  },
  {
    path: "/api/v1/compliance/frameworks/{frameworkId}/controls",
    method: "GET",
    description: "Get all controls for a specific framework",
    parameters: [
      {
        name: "frameworkId",
        type: "path",
        required: true,
        description: "ID of the framework",
      },
      {
        name: "page",
        type: "query",
        required: false,
        description: "Page number for pagination",
      },
      {
        name: "pageSize",
        type: "query",
        required: false,
        description: "Number of items per page",
      },
      {
        name: "status",
        type: "query",
        required: false,
        description: "Filter by status",
      },
      {
        name: "priority",
        type: "query",
        required: false,
        description: "Filter by priority",
      },
      {
        name: "category",
        type: "query",
        required: false,
        description: "Filter by category",
      },
    ],
    responses: {
      "200": { description: "List of controls for the framework" },
      "401": { description: "Unauthorized" },
      "404": { description: "Framework not found" },
      "500": { description: "Internal server error" },
    },
  },
  {
    path: "/api/v1/compliance/statistics",
    method: "GET",
    description: "Get compliance statistics for executive dashboard",
    parameters: [],
    responses: {
      "200": { description: "Compliance statistics" },
      "401": { description: "Unauthorized" },
      "500": { description: "Internal server error" },
    },
  },
];
