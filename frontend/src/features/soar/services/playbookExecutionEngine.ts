/**
 * Playbook Execution Engine
 *
 * Handles the execution of SOAR playbooks, managing step execution,
 * condition evaluation, and action triggers.
 */

import {
  Playbook,
  PlaybookStep,
  StepType,
  PlaybookExecution,
  ExecutionStatus,
  ExecutionStepResult,
} from "../types/soarTypes";

// Local enum copy for runtime usage
export enum RuntimeStepType {
  TRIGGER = "trigger",
  ACTION = "action",
  CONDITION = "condition",
  INTEGRATION = "integration",
  NOTIFICATION = "notification",
  INPUT = "input",
  OUTPUT = "output",
}

// Execution context maintains state during playbook runs
export interface ExecutionContext {
  playbookId: string;
  executionId: string;
  variables: Record<string, any>;
  stepResults: Record<string, ExecutionStepResult>;
  startTime: Date;
  endTime?: Date;
  status: ExecutionStatus;
  currentStepId?: string; // Optional since it might not be set during initialization
  alertId?: string;
  caseId?: string;
  error?: string;
  logs: Array<{
    timestamp: Date;
    level: "info" | "warning" | "error" | "debug";
    message: string;
    stepId?: string;
    data?: any;
  }>;
}

/**
 * Creates a new execution context for a playbook run
 */
export const createExecutionContext = (
  playbook: Playbook,
  initialVariables: Record<string, any> = {},
  alertId?: string,
  caseId?: string
): ExecutionContext => {
  return {
    playbookId: playbook.id,
    executionId: `exec-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`,
    variables: {
      ...initialVariables,
      playbook_name: playbook.name,
      execution_start_time: new Date().toISOString(),
    },
    stepResults: {},
    startTime: new Date(),
    status: ExecutionStatus.RUNNING,
    alertId,
    caseId,
    logs: [
      {
        timestamp: new Date(),
        level: "info",
        message: `Started execution of playbook: ${playbook.name}`,
        data: { playbookId: playbook.id },
      },
    ],
  };
};

/**
 * Logs a message to the execution context
 */
export const logToExecution = (
  context: ExecutionContext,
  level: "info" | "warning" | "error" | "debug",
  message: string,
  stepId?: string,
  data?: any
): ExecutionContext => {
  return {
    ...context,
    logs: [
      ...context.logs,
      {
        timestamp: new Date(),
        level,
        message,
        stepId,
        data,
      },
    ],
  };
};

/**
 * Find the initial step in a playbook (usually a trigger)
 */
const findInitialStep = (playbook: Playbook): PlaybookStep | undefined => {
  return playbook.steps.find((step) => step.type === "trigger");
};

/**
 * Find all next steps for a given step ID
 */
const findNextSteps = (playbook: Playbook, stepId: string): PlaybookStep[] => {
  const currentStep = playbook.steps.find((step) => step.id === stepId);
  if (
    !currentStep ||
    !currentStep.nextSteps ||
    currentStep.nextSteps.length === 0
  ) {
    return [];
  }

  return currentStep.nextSteps
    .map((nextStepId) => playbook.steps.find((step) => step.id === nextStepId))
    .filter((step): step is PlaybookStep => step !== undefined);
};

/**
 * Evaluates a condition to determine if a path should be followed
 */
const evaluateCondition = (
  condition: string,
  variables: Record<string, any>
): boolean => {
  try {
    // For security, we're using a simple approach. In production, you'd want a more
    // secure evaluation method or a dedicated expression language
    const safeEval = (code: string, context: Record<string, any>) => {
      const keys = Object.keys(context);
      const values = Object.values(context);
      // eslint-disable-next-line no-new-func
      const result = new Function(...keys, `return ${code}`).apply(
        null,
        values
      );
      return result;
    };

    return safeEval(condition, variables);
  } catch (error) {
    console.error("Error evaluating condition:", error);
    return false;
  }
};

/**
 * Execute a single step in the playbook
 */
export const executeStep = async (
  playbook: Playbook,
  step: PlaybookStep,
  context: ExecutionContext
): Promise<ExecutionContext> => {
  // First log the step execution to avoid type issues
  const newContext = logToExecution(
    context,
    "info",
    `Executing step: ${step.name}`,
    step.id
  );

  // Create a type-safe context with required currentStepId
  const contextWithCurrentStep: ExecutionContext = {
    ...newContext,
    currentStepId: step.id,
  };

  let updatedContext = contextWithCurrentStep;

  try {
    const startTime = new Date();
    let result: Partial<ExecutionStepResult> = {
      stepId: step.id,
      startTime,
      status: ExecutionStatus.RUNNING,
    };

    // Execute based on step type
    switch (step.type) {
      case "trigger":
        // Triggers are typically just entry points
        result = {
          ...result,
          status: ExecutionStatus.COMPLETED,
          output: { triggered: true },
        };
        break;

      case "action":
        // Here we would call the actual implementation of the action
        // For now, we'll simulate success
        result = {
          ...result,
          status: ExecutionStatus.COMPLETED,
          output: { action_executed: true, ...step.config },
        };
        break;

      case "condition":
        if (!step.config || !step.config.condition) {
          throw new Error("Condition step is missing condition configuration");
        }

        const conditionResult = evaluateCondition(
          step.config.condition,
          updatedContext.variables
        );
        result = {
          ...result,
          status: ExecutionStatus.COMPLETED,
          output: { condition_result: conditionResult },
        };

        // Update the next steps based on condition result
        if (step.config.truePath && step.config.falsePath) {
          const nextStepId = conditionResult
            ? step.config.truePath
            : step.config.falsePath;
          // Override the normal nextSteps with the condition path
          const nextStep = playbook.steps.find((s) => s.id === nextStepId);
          if (nextStep) {
            updatedContext = await executeStep(
              playbook,
              nextStep,
              updatedContext
            );
          }
          return updatedContext;
        }
        break;

      case "notification":
        // Simulate sending notification
        result = {
          ...result,
          status: ExecutionStatus.COMPLETED,
          output: { notification_sent: true, ...step.config },
        };
        break;

      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }

    // Complete the result
    const endTime = new Date();
    result.endTime = endTime;
    result.duration = endTime.getTime() - startTime.getTime();

    // Update the context with the result
    updatedContext = {
      ...updatedContext,
      stepResults: {
        ...updatedContext.stepResults,
        [step.id]: result as ExecutionStepResult,
      },
      variables: {
        ...updatedContext.variables,
        [`${step.id}_result`]: result.output,
        last_step_result: result.output,
      },
    };

    // Log step completion
    updatedContext = logToExecution(
      updatedContext,
      "info",
      `Completed step: ${step.name}`,
      step.id,
      result
    );

    // Execute next steps
    const nextSteps = findNextSteps(playbook, step.id);
    for (const nextStep of nextSteps) {
      updatedContext = await executeStep(playbook, nextStep, updatedContext);
    }

    return updatedContext;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log the error
    updatedContext = logToExecution(
      updatedContext,
      "error",
      `Error executing step ${step.name}: ${errorMessage}`,
      step.id,
      { error }
    );

    // Update the step result
    updatedContext = {
      ...updatedContext,
      stepResults: {
        ...updatedContext.stepResults,
        [step.id]: {
          stepId: step.id,
          startTime: new Date(),
          endTime: new Date(),
          status: ExecutionStatus.FAILED,
          error: errorMessage,
        },
      },
    };

    return updatedContext;
  }
};

/**
 * Execute a full playbook
 */
export const executePlaybook = async (
  playbook: Playbook,
  initialVariables: Record<string, any> = {},
  alertId?: string,
  caseId?: string
): Promise<PlaybookExecution> => {
  // Create the execution context
  let context = createExecutionContext(
    playbook,
    initialVariables,
    alertId,
    caseId
  );

  try {
    // Find the initial step
    const initialStep = findInitialStep(playbook);
    if (!initialStep) {
      throw new Error("Playbook has no trigger step");
    }

    // Execute the playbook starting from the initial step
    context = await executeStep(playbook, initialStep, context);

    // Mark execution as completed
    context = {
      ...context,
      status: ExecutionStatus.COMPLETED,
      endTime: new Date(),
      logs: [
        ...context.logs,
        {
          timestamp: new Date(),
          level: "info",
          message: `Completed execution of playbook: ${playbook.name}`,
          data: {
            playbookId: playbook.id,
            duration: context.endTime
              ? context.endTime.getTime() - context.startTime.getTime()
              : new Date().getTime() - context.startTime.getTime(),
          },
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Mark execution as failed
    context = {
      ...context,
      status: ExecutionStatus.FAILED,
      endTime: new Date(),
      error: errorMessage,
      logs: [
        ...context.logs,
        {
          timestamp: new Date(),
          level: "error",
          message: `Failed execution of playbook: ${playbook.name} - ${errorMessage}`,
          data: { error },
        },
      ],
    };
  }

  // Convert context to execution result
  const endTime = context.endTime || new Date();
  return {
    id: context.executionId,
    playbookId: context.playbookId,
    startTime: context.startTime,
    endTime: endTime,
    status: context.status,
    stepResults: context.stepResults,
    variables: context.variables,
    logs: context.logs,
    alertId: context.alertId,
    caseId: context.caseId,
    error: context.error,
  };
};

/**
 * Exports a summary of a playbook execution
 */
export const generateExecutionSummary = (
  execution: PlaybookExecution
): string => {
  const endTime = execution.endTime || new Date();
  const duration = endTime.getTime() - execution.startTime.getTime();
  const formattedDuration = `${Math.floor(duration / 1000)}s ${
    duration % 1000
  }ms`;

  const summary = [
    `Playbook Execution Summary`,
    `----------------------------`,
    `Execution ID: ${execution.id}`,
    `Playbook ID: ${execution.playbookId}`,
    `Status: ${execution.status}`,
    `Started: ${execution.startTime.toLocaleString()}`,
    `Ended: ${endTime.toLocaleString()}`,
    `Duration: ${formattedDuration}`,
    `Steps Executed: ${Object.keys(execution.stepResults).length}`,
    `Alert ID: ${execution.alertId || "N/A"}`,
    `Case ID: ${execution.caseId || "N/A"}`,
  ];

  if (execution.error) {
    summary.push(`Error: ${execution.error}`);
  }

  // Add step results
  summary.push(`\nStep Results:`);
  Object.values(execution.stepResults).forEach((step) => {
    const stepDuration = step.endTime
      ? step.endTime.getTime() - step.startTime.getTime()
      : 0;

    summary.push(`- ${step.stepId}: ${step.status} (${stepDuration}ms)`);
    if (step.error) {
      summary.push(`  Error: ${step.error}`);
    }
  });

  return summary.join("\n");
};
