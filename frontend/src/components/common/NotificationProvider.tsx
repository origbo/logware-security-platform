import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert, Snackbar, SnackbarOrigin } from "@mui/material";
import errorHandler from "../../utils/errorHandler";
import {
  ErrorResponse,
  ErrorSeverity,
} from "../../types/errors";

// Notification types
export type NotificationType = "success" | "info" | "warning" | "error";

// Notification interface
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  autoHideDuration?: number;
  timestamp: string;
}

// Notification context interface
interface NotificationContextProps {
  notifications: Notification[];
  showNotification: (
    message: string,
    type: NotificationType,
    duration?: number
  ) => void;
  closeNotification: (id: string) => void;
  closeAllNotifications: () => void;
}

// Create notification context
const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  showNotification: () => {},
  closeNotification: () => {},
  closeAllNotifications: () => {},
});

// Default snackbar position
const defaultPosition: SnackbarOrigin = {
  vertical: "bottom",
  horizontal: "right",
};

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  position?: SnackbarOrigin;
  autoHideDuration?: number;
}

/**
 * NotificationProvider Component
 *
 * Global notification system with error handler integration
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 3,
  position = defaultPosition,
  autoHideDuration = 6000,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Register error handler callback
  useEffect(() => {
    const handleError = (error: ErrorResponse) => {
      // Map error severity to notification type
      let type: NotificationType = "error";

      switch (error.severity) {
        case ErrorSeverity.INFO:
          type = "info";
          break;
        case ErrorSeverity.WARNING:
          type = "warning";
          break;
        case ErrorSeverity.ERROR:
        case ErrorSeverity.CRITICAL:
          type = "error";
          break;
      }

      // Show notification for the error
      showNotification(error.message, type);
    };

    // Register callback
    errorHandler.registerCallback(handleError);

    // Clean up on unmount
    return () => {
      errorHandler.removeCallback(handleError);
    };
  }, []);

  // Show a new notification
  const showNotification = (
    message: string,
    type: NotificationType = "info",
    duration?: number
  ) => {
    const id = Date.now().toString();

    const newNotification: Notification = {
      id,
      message,
      type,
      autoHideDuration: duration || autoHideDuration,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prev) => {
      // Add to the beginning of the array
      const updated = [newNotification, ...prev];

      // Limit the number of notifications
      return updated.slice(0, maxNotifications);
    });
  };

  // Close a notification by ID
  const closeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Close all notifications
  const closeAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        closeNotification,
        closeAllNotifications,
      }}
    >
      {children}

      {/* Render notifications */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHideDuration}
          onClose={() => closeNotification(notification.id)}
          anchorOrigin={position}
          // Offset each notification to stack them
          style={{
            bottom:
              position.vertical === "bottom" ? index * 70 + 16 : undefined,
            top: position.vertical === "top" ? index * 70 + 16 : undefined,
          }}
        >
          <Alert
            onClose={() => closeNotification(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }

  return context;
};

export default NotificationProvider;
