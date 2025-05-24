/**
 * EC2 Security Scanner Component
 *
 * Scans EC2 instances for security issues and vulnerabilities
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
  Collapse,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlayArrow as PlayArrowIcon,
  Computer as ComputerIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
} from "@mui/icons-material";

// Mock data - replace with actual API calls in production
const mockEC2Instances = [
  {
    id: "i-1234567890abcdef0",
    name: "web-server-1",
    instanceType: "t3.medium",
    az: "us-east-1a",
    state: "running",
    launchTime: "2025-01-15T10:00:00Z",
    publicIp: "18.234.123.45",
    privateIp: "10.0.1.10",
    securityGroups: [
      { id: "sg-12345", name: "web-server-sg" },
      { id: "sg-67890", name: "common-services-sg" },
    ],
    vulnerabilities: {
      critical: 2,
      high: 3,
      medium: 5,
      low: 8,
    },
    patchCompliance: {
      status: "non-compliant",
      missingCriticalPatches: 3,
      missingSecurityPatches: 8,
      lastPatched: "2025-02-10T09:15:00Z",
    },
    findings: [
      {
        id: "finding-ec2-001",
        title: "Outdated kernel version",
        severity: "critical",
        description:
          "The EC2 instance is running kernel version 5.10 which has known vulnerabilities",
        remediation:
          "Update to the latest kernel version by running system updates",
      },
      {
        id: "finding-ec2-002",
        title: "Unrestricted inbound access (port 22)",
        severity: "high",
        description:
          "Security group allows unrestricted inbound access on port 22 (SSH)",
        remediation:
          "Restrict SSH access to specific IP addresses or CIDR ranges",
      },
      {
        id: "finding-ec2-003",
        title: "Public IP exposure",
        severity: "medium",
        description:
          "Instance has a public IP address and is directly accessible from the internet",
        remediation:
          "Use an application load balancer or NAT gateway to limit direct internet exposure",
      },
    ],
  },
  {
    id: "i-0987654321fedcba0",
    name: "app-server-1",
    instanceType: "m5.large",
    az: "us-east-1b",
    state: "running",
    launchTime: "2025-01-20T14:30:00Z",
    publicIp: null,
    privateIp: "10.0.2.20",
    securityGroups: [
      { id: "sg-54321", name: "app-server-sg" },
      { id: "sg-67890", name: "common-services-sg" },
    ],
    vulnerabilities: {
      critical: 0,
      high: 1,
      medium: 3,
      low: 5,
    },
    patchCompliance: {
      status: "compliant",
      missingCriticalPatches: 0,
      missingSecurityPatches: 0,
      lastPatched: "2025-04-01T15:20:00Z",
    },
    findings: [
      {
        id: "finding-ec2-004",
        title: "Weak TLS configuration",
        severity: "high",
        description:
          "Application is configured to use TLS 1.0 which has known vulnerabilities",
        remediation: "Configure the application to use TLS 1.2 or higher",
      },
      {
        id: "finding-ec2-005",
        title: "Excessive IAM permissions",
        severity: "medium",
        description: "Instance profile has overly permissive IAM permissions",
        remediation: "Apply least privilege principle to the instance IAM role",
      },
    ],
  },
];

const mockEKSClusters = [
  {
    id: "cluster-1",
    name: "production-eks",
    version: "1.26",
    status: "active",
    endpoint: "https://123456789ABCDEF.gr7.us-east-1.eks.amazonaws.com",
    createdAt: "2024-12-10T08:00:00Z",
    nodeGroups: [
      {
        id: "ng-1",
        name: "prod-worker-nodes",
        instanceType: "m5.xlarge",
        desiredCapacity: 3,
        minSize: 2,
        maxSize: 5,
      },
    ],
    vulnerabilities: {
      critical: 1,
      high: 2,
      medium: 4,
      low: 3,
    },
    securityFindings: [
      {
        id: "finding-eks-001",
        title: "Kubernetes version outdated",
        severity: "high",
        description:
          "EKS cluster is running Kubernetes 1.26 which will soon reach end of support",
        remediation: "Upgrade the EKS cluster to Kubernetes 1.28 or later",
      },
      {
        id: "finding-eks-002",
        title: "Public endpoint exposure",
        severity: "medium",
        description: "Kubernetes API server endpoint is publicly accessible",
        remediation:
          "Enable private access for the EKS cluster and disable public access",
      },
      {
        id: "finding-eks-003",
        title: "Missing network policy",
        severity: "medium",
        description:
          "No network policies defined to restrict pod-to-pod communication",
        remediation:
          "Implement Kubernetes network policies to restrict communication between pods",
      },
    ],
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
      id={`compute-security-tabpanel-${index}`}
      aria-labelledby={`compute-security-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
function a11yProps(index: number) {
  return {
    id: `compute-security-tab-${index}`,
    "aria-controls": `compute-security-tabpanel-${index}`,
  };
}

// Props interface
interface EC2SecurityScannerProps {
  accountId: string;
}

/**
 * EC2 Security Scanner component for scanning EC2 instances and EKS clusters
 */
const EC2SecurityScanner: React.FC<EC2SecurityScannerProps> = ({
  accountId,
}) => {
  const theme = useTheme();

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for EC2 instances
  const [ec2Instances, setEC2Instances] = useState<any[]>([]);
  const [isEC2Loading, setIsEC2Loading] = useState(true);
  const [ec2Error, setEC2Error] = useState<string | null>(null);

  // State for EKS clusters
  const [eksClusters, setEKSClusters] = useState<any[]>([]);
  const [isEKSLoading, setIsEKSLoading] = useState(true);
  const [eksError, setEKSError] = useState<string | null>(null);

  // State for expanded rows
  const [expandedEC2Rows, setExpandedEC2Rows] = useState<string[]>([]);
  const [expandedEKSRows, setExpandedEKSRows] = useState<string[]>([]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Toggle row expansion for EC2
  const toggleEC2RowExpand = (instanceId: string) => {
    setExpandedEC2Rows((prev) =>
      prev.includes(instanceId)
        ? prev.filter((id) => id !== instanceId)
        : [...prev, instanceId]
    );
  };

  // Toggle row expansion for EKS
  const toggleEKSRowExpand = (clusterId: string) => {
    setExpandedEKSRows((prev) =>
      prev.includes(clusterId)
        ? prev.filter((id) => id !== clusterId)
        : [...prev, clusterId]
    );
  };

  // Load EC2 and EKS data
  useEffect(() => {
    // Simulate API calls
    const loadData = async () => {
      try {
        // Set loading states
        setIsEC2Loading(true);
        setIsEKSLoading(true);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Set data
        setEC2Instances(mockEC2Instances);
        setEKSClusters(mockEKSClusters);

        // Clear any errors
        setEC2Error(null);
        setEKSError(null);
      } catch (error) {
        setEC2Error("Failed to load EC2 instances");
        setEKSError("Failed to load EKS clusters");
      } finally {
        setIsEC2Loading(false);
        setIsEKSLoading(false);
      }
    };

    loadData();
  }, [accountId]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
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
      severity === "critical"
        ? "error"
        : severity === "high"
        ? "error"
        : severity === "medium"
        ? "warning"
        : severity === "low"
        ? "info"
        : "default";

    return (
      <Chip
        label={severity.toUpperCase()}
        size="small"
        color={color}
        sx={{
          fontWeight:
            severity === "critical" || severity === "high" ? "bold" : "normal",
        }}
      />
    );
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
            <ComputerIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="h6">EC2 & EKS Security Scanner</Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            size="small"
            onClick={() => {
              setIsEC2Loading(true);
              setIsEKSLoading(true);
              // Simulate refresh with delay
              setTimeout(() => {
                setIsEC2Loading(false);
                setIsEKSLoading(false);
              }, 1000);
            }}
          >
            Refresh
          </Button>
        </Box>

        <Typography variant="body2" color="textSecondary" paragraph>
          Scan EC2 instances and EKS clusters for security vulnerabilities,
          misconfigurations, and compliance issues.
        </Typography>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="compute security tabs"
        >
          <Tab
            icon={<ComputerIcon />}
            label="EC2 Instances"
            {...a11yProps(0)}
          />
          <Tab icon={<CloudIcon />} label="EKS Clusters" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {isEC2Loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : ec2Error ? (
          <Alert severity="error">{ec2Error}</Alert>
        ) : ec2Instances.length === 0 ? (
          <Alert severity="info">No EC2 instances found in this account.</Alert>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={() => {
                  // Implement scan functionality
                  alert("Scanning EC2 instances...");
                }}
              >
                Run Security Scan
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table aria-label="ec2 instances table">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Instance ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Critical Issues</TableCell>
                    <TableCell>High Issues</TableCell>
                    <TableCell>Patch Status</TableCell>
                    <TableCell>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ec2Instances.map((instance) => (
                    <React.Fragment key={instance.id}>
                      <TableRow
                        sx={{
                          "& > *": { borderBottom: "unset" },
                          bgcolor: expandedEC2Rows.includes(instance.id)
                            ? alpha(theme.palette.primary.light, 0.1)
                            : "inherit",
                        }}
                      >
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => toggleEC2RowExpand(instance.id)}
                          >
                            {expandedEC2Rows.includes(instance.id) ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {instance.id}
                        </TableCell>
                        <TableCell>{instance.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={instance.state}
                            color={
                              instance.state === "running"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{instance.instanceType}</TableCell>
                        <TableCell>
                          {instance.vulnerabilities.critical > 0 ? (
                            <Chip
                              label={instance.vulnerabilities.critical}
                              color="error"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="0"
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {instance.vulnerabilities.high > 0 ? (
                            <Chip
                              label={instance.vulnerabilities.high}
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              label="0"
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={instance.patchCompliance.status}
                            color={
                              instance.patchCompliance.status === "compliant"
                                ? "success"
                                : "warning"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {instance.publicIp ? (
                            <Tooltip title="Public IP (Internet accessible)">
                              <Chip
                                label={instance.publicIp}
                                color="warning"
                                size="small"
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Private IP only (Not internet accessible)">
                              <Chip
                                label={instance.privateIp}
                                color="default"
                                size="small"
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={9}
                        >
                          <Collapse
                            in={expandedEC2Rows.includes(instance.id)}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ margin: 2 }}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                              >
                                Security Findings
                              </Typography>
                              <Table size="small" aria-label="findings">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Severity</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Remediation</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {instance.findings.map((finding: any) => (
                                    <TableRow key={finding.id}>
                                      <TableCell>
                                        {renderSeverityChip(finding.severity)}
                                      </TableCell>
                                      <TableCell>{finding.title}</TableCell>
                                      <TableCell>
                                        {finding.description}
                                      </TableCell>
                                      <TableCell>
                                        {finding.remediation}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>

                              <Box sx={{ mt: 3 }}>
                                <Typography
                                  variant="h6"
                                  gutterBottom
                                  component="div"
                                >
                                  Instance Details
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="subtitle2">
                                      Launch Time
                                    </Typography>
                                    <Typography variant="body2">
                                      {formatDate(instance.launchTime)}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="subtitle2">
                                      Availability Zone
                                    </Typography>
                                    <Typography variant="body2">
                                      {instance.az}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6} md={4}>
                                    <Typography variant="subtitle2">
                                      Last Patched
                                    </Typography>
                                    <Typography variant="body2">
                                      {formatDate(
                                        instance.patchCompliance.lastPatched
                                      )}
                                    </Typography>
                                  </Grid>
                                </Grid>

                                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                                  Security Groups
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                  }}
                                >
                                  {instance.securityGroups.map((sg: any) => (
                                    <Chip
                                      key={sg.id}
                                      label={`${sg.name} (${sg.id})`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {isEKSLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : eksError ? (
          <Alert severity="error">{eksError}</Alert>
        ) : eksClusters.length === 0 ? (
          <Alert severity="info">No EKS clusters found in this account.</Alert>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={() => {
                  // Implement scan functionality
                  alert("Scanning EKS clusters...");
                }}
              >
                Run Security Scan
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table aria-label="eks clusters table">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Cluster Name</TableCell>
                    <TableCell>K8s Version</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Critical Issues</TableCell>
                    <TableCell>High Issues</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eksClusters.map((cluster) => (
                    <React.Fragment key={cluster.id}>
                      <TableRow
                        sx={{
                          "& > *": { borderBottom: "unset" },
                          bgcolor: expandedEKSRows.includes(cluster.id)
                            ? alpha(theme.palette.primary.light, 0.1)
                            : "inherit",
                        }}
                      >
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => toggleEKSRowExpand(cluster.id)}
                          >
                            {expandedEKSRows.includes(cluster.id) ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          {cluster.name}
                        </TableCell>
                        <TableCell>{cluster.version}</TableCell>
                        <TableCell>
                          <Chip
                            label={cluster.status}
                            color={
                              cluster.status === "active"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {cluster.vulnerabilities.critical > 0 ? (
                            <Chip
                              label={cluster.vulnerabilities.critical}
                              color="error"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="0"
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {cluster.vulnerabilities.high > 0 ? (
                            <Chip
                              label={cluster.vulnerabilities.high}
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              label="0"
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>{formatDate(cluster.createdAt)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={7}
                        >
                          <Collapse
                            in={expandedEKSRows.includes(cluster.id)}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ margin: 2 }}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                              >
                                Security Findings
                              </Typography>
                              <Table size="small" aria-label="findings">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Severity</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Remediation</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {cluster.securityFindings.map(
                                    (finding: any) => (
                                      <TableRow key={finding.id}>
                                        <TableCell>
                                          {renderSeverityChip(finding.severity)}
                                        </TableCell>
                                        <TableCell>{finding.title}</TableCell>
                                        <TableCell>
                                          {finding.description}
                                        </TableCell>
                                        <TableCell>
                                          {finding.remediation}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>

                              <Box sx={{ mt: 3 }}>
                                <Typography
                                  variant="h6"
                                  gutterBottom
                                  component="div"
                                >
                                  Cluster Details
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2">
                                      Endpoint
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ wordBreak: "break-all" }}
                                    >
                                      {cluster.endpoint}
                                    </Typography>
                                  </Grid>
                                </Grid>

                                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                                  Node Groups
                                </Typography>
                                <Table size="small" aria-label="node groups">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Name</TableCell>
                                      <TableCell>Instance Type</TableCell>
                                      <TableCell>Desired Capacity</TableCell>
                                      <TableCell>Min Size</TableCell>
                                      <TableCell>Max Size</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {cluster.nodeGroups.map((ng: any) => (
                                      <TableRow key={ng.id}>
                                        <TableCell>{ng.name}</TableCell>
                                        <TableCell>{ng.instanceType}</TableCell>
                                        <TableCell>
                                          {ng.desiredCapacity}
                                        </TableCell>
                                        <TableCell>{ng.minSize}</TableCell>
                                        <TableCell>{ng.maxSize}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </TabPanel>
    </Box>
  );
};

export default EC2SecurityScanner;
