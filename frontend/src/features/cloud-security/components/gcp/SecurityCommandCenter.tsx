import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  FilterList as FilterListIcon,
  Timeline as TimelineIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  useGetSecurityCommandCenterOverviewQuery,
  useGetSecurityFindingsQuery,
  useGetSecurityAssetsQuery,
  useGetSecurityStatusQuery,
  useRunSecurityScanMutation,
} from "../../services/gcpSecurityService";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`gcp-security-tabpanel-${index}`}
      aria-labelledby={`gcp-security-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * GCP Security Command Center Component
 * Provides interface to interact with Google Cloud Security Command Center
 */
const SecurityCommandCenter: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [projectId, setProjectId] = useState<string>("all");
  const [findingSeverityFilter, setFindingSeverityFilter] =
    useState<string>("all");

  // Fetch GCP security data
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useGetSecurityCommandCenterOverviewQuery({
    projectId: projectId !== "all" ? projectId : undefined,
  });

  const { data: statusData, isLoading: isStatusLoading } =
    useGetSecurityStatusQuery({
      projectId: projectId !== "all" ? projectId : undefined,
    });

  const { data: findingsData, isLoading: isFindingsLoading } =
    useGetSecurityFindingsQuery({
      projectId: projectId !== "all" ? projectId : undefined,
      severity:
        findingSeverityFilter !== "all" ? findingSeverityFilter : undefined,
      limit: 10,
    });

  const { data: assetsData, isLoading: isAssetsLoading } =
    useGetSecurityAssetsQuery({
      projectId: projectId !== "all" ? projectId : undefined,
    });

  const [runSecurityScan, { isLoading: isScanning }] =
    useRunSecurityScanMutation();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle project change
  const handleProjectChange = (event: SelectChangeEvent) => {
    setProjectId(event.target.value);
  };

  // Handle severity filter change
  const handleSeverityChange = (event: SelectChangeEvent) => {
    setFindingSeverityFilter(event.target.value);
  };

  // Run security scan
  const handleRunSecurityScan = async () => {
    if (projectId !== "all") {
      try {
        await runSecurityScan({ projectId });
        refetchOverview();
      } catch (error) {
        console.error("Failed to run security scan:", error);
      }
    }
  };

  // Get color based on severity
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

  // Get icon based on severity
  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
      case "high":
        return <ErrorIcon sx={{ color: getSeverityColor(severity) }} />;
      case "medium":
        return <WarningIcon sx={{ color: getSeverityColor(severity) }} />;
      case "low":
        return <InfoIcon sx={{ color: getSeverityColor(severity) }} />;
      default:
        return <InfoIcon sx={{ color: getSeverityColor(severity) }} />;
    }
  };

  // Get icon based on state
  const getStateIcon = (state: string) => {
    switch (state.toLowerCase()) {
      case "active":
      case "open":
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case "inactive":
      case "closed":
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      default:
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              GCP Security Command Center
            </Typography>
            <Typography variant="body1">
              Monitor and manage Google Cloud security posture with Security
              Command Center.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FormControl sx={{ minWidth: 200, mr: 2 }}>
              <InputLabel id="project-select-label">Project</InputLabel>
              <Select
                labelId="project-select-label"
                id="project-select"
                value={projectId}
                label="Project"
                onChange={handleProjectChange}
              >
                <MenuItem value="all">All Projects</MenuItem>
                {overviewData?.projects?.map((project: any) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name || project.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SecurityIcon />}
              onClick={handleRunSecurityScan}
              disabled={isScanning || projectId === "all"}
            >
              {isScanning ? "Scanning..." : "Run Security Scan"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Findings
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isOverviewLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  <>
                    <ErrorIcon
                      sx={{ mr: 1, color: theme.palette.error.main }}
                    />
                    <Typography variant="h4" color="error.main">
                      {overviewData?.totalFindingsCount || 0}
                    </Typography>
                  </>
                )}
              </Box>
              <Typography variant="caption" color="textSecondary">
                Active security findings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Critical Findings
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isOverviewLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  <>
                    <ErrorIcon
                      sx={{ mr: 1, color: theme.palette.error.dark }}
                    />
                    <Typography variant="h4" color="error.dark">
                      {overviewData?.criticalFindingsCount || 0}
                    </Typography>
                  </>
                )}
              </Box>
              <Typography variant="caption" color="textSecondary">
                Critical severity findings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Assets Monitored
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isOverviewLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  <>
                    <VisibilityIcon
                      sx={{ mr: 1, color: theme.palette.info.main }}
                    />
                    <Typography variant="h4" color="info.main">
                      {overviewData?.assetsCount || 0}
                    </Typography>
                  </>
                )}
              </Box>
              <Typography variant="caption" color="textSecondary">
                Total assets monitored
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Vulnerabilities
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {isOverviewLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  <>
                    <WarningIcon
                      sx={{ mr: 1, color: theme.palette.warning.main }}
                    />
                    <Typography variant="h4" color="warning.main">
                      {overviewData?.vulnerabilitiesCount || 0}
                    </Typography>
                  </>
                )}
              </Box>
              <Typography variant="caption" color="textSecondary">
                Detected vulnerabilities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Tabs Content */}
      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="gcp security tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<ErrorIcon />} iconPosition="start" label="Findings" />
          <Tab icon={<VisibilityIcon />} iconPosition="start" label="Assets" />
          <Tab icon={<TimelineIcon />} iconPosition="start" label="Status" />
        </Tabs>

        {/* Findings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Security Findings</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FormControl sx={{ minWidth: 150, mr: 2 }}>
                <InputLabel id="severity-select-label">Severity</InputLabel>
                <Select
                  labelId="severity-select-label"
                  id="severity-select"
                  value={findingSeverityFilter}
                  label="Severity"
                  onChange={handleSeverityChange}
                  size="small"
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              <IconButton
                onClick={() => refetchOverview()}
                title="Refresh data"
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {isFindingsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : !findingsData || findingsData.length === 0 ? (
            <Alert severity="info">
              No security findings found with the current filter settings.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Finding</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell>First Detected</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {findingsData.map((finding: any) => (
                    <TableRow key={finding.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {getSeverityIcon(finding.severity)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {finding.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{finding.category}</TableCell>
                      <TableCell>{finding.resourceName}</TableCell>
                      <TableCell>
                        <Chip
                          label={finding.severity}
                          size="small"
                          sx={{
                            bgcolor: alpha(
                              getSeverityColor(finding.severity),
                              0.1
                            ),
                            color: getSeverityColor(finding.severity),
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={finding.state}
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(finding.firstDetectedTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<SearchIcon />}
                        >
                          Investigate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Assets Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Monitored Assets</Typography>
            <IconButton onClick={() => refetchOverview()} title="Refresh data">
              <RefreshIcon />
            </IconButton>
          </Box>

          {isAssetsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : !assetsData || assetsData.length === 0 ? (
            <Alert severity="info">No assets found.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Asset Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Security Findings</TableCell>
                    <TableCell>Last Scan</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assetsData.map((asset: any) => (
                    <TableRow key={asset.id} hover>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.type}</TableCell>
                      <TableCell>{asset.projectName}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {asset.findingsCount > 0 ? (
                            <ErrorIcon
                              sx={{ mr: 1, color: theme.palette.error.main }}
                            />
                          ) : (
                            <CheckCircleIcon
                              sx={{ mr: 1, color: theme.palette.success.main }}
                            />
                          )}
                          <Typography variant="body2">
                            {asset.findingsCount}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {asset.lastScanTime
                          ? new Date(asset.lastScanTime).toLocaleString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Status Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Security Status</Typography>
            <IconButton onClick={() => refetchOverview()} title="Refresh data">
              <RefreshIcon />
            </IconButton>
          </Box>

          {isStatusLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : !statusData || !statusData.securityHealthAnalytics ? (
            <Alert severity="info">No security status data available.</Alert>
          ) : (
            <Grid container spacing={3}>
              {/* Security Services Overview */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="Security Services Status" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      {Object.entries(statusData).map(
                        ([key, value]: [string, any]) =>
                          key !== "id" &&
                          key !== "projectId" && (
                            <Grid item xs={12} md={4} key={key}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      mb: 2,
                                    }}
                                  >
                                    {value.enabled ? (
                                      <CheckCircleIcon
                                        sx={{
                                          mr: 1,
                                          color: theme.palette.success.main,
                                        }}
                                      />
                                    ) : (
                                      <ErrorIcon
                                        sx={{
                                          mr: 1,
                                          color: theme.palette.error.main,
                                        }}
                                      />
                                    )}
                                    <Typography
                                      variant="body1"
                                      fontWeight="500"
                                    >
                                      {key
                                        .replace(/([A-Z])/g, " $1")
                                        .replace(/^./, function (str) {
                                          return str.toUpperCase();
                                        })}
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    paragraph
                                  >
                                    {value.description ||
                                      `Status: ${
                                        value.enabled ? "Enabled" : "Disabled"
                                      }`}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Chip
                                      label={
                                        value.enabled ? "Enabled" : "Disabled"
                                      }
                                      size="small"
                                      color={
                                        value.enabled ? "success" : "error"
                                      }
                                    />
                                    {value.findingsCount !== undefined && (
                                      <Typography variant="body2">
                                        Findings: {value.findingsCount}
                                      </Typography>
                                    )}
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          )
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Compliance Status */}
              {statusData.complianceStatus && (
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title="Compliance Status" />
                    <Divider />
                    <CardContent>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Standard</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Passing Controls</TableCell>
                              <TableCell>Total Controls</TableCell>
                              <TableCell>Last Assessed</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {statusData.complianceStatus.map(
                              (compliance: any) => (
                                <TableRow key={compliance.standard} hover>
                                  <TableCell>{compliance.standard}</TableCell>
                                  <TableCell>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      {getStateIcon(compliance.status)}
                                      <Typography
                                        variant="body2"
                                        sx={{ ml: 1 }}
                                      >
                                        {compliance.status}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    {compliance.passingControls}
                                  </TableCell>
                                  <TableCell>
                                    {compliance.totalControls}
                                  </TableCell>
                                  <TableCell>
                                    {compliance.lastAssessedTime
                                      ? new Date(
                                          compliance.lastAssessedTime
                                        ).toLocaleString()
                                      : "Never"}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default SecurityCommandCenter;
