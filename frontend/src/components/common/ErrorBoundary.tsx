import * as React from "react";
import { Component, ReactNode } from "react";
import { Box, Alert, Button, Typography, Paper } from "@mui/material";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import errorHandler from "../../utils/errorHandler";
import {
  ErrorResponse,
  ErrorSeverity,
  ErrorType,
} from "../../types/errors";

// Define ErrorInfo since it's missing from the React type declarations
interface ErrorInfo {
  componentStack: string;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to error handler system
    const errorResponse: ErrorResponse = {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      message: error.message || "An unexpected error occurred",
      details: {
        stack: error.stack || "",
        componentStack: errorInfo.componentStack,
      },
      timestamp: new Date().toISOString(),
    };

    errorHandler.handleError(errorResponse);

    this.setState({
      errorInfo,
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Box
          sx={{
            p: 3,
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: "100%" }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              Something went wrong in this component.
            </Alert>

            <Typography variant="h6" gutterBottom>
              Error Details
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {this.state.error?.message || "Unknown error"}
            </Typography>

            {(typeof process !== "undefined" && process.env.NODE_ENV !== "production") && this.state.errorInfo && (
              <Box sx={{ mt: 2, overflow: "auto", maxHeight: 200 }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Typography
                  variant="caption"
                  component="pre" 
                  sx={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}

            <Box
              sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
            >
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
              >
                Try Again
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={(): void => window.location.reload()}
              >
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
