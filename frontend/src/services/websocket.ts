import { io, Socket } from "socket.io-client";

// WebSocket event handler type
export type WebSocketEventHandler = (event: WebSocketEvent) => void;

// WebSocket error handler type
export type WebSocketErrorHandler = (error: Error) => void;

// WebSocket event type
export interface WebSocketEvent {
  type: "alert" | "notification" | "log" | "system" | "user-status";
  message: string;
  severity?: "critical" | "high" | "medium" | "low" | "info";
  timestamp: string;
  data?: any;
}

// Socket instance
let socket: Socket | null = null;

// Event handlers registry
const eventHandlers: WebSocketEventHandler[] = [];
const errorHandlers: WebSocketErrorHandler[] = [];

// Reconnection settings
const MAX_RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 2000;
let reconnectionAttempts = 0;
let reconnectionTimer: NodeJS.Timeout | null = null;

/**
 * Set up the WebSocket connection with authentication
 * @param eventHandler - Event handler function
 * @param errorHandler - Error handler function
 */
export const setupWebSocket = (
  eventHandler?: WebSocketEventHandler,
  errorHandler?: WebSocketErrorHandler
): void => {
  // Register handlers
  if (eventHandler) {
    eventHandlers.push(eventHandler);
  }

  if (errorHandler) {
    errorHandlers.push(errorHandler);
  }

  // If socket already exists, do nothing
  if (socket) {
    return;
  }

  // Get auth token
  const token = localStorage.getItem("accessToken");
  if (!token) {
    const error = new Error("Authentication token not found");
    handleError(error);
    return;
  }

  const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8081";

  try {
    // Initialize socket connection
    socket = io(WS_URL, {
      path: process.env.REACT_APP_WS_PATH || "/ws",
      auth: { token },
      query: { token },
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
      reconnectionDelay: RECONNECTION_DELAY,
      timeout: 10000,
    });

    // Set up event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleSocketError);
    socket.on("connect_error", handleConnectionError);
    socket.on("reconnect_failed", handleReconnectFailed);

    // Set up custom event listeners
    socket.on("alerts", handleAlertEvent);
    socket.on("notifications", handleNotificationEvent);
    socket.on("logs:entry", handleLogEvent);
    socket.on("system", handleSystemEvent);
    socket.on("user:status:update", handleUserStatusEvent);

    console.log("WebSocket setup complete");
  } catch (error) {
    handleError(error as Error);
  }
};

/**
 * Close the WebSocket connection
 */
export const closeWebSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Clear any reconnection timer
  if (reconnectionTimer) {
    clearTimeout(reconnectionTimer);
    reconnectionTimer = null;
  }

  // Reset reconnection attempts
  reconnectionAttempts = 0;

  console.log("WebSocket connection closed");
};

/**
 * Remove specific event handler
 * @param eventHandler - Event handler to remove
 */
export const removeEventHandler = (
  eventHandler: WebSocketEventHandler
): void => {
  const index = eventHandlers.indexOf(eventHandler);
  if (index !== -1) {
    eventHandlers.splice(index, 1);
  }
};

/**
 * Remove specific error handler
 * @param errorHandler - Error handler to remove
 */
export const removeErrorHandler = (
  errorHandler: WebSocketErrorHandler
): void => {
  const index = errorHandlers.indexOf(errorHandler);
  if (index !== -1) {
    errorHandlers.splice(index, 1);
  }
};

/**
 * Subscribe to log events with filters
 * @param filters - Log filters
 */
export const subscribeToLogs = (filters: any = {}): void => {
  if (!socket || !socket.connected) {
    const error = new Error("WebSocket not connected");
    handleError(error);
    return;
  }

  socket.emit("subscribe:logs", filters);
};

/**
 * Unsubscribe from log events
 */
export const unsubscribeFromLogs = (): void => {
  if (!socket || !socket.connected) {
    return;
  }

  socket.emit("unsubscribe:logs");
};

/**
 * Acknowledge an alert
 * @param alertId - Alert ID to acknowledge
 */
export const acknowledgeAlert = (alertId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!socket || !socket.connected) {
      reject(new Error("WebSocket not connected"));
      return;
    }

    // Set up one-time event listener for success response
    socket.once("alert:acknowledge:success", (data) => {
      if (data.alertId === alertId) {
        resolve(true);
      } else {
        reject(new Error("Alert ID mismatch"));
      }
    });

    // Set up one-time event listener for error response
    socket.once("error", (error) => {
      reject(new Error(error.message || "Failed to acknowledge alert"));
    });

    // Send acknowledge request
    socket.emit("alert:acknowledge", { alertId });

    // Set a timeout for the operation
    setTimeout(() => {
      reject(new Error("Acknowledge operation timed out"));
    }, 5000);
  });
};

/**
 * Update user status (online, away, busy, etc.)
 * @param status - User status
 */
export const updateUserStatus = (
  status: "online" | "away" | "busy" | "offline"
): void => {
  if (!socket || !socket.connected) {
    return;
  }

  socket.emit("user:status", status);
};

// Event Handlers

/**
 * Handle socket connection event
 */
const handleConnect = (): void => {
  console.log("WebSocket connected");
  reconnectionAttempts = 0;

  // Broadcast event
  broadcastEvent({
    type: "system",
    message: "Connected to real-time server",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Handle socket disconnection event
 */
const handleDisconnect = (reason: string): void => {
  console.log("WebSocket disconnected:", reason);

  // Broadcast event
  broadcastEvent({
    type: "system",
    message: "Disconnected from real-time server",
    timestamp: new Date().toISOString(),
    data: { reason },
  });

  // Try to reconnect if disconnected unexpectedly and not due to explicit closure
  if (
    reason === "io server disconnect" ||
    reason === "transport close" ||
    reason === "ping timeout"
  ) {
    attemptReconnection();
  }
};

/**
 * Handle socket error event
 */
const handleSocketError = (error: Error): void => {
  console.error("WebSocket error:", error);
  handleError(error);
};

/**
 * Handle connection error event
 */
const handleConnectionError = (error: Error): void => {
  console.error("WebSocket connection error:", error);
  handleError(error);

  // Attempt to reconnect
  attemptReconnection();
};

/**
 * Handle reconnection failure event
 */
const handleReconnectFailed = (): void => {
  console.error("WebSocket reconnection failed after multiple attempts");

  // Broadcast event
  broadcastEvent({
    type: "system",
    message: "Failed to reconnect to real-time server",
    severity: "high",
    timestamp: new Date().toISOString(),
  });

  // Reset socket and attempt manual reconnection after delay
  socket = null;
  attemptReconnection();
};

/**
 * Handle alert events
 */
const handleAlertEvent = (data: any): void => {
  broadcastEvent({
    type: "alert",
    message: data.title || "New security alert",
    severity: data.severity,
    timestamp: data.timestamp || new Date().toISOString(),
    data,
  });
};

/**
 * Handle notification events
 */
const handleNotificationEvent = (data: any): void => {
  broadcastEvent({
    type: "notification",
    message: data.message || "New notification",
    severity: data.severity,
    timestamp: data.timestamp || new Date().toISOString(),
    data,
  });
};

/**
 * Handle log events
 */
const handleLogEvent = (data: any): void => {
  broadcastEvent({
    type: "log",
    message: data.message || "New log entry",
    severity: mapLogLevelToSeverity(data.level),
    timestamp: data.timestamp || new Date().toISOString(),
    data,
  });
};

/**
 * Handle system events
 */
const handleSystemEvent = (data: any): void => {
  broadcastEvent({
    type: "system",
    message: data.message || "System event",
    severity: data.severity,
    timestamp: data.timestamp || new Date().toISOString(),
    data,
  });
};

/**
 * Handle user status events
 */
const handleUserStatusEvent = (data: any): void => {
  broadcastEvent({
    type: "user-status",
    message: `User ${data.userId} is now ${data.status}`,
    timestamp: data.timestamp || new Date().toISOString(),
    data,
  });
};

// Helper functions

/**
 * Broadcast event to all registered handlers
 */
const broadcastEvent = (event: WebSocketEvent): void => {
  eventHandlers.forEach((handler) => {
    try {
      handler(event);
    } catch (error) {
      console.error("Error in WebSocket event handler:", error);
    }
  });
};

/**
 * Handle errors and broadcast to all registered error handlers
 */
const handleError = (error: Error): void => {
  errorHandlers.forEach((handler) => {
    try {
      handler(error);
    } catch (handlerError) {
      console.error("Error in WebSocket error handler:", handlerError);
    }
  });
};

/**
 * Attempt to reconnect to the WebSocket server
 */
const attemptReconnection = (): void => {
  // Clear any existing reconnection timer
  if (reconnectionTimer) {
    clearTimeout(reconnectionTimer);
  }

  // Check if maximum reconnection attempts reached
  if (reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
    console.error("Maximum reconnection attempts reached");

    broadcastEvent({
      type: "system",
      message: "Failed to connect to real-time server after multiple attempts",
      severity: "high",
      timestamp: new Date().toISOString(),
    });

    return;
  }

  // Increment reconnection attempts
  reconnectionAttempts++;

  // Exponential backoff for reconnection delay
  const delay = RECONNECTION_DELAY * Math.pow(1.5, reconnectionAttempts - 1);

  console.log(
    `Attempting to reconnect in ${delay}ms (attempt ${reconnectionAttempts}/${MAX_RECONNECTION_ATTEMPTS})`
  );

  // Set timer for reconnection
  reconnectionTimer = setTimeout(() => {
    // If socket exists, close it
    if (socket) {
      socket.close();
      socket = null;
    }

    // Setup WebSocket again
    setupWebSocket();
  }, delay);
};

/**
 * Map log level to severity
 */
const mapLogLevelToSeverity = (
  level: string
): "critical" | "high" | "medium" | "low" | "info" => {
  switch (level?.toLowerCase()) {
    case "critical":
      return "critical";
    case "error":
      return "high";
    case "warning":
      return "medium";
    case "info":
      return "info";
    case "debug":
      return "low";
    default:
      return "info";
  }
};
