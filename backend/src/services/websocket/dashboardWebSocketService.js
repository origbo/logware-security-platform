const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');
const config = require('../../config');

/**
 * Dashboard WebSocket Service
 * 
 * Manages real-time connections and provides push notifications for dashboard widgets
 * Handles authentication, subscriptions, and message broadcasting
 */
class DashboardWebSocketService {
  constructor() {
    this.server = null;
    this.clients = new Map(); // Map of client connections with auth and subscription info
    this.widgetSubscriptions = new Map(); // Map of widget IDs to client IDs
    this.messageHandlers = new Map(); // Map of message types to handler functions
  }

  /**
   * Initialize WebSocket server
   * @param {object} httpServer - HTTP server instance to attach WebSocket server to
   */
  initialize(httpServer) {
    // Create WebSocket server
    this.server = new WebSocket.Server({
      server: httpServer,
      path: '/api/ws/dashboard'
    });

    // Set up event listeners
    this.server.on('connection', this.handleConnection.bind(this));

    // Register message handlers
    this.registerMessageHandlers();

    logger.info('Dashboard WebSocket service initialized');
  }

  /**
   * Register message handlers for different message types
   */
  registerMessageHandlers() {
    // Authentication
    this.messageHandlers.set('authenticate', this.handleAuthentication.bind(this));
    
    // Widget subscriptions
    this.messageHandlers.set('subscribe', this.handleSubscription.bind(this));
    this.messageHandlers.set('unsubscribe', this.handleUnsubscription.bind(this));
    
    // Ping/pong for connection health
    this.messageHandlers.set('ping', this.handlePing.bind(this));
  }

  /**
   * Handle new WebSocket connection
   * @param {WebSocket} ws - WebSocket connection
   * @param {object} req - HTTP request object
   */
  handleConnection(ws, req) {
    // Generate client ID
    const clientId = uuidv4();
    
    // Initialize client state
    this.clients.set(clientId, {
      socket: ws,
      isAuthenticated: false,
      userId: null,
      subscriptions: new Set(),
      connectedAt: new Date()
    });
    
    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connection',
      clientId,
      message: 'Connected to Logware Security Platform WebSocket server',
      timestamp: new Date().toISOString()
    });
    
    // Setup message handler
    ws.on('message', (message) => this.handleMessage(clientId, message));
    
    // Setup close handler
    ws.on('close', () => this.handleDisconnection(clientId));
    
    // Setup error handler
    ws.on('error', (error) => this.handleError(clientId, error));
    
    logger.debug(`WebSocket client connected: ${clientId}`);
  }
  
  /**
   * Handle client message
   * @param {string} clientId - Client identifier
   * @param {string} message - Raw message data
   */
  handleMessage(clientId, message) {
    try {
      // Parse message
      const parsedMessage = JSON.parse(message);
      const { type } = parsedMessage;
      
      // Check if handler exists for message type
      if (this.messageHandlers.has(type)) {
        // Call appropriate handler
        this.messageHandlers.get(type)(clientId, parsedMessage);
      } else {
        logger.warn(`Unhandled message type: ${type}`);
        this.sendError(clientId, 'Unsupported message type');
      }
    } catch (error) {
      logger.error(`Error handling WebSocket message: ${error.message}`);
      this.sendError(clientId, 'Invalid message format');
    }
  }
  
  /**
   * Handle client authentication
   * @param {string} clientId - Client identifier
   * @param {object} message - Parsed message object
   */
  handleAuthentication(clientId, message) {
    const { token } = message;
    const client = this.clients.get(clientId);
    
    if (!client) {
      return;
    }
    
    // Already authenticated
    if (client.isAuthenticated) {
      this.sendToClient(clientId, {
        type: 'auth_result',
        success: true,
        message: 'Already authenticated'
      });
      return;
    }
    
    // No token provided
    if (!token) {
      this.sendError(clientId, 'No authentication token provided');
      return;
    }
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, config.auth.jwtSecret);
      
      // Update client state
      client.isAuthenticated = true;
      client.userId = decoded.userId;
      
      // Send success response
      this.sendToClient(clientId, {
        type: 'auth_result',
        success: true,
        message: 'Authentication successful'
      });
      
      logger.debug(`WebSocket client authenticated: ${clientId}, userId: ${decoded.userId}`);
    } catch (error) {
      logger.warn(`Authentication failed: ${error.message}`);
      this.sendError(clientId, 'Authentication failed');
    }
  }
  
  /**
   * Handle widget subscription
   * @param {string} clientId - Client identifier
   * @param {object} message - Parsed message object
   */
  handleSubscription(clientId, message) {
    const { widgetId, type } = message;
    const client = this.clients.get(clientId);
    
    if (!client) {
      return;
    }
    
    // Check if client is authenticated
    if (!client.isAuthenticated) {
      this.sendError(clientId, 'Authentication required');
      return;
    }
    
    // Validate widget ID
    if (!widgetId) {
      this.sendError(clientId, 'Widget ID is required');
      return;
    }
    
    // Add to client subscriptions
    client.subscriptions.add(widgetId);
    
    // Update widget subscriptions map
    if (!this.widgetSubscriptions.has(widgetId)) {
      this.widgetSubscriptions.set(widgetId, new Set());
    }
    this.widgetSubscriptions.get(widgetId).add(clientId);
    
    // Send subscription confirmation
    this.sendToClient(clientId, {
      type: 'subscription_result',
      success: true,
      widgetId,
      message: 'Successfully subscribed'
    });
    
    logger.debug(`Client ${clientId} subscribed to widget ${widgetId}`);
    
    // Send initial data if available (could fetch from cache or database)
    this.sendInitialData(clientId, widgetId, type);
  }
  
  /**
   * Handle widget unsubscription
   * @param {string} clientId - Client identifier
   * @param {object} message - Parsed message object
   */
  handleUnsubscription(clientId, message) {
    const { widgetId } = message;
    const client = this.clients.get(clientId);
    
    if (!client || !widgetId) {
      return;
    }
    
    // Remove from client subscriptions
    client.subscriptions.delete(widgetId);
    
    // Remove from widget subscriptions
    if (this.widgetSubscriptions.has(widgetId)) {
      this.widgetSubscriptions.get(widgetId).delete(clientId);
      
      // Clean up empty sets
      if (this.widgetSubscriptions.get(widgetId).size === 0) {
        this.widgetSubscriptions.delete(widgetId);
      }
    }
    
    // Send unsubscription confirmation
    this.sendToClient(clientId, {
      type: 'unsubscription_result',
      success: true,
      widgetId,
      message: 'Successfully unsubscribed'
    });
    
    logger.debug(`Client ${clientId} unsubscribed from widget ${widgetId}`);
  }
  
  /**
   * Handle ping message (keep-alive)
   * @param {string} clientId - Client identifier
   */
  handlePing(clientId) {
    this.sendToClient(clientId, {
      type: 'pong',
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Handle client disconnection
   * @param {string} clientId - Client identifier
   */
  handleDisconnection(clientId) {
    const client = this.clients.get(clientId);
    
    if (!client) {
      return;
    }
    
    // Clean up widget subscriptions
    for (const widgetId of client.subscriptions) {
      if (this.widgetSubscriptions.has(widgetId)) {
        this.widgetSubscriptions.get(widgetId).delete(clientId);
        
        // Remove widget subscription entry if empty
        if (this.widgetSubscriptions.get(widgetId).size === 0) {
          this.widgetSubscriptions.delete(widgetId);
        }
      }
    }
    
    // Remove client
    this.clients.delete(clientId);
    
    logger.debug(`WebSocket client disconnected: ${clientId}`);
  }
  
  /**
   * Handle connection error
   * @param {string} clientId - Client identifier
   * @param {Error} error - Error object
   */
  handleError(clientId, error) {
    logger.error(`WebSocket error for client ${clientId}: ${error.message}`);
    
    // Remove client on terminal errors
    this.handleDisconnection(clientId);
  }
  
  /**
   * Send data to a specific client
   * @param {string} clientId - Client identifier
   * @param {object} data - Data to send
   */
  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    
    if (!client || !client.socket || client.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    try {
      client.socket.send(JSON.stringify(data));
    } catch (error) {
      logger.error(`Error sending message to client ${clientId}: ${error.message}`);
    }
  }
  
  /**
   * Send data to all clients subscribed to a widget
   * @param {string} widgetId - Widget identifier
   * @param {object} data - Data to send
   */
  broadcastToWidget(widgetId, data) {
    if (!this.widgetSubscriptions.has(widgetId)) {
      return;
    }
    
    // Prepare message
    const message = {
      type: 'widget_update',
      widgetId,
      data,
      timestamp: new Date().toISOString()
    };
    
    // Send to all subscribed clients
    for (const clientId of this.widgetSubscriptions.get(widgetId)) {
      this.sendToClient(clientId, message);
    }
    
    logger.debug(`Broadcast update to widget ${widgetId}, recipients: ${this.widgetSubscriptions.get(widgetId).size}`);
  }
  
  /**
   * Send error message to client
   * @param {string} clientId - Client identifier
   * @param {string} message - Error message
   */
  sendError(clientId, message) {
    this.sendToClient(clientId, {
      type: 'error',
      message,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Send initial data for a widget
   * @param {string} clientId - Client identifier
   * @param {string} widgetId - Widget identifier
   * @param {string} widgetType - Widget type
   */
  async sendInitialData(clientId, widgetId, widgetType) {
    try {
      // This would typically fetch data from a database or cache
      // For now, we'll use mock data
      const mockData = await this.getMockDataForWidget(widgetType);
      
      if (mockData) {
        this.sendToClient(clientId, {
          type: 'widget_update',
          widgetId,
          data: mockData,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error(`Error sending initial data for widget ${widgetId}: ${error.message}`);
    }
  }
  
  /**
   * Get mock data for widget (for development)
   * @param {string} widgetType - Widget type
   * @returns {Promise<object>} Mock data object
   */
  async getMockDataForWidget(widgetType) {
    // This would be replaced with actual data fetching in production
    // Different mock data based on widget type
    switch (widgetType) {
      case 'alertsSummary':
        return {
          alertCounts: {
            critical: 3,
            high: 7,
            medium: 12,
            low: 18,
            info: 5,
          },
          totalAlerts: 45,
          recentAlerts: [
            {
              id: 'alert-1',
              title: 'Failed login attempts detected',
              severity: 'critical',
              source: 'Authentication Service',
              timestamp: new Date().toISOString(),
              acknowledged: false,
            },
            {
              id: 'alert-2',
              title: 'Unusual network traffic pattern detected',
              severity: 'high',
              source: 'Network Monitor',
              timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
              acknowledged: true,
            },
            {
              id: 'alert-3',
              title: 'Malware signature match in uploaded file',
              severity: 'critical',
              source: 'Malware Scanner',
              timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
              acknowledged: false,
            },
          ],
          updatedAt: new Date().toISOString()
        };
        
      case 'systemHealth':
        return {
          status: 'healthy',
          cpuUsage: 42,
          memoryUsage: 65,
          diskUsage: 78,
          services: [
            { name: 'Web Server', status: 'online', performance: 98 },
            { name: 'Database', status: 'online', performance: 87 },
            { name: 'Authentication', status: 'online', performance: 96 },
            { name: 'Monitoring', status: 'online', performance: 92 },
            { name: 'Log Processing', status: 'warning', performance: 78 },
          ],
          updatedAt: new Date().toISOString()
        };
        
      case 'networkStatus':
        return {
          status: 'normal',
          connectedDevices: 68,
          trafficData: {
            inbound: 256.7,
            outbound: 124.3,
            unit: 'Mbps'
          },
          anomalies: [
            {
              id: 'anomaly-1',
              type: 'traffic_spike',
              source: '192.168.1.45',
              timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
              severity: 'medium'
            }
          ],
          topSources: [
            { ip: '192.168.1.45', traffic: 45.3 },
            { ip: '192.168.1.22', traffic: 32.8 },
            { ip: '192.168.1.105', traffic: 28.4 }
          ],
          updatedAt: new Date().toISOString()
        };
      
      default:
        return null;
    }
  }
  
  /**
   * Update widget data and broadcast to all subscribers
   * @param {string} widgetId - Widget identifier
   * @param {object} data - Widget data
   */
  updateWidgetData(widgetId, data) {
    this.broadcastToWidget(widgetId, data);
  }
  
  /**
   * Get the count of connected clients
   * @returns {number} Count of connected clients
   */
  getClientCount() {
    return this.clients.size;
  }
  
  /**
   * Get the count of authenticated clients
   * @returns {number} Count of authenticated clients
   */
  getAuthenticatedClientCount() {
    let count = 0;
    
    for (const client of this.clients.values()) {
      if (client.isAuthenticated) {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Shutdown the WebSocket server
   */
  shutdown() {
    if (this.server) {
      this.server.close();
      logger.info('Dashboard WebSocket service shut down');
    }
  }
}

// Export singleton instance
module.exports = new DashboardWebSocketService();
