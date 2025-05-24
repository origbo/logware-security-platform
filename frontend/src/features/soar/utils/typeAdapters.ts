/**
 * Type adapters to convert between API service types and SOAR module internal types
 * This helps resolve type conflicts between the service layer and component layer
 */
import * as apiTypes from "../../../services/api/soarApiService";
import * as moduleTypes from "../types/soarTypes";

/**
 * Converts an API PlaybookStep to a module PlaybookStep
 */
export function adaptApiStepToModuleStep(
  step: apiTypes.PlaybookStep
): moduleTypes.PlaybookStep {
  // Map the API step type to module step type
  let moduleStepType: moduleTypes.StepType;

  switch (step.type) {
    case "action":
    case "condition":
    case "integration":
    case "notification":
      moduleStepType = step.type as moduleTypes.StepType;
      break;
    case "wait":
      // Map 'wait' to the closest equivalent or a default
      moduleStepType = "action";
      break;
    default:
      moduleStepType = "action";
  }

  // Convert position from number to StepPosition object if needed
  const position =
    typeof step.position === "number"
      ? { x: step.position * 200, y: 100 }
      : (step.position as unknown as moduleTypes.StepPosition);

  // Map the status if present
  let moduleStatus: moduleTypes.StepStatus | undefined;
  if (step.status) {
    switch (step.status) {
      case "pending":
        moduleStatus = "idle";
        break;
      case "running":
      case "completed":
      case "failed":
        moduleStatus = step.status as moduleTypes.StepStatus;
        break;
      case "skipped":
        moduleStatus = "idle"; // Map to closest equivalent
        break;
      default:
        moduleStatus = "idle";
    }
  }

  return {
    id: step.id,
    name: step.name,
    type: moduleStepType,
    description: step.description,
    position: position,
    config: step.config || {},
    nextSteps: step.nextSteps || [],
    status: moduleStatus,
    error: step.error,
  };
}

/**
 * Converts a module PlaybookStep to an API PlaybookStep
 */
export function adaptModuleStepToApiStep(
  step: moduleTypes.PlaybookStep
): apiTypes.PlaybookStep {
  // Map the module step type to API step type
  let apiStepType:
    | "action"
    | "condition"
    | "notification"
    | "integration"
    | "wait";

  switch (step.type) {
    case "action":
    case "condition":
    case "integration":
    case "notification":
      apiStepType = step.type;
      break;
    case "trigger":
    case "input":
    case "output":
      // Map to the closest equivalent
      apiStepType = "action";
      break;
    default:
      apiStepType = "action";
  }

  // Convert position from StepPosition to number if needed by API
  const position = step.position.x / 200; // Simplify to a single number

  // Map the status if present
  let apiStatus:
    | "pending"
    | "running"
    | "completed"
    | "failed"
    | "skipped"
    | undefined;
  if (step.status) {
    switch (step.status) {
      case "idle":
        apiStatus = "pending";
        break;
      case "running":
      case "success":
        apiStatus = step.status === "success" ? "completed" : "running";
        break;
      case "failure":
        apiStatus = "failed";
        break;
      case "waiting":
        apiStatus = "pending";
        break;
      default:
        apiStatus = "pending";
    }
  }

  return {
    id: step.id,
    name: step.name,
    type: apiStepType,
    description: step.description,
    config: step.config,
    position: position,
    status: apiStatus,
    nextSteps: step.nextSteps,
  };
}

/**
 * Converts an API Playbook to a module Playbook
 */
export function adaptApiPlaybookToModulePlaybook(
  playbook: apiTypes.Playbook
): moduleTypes.Playbook {
  // Map status
  let moduleStatus: moduleTypes.PlaybookStatus;
  switch (playbook.status) {
    case "active":
    case "draft":
    case "archived":
      moduleStatus = playbook.status;
      break;
    case "disabled":
      moduleStatus = "inactive";
      break;
    default:
      moduleStatus = "draft";
  }

  // Map trigger type
  let moduleTriggerType: moduleTypes.TriggerType;
  switch (playbook.triggerType) {
    case "manual":
      moduleTriggerType = "manual";
      break;
    case "scheduled":
      moduleTriggerType = "scheduled";
      break;
    case "event-driven":
      moduleTriggerType = "event";
      break;
    default:
      moduleTriggerType = "manual";
  }

  // Convert the steps
  const moduleSteps = playbook.steps.map(adaptApiStepToModuleStep);

  return {
    id: playbook.id,
    name: playbook.name,
    description: playbook.description,
    status: moduleStatus,
    triggerType: moduleTriggerType,
    createdAt: playbook.createdAt,
    updatedAt: playbook.updatedAt,
    owner: playbook.owner,
    steps: moduleSteps,
    successCount: playbook.successCount,
    failureCount: playbook.failureCount,
    tags: playbook.tags,
    category: playbook.tags?.[0], // Use first tag as category if needed
    version: "1.0", // Default version
  };
}

/**
 * Converts a module Playbook to an API Playbook
 */
export function adaptModulePlaybookToApiPlaybook(
  playbook: moduleTypes.Playbook
): apiTypes.Playbook {
  // Map status
  let apiStatus: "active" | "disabled" | "draft" | "archived";
  switch (playbook.status) {
    case "active":
    case "draft":
    case "archived":
      apiStatus = playbook.status;
      break;
    case "inactive":
      apiStatus = "disabled";
      break;
    default:
      apiStatus = "draft";
  }

  // Map trigger type
  let apiTriggerType: "manual" | "scheduled" | "event-driven";
  switch (playbook.triggerType) {
    case "manual":
      apiTriggerType = "manual";
      break;
    case "scheduled":
      apiTriggerType = "scheduled";
      break;
    case "alert":
    case "webhook":
    case "event":
      apiTriggerType = "event-driven";
      break;
    default:
      apiTriggerType = "manual";
  }

  // Convert the steps
  const apiSteps = playbook.steps.map(adaptModuleStepToApiStep);

  return {
    id: playbook.id,
    name: playbook.name,
    description: playbook.description,
    status: apiStatus,
    triggerType: apiTriggerType,
    createdAt: playbook.createdAt,
    updatedAt: playbook.updatedAt,
    owner: playbook.owner,
    steps: apiSteps,
    successCount: playbook.successCount,
    failureCount: playbook.failureCount,
    tags: playbook.tags,
    lastRunAt: undefined, // Not available in module type
    avgExecutionTime: undefined, // Not available in module type
    triggerConditions: undefined, // Not available in module type
  };
}
