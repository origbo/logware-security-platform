import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
  Chip,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme,
  alpha,
  Tooltip,
  SelectChangeEvent,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import useAuth from "../../../features/auth/hooks/useAuth";
import logViewerService, {
  LogLevel,
  LogSource,
  LogEntry,
  LogFilter,
} from "../services/LogViewerService";
import LogFilterPanel from "./LogFilterPanel";
import LogEntryItem from "./LogEntryItem";

/**
 * LogViewer Component
 *
 * Provides real-time log viewing capabilities with advanced filtering
 * and WebSocket integration
 */
const LogViewer: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [isScrollPinned, setIsScrollPinned] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<LogFilter>({
    levels: Object.values(LogLevel),
    limit: 100,
  });
  const [quickSearch, setQuickSearch] = useState("");

  // Connect to WebSocket on component mount if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial log load
    fetchLogs();

    // Set up WebSocket if live mode is enabled
    if (isLive) {
      setupRealTimeLogging();
    }

    // Cleanup on unmount
    return () => {
      logViewerService.disconnectWebSocket();
    };
  }, [isAuthenticated]);

  // Handle live mode changes
  useEffect(() => {
    if (!isAuthenticated) return;

    if (isLive) {
      setupRealTimeLogging();
    } else {
      logViewerService.disconnectWebSocket();
    }
  }, [isLive, isAuthenticated]);

  // Effect for handling quick search
  useEffect(() => {
    // Debounce search term
    const timer = setTimeout(() => {
      const newFilter = { ...filter, searchTerm: quickSearch };
      setFilter(newFilter);

      if (!isLive) {
        fetchLogs(newFilter);
      } else {
        logViewerService.updateFilter(newFilter);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [quickSearch]);

  // Set up real-time logging
  const setupRealTimeLogging = () => {
    // Remove any existing listeners
    logViewerService.disconnectWebSocket();

    // Handle new log entries
    const handleLogEntry = (entry: LogEntry) => {
      setLogs((prevLogs) => {
        const newLogs = [...prevLogs, entry];
        // Keep the log list to a reasonable size
        if (newLogs.length > 1000) {
          return newLogs.slice(-1000);
        }
        return newLogs;
      });

      // Scroll to bottom if pinned
      if (isScrollPinned && scrollContainerRef.current) {
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop =
              scrollContainerRef.current.scrollHeight;
          }
        }, 0);
      }
    };

    // Handle connection errors
    const handleError = (error: any) => {
      console.error("WebSocket error:", error);
      setError("Connection error. Attempting to reconnect...");
    };

    // Handle successful connection
    const handleConnect = () => {
      setError(null);
    };

    // Handle disconnection
    const handleDisconnect = () => {
      setError("Connection lost. Attempting to reconnect...");
    };

    // Register event handlers
    logViewerService.onMessage(handleLogEntry);
    logViewerService.onError(handleError);
    logViewerService.onConnect(handleConnect);
    logViewerService.onDisconnect(handleDisconnect);

    // Start WebSocket connection with current filter
    logViewerService.connectWebSocket(filter);

    // Return cleanup function
    return () => {
      logViewerService.removeMessageCallback(handleLogEntry);
      logViewerService.removeErrorCallback(handleError);
      logViewerService.removeConnectCallback(handleConnect);
      logViewerService.removeDisconnectCallback(handleDisconnect);
    };
  };

  // Fetch logs from API
  const fetchLogs = async (customFilter?: LogFilter) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const fetchedLogs = await logViewerService.getLogs(
        customFilter || filter
      );
      setLogs(fetchedLogs);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to load logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom =
      container.scrollHeight - container.clientHeight <=
      container.scrollTop + 20;

    // Auto-pin scroll when user scrolls to bottom
    if (isAtBottom !== isScrollPinned) {
      setIsScrollPinned(isAtBottom);
    }
  };

  // Toggle live mode
  const toggleLiveMode = () => {
    const newLiveState = !isLive;
    setIsLive(newLiveState);

    if (newLiveState) {
      setupRealTimeLogging();
    } else {
      logViewerService.disconnectWebSocket();
    }
  };

  // Clear all logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Handle filter change
  const handleFilterChange = (newFilter: LogFilter) => {
    setFilter(newFilter);

    if (isLive) {
      logViewerService.updateFilter(newFilter);
    } else {
      fetchLogs(newFilter);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    // Update filter based on tab
    let levels: LogLevel[] = [];

    switch (newValue) {
      case 0: // All logs
        levels = Object.values(LogLevel);
        break;
      case 1: // Errors
        levels = [LogLevel.ERROR];
        break;
      case 2: // Warnings
        levels = [LogLevel.WARNING];
        break;
      case 3: // Info
        levels = [LogLevel.INFO];
        break;
      case 4: // Debug
        levels = [LogLevel.DEBUG, LogLevel.TRACE];
        break;
    }

    const newFilter = { ...filter, levels };
    handleFilterChange(newFilter);
  };

  // Toggle expanded state of a log entry
  const toggleExpandLog = (id: string) => {
    setExpandedLogIds((prevState) => {
      const newState = new Set(prevState);
      if (newState.has(id)) {
        newState.delete(id);
      } else {
        newState.add(id);
      }
      return newState;
    });
  };

  // Export logs
  const handleExportLogs = async (format: "csv" | "json" = "csv") => {
    try {
      await logViewerService.exportLogs(filter, format);
    } catch (err) {
      console.error("Error exporting logs:", err);
      setError("Failed to export logs. Please try again.");
    }
  };

  // Get log level color
  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return theme.palette.error.main;
      case LogLevel.WARNING:
        return theme.palette.warning.main;
      case LogLevel.INFO:
        return theme.palette.info.main;
      case LogLevel.DEBUG:
        return theme.palette.success.main;
      case LogLevel.TRACE:
        return theme.palette.text.secondary;
      default:
        return theme.palette.text.primary;
    }
  };

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
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
        <Typography variant="h5" component="h1">
          Log Viewer
        </Typography>
        <Box>
          <Tooltip
            title={isLive ? "Pause real-time logs" : "Resume real-time logs"}
          >
            <IconButton
              color={isLive ? "primary" : "default"}
              onClick={toggleLiveMode}
            >
              {isLive ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh logs">
            <IconButton onClick={() => fetchLogs()} disabled={isLive}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear logs">
            <IconButton onClick={clearLogs}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export logs (CSV)">
            <IconButton onClick={() => handleExportLogs("csv")}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Advanced filters">
            <IconButton
              color={filterOpen ? "primary" : "default"}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <Box sx={{ display: "flex", mb: 2 }}>
        <TextField
          placeholder="Quick search..."
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          }}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mr: 2 }}
        />
        <FormControl size="small" sx={{ width: 200 }}>
          <InputLabel id="log-limit-label">Limit</InputLabel>
          <Select
            labelId="log-limit-label"
            value={filter.limit?.toString() || "100"}
            label="Limit"
            onChange={(e: SelectChangeEvent) => {
              const newFilter = { ...filter, limit: parseInt(e.target.value) };
              handleFilterChange(newFilter);
            }}
          >
            <MenuItem value="50">50 entries</MenuItem>
            <MenuItem value="100">100 entries</MenuItem>
            <MenuItem value="200">200 entries</MenuItem>
            <MenuItem value="500">500 entries</MenuItem>
            <MenuItem value="1000">1000 entries</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Advanced Filter Panel */}
      {filterOpen && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <LogFilterPanel
            filter={filter}
            onFilterChange={handleFilterChange}
            onClose={() => setFilterOpen(false)}
          />
        </Paper>
      )}

      {/* Tabs for Log Level Filtering */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}
      >
        <Tab label="All Logs" />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: theme.palette.error.main,
                  mr: 1,
                }}
              />
              Errors
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: theme.palette.warning.main,
                  mr: 1,
                }}
              />
              Warnings
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: theme.palette.info.main,
                  mr: 1,
                }}
              />
              Info
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: theme.palette.success.main,
                  mr: 1,
                }}
              />
              Debug/Trace
            </Box>
          }
        />
      </Tabs>

      {/* Real-time Status Indicator */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {loading ? (
          <CircularProgress size={14} sx={{ mr: 1 }} />
        ) : (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: isLive ? "success.main" : "text.disabled",
              mr: 1,
            }}
          />
        )}
        <Typography variant="caption" color="text.secondary">
          {loading
            ? "Loading logs..."
            : isLive
            ? "Real-time logging active"
            : "Real-time logging paused"}
        </Typography>
        <Box sx={{ ml: "auto" }}>
          <Tooltip
            title={
              isScrollPinned ? "Auto-scroll enabled" : "Auto-scroll disabled"
            }
          >
            <Chip
              label={isScrollPinned ? "Auto-scroll: On" : "Auto-scroll: Off"}
              size="small"
              color={isScrollPinned ? "primary" : "default"}
              onClick={() => setIsScrollPinned(!isScrollPinned)}
            />
          </Tooltip>
        </Box>
      </Box>

      {/* Log Container */}
      <Paper
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(0,0,0,0.2)"
              : "rgba(0,0,0,0.03)",
        }}
      >
        {logs.length === 0 && !loading ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              p: 4,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No logs to display
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {isLive
                ? "Waiting for new log entries..."
                : "Try changing your filters or refreshing"}
            </Typography>
            {!isLive && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => fetchLogs()}
                sx={{ mt: 2 }}
              >
                Refresh Logs
              </Button>
            )}
          </Box>
        ) : (
          <Box
            ref={scrollContainerRef}
            onScroll={handleScroll}
            sx={{
              flex: 1,
              overflowY: "auto",
              fontFamily: "monospace",
              fontSize: "0.85rem",
            }}
          >
            {logs.map((log) => (
              <LogEntryItem
                key={log.id}
                log={log}
                expanded={expandedLogIds.has(log.id)}
                onToggleExpand={() => toggleExpandLog(log.id)}
                levelColor={getLevelColor(log.level)}
              />
            ))}

            {loading && logs.length > 0 && (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LogViewer;
