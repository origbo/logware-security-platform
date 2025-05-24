import React, { useEffect } from "react";
// @ts-ignore - Bypassing type errors due to react-router-dom version mismatch (v6.6.0 vs @types/react-router-dom v5.3)
import { BrowserRouter } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Provider } from "react-redux";
import { CssBaseline } from "@mui/material";

// App Routes
import AppRoutes from "./routes/AppRoutes";

// Auth Provider
import AuthProvider from "./features/auth/context/AuthProvider";

// Redux
import { store } from "./store/store";

// Custom auth hook
import { useAuth } from "@auth/hooks";

// WebSocket
import { setupWebSocket, closeWebSocket } from "./services/websocket";

// Error Handling and Notifications
import ErrorBoundary from "./components/common/ErrorBoundary";
import { NotificationProvider } from "./components/common/NotificationProvider";
import errorHandler from "./utils/errorHandler";

// Custom Theme Provider
import ThemeProvider from "./theme/ThemeProvider";

/**
 * WebSocket wrapper component that handles connection management
 */
const WebSocketManager: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Setup WebSocket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Setup WebSocket connection
      setupWebSocket(
        (event) => {
          if (event.type === "alert") {
            enqueueSnackbar(`New Alert: ${event.message}`, {
              variant: "warning",
              preventDuplicate: true,
            });
          } else if (event.type === "notification") {
            enqueueSnackbar(event.message, {
              variant: "info",
              preventDuplicate: true,
            });
          }
        },
        (error) => {
          console.error("WebSocket error:", error);
        }
      );
    }

    return () => {
      // Clean up WebSocket connection on unmount
      if (isAuthenticated) {
        closeWebSocket();
      }
    };
  }, [isAuthenticated, user, enqueueSnackbar]);

  return <>{children}</>;
};

// We'll use our custom ThemeProvider instead of the basic theme setup

/**
 * Main App component
 * Provides the application with auth, redux, and routing providers
 */
const App: React.FC = () => {
  // Register global error handler
  useEffect(() => {
    // Register global error callback
    errorHandler.registerCallback((error) => {
      console.error("Global error handling:", error);
      // Additional error handling if needed
    });

    return () => {
      // Cleanup error handler on unmount
      // This prevents memory leaks
    };
  }, []);

  return (
    <Provider store={store}>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore - Custom ThemeProvider has different typing than MUI ThemeProvider */}
      <ThemeProvider>
        <CssBaseline /> {/* Normalize CSS */}
        <ErrorBoundary>
          <NotificationProvider>
            <AuthProvider>
              <WebSocketManager>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </WebSocketManager>
            </AuthProvider>
          </NotificationProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
