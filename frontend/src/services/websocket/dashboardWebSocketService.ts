import { Subject } from "rxjs";
import { WidgetType } from "../dashboard/dashboardService";

/**
 * Interface for WebSocket messages received from the server
 */
export interface WebSocketMessage {
  type: "widget_data" | "alert" | "system_status" | "notification" | "error";
  payload: any;
  timestamp: string;
}

/**
 * Interface for widget update messages
 */
export interface WidgetUpdateMessage {
  widgetId: string;
  widgetType: WidgetType;
  data: any;
  timestamp: string;
}

/**
 * Service class for managing WebSocket connections for real-time dashboard updates
 */
export class DashboardWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageSubject = new Subject<WebSocketMessage>();
  private widgetUpdateSubject = new Subject<WidgetUpdateMessage>();
  private isConnecting = false;

  // Authentication token for secure connection
  private authToken = "";

  /**
   * Get base WebSocket URL from environment or use default
   */
  private getWebSocketUrl(): string {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl =
      process.env.REACT_APP_WS_URL ||
      `${wsProtocol}//${window.location.host}/api/ws`;
    return wsUrl;
  }

  /**
   * Initialize the WebSocket connection
   * @param token Authentication token for secure connection
   */
  public connect(token: string): void {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.authToken = token;
    this.isConnecting = true;

    try {
      const wsUrl = `${this.getWebSocketUrl()}?token=${encodeURIComponent(
        token
      )}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(event: Event): void {
    console.log("WebSocket connection established");
    this.isConnecting = false;
    this.reconnectAttempts = 0;

    // Subscribe to dashboard updates
    this.subscribeToAllWidgets();
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;

      // Emit the raw message
      this.messageSubject.next(message);

      // Handle widget data updates
      if (message.type === "widget_data" && message.payload) {
        const widgetUpdate: WidgetUpdateMessage = {
          widgetId: message.payload.widgetId,
          widgetType: message.payload.widgetType,
          data: message.payload.data,
          timestamp: message.timestamp,
        };
        this.widgetUpdateSubject.next(widgetUpdate);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    this.isConnecting = false;

    // Only attempt to reconnect if not closed cleanly (codes 1000 or 1001)
    if (event.code !== 1000 && event.code !== 1001) {
      this.attemptReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error("WebSocket error:", event);
    this.isConnecting = false;
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      const delay =
        this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`
      );

      this.reconnectTimer = setTimeout(() => {
        if (this.authToken) {
          this.connect(this.authToken);
        }
      }, delay);
    } else {
      console.error("Maximum reconnection attempts reached");
      // Emit an error message to subscribers
      this.messageSubject.next({
        type: "error",
        payload: {
          message:
            "WebSocket connection failed after maximum reconnection attempts",
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Subscribe to updates for all widgets on the active dashboard
   */
  private subscribeToAllWidgets(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          action: "subscribe",
          target: "dashboard",
          payload: { subscribeToAll: true },
        })
      );
    }
  }

  /**
   * Subscribe to updates for a specific widget
   */
  public subscribeToWidget(widgetId: string, widgetType: WidgetType): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          action: "subscribe",
          target: "widget",
          payload: { widgetId, widgetType },
        })
      );
    }
  }

  /**
   * Unsubscribe from updates for a specific widget
   */
  public unsubscribeFromWidget(widgetId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          action: "unsubscribe",
          target: "widget",
          payload: { widgetId },
        })
      );
    }
  }

  /**
   * Close the WebSocket connection
   */
  public disconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close(1000, "Client initiated disconnect");
      this.socket = null;
    }
  }

  /**
   * Get an observable for all WebSocket messages
   */
  public getMessages(): Subject<WebSocketMessage> {
    return this.messageSubject;
  }

  /**
   * Get an observable for widget data updates
   */
  public getWidgetUpdates(): Subject<WidgetUpdateMessage> {
    return this.widgetUpdateSubject;
  }
}

// Create a singleton instance
const dashboardWebSocketService = new DashboardWebSocketService();
export default dashboardWebSocketService;
