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
  useTheme,
  alpha,
} from "@mui/material";
import {
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  useGetUserBehaviorAnomaliesQuery,
  useRunUserBehaviorAnalysisMutation,
  useGetUserRiskScoresQuery,
  useUpdateAnomalyStatusMutation,
  useMarkAsFalsePositiveMutation,
} from "../../services/anomalyService";
import {
  UserBehaviorAnomaly,
  UserBehaviorCategory,
} from "../../types/anomalyTypes";

// Mock data for users if needed
const users = [
  { id: "user1", name: "John Doe", department: "IT" },
  { id: "user2", name: "Jane Smith", department: "Finance" },
  { id: "user3", name: "Robert Johnson", department: "HR" },
  { id: "user4", name: "Lisa Williams", department: "Engineering" },
  { id: "user5", name: "Michael Brown", department: "Operations" },
];

const UserBehaviorAnalytics: React.FC = () => {
  const theme = useTheme();
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch anomalies with filters
  const {
    data: anomalies,
    isLoading,
    error,
    refetch,
  } = useGetUserBehaviorAnomaliesQuery({
    searchTerm: searchTerm,
    anomalyTypes: ["user_behavior"],
    ...(categoryFilter !== "all" ? { behaviorCategory: categoryFilter } : {}),
    ...(selectedUser ? { userId: selectedUser } : {}),
    dateRange: getDateRangeFromTimeRange(timeRange),
  });

  // Fetch risk scores
  const { data: riskScores, isLoading: isLoadingRiskScores } =
    useGetUserRiskScoresQuery();

  // Run analysis mutation
  const [runAnalysis, { isLoading: isAnalyzing }] =
    useRunUserBehaviorAnalysisMutation();

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
        userId: selectedUser || undefined,
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
  const getCategoryIcon = (category: UserBehaviorCategory) => {
    switch (category) {
      case "authentication":
        return <PersonIcon />;
      case "data_access":
        return <SearchIcon />;
      case "administrative_action":
        return <AssignmentIcon />;
      case "privilege_escalation":
        return <WarningIcon />;
      default:
        return <TimelineIcon />;
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
        <Typography variant="h4">User Behavior Analytics</Typography>

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
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="user-select-label">User</InputLabel>
              <Select
                labelId="user-select-label"
                id="user-select"
                value={selectedUser}
                label="User"
                onChange={(e) => setSelectedUser(e.target.value as string)}
              >
                <MenuItem value="">All Users</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-select-label">
                Behavior Category
              </InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={categoryFilter}
                label="Behavior Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="authentication">Authentication</MenuItem>
                <MenuItem value="data_access">Data Access</MenuItem>
                <MenuItem value="resource_usage">Resource Usage</MenuItem>
                <MenuItem value="administrative_action">
                  Administrative Action
                </MenuItem>
                <MenuItem value="communication">Communication</MenuItem>
                <MenuItem value="movement">Movement</MenuItem>
                <MenuItem value="privilege_escalation">
                  Privilege Escalation
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

          <Grid item xs={12} sm={3}>
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

      {/* Risk Scores */}
      <Typography variant="h6" gutterBottom>
        User Risk Scores
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {isLoadingRiskScores ? (
          <Grid item xs={12}>
            <CircularProgress />
          </Grid>
        ) : riskScores && riskScores.length > 0 ? (
          riskScores.slice(0, 5).map((user) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={user.userId}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" noWrap>
                      {user.userName}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Risk Score
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color={
                          user.riskScore > 75
                            ? "error"
                            : user.riskScore > 50
                            ? "warning.main"
                            : "success.main"
                        }
                      >
                        {user.riskScore}/100
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={user.riskScore}
                      sx={{
                        mt: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(
                          user.riskScore > 75
                            ? theme.palette.error.light
                            : user.riskScore > 50
                            ? theme.palette.warning.light
                            : theme.palette.success.light,
                          0.2
                        ),
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            user.riskScore > 75
                              ? theme.palette.error.main
                              : user.riskScore > 50
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">No risk score data available</Alert>
          </Grid>
        )}
      </Grid>

      {/* Anomalies Table */}
      <Typography variant="h6" gutterBottom>
        Detected Anomalies
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
                <TableCell>User</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Detected At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {anomalies.map((anomaly: UserBehaviorAnomaly) => (
                <TableRow key={anomaly.id} hover>
                  <TableCell>
                    <Typography variant="body2">{anomaly.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {anomaly.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{anomaly.userName}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={anomaly.behaviorCategory.replace("_", " ")}
                      icon={getCategoryIcon(anomaly.behaviorCategory)}
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
          No anomalies found. Try adjusting your filters or run a new analysis.
        </Alert>
      )}
    </Box>
  );
};

export default UserBehaviorAnalytics;
