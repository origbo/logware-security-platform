import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
} from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Shield as ShieldIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  DataUsage as DataUsageIcon,
  Update as UpdateIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";

// Define props interface
interface ActivityTimelineWidgetProps {
  data: any;
  widget: DashboardWidget;
}

// Define event type enum
enum EventType {
  LOGIN = "login",
  LOGOUT = "logout",
  SYSTEM_UPDATE = "system_update",
  CONFIGURATION_CHANGE = "configuration_change",
  SECURITY_EVENT = "security_event",
  POLICY_CHANGE = "policy_change",
  USER_MANAGEMENT = "user_management",
  DATA_ACCESS = "data_access",
  RESOURCE_USAGE = "resource_usage",
}

// Define event severity
enum EventSeverity {
  INFO = "info",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Define activity event interface
interface ActivityEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  title: string;
  description: string;
  user?: string;
  userAvatar?: string;
  source: string;
  timestamp: string;
  relatedEntities?: {
    id: string;
    type: string;
    name: string;
  }[];
  metadata?: Record<string, any>;
}

/**
 * ActivityTimelineWidget Component
 *
 * Displays a chronological timeline of system and security events
 * with filtering options and event details
 */
const ActivityTimelineWidget: React.FC<ActivityTimelineWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [eventMenuAnchorEl, setEventMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [activeEvent, setActiveEvent] = useState<ActivityEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);

  // Mock data for development
  const mockData = {
    events: [
      {
        id: "evt-1",
        type: EventType.SECURITY_EVENT,
        severity: EventSeverity.HIGH,
        title: "Failed login attempts",
        description: "Multiple failed login attempts detected for user admin",
        user: "system",
        source: "Authentication Service",
        timestamp: "2025-05-15T12:35:00Z",
        metadata: {
          attemptCount: 5,
          ipAddress: "192.168.1.15",
          location: "Unknown",
        },
      },
      {
        id: "evt-2",
        type: EventType.CONFIGURATION_CHANGE,
        severity: EventSeverity.MEDIUM,
        title: "Firewall rule modified",
        description: "Firewall rule for external API access was modified",
        user: "john.smith",
        userAvatar: "/assets/avatars/john-smith.png",
        source: "Network Configuration",
        timestamp: "2025-05-15T11:20:00Z",
        relatedEntities: [
          {
            id: "rule-423",
            type: "firewall-rule",
            name: "External API Access",
          },
        ],
      },
      {
        id: "evt-3",
        type: EventType.LOGIN,
        severity: EventSeverity.INFO,
        title: "User login",
        description: "User successfully logged in",
        user: "sarah.johnson",
        userAvatar: "/assets/avatars/sarah-johnson.png",
        source: "Authentication Service",
        timestamp: "2025-05-15T10:45:00Z",
        metadata: {
          ipAddress: "10.0.0.23",
          device: "Windows Workstation",
          browser: "Chrome",
        },
      },
      {
        id: "evt-4",
        type: EventType.SYSTEM_UPDATE,
        severity: EventSeverity.LOW,
        title: "System update completed",
        description: "Scheduled system update was completed successfully",
        user: "system",
        source: "Update Service",
        timestamp: "2025-05-15T09:15:00Z",
        metadata: {
          version: "2.4.1",
          components: ["Core", "API", "Frontend"],
        },
      },
      {
        id: "evt-5",
        type: EventType.DATA_ACCESS,
        severity: EventSeverity.MEDIUM,
        title: "Sensitive data accessed",
        description: "Sensitive customer data was accessed",
        user: "david.williams",
        userAvatar: "/assets/avatars/david-williams.png",
        source: "Data Management",
        timestamp: "2025-05-15T08:50:00Z",
        relatedEntities: [
          {
            id: "dataset-142",
            type: "dataset",
            name: "Customer PII",
          },
        ],
      },
    ],
  };

  // Use real data if available, otherwise use mock data
  const timelineData = data || mockData;

  // Filter and search events
  const filteredEvents = timelineData.events
    .filter((event: ActivityEvent) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.user?.toLowerCase().includes(query) ||
          event.source.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((event: ActivityEvent) => {
      // Apply event type filter
      if (selectedEventTypes.length > 0) {
        return selectedEventTypes.includes(event.type);
      }
      return true;
    });

  // Get event icon based on event type
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case EventType.LOGIN:
        return <LoginIcon />;
      case EventType.LOGOUT:
        return <LogoutIcon />;
      case EventType.SYSTEM_UPDATE:
        return <UpdateIcon />;
      case EventType.CONFIGURATION_CHANGE:
        return <SettingsIcon />;
      case EventType.SECURITY_EVENT:
        return <SecurityIcon />;
      case EventType.POLICY_CHANGE:
        return <ShieldIcon />;
      case EventType.USER_MANAGEMENT:
        return <PersonIcon />;
      case EventType.DATA_ACCESS:
        return <StorageIcon />;
      case EventType.RESOURCE_USAGE:
        return <DataUsageIcon />;
      default:
        return <DashboardIcon />;
    }
  };

  // Get event color based on severity
  const getEventColor = (severity: EventSeverity) => {
    switch (severity) {
      case EventSeverity.CRITICAL:
        return theme.palette.error.main;
      case EventSeverity.HIGH:
        return theme.palette.error.light;
      case EventSeverity.MEDIUM:
        return theme.palette.warning.main;
      case EventSeverity.LOW:
        return theme.palette.warning.light;
      case EventSeverity.INFO:
      default:
        return theme.palette.info.main;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  };

  // Format event severity
  const formatEventSeverity = (severity: EventSeverity): string => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  // Handle filter menu open
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };

  // Handle filter menu close
  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
  };

  // Handle event menu open
  const handleEventMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    activityEvent: ActivityEvent
  ) => {
    setActiveEvent(activityEvent);
    setEventMenuAnchorEl(event.currentTarget);
  };

  // Handle event menu close
  const handleEventMenuClose = () => {
    setEventMenuAnchorEl(null);
  };

  // Handle event type filter toggle
  const handleEventTypeToggle = (eventType: EventType) => {
    if (selectedEventTypes.includes(eventType)) {
      setSelectedEventTypes(
        selectedEventTypes.filter((type) => type !== eventType)
      );
    } else {
      setSelectedEventTypes([...selectedEventTypes, eventType]);
    }
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setSelectedEventTypes([]);
    setSearchQuery("");
    handleFilterMenuClose();
  };

  // Handle view event details
  const handleViewEventDetails = (eventId: string) => {
    navigate(`/events/${eventId}`);
    handleEventMenuClose();
  };

  // Handle view all events
  const handleViewAllEvents = () => {
    navigate("/events");
  };

  // Get event type label
  const getEventTypeLabel = (type: EventType): string => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with search and filter */}
      <Box sx={{ mb: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search events..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="Filter events"
                  onClick={handleFilterMenuOpen}
                  color={selectedEventTypes.length > 0 ? "primary" : "default"}
                >
                  <FilterListIcon fontSize="small" />
                  {selectedEventTypes.length > 0 && (
                    <Box
                      component="span"
                      sx={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontSize: "0.6rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selectedEventTypes.length}
                    </Box>
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Active filters */}
      {selectedEventTypes.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            mb: 1,
            maxHeight: 32,
            overflow: "hidden",
          }}
        >
          {selectedEventTypes.map((type) => (
            <Chip
              key={type}
              size="small"
              label={getEventTypeLabel(type)}
              onDelete={() => handleEventTypeToggle(type)}
            />
          ))}
        </Box>
      )}

      {/* Timeline */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {filteredEvents.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              p: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              No events match your filters. Try adjusting your search or
              filters.
            </Typography>
            {(searchQuery || selectedEventTypes.length > 0) && (
              <Button size="small" onClick={handleClearFilters} sx={{ mt: 1 }}>
                Clear All Filters
              </Button>
            )}
          </Box>
        ) : (
          <Timeline
            sx={{
              p: 0,
              m: 0,
              "& .MuiTimelineItem-root": {
                minHeight: 0,
                "&:before": {
                  flex: 0,
                  padding: 0,
                },
              },
              "& .MuiTimelineOppositeContent-root": {
                flex: "0 0 80px",
                py: 1,
              },
            }}
          >
            {filteredEvents.map((event: ActivityEvent) => (
              <TimelineItem key={event.id}>
                <TimelineOppositeContent color="text.secondary">
                  <Typography variant="caption" noWrap>
                    {formatTimestamp(event.timestamp)}
                  </Typography>
                </TimelineOppositeContent>

                <TimelineSeparator>
                  <TimelineDot
                    sx={{
                      bgcolor: getEventColor(event.severity),
                      boxShadow: "none",
                      marginY: "5px",
                    }}
                  >
                    {getEventIcon(event.type)}
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>

                <TimelineContent sx={{ py: "6px", px: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {event.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        paragraph
                        sx={{ mt: 0 }}
                      >
                        {event.description}
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {event.user && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              src={event.userAvatar}
                              alt={event.user}
                              sx={{
                                width: 16,
                                height: 16,
                                mr: 0.5,
                                fontSize: "0.6rem",
                              }}
                            >
                              {event.user.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {event.user}
                            </Typography>
                          </Box>
                        )}

                        <Typography variant="caption" color="text.secondary">
                          {event.source}
                        </Typography>

                        <Chip
                          label={formatEventSeverity(event.severity)}
                          size="small"
                          sx={{
                            height: 16,
                            "& .MuiChip-label": {
                              px: 0.5,
                              fontSize: "0.6rem",
                              fontWeight: "medium",
                            },
                            bgcolor: alpha(getEventColor(event.severity), 0.1),
                            color: getEventColor(event.severity),
                            border: 1,
                            borderColor: alpha(
                              getEventColor(event.severity),
                              0.2
                            ),
                          }}
                        />
                      </Box>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={(e) => handleEventMenuOpen(e, event)}
                      sx={{ mt: -0.5 }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Divider sx={{ mt: 1, mb: 0.5 }} />
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ mt: "auto", pt: 1, textAlign: "right" }}>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAllEvents}
          size="small"
        >
          View All Events
        </Button>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={Boolean(filterMenuAnchorEl)}
        onClose={handleFilterMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="body2" fontWeight="medium">
            Event Types
          </Typography>
        </MenuItem>
        <Divider />

        {Object.values(EventType).map((eventType) => (
          <MenuItem
            key={eventType}
            onClick={() => handleEventTypeToggle(eventType)}
            sx={{
              bgcolor: selectedEventTypes.includes(eventType)
                ? alpha(theme.palette.primary.main, 0.1)
                : "transparent",
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 1,
              }}
            >
              {getEventIcon(eventType)}
            </Box>
            <Typography variant="body2">
              {getEventTypeLabel(eventType)}
            </Typography>
          </MenuItem>
        ))}

        <Divider />
        <MenuItem onClick={handleClearFilters}>
          <Typography variant="body2" color="text.secondary">
            Clear All Filters
          </Typography>
        </MenuItem>
      </Menu>

      {/* Event Action Menu */}
      <Menu
        anchorEl={eventMenuAnchorEl}
        open={Boolean(eventMenuAnchorEl)}
        onClose={handleEventMenuClose}
      >
        <MenuItem
          onClick={() => activeEvent && handleViewEventDetails(activeEvent.id)}
        >
          View Details
        </MenuItem>
        <MenuItem onClick={handleEventMenuClose}>Mark as Reviewed</MenuItem>
      </Menu>
    </Box>
  );
};

export default ActivityTimelineWidget;
