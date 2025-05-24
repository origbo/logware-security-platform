import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Assignment as AssignmentIcon,
  SaveAlt as SaveIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  FilterList as FilterIcon,
  RemoveRedEye as EyeIcon,
  Save as SaveAltIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

// Since we don't have actual API services for threat hunting yet, I'll mock some interfaces and data
interface HuntingQuery {
  id: string;
  name: string;
  description: string;
  query: string;
  dataSource: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  createdBy: string;
  createdAt: string;
  lastRun?: string;
  status: "active" | "inactive" | "draft";
  technique?: string;
  tactic?: string;
}

interface HuntingResult {
  id: string;
  queryId: string;
  queryName: string;
  executedAt: string;
  executedBy: string;
  status: "completed" | "running" | "failed";
  matchCount: number;
  duration: number;
  dataSource: string;
}

// Mock data
const mockHuntingQueries: HuntingQuery[] = [
  {
    id: "hunt-1",
    name: "Suspicious PowerShell Commands",
    description:
      "Detects execution of PowerShell with encoded commands, potential obfuscation techniques.",
    query:
      "process.name:powershell.exe AND process.args:(*-enc* OR *-EncodedCommand*)",
    dataSource: "endpoint_events",
    category: "command_execution",
    severity: "high",
    createdBy: "admin",
    createdAt: "2025-04-10T15:30:00.000Z",
    lastRun: "2025-05-15T08:15:00.000Z",
    status: "active",
    technique: "T1059.001",
    tactic: "Execution",
  },
  {
    id: "hunt-2",
    name: "Unusual Service Installations",
    description:
      "Identifies services created with suspicious executable paths or names.",
    query:
      "event.category:process AND (process.name:sc.exe OR process.name:services.exe) AND process.args:(create OR config)",
    dataSource: "windows_events",
    category: "persistence",
    severity: "medium",
    createdBy: "analyst1",
    createdAt: "2025-04-15T11:45:00.000Z",
    lastRun: "2025-05-14T14:20:00.000Z",
    status: "active",
    technique: "T1543.003",
    tactic: "Persistence",
  },
  {
    id: "hunt-3",
    name: "DNS Tunneling Detection",
    description:
      "Detects potential DNS tunneling by identifying unusually long DNS queries.",
    query:
      "event.category:network AND dns.question.name.length > 50 AND dns.question.type:TXT",
    dataSource: "network_logs",
    category: "exfiltration",
    severity: "high",
    createdBy: "admin",
    createdAt: "2025-03-28T09:15:00.000Z",
    lastRun: "2025-05-10T10:30:00.000Z",
    status: "active",
    technique: "T1048.003",
    tactic: "Exfiltration",
  },
  {
    id: "hunt-4",
    name: "Scheduled Task Creation",
    description:
      "Detects scheduled task creation, which could be used for persistence.",
    query:
      "event.category:process AND process.name:schtasks.exe AND process.args:/create",
    dataSource: "endpoint_events",
    category: "persistence",
    severity: "medium",
    createdBy: "analyst2",
    createdAt: "2025-04-22T13:20:00.000Z",
    status: "draft",
  },
];

const mockHuntingResults: HuntingResult[] = [
  {
    id: "result-1",
    queryId: "hunt-1",
    queryName: "Suspicious PowerShell Commands",
    executedAt: "2025-05-15T08:15:00.000Z",
    executedBy: "admin",
    status: "completed",
    matchCount: 3,
    duration: 45,
    dataSource: "endpoint_events",
  },
  {
    id: "result-2",
    queryId: "hunt-2",
    queryName: "Unusual Service Installations",
    executedAt: "2025-05-14T14:20:00.000Z",
    executedBy: "system",
    status: "completed",
    matchCount: 0,
    duration: 32,
    dataSource: "windows_events",
  },
  {
    id: "result-3",
    queryId: "hunt-3",
    queryName: "DNS Tunneling Detection",
    executedAt: "2025-05-10T10:30:00.000Z",
    executedBy: "admin",
    status: "completed",
    matchCount: 12,
    duration: 78,
    dataSource: "network_logs",
  },
];

// Data sources for hunting
const dataSources = [
  {
    id: "endpoint_events",
    name: "Endpoint Events",
    description: "Process, file, and registry events from endpoints",
  },
  {
    id: "windows_events",
    name: "Windows Events",
    description: "Windows Event Logs",
  },
  {
    id: "network_logs",
    name: "Network Logs",
    description: "Network traffic, DNS, and proxy logs",
  },
  { id: "email_logs", name: "Email Logs", description: "Email gateway logs" },
  {
    id: "authentication_logs",
    name: "Authentication Logs",
    description: "Authentication events from IDPs, VPNs, etc.",
  },
];

const ThreatHuntingDashboard: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDataSource, setSelectedDataSource] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("");
  const [isRunningHunt, setIsRunningHunt] = useState(false);
  const [huntQueries, setHuntQueries] =
    useState<HuntingQuery[]>(mockHuntingQueries);
  const [huntResults, setHuntResults] =
    useState<HuntingResult[]>(mockHuntingResults);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter queries based on search and filters
  const filteredQueries = huntQueries.filter((query) => {
    const matchesSearch =
      searchTerm === "" ||
      query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.query.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDataSource =
      selectedDataSource === "" || query.dataSource === selectedDataSource;
    const matchesSeverity =
      selectedSeverity === "" || query.severity === selectedSeverity;

    return matchesSearch && matchesDataSource && matchesSeverity;
  });

  // Filter results based on search
  const filteredResults = huntResults.filter(
    (result) =>
      searchTerm === "" ||
      result.queryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Run a hunt query
  const handleRunHunt = (queryId: string) => {
    setIsRunningHunt(true);

    // Simulate running a hunt
    setTimeout(() => {
      const query = huntQueries.find((q) => q.id === queryId);
      if (query) {
        // Update the query's last run timestamp
        const updatedQueries = huntQueries.map((q) =>
          q.id === queryId ? { ...q, lastRun: new Date().toISOString() } : q
        );
        setHuntQueries(updatedQueries);

        // Add a new result
        const newResult: HuntingResult = {
          id: `result-${Date.now()}`,
          queryId,
          queryName: query.name,
          executedAt: new Date().toISOString(),
          executedBy: "current_user",
          status: "completed",
          matchCount: Math.floor(Math.random() * 5), // Random count between 0-4
          duration: Math.floor(Math.random() * 60) + 20, // Random duration between 20-80s
          dataSource: query.dataSource,
        };

        setHuntResults([newResult, ...huntResults]);
        setIsRunningHunt(false);
      }
    }, 2000); // Simulate 2-second processing time
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return theme.palette.error.dark;
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Threat Hunting</Typography>

        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          Create New Hunt
        </Button>
      </Box>

      {/* Hunt Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                Total Hunt Queries
              </Typography>
              <Typography variant="h3">{huntQueries.length}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Chip
                  size="small"
                  label={`${
                    huntQueries.filter((q) => q.status === "active").length
                  } Active`}
                  color="success"
                  sx={{ mr: 1 }}
                />
                <Chip
                  size="small"
                  label={`${
                    huntQueries.filter((q) => q.status === "draft").length
                  } Draft`}
                  color="default"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                Hunts Run (Last 30 Days)
              </Typography>
              <Typography variant="h3">{huntResults.length}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Chip
                  size="small"
                  label={`${
                    huntResults.filter((r) => r.matchCount > 0).length
                  } With Matches`}
                  color="warning"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                Total Matches Found
              </Typography>
              <Typography variant="h3">
                {huntResults.reduce(
                  (total, result) => total + result.matchCount,
                  0
                )}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  From {huntResults.filter((r) => r.matchCount > 0).length}{" "}
                  successful hunts
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                Automated Hunts
              </Typography>
              <Typography variant="h3">
                {Math.floor(huntQueries.length / 2)}{" "}
                {/* Mock data - half of hunts are automated */}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Chip
                  size="small"
                  icon={<ScheduleIcon fontSize="small" />}
                  label="Scheduled"
                  color="primary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Search Hunts"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                endAdornment: searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="data-source-label">Data Source</InputLabel>
              <Select
                labelId="data-source-label"
                id="data-source-select"
                value={selectedDataSource}
                label="Data Source"
                onChange={(e) => setSelectedDataSource(e.target.value)}
              >
                <MenuItem value="">All Sources</MenuItem>
                {dataSources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    {source.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="severity-label">Severity</InputLabel>
              <Select
                labelId="severity-label"
                id="severity-select"
                value={selectedSeverity}
                label="Severity"
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <MenuItem value="">All Severities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchTerm("");
                setSelectedDataSource("");
                setSelectedSeverity("");
              }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<SearchIcon />} label="Hunt Queries" />
          <Tab icon={<HistoryIcon />} label="Hunt Results" />
          <Tab icon={<AssignmentIcon />} label="Data Sources" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Data Source</TableCell>
                  <TableCell>MITRE Technique</TableCell>
                  <TableCell>Last Run</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQueries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Alert severity="info">
                        No hunt queries found matching the current filters.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQueries.map((query) => (
                    <TableRow key={query.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {query.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {query.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={query.severity}
                          sx={{
                            backgroundColor: alpha(
                              getSeverityColor(query.severity),
                              0.1
                            ),
                            color: getSeverityColor(query.severity),
                            fontWeight: "medium",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {dataSources.find((ds) => ds.id === query.dataSource)
                          ?.name || query.dataSource}
                      </TableCell>
                      <TableCell>
                        {query.technique ? (
                          <Chip
                            size="small"
                            label={query.technique}
                            color="default"
                            onClick={() =>
                              window.open(
                                `https://attack.mitre.org/techniques/${query.technique}`,
                                "_blank"
                              )
                            }
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {query.lastRun
                          ? new Date(query.lastRun).toLocaleString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={query.status}
                          color={
                            query.status === "active"
                              ? "success"
                              : query.status === "inactive"
                              ? "default"
                              : "warning"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Tooltip title="Run Hunt">
                            <IconButton
                              size="small"
                              onClick={() => handleRunHunt(query.id)}
                              disabled={
                                isRunningHunt || query.status === "draft"
                              }
                            >
                              {isRunningHunt &&
                              query.id === huntQueries[0].id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <PlayArrowIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Query">
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Schedule">
                            <IconButton size="small">
                              <ScheduleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Query Name</TableCell>
                  <TableCell>Executed At</TableCell>
                  <TableCell>Executed By</TableCell>
                  <TableCell>Data Source</TableCell>
                  <TableCell>Matches</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Alert severity="info">
                        No hunt results found matching the current filters.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.id} hover>
                      <TableCell>{result.queryName}</TableCell>
                      <TableCell>
                        {new Date(result.executedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{result.executedBy}</TableCell>
                      <TableCell>
                        {dataSources.find((ds) => ds.id === result.dataSource)
                          ?.name || result.dataSource}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={result.matchCount}
                          color={result.matchCount > 0 ? "warning" : "success"}
                        />
                      </TableCell>
                      <TableCell>{result.duration}s</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {result.status === "completed" ? (
                            <CheckCircleIcon
                              fontSize="small"
                              color="success"
                              sx={{ mr: 1 }}
                            />
                          ) : result.status === "running" ? (
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                          ) : (
                            <ErrorIcon
                              fontSize="small"
                              color="error"
                              sx={{ mr: 1 }}
                            />
                          )}
                          <Typography variant="body2">
                            {result.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          {result.matchCount > 0 && (
                            <Tooltip title="View Results">
                              <IconButton size="small">
                                <EyeIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Export Results">
                            <IconButton size="small">
                              <SaveAltIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Create Case">
                            <IconButton
                              size="small"
                              disabled={result.matchCount === 0}
                            >
                              <AssignmentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 2}>
        {tabValue === 2 && (
          <Grid container spacing={3}>
            {dataSources.map((source) => (
              <Grid item xs={12} sm={6} key={source.id}>
                <Card>
                  <CardHeader
                    title={source.name}
                    subheader={source.description}
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Queries Using This Source
                        </Typography>
                        <Typography variant="h6">
                          {
                            huntQueries.filter(
                              (q) => q.dataSource === source.id
                            ).length
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Data Retention
                        </Typography>
                        <Typography variant="h6">30 days</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View Schema</Button>
                    <Button size="small">Query Builder</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default ThreatHuntingDashboard;
