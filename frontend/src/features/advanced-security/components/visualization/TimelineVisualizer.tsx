/**
 * Timeline Visualizer Component
 *
 * A reusable component for visualizing event sequences, incident timelines,
 * threat progressions, and other time-based security data.
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Timeline as TimelineIcon,
  TimelineOutlined as TimelineOutlinedIcon,
  FilterList as FilterListIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  GetApp as DownloadIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Today as CalendarIcon,
} from "@mui/icons-material";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  time: number; // timestamp
  type: string;
  severity?: "critical" | "high" | "medium" | "low" | "info";
  icon?: string;
  source?: string;
  status?: string;
  related?: string[];
  metadata?: Record<string, any>;
}

export interface TimelineGroup {
  id: string;
  title: string;
  events: TimelineEvent[];
}

export interface TimelineVisualizerProps {
  events: TimelineEvent[];
  groups?: TimelineGroup[];
  title?: string;
  height?: number | string;
  startTime?: number;
  endTime?: number;
  loading?: boolean;
  darkMode?: boolean;
  showGrouping?: boolean;
  showFilters?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  onRangeChange?: (startTime: number, endTime: number) => void;
  onExport?: () => void;
}

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({
  events,
  groups,
  title = "Event Timeline",
  height = 500,
  startTime,
  endTime,
  loading = false,
  darkMode = false,
  showGrouping = true,
  showFilters = true,
  onEventClick,
  onRangeChange,
  onExport,
}) => {
  const theme = useTheme();

  // State
  const [viewMode, setViewMode] = useState<"all" | "compact" | "grouped">(
    "all"
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null
  );
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState({
    types: [] as string[],
    severities: [] as string[],
    sources: [] as string[],
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<string>("24h");

  const availableEventTypes = React.useMemo(() => {
    return Array.from(new Set(events.map((e) => e.type)));
  }, [events]);

  const availableSeverities = React.useMemo(() => {
    return Array.from(
      new Set(events.filter((e) => e.severity).map((e) => e.severity))
    ) as string[];
  }, [events]);

  const availableSources = React.useMemo(() => {
    return Array.from(
      new Set(events.filter((e) => e.source).map((e) => e.source))
    ) as string[];
  }, [events]);

  // Get filtered events
  const filteredEvents = React.useMemo(() => {
    return events.filter((event) => {
      // Filter by type
      if (filters.types.length > 0 && !filters.types.includes(event.type)) {
        return false;
      }

      // Filter by severity
      if (
        filters.severities.length > 0 &&
        event.severity &&
        !filters.severities.includes(event.severity)
      ) {
        return false;
      }

      // Filter by source
      if (
        filters.sources.length > 0 &&
        event.source &&
        !filters.sources.includes(event.source)
      ) {
        return false;
      }

      // Filter by time range
      if (startTime && event.time < startTime) {
        return false;
      }

      if (endTime && event.time > endTime) {
        return false;
      }

      // Filter by selected groups
      if (showGrouping && groups && selectedGroupIds.length > 0) {
        const eventInSelectedGroup = groups
          .filter((group) => selectedGroupIds.includes(group.id))
          .some((group) => group.events.some((e) => e.id === event.id));

        if (!eventInSelectedGroup) {
          return false;
        }
      }

      return true;
    });
  }, [
    events,
    filters,
    startTime,
    endTime,
    groups,
    selectedGroupIds,
    showGrouping,
  ]);

  // Handle view mode change
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: "all" | "compact" | "grouped" | null
  ) => {
    if (newMode) {
      setViewMode(newMode);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: string | null
  ) => {
    if (newTimeRange) {
      setTimeRange(newTimeRange);

      // Calculate new time range
      const now = Date.now();
      let newStartTime = now;

      switch (newTimeRange) {
        case "1h":
          newStartTime = now - 60 * 60 * 1000;
          break;
        case "24h":
          newStartTime = now - 24 * 60 * 60 * 1000;
          break;
        case "7d":
          newStartTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case "30d":
          newStartTime = now - 30 * 24 * 60 * 60 * 1000;
          break;
        case "all":
          newStartTime = 0;
          break;
      }

      if (onRangeChange) {
        onRangeChange(newStartTime, now);
      }
    }
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  // Handle event click
  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(selectedEvent?.id === event.id ? null : event);

    if (onEventClick) {
      onEventClick(event);
    }
  };

  // Handle filter menu open
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };

  // Handle filter menu close
  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
  };

  // Handle filter change
  const handleFilterChange = (
    filterType: "types" | "severities" | "sources",
    value: string
  ) => {
    setFilters((prev) => {
      const currentValues = [...prev[filterType]];

      if (currentValues.includes(value)) {
        return {
          ...prev,
          [filterType]: currentValues.filter((v) => v !== value),
        };
      } else {
        return {
          ...prev,
          [filterType]: [...currentValues, value],
        };
      }
    });
  };

  // Handle group selection
  const handleGroupSelection = (groupId: string) => {
    setSelectedGroupIds((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  // Get severity color
  const getSeverityColor = (severity?: string): string => {
    switch (severity) {
      case "critical":
        return theme.palette.error.dark;
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.success.main;
      case "info":
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Paper
      sx={{
        p: 2,
        height: height,
        backgroundColor: darkMode
          ? theme.palette.grey[900]
          : theme.palette.background.paper,
        color: darkMode
          ? theme.palette.common.white
          : theme.palette.text.primary,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">{title}</Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Time Range Selector */}
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            size="small"
          >
            <ToggleButton value="1h">1h</ToggleButton>
            <ToggleButton value="24h">24h</ToggleButton>
            <ToggleButton value="7d">7d</ToggleButton>
            <ToggleButton value="30d">30d</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>

          {/* View Mode */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="compact">Compact</ToggleButton>
            {showGrouping && (
              <ToggleButton value="grouped">Grouped</ToggleButton>
            )}
          </ToggleButtonGroup>

          {/* Zoom Controls */}
          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>

          {/* Filter Button */}
          {showFilters && (
            <Tooltip title="Filter Events">
              <IconButton size="small" onClick={handleFilterMenuOpen}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Export Button */}
          <Tooltip title="Export Timeline">
            <IconButton size="small" onClick={onExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Groups Sidebar (if grouped view) */}
        {viewMode === "grouped" && groups && (
          <Box
            sx={{
              width: 200,
              borderRight: `1px solid ${theme.palette.divider}`,
              p: 1,
              mr: 2,
              overflowY: "auto",
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Event Groups
            </Typography>

            {groups.map((group) => (
              <Box
                key={group.id}
                sx={{
                  p: 1,
                  mb: 1,
                  borderRadius: 1,
                  cursor: "pointer",
                  backgroundColor: selectedGroupIds.includes(group.id)
                    ? darkMode
                      ? theme.palette.primary.dark
                      : theme.palette.primary.light
                    : "transparent",
                  "&:hover": {
                    backgroundColor: selectedGroupIds.includes(group.id)
                      ? darkMode
                        ? theme.palette.primary.dark
                        : theme.palette.primary.light
                      : darkMode
                      ? theme.palette.action.hover
                      : theme.palette.action.hover,
                  },
                }}
                onClick={() => handleGroupSelection(group.id)}
              >
                <Typography variant="body2">{group.title}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {group.events.length} events
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Timeline */}
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredEvents.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography variant="body2" color="textSecondary">
                No events match the current filters
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                position: "relative",
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top left",
                transition: "transform 0.3s ease",
              }}
            >
              {/* Timeline Axis */}
              <Box
                sx={{
                  position: "absolute",
                  left: 90,
                  top: 20,
                  bottom: 20,
                  width: 4,
                  backgroundColor: darkMode
                    ? theme.palette.divider
                    : theme.palette.primary.light,
                  zIndex: 1,
                }}
              />

              {/* Events */}
              <Box sx={{ pl: 10, pb: 2 }}>
                {filteredEvents.map((event, index) => (
                  <Box
                    key={event.id}
                    sx={{
                      display: "flex",
                      mb: viewMode === "compact" ? 1 : 4,
                      position: "relative",
                    }}
                  >
                    {/* Time */}
                    <Typography
                      variant="body2"
                      sx={{
                        width: 80,
                        textAlign: "right",
                        pr: 2,
                        color: darkMode
                          ? theme.palette.grey[400]
                          : theme.palette.text.secondary,
                        mt: 0.5,
                      }}
                    >
                      {new Date(event.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>

                    {/* Event Dot */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: 90,
                        top: 8,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: getSeverityColor(event.severity),
                        transform: "translateX(-50%)",
                        zIndex: 2,
                        transition: "all 0.2s ease",
                        boxShadow: "0 0 0 4px rgba(0,0,0,0.1)",
                        "&:hover": {
                          transform: "translateX(-50%) scale(1.2)",
                        },
                      }}
                    />

                    {/* Event Content */}
                    <Box
                      sx={{
                        ml: 3,
                        p: viewMode === "compact" ? 1 : 2,
                        borderRadius: 1,
                        backgroundColor: darkMode
                          ? theme.palette.grey[800]
                          : theme.palette.background.default,
                        border: `1px solid ${theme.palette.divider}`,
                        cursor: "pointer",
                        width: "calc(100% - 180px)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: theme.shadows[2],
                          borderColor: getSeverityColor(event.severity),
                        },
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant={
                            viewMode === "compact" ? "body2" : "subtitle2"
                          }
                          sx={{ fontWeight: "medium" }}
                        >
                          {event.title}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {event.severity && (
                            <Chip
                              label={event.severity}
                              size="small"
                              sx={{
                                backgroundColor: getSeverityColor(
                                  event.severity
                                ),
                                color: "white",
                                height: 20,
                                fontSize: 10,
                              }}
                            />
                          )}

                          <Chip
                            label={event.type}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: 10 }}
                          />
                        </Box>
                      </Box>

                      {!viewMode || viewMode === "all" ? (
                        <>
                          {event.description && (
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ mb: 1 }}
                            >
                              {event.description}
                            </Typography>
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="caption" color="textSecondary">
                              {formatTimestamp(event.time)}
                            </Typography>

                            {event.source && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                Source: {event.source}
                              </Typography>
                            )}
                          </Box>
                        </>
                      ) : null}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Selected Event Details */}
        {selectedEvent && (
          <Box
            sx={{
              width: 280,
              borderLeft: `1px solid ${theme.palette.divider}`,
              p: 2,
              ml: 2,
              overflowY: "auto",
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Event Details
            </Typography>

            <Typography variant="h6" gutterBottom>
              {selectedEvent.title}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" paragraph>
                {selectedEvent.description || "No description available"}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Time
              </Typography>
              <Typography variant="body2">
                {formatTimestamp(selectedEvent.time)}
              </Typography>
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Type
              </Typography>
              <Typography variant="body2">{selectedEvent.type}</Typography>
            </Box>

            {selectedEvent.severity && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Severity
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedEvent.severity}
                    size="small"
                    sx={{
                      backgroundColor: getSeverityColor(selectedEvent.severity),
                      color: "white",
                    }}
                  />
                </Box>
              </Box>
            )}

            {selectedEvent.source && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Source
                </Typography>
                <Typography variant="body2">{selectedEvent.source}</Typography>
              </Box>
            )}

            {selectedEvent.status && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Status
                </Typography>
                <Typography variant="body2">{selectedEvent.status}</Typography>
              </Box>
            )}

            {selectedEvent.metadata &&
              Object.keys(selectedEvent.metadata).length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Additional Information
                  </Typography>

                  {Object.entries(selectedEvent.metadata).map(
                    ([key, value]) => (
                      <Box key={key} sx={{ mb: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Typography>
                        <Typography variant="body2">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : value.toString()}
                        </Typography>
                      </Box>
                    )
                  )}
                </>
              )}
          </Box>
        )}
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={Boolean(filterMenuAnchorEl)}
        onClose={handleFilterMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Filter By Type</Typography>
        </MenuItem>
        {availableEventTypes.map((type) => (
          <MenuItem
            key={type}
            onClick={() => handleFilterChange("types", type)}
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={filters.types.includes(type)}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
              }
              label={type}
            />
          </MenuItem>
        ))}

        <Divider />

        <MenuItem disabled>
          <Typography variant="subtitle2">Filter By Severity</Typography>
        </MenuItem>
        {availableSeverities.map((severity) => (
          <MenuItem
            key={severity}
            onClick={() => handleFilterChange("severities", severity)}
          >
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={filters.severities.includes(severity)}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: getSeverityColor(severity),
                      mr: 1,
                    }}
                  />
                  {severity}
                </Box>
              }
            />
          </MenuItem>
        ))}

        {availableSources.length > 0 && (
          <>
            <Divider />

            <MenuItem disabled>
              <Typography variant="subtitle2">Filter By Source</Typography>
            </MenuItem>
            {availableSources.map((source) => (
              <MenuItem
                key={source}
                onClick={() => handleFilterChange("sources", source)}
              >
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={filters.sources.includes(source)}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                    />
                  }
                  label={source}
                />
              </MenuItem>
            ))}
          </>
        )}
      </Menu>
    </Paper>
  );
};
