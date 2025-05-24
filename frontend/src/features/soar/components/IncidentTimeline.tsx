/**
 * IncidentTimeline Component
 *
 * Displays a chronological timeline of events for a security incident.
 * Allows security analysts to track the progression and response to an incident.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tooltip,
  Collapse,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import {
  Event as EventIcon,
  Fingerprint as FingerprintIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Comment as CommentIcon,
  PlayArrow as PlayIcon,
  NotificationImportant as AlertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachmentIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useCases } from "../hooks/useCases";
import {
  TimelineEvent,
  EventCategory,
  Artifact,
  ArtifactType,
} from "../types/soarTypes";

interface IncidentTimelineProps {
  caseId: string;
  compact?: boolean;
  maxEvents?: number;
  showAddEventButton?: boolean;
  onEventAdded?: (event: TimelineEvent) => void;
}

/**
 * IncidentTimeline Component
 */
const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  caseId,
  compact = false,
  maxEvents,
  showAddEventButton = true,
  onEventAdded,
}) => {
  const theme = useTheme();
  const {
    caseById,
    addTimelineEvent,
    updateTimelineEvent,
    removeTimelineEvent,
    loading,
  } = useCases();

  const [newEventDialogOpen, setNewEventDialogOpen] = useState(false);
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    title: "",
    description: "",
    category: "note" as EventCategory,
    caseId: caseId,
  });
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  // Get case data
  const caseData = caseById(caseId);
  const caseEvents = caseData?.timeline || [];

  // Filter events if maxEvents is specified
  const filteredEvents = maxEvents
    ? caseEvents.slice(0, maxEvents)
    : caseEvents;

  // Sort events by creation time
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Handle adding a new event
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.category) return;

    try {
      const createdEvent = await addTimelineEvent({
        ...(newEvent as any),
        caseId,
        createdBy: "current-user",
      });

      setNewEventDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        category: "note",
        caseId: caseId,
      });

      if (onEventAdded) {
        onEventAdded(createdEvent);
      }
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  };

  // Handle updating an event
  const handleUpdateEvent = async () => {
    if (!editingEvent || !editingEvent.id) return;

    try {
      await updateTimelineEvent(caseId, editingEvent.id, {
        title: editingEvent.title,
        description: editingEvent.description,
        category: editingEvent.category,
      });

      setEditEventDialogOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Failed to update event:", error);
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await removeTimelineEvent(caseId, eventId);
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  // Toggle event expansion
  const toggleEventExpansion = (eventId: string) => {
    const newExpandedEvents = new Set(expandedEvents);
    if (newExpandedEvents.has(eventId)) {
      newExpandedEvents.delete(eventId);
    } else {
      newExpandedEvents.add(eventId);
    }
    setExpandedEvents(newExpandedEvents);
  };

  // Get icon for event category
  const getCategoryIcon = (category: EventCategory) => {
    switch (category) {
      case "case":
        return <EventIcon />;
      case "artifact":
        return <FingerprintIcon />;
      case "playbook":
        return <PlayIcon />;
      case "alert":
        return <AlertIcon />;
      case "communication":
        return <CommentIcon />;
      case "action":
        return <CodeIcon />;
      case "evidence":
        return <AttachmentIcon />;
      case "note":
      default:
        return <CommentIcon />;
    }
  };

  // Get color for event category
  const getCategoryColor = (category: EventCategory) => {
    switch (category) {
      case "case":
        return theme.palette.primary.main;
      case "artifact":
        return theme.palette.info.main;
      case "playbook":
        return theme.palette.success.main;
      case "alert":
        return theme.palette.error.main;
      case "communication":
        return theme.palette.secondary.main;
      case "action":
        return theme.palette.warning.main;
      case "evidence":
        return "#9c27b0"; // Purple
      case "note":
      default:
        return theme.palette.grey[500];
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!caseData) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" color="text.secondary" align="center">
          Case not found or you don't have permission to view it.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          p: compact ? 0 : 2,
        }}
      >
        <Typography variant={compact ? "h6" : "h5"} sx={{ flexGrow: 1 }}>
          Incident Timeline
        </Typography>

        {showAddEventButton && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewEventDialogOpen(true)}
            size={compact ? "small" : "medium"}
          >
            Add Event
          </Button>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {sortedEvents.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              No events recorded yet for this incident.
            </Typography>
            {showAddEventButton && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setNewEventDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Add First Event
              </Button>
            )}
          </Paper>
        ) : compact ? (
          // Compact timeline view
          <List disablePadding>
            {sortedEvents.map((event) => (
              <ListItem
                key={event.id}
                alignItems="flex-start"
                sx={{
                  borderLeft: `4px solid ${getCategoryColor(event.category)}`,
                  mb: 1,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: alpha(getCategoryColor(event.category), 0.2),
                    }}
                  >
                    {getCategoryIcon(event.category)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="subtitle2">{event.title}</Typography>
                      <Chip
                        label={event.category}
                        size="small"
                        sx={{
                          ml: 1,
                          height: 20,
                          fontSize: "0.625rem",
                          textTransform: "capitalize",
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="caption"
                        component="span"
                        color="text.secondary"
                      >
                        {new Date(event.createdAt).toLocaleString()} •{" "}
                        {event.createdBy}
                      </Typography>
                      {event.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.5,
                            display: expandedEvents.has(event.id)
                              ? "block"
                              : "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            ...(expandedEvents.has(event.id) && {
                              overflow: "visible",
                            }),
                          }}
                        >
                          {event.description}
                        </Typography>
                      )}
                      {event.description && event.description.length > 120 && (
                        <Button
                          size="small"
                          onClick={() => toggleEventExpansion(event.id)}
                          sx={{ mt: 0.5, p: 0 }}
                        >
                          {expandedEvents.has(event.id)
                            ? "Show Less"
                            : "Show More"}
                        </Button>
                      )}
                    </>
                  }
                  secondaryTypographyProps={{ component: "div" }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          // Full timeline view with Material-UI Timeline
          <Timeline position="right" sx={{ p: 0 }}>
            {sortedEvents.map((event) => (
              <TimelineItem key={event.id}>
                <TimelineOppositeContent sx={{ flex: 0.2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.createdAt).toLocaleString()}
                  </Typography>
                </TimelineOppositeContent>

                <TimelineSeparator>
                  <TimelineDot
                    sx={{ bgcolor: getCategoryColor(event.category) }}
                  >
                    {getCategoryIcon(event.category)}
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>

                <TimelineContent sx={{ py: 1, px: 2 }}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        component="h3"
                        sx={{ flexGrow: 1 }}
                      >
                        {event.title}
                      </Typography>

                      <Chip
                        label={event.category}
                        size="small"
                        sx={{
                          mr: 1,
                          textTransform: "capitalize",
                          bgcolor: alpha(getCategoryColor(event.category), 0.1),
                          color: getCategoryColor(event.category),
                        }}
                      />

                      <Tooltip title="Edit Event">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingEvent(event);
                            setEditEventDialogOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Event">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Created by {event.createdBy}
                    </Typography>

                    {event.description && (
                      <Typography variant="body2" paragraph>
                        {event.description}
                      </Typography>
                    )}

                    {/* Artifacts linked to this event */}
                    {event.artifacts && event.artifacts.length > 0 && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          Artifacts
                        </Typography>
                        <List dense>
                          {event.artifacts.map((artifact) => (
                            <ListItem key={artifact.id} disablePadding>
                              <ListItemAvatar sx={{ minWidth: 36 }}>
                                <Avatar sx={{ width: 24, height: 24 }}>
                                  <FingerprintIcon fontSize="small" />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={artifact.value}
                                secondary={
                                  <>
                                    <Typography
                                      variant="caption"
                                      component="span"
                                    >
                                      {artifact.type}
                                      {artifact.description
                                        ? ` - ${artifact.description}`
                                        : ""}
                                    </Typography>
                                    {artifact.isMalicious && (
                                      <Chip
                                        label="Malicious"
                                        size="small"
                                        color="error"
                                        sx={{
                                          ml: 1,
                                          height: 20,
                                          fontSize: "0.625rem",
                                        }}
                                      />
                                    )}
                                  </>
                                }
                                secondaryTypographyProps={{ component: "div" }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Box>

      {/* New Event Dialog */}
      <Dialog
        open={newEventDialogOpen}
        onClose={() => setNewEventDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Timeline Event</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={newEvent.category}
                  label="Event Type"
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      category: e.target.value as EventCategory,
                    })
                  }
                >
                  <MenuItem value="note">Note</MenuItem>
                  <MenuItem value="artifact">Artifact</MenuItem>
                  <MenuItem value="playbook">Playbook</MenuItem>
                  <MenuItem value="alert">Alert</MenuItem>
                  <MenuItem value="communication">Communication</MenuItem>
                  <MenuItem value="action">Action</MenuItem>
                  <MenuItem value="evidence">Evidence</MenuItem>
                  <MenuItem value="case">Case</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewEventDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddEvent}
            disabled={!newEvent.title || !newEvent.category}
          >
            Add Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog
        open={editEventDialogOpen}
        onClose={() => setEditEventDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Timeline Event</DialogTitle>
        <DialogContent dividers>
          {editingEvent && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  value={editingEvent.title}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, title: e.target.value })
                  }
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={editingEvent.category}
                    label="Event Type"
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        category: e.target.value as EventCategory,
                      })
                    }
                  >
                    <MenuItem value="note">Note</MenuItem>
                    <MenuItem value="artifact">Artifact</MenuItem>
                    <MenuItem value="playbook">Playbook</MenuItem>
                    <MenuItem value="alert">Alert</MenuItem>
                    <MenuItem value="communication">Communication</MenuItem>
                    <MenuItem value="action">Action</MenuItem>
                    <MenuItem value="evidence">Evidence</MenuItem>
                    <MenuItem value="case">Case</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={editingEvent.description}
                  onChange={(e) =>
                    setEditingEvent({
                      ...editingEvent,
                      description: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEventDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateEvent}
            disabled={!editingEvent?.title}
          >
            Update Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IncidentTimeline;
