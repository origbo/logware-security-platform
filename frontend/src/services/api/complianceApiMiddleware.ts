import {
  ComplianceApiResponse,
  ComplianceErrorResponse,
  createApiResponse,
  createErrorResponse,
  ComplianceFrameworkApiModel,
  ComplianceControlApiModel,
  ComplianceAuditApiModel,
  AssessmentResultApiModel,
  convertFrameworkToApiModel,
  convertControlToApiModel,
  convertAuditToApiModel,
  convertAssessmentResultToApiModel,
} from "./complianceApiEndpoints";
import {
  ComplianceFramework,
  ComplianceAudit,
  AssessmentResult,
} from "../../pages/compliance/CompliancePage";

// API Gateway middleware for the Compliance Module
// This service handles the translation between the API gateway and the internal services

// Rate limiting helper - to avoid overwhelming the API with too many requests
interface RateLimitConfig {
  windowMs: number; // Milliseconds for the window
  maxRequests: number; // Max requests per window
}

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetAt: number;
  };
}

class ApiRateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  public check(ip: string): boolean {
    const now = Date.now();

    // Clean up expired entries
    this.cleanupStore(now);

    // Create entry if it doesn't exist
    if (!this.store[ip]) {
      this.store[ip] = {
        count: 0,
        resetAt: now + this.config.windowMs,
      };
    }

    // Reset if expired
    if (this.store[ip].resetAt < now) {
      this.store[ip] = {
        count: 0,
        resetAt: now + this.config.windowMs,
      };
    }

    // Check limit
    if (this.store[ip].count >= this.config.maxRequests) {
      return false;
    }

    // Increment count
    this.store[ip].count++;
    return true;
  }

  private cleanupStore(now: number): void {
    Object.keys(this.store).forEach((ip) => {
      if (this.store[ip].resetAt < now) {
        delete this.store[ip];
      }
    });
  }
}

// Create a rate limiter instance
const apiRateLimiter = new ApiRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

// Authentication check - in a real app, this would validate tokens
const checkApiAuthToken = (token: string): boolean => {
  // Mock validation - in a real app, this would verify the token
  return token && token.startsWith("Bearer ") && token.length > 20;
};

// API middleware handlers
export const handleGetFrameworks = async (
  headers: Record<string, string>,
  queryParams: Record<string, string>,
  frameworks: ComplianceFramework[]
): Promise<
  ComplianceApiResponse<ComplianceFrameworkApiModel[]> | ComplianceErrorResponse
> => {
  try {
    // Check rate limiting
    const clientIp =
      headers["x-forwarded-for"] || headers["x-real-ip"] || "unknown";
    if (!apiRateLimiter.check(clientIp)) {
      return createErrorResponse(
        "TOO_MANY_REQUESTS",
        "Rate limit exceeded. Try again later."
      );
    }

    // Check authentication
    const authToken = headers["authorization"];
    if (!checkApiAuthToken(authToken)) {
      return createErrorResponse(
        "UNAUTHORIZED",
        "Invalid or missing authentication token"
      );
    }

    // Parse pagination params
    const page = parseInt(queryParams.page || "1", 10);
    const pageSize = parseInt(queryParams.pageSize || "20", 10);

    // Validate params
    if (isNaN(page) || page < 1) {
      return createErrorResponse(
        "INVALID_PARAM",
        "Page must be a positive integer"
      );
    }

    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return createErrorResponse(
        "INVALID_PARAM",
        "PageSize must be between 1 and 100"
      );
    }

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Convert frameworks to API models
    const frameworkModels = frameworks
      .slice(startIndex, endIndex)
      .map((framework) => convertFrameworkToApiModel(framework));

    // Create pagination metadata
    const pagination = {
      page,
      pageSize,
      totalItems: frameworks.length,
      totalPages: Math.ceil(frameworks.length / pageSize),
    };

    return {
      ...createApiResponse(frameworkModels),
      pagination,
    };
  } catch (error) {
    console.error("Error handling frameworks API request:", error);
    return createErrorResponse(
      "INTERNAL_ERROR",
      "An internal error occurred while processing the request"
    );
  }
};

export const handleGetFrameworkById = async (
  headers: Record<string, string>,
  frameworkId: string,
  frameworks: ComplianceFramework[]
): Promise<
  ComplianceApiResponse<ComplianceFrameworkApiModel> | ComplianceErrorResponse
> => {
  try {
    // Check rate limiting
    const clientIp =
      headers["x-forwarded-for"] || headers["x-real-ip"] || "unknown";
    if (!apiRateLimiter.check(clientIp)) {
      return createErrorResponse(
        "TOO_MANY_REQUESTS",
        "Rate limit exceeded. Try again later."
      );
    }

    // Check authentication
    const authToken = headers["authorization"];
    if (!checkApiAuthToken(authToken)) {
      return createErrorResponse(
        "UNAUTHORIZED",
        "Invalid or missing authentication token"
      );
    }

    // Find the framework
    const framework = frameworks.find((f) => f.id === frameworkId);
    if (!framework) {
      return createErrorResponse(
        "NOT_FOUND",
        `Framework with ID ${frameworkId} not found`
      );
    }

    // Convert to API model
    const frameworkModel = convertFrameworkToApiModel(framework);

    return createApiResponse(frameworkModel);
  } catch (error) {
    console.error("Error handling framework by ID API request:", error);
    return createErrorResponse(
      "INTERNAL_ERROR",
      "An internal error occurred while processing the request"
    );
  }
};

export const handleGetFrameworkControls = async (
  headers: Record<string, string>,
  frameworkId: string,
  queryParams: Record<string, string>,
  frameworks: ComplianceFramework[]
): Promise<
  ComplianceApiResponse<ComplianceControlApiModel[]> | ComplianceErrorResponse
> => {
  try {
    // Check rate limiting
    const clientIp =
      headers["x-forwarded-for"] || headers["x-real-ip"] || "unknown";
    if (!apiRateLimiter.check(clientIp)) {
      return createErrorResponse(
        "TOO_MANY_REQUESTS",
        "Rate limit exceeded. Try again later."
      );
    }

    // Check authentication
    const authToken = headers["authorization"];
    if (!checkApiAuthToken(authToken)) {
      return createErrorResponse(
        "UNAUTHORIZED",
        "Invalid or missing authentication token"
      );
    }

    // Find the framework
    const framework = frameworks.find((f) => f.id === frameworkId);
    if (!framework) {
      return createErrorResponse(
        "NOT_FOUND",
        `Framework with ID ${frameworkId} not found`
      );
    }

    // Parse pagination params
    const page = parseInt(queryParams.page || "1", 10);
    const pageSize = parseInt(queryParams.pageSize || "50", 10);

    // Validate params
    if (isNaN(page) || page < 1) {
      return createErrorResponse(
        "INVALID_PARAM",
        "Page must be a positive integer"
      );
    }

    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return createErrorResponse(
        "INVALID_PARAM",
        "PageSize must be between 1 and 100"
      );
    }

    // Apply filters
    let controls = [...framework.controls];

    if (queryParams.status) {
      controls = controls.filter((c) => c.status === queryParams.status);
    }

    if (queryParams.priority) {
      controls = controls.filter((c) => c.priority === queryParams.priority);
    }

    if (queryParams.category) {
      controls = controls.filter((c) => c.category === queryParams.category);
    }

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Convert controls to API models
    const controlModels = controls
      .slice(startIndex, endIndex)
      .map((control) =>
        convertControlToApiModel(control, framework.id, framework.name)
      );

    // Create pagination metadata
    const pagination = {
      page,
      pageSize,
      totalItems: controls.length,
      totalPages: Math.ceil(controls.length / pageSize),
    };

    return {
      ...createApiResponse(controlModels),
      pagination,
    };
  } catch (error) {
    console.error("Error handling framework controls API request:", error);
    return createErrorResponse(
      "INTERNAL_ERROR",
      "An internal error occurred while processing the request"
    );
  }
};

export const handleGetAssessments = async (
  headers: Record<string, string>,
  queryParams: Record<string, string>,
  assessments: AssessmentResult[]
): Promise<
  ComplianceApiResponse<AssessmentResultApiModel[]> | ComplianceErrorResponse
> => {
  try {
    // Check rate limiting
    const clientIp =
      headers["x-forwarded-for"] || headers["x-real-ip"] || "unknown";
    if (!apiRateLimiter.check(clientIp)) {
      return createErrorResponse(
        "TOO_MANY_REQUESTS",
        "Rate limit exceeded. Try again later."
      );
    }

    // Check authentication
    const authToken = headers["authorization"];
    if (!checkApiAuthToken(authToken)) {
      return createErrorResponse(
        "UNAUTHORIZED",
        "Invalid or missing authentication token"
      );
    }

    // Apply filters
    let filteredAssessments = [...assessments];

    if (queryParams.frameworkId) {
      filteredAssessments = filteredAssessments.filter(
        (a) => a.frameworkId === queryParams.frameworkId
      );
    }

    if (queryParams.fromDate) {
      const fromDate = new Date(queryParams.fromDate);
      if (!isNaN(fromDate.getTime())) {
        filteredAssessments = filteredAssessments.filter(
          (a) => a.date && a.date >= fromDate
        );
      }
    }

    if (queryParams.toDate) {
      const toDate = new Date(queryParams.toDate);
      if (!isNaN(toDate.getTime())) {
        filteredAssessments = filteredAssessments.filter(
          (a) => a.date && a.date <= toDate
        );
      }
    }

    // Parse pagination params
    const page = parseInt(queryParams.page || "1", 10);
    const pageSize = parseInt(queryParams.pageSize || "20", 10);

    // Validate params
    if (isNaN(page) || page < 1) {
      return createErrorResponse(
        "INVALID_PARAM",
        "Page must be a positive integer"
      );
    }

    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return createErrorResponse(
        "INVALID_PARAM",
        "PageSize must be between 1 and 100"
      );
    }

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Convert assessments to API models
    const assessmentModels = filteredAssessments
      .slice(startIndex, endIndex)
      .map((assessment) => convertAssessmentResultToApiModel(assessment));

    // Create pagination metadata
    const pagination = {
      page,
      pageSize,
      totalItems: filteredAssessments.length,
      totalPages: Math.ceil(filteredAssessments.length / pageSize),
    };

    return {
      ...createApiResponse(assessmentModels),
      pagination,
    };
  } catch (error) {
    console.error("Error handling assessments API request:", error);
    return createErrorResponse(
      "INTERNAL_ERROR",
      "An internal error occurred while processing the request"
    );
  }
};

// Main API gateway handler for the compliance module
export const handleComplianceApiRequest = async (
  path: string,
  method: string,
  headers: Record<string, string>,
  queryParams: Record<string, string>,
  body: any,
  frameworks: ComplianceFramework[],
  audits: ComplianceAudit[],
  assessments: AssessmentResult[]
): Promise<ComplianceApiResponse<any> | ComplianceErrorResponse> => {
  // Extract the path segments
  const pathSegments = path.split("/").filter((s) => s);

  // API v1 endpoints
  if (
    pathSegments[0] === "api" &&
    pathSegments[1] === "v1" &&
    pathSegments[2] === "compliance"
  ) {
    // GET /api/v1/compliance/frameworks
    if (
      method === "GET" &&
      pathSegments[3] === "frameworks" &&
      !pathSegments[4]
    ) {
      return handleGetFrameworks(headers, queryParams, frameworks);
    }

    // GET /api/v1/compliance/frameworks/{frameworkId}
    if (
      method === "GET" &&
      pathSegments[3] === "frameworks" &&
      pathSegments[4] &&
      !pathSegments[5]
    ) {
      return handleGetFrameworkById(headers, pathSegments[4], frameworks);
    }

    // GET /api/v1/compliance/frameworks/{frameworkId}/controls
    if (
      method === "GET" &&
      pathSegments[3] === "frameworks" &&
      pathSegments[4] &&
      pathSegments[5] === "controls"
    ) {
      return handleGetFrameworkControls(
        headers,
        pathSegments[4],
        queryParams,
        frameworks
      );
    }

    // GET /api/v1/compliance/assessments
    if (method === "GET" && pathSegments[3] === "assessments") {
      return handleGetAssessments(headers, queryParams, assessments);
    }

    // GET /api/v1/compliance/statistics
    if (method === "GET" && pathSegments[3] === "statistics") {
      // Use the existing statistics function
      return {
        success: true,
        timestamp: new Date().toISOString(),
        version: "1.0",
        data: {
          overallScore: Math.round(
            frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length
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
                f.controls.filter((c) => c.status === "partially-compliant")
                  .length,
              0
            ),
            nonCompliant: frameworks.reduce(
              (sum, f) =>
                sum +
                f.controls.filter((c) => c.status === "non-compliant").length,
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
            id: f.id,
            name: f.name,
            score: f.score,
          })),
        },
      };
    }
  }

  // Endpoint not found
  return createErrorResponse(
    "NOT_FOUND",
    "The requested API endpoint does not exist"
  );
};
