/**
 * AlertDetail Component
 *
 * Provides detailed view of a security alert with contextual information,
 * timeline, related evidence, and action options for investigation and response.
 */
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  Grid,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  useTheme,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  Link as LinkIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
  FormatQuote as FormatQuoteIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  Block as BlockIcon,
  AutoGraph as AutoGraphIcon,
} from "@mui/icons-material";
import {
  Alert as AlertType,
  AlertSeverity,
  AlertStatus,
  AlertSource,
} from "../types/alertTypes";

interface AlertDetailProps {
  alert: AlertType;
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: AlertStatus) => void;
}

const AlertDetail: React.FC<AlertDetailProps> = ({
  alert,
  open,
  onClose,
  onStatusChange,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle adding a comment
  const handleAddComment = () => {
    if (!comment.trim()) return;

    // Logic to add comment
    console.log("Adding comment:", comment);
    setComment("");
  };

  // Get severity icon
  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return <ErrorIcon color="error" fontSize="small" />;
      case AlertSeverity.HIGH:
        return <WarningIcon color="error" fontSize="small" />;
      case AlertSeverity.MEDIUM:
        return <WarningIcon color="warning" fontSize="small" />;
      case AlertSeverity.LOW:
        return <InfoIcon color="info" fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return theme.palette.error.main;
      case AlertSeverity.HIGH:
        return theme.palette.error.light;
      case AlertSeverity.MEDIUM:
        return theme.palette.warning.main;
      case AlertSeverity.LOW:
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // Mock timeline events
  const timelineEvents = [
    {
      id: "1",
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      type: "alert_created",
      description: "Alert created by system",
      user: "system",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 115 * 60000).toISOString(),
      type: "enrichment",
      description: "Enriched with threat intelligence data",
      user: "system",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      type: "status_change",
      description: "Status changed from NEW to IN_PROGRESS",
      user: "John Smith",
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      type: "comment",
      description: "Investigating source IP - appears to be a known scanner",
      user: "John Smith",
    },
    {
      id: "5",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      type: "playbook_run",
      description: 'Ran "IP Investigation" playbook',
      user: "John Smith",
    },
  ];

  // Mock related entities
  const relatedEntities = [
    {
      id: "ip-001",
      type: "ip_address",
      value: "192.168.1.254",
      context: "Source IP address",
      indicators: ["Multiple failed logins", "Seen in other alerts"],
    },
    {
      id: "user-001",
      type: "user",
      value: "admin",
      context: "Target user account",
      indicators: ["Privileged account", "Critical asset"],
    },
    {
      id: "host-001",
      type: "host",
      value: "adserver01",
      context: "Target system",
      indicators: ["Domain controller", "Critical infrastructure"],
    },
  ];

  // Get icon for entity type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case "ip_address":
        return <LinkIcon />;
      case "user":
        return <AssignmentIcon />;
      case "host":
        return <DescriptionIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Get icon for timeline event
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "alert_created":
        return <ErrorIcon color="error" />;
      case "enrichment":
        return <AutoGraphIcon color="info" />;
      case "status_change":
        return <TimelineIcon color="primary" />;
      case "comment":
        return <CommentIcon color="action" />;
      case "playbook_run":
        return <PlayArrowIcon color="primary" />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
          maxHeight: "900px",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Chip
            icon={getSeverityIcon(alert.severity)}
            label={alert.severity}
            color={
              alert.severity === AlertSeverity.CRITICAL ||
              alert.severity === AlertSeverity.HIGH
                ? "error"
                : alert.severity === AlertSeverity.MEDIUM
                ? "warning"
                : "info"
            }
            size="small"
            sx={{ mr: 2 }}
          />
          <Typography variant="h6" component="span" noWrap>
            {alert.title}
          </Typography>
        </Box>
        <Box>
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Alert Details */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.primary.light, 0.1),
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" gutterBottom>
              {alert.description}
            </Typography>
            <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip size="small" label={`ID: ${alert.id.substring(0, 8)}`} />
              <Chip size="small" label={`Source: ${alert.source}`} />
              <Chip
                size="small"
                icon={<TimelineIcon fontSize="small" />}
                label={`Created: ${formatDate(alert.createdAt)}`}
              />
              {alert.tags?.map((tag) => (
                <Chip key={tag} size="small" label={tag} variant="outlined" />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="subtitle2">Status:</Typography>
              <Chip
                label={alert.status}
                color={
                  alert.status === AlertStatus.NEW
                    ? "error"
                    : alert.status === AlertStatus.IN_PROGRESS
                    ? "primary"
                    : alert.status === AlertStatus.RESOLVED
                    ? "success"
                    : alert.status === AlertStatus.FALSE_POSITIVE
                    ? "warning"
                    : "default"
                }
                size="small"
              />
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="subtitle2">Assigned To:</Typography>
              <Typography>{alert.assignedToName || "Unassigned"}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle2">MITRE ATT&CK:</Typography>
              <Typography>{alert.mitreAttack?.join(", ") || "N/A"}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs and Content */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Details" />
          <Tab label="Timeline" />
          <Tab label="Related Entities" />
          <Tab label="Evidence" />
          <Tab label="Actions" />
        </Tabs>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flexGrow: 1, overflow: "auto", p: 1 }}>
          {/* Details Tab */}
          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Alert Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ "& > div": { mb: 2 } }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Alert Type
                      </Typography>
                      <Typography>{alert.type || "Unknown"}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Source
                      </Typography>
                      <Typography>{alert.source}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Severity
                      </Typography>
                      <Chip
                        label={alert.severity}
                        size="small"
                        sx={{
                          bgcolor: getSeverityColor(alert.severity),
                          color: "white",
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Created At
                      </Typography>
                      <Typography>{formatDate(alert.createdAt)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Updated At
                      </Typography>
                      <Typography>{formatDate(alert.updatedAt)}</Typography>
                    </Box>
                    {alert.resolvedAt && (
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Resolved At
                        </Typography>
                        <Typography>{formatDate(alert.resolvedAt)}</Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Technical Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {alert.details ? (
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                        overflowX: "auto",
                        padding: "0.5rem",
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? alpha("#000", 0.2)
                            : alpha("#000", 0.05),
                        borderRadius: "4px",
                        maxHeight: "300px",
                        overflow: "auto",
                      }}
                    >
                      {typeof alert.details === "string"
                        ? alert.details
                        : JSON.stringify(alert.details, null, 2)}
                    </pre>
                  ) : (
                    <Typography color="textSecondary">
                      No technical details available
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Comments
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {alert.comments && alert.comments.length > 0 ? (
                      alert.comments.map((comment, index) => (
                        <ListItem
                          key={index}
                          alignItems="flex-start"
                          sx={{
                            mb: 1,
                            p: 1,
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? alpha("#000", 0.2)
                                : alpha("#000", 0.05),
                            borderRadius: 1,
                          }}
                        >
                          <ListItemIcon sx={{ mt: 0 }}>
                            <CommentIcon fontSize="small" />
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
                                  {comment.user || "Unknown User"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  {formatDate(comment.timestamp)}
                                </Typography>
                              </Box>
                            }
                            secondary={comment.content}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography color="textSecondary">
                        No comments yet
                      </Typography>
                    )}
                  </List>

                  <Box sx={{ mt: 2, display: "flex" }}>
                    <TextField
                      fullWidth
                      placeholder="Add a comment..."
                      multiline
                      rows={2}
                      variant="outlined"
                      size="small"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <IconButton
                      color="primary"
                      onClick={handleAddComment}
                      disabled={!comment.trim()}
                      sx={{ ml: 1 }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Timeline Tab */}
          {activeTab === 1 && (
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1" gutterBottom>
                Alert Timeline
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {timelineEvents.map((event) => (
                  <ListItem
                    key={event.id}
                    alignItems="flex-start"
                    sx={{
                      mb: 1,
                      p: 1,
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? alpha("#000", 0.2)
                          : alpha("#000", 0.05),
                      borderRadius: 1,
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 20,
                        top: 0,
                        bottom: -8,
                        width: 2,
                        bgcolor: theme.palette.divider,
                        zIndex: 0,
                      },
                      "&:last-child::before": {
                        display: "none",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        mt: 0,
                        minWidth: 42,
                        zIndex: 1,
                        bgcolor: theme.palette.background.paper,
                        borderRadius: "50%",
                      }}
                    >
                      {getTimelineIcon(event.type)}
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
                            {event.description}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(event.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="textSecondary">
                          by {event.user}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Related Entities Tab */}
          {activeTab === 2 && (
            <Grid container spacing={2}>
              {relatedEntities.map((entity) => (
                <Grid item xs={12} md={6} lg={4} key={entity.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      "&:hover": {
                        boxShadow: 1,
                        borderColor: theme.palette.primary.light,
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Box sx={{ mr: 1 }}>{getEntityIcon(entity.type)}</Box>
                      <Typography variant="subtitle1">
                        {entity.value}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      display="block"
                    >
                      {entity.type.replace("_", " ")}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {entity.context}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {entity.indicators.map((indicator, index) => (
                        <Chip
                          key={index}
                          label={indicator}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Evidence Tab */}
          {activeTab === 3 && (
            <Typography variant="body1">
              Evidence content would go here
            </Typography>
          )}

          {/* Actions Tab */}
          {activeTab === 4 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Status Management
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel>Change Status</InputLabel>
                    <Select
                      value={alert.status}
                      label="Change Status"
                      onChange={(e) =>
                        onStatusChange(e.target.value as AlertStatus)
                      }
                    >
                      <MenuItem value={AlertStatus.NEW}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <ErrorIcon color="error" sx={{ mr: 1 }} />
                          <Typography>New</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={AlertStatus.IN_PROGRESS}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PlayArrowIcon color="primary" sx={{ mr: 1 }} />
                          <Typography>In Progress</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={AlertStatus.RESOLVED}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                          <Typography>Resolved</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={AlertStatus.FALSE_POSITIVE}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <BlockIcon color="warning" sx={{ mr: 1 }} />
                          <Typography>False Positive</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={AlertStatus.CLOSED}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <BlockIcon color="action" sx={{ mr: 1 }} />
                          <Typography>Closed</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<AssignmentIcon />}
                  >
                    Assign to Security Team
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Response Actions
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    startIcon={<PlayArrowIcon />}
                    sx={{ mb: 2 }}
                  >
                    Run Playbook
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TimelineIcon />}
                    sx={{ mb: 2 }}
                  >
                    Create Case
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<BlockIcon />}
                  >
                    Block Related IPs
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>

      {/* Actions */}
      <DialogActions
        sx={{ borderTop: 1, borderColor: "divider", px: 3, py: 2 }}
      >
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onStatusChange(AlertStatus.IN_PROGRESS)}
          disabled={alert.status === AlertStatus.IN_PROGRESS}
          startIcon={<PlayArrowIcon />}
        >
          Investigate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDetail;
