/**
 * GCP Security Command Center Dashboard
 *
 * Integrates with Google Cloud Security Command Center to display findings,
 * vulnerabilities, and security posture for GCP resources
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  alpha,
  Collapse,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  FilterList as FilterListIcon,
  SsidChart as ChartIcon,
  Cloud as CloudIcon,
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

// Mock data for the component
const mockSccOverview = {
  totalFindings: 178,
  bySeverity: [
    { severity: "CRITICAL", count: 12 },
    { severity: "HIGH", count: 23 },
    { severity: "MEDIUM", count: 65 },
    { severity: "LOW", count: 78 },
  ],
  byCategory: [
    { category: "VULNERABILITY", count: 47 },
    { category: "IAM", count: 35 },
    { category: "NETWORK_SECURITY", count: 42 },
    { category: "KUBERNETES", count: 28 },
    { category: "DATA_SECURITY", count: 26 },
  ],
  byProject: [
    { name: "production", count: 82 },
    { name: "development", count: 59 },
    { name: "staging", count: 37 },
  ],
};

const mockSccFindings = [
  {
    id: "finding-gcp-001",
    name: "Public GCS bucket found",
    category: "DATA_SECURITY",
    severity: "CRITICAL",
    state: "ACTIVE",
    createTime: "2025-03-15T10:22:34Z",
    project: "production",
    resourceName: "projects/production/buckets/prod-customer-data",
    resourceType: "google.cloud.storage.Bucket",
    description:
      "Storage bucket is publicly accessible and may expose sensitive data",
    recommendation:
      "Remove public access to the bucket by modifying IAM permissions",
  },
  {
    id: "finding-gcp-002",
    name: "SQL database instance has public IP",
    category: "NETWORK_SECURITY",
    severity: "HIGH",
    state: "ACTIVE",
    createTime: "2025-03-20T14:15:22Z",
    project: "production",
    resourceName: "projects/production/instances/prod-db-1",
    resourceType: "google.cloud.sql.Instance",
    description:
      "SQL database instance is exposed to the internet through a public IP address",
    recommendation:
      "Configure the SQL instance to use private IP addresses only and use Cloud SQL Proxy or VPC peering for access",
  },
  {
    id: "finding-gcp-003",
    name: "Weak firewall rules detected",
    category: "NETWORK_SECURITY",
    severity: "HIGH",
    state: "ACTIVE",
    createTime: "2025-03-22T09:32:10Z",
    project: "development",
    resourceName: "projects/development/global/firewalls/allow-all-ssh",
    resourceType: "google.compute.Firewall",
    description:
      "Firewall rule allows SSH access (port 22) from any source (0.0.0.0/0)",
    recommendation:
      "Restrict SSH access to specific IP ranges or use Identity-Aware Proxy (IAP) for SSH access",
  },
  {
    id: "finding-gcp-004",
    name: "Service account with owner permissions",
    category: "IAM",
    severity: "CRITICAL",
    state: "ACTIVE",
    createTime: "2025-03-25T11:45:55Z",
    project: "production",
    resourceName:
      "projects/production/serviceAccounts/app-sa@production.iam.gserviceaccount.com",
    resourceType: "google.iam.ServiceAccount",
    description:
      "Service account has Owner role (roles/owner) at the project level, violating least privilege",
    recommendation:
      "Replace the Owner role with more specific roles that provide only the permissions needed",
  },
  {
    id: "finding-gcp-005",
    name: "Kubernetes pods running as root",
    category: "KUBERNETES",
    severity: "MEDIUM",
    state: "ACTIVE",
    createTime: "2025-04-01T08:20:14Z",
    project: "production",
    resourceName: "projects/production/clusters/prod-gke-cluster",
    resourceType: "google.container.Cluster",
    description:
      "Pods in the cluster are running as root, which could lead to container escape vulnerabilities",
    recommendation:
      "Modify container security context to run as non-root and add securityContext.runAsNonRoot: true to pod specifications",
  },
  {
    id: "finding-gcp-006",
    name: "BigQuery dataset publicly accessible",
    category: "DATA_SECURITY",
    severity: "HIGH",
    state: "ACTIVE",
    createTime: "2025-04-05T15:33:42Z",
    project: "development",
    resourceName: "projects/development/datasets/analytics_data",
    resourceType: "google.bigquery.Dataset",
    description:
      "BigQuery dataset is configured to allow public access to all users",
    recommendation:
      "Remove the allUsers and allAuthenticatedUsers members from dataset access controls",
  },
  {
    id: "finding-gcp-007",
    name: "Vulnerable software in container images",
    category: "VULNERABILITY",
    severity: "HIGH",
    state: "ACTIVE",
    createTime: "2025-04-07T10:12:33Z",
    project: "staging",
    resourceName: "projects/staging/images/app:latest",
    resourceType: "google.container.Image",
    description:
      "Container image contains vulnerable software packages including OpenSSL (CVE-2023-0286)",
    recommendation:
      "Update base images and rebuild containers to include the latest security patches",
  },
];

const mockVulnerabilities = [
  {
    id: "vuln-gcp-001",
    name: "CVE-2023-0286",
    severity: "CRITICAL",
    category: "VULNERABILITY",
    affectedInstances: 5,
    description: "OpenSSL vulnerability that could allow remote code execution",
    recommendation: "Update OpenSSL to version 3.0.8 or later",
    resourceTypes: ["google.container.Image", "google.compute.Instance"],
  },
  {
    id: "vuln-gcp-002",
    name: "CVE-2023-1234",
    severity: "HIGH",
    category: "VULNERABILITY",
    affectedInstances: 8,
    description:
      "Linux kernel vulnerability that could allow privilege escalation",
    recommendation:
      "Update to the latest kernel version by updating your OS images",
    resourceTypes: ["google.compute.Instance"],
  },
  {
    id: "vuln-gcp-003",
    name: "CVE-2023-5678",
    severity: "MEDIUM",
    category: "VULNERABILITY",
    affectedInstances: 12,
    description:
      "Nginx web server vulnerability that could allow information disclosure",
    recommendation: "Update Nginx to the latest version",
    resourceTypes: ["google.container.Image", "google.compute.Instance"],
  },
];

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scc-tabpanel-${index}`}
      aria-labelledby={`scc-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
function a11yProps(index: number) {
  return {
    id: `scc-tab-${index}`,
    "aria-controls": `scc-tabpanel-${index}`,
  };
}

// Props interface
interface SecurityCommandCenterDashboardProps {
  projectId: string;
}

/**
 * GCP Security Command Center Dashboard Component
 */
const SecurityCommandCenterDashboard: React.FC<
  SecurityCommandCenterDashboardProps
> = ({ projectId }) => {
  const theme = useTheme();

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for data
  const [overview, setOverview] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for expanded items
  const [expandedFindings, setExpandedFindings] = useState<string[]>([]);

  // Load Security Command Center data
  useEffect(() => {
    // Simulate API calls
    const loadData = async () => {
      try {
        // Set loading state
        setIsLoading(true);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Set data
        setOverview(mockSccOverview);
        setFindings(mockSccFindings);
        setVulnerabilities(mockVulnerabilities);

        // Clear any errors
        setError(null);
      } catch (error) {
        setError("Failed to load Security Command Center data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Toggle finding expansion
  const toggleFindingExpand = (findingId: string) => {
    setExpandedFindings((prev) =>
      prev.includes(findingId)
        ? prev.filter((id) => id !== findingId)
        : [...prev, findingId]
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render severity chip
  const renderSeverityChip = (severity: string) => {
    const color =
      severity === "CRITICAL"
        ? "error"
        : severity === "HIGH"
        ? "error"
        : severity === "MEDIUM"
        ? "warning"
        : severity === "LOW"
        ? "info"
        : "default";

    return (
      <Chip
        label={severity}
        size="small"
        color={color}
        sx={{
          fontWeight:
            severity === "CRITICAL" || severity === "HIGH" ? "bold" : "normal",
        }}
      />
    );
  };

  // Render category chip
  const renderCategoryChip = (category: string) => {
    const color =
      category === "VULNERABILITY"
        ? "error"
        : category === "IAM"
        ? "primary"
        : category === "NETWORK_SECURITY"
        ? "warning"
        : category === "KUBERNETES"
        ? "info"
        : category === "DATA_SECURITY"
        ? "success"
        : "default";

    return (
      <Chip
        label={category.replace("_", " ")}
        size="small"
        color={color}
        variant="outlined"
      />
    );
  };

  // Get color for pie chart
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "VULNERABILITY":
        return theme.palette.error.main;
      case "IAM":
        return theme.palette.primary.main;
      case "NETWORK_SECURITY":
        return theme.palette.warning.main;
      case "KUBERNETES":
        return theme.palette.info.main;
      case "DATA_SECURITY":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get color for severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return theme.palette.error.dark;
      case "HIGH":
        return theme.palette.error.main;
      case "MEDIUM":
        return theme.palette.warning.main;
      case "LOW":
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SecurityIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="h6">GCP Security Command Center</Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            size="small"
            onClick={() => {
              setIsLoading(true);
              // Simulate refresh with delay
              setTimeout(() => {
                setIsLoading(false);
              }, 1000);
            }}
          >
            Refresh
          </Button>
        </Box>

        <Typography variant="body2" color="textSecondary" paragraph>
          Monitor security findings and vulnerabilities across your Google Cloud
          resources.
        </Typography>
      </Paper>

      {/* Overview Dashboard */}
      {!isLoading && overview && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <WarningIcon
                    sx={{ color: theme.palette.warning.main, mr: 1 }}
                  />
                  <Typography variant="h6">Finding Severity</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 200,
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overview.bySeverity}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {overview.bySeverity.map((entry: any) => (
                          <Cell
                            key={`cell-${entry.severity}`}
                            fill={getSeverityColor(entry.severity)}
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <RechartsTooltip
                        formatter={(value: any, name: any, props: any) => {
                          return [`${value} findings`, props.payload.severity];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={1}>
                    {overview.bySeverity.map((item: any) => (
                      <Grid item xs={6} key={item.severity}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: getSeverityColor(item.severity),
                              mr: 1,
                            }}
                          />
                          <Typography variant="caption">
                            {item.severity}: {item.count}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <ChartIcon
                    sx={{ color: theme.palette.primary.main, mr: 1 }}
                  />
                  <Typography variant="h6">Finding Categories</Typography>
                </Box>

                <Box sx={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={overview.byCategory}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={100} />
                      <RechartsTooltip
                        formatter={(value: any, name: any, props: any) => {
                          return [
                            `${value} findings`,
                            props.payload.category.replace("_", " "),
                          ];
                        }}
                      />
                      <Bar
                        dataKey="count"
                        name="Findings"
                        radius={[0, 4, 4, 0]}
                      >
                        {overview.byCategory.map((entry: any) => (
                          <Cell
                            key={`cell-${entry.category}`}
                            fill={getCategoryColor(entry.category)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CloudIcon
                    sx={{ color: theme.palette.primary.main, mr: 1 }}
                  />
                  <Typography variant="h6">Findings by Project</Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {overview.byProject.map((project: any) => (
                    <Box key={project.name}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2">{project.name}</Typography>
                        <Typography variant="body2">
                          {project.count} findings
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          position: "relative",
                          height: 8,
                          bgcolor: "grey.200",
                          borderRadius: 4,
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            bgcolor: theme.palette.primary.main,
                            borderRadius: 4,
                            width: `${
                              (project.count / overview.totalFindings) * 100
                            }%`,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 3,
                  }}
                >
                  <Typography variant="h4">{overview.totalFindings}</Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ ml: 1 }}
                  >
                    Total Findings
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="security command center tabs"
        >
          <Tab icon={<WarningIcon />} label="Findings" {...a11yProps(0)} />
          <Tab icon={<ErrorIcon />} label="Vulnerabilities" {...a11yProps(1)} />
        </Tabs>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1">
                Showing {findings.length} findings
              </Typography>

              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                size="small"
              >
                Filter Findings
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table aria-label="security findings table">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Finding</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Resource Type</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {findings.map((finding) => (
                    <React.Fragment key={finding.id}>
                      <TableRow
                        sx={{
                          "& > *": { borderBottom: "unset" },
                          bgcolor: expandedFindings.includes(finding.id)
                            ? alpha(theme.palette.primary.light, 0.1)
                            : "inherit",
                        }}
                      >
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => toggleFindingExpand(finding.id)}
                          >
                            {expandedFindings.includes(finding.id) ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell>{finding.name}</TableCell>
                        <TableCell>
                          {renderCategoryChip(finding.category)}
                        </TableCell>
                        <TableCell>
                          {renderSeverityChip(finding.severity)}
                        </TableCell>
                        <TableCell>
                          {finding.resourceType.split(".").pop()}
                        </TableCell>
                        <TableCell>{finding.project}</TableCell>
                        <TableCell>{formatDate(finding.createTime)}</TableCell>
                      </TableRow>

                      {/* Expanded content */}
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={7}
                        >
                          <Box sx={{ margin: 1 }}>
                            <Collapse
                              in={expandedFindings.includes(finding.id)}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ my: 2, px: 2 }}>
                                <Grid container spacing={3}>
                                  <Grid item xs={12}>
                                    <Typography
                                      variant="subtitle1"
                                      gutterBottom
                                    >
                                      Description
                                    </Typography>
                                    <Typography variant="body2">
                                      {finding.description}
                                    </Typography>
                                  </Grid>

                                  <Grid item xs={12} sm={6}>
                                    <Typography
                                      variant="subtitle1"
                                      gutterBottom
                                    >
                                      Resource
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ wordBreak: "break-all" }}
                                    >
                                      {finding.resourceName}
                                    </Typography>
                                  </Grid>

                                  <Grid item xs={12} sm={6}>
                                    <Typography
                                      variant="subtitle1"
                                      gutterBottom
                                    >
                                      Recommendation
                                    </Typography>
                                    <Typography variant="body2">
                                      {finding.recommendation}
                                    </Typography>
                                  </Grid>
                                </Grid>

                                <Box
                                  sx={{
                                    mt: 2,
                                    display: "flex",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{ mr: 1 }}
                                  >
                                    Ignore Finding
                                  </Button>
                                  <Button variant="contained" size="small">
                                    View Details
                                  </Button>
                                </Box>
                              </Box>
                            </Collapse>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper}>
              <Table aria-label="vulnerabilities table">
                <TableHead>
                  <TableRow>
                    <TableCell>Vulnerability</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Affected Resources</TableCell>
                    <TableCell>Resource Types</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Recommendation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vulnerabilities.map((vuln) => (
                    <TableRow key={vuln.id}>
                      <TableCell>{vuln.name}</TableCell>
                      <TableCell>{renderSeverityChip(vuln.severity)}</TableCell>
                      <TableCell>{vuln.affectedInstances}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          {vuln.resourceTypes.map((type: string) => (
                            <Typography key={type} variant="caption">
                              {type.split(".").pop()}
                            </Typography>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{vuln.description}</TableCell>
                      <TableCell>{vuln.recommendation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default SecurityCommandCenterDashboard;
