/**
 * Data Subject Rights Request Detail Component
 *
 * Displays detailed information about a DSR request and allows for
 * management of the request workflow.
 */
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  TextField,
  MenuItem,
  Paper,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
  LinearProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  EventNote as EventIcon,
  Storage as StorageIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  AccessTime as AccessTimeIcon,
  Email as EmailIcon,
  NoteAdd as NoteAddIcon,
} from "@mui/icons-material";

// Import types
import { DSRRequest, DSRRequestStatus, DSRRequestType } from '../../types/gdprTypes';

// Props interface
interface DSRRequestDetailProps {
  open: boolean;
  request: DSRRequest;
  onClose: () => void;
}

// DSR Request Detail Component
const DSRRequestDetail: React.FC<DSRRequestDetailProps> = ({
  open,
  request,
  onClose,
}) => {
  const theme = useTheme();

  // State for status update
  const [newStatus, setNewStatus] = useState<DSRRequestStatus>(request.status);
  const [statusUpdateNotes, setStatusUpdateNotes] = useState("");

  // State for tab value
  const [activeTab, setActiveTab] = useState(0);

  // Get request step based on status
  const getRequestStep = (status: DSRRequestStatus): number => {
    switch (status) {
      case DSRRequestStatus.RECEIVED:
        return 0;
      case DSRRequestStatus.IDENTITY_VERIFICATION:
        return 1;
      case DSRRequestStatus.IN_PROGRESS:
        return 2;
      case DSRRequestStatus.AWAITING_APPROVAL:
        return 3;
      case DSRRequestStatus.COMPLETED:
      case DSRRequestStatus.DENIED:
      case DSRRequestStatus.PARTIAL:
        return 4;
      default:
        return 0;
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format request type
  const formatRequestType = (type: DSRRequestType) => {
    const color =
      type === DSRRequestType.ACCESS
        ? "primary"
        : type === DSRRequestType.ERASURE
        ? "error"
        : type === DSRRequestType.RECTIFICATION
        ? "info"
        : type === DSRRequestType.RESTRICT
        ? "warning"
        : type === DSRRequestType.PORTABILITY
        ? "success"
        : "default";

    return <Chip label={type.replace("_", " ")} color={color} />;
  };

  // Format request status
  const formatRequestStatus = (status: DSRRequestStatus) => {
    const color =
      status === DSRRequestStatus.RECEIVED
        ? "info"
        : status === DSRRequestStatus.IDENTITY_VERIFICATION
        ? "warning"
        : status === DSRRequestStatus.IN_PROGRESS
        ? "warning"
        : status === DSRRequestStatus.COMPLETED
        ? "success"
        : status === DSRRequestStatus.DENIED
        ? "error"
        : status === DSRRequestStatus.PARTIAL
        ? "warning"
        : "default";

    return <Chip label={status.replace("_", " ")} color={color} />;
  };

  // Calculate days remaining or overdue
  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <Typography variant="body2" color="error">
          {Math.abs(diffDays)} days overdue
        </Typography>
      );
    } else if (diffDays === 0) {
      return (
        <Typography variant="body2" color="warning.main">
          Due today
        </Typography>
      );
    } else if (diffDays <= 5) {
      return (
        <Typography variant="body2" color="warning.main">
          {diffDays} days left
        </Typography>
      );
    } else {
      return <Typography variant="body2">{diffDays} days left</Typography>;
    }
  };

  // Handler for status change
  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewStatus(event.target.value as DSRRequestStatus);
  };

  // Handler for notes change
  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusUpdateNotes(event.target.value);
  };

  // Handler for update status
  const handleUpdateStatus = () => {
    // In a real app, this would update the status via API
    console.log("Updating status to:", newStatus);
    console.log("With notes:", statusUpdateNotes);

    // Close dialog
    onClose();
  };

  // Generate steps for the request process
  const steps = [
    "Request Received",
    "Identity Verification",
    "Processing Request",
    "Approval",
    "Completed",
  ];

  // Calculate progress percentage
  const calculateProgress = (status: DSRRequestStatus): number => {
    switch (status) {
      case DSRRequestStatus.RECEIVED:
        return 10;
      case DSRRequestStatus.IDENTITY_VERIFICATION:
        return 25;
      case DSRRequestStatus.IN_PROGRESS:
        return 50;
      case DSRRequestStatus.AWAITING_APPROVAL:
        return 75;
      case DSRRequestStatus.COMPLETED:
        return 100;
      case DSRRequestStatus.DENIED:
      case DSRRequestStatus.PARTIAL:
        return 100;
      default:
        return 0;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">DSR Request: {request.id}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Request Overview */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      Request Type:
                    </Typography>
                    {formatRequestType(request.requestType)}
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Request Details:
                    </Typography>
                    <Typography variant="body1">
                      {request.requestDetails}
                    </Typography>
                  </Box>

                  {request.responseDetails && (
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Response Details:
                      </Typography>
                      <Typography variant="body1">
                        {request.responseDetails}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ mr: 1 }}>
                        Status:
                      </Typography>
                      {formatRequestStatus(request.status)}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <EventIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        Received: {formatDate(request.receivedDate)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AccessTimeIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                      <Box>
                        <Typography variant="body2">
                          Due: {formatDate(request.dueDate)}
                        </Typography>
                        {calculateDaysRemaining(request.dueDate)}
                      </Box>
                    </Box>

                    {request.completedDate && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <CheckIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "success.main" }}
                        />
                        <Typography variant="body2">
                          Completed: {formatDate(request.completedDate)}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AssignmentIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        Assigned to: {request.assignedTo || "Unassigned"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress(request.status)}
                  sx={{ mb: 2, height: 8, borderRadius: 4 }}
                />

                <Stepper
                  activeStep={getRequestStep(request.status)}
                  alternativeLabel
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </Paper>
          </Grid>

          {/* Data Subject Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Data Subject</Typography>
              </Box>

              <Box sx={{ ml: 1 }}>
                <Typography variant="subtitle1">
                  {request.dataSubject.name}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <EmailIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2">
                    {request.dataSubject.email}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Identification Status:
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {request.dataSubject.identificationVerified ? (
                      <Chip
                        label="Verified"
                        color="success"
                        size="small"
                        icon={<CheckIcon />}
                      />
                    ) : (
                      <Chip label="Not Verified" color="warning" size="small" />
                    )}
                  </Box>

                  {request.dataSubject.verificationMethod && (
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Verification Method:
                      </Typography>
                      <Typography variant="body2">
                        {request.dataSubject.verificationMethod}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Affected Systems */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Affected Systems</Typography>
              </Box>

              {request.affectedSystems.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No systems identified yet. This will be determined during
                  processing.
                </Typography>
              ) : (
                <List dense>
                  {request.affectedSystems.map((system) => (
                    <ListItem key={system.id}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: "primary.main",
                          }}
                        >
                          <StorageIcon fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={system.name}
                        secondary={`${system.type} - ${system.location}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Request Timeline */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <HistoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Request Timeline</Typography>
              </Box>

              <List>
                {request.actions.map((action, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "primary.main",
                            mb: 1,
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        {index < request.actions.length - 1 && (
                          <Box
                            sx={{
                              width: 2,
                              height: 40,
                              bgcolor: "primary.main",
                            }}
                          />
                        )}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="subtitle2">
                            {action.action}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(action.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary">
                            By: {action.performedBy}
                          </Typography>
                          {action.notes && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {action.notes}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Update Status */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EditIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Update Request</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Update Status"
                    value={newStatus}
                    onChange={handleStatusChange}
                  >
                    {Object.values(DSRRequestStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Assign To"
                    value={request.assignedTo || ""}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    <MenuItem value="Sarah Johnson">Sarah Johnson</MenuItem>
                    <MenuItem value="Michael Brown">Michael Brown</MenuItem>
                    <MenuItem value="Lisa Wong">Lisa Wong</MenuItem>
                    <MenuItem value="David Garcia">David Garcia</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes"
                    placeholder="Add notes about this update..."
                    value={statusUpdateNotes}
                    onChange={handleNotesChange}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdateStatus}
          startIcon={<CheckIcon />}
        >
          Update Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DSRRequestDetail;
