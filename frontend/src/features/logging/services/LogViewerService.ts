import { getAuthHeaders } from "../../../utils/authUtils";

// Log level enum
export enum LogLevel {
  ERROR = "ERROR",
  WARNING = "WARNING",
  INFO = "INFO",
  DEBUG = "DEBUG",
  TRACE = "TRACE",
}

// Log source enum
export enum LogSource {
  APPLICATION = "APPLICATION",
  SECURITY = "SECURITY",
  SYSTEM = "SYSTEM",
  NETWORK = "NETWORK",
  DATABASE = "DATABASE",
  API = "API",
  AUDIT = "AUDIT",
}

// Log entry interface
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  details?: any;
  correlationId?: string;
  userId?: string;
  ipAddress?: string;
  tags?: string[];
}

// Log filter interface
export interface LogFilter {
  levels?: LogLevel[];
  sources?: LogSource[];
  startTime?: string;
  endTime?: string;
  searchTerm?: string;
  userId?: string;
  correlationId?: string;
  ipAddress?: string;
  limit?: number;
  page?: number;
  tags?: string[];
}

// WebSocket message types
export enum LogWSMessageType {
  CONNECT = "CONNECT",
  SUBSCRIBE = "SUBSCRIBE",
  UNSUBSCRIBE = "UNSUBSCRIBE",
  LOG_ENTRY = "LOG_ENTRY",
  ERROR = "ERROR",
  HEARTBEAT = "HEARTBEAT",
}

// WebSocket message
export interface LogWSMessage {
  type: LogWSMessageType;
  payload?: any;
}

/**
 * Log Viewer Service
 *
 * Provides methods to interact with the logging system, including WebSocket
 * connection for real-time log streaming.
 */
class LogViewerService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: any = null;
  private heartbeatInterval: any = null;
  private onMessageCallbacks: ((entry: LogEntry) => void)[] = [];
  private onErrorCallbacks: ((error: any) => void)[] = [];
  private onConnectCallbacks: (() => void)[] = [];
  private onDisconnectCallbacks: (() => void)[] = [];
  private apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";

  /**
   * Get logs based on filters
   * @param filter Log filter parameters
   * @returns Promise with log entries
   */
  async getLogs(filter: LogFilter = {}): Promise<LogEntry[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filter.levels && filter.levels.length > 0) {
        queryParams.append("levels", filter.levels.join(","));
      }

      if (filter.sources && filter.sources.length > 0) {
        queryParams.append("sources", filter.sources.join(","));
      }

      if (filter.startTime) {
        queryParams.append("startTime", filter.startTime);
      }

      if (filter.endTime) {
        queryParams.append("endTime", filter.endTime);
      }

      if (filter.searchTerm) {
        queryParams.append("searchTerm", filter.searchTerm);
      }

      if (filter.userId) {
        queryParams.append("userId", filter.userId);
      }

      if (filter.correlationId) {
        queryParams.append("correlationId", filter.correlationId);
      }

      if (filter.ipAddress) {
        queryParams.append("ipAddress", filter.ipAddress);
      }

      if (filter.limit) {
        queryParams.append("limit", filter.limit.toString());
      }

      if (filter.page) {
        queryParams.append("page", filter.page.toString());
      }

      if (filter.tags && filter.tags.length > 0) {
        queryParams.append("tags", filter.tags.join(","));
      }

      const response = await fetch(
        `${this.apiUrl}/api/logs?${queryParams.toString()}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.logs as LogEntry[];
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
  }

  /**
   * Connect to WebSocket for real-time logs
   * @param filter Log filter for subscription
   */
  connectWebSocket(filter: LogFilter = {}): void {
    // Get auth token
    const headers = getAuthHeaders();
    const token = headers["Authorization"]?.split(" ")[1];

    if (!token) {
      this.triggerErrorCallbacks(new Error("Authentication token not found"));
      return;
    }

    // Close existing connection if any
    this.disconnectWebSocket();

    // Create WebSocket connection
    const wsUrl = this.apiUrl.replace(/^http/, "ws");
    this.ws = new WebSocket(`${wsUrl}/ws/logs?token=${token}`);

    // Set up event handlers
    this.ws.onopen = () => {
      console.log("WebSocket connection established");
      this.reconnectAttempts = 0;

      // Subscribe to logs with filter
      this.sendMessage({
        type: LogWSMessageType.SUBSCRIBE,
        payload: { filter },
      });

      // Start heartbeat
      this.startHeartbeat();

      // Trigger connect callbacks
      this.triggerConnectCallbacks();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as LogWSMessage;

        switch (message.type) {
          case LogWSMessageType.LOG_ENTRY:
            this.triggerMessageCallbacks(message.payload as LogEntry);
            break;
          case LogWSMessageType.ERROR:
            this.triggerErrorCallbacks(message.payload);
            break;
          case LogWSMessageType.HEARTBEAT:
            // Heartbeat received, connection is active
            break;
          default:
            console.log("Unhandled message type:", message.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.triggerErrorCallbacks(error);
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed");
      this.stopHeartbeat();
      this.triggerDisconnectCallbacks();

      // Try to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(
          1000 * Math.pow(2, this.reconnectAttempts),
          30000
        );

        console.log(
          `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
        );

        this.reconnectTimeout = setTimeout(() => {
          this.connectWebSocket(filter);
        }, delay);
      }
    };
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.ws) {
      // Clear heartbeat and reconnect timeout
      this.stopHeartbeat();
      clearTimeout(this.reconnectTimeout);

      // Close connection
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Update log filter
   * @param filter Updated log filter
   */
  updateFilter(filter: LogFilter): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: LogWSMessageType.SUBSCRIBE,
        payload: { filter },
      });
    }
  }

  /**
   * Send message over WebSocket
   * @param message Message to send
   */
  private sendMessage(message: LogWSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Start heartbeat interval
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      this.sendMessage({ type: LogWSMessageType.HEARTBEAT });
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat interval
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Register callback for new log messages
   * @param callback Function to call with new log entry
   */
  onMessage(callback: (entry: LogEntry) => void): void {
    this.onMessageCallbacks.push(callback);
  }

  /**
   * Register callback for errors
   * @param callback Function to call on error
   */
  onError(callback: (error: any) => void): void {
    this.onErrorCallbacks.push(callback);
  }

  /**
   * Register callback for connection established
   * @param callback Function to call when connected
   */
  onConnect(callback: () => void): void {
    this.onConnectCallbacks.push(callback);
  }

  /**
   * Register callback for connection closed
   * @param callback Function to call when disconnected
   */
  onDisconnect(callback: () => void): void {
    this.onDisconnectCallbacks.push(callback);
  }

  /**
   * Remove message callback
   * @param callback Callback to remove
   */
  removeMessageCallback(callback: (entry: LogEntry) => void): void {
    this.onMessageCallbacks = this.onMessageCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Remove error callback
   * @param callback Callback to remove
   */
  removeErrorCallback(callback: (error: any) => void): void {
    this.onErrorCallbacks = this.onErrorCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Remove connect callback
   * @param callback Callback to remove
   */
  removeConnectCallback(callback: () => void): void {
    this.onConnectCallbacks = this.onConnectCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Remove disconnect callback
   * @param callback Callback to remove
   */
  removeDisconnectCallback(callback: () => void): void {
    this.onDisconnectCallbacks = this.onDisconnectCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Trigger message callbacks
   * @param entry Log entry
   */
  private triggerMessageCallbacks(entry: LogEntry): void {
    this.onMessageCallbacks.forEach((callback) => callback(entry));
  }

  /**
   * Trigger error callbacks
   * @param error Error
   */
  private triggerErrorCallbacks(error: any): void {
    this.onErrorCallbacks.forEach((callback) => callback(error));
  }

  /**
   * Trigger connect callbacks
   */
  private triggerConnectCallbacks(): void {
    this.onConnectCallbacks.forEach((callback) => callback());
  }

  /**
   * Trigger disconnect callbacks
   */
  private triggerDisconnectCallbacks(): void {
    this.onDisconnectCallbacks.forEach((callback) => callback());
  }

  /**
   * Export logs to file
   * @param filter Log filter
   * @param format Export format ('csv' or 'json')
   */
  async exportLogs(
    filter: LogFilter,
    format: "csv" | "json" = "csv"
  ): Promise<void> {
    try {
      const queryParams = new URLSearchParams();

      // Add filter parameters
      if (filter.levels && filter.levels.length > 0) {
        queryParams.append("levels", filter.levels.join(","));
      }

      if (filter.sources && filter.sources.length > 0) {
        queryParams.append("sources", filter.sources.join(","));
      }

      if (filter.startTime) {
        queryParams.append("startTime", filter.startTime);
      }

      if (filter.endTime) {
        queryParams.append("endTime", filter.endTime);
      }

      if (filter.searchTerm) {
        queryParams.append("searchTerm", filter.searchTerm);
      }

      if (filter.userId) {
        queryParams.append("userId", filter.userId);
      }

      queryParams.append("format", format);

      // Create download link
      const headers = getAuthHeaders();
      const token = headers["Authorization"]?.split(" ")[1];

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const url = `${
        this.apiUrl
      }/api/logs/export?${queryParams.toString()}&token=${token}`;

      // Trigger file download
      const link = document.createElement("a");
      link.href = url;
      link.download = `logs_export_${new Date().toISOString()}.${format}`;
      link.click();
    } catch (error) {
      console.error("Error exporting logs:", error);
      throw error;
    }
  }
}

export const logViewerService = new LogViewerService();
export default logViewerService;
