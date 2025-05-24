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
  LinearProgress,
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
} from "@mui/icons-material";
import {
  useGetStorageAccountsQuery,
  useGetStorageAccountSecurityQuery,
  useRunStorageSecurityScanMutation,
} from "../../services/azureSecurityService";

/**
 * Azure Storage Security Component
 * Provides interface to assess and manage Azure Storage account security
 */
const StorageSecurity: React.FC = () => {
  const theme = useTheme();
  const [subscriptionId, setSubscriptionId] = useState<string>("all");
  const [selectedStorageAccount, setSelectedStorageAccount] =
    useState<string>("");

  // Fetch storage accounts
  const {
    data: storageAccounts,
    isLoading: isAccountsLoading,
    refetch: refetchAccounts,
  } = useGetStorageAccountsQuery({
    subscriptionId: subscriptionId !== "all" ? subscriptionId : undefined,
  });

  // Fetch selected storage account security details
  const {
    data: storageSecurityDetails,
    isLoading: isSecurityLoading,
    refetch: refetchSecurity,
  } = useGetStorageAccountSecurityQuery(
    { accountId: selectedStorageAccount },
    { skip: !selectedStorageAccount }
  );

  // Run security scan mutation
  const [runSecurityScan, { isLoading: isScanning }] =
    useRunStorageSecurityScanMutation();

  // Handle subscription change
  const handleSubscriptionChange = (event: SelectChangeEvent) => {
    setSubscriptionId(event.target.value);
    setSelectedStorageAccount("");
  };

  // Handle storage account selection
  const handleStorageAccountChange = (event: SelectChangeEvent) => {
    setSelectedStorageAccount(event.target.value);
  };

  // Run security scan
  const handleRunSecurityScan = async () => {
    if (selectedStorageAccount) {
      try {
        await runSecurityScan({ accountId: selectedStorageAccount });
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

  const securityScore = storageSecurityDetails
    ? calculateSecurityScore(storageSecurityDetails)
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
              Azure Storage Security
            </Typography>
            <Typography variant="body1">
              Analyze and manage security for Azure Storage accounts.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FormControl sx={{ minWidth: 200, mr: 2 }}>
              <InputLabel id="subscription-select-label">
                Subscription
              </InputLabel>
              <Select
                labelId="subscription-select-label"
                id="subscription-select"
                value={subscriptionId}
                label="Subscription"
                onChange={handleSubscriptionChange}
              >
                <MenuItem value="all">All Subscriptions</MenuItem>
                {storageAccounts?.subscriptions?.map((sub: any) => (
                  <MenuItem key={sub.id} value={sub.id}>
                    {sub.name || sub.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton onClick={() => refetchAccounts()} title="Refresh data">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Storage Account Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <StorageIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Select Storage Account</Typography>
        </Box>

        {isAccountsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        ) : !storageAccounts || storageAccounts.length === 0 ? (
          <Alert severity="info">
            No storage accounts found. Please check your subscription selection.
          </Alert>
        ) : (
          <FormControl fullWidth>
            <InputLabel id="storage-account-select-label">
              Storage Account
            </InputLabel>
            <Select
              labelId="storage-account-select-label"
              id="storage-account-select"
              value={selectedStorageAccount}
              label="Storage Account"
              onChange={handleStorageAccountChange}
            >
              <MenuItem value="">
                <em>Select a storage account</em>
              </MenuItem>
              {storageAccounts.map((account: any) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Paper>

      {/* Security Details */}
      {selectedStorageAccount && (
        <>
          {isSecurityLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : !storageSecurityDetails ? (
            <Alert severity="info">
              No security details available for the selected storage account.
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
                        {storageSecurityDetails.publicAccess ? (
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
                        {storageSecurityDetails.publicAccess
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
                        {storageSecurityDetails.encryption ? (
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
                        {storageSecurityDetails.encryption
                          ? `Encryption: ${
                              storageSecurityDetails.encryptionType ||
                              "Microsoft-managed keys"
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
                  {storageSecurityDetails.lastScanTime
                    ? new Date(
                        storageSecurityDetails.lastScanTime
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
                      {storageSecurityDetails.checks.map((check: any) => (
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

              {/* Configuration Details */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <StorageIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Storage Account Configuration
                  </Typography>
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
                            <strong>Access Tier:</strong>{" "}
                            {storageSecurityDetails.accessTier || "Standard"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Secure Transfer Required:</strong>{" "}
                            {storageSecurityDetails.secureTransfer
                              ? "Yes"
                              : "No"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Allow Shared Key Access:</strong>{" "}
                            {storageSecurityDetails.allowSharedKeyAccess
                              ? "Yes"
                              : "No"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>CORS Allowed Origins:</strong>{" "}
                            {storageSecurityDetails.corsAllowedOrigins
                              ? storageSecurityDetails.corsAllowedOrigins.join(
                                  ", "
                                )
                              : "None"}
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
                            <strong>Soft Delete (Blobs):</strong>{" "}
                            {storageSecurityDetails.blobSoftDelete
                              ? "Enabled"
                              : "Disabled"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Soft Delete (Containers):</strong>{" "}
                            {storageSecurityDetails.containerSoftDelete
                              ? "Enabled"
                              : "Disabled"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Version Control:</strong>{" "}
                            {storageSecurityDetails.versioningEnabled
                              ? "Enabled"
                              : "Disabled"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Change Feed:</strong>{" "}
                            {storageSecurityDetails.changeFeedEnabled
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
          {selectedStorageAccount && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mr: 2 }}
                onClick={() => setSelectedStorageAccount("")}
              >
                Back to Storage Account List
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

export default StorageSecurity;
