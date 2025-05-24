import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  useTheme,
  Chip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Api as ApiIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import {
  ComplianceFramework,
  ComplianceAudit,
} from "../../pages/compliance/CompliancePage";
import { handleComplianceApiRequest } from "../../services/api/complianceApiMiddleware";
import { complianceApiEndpoints } from "../../services/integrations/complianceApiService";

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
      id={`compliance-api-tabpanel-${index}`}
      aria-labelledby={`compliance-api-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Interface for the component props
interface ComplianceApiDashboardProps {
  frameworks: ComplianceFramework[];
  audits: ComplianceAudit[];
  assessmentHistory?: any[];
}

const ComplianceApiDashboard: React.FC<ComplianceApiDashboardProps> = ({
  frameworks,
  audits,
  assessmentHistory = [],
}) => {
  const theme = useTheme();

  // State variables
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<any>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>(
    "/api/v1/compliance/statistics"
  );
  const [requestParams, setRequestParams] = useState<{
    method: string;
    headers: Record<string, string>;
    queryParams: Record<string, string>;
  }>({
    method: "GET",
    headers: {
      authorization: "Bearer mock-api-token-for-demo-purposes",
      "content-type": "application/json",
    },
    queryParams: {},
  });

  // Tab handling
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Fetch data from API
  const fetchApiData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the API middleware to handle the request
      const response = await handleComplianceApiRequest(
        selectedEndpoint,
        requestParams.method,
        requestParams.headers,
        requestParams.queryParams,
        null, // No body for GET requests
        frameworks,
        audits,
        assessmentHistory
      );

      setApiData(response);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching API data:", err);
      setError("Failed to fetch API data. Please try again.");
      setLoading(false);
    }
  };

  // Effect to fetch data on endpoint change
  useEffect(() => {
    fetchApiData();
  }, [selectedEndpoint, frameworks, audits, assessmentHistory]);

  // Handle endpoint selection
  const handleEndpointSelect = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    // Reset query params based on endpoint
    let defaultParams: Record<string, string> = {};

    if (endpoint.includes("/frameworks") && !endpoint.includes("controls")) {
      defaultParams = { page: "1", pageSize: "10" };
    } else if (endpoint.includes("/controls")) {
      defaultParams = { page: "1", pageSize: "20" };
    }

    setRequestParams({
      ...requestParams,
      queryParams: defaultParams,
    });
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchApiData();
  };

  // Handle param change
  const handleParamChange = (key: string, value: string) => {
    setRequestParams({
      ...requestParams,
      queryParams: {
        ...requestParams.queryParams,
        [key]: value,
      },
    });
  };

  // Render JSON in a pretty format
  const renderJson = (data: any) => {
    return (
      <pre
        style={{
          backgroundColor: theme.palette.grey[100],
          padding: theme.spacing(2),
          borderRadius: theme.shape.borderRadius,
          overflow: "auto",
          maxHeight: "500px",
          fontSize: "0.9rem",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  // Render endpoints list
  const renderEndpointsList = () => {
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Endpoint</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {complianceApiEndpoints.map((endpoint, index) => (
              <TableRow
                key={index}
                selected={selectedEndpoint === endpoint.path}
              >
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {endpoint.path}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={endpoint.method}
                    size="small"
                    color={endpoint.method === "GET" ? "primary" : "secondary"}
                  />
                </TableCell>
                <TableCell>{endpoint.description}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant={
                      selectedEndpoint === endpoint.path
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => handleEndpointSelect(endpoint.path)}
                  >
                    Try It
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render parameters form
  const renderParamsForm = () => {
    // Find the selected endpoint
    const endpoint = complianceApiEndpoints.find(
      (e) => e.path === selectedEndpoint
    );

    if (!endpoint) return null;

    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="API Request Parameters"
          subheader={`${endpoint.method} ${endpoint.path}`}
        />
        <CardContent>
          <Grid container spacing={2}>
            {endpoint.parameters.map((param, index) => {
              // Only show query parameters
              if (param.type !== "query") return null;

              return (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {param.name}
                      {param.required ? " *" : ""}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="text"
                        value={requestParams.queryParams[param.name] || ""}
                        onChange={(e) =>
                          handleParamChange(param.name, e.target.value)
                        }
                        style={{
                          padding: "8px",
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: "4px",
                          width: "100%",
                        }}
                        placeholder={param.description}
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {param.description}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              {loading ? "Loading..." : "Send Request"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Render API response
  const renderApiResponse = () => {
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      );
    }

    if (!apiData) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          Select an endpoint and click "Send Request" to see the response.
        </Alert>
      );
    }

    return (
      <Card>
        <CardHeader
          title="API Response"
          subheader={`Status: ${apiData.success ? "Success" : "Error"}`}
          action={
            <Chip
              label={apiData.success ? "Success" : "Error"}
              color={apiData.success ? "success" : "error"}
            />
          }
        />
        <Divider />
        <CardContent>{renderJson(apiData)}</CardContent>
      </Card>
    );
  };

  // Render a simple visualization based on the API response
  const renderVisualization = () => {
    if (!apiData || !apiData.success) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          No data available for visualization. Make a successful API request
          first.
        </Alert>
      );
    }

    // Different visualizations based on the endpoint
    if (selectedEndpoint === "/api/v1/compliance/statistics") {
      const stats = apiData.data;

      return (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Box
                  sx={{ position: "relative", display: "inline-flex", mb: 2 }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={stats.overallScore}
                    size={80}
                    thickness={5}
                    sx={{
                      color:
                        stats.overallScore >= 80
                          ? theme.palette.success.main
                          : stats.overallScore >= 60
                          ? theme.palette.warning.main
                          : theme.palette.error.main,
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h5" component="div">
                      {stats.overallScore}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h6">Overall Score</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>
                  <SecurityIcon
                    sx={{ fontSize: 54, color: theme.palette.primary.main }}
                  />
                </Box>
                <Typography variant="h3">{stats.frameworkCount}</Typography>
                <Typography variant="h6">Frameworks</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>
                  <AssessmentIcon
                    sx={{ fontSize: 54, color: theme.palette.secondary.main }}
                  />
                </Box>
                <Typography variant="h3">
                  {stats.controlsCount.total}
                </Typography>
                <Typography variant="h6">Controls</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Box sx={{ mb: 2 }}>
                  <DescriptionIcon
                    sx={{ fontSize: 54, color: theme.palette.error.main }}
                  />
                </Box>
                <Typography variant="h3">{stats.criticalIssues}</Typography>
                <Typography variant="h6">Critical Issues</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader title="Controls by Status" />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Chip
                            label="Compliant"
                            size="small"
                            sx={{
                              backgroundColor: theme.palette.success.light,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {stats.controlsCount.compliant}
                        </TableCell>
                        <TableCell align="right">
                          {Math.round(
                            (stats.controlsCount.compliant /
                              stats.controlsCount.total) *
                              100
                          )}
                          %
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Chip
                            label="Partially Compliant"
                            size="small"
                            sx={{
                              backgroundColor: theme.palette.warning.light,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {stats.controlsCount.partiallyCompliant}
                        </TableCell>
                        <TableCell align="right">
                          {Math.round(
                            (stats.controlsCount.partiallyCompliant /
                              stats.controlsCount.total) *
                              100
                          )}
                          %
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Chip
                            label="Non-Compliant"
                            size="small"
                            sx={{ backgroundColor: theme.palette.error.light }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {stats.controlsCount.nonCompliant}
                        </TableCell>
                        <TableCell align="right">
                          {Math.round(
                            (stats.controlsCount.nonCompliant /
                              stats.controlsCount.total) *
                              100
                          )}
                          %
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader title="Framework Scores" />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Framework</TableCell>
                        <TableCell align="right">Score</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.frameworkScores.map((framework: any) => (
                        <TableRow key={framework.id}>
                          <TableCell>{framework.name}</TableCell>
                          <TableCell align="right">
                            {framework.score}%
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                framework.score >= 80
                                  ? "Good"
                                  : framework.score >= 60
                                  ? "Needs Improvement"
                                  : "Critical"
                              }
                              size="small"
                              color={
                                framework.score >= 80
                                  ? "success"
                                  : framework.score >= 60
                                  ? "warning"
                                  : "error"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    } else if (
      selectedEndpoint.includes("/frameworks") &&
      !selectedEndpoint.includes("controls")
    ) {
      // Frameworks listing visualization
      return (
        <Grid container spacing={3}>
          {apiData.data.map((framework: any) => (
            <Grid item xs={12} md={6} lg={4} key={framework.id}>
              <Card>
                <CardHeader
                  title={framework.name}
                  subheader={`Version ${framework.version}`}
                  action={
                    <Chip
                      label={`${framework.score}%`}
                      color={
                        framework.score >= 80
                          ? "success"
                          : framework.score >= 60
                          ? "warning"
                          : "error"
                      }
                    />
                  }
                />
                <CardContent>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {framework.description || "No description available"}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2">Status</Typography>
                    <Typography variant="body2">{framework.status}</Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2">Total Controls</Typography>
                    <Typography variant="body2">
                      {framework.controlCount.total}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2">
                      Compliant Controls
                    </Typography>
                    <Typography variant="body2">
                      {framework.controlCount.compliant}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2">
                      Non-Compliant Controls
                    </Typography>
                    <Typography variant="body2">
                      {framework.controlCount.nonCompliant}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2">Last Updated</Typography>
                    <Typography variant="body2">
                      {new Date(framework.lastUpdated).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {apiData.pagination && (
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  bgcolor: theme.palette.background.paper,
                }}
              >
                <Box>
                  <Typography variant="body2">
                    Showing {apiData.data.length} of{" "}
                    {apiData.pagination.totalItems} frameworks
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    disabled={apiData.pagination.page <= 1}
                    onClick={() =>
                      handleParamChange(
                        "page",
                        (
                          Number(requestParams.queryParams.page || 1) - 1
                        ).toString()
                      )
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    size="small"
                    disabled={
                      apiData.pagination.page >= apiData.pagination.totalPages
                    }
                    onClick={() =>
                      handleParamChange(
                        "page",
                        (
                          Number(requestParams.queryParams.page || 1) + 1
                        ).toString()
                      )
                    }
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      );
    } else {
      // Generic visualization
      return renderJson(apiData);
    }
  };

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="API Dashboard"
              icon={<ApiIcon />}
              iconPosition="start"
              id="compliance-api-tab-0"
            />
            <Tab
              label="API Explorer"
              icon={<CodeIcon />}
              iconPosition="start"
              id="compliance-api-tab-1"
            />
            <Tab
              label="API Visualization"
              icon={<BarChartIcon />}
              iconPosition="start"
              id="compliance-api-tab-2"
            />
          </Tabs>
        </Box>

        {/* API Dashboard Tab */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h5" gutterBottom>
            Compliance API Dashboard
          </Typography>
          <Typography variant="body1" paragraph>
            This dashboard provides an overview of the compliance API endpoints
            available in the platform. Use the tabs to explore the API, send
            requests, and visualize the data.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Available Endpoints" />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Endpoint</TableCell>
                          <TableCell>Method</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {complianceApiEndpoints.map((endpoint, index) => (
                          <TableRow key={index}>
                            <TableCell>{endpoint.path}</TableCell>
                            <TableCell>{endpoint.method}</TableCell>
                            <TableCell>{endpoint.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="API Usage Information" />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Authentication
                  </Typography>
                  <Typography variant="body2" paragraph>
                    All API requests require authentication using a Bearer token
                    in the Authorization header.
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom>
                    Rate Limiting
                  </Typography>
                  <Typography variant="body2" paragraph>
                    API requests are rate limited to 100 requests per minute per
                    IP address.
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom>
                    Response Format
                  </Typography>
                  <Typography variant="body2" paragraph>
                    All API responses are in JSON format and include a success
                    flag, timestamp, and version.
                  </Typography>

                  <Typography variant="subtitle1" gutterBottom>
                    Error Handling
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Errors will include an error object with a code and message
                    explaining the issue.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* API Explorer Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              API Explorer
            </Typography>
            <Typography variant="body1" paragraph>
              Select an endpoint, set parameters, and send requests to explore
              the compliance API.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              {renderEndpointsList()}
            </Grid>

            <Grid item xs={12}>
              {renderParamsForm()}
            </Grid>

            <Grid item xs={12}>
              {renderApiResponse()}
            </Grid>
          </Grid>
        </TabPanel>

        {/* API Visualization Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              API Visualization
            </Typography>
            <Typography variant="body1" paragraph>
              Visual representation of the data from the selected API endpoint.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Selected Endpoint</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {selectedEndpoint}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleRefresh}
                          startIcon={<RefreshIcon />}
                          disabled={loading}
                        >
                          Refresh Data
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {renderVisualization()}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ComplianceApiDashboard;
