import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import LogsFilter from "../components/logs/LogsFilter";
import LogsTable from "../components/logs/LogsTable";
import LogTimeline from "../components/logs/LogTimeline";
import LogsChart from "../components/logs/LogsChart";
import { generateMockLogs } from "../utils/mockData";

// Log entry interface
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: "error" | "warning" | "info" | "debug";
  source: string;
  message: string;
  details: string;
  ipAddress?: string;
  userId?: string;
  sessionId?: string;
  resourceId?: string;
  tags: string[];
}

// Filter state interface
export interface LogsFilterState {
  levels: ("error" | "warning" | "info" | "debug")[];
  sources: string[];
  startDate: Date | null;
  endDate: Date | null;
  ipAddress: string;
  userId: string;
  resourceId: string;
  tags: string[];
}

// Tab interface
interface LogTabProps {
  children?: React.ReactNode;
  label: string;
  value: number;
}

// Tab Panel component
function TabPanel(props: LogTabProps & { index: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`logs-tabpanel-${index}`}
      aria-labelledby={`logs-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Logs: React.FC = () => {
  // State for logs data
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<LogsFilterState>({
    levels: ["error", "warning", "info", "debug"],
    sources: [],
    startDate: null,
    endDate: null,
    ipAddress: "",
    userId: "",
    resourceId: "",
    tags: [],
  });

  // Sources list for filtering
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);

  // Load mock data
  useEffect(() => {
    setLoading(true);
    const mockLogs = generateMockLogs(500);
    setLogs(mockLogs);

    // Extract unique sources for filter options
    const sources = Array.from(new Set(mockLogs.map((log) => log.source)));
    setSourceOptions(sources);

    setLoading(false);
  }, []);

  // Apply filters whenever filters or search query changes
  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, logs]);

  // Apply filters and search
  const applyFilters = () => {
    let result = [...logs];

    // Filter by log level
    if (filters.levels.length > 0) {
      result = result.filter((log) => filters.levels.includes(log.level));
    }

    // Filter by source
    if (filters.sources.length > 0) {
      result = result.filter((log) => filters.sources.includes(log.source));
    }

    // Filter by date range
    if (filters.startDate) {
      result = result.filter((log) => log.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      result = result.filter((log) => log.timestamp <= filters.endDate!);
    }

    // Filter by IP address
    if (filters.ipAddress) {
      result = result.filter((log) =>
        log.ipAddress?.toLowerCase().includes(filters.ipAddress.toLowerCase())
      );
    }

    // Filter by user ID
    if (filters.userId) {
      result = result.filter((log) =>
        log.userId?.toLowerCase().includes(filters.userId.toLowerCase())
      );
    }

    // Filter by resource ID
    if (filters.resourceId) {
      result = result.filter((log) =>
        log.resourceId?.toLowerCase().includes(filters.resourceId.toLowerCase())
      );
    }

    // Filter by tags
    if (filters.tags.length > 0) {
      result = result.filter((log) =>
        filters.tags.some((tag) => log.tags.includes(tag))
      );
    }

    // Apply search query to message and details
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.message.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(result);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<LogsFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Refresh logs data
  const handleRefresh = () => {
    setLoading(true);
    const mockLogs = generateMockLogs(500);
    setLogs(mockLogs);
    setLoading(false);
  };

  // Export logs to CSV
  const handleExport = () => {
    // Implementation would go here
    console.log("Exporting logs...");

    // Simple CSV export functionality
    const headers = [
      "Timestamp",
      "Level",
      "Source",
      "Message",
      "IP Address",
      "User ID",
      "Resource ID",
      "Tags",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        [
          new Date(log.timestamp).toISOString(),
          log.level,
          `"${log.source.replace(/"/g, '""')}"`,
          `"${log.message.replace(/"/g, '""')}"`,
          log.ipAddress || "",
          log.userId || "",
          log.resourceId || "",
          `"${log.tags.join(", ")}"`,
        ].join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `logs_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Logs Management
      </Typography>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search logs by message or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? "primary" : "default"}
                aria-label="toggle filters"
                size="small"
              >
                <FilterListIcon />
              </IconButton>
              <IconButton
                onClick={handleRefresh}
                aria-label="refresh logs"
                size="small"
              >
                <RefreshIcon />
              </IconButton>
              <IconButton
                onClick={handleExport}
                aria-label="export logs"
                size="small"
              >
                <DownloadIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <LogsFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              sourceOptions={sourceOptions}
            />
          </Box>
        )}
      </Paper>

      {filteredLogs.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No logs found matching the current filters. Try adjusting your search
          criteria.
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="logs view tabs"
          >
            <Tab
              label="Table View"
              id="logs-tab-0"
              aria-controls="logs-tabpanel-0"
            />
            <Tab
              label="Timeline View"
              id="logs-tab-1"
              aria-controls="logs-tabpanel-1"
            />
            <Tab
              label="Analytics"
              id="logs-tab-2"
              aria-controls="logs-tabpanel-2"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0} label="Table View">
          <LogsTable logs={filteredLogs} loading={loading} />
        </TabPanel>

        <TabPanel value={activeTab} index={1} label="Timeline View">
          <LogTimeline logs={filteredLogs} loading={loading} />
        </TabPanel>

        <TabPanel value={activeTab} index={2} label="Analytics">
          <LogsChart logs={filteredLogs} loading={loading} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Logs;
