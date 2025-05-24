const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const logger = require('../config/logger');
const User = require('../models/user.model');
const { createClient } = require('redis');

/**
 * WebSocket server setup and event handlers
 * Handles authentication, real-time alerts, notifications, and log streaming
 */

// Create Redis client for pub/sub
const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
});

redisClient.on('error', (err) => {
  logger.error(`Redis WebSocket error: ${err}`);
});

/**
 * Authenticate a WebSocket connection using JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - User object if authenticated
 */
const authenticateWebSocket = async (token) => {
  try {
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    // Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    logger.error(`WebSocket authentication error: ${error.message}`);
    throw new Error('Authentication failed');
  }
};

/**
 * Set up WebSocket server
 * @param {Object} io - Socket.io instance
 */
const setupWebSocketServer = (io) => {
  // Track active connections by user ID
  const activeConnections = new Map();

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      // Authenticate the connection
      const user = await authenticateWebSocket(token);
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`WebSocket connection established: ${userId}`);

    // Add to active connections
    if (!activeConnections.has(userId)) {
      activeConnections.set(userId, new Set());
    }
    activeConnections.get(userId).add(socket.id);

    // Set up Redis subscriber for this user's channels
    const userChannels = [
      `user:${userId}:alerts`,
      `user:${userId}:notifications`,
      'global:alerts',
      'global:system'
    ];

    // Join rooms based on user's role and permissions
    socket.join(`user:${userId}`);
    socket.join('global');
    
    if (socket.user.role === 'admin' || socket.user.role === 'superadmin') {
      socket.join('admin');
      userChannels.push('admin:alerts');
    }

    // Add channels based on user's organization if applicable
    if (socket.user.organization) {
      const orgId = socket.user.organization.toString();
      socket.join(`org:${orgId}`);
      userChannels.push(`org:${orgId}:alerts`);
    }

    // Subscribe to Redis channels for this user
    const subscriber = redisClient.duplicate();
    
    subscriber.on('message', (channel, message) => {
      try {
        const parsedMessage = JSON.parse(message);
        
        // Route the message to the appropriate room
        if (channel.startsWith('user:')) {
          socket.emit(channel.split(':')[2], parsedMessage);
        } else if (channel.startsWith('global:')) {
          io.to('global').emit(channel.split(':')[1], parsedMessage);
        } else if (channel.startsWith('admin:')) {
          io.to('admin').emit(channel.split(':')[1], parsedMessage);
        } else if (channel.startsWith('org:')) {
          const [, orgId, type] = channel.split(':');
          io.to(`org:${orgId}`).emit(type, parsedMessage);
        }
      } catch (error) {
        logger.error(`Error processing Redis message: ${error.message}`);
      }
    });

    userChannels.forEach(channel => {
      subscriber.subscribe(channel);
    });

    // Handle client events
    
    // Join log stream
    socket.on('subscribe:logs', async (filters) => {
      try {
        // Validate log access permissions based on user role
        socket.join('logs');
        socket.emit('logs:subscribed', { success: true, filters });
        logger.info(`User ${userId} subscribed to logs with filters: ${JSON.stringify(filters)}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to subscribe to logs' });
        logger.error(`Error subscribing to logs: ${error.message}`);
      }
    });

    // Leave log stream
    socket.on('unsubscribe:logs', () => {
      socket.leave('logs');
      socket.emit('logs:unsubscribed', { success: true });
      logger.info(`User ${userId} unsubscribed from logs`);
    });

    // Acknowledge alert
    socket.on('alert:acknowledge', async (data) => {
      try {
        const { alertId } = data;
        
        // Logic to mark alert as acknowledged in the database
        // This would typically update an Alert model
        
        // Broadcast to relevant users that alert was acknowledged
        const broadcastMessage = {
          type: 'alert:acknowledged',
          alertId,
          userId: socket.user._id,
          userFullName: socket.user.fullName,
          timestamp: new Date().toISOString()
        };
        
        // Publish to Redis for other instances to broadcast
        redisClient.publish('global:alerts', JSON.stringify(broadcastMessage));
        
        socket.emit('alert:acknowledge:success', { alertId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to acknowledge alert' });
        logger.error(`Error acknowledging alert: ${error.message}`);
      }
    });

    // Handle user status (for user presence features)
    socket.on('user:status', (status) => {
      // Update user's online status
      const statusUpdate = {
        userId: socket.user._id,
        status: status,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast to admins or team members
      io.to('admin').emit('user:status:update', statusUpdate);
      
      if (socket.user.organization) {
        const orgId = socket.user.organization.toString();
        io.to(`org:${orgId}`).emit('user:status:update', statusUpdate);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`WebSocket disconnected: ${userId}`);
      
      // Remove from active connections
      if (activeConnections.has(userId)) {
        const userSockets = activeConnections.get(userId);
        userSockets.delete(socket.id);
        
        if (userSockets.size === 0) {
          activeConnections.delete(userId);
          
          // Broadcast user offline status
          const statusUpdate = {
            userId: socket.user._id,
            status: 'offline',
            timestamp: new Date().toISOString()
          };
          
          io.to('admin').emit('user:status:update', statusUpdate);
          
          if (socket.user.organization) {
            const orgId = socket.user.organization.toString();
            io.to(`org:${orgId}`).emit('user:status:update', statusUpdate);
          }
        }
      }
      
      // Clean up Redis subscriber
      if (subscriber) {
        subscriber.unsubscribe();
        subscriber.quit();
      }
    });
  });

  // Helper function to send an alert to specific users or all users
  io.sendAlert = async (alert, targetUsers = null) => {
    try {
      if (targetUsers) {
        // Send to specific users
        if (Array.isArray(targetUsers)) {
          targetUsers.forEach(userId => {
            redisClient.publish(`user:${userId}:alerts`, JSON.stringify(alert));
          });
        } else {
          redisClient.publish(`user:${targetUsers}:alerts`, JSON.stringify(alert));
        }
      } else {
        // Send to all users
        redisClient.publish('global:alerts', JSON.stringify(alert));
      }
      
      return true;
    } catch (error) {
      logger.error(`Error sending alert: ${error.message}`);
      return false;
    }
  };

  // Helper function to send log entries to subscribed clients
  io.sendLogEntry = (logEntry) => {
    try {
      io.to('logs').emit('log:entry', logEntry);
      return true;
    } catch (error) {
      logger.error(`Error sending log entry: ${error.message}`);
      return false;
    }
  };

  // Helper function to send a notification to a specific user
  io.sendNotification = async (notification, userId) => {
    try {
      redisClient.publish(`user:${userId}:notifications`, JSON.stringify(notification));
      return true;
    } catch (error) {
      logger.error(`Error sending notification: ${error.message}`);
      return false;
    }
  };

  // Helper function to broadcast system status updates
  io.broadcastSystemStatus = (status) => {
    try {
      redisClient.publish('global:system', JSON.stringify(status));
      return true;
    } catch (error) {
      logger.error(`Error broadcasting system status: ${error.message}`);
      return false;
    }
  };

  logger.info('WebSocket server initialized');
  return io;
};

module.exports = { setupWebSocketServer };
