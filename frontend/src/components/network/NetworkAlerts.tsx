import React, { useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import SearchIcon from "@mui/icons-material/Search";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckIcon from "@mui/icons-material/Check";
import BlockIcon from "@mui/icons-material/Block";
import ReportIcon from "@mui/icons-material/Report";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  NetworkDevice,
  NetworkAlert,
} from "../../pages/network/NetworkMonitoringPage";

// Interface for component props
interface NetworkAlertsProps {
  alerts: NetworkAlert[];
  devices: NetworkDevice[];
}

const NetworkAlerts: React.FC<NetworkAlertsProps> = ({ alerts, devices }) => {
  const theme = useTheme();

  // State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSelectedSeverities] = useState<string[]>([]);
  const [typeFilter, setSelectedTypes] = useState<string[]>([]);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for expanded alert details
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Filter alerts based on filters
  const filteredAlerts = alerts.filter((alert) => {
    // Apply search filter
    if (
      searchQuery &&
      !alert.type.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !alert.details.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !alert.sourceIp.includes(searchQuery) &&
      !alert.destinationIp.includes(searchQuery)
    ) {
      return false;
    }

    // Apply status filter
    if (statusFilter !== "all" && alert.status !== statusFilter) {
      return false;
    }

    // Apply severity filter
    if (severityFilter.length > 0 && !severityFilter.includes(alert.severity)) {
      return false;
    }

    // Apply type filter
    if (typeFilter.length > 0 && !typeFilter.includes(alert.type)) {
      return false;
    }

    return true;
  });

  // Sort alerts by timestamp (newest first)
  const sortedAlerts = [...filteredAlerts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Toggle expanded alert
  const handleToggleExpand = (alertId: string) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
  };

  // Calculate alert statistics
  const alertStats = {
    total: alerts.length,
    active: alerts.filter((alert) => alert.status === "active").length,
    investigating: alerts.filter((alert) => alert.status === "investigating")
      .length,
    resolved: alerts.filter((alert) => alert.status === "resolved").length,
    false_positives: alerts.filter(
      (alert) => alert.status === "false_positive"
    ).length,
    bySeverity: {
      critical: alerts.filter((alert) => alert.severity === "critical").length,
      high: alerts.filter((alert) => alert.severity === "high").length,
      medium: alerts.filter((alert) => alert.severity === "medium").length,
      low: alerts.filter((alert) => alert.severity === "low").length,
      info: alerts.filter((alert) => alert.severity === "info").length,
    },
    byType: {
      intrusion: alerts.filter((alert) => alert.type === "intrusion").length,
      malware: alerts.filter((alert) => alert.type === "malware").length,
      data_loss: alerts.filter((alert) => alert.type === "data_loss").length,
      policy_violation: alerts.filter(
        (alert) => alert.type === "policy_violation"
      ).length,
      anomaly: alerts.filter((alert) => alert.type === "anomaly").length,
    },
  };

  // Prepare data for severity distribution chart
  const severityChartData = [
    {
      name: "Critical",
      value: alertStats.bySeverity.critical,
      color: theme.palette.error.dark,
    },
    {
      name: "High",
      value: alertStats.bySeverity.high,
      color: theme.palette.error.main,
    },
    {
      name: "Medium",
      value: alertStats.bySeverity.medium,
      color: theme.palette.warning.main,
    },
    {
      name: "Low",
      value: alertStats.bySeverity.low,
      color: theme.palette.success.main,
    },
    {
      name: "Info",
      value: alertStats.bySeverity.info,
      color: theme.palette.info.main,
    },
  ];

  // Prepare data for alert type chart
  const typeChartData = [
    { name: "Intrusion", value: alertStats.byType.intrusion },
    { name: "Malware", value: alertStats.byType.malware },
    { name: "Data Loss", value: alertStats.byType.data_loss },
    { name: "Policy Violation", value: alertStats.byType.policy_violation },
    { name: "Anomaly", value: alertStats.byType.anomaly },
  ];

  // Pagination
  const paginatedAlerts = sortedAlerts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Get severity icon and color
  const getSeverityInfo = (severity: string) => {
    switch (severity) {
      case "critical":
        return { color: theme.palette.error.dark, icon: <ErrorIcon /> };
      case "high":
        return { color: theme.palette.error.main, icon: <WarningIcon /> };
      case "medium":
        return { color: theme.palette.warning.main, icon: <WarningIcon /> };
      case "low":
        return { color: theme.palette.success.main, icon: <InfoIcon /> };
      case "info":
      default:
        return { color: theme.palette.info.main, icon: <InfoIcon /> };
    }
  };

  // Format alert type
  const formatAlertType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return { icon: <NotificationsIcon />, color: "#ff9800", label: "Active" };
      case "investigating":
        return { icon: <VisibilityIcon />, color: "#2196f3", label: "Investigating" };
      case "resolved":
        return { icon: <CheckIcon />, color: "#4caf50", label: "Resolved" };
      case "false_positive":
        return { icon: <BlockIcon />, color: "#9e9e9e", label: "False Positive" };
      default:
        return { icon: <InfoIcon />, color: "#9e9e9e", label: status };
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Alert Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alert Overview
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Card
                  sx={{
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 2 }}>
                    <Typography variant="h4">{alertStats.total}</Typography>
                    <Typography variant="body2">Total Alerts</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card
                  sx={{
                    bgcolor: theme.palette.error.light,
                    color: theme.palette.error.contrastText,
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 2 }}>
                    <Typography variant="h4">{alertStats.active}</Typography>
                    <Typography variant="body2">Active Alerts</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card
                  sx={{
                    bgcolor: theme.palette.warning.light,
                    color: theme.palette.warning.contrastText,
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 2 }}>
                    <Typography variant="h4">
                      {alertStats.investigating}
                    </Typography>
                    <Typography variant="body2">Investigating</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card
                  sx={{
                    bgcolor: theme.palette.success.light,
                    color: theme.palette.success.contrastText,
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 2 }}>
                    <Typography variant="h4">{alertStats.resolved}</Typography>
                    <Typography variant="body2">Resolved</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Alert Severity Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={severityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {severityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name) => [`${value} alerts`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Alert Types
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={typeChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip
                      formatter={(value) => [`${value} alerts`]}
                    />
                    <Bar dataKey="value" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Alert Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Alert Management
            </Typography>

            <TextField
              fullWidth
              placeholder="Search alerts..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Quick Filters
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              <Chip
                label="All"
                onClick={() => {
                  setStatusFilter("all");
                  setSelectedSeverities([]);
                  setSelectedTypes([]);
                }}
                color="primary"
                variant={
                  statusFilter === "all" &&
                  severityFilter.length === 0 &&
                  typeFilter.length === 0
                    ? "filled"
                    : "outlined"
                }
              />
              <Chip
                label="Active"
                onClick={() =>
                  setStatusFilter(statusFilter === "active" ? "all" : "active")
                }
                color="warning"
                variant={statusFilter === "active" ? "filled" : "outlined"}
              />
              <Chip
                label="Critical"
                onClick={() => {
                  const newSeverities = severityFilter.includes("critical")
                    ? severityFilter.filter((s) => s !== "critical")
                    : [...severityFilter, "critical"];
                  setSelectedSeverities(newSeverities);
                }}
                color="error"
                variant={
                  severityFilter.includes("critical") ? "filled" : "outlined"
                }
              />
              <Chip
                label="Intrusions"
                onClick={() => {
                  const newTypes = typeFilter.includes("intrusion")
                    ? typeFilter.filter((t) => t !== "intrusion")
                    : [...typeFilter, "intrusion"];
                  setSelectedTypes(newTypes);
                }}
                color="primary"
                variant={
                  typeFilter.includes("intrusion") ? "filled" : "outlined"
                }
              />
              <Chip
                label="Resolved"
                onClick={() =>
                  setStatusFilter(
                    statusFilter === "resolved" ? "all" : "resolved"
                  )
                }
                color="success"
                variant={statusFilter === "resolved" ? "filled" : "outlined"}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Critical Alerts
            </Typography>
            <List dense>
              {alerts
                .filter(
                  (alert) =>
                    alert.severity === "critical" && alert.status !== "resolved"
                )
                .slice(0, 5)
                .map((alert) => (
                  <ListItem key={alert.id} disablePadding>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <ErrorIcon color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.title}
                      secondary={format(
                        new Date(alert.timestamp),
                        "MMM d, HH:mm"
                      )}
                    />
                  </ListItem>
                ))}
              {alerts.filter(
                (alert) =>
                  alert.severity === "critical" && alert.status !== "resolved"
              ).length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No critical alerts"
                    secondary="All systems operating normally"
                  />
                </ListItem>
              )}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<NotificationsIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                Configure Alert Rules
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PersonIcon />}
                fullWidth
              >
                Manage Alert Assignments
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Alerts Table */}
        <Grid item xs={12}>
          <Paper>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>Severity</TableCell>
                    <TableCell>Alert</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAlerts.map((alert) => {
                    const { color: severityColor, icon: severityIcon } =
                      getSeverityInfo(alert.severity);
                    const { color: statusColor, label: statusLabel, icon: statusIcon } =
                      getStatusInfo(alert.status);
                    const isExpanded = expandedAlert === alert.id;

                    return (
                      <React.Fragment key={alert.id}>
                        <TableRow hover>
                          <TableCell padding="checkbox">
                            <IconButton
                              aria-label="expand row"
                              size="small"
                              onClick={() => handleToggleExpand(alert.id)}
                            >
                              {isExpanded ? (
                                <KeyboardArrowUpIcon />
                              ) : (
                                <KeyboardArrowDownIcon />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={severityIcon}
                              label={alert.severity}
                              size="small"
                              sx={{
                                bgcolor: severityColor,
                                color: "#fff",
                                textTransform: "capitalize",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {alert.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={alert.type}>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {alert.type}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{alert.sourceIp}</TableCell>
                          <TableCell>{alert.destinationIp}</TableCell>
                          <TableCell>
                            {format(new Date(alert.timestamp), "MMM d, HH:mm")}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusIcon}
                              label={statusLabel}
                              size="small"
                              sx={{
                                bgcolor: statusColor,
                                color: "#fff",
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {alert.status === "new" && (
                              <Tooltip title="Start Investigation">
                                <IconButton size="small">
                                  <PersonIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {(alert.status === "new" ||
                              alert.status === "investigating") && (
                              <Tooltip title="Mark as Resolved">
                                <IconButton size="small">
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            {(alert.status === "new" ||
                              alert.status === "investigating") && (
                              <Tooltip title="Flag as False Positive">
                                <IconButton size="small">
                                  <BlockIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>

                        {/* Expanded Alert Details */}
                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={9}
                          >
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ margin: 2 }}>
                                <Grid container spacing={3}>
                                  <Grid item xs={12} md={8}>
                                    <Typography
                                      variant="h6"
                                      gutterBottom
                                      component="div"
                                    >
                                      Alert Details
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                      {alert.details}
                                    </Typography>

                                    {alert.mitigationSteps && (
                                      <>
                                        <Typography
                                          variant="subtitle2"
                                          gutterBottom
                                          sx={{ mt: 2 }}
                                        >
                                          Mitigation Steps
                                        </Typography>
                                        <Typography variant="body1">{alert.mitigationSteps}</Typography>
                                      </>
                                    )}

                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                      <Grid item xs={12} sm={6}>
                                        <Typography
                                          variant="subtitle2"
                                          gutterBottom
                                        >
                                          Affected Devices
                                        </Typography>
                                        <List dense disablePadding>
                                          {alert.affectedDevices.map(
                                            (deviceId) => {
                                              const device = devices.find(
                                                (d) => d.id === deviceId
                                              );
                                              return (
                                                <ListItem
                                                  key={deviceId}
                                                  disablePadding
                                                  sx={{ py: 0.5 }}
                                                >
                                                  <ListItemText
                                                    primary={
                                                      device?.name ||
                                                      "Unknown Device"
                                                    }
                                                    secondary={device?.ip || ""}
                                                  />
                                                </ListItem>
                                              );
                                            }
                                          )}
                                        </List>
                                      </Grid>

                                      <Grid item xs={12} sm={6}>
                                        <Typography
                                          variant="subtitle2"
                                          gutterBottom
                                        >
                                          Related Alerts
                                        </Typography>
                                        <List dense disablePadding>
                                          {alert.relatedAlerts.map(
                                            (relatedId) => {
                                              const relatedAlert = alerts.find(
                                                (a) => a.id === relatedId
                                              );
                                              return (
                                                <ListItem
                                                  key={relatedId}
                                                  disablePadding
                                                  sx={{ py: 0.5 }}
                                                >
                                                  <ListItemText
                                                    primary={
                                                      relatedAlert?.title ||
                                                      "Unknown Alert"
                                                    }
                                                    secondary={
                                                      relatedAlert
                                                        ? format(
                                                            new Date(
                                                              relatedAlert.timestamp
                                                            ),
                                                            "MMM d, HH:mm"
                                                          )
                                                        : ""
                                                    }
                                                  />
                                                </ListItem>
                                              );
                                            }
                                          )}
                                          {alert.relatedAlerts.length === 0 && (
                                            <ListItem disablePadding>
                                              <ListItemText primary="No related alerts found" />
                                            </ListItem>
                                          )}
                                        </List>
                                      </Grid>
                                    </Grid>
                                  </Grid>

                                  <Grid item xs={12} md={4}>
                                    <Card variant="outlined">
                                      <CardContent>
                                        <Typography
                                          variant="subtitle1"
                                          gutterBottom
                                        >
                                          Alert Management
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            gutterBottom
                                          >
                                            Current Status
                                          </Typography>
                                          <Chip
                                            icon={statusIcon}
                                            label={statusLabel}
                                            sx={{
                                              bgcolor: statusColor,
                                              color: "#fff",
                                            }}
                                          />
                                        </Box>

                                        {alert.assignedTo && (
                                          <Box sx={{ mb: 2 }}>
                                            <Typography
                                              variant="body2"
                                              color="textSecondary"
                                              gutterBottom
                                            >
                                              Assigned To
                                            </Typography>
                                            <Typography variant="h6">
                                              {alert.assignedTo}
                                            </Typography>
                                          </Box>
                                        )}

                                        <Box sx={{ mb: 2 }}>
                                          <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            gutterBottom
                                          >
                                            Alert Timeline
                                          </Typography>
                                          <Typography variant="body2">
                                            Created:{" "}
                                            {format(
                                              new Date(alert.timestamp),
                                              "MMM d, yyyy HH:mm"
                                            )}
                                          </Typography>
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Box sx={{ mt: 2 }}>
                                          <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            sx={{ mb: 1 }}
                                            startIcon={<PersonIcon />}
                                            disabled={
                                              alert.status === "resolved" ||
                                              alert.status === "false_positive"
                                            }
                                          >
                                            Assign to Me
                                          </Button>
                                          <Button
                                            variant="outlined"
                                            color="success"
                                            fullWidth
                                            sx={{ mb: 1 }}
                                            startIcon={<CheckCircleIcon />}
                                            disabled={
                                              alert.status === "resolved" ||
                                              alert.status === "false_positive"
                                            }
                                          >
                                            Mark as Resolved
                                          </Button>
                                          <Button
                                            variant="outlined"
                                            color="error"
                                            fullWidth
                                            startIcon={<ReportIcon />}
                                            disabled={
                                              alert.status === "resolved" ||
                                              alert.status === "false_positive"
                                            }
                                          >
                                            Flag as False Positive
                                          </Button>
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                </Grid>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}

                  {paginatedAlerts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          No alerts match your criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredAlerts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NetworkAlerts;
