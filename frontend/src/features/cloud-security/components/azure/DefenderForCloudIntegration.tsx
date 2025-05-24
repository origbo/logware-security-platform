/**
 * Microsoft Defender for Cloud Integration Component
 *
 * Integrates with Microsoft Defender for Cloud to display security recommendations,
 * secure score, and security alerts for Azure resources
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
} from "@mui/material";
import {
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Computer as ComputerIcon,
  Storage as StorageIcon,
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
const mockSecureScore = {
  overall: 68,
  subscriptions: [
    { id: "sub-1", name: "Production", score: 72 },
    { id: "sub-2", name: "Development", score: 65 },
    { id: "sub-3", name: "Staging", score: 61 },
  ],
  controlScores: [
    { name: "Identity and Access", score: 82, max: 100 },
    { name: "Data Protection", score: 74, max: 100 },
    { name: "Network Security", score: 67, max: 100 },
    { name: "Compute Security", score: 65, max: 100 },
    { name: "Application Security", score: 58, max: 100 },
    { name: "IoT Security", score: 53, max: 100 },
  ],
};

const mockRecommendations = [
  {
    id: "rec-1",
    title: "Enable MFA for accounts with write permissions",
    severity: "high",
    status: "unhealthy",
    resourceType: "Microsoft.AAD/tenants",
    resourceCount: 1,
    description:
      "Enable multi-factor authentication for all accounts with write permissions to reduce the risk of credential compromise",
    remediation:
      "Configure MFA for all user accounts with write permissions in Azure Active Directory",
    category: "Identity and Access",
  },
  {
    id: "rec-2",
    title: "Storage accounts should restrict network access",
    severity: "medium",
    status: "unhealthy",
    resourceType: "Microsoft.Storage/storageAccounts",
    resourceCount: 5,
    description:
      "Storage accounts should have network access restricted to reduce the attack surface",
    remediation:
      "Configure network rules for your storage accounts to only allow access from specific networks",
    category: "Data Protection",
  },
  {
    id: "rec-3",
    title: "Web Application Firewall should be enabled for App Service",
    severity: "high",
    status: "unhealthy",
    resourceType: "Microsoft.Web/sites",
    resourceCount: 3,
    description:
      "Enable Web Application Firewall (WAF) for App Service to protect web applications from common exploits and vulnerabilities",
    remediation:
      "Configure Azure Application Gateway with WAF and place it in front of your App Service",
    category: "Application Security",
  },
  {
    id: "rec-4",
    title: "SQL Server Auditing should be enabled",
    severity: "medium",
    status: "unhealthy",
    resourceType: "Microsoft.Sql/servers",
    resourceCount: 2,
    description:
      "Enable SQL server auditing to track database activities and identify suspicious activities",
    remediation:
      "Configure auditing settings for your SQL servers in the Azure portal",
    category: "Data Protection",
  },
  {
    id: "rec-5",
    title: "Just-In-Time VM access should be applied on virtual machines",
    severity: "medium",
    status: "healthy",
    resourceType: "Microsoft.Compute/virtualMachines",
    resourceCount: 8,
    description:
      "Just-In-Time VM access should be applied on virtual machines to reduce exposure to brute force attacks",
    remediation:
      "Enable Just-In-Time VM access through Microsoft Defender for Cloud",
    category: "Compute Security",
  },
];

const mockAlerts = [
  {
    id: "alert-1",
    title: "Suspicious authentication activity detected",
    severity: "high",
    status: "new",
    resourceType: "Microsoft.AAD/users",
    resourceName: "john.smith@example.com",
    description:
      "Multiple failed login attempts detected from unusual locations",
    detectedTime: "2025-04-15T09:30:00Z",
    category: "Identity and Access",
  },
  {
    id: "alert-2",
    title: "Suspicious network communication to known malicious IP",
    severity: "high",
    status: "in progress",
    resourceType: "Microsoft.Compute/virtualMachines",
    resourceName: "vm-web-prod-01",
    description:
      "Virtual machine communicating with known malicious IP address",
    detectedTime: "2025-04-18T14:20:00Z",
    category: "Network Security",
  },
  {
    id: "alert-3",
    title: "Storage account access from unusual location",
    severity: "medium",
    status: "new",
    resourceType: "Microsoft.Storage/storageAccounts",
    resourceName: "proddata01",
    description: "Access to storage account from unusual geographic location",
    detectedTime: "2025-04-19T11:45:00Z",
    category: "Data Protection",
  },
  {
    id: "alert-4",
    title: "Potential SQL injection attempt",
    severity: "critical",
    status: "new",
    resourceType: "Microsoft.Sql/servers",
    resourceName: "sql-prod-01",
    description:
      "Potential SQL injection attempts detected in SQL server queries",
    detectedTime: "2025-04-20T08:15:00Z",
    category: "Application Security",
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
      id={`defender-tabpanel-${index}`}
      aria-labelledby={`defender-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
function a11yProps(index: number) {
  return {
    id: `defender-tab-${index}`,
    "aria-controls": `defender-tabpanel-${index}`,
  };
}

// Props interface
interface DefenderForCloudIntegrationProps {
  tenantId: string;
}

/**
 * Microsoft Defender for Cloud Integration Component
 */
const DefenderForCloudIntegration: React.FC<
  DefenderForCloudIntegrationProps
> = ({ tenantId }) => {
  const theme = useTheme();

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for data
  const [secureScore, setSecureScore] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Defender for Cloud data
  useEffect(() => {
    // Simulate API calls
    const loadData = async () => {
      try {
        // Set loading state
        setIsLoading(true);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Set data
        setSecureScore(mockSecureScore);
        setRecommendations(mockRecommendations);
        setAlerts(mockAlerts);

        // Clear any errors
        setError(null);
      } catch (error) {
        setError("Failed to load Defender for Cloud data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [tenantId]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  // Render status chip
  const renderStatusChip = (status: string) => {
    const color =
      status === "healthy"
        ? "success"
        : status === "unhealthy"
        ? "error"
        : status === "in progress"
        ? "warning"
        : status === "new"
        ? "info"
        : "default";

    return <Chip label={status.toUpperCase()} size="small" color={color} />;
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Prepare data for charts
  const prepareSecureScoreData = () => {
    if (!secureScore) return [];

    return [
      { name: "Secure", value: secureScore.overall },
      { name: "Gap", value: 100 - secureScore.overall },
    ];
  };

  const COLORS = [theme.palette.primary.main, theme.palette.grey[300]];

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
            <Typography variant="h6">Microsoft Defender for Cloud</Typography>
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
          Monitor your security posture, follow security recommendations, and
          detect threats across your Azure resources.
        </Typography>
      </Paper>

      {/* Secure Score Overview */}
      {!isLoading && secureScore && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <BarChartIcon
                    sx={{ color: theme.palette.primary.main, mr: 1 }}
                  />
                  <Typography variant="h6">Secure Score</Typography>
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
                        data={prepareSecureScoreData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={0}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {prepareSecureScoreData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <Box sx={{ position: "absolute", textAlign: "center" }}>
                    <Typography
                      variant="h3"
                      sx={{ color: getScoreColor(secureScore.overall) }}
                    >
                      {secureScore.overall}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      of 100
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
                  Overall Secure Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AssessmentIcon
                    sx={{ color: theme.palette.primary.main, mr: 1 }}
                  />
                  <Typography variant="h6">Control Scores</Typography>
                </Box>

                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={secureScore.controlScores}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={120} />
                      <RechartsTooltip
                        formatter={(value: any) => [`${value}%`, "Score"]}
                      />
                      <Bar
                        dataKey="score"
                        fill={theme.palette.primary.main}
                        name="Score"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
          aria-label="defender for cloud tabs"
        >
          <Tab
            icon={<WarningIcon />}
            label="Recommendations"
            {...a11yProps(0)}
          />
          <Tab
            icon={<NotificationsIcon />}
            label={`Alerts (${alerts.length})`}
            {...a11yProps(1)}
          />
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
            <TableContainer component={Paper}>
              <Table aria-label="security recommendations table">
                <TableHead>
                  <TableRow>
                    <TableCell>Recommendation</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Resource Type</TableCell>
                    <TableCell>Resources</TableCell>
                    <TableCell>Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recommendations.map((recommendation) => (
                    <TableRow key={recommendation.id}>
                      <TableCell>
                        <Tooltip title={recommendation.description}>
                          <Typography variant="body2">
                            {recommendation.title}
                          </Typography>
                        </Tooltip>
                        <Typography variant="caption" color="textSecondary">
                          {recommendation.remediation}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {renderSeverityChip(recommendation.severity)}
                      </TableCell>
                      <TableCell>
                        {renderStatusChip(recommendation.status)}
                      </TableCell>
                      <TableCell>
                        {recommendation.resourceType.split("/").pop()}
                      </TableCell>
                      <TableCell>{recommendation.resourceCount}</TableCell>
                      <TableCell>{recommendation.category}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <List>
              {alerts.map((alert) => (
                <Paper key={alert.id} sx={{ mb: 2, overflow: "hidden" }}>
                  <Box
                    sx={{
                      borderLeft: 6,
                      borderColor:
                        alert.severity === "critical"
                          ? "error.main"
                          : alert.severity === "high"
                          ? "error.main"
                          : alert.severity === "medium"
                          ? "warning.main"
                          : "info.main",
                      p: 2,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={7}>
                        <Typography variant="subtitle1">
                          {alert.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          paragraph
                        >
                          {alert.description}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          {renderSeverityChip(alert.severity)}
                          {renderStatusChip(alert.status)}
                          <Chip
                            label={alert.category}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Resource
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            {alert.resourceName} (
                            {alert.resourceType.split("/").pop()})
                          </Typography>

                          <Typography variant="caption" color="textSecondary">
                            Detected
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(alert.detectedTime)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Button size="small" variant="outlined">
                            Investigate
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              ))}
            </List>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default DefenderForCloudIntegration;
