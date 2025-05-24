/**
 * PCI-DSS Compliance Dashboard Component
 *
 * Main dashboard for tracking PCI-DSS compliance status, requirements,
 * and cardholder data environment components
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Divider,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  FilterAlt as FilterIcon,
  DeviceHub as DeviceHubIcon,
  Dashboard as DashboardIcon,
  PriorityHigh as PriorityHighIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Help as HelpIcon,
  FileDownload as DownloadIcon,
} from "@mui/icons-material";

// Import PCI-DSS types
import {
  ComplianceStatus,
  RequirementCategory,
  RiskLevel,
  PciRequirement,
  SystemComponent,
  SystemComponentType as BaseSystemComponentType,
  EnvironmentType as BaseEnvironmentType,
} from "../../types/pciDssTypes";

// Extended type definitions to include all values being used
type SystemComponentType =
  | BaseSystemComponentType
  | "SERVER"
  | "PAYMENT_TERMINAL"
  | "DATABASE"
  | "APPLICATION"
  | "NETWORK_DEVICE";
type EnvironmentType = BaseEnvironmentType | "CDE" | "CONNECTED";

// Sample data - replace with API call in production
const sampleRequirements: PciRequirement[] = [
  {
    id: "1",
    title: "Install and maintain a firewall configuration",
    description:
      "Install and maintain a firewall configuration to protect cardholder data",
    category: RequirementCategory.NETWORK_SECURITY,
    status: ComplianceStatus.COMPLIANT,
    lastAssessment: "2025-04-15T10:30:00Z",
  },
  {
    id: "2",
    title: "Do not use vendor-supplied defaults",
    description:
      "Do not use vendor-supplied defaults for system passwords and other security parameters",
    category: RequirementCategory.ACCESS_CONTROL,
    status: ComplianceStatus.PARTIALLY_COMPLIANT,
    lastAssessment: "2025-04-10T14:45:00Z",
  },
  {
    id: "3",
    title: "Protect stored cardholder data",
    description: "Protect stored cardholder data",
    category: RequirementCategory.DATA_PROTECTION,
    status: ComplianceStatus.NON_COMPLIANT,
    lastAssessment: "2025-04-12T09:15:00Z",
  },
  {
    id: "4",
    title: "Encrypt transmission of cardholder data",
    description:
      "Encrypt transmission of cardholder data across open, public networks",
    category: RequirementCategory.DATA_PROTECTION,
    status: ComplianceStatus.COMPLIANT,
    lastAssessment: "2025-04-18T11:20:00Z",
  },
  {
    id: "5",
    title: "Use and regularly update anti-virus",
    description: "Use and regularly update anti-virus software or programs",
    category: RequirementCategory.VULNERABILITY_MANAGEMENT,
    status: ComplianceStatus.COMPLIANT,
    lastAssessment: "2025-04-05T15:10:00Z",
  },
  {
    id: "6",
    title: "Develop and maintain secure systems",
    description: "Develop and maintain secure systems and applications",
    category: RequirementCategory.VULNERABILITY_MANAGEMENT,
    status: ComplianceStatus.PARTIALLY_COMPLIANT,
    lastAssessment: "2025-04-02T10:05:00Z",
  },
];

const sampleComponents: SystemComponent[] = [
  {
    id: "comp-1",
    name: "Payment Gateway Server",
    type: "SERVER",
    description: "Primary payment processing server",
    environment: "CDE",
    location: "Data Center A",
    ownerId: "user-123",
    ownerName: "John Smith",
    ipAddress: "10.0.0.12",
    function: "Payment Processing",
    securityControls: ["Firewall", "IDS", "Encryption", "Access Control"],
    inScope: true,
    lastScan: "2025-04-18T08:30:00Z",
    createdAt: "2024-10-01T09:00:00Z",
    updatedAt: "2025-04-18T08:30:00Z",
  },
  {
    id: "comp-2",
    name: "POS Terminal 101",
    type: "PAYMENT_TERMINAL",
    description: "Point-of-Sale Terminal in Main Store",
    environment: "CDE",
    location: "Main Store",
    ownerId: "user-456",
    ownerName: "Jane Doe",
    function: "Payment Acceptance",
    securityControls: ["Encryption", "Tamper Protection", "P2PE"],
    inScope: true,
    lastScan: "2025-04-15T10:15:00Z",
    createdAt: "2024-11-15T11:30:00Z",
    updatedAt: "2025-04-15T10:15:00Z",
  },
  {
    id: "comp-3",
    name: "Customer Database",
    type: "DATABASE",
    description: "Database storing customer and transaction data",
    environment: "CDE",
    location: "Cloud (AWS)",
    ownerId: "user-789",
    ownerName: "David Johnson",
    function: "Data Storage",
    securityControls: [
      "Encryption",
      "Access Control",
      "Audit Logging",
      "Backup",
    ],
    inScope: true,
    lastScan: "2025-04-10T14:20:00Z",
    createdAt: "2024-09-20T13:45:00Z",
    updatedAt: "2025-04-10T14:20:00Z",
  },
];

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pci-tabpanel-${index}`}
      aria-labelledby={`pci-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
const a11yProps = (index: number) => {
  return {
    id: `pci-tab-${index}`,
    "aria-controls": `pci-tabpanel-${index}`,
  };
};

// PCI-DSS Compliance Dashboard component
const PCIDSSComplianceDashboard: React.FC = () => {
  const theme = useTheme();

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for data
  const [requirements, setRequirements] = useState<PciRequirement[]>([]);
  const [components, setComponents] = useState<SystemComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setRequirements(sampleRequirements);
        setComponents(sampleComponents);
        setError(null);
      } catch (err) {
        setError("Failed to load PCI-DSS compliance data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate compliance statistics
  const calculateComplianceStatistics = () => {
    if (!requirements.length)
      return { compliant: 0, partial: 0, nonCompliant: 0, total: 0 };

    const compliant = requirements.filter(
      (r) => r.status === ComplianceStatus.COMPLIANT
    ).length;
    const partial = requirements.filter(
      (r) => r.status === ComplianceStatus.PARTIALLY_COMPLIANT
    ).length;
    const nonCompliant = requirements.filter(
      (r) => r.status === ComplianceStatus.NON_COMPLIANT
    ).length;

    return {
      compliant,
      partial,
      nonCompliant,
      total: requirements.length,
      compliancePercent: Math.round((compliant / requirements.length) * 100),
    };
  };

  const stats = calculateComplianceStatistics();

  // Format status chip
  const renderStatusChip = (status: ComplianceStatus) => {
    let color: "success" | "warning" | "error" | "default" = "default";
    let icon = <HelpIcon fontSize="small" />;

    switch (status) {
      case ComplianceStatus.COMPLIANT:
        color = "success";
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case ComplianceStatus.PARTIALLY_COMPLIANT:
        color = "warning";
        icon = <PriorityHighIcon fontSize="small" />;
        break;
      case ComplianceStatus.NON_COMPLIANT:
        color = "error";
        icon = <ErrorIcon fontSize="small" />;
        break;
    }

    return (
      <Chip
        label={status.replace("_", " ")}
        color={color}
        size="small"
        icon={icon}
      />
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              PCI-DSS Compliance Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monitor and manage compliance with Payment Card Industry Data
              Security Standard requirements.
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{ mr: 1 }}
            >
              Export Report
            </Button>
            <Button variant="contained" startIcon={<AssessmentIcon />}>
              Start Assessment
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Overall Compliance
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography variant="h4" component="div" sx={{ mr: 1 }}>
                      {stats?.compliancePercent || 0}%
                    </Typography>
                    {(stats?.compliancePercent || 0) > 75 ? (
                      <CheckCircleIcon color="success" />
                    ) : (stats?.compliancePercent || 0) > 50 ? (
                      <PriorityHighIcon color="warning" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats?.compliancePercent || 0}
                    sx={{ height: 8, borderRadius: 1 }}
                    color={
                      (stats?.compliancePercent || 0) > 75
                        ? "success"
                        : (stats?.compliancePercent || 0) > 50
                        ? "warning"
                        : "error"
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Requirement Status
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-around",
                      py: 1,
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="success.main">
                        {stats.compliant}
                      </Typography>
                      <Typography variant="body2">Compliant</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="warning.main">
                        {stats.partial}
                      </Typography>
                      <Typography variant="body2">Partial</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="error.main">
                        {stats.nonCompliant}
                      </Typography>
                      <Typography variant="body2">Non-Compliant</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    CDE Components
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    {components.length}
                  </Typography>
                  <Typography variant="body2">
                    {components.filter((c) => c.inScope).length} in scope
                    components tracked
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last scan:{" "}
                    {new Date(
                      components[0]?.lastScan || Date.now()
                    ).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Next Assessment
                  </Typography>
                  <Typography variant="h6" component="div">
                    June 15, 2025
                  </Typography>
                  <Typography variant="body2">25 days remaining</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" color="primary">
                      View Schedule
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="pci-dss dashboard tabs"
            >
              <Tab
                icon={<DashboardIcon />}
                label="Overview"
                {...a11yProps(0)}
              />
              <Tab
                icon={<AssessmentIcon />}
                label="Requirements"
                {...a11yProps(1)}
              />
              <Tab
                icon={<DeviceHubIcon />}
                label="CDE Mapping"
                {...a11yProps(2)}
              />
              <Tab
                icon={<PeopleIcon />}
                label="Responsibility"
                {...a11yProps(3)}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Compliance Overview
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Non-Compliant Requirements
                  </Typography>
                  {requirements
                    .filter((r) => r.status === ComplianceStatus.NON_COMPLIANT)
                    .map((req) => (
                      <Box
                        key={req.id}
                        sx={{
                          mb: 2,
                          pb: 2,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle2">
                            {req.id}. {req.title}
                          </Typography>
                          {renderStatusChip(req.status)}
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {req.description}
                        </Typography>
                      </Box>
                    ))}
                  {requirements.filter(
                    (r) => r.status === ComplianceStatus.NON_COMPLIANT
                  ).length === 0 && (
                    <Typography variant="body2" color="success.main">
                      No non-compliant requirements found.
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    height: "100%",
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Recently Updated Components
                  </Typography>
                  {components.slice(0, 3).map((comp) => (
                    <Box
                      key={comp.id}
                      sx={{
                        mb: 2,
                        pb: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2">{comp.name}</Typography>
                        <Chip
                          label={comp.environment}
                          size="small"
                          color={
                            comp.environment === "CDE" ? "error" : "default"
                          }
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        {comp.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Last updated:{" "}
                        {new Date(comp.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Compliance by Category
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.values(RequirementCategory).map((category) => {
                      const categoryReqs = requirements.filter(
                        (r) => r.category === category
                      );
                      if (categoryReqs.length === 0) return null;

                      const compliantCount = categoryReqs.filter(
                        (r) => r.status === ComplianceStatus.COMPLIANT
                      ).length;
                      const compliancePercent = Math.round(
                        (compliantCount / categoryReqs.length) * 100
                      );

                      return (
                        <Grid item xs={12} sm={6} lg={3} key={category}>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {category.replace(/_/g, " ")}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                {compliancePercent}% Compliant
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                ({compliantCount}/{categoryReqs.length})
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={compliancePercent}
                              sx={{ height: 6, borderRadius: 1 }}
                              color={
                                compliancePercent > 75
                                  ? "success"
                                  : compliancePercent > 50
                                  ? "warning"
                                  : "error"
                              }
                            />
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">PCI-DSS Requirements</Typography>
              <Button
                startIcon={<FilterIcon />}
                variant="outlined"
                size="small"
              >
                Filter
              </Button>
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              {requirements.map((requirement, index) => (
                <React.Fragment key={requirement.id}>
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1">
                        {requirement.id}. {requirement.title}
                      </Typography>
                      <Box>
                        {renderStatusChip(requirement.status)}
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      {requirement.description}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Chip
                        label={requirement.category.replace(/_/g, " ")}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Last assessed:{" "}
                        {new Date(
                          requirement.lastAssessment || Date.now()
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  {index < requirements.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">
                Cardholder Data Environment Mapping
              </Typography>
              <Button
                startIcon={<FilterIcon />}
                variant="outlined"
                size="small"
              >
                Filter
              </Button>
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              {components.map((component, index) => (
                <React.Fragment key={component.id}>
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1">
                        {component.name}
                      </Typography>
                      <Box>
                        <Chip
                          label={component.environment}
                          size="small"
                          color={
                            component.environment === "CDE"
                              ? "error"
                              : "default"
                          }
                          sx={{ mr: 1 }}
                        />
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      {component.description}
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="caption"
                          component="div"
                          color="textSecondary"
                        >
                          Type: {component.type}
                        </Typography>
                        <Typography
                          variant="caption"
                          component="div"
                          color="textSecondary"
                        >
                          Location: {component.location}
                        </Typography>
                        <Typography
                          variant="caption"
                          component="div"
                          color="textSecondary"
                        >
                          Owner: {component.ownerName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="caption"
                          component="div"
                          color="textSecondary"
                        >
                          Function: {component.function}
                        </Typography>
                        <Typography
                          variant="caption"
                          component="div"
                          color="textSecondary"
                        >
                          Last scan:{" "}
                          {new Date(
                            component.lastScan || Date.now()
                          ).toLocaleDateString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          component="div"
                          color="textSecondary"
                        >
                          In scope: {component.inScope ? "Yes" : "No"}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Security controls:
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {component.securityControls.map((control) => (
                          <Chip
                            key={control}
                            label={control}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  {index < components.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Responsibility Matrix
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              This tab will show assigned responsibilities for each PCI-DSS
              requirement and component.
            </Typography>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default PCIDSSComplianceDashboard;
