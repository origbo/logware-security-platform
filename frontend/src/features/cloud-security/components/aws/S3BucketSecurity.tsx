import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  useTheme,
  Divider,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Storage as StorageIcon,
  Info as InfoIcon,
  CloudDownload as DownloadIcon,
} from "@mui/icons-material";
import {
  useGetS3BucketsQuery,
  useGetS3BucketsWithFindingQuery,
} from "../../services/awsSecurityService";
import { FindingSeverity } from "../../types/cloudSecurityTypes";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as ChartTooltip,
} from "recharts";

interface S3BucketSecurityProps {
  accountId: string;
}

/**
 * S3 Bucket Security Assessment Component
 * Analyzes S3 buckets for security issues and displays security posture
 */
const S3BucketSecurity: React.FC<S3BucketSecurityProps> = ({ accountId }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedBucket, setExpandedBucket] = useState<string | null>(null);

  // Fetch all S3 buckets
  const {
    data: buckets,
    isLoading: isBucketsLoading,
    isError: isBucketsError,
    error: bucketsError,
    refetch: refetchBuckets,
  } = useGetS3BucketsQuery({ accountId });

  // Fetch S3 buckets with findings
  const {
    data: bucketsWithFindings,
    isLoading: isFindingsLoading,
    isError: isFindingsError,
    error: findingsError,
  } = useGetS3BucketsWithFindingQuery({ accountId });

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

  // Toggle bucket details expansion
  const toggleBucketExpansion = (bucketName: string) => {
    setExpandedBucket(expandedBucket === bucketName ? null : bucketName);
  };

  // Check if a bucket has findings
  const getBucketFindings = (bucketName: string) => {
    if (!bucketsWithFindings) return [];
    const bucketWithFinding = bucketsWithFindings.find(
      (b) => b.bucket.name === bucketName
    );
    return bucketWithFinding ? bucketWithFinding.findings : [];
  };

  // Get bucket security status
  const getBucketSecurityStatus = (bucketName: string) => {
    const findings = getBucketFindings(bucketName);
    if (findings.length === 0) return "secure";
    if (
      findings.some(
        (f) =>
          f.severity === FindingSeverity.CRITICAL ||
          f.severity === FindingSeverity.HIGH
      )
    )
      return "critical";
    if (findings.some((f) => f.severity === FindingSeverity.MEDIUM))
      return "warning";
    return "info";
  };

  // Calculate security stats for the pie chart
  const getSecurityStats = () => {
    if (!buckets || !bucketsWithFindings) return [];

    const critical = buckets.filter(
      (b) => getBucketSecurityStatus(b.name) === "critical"
    ).length;
    const warning = buckets.filter(
      (b) => getBucketSecurityStatus(b.name) === "warning"
    ).length;
    const secure = buckets.filter(
      (b) => getBucketSecurityStatus(b.name) === "secure"
    ).length;
    const info = buckets.filter(
      (b) => getBucketSecurityStatus(b.name) === "info"
    ).length;

    return [
      {
        name: "Critical Issues",
        value: critical,
        color: theme.palette.error.main,
      },
      { name: "Warnings", value: warning, color: theme.palette.warning.main },
      { name: "Secure", value: secure, color: theme.palette.success.main },
      { name: "Info", value: info, color: theme.palette.info.main },
    ];
  };

  // Get bucket access status (public, private, etc.)
  const getBucketAccessStatus = (bucketName: string) => {
    const findings = getBucketFindings(bucketName);
    const publicAccessFinding = findings.find(
      (f) =>
        f.title.includes("public") || f.description.includes("public access")
    );
    return publicAccessFinding ? "public" : "private";
  };

  // Get total violations count
  const getTotalViolations = () => {
    if (!bucketsWithFindings) return 0;
    return bucketsWithFindings.reduce(
      (total, bucket) => total + bucket.findings.length,
      0
    );
  };

  // Get total public buckets count
  const getPublicBucketsCount = () => {
    if (!buckets) return 0;
    return buckets.filter((b) => getBucketAccessStatus(b.name) === "public")
      .length;
  };

  // Color for security status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return theme.palette.error.main;
      case "warning":
        return theme.palette.warning.main;
      case "info":
        return theme.palette.info.main;
      case "secure":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Icon for security status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <WarningIcon sx={{ color: theme.palette.error.main }} />;
      case "warning":
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      case "info":
        return <InfoIcon sx={{ color: theme.palette.info.main }} />;
      case "secure":
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      default:
        return <InfoIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const isLoading = isBucketsLoading || isFindingsLoading;
  const isError = isBucketsError || isFindingsError;
  const securityStats = getSecurityStats();

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2">
          S3 Bucket Security Assessment
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={() => refetchBuckets()} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export report">
            <IconButton disabled={isLoading || !buckets}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">
          Error loading S3 bucket security data:{" "}
          {(bucketsError as any)?.data?.message ||
            (findingsError as any)?.data?.message ||
            "Unknown error"}
        </Alert>
      ) : (
        <>
          {/* Overview Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total S3 Buckets
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <StorageIcon
                      sx={{
                        fontSize: 40,
                        color: theme.palette.primary.main,
                        mr: 1,
                      }}
                    />
                    <Typography variant="h4" component="div">
                      {buckets?.length || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Security Violations
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <SecurityIcon
                      sx={{
                        fontSize: 40,
                        color: theme.palette.error.main,
                        mr: 1,
                      }}
                    />
                    <Typography variant="h4" component="div">
                      {getTotalViolations()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Public Buckets
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PublicIcon
                      sx={{
                        fontSize: 40,
                        color: theme.palette.warning.main,
                        mr: 1,
                      }}
                    />
                    <Typography variant="h4" component="div">
                      {getPublicBucketsCount()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Security Status Chart */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Buckets Security Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={securityStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {securityStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <ChartTooltip
                    formatter={(value, name) => [`${value} buckets`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Buckets Table */}
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer>
              <Table aria-label="S3 buckets security table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Bucket Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Region</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Access</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Security Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Findings</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buckets &&
                    buckets
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((bucket) => {
                        const bucketStatus = getBucketSecurityStatus(
                          bucket.name
                        );
                        const bucketFindings = getBucketFindings(bucket.name);
                        const accessStatus = getBucketAccessStatus(bucket.name);

                        return (
                          <React.Fragment key={bucket.id}>
                            <TableRow hover>
                              <TableCell>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <StorageIcon sx={{ mr: 1 }} />
                                  <Typography>{bucket.name}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{bucket.region}</TableCell>
                              <TableCell>
                                {accessStatus === "public" ? (
                                  <Chip
                                    icon={<PublicIcon />}
                                    label="Public"
                                    color="warning"
                                    size="small"
                                  />
                                ) : (
                                  <Chip
                                    icon={<LockIcon />}
                                    label="Private"
                                    color="success"
                                    size="small"
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={getStatusIcon(bucketStatus)}
                                  label={
                                    bucketStatus.charAt(0).toUpperCase() +
                                    bucketStatus.slice(1)
                                  }
                                  sx={{
                                    bgcolor: `${getStatusColor(
                                      bucketStatus
                                    )}20`,
                                    color: getStatusColor(bucketStatus),
                                    borderColor: getStatusColor(bucketStatus),
                                  }}
                                  variant="outlined"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{bucketFindings.length}</TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  color="primary"
                                  startIcon={
                                    expandedBucket === bucket.name ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )
                                  }
                                  onClick={() =>
                                    toggleBucketExpansion(bucket.name)
                                  }
                                  disabled={bucketFindings.length === 0}
                                >
                                  {expandedBucket === bucket.name
                                    ? "Hide"
                                    : "Details"}
                                </Button>
                              </TableCell>
                            </TableRow>

                            {expandedBucket === bucket.name && (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  sx={{
                                    p: 0,
                                    bgcolor: theme.palette.background.default,
                                  }}
                                >
                                  <Collapse
                                    in={expandedBucket === bucket.name}
                                    timeout="auto"
                                    unmountOnExit
                                  >
                                    <Box sx={{ p: 3 }}>
                                      <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                      >
                                        Security Findings
                                      </Typography>
                                      <List>
                                        {bucketFindings.map(
                                          (finding, index) => (
                                            <Paper
                                              key={index}
                                              sx={{ mb: 2, p: 2 }}
                                            >
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "flex-start",
                                                  mb: 1,
                                                }}
                                              >
                                                {finding.severity ===
                                                  FindingSeverity.CRITICAL && (
                                                  <WarningIcon
                                                    color="error"
                                                    sx={{ mr: 1 }}
                                                  />
                                                )}
                                                {finding.severity ===
                                                  FindingSeverity.HIGH && (
                                                  <WarningIcon
                                                    color="error"
                                                    sx={{ mr: 1 }}
                                                  />
                                                )}
                                                {finding.severity ===
                                                  FindingSeverity.MEDIUM && (
                                                  <WarningIcon
                                                    color="warning"
                                                    sx={{ mr: 1 }}
                                                  />
                                                )}
                                                {finding.severity ===
                                                  FindingSeverity.LOW && (
                                                  <InfoIcon
                                                    color="info"
                                                    sx={{ mr: 1 }}
                                                  />
                                                )}
                                                <Typography variant="subtitle2">
                                                  {finding.title}
                                                </Typography>
                                              </Box>

                                              <Typography
                                                variant="body2"
                                                sx={{ ml: 4, mb: 2 }}
                                              >
                                                {finding.description}
                                              </Typography>

                                              {finding.remediation && (
                                                <>
                                                  <Divider sx={{ mb: 2 }} />
                                                  <Typography
                                                    variant="subtitle2"
                                                    gutterBottom
                                                  >
                                                    Remediation:
                                                  </Typography>
                                                  <Typography
                                                    variant="body2"
                                                    sx={{ ml: 2 }}
                                                  >
                                                    {
                                                      finding.remediation
                                                        .recommendation
                                                    }
                                                  </Typography>
                                                  {finding.remediation.url && (
                                                    <Button
                                                      size="small"
                                                      sx={{ mt: 1 }}
                                                      component="a"
                                                      href={
                                                        finding.remediation.url
                                                      }
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                    >
                                                      Learn More
                                                    </Button>
                                                  )}
                                                </>
                                              )}
                                            </Paper>
                                          )
                                        )}
                                      </List>
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}

                  {(!buckets || buckets.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" sx={{ py: 2 }}>
                          No S3 buckets found in this account.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={buckets?.length || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default S3BucketSecurity;
