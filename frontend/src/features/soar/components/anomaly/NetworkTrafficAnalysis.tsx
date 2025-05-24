import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  LinearProgress,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from "@mui/material";
import {
  NetworkCheck as NetworkIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
  TrendingUp as TrendingUpIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import {
  useGetNetworkAnomaliesQuery,
  useRunNetworkTrafficAnalysisMutation,
  useUpdateAnomalyStatusMutation,
  useMarkAsFalsePositiveMutation,
  useGetAnomalyHotspotsQuery,
} from "../../services/anomalyService";
import { NetworkAnomaly, TrafficCategory } from "../../types/anomalyTypes";

// For demonstration - world map with hotspots would be here
const NetworkMap: React.FC = () => {
  return (
    <Paper
      sx={{
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: alpha("#000", 0.02),
        border: "1px dashed #ccc",
      }}
    >
      <Typography color="textSecondary">
        Network Traffic Map Visualization
      </Typography>
    </Paper>
  );
};

const NetworkTrafficAnalysis: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [sourceIp, setSourceIp] = useState<string>("");
  const [destinationIp, setDestinationIp] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch anomalies with filters
  const {
    data: anomalies,
    isLoading,
    error,
    refetch,
  } = useGetNetworkAnomaliesQuery({
    searchTerm: searchTerm,
    anomalyTypes: ["network"],
    ...(categoryFilter !== "all" ? { trafficCategory: categoryFilter } : {}),
    ...(sourceIp ? { sourceIp } : {}),
    ...(destinationIp ? { destinationIp } : {}),
    dateRange: getDateRangeFromTimeRange(timeRange),
  });

  // Fetch hotspots
  const { data: hotspots, isLoading: isLoadingHotspots } =
    useGetAnomalyHotspotsQuery();

  // Run analysis mutation
  const [runAnalysis, { isLoading: isAnalyzing }] =
    useRunNetworkTrafficAnalysisMutation();

  // Update status mutation
  const [updateStatus] = useUpdateAnomalyStatusMutation();

  // Mark as false positive mutation
  const [markAsFalsePositive] = useMarkAsFalsePositiveMutation();

  // Helper function to get date range based on time range selection
  function getDateRangeFromTimeRange(
    range: string
  ): { start: string; end: string } | undefined {
    if (range === "all") return undefined;

    const now = new Date();
    const end = now.toISOString();
    let start;

    switch (range) {
      case "24h":
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case "7d":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "30d":
        start = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      default:
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }

    return { start, end };
  }

  // Handle running analysis
  const handleRunAnalysis = async () => {
    try {
      await runAnalysis({
        sourceIp: sourceIp || undefined,
        destinationIp: destinationIp || undefined,
        timeRange: getDateRangeFromTimeRange(timeRange),
      });
      refetch();
    } catch (error) {
      console.error("Failed to run analysis:", error);
    }
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

  // Get category icon
  const getCategoryIcon = (category: TrafficCategory) => {
    switch (category) {
      case "data_exfiltration":
        return <TrendingUpIcon />;
      case "command_and_control":
        return <SecurityIcon />;
      case "port_scanning":
        return <SearchIcon />;
      case "ddos":
        return <WarningIcon />;
      default:
        return <NetworkIcon />;
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
        <Typography variant="h4">Network Traffic Analysis</Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<PlayArrowIcon />}
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Run Analysis"}
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Source IP"
              variant="outlined"
              value={sourceIp}
              onChange={(e) => setSourceIp(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Destination IP"
              variant="outlined"
              value={destinationIp}
              onChange={(e) => setDestinationIp(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-select-label">
                Traffic Category
              </InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={categoryFilter}
                label="Traffic Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="data_exfiltration">Data Exfiltration</MenuItem>
                <MenuItem value="command_and_control">
                  Command & Control
                </MenuItem>
                <MenuItem value="port_scanning">Port Scanning</MenuItem>
                <MenuItem value="ddos">DDoS</MenuItem>
                <MenuItem value="lateral_movement">Lateral Movement</MenuItem>
                <MenuItem value="protocol_violation">
                  Protocol Violation
                </MenuItem>
                <MenuItem value="encrypted_traffic">Encrypted Traffic</MenuItem>
                <MenuItem value="unusual_destination">
                  Unusual Destination
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range"
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm("")}
                    sx={{ visibility: searchTerm ? "visible" : "hidden" }}
                  >
                    <RefreshIcon />
                  </IconButton>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="network analysis tabs"
        >
          <Tab icon={<NetworkIcon />} label="Anomalies" />
          <Tab icon={<LanguageIcon />} label="Network Map" />
          <Tab icon={<TrendingUpIcon />} label="Traffic Trends" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Box role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <>
            {/* Anomalies Table */}
            <Typography variant="h6" gutterBottom>
              Detected Network Anomalies
            </Typography>
            {isLoading ? (
              <CircularProgress />
            ) : error ? (
              <Alert severity="error">
                Error loading anomalies: {JSON.stringify(error)}
              </Alert>
            ) : anomalies && anomalies.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Anomaly</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Destination</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Confidence</TableCell>
                      <TableCell>Detected At</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {anomalies.map((anomaly: NetworkAnomaly) => (
                      <TableRow key={anomaly.id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {anomaly.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {anomaly.description}
                          </Typography>
                        </TableCell>
                        <TableCell>{anomaly.sourceIp || "-"}</TableCell>
                        <TableCell>{anomaly.destinationIp || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={anomaly.trafficCategory.replace("_", " ")}
                            icon={getCategoryIcon(anomaly.trafficCategory)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={anomaly.severity}
                            sx={{
                              backgroundColor: alpha(
                                getSeverityColor(anomaly.severity),
                                0.1
                              ),
                              color: getSeverityColor(anomaly.severity),
                              fontWeight: "medium",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box sx={{ width: "100%", mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={anomaly.confidence}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                }}
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                            >{`${Math.round(anomaly.confidence)}%`}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <AccessTimeIcon
                              fontSize="small"
                              sx={{ mr: 0.5, color: "text.secondary" }}
                            />
                            <Typography variant="body2">
                              {new Date(anomaly.detectedAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={anomaly.status}
                            color={
                              anomaly.status === "new"
                                ? "error"
                                : anomaly.status === "investigating"
                                ? "warning"
                                : anomaly.status === "resolved"
                                ? "success"
                                : "default"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex" }}>
                            <Tooltip title="Investigate">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  updateStatus({
                                    id: anomaly.id,
                                    status: "investigating",
                                  })
                                }
                                disabled={anomaly.status === "investigating"}
                              >
                                <SearchIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mark as False Positive">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  markAsFalsePositive({
                                    id: anomaly.id,
                                    reason: "Manually marked as false positive",
                                  })
                                }
                                disabled={anomaly.status === "false_positive"}
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                No network anomalies found. Try adjusting your filters or run a
                new analysis.
              </Alert>
            )}
          </>
        )}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <>
            <Typography variant="h6" gutterBottom>
              Network Traffic Visualization
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <NetworkMap />
                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                  <Typography variant="caption" color="textSecondary">
                    Map shows network traffic flows and detected anomalies by
                    geographic location
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Hotspots */}
            <Typography variant="h6" gutterBottom>
              Traffic Hotspots
            </Typography>
            <Grid container spacing={3}>
              {isLoadingHotspots ? (
                <Grid item xs={12}>
                  <CircularProgress />
                </Grid>
              ) : hotspots && hotspots.length > 0 ? (
                hotspots.map((hotspot, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography variant="subtitle1">
                            {hotspot.category}
                          </Typography>
                          <Chip
                            size="small"
                            label={hotspot.severity}
                            color={
                              hotspot.severity === "critical"
                                ? "error"
                                : hotspot.severity === "high"
                                ? "error"
                                : hotspot.severity === "medium"
                                ? "warning"
                                : "info"
                            }
                          />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" color="textSecondary">
                            Anomaly Count
                          </Typography>
                          <Typography variant="h5">{hotspot.count}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">No traffic hotspots detected</Alert>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 2}>
        {tabValue === 2 && (
          <>
            <Typography variant="h6" gutterBottom>
              Traffic Trends (Placeholder)
            </Typography>
            <Paper
              sx={{
                height: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha("#000", 0.02),
                border: "1px dashed #ccc",
              }}
            >
              <Typography color="textSecondary">
                Traffic Trends Visualization
              </Typography>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default NetworkTrafficAnalysis;
