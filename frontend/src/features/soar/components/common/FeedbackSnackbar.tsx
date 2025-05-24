import React, { useState, useEffect, forwardRef } from "react";
import {
  Snackbar,
  Alert as MuiAlert,
  AlertProps,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

// Define Alert component for consistent styling
const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Types of notifications
export type NotificationType = "success" | "error" | "info" | "warning";

// Notification interface
export interface Notification {
  id: string;
  message: string;
  description?: string;
  type: NotificationType;
  autoHideDuration?: number;
}

interface FeedbackSnackbarProps {
  notification: Notification | null;
  onClose: () => void;
}

/**
 * Enhanced feedback notification component that provides consistent
 * visual feedback for user actions throughout the SOAR module
 */
const FeedbackSnackbar: React.FC<FeedbackSnackbarProps> = ({
  notification,
  onClose,
}) => {
  const [open, setOpen] = useState(false);

  // Update open state when notification changes
  useEffect(() => {
    if (notification) {
      setOpen(true);
    }
  }, [notification]);

  // Handle closing the snackbar
  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    // Allow closing animation to finish before resetting notification
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification?.type) {
      case "success":
        return <SuccessIcon />;
      case "error":
        return <ErrorIcon />;
      case "warning":
        return <WarningIcon />;
      case "info":
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  if (!notification) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={notification.autoHideDuration || 5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.type}
        icon={getIcon()}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{ width: "100%", maxWidth: 400 }}
      >
        <Box>
          <Typography variant="subtitle1">{notification.message}</Typography>
          {notification.description && (
            <Typography variant="body2">{notification.description}</Typography>
          )}
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default FeedbackSnackbar;
