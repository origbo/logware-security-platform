/**
 * CaseTimelineTab Component
 *
 * Displays a chronological timeline of events related to a security case,
 * allowing users to view, add, and manage timeline entries.
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Flag as FlagIcon,
  EventNote as EventIcon,
} from "@mui/icons-material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";

// Import types
import {
  SecurityCase,
  TimelineEvent,
  TimelineEventType,
} from "../../types/soarTypes";

// Props interface
interface CaseTimelineTabProps {
  caseData: SecurityCase;
  onAddTimelineEvent: (event: Omit<TimelineEvent, "id">) => void;
  onUpdateTimelineEvent: (
    eventId: string,
    event: Partial<TimelineEvent>
  ) => void;
  onDeleteTimelineEvent: (eventId: string) => void;
}

// Timeline event type options
const EVENT_TYPES: {
  value: TimelineEventType;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { value: "note", label: "Note", icon: <InfoIcon />, color: "info.main" },
  {
    value: "alert",
    label: "Alert",
    icon: <WarningIcon />,
    color: "warning.main",
  },
  {
    value: "detection",
    label: "Detection",
    icon: <FlagIcon />,
    color: "error.main",
  },
  {
    value: "action",
    label: "Action Taken",
    icon: <EventIcon />,
    color: "primary.main",
  },
  {
    value: "escalation",
    label: "Escalation",
    icon: <ErrorIcon />,
    color: "error.dark",
  },
  {
    value: "resolution",
    label: "Resolution",
    icon: <SuccessIcon />,
    color: "success.main",
  },
];

/**
 * Get icon and color for timeline event type
 */
const getEventTypeConfig = (type: TimelineEventType) => {
  const eventType = EVENT_TYPES.find((t) => t.value === type);
  return eventType || EVENT_TYPES[0];
};

/**
 * CaseTimelineTab Component
 */
const CaseTimelineTab: React.FC<CaseTimelineTabProps> = ({
  caseData,
  onAddTimelineEvent,
  onUpdateTimelineEvent,
  onDeleteTimelineEvent,
}) => {
  const theme = useTheme();

  // State for event dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    type: "note",
    title: "",
    description: "",
    timestamp: new Date().toISOString(),
    createdBy: "current-user",
  });

  // Get sorted timeline events
  const sortedEvents = React.useMemo(() => {
    if (!caseData.timelineEvents) return [];

    return [...caseData.timelineEvents].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [caseData.timelineEvents]);

  // Handle opening dialog for new event
  const handleOpenNewDialog = () => {
    setEditingEvent(null);
    setNewEvent({
      type: "note",
      title: "",
      description: "",
      timestamp: new Date().toISOString(),
      createdBy: "current-user",
    });
    setDialogOpen(true);
  };

  // Handle opening dialog for editing event
  const handleOpenEditDialog = (event: TimelineEvent) => {
    setEditingEvent(event);
    setNewEvent({
      type: event.type,
      title: event.title,
      description: event.description,
      timestamp: event.timestamp,
    });
    setDialogOpen(true);
  };

  // Handle closing dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle field change
  const handleFieldChange = (field: keyof TimelineEvent, value: any) => {
    setNewEvent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle submitting event
  const handleSubmitEvent = () => {
    if (!newEvent.title || !newEvent.type) return;

    if (editingEvent) {
      // Update existing event
      onUpdateTimelineEvent(editingEvent.id, newEvent);
    } else {
      // Add new event
      onAddTimelineEvent({
        type: newEvent.type as TimelineEventType,
        title: newEvent.title || "",
        description: newEvent.description || "",
        timestamp: newEvent.timestamp || new Date().toISOString(),
        createdBy: newEvent.createdBy || "current-user",
      });
    }

    handleCloseDialog();
  };

  // Handle deleting event
  const handleDeleteEvent = (eventId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this timeline event? This action cannot be undone."
      )
    ) {
      onDeleteTimelineEvent(eventId);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">Case Timeline</Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenNewDialog}
        >
          Add Event
        </Button>
      </Box>

      {sortedEvents.length > 0 ? (
        <Timeline position="right">
          {sortedEvents.map((event) => {
            const eventConfig = getEventTypeConfig(event.type);

            return (
              <TimelineItem key={event.id}>
                <TimelineOppositeContent
                  color="text.secondary"
                  sx={{ flex: 0.2 }}
                >
                  <Typography variant="body2">
                    {formatTimestamp(event.timestamp)}
                  </Typography>
                </TimelineOppositeContent>

                <TimelineSeparator>
                  <TimelineDot sx={{ bgcolor: eventConfig.color }}>
                    {eventConfig.icon}
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>

                <TimelineContent sx={{ py: 1, px: 2 }}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      border: `1px solid ${alpha(
                        theme.palette[
                          eventConfig.color.split(".")[0] as "primary"
                        ].main,
                        0.2
                      )}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          component="div"
                          sx={{ fontWeight: 500 }}
                        >
                          {event.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <PersonIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                          {event.createdBy}
                        </Typography>
                      </Box>

                      <Box>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditDialog(event)}
                            sx={{ mr: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="body2">{event.description}</Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      ) : (
        <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary" paragraph>
            No timeline events have been added yet.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add events to track the chronological progression of this case.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenNewDialog}
            sx={{ mt: 2 }}
          >
            Add First Event
          </Button>
        </Paper>
      )}

      {/* Add/Edit Event Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingEvent ? "Edit Timeline Event" : "Add Timeline Event"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {/* Event Type */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Event Type</InputLabel>
              <Select
                value={newEvent.type || "note"}
                label="Event Type"
                onChange={(e) => handleFieldChange("type", e.target.value)}
              >
                {EVENT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {React.cloneElement(type.icon as React.ReactElement, {
                        sx: { color: type.color },
                      })}
                      <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Event Title */}
            <TextField
              fullWidth
              label="Title"
              value={newEvent.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              margin="normal"
              required
            />

            {/* Event Description */}
            <TextField
              fullWidth
              label="Description"
              value={newEvent.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              margin="normal"
              multiline
              rows={4}
            />

            {/* Timestamp */}
            <TextField
              fullWidth
              label="Timestamp"
              type="datetime-local"
              value={new Date(newEvent.timestamp || Date.now())
                .toISOString()
                .slice(0, 16)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                handleFieldChange("timestamp", date.toISOString());
              }}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitEvent}
            disabled={!newEvent.title || !newEvent.type}
          >
            {editingEvent ? "Update Event" : "Add Event"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseTimelineTab;
