import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Cloud as CloudIcon,
  ArrowForward as ArrowForwardIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";

interface CloudSecurityWidgetProps {
  data: any;
  widget: DashboardWidget;
}

enum ResourceType {
  COMPUTE = "compute",
  STORAGE = "storage",
  DATABASE = "database",
  NETWORK = "network",
  IAM = "iam",
}

enum SeverityLevel {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

interface CloudFinding {
  id: string;
  resourceName: string;
  resourceType: ResourceType;
  provider: "aws" | "azure" | "gcp";
  region: string;
  severity: SeverityLevel;
  category: string;
  description: string;
  age: number; // in days
}

interface CloudSecurityData {
  totalResources: number;
  secureResources: number;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  complianceScore: number;
  lastScan: string;
  recentFindings: CloudFinding[];
}

/**
 * CloudSecurityWidget Component
 *
 * Displays cloud infrastructure security status and key insights
 * Shows critical findings and resource compliance overview
 */
const CloudSecurityWidget: React.FC<CloudSecurityWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Mock data for development
  const mockData: CloudSecurityData = {
    totalResources: 573,
    secureResources: 507,
    findings: {
      critical: 3,
      high: 12,
      medium: 35,
      low: 16,
    },
    complianceScore: 88,
    lastScan: "2025-05-15T12:15:00Z",
    recentFindings: [
      {
        id: "cs-001",
        resourceName: "prod-web-server-01",
        resourceType: ResourceType.COMPUTE,
        provider: "aws",
        region: "us-east-1",
        severity: SeverityLevel.CRITICAL,
        category: "Publicly accessible instance",
        description: "EC2 instance has unrestricted access from the internet",
        age: 1,
      },
      {
        id: "cs-002",
        resourceName: "customer-data-bucket",
        resourceType: ResourceType.STORAGE,
        provider: "aws",
        region: "us-east-1",
        severity: SeverityLevel.HIGH,
        category: "Unencrypted storage",
        description: "S3 bucket does not have default encryption enabled",
        age: 2,
      },
      {
        id: "cs-003",
        resourceName: "cloud-function-api",
        resourceType: ResourceType.COMPUTE,
        provider: "gcp",
        region: "us-central1",
        severity: SeverityLevel.HIGH,
        category: "Excessive permissions",
        description: "Service account has overly permissive roles",
        age: 1,
      },
      {
        id: "cs-004",
        resourceName: "prod-sql-instance",
        resourceType: ResourceType.DATABASE,
        provider: "azure",
        region: "eastus",
        severity: SeverityLevel.MEDIUM,
        category: "Public endpoint",
        description: "Database is accessible from public networks",
        age: 3,
      },
    ],
  };

  // Use provided data or fallback to mock data
  const cloudData = data?.cloudSecurity || mockData;

  // Format timestamp
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Get severity color
  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case SeverityLevel.CRITICAL:
        return theme.palette.error.dark;
      case SeverityLevel.HIGH:
        return theme.palette.error.main;
      case SeverityLevel.MEDIUM:
        return theme.palette.warning.main;
      case SeverityLevel.LOW:
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get resource type icon
  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.COMPUTE:
        return <CloudIcon fontSize="small" />;
      case ResourceType.STORAGE:
        return <StorageIcon fontSize="small" />;
      case ResourceType.DATABASE:
        return <StorageIcon fontSize="small" />;
      case ResourceType.NETWORK:
        return <SecurityIcon fontSize="small" />;
      case ResourceType.IAM:
        return <SecurityIcon fontSize="small" />;
      default:
        return <CloudIcon fontSize="small" />;
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      {/* Widget Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CloudIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6">Cloud Security</Typography>
        </Box>
        <Chip
          label={`${cloudData.complianceScore}% Secure`}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.main,
            fontWeight: "medium",
          }}
        />
      </Box>

      {/* Summary Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Resources
              </Typography>
              <Chip
                label={`${Math.round(
                  (cloudData.secureResources / cloudData.totalResources) * 100
                )}%`}
                size="small"
                sx={{ height: 20 }}
              />
            </Box>
            <Typography variant="h6" fontWeight="bold">
              {cloudData.secureResources}/{cloudData.totalResources}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" color="text.secondary">
              Critical Findings
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: theme.palette.error.main }}
            >
              {cloudData.findings.critical}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{ flex: 1, bgcolor: alpha(theme.palette.warning.main, 0.05) }}
        >
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" color="text.secondary">
              High Findings
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ color: theme.palette.warning.main }}
            >
              {cloudData.findings.high}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 36,
            "& .MuiTab-root": {
              minHeight: 36,
              py: 0.5,
            },
          }}
        >
          <Tab label="Recent Findings" />
          <Tab label="By Provider" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ flex: 1, overflow: "auto", mt: 2 }}>
        {/* Recent Findings */}
        {tabValue === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Severity</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Age</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cloudData.recentFindings.map((finding: CloudFinding) => (
                  <TableRow key={finding.id} hover>
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
                          fontWeight: "medium",
                          height: 20,
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            mr: 1,
                            display: "flex",
                            color: "text.secondary",
                          }}
                        >
                          {getResourceIcon(finding.resourceType)}
                        </Box>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 120 }}
                        >
                          {finding.resourceName}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {finding.provider.toUpperCase()} / {finding.region}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {finding.category}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {finding.age} {finding.age === 1 ? "day" : "days"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Provider Breakdown */}
        {tabValue === 1 && (
          <Box sx={{ p: 1 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell>Resources</TableCell>
                    <TableCell>Findings</TableCell>
                    <TableCell>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        AWS
                      </Typography>
                    </TableCell>
                    <TableCell>312</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <WarningIcon
                          fontSize="small"
                          sx={{ color: theme.palette.error.main }}
                        />
                        <Typography variant="body2">28</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label="86%" size="small" sx={{ height: 20 }} />
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        Azure
                      </Typography>
                    </TableCell>
                    <TableCell>165</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <WarningIcon
                          fontSize="small"
                          sx={{ color: theme.palette.warning.main }}
                        />
                        <Typography variant="body2">18</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label="91%" size="small" sx={{ height: 20 }} />
                    </TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        GCP
                      </Typography>
                    </TableCell>
                    <TableCell>96</TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <WarningIcon
                          fontSize="small"
                          sx={{ color: theme.palette.warning.main }}
                        />
                        <Typography variant="body2">20</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label="88%" size="small" sx={{ height: 20 }} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          mt: "auto",
          pt: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Last scan: {formatDate(cloudData.lastScan)}
        </Typography>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => (window.location.href = "/security/cloud")}
          size="small"
        >
          View All Findings
        </Button>
      </Box>
    </Box>
  );
};

export default CloudSecurityWidget;
