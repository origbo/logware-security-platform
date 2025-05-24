import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Refresh as RefreshIcon,
  Backup as BackupIcon,
  Delete as DeleteIcon,
  BugReport as BugReportIcon,
  ManageAccounts as ManageAccountsIcon,
  VerifiedUser as VerifiedUserIcon,
  Tune as TuneIcon,
  Close as CloseIcon,
  ViewList as ViewListIcon,
  Send as SendIcon,
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";

// Define props interface
interface QuickActionsWidgetProps {
  data: any;
  widget: DashboardWidget;
}

// Define quick action
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  requiresInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
}

/**
 * QuickActionsWidget Component
 *
 * Provides buttons for common security operations that can be performed directly from the dashboard
 */
const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Local state
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(
    null
  );
  const [actionInput, setActionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define quick actions
  const quickActions: QuickAction[] = [
    {
      id: "scan-system",
      title: "Scan System",
      description: "Run a security scan on your system",
      icon: <SecurityIcon />,
      color: theme.palette.primary.main,
      action: () => {
        // In a real implementation, this would initiate a security scan
        console.log("Initiating security scan");
        simulateActionExecution(
          "Security scan initiated. Results will be available in the Security tab."
        );
      },
    },
    {
      id: "lock-accounts",
      title: "Lock Accounts",
      description: "Lock inactive user accounts",
      icon: <LockIcon />,
      color: theme.palette.error.main,
      action: () => {
        // In a real implementation, this would lock inactive accounts
        console.log("Locking inactive accounts");
        simulateActionExecution("Inactive accounts have been locked.");
      },
      requiresConfirmation: true,
      confirmationMessage:
        "Are you sure you want to lock all inactive user accounts? This will prevent those users from logging in until their accounts are unlocked.",
    },
    {
      id: "unlock-accounts",
      title: "Unlock Account",
      description: "Unlock a specific user account",
      icon: <LockOpenIcon />,
      color: theme.palette.success.main,
      action: () => {
        // In a real implementation, this would unlock the specified account
        console.log(`Unlocking account: ${actionInput}`);
        simulateActionExecution(`Account "${actionInput}" has been unlocked.`);
      },
      requiresInput: true,
      inputLabel: "Username",
      inputPlaceholder: "Enter username to unlock",
    },
    {
      id: "update-policies",
      title: "Update Policies",
      description: "Update security policies",
      icon: <RefreshIcon />,
      color: theme.palette.info.main,
      action: () => {
        // Navigate to policy management page
        navigate("/settings/policies");
      },
    },
    {
      id: "create-backup",
      title: "Backup Now",
      description: "Create a system backup",
      icon: <BackupIcon />,
      color: theme.palette.secondary.main,
      action: () => {
        // In a real implementation, this would create a backup
        console.log("Creating system backup");
        simulateActionExecution(
          "System backup initiated. You will be notified when it completes."
        );
      },
    },
    {
      id: "purge-logs",
      title: "Purge Old Logs",
      description: "Delete logs older than 30 days",
      icon: <DeleteIcon />,
      color: theme.palette.warning.main,
      action: () => {
        // In a real implementation, this would purge old logs
        console.log("Purging old logs");
        simulateActionExecution("Old logs have been purged successfully.");
      },
      requiresConfirmation: true,
      confirmationMessage:
        "Are you sure you want to purge all logs older than 30 days? This action cannot be undone.",
    },
    {
      id: "run-diagnostics",
      title: "Diagnostics",
      description: "Run system diagnostics",
      icon: <BugReportIcon />,
      color: theme.palette.warning.light,
      action: () => {
        // In a real implementation, this would run diagnostics
        console.log("Running system diagnostics");
        simulateActionExecution(
          "System diagnostics completed. No issues found."
        );
      },
    },
    {
      id: "user-management",
      title: "Users",
      description: "Manage user accounts",
      icon: <ManageAccountsIcon />,
      color: theme.palette.grey[700],
      action: () => {
        // Navigate to user management page
        navigate("/users");
      },
    },
    {
      id: "compliance-check",
      title: "Check Compliance",
      description: "Verify compliance status",
      icon: <VerifiedUserIcon />,
      color: theme.palette.success.dark,
      action: () => {
        // In a real implementation, this would check compliance
        console.log("Checking compliance status");
        simulateActionExecution(
          "Compliance check completed. System is compliant with all configured policies."
        );
      },
    },
  ];

  // Simulate action execution with delay
  const simulateActionExecution = (successMessage: string) => {
    setLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // Reset success state after delay
      setTimeout(() => {
        setSuccess(false);
        setConfirmationOpen(false);
        setSelectedAction(null);
        setActionInput("");
      }, 2000);
    }, 1500);
  };

  // Handle action click
  const handleActionClick = (action: QuickAction) => {
    if (action.requiresConfirmation || action.requiresInput) {
      setSelectedAction(action);
      setConfirmationOpen(true);
      setActionInput("");
    } else {
      action.action();
    }
  };

  // Handle confirmation dialog close
  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setSelectedAction(null);
    setActionInput("");
    setError(null);
  };

  // Handle action execution
  const handleExecuteAction = () => {
    if (!selectedAction) return;

    if (selectedAction.requiresInput && !actionInput) {
      setError("This field is required");
      return;
    }

    selectedAction.action();
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Quick Actions
      </Typography>

      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <Grid container spacing={1}>
          {quickActions.map((action) => (
            <Grid item xs={6} sm={4} key={action.id}>
              <Button
                variant="outlined"
                startIcon={action.icon}
                onClick={() => handleActionClick(action)}
                sx={{
                  width: "100%",
                  justifyContent: "flex-start",
                  borderColor: alpha(action.color, 0.5),
                  color: action.color,
                  "&:hover": {
                    borderColor: action.color,
                    bgcolor: alpha(action.color, 0.05),
                  },
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {action.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
        maxWidth="xs"
        fullWidth
      >
        {selectedAction && (
          <>
            <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
              <Box
                component="span"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                  color: selectedAction.color,
                }}
              >
                {selectedAction.icon}
              </Box>
              {selectedAction.title}
              <IconButton
                size="small"
                onClick={handleConfirmationClose}
                sx={{ ml: "auto" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              {selectedAction.requiresConfirmation && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {selectedAction.confirmationMessage}
                </Alert>
              )}

              {selectedAction.requiresInput && (
                <TextField
                  autoFocus
                  margin="dense"
                  id="action-input"
                  label={selectedAction.inputLabel}
                  placeholder={selectedAction.inputPlaceholder}
                  type="text"
                  fullWidth
                  value={actionInput}
                  onChange={(e) => {
                    setActionInput(e.target.value);
                    setError(null);
                  }}
                  error={!!error}
                  helperText={error}
                  variant="outlined"
                  disabled={loading || success}
                />
              )}

              {success && (
                <Alert
                  icon={<CheckCircleIcon fontSize="inherit" />}
                  severity="success"
                  sx={{ mt: 2 }}
                >
                  Action completed successfully
                </Alert>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleConfirmationClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleExecuteAction}
                disabled={loading || success}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} />
                  ) : selectedAction.requiresInput ? (
                    <SendIcon />
                  ) : (
                    <PlayArrowIcon />
                  )
                }
              >
                {loading
                  ? "Processing..."
                  : selectedAction.requiresInput
                  ? "Submit"
                  : "Execute"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default QuickActionsWidget;
