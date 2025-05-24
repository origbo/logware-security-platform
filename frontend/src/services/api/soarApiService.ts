import axios from "axios";
import { getAuthHeaders } from "../../utils/authUtils";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// Playbook interface
export interface Playbook {
  id: string;
  name: string;
  description: string;
  status: "active" | "disabled" | "draft" | "archived";
  triggerType: "manual" | "scheduled" | "event-driven";
  triggerConditions?: any[];
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  steps: PlaybookStep[];
  tags?: string[];
  owner: string;
  successCount: number;
  failureCount: number;
  avgExecutionTime?: number;
}

// Playbook step interface
export interface PlaybookStep {
  id: string;
  name: string;
  type: "action" | "condition" | "notification" | "integration" | "wait";
  description?: string;
  config: any;
  position: number;
  status?: "pending" | "running" | "completed" | "failed" | "skipped";
  nextSteps?: string[];
}

// Playbook execution interface
export interface PlaybookExecution {
  id: string;
  playbookId: string;
  playbookName: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  startTime: string;
  endTime?: string;
  triggeredBy: string;
  triggerType: "manual" | "scheduled" | "event-driven";
  triggerDetails?: any;
  executionSteps: PlaybookExecutionStep[];
  variables?: Record<string, any>;
  artifacts?: any[];
  summary?: string;
}

// Playbook execution step interface
export interface PlaybookExecutionStep {
  id: string;
  stepId: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startTime: string;
  endTime?: string;
  output?: any;
  error?: string;
}

// SOAR integration interface
export interface SoarIntegration {
  id: string;
  name: string;
  type: string;
  description: string;
  enabled: boolean;
  config: any;
  actions: SoarIntegrationAction[];
  createdAt: string;
  updatedAt: string;
}

// SOAR integration action interface
export interface SoarIntegrationAction {
  id: string;
  name: string;
  description: string;
  parameters: SoarIntegrationActionParameter[];
  outputSchema?: any;
}

// SOAR integration action parameter interface
export interface SoarIntegrationActionParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  default?: any;
}

/**
 * SOAR API Service
 * Provides methods to interact with the SOAR features of the platform
 */
export const soarApiService = {
  /**
   * Get all playbooks
   * @param filters Optional filters for playbooks
   */
  getPlaybooks: async (filters?: Record<string, any>) => {
    try {
      const response = await axios.get(`${API_URL}/api/soar/playbooks`, {
        headers: getAuthHeaders(),
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching playbooks:", error);
      throw error;
    }
  },

  /**
   * Get playbook by ID
   * @param id Playbook ID
   */
  getPlaybook: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/soar/playbooks/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching playbook with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new playbook
   * @param playbook Playbook data
   */
  createPlaybook: async (
    playbook: Omit<Playbook, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/soar/playbooks`,
        playbook,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating playbook:", error);
      throw error;
    }
  },

  /**
   * Update an existing playbook
   * @param id Playbook ID
   * @param playbook Updated playbook data
   */
  updatePlaybook: async (id: string, playbook: Partial<Playbook>) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/soar/playbooks/${id}`,
        playbook,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating playbook with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a playbook
   * @param id Playbook ID
   */
  deletePlaybook: async (id: string) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/soar/playbooks/${id}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting playbook with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Execute a playbook
   * @param id Playbook ID
   * @param params Optional parameters for execution
   */
  executePlaybook: async (id: string, params?: Record<string, any>) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/soar/playbooks/${id}/execute`,
        params || {},
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error executing playbook with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get playbook execution history
   * @param playbookId Playbook ID
   * @param filters Optional filters for executions
   */
  getPlaybookExecutions: async (
    playbookId: string,
    filters?: Record<string, any>
  ) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/soar/playbooks/${playbookId}/executions`,
        {
          headers: getAuthHeaders(),
          params: filters,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching executions for playbook with ID ${playbookId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Get execution details by ID
   * @param executionId Execution ID
   */
  getExecutionDetails: async (executionId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/soar/executions/${executionId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching execution details with ID ${executionId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Cancel a running playbook execution
   * @param executionId Execution ID
   */
  cancelExecution: async (executionId: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/soar/executions/${executionId}/cancel`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error cancelling execution with ID ${executionId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Get available SOAR integrations
   */
  getIntegrations: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/soar/integrations`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching SOAR integrations:", error);
      throw error;
    }
  },

  /**
   * Get integration details by ID
   * @param integrationId Integration ID
   */
  getIntegrationDetails: async (integrationId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/soar/integrations/${integrationId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching integration details with ID ${integrationId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Test an integration action
   * @param integrationId Integration ID
   * @param actionId Action ID
   * @param params Action parameters
   */
  testIntegrationAction: async (
    integrationId: string,
    actionId: string,
    params: Record<string, any>
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/soar/integrations/${integrationId}/actions/${actionId}/test`,
        params,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error testing integration action:`, error);
      throw error;
    }
  },

  /**
   * Get SOAR dashboard metrics
   */
  getDashboardMetrics: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/soar/dashboard`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching SOAR dashboard metrics:", error);
      throw error;
    }
  },
};

export default soarApiService;
