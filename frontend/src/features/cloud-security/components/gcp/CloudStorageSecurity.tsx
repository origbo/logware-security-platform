import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  useTheme,
  alpha,
} from "@mui/material";
import {
  Storage as StorageIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  VpnKey as VpnKeyIcon,
  List as ListIcon,
} from "@mui/icons-material";
import {
  useGetCloudStorageBucketsQuery,
  useGetBucketSecurityDetailsQuery,
  useRunStorageSecurityScanMutation,
} from "../../services/gcpSecurityService";

/**
 * GCP Cloud Storage Security Component
 * Provides interface to assess and manage Google Cloud Storage bucket security
 */
const CloudStorageSecurity: React.FC = () => {
  const theme = useTheme();
  const [projectId, setProjectId] = useState<string>("all");
  const [selectedBucket, setSelectedBucket] = useState<string>("");

  // Fetch storage buckets
  const {
    data: storageBuckets,
    isLoading: isBucketsLoading,
    refetch: refetchBuckets,
  } = useGetCloudStorageBucketsQuery({
    projectId: projectId !== "all" ? projectId : undefined,
  });

  // Fetch selected bucket security details
  const {
    data: bucketSecurityDetails,
    isLoading: isSecurityLoading,
    refetch: refetchSecurity,
  } = useGetBucketSecurityDetailsQuery(
    { bucketName: selectedBucket },
    { skip: !selectedBucket }
  );

  // Run security scan mutation
  const [runSecurityScan, { isLoading: isScanning }] =
    useRunStorageSecurityScanMutation();

  // Handle project change
  const handleProjectChange = (event: SelectChangeEvent) => {
    setProjectId(event.target.value);
    setSelectedBucket("");
  };

  // Handle bucket selection
  const handleBucketChange = (event: SelectChangeEvent) => {
    setSelectedBucket(event.target.value);
  };

  // Run security scan
  const handleRunSecurityScan = async () => {
    if (selectedBucket) {
      try {
        await runSecurityScan({ bucketName: selectedBucket });
        refetchSecurity();
      } catch (error) {
        console.error("Failed to run security scan:", error);
      }
    }
  };

  // Calculate security score
  const calculateSecurityScore = (securityDetails: any) => {
    if (!securityDetails || !securityDetails.checks) return 0;

    const passedChecks = securityDetails.checks.filter(
      (check: any) => check.status === "passed"
    ).length;
    const totalChecks = securityDetails.checks.length;

    return Math.round((passedChecks / totalChecks) * 100);
  };

  const securityScore = bucketSecurityDetails
    ? calculateSecurityScore(bucketSecurityDetails)
    : 0;

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "passed":
        return <CheckIcon sx={{ color: theme.palette.success.main }} />;
      case "failed":
        return <CloseIcon sx={{ color: theme.palette.error.main }} />;
      case "warning":
        return <WarningIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return null;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
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
              GCP Cloud Storage Security
            </Typography>
            <Typography variant="body1">
              Analyze and manage security for Google Cloud Storage buckets.
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
                {storageBuckets?.projects?.map((project: any) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name || project.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton onClick={() => refetchBuckets()} title="Refresh data">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Bucket Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <StorageIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Select Storage Bucket</Typography>
        </Box>

        {isBucketsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        ) : !storageBuckets || storageBuckets.length === 0 ? (
          <Alert severity="info">
            No storage buckets found. Please check your project selection.
          </Alert>
        ) : (
          <FormControl fullWidth>
            <InputLabel id="bucket-select-label">Storage Bucket</InputLabel>
            <Select
              labelId="bucket-select-label"
              id="bucket-select"
              value={selectedBucket}
              label="Storage Bucket"
              onChange={handleBucketChange}
            >
              <MenuItem value="">
                <em>Select a storage bucket</em>
              </MenuItem>
              {storageBuckets.map((bucket: any) => (
                <MenuItem key={bucket.name} value={bucket.name}>
                  {bucket.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Paper>

      {/* Security Details */}
      {selectedBucket && (
        <>
          {isSecurityLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : !bucketSecurityDetails ? (
            <Alert severity="info">
              No security details available for the selected bucket.
            </Alert>
          ) : (
            <>
              {/* Overview Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography
                        color="textSecondary"
                        gutterBottom
                        variant="body2"
                      >
                        Security Score
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          variant="h4"
                          color={
                            securityScore >= 80
                              ? "success.main"
                              : securityScore >= 60
                              ? "warning.main"
                              : "error.main"
                          }
                        >
                          {securityScore}%
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <Box sx={{ width: "100%", mr: 1 }}>
                          <Box
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: alpha(
                                securityScore >= 80
                                  ? theme.palette.success.main
                                  : securityScore >= 60
                                  ? theme.palette.warning.main
                                  : theme.palette.error.main,
                                0.2
                              ),
                            }}
                          >
                            <Box
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                width: `${securityScore}%`,
                                bgcolor:
                                  securityScore >= 80
                                    ? theme.palette.success.main
                                    : securityScore >= 60
                                    ? theme.palette.warning.main
                                    : theme.palette.error.main,
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography
                        color="textSecondary"
                        gutterBottom
                        variant="body2"
                      >
                        Public Access
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {bucketSecurityDetails.publicAccess ? (
                          <>
                            <PublicIcon
                              sx={{ mr: 1, color: theme.palette.error.main }}
                            />
                            <Typography variant="h5" color="error.main">
                              Enabled
                            </Typography>
                          </>
                        ) : (
                          <>
                            <LockIcon
                              sx={{ mr: 1, color: theme.palette.success.main }}
                            />
                            <Typography variant="h5" color="success.main">
                              Restricted
                            </Typography>
                          </>
                        )}
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {bucketSecurityDetails.publicAccess
                          ? "Public access is enabled, consider restricting"
                          : "Public access is properly restricted"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography
                        color="textSecondary"
                        gutterBottom
                        variant="body2"
                      >
                        Encryption
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {bucketSecurityDetails.encryption ? (
                          <>
                            <VpnKeyIcon
                              sx={{ mr: 1, color: theme.palette.success.main }}
                            />
                            <Typography variant="h5" color="success.main">
                              Enabled
                            </Typography>
                          </>
                        ) : (
                          <>
                            <VpnKeyIcon
                              sx={{ mr: 1, color: theme.palette.error.main }}
                            />
                            <Typography variant="h5" color="error.main">
                              Disabled
                            </Typography>
                          </>
                        )}
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {bucketSecurityDetails.encryption
                          ? `Encryption: ${
                              bucketSecurityDetails.encryptionType ||
                              "Google-managed keys"
                            }`
                          : "Encryption is not enabled"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Security Assessment */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <SecurityIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Security Assessment</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleRunSecurityScan}
                    disabled={isScanning}
                  >
                    {isScanning ? "Scanning..." : "Run Security Scan"}
                  </Button>
                </Box>

                <Typography variant="body2" color="textSecondary" paragraph>
                  Last scanned:{" "}
                  {bucketSecurityDetails.lastScanTime
                    ? new Date(
                        bucketSecurityDetails.lastScanTime
                      ).toLocaleString()
                    : "Never"}
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Check</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Recommendation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bucketSecurityDetails.checks.map((check: any) => (
                        <TableRow key={check.id} hover>
                          <TableCell>{check.name}</TableCell>
                          <TableCell>{check.description}</TableCell>
                          <TableCell>
                            <Chip
                              label={check.severity}
                              size="small"
                              sx={{
                                bgcolor: alpha(
                                  getSeverityColor(check.severity),
                                  0.1
                                ),
                                color: getSeverityColor(check.severity),
                                fontWeight: 500,
                                textTransform: "capitalize",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              {getStatusIcon(check.status)}
                              <Typography
                                variant="body2"
                                sx={{ ml: 1, textTransform: "capitalize" }}
                              >
                                {check.status}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{check.recommendation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* IAM & Access Control */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <LockIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">IAM & Access Control</Typography>
                </Box>

                <Typography variant="body2" paragraph>
                  IAM policies and access control settings for this bucket.
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Principal</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bucketSecurityDetails.iamPolicies?.map(
                        (policy: any, index: number) => (
                          <TableRow key={`policy-${index}`} hover>
                            <TableCell>{policy.member}</TableCell>
                            <TableCell>{policy.role}</TableCell>
                            <TableCell>
                              <Chip
                                label={policy.type}
                                size="small"
                                sx={{ textTransform: "capitalize" }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {policy.isInsecure ? (
                                  <WarningIcon
                                    sx={{ color: theme.palette.warning.main }}
                                  />
                                ) : (
                                  <CheckIcon
                                    sx={{ color: theme.palette.success.main }}
                                  />
                                )}
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  {policy.isInsecure
                                    ? "Potentially insecure"
                                    : "Secure"}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Configuration Details */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <StorageIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Bucket Configuration</Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Access & Authentication
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Storage Class:</strong>{" "}
                            {bucketSecurityDetails.storageClass || "Standard"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Uniform Bucket-level Access:</strong>{" "}
                            {bucketSecurityDetails.uniformBucketLevelAccess
                              ? "Enabled"
                              : "Disabled"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Requester Pays:</strong>{" "}
                            {bucketSecurityDetails.requesterPays
                              ? "Enabled"
                              : "Disabled"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>CORS Configuration:</strong>{" "}
                            {bucketSecurityDetails.corsEnabled
                              ? "Configured"
                              : "Not configured"}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary">
                          Configure Access
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Data Protection
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Versioning:</strong>{" "}
                            {bucketSecurityDetails.versioningEnabled
                              ? "Enabled"
                              : "Disabled"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Lifecycle Rules:</strong>{" "}
                            {bucketSecurityDetails.lifecycleRulesCount || 0}{" "}
                            rules configured
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Object Retention:</strong>{" "}
                            {bucketSecurityDetails.retentionPolicy
                              ? "Configured"
                              : "Not configured"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Logging:</strong>{" "}
                            {bucketSecurityDetails.loggingEnabled
                              ? "Enabled"
                              : "Disabled"}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary">
                          Configure Protection
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}

          {/* Action Buttons */}
          {selectedBucket && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mr: 2 }}
                onClick={() => setSelectedBucket("")}
              >
                Back to Bucket List
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRunSecurityScan}
                disabled={isScanning}
                startIcon={<SecurityIcon />}
              >
                Generate Security Report
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CloudStorageSecurity;
