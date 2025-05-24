import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Shield as ShieldIcon,
  VpnKey as KeyIcon,
  History as HistoryIcon,
  CloudCircle as CloudIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import {
  useGetAWSAccountsQuery,
  useSyncAWSAccountMutation,
} from "../../services/awsSecurityService";
import CloudTrailEvents from "./CloudTrailEvents";
import S3BucketSecurity from "./S3BucketSecurity";
import IAMPolicyAnalyzer from "./IAMPolicyAnalyzer";
import { FindingSeverity } from "../../types/cloudSecurityTypes";
import { format } from "date-fns";

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
      id={`aws-tabpanel-${index}`}
      aria-labelledby={`aws-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * AWS Security Dashboard Component
 * Main dashboard for AWS security features integrating CloudTrail, S3, and IAM components
 */
interface AWSSecurityDashboardProps {
  accountId?: string; // Optional account ID to pre-select
}

const AWSSecurityDashboard: React.FC<AWSSecurityDashboardProps> = ({
  accountId,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    accountId || null
  );

  // Fetch AWS accounts
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    error: accountsError,
    refetch: refetchAccounts,
  } = useGetAWSAccountsQuery();

  // Sync AWS account mutation
  const [syncAccount, { isLoading: isSyncLoading }] =
    useSyncAWSAccountMutation();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle account selection
  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  // Trigger account sync
  const handleSyncAccount = async (accountId: string) => {
    try {
      await syncAccount({ accountId });
      refetchAccounts();
    } catch (error) {
      console.error("Failed to sync account:", error);
    }
  };

  // Helper to get account connection status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return theme.palette.success.main;
      case "disconnected":
        return theme.palette.error.main;
      case "error":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Render loading state
  if (isAccountsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "300px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (isAccountsError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error loading AWS accounts:{" "}
        {(accountsError as any)?.data?.message || "Unknown error"}
      </Alert>
    );
  }

  // If no accounts are available
  if (!accounts || accounts.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <CloudIcon
          sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }}
        />
        <Typography variant="h5" gutterBottom>
          No AWS Accounts Connected
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Connect an AWS account to start monitoring security.
        </Typography>
        <Button variant="contained" color="primary" startIcon={<CloudIcon />}>
          Connect AWS Account
        </Button>
      </Paper>
    );
  }

  // Set default selected account if none is selected
  if (!selectedAccountId && accounts.length > 0) {
    setSelectedAccountId(accounts[0].accountId);
    return null; // Prevent rendering until state updates
  }

  // Find the selected account
  const selectedAccount = accounts.find(
    (account) => account.accountId === selectedAccountId
  );

  if (!selectedAccount) {
    return <Alert severity="error">Selected account not found.</Alert>;
  }

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
        <Typography variant="h4" component="h1">
          AWS Security Dashboard
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={() => refetchAccounts()}
              disabled={isAccountsLoading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dashboard settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Account Selection */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          AWS Accounts
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {accounts.map((account) => (
            <Card
              key={account.accountId}
              sx={{
                width: 240,
                cursor: "pointer",
                border:
                  selectedAccountId === account.accountId
                    ? `2px solid ${theme.palette.primary.main}`
                    : "none",
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: 3,
                },
              }}
              onClick={() => handleAccountSelect(account.accountId)}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <CloudIcon />
                  </Avatar>
                }
                title={account.name}
                subheader={`Account: ${account.accountId}`}
              />
              <Divider />
              <CardContent sx={{ pt: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Chip
                    label={account.status}
                    size="small"
                    sx={{
                      bgcolor: `${getStatusColor(account.status)}20`,
                      color: getStatusColor(account.status),
                      textTransform: "capitalize",
                    }}
                  />
                  <Tooltip title="Sync account data">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSyncAccount(account.accountId);
                      }}
                      disabled={isSyncLoading}
                    >
                      <SyncIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Last sync:{" "}
                  {account.lastSyncTime
                    ? format(
                        new Date(account.lastSyncTime),
                        "MMM d, yyyy HH:mm"
                      )
                    : "Never"}
                </Typography>
              </CardContent>
            </Card>
          ))}

          <Card
            sx={{
              width: 240,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 2,
              cursor: "pointer",
              border: `1px dashed ${theme.palette.divider}`,
              "&:hover": {
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <CloudIcon
              sx={{ fontSize: 40, color: theme.palette.grey[400], mb: 1 }}
            />
            <Typography variant="body1" align="center">
              Connect New Account
            </Typography>
          </Card>
        </Box>
      </Paper>

      {/* Account Overview */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <CloudIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6">
            Account Overview: {selectedAccount.name}
          </Typography>
          <Chip
            label={selectedAccount.status}
            size="small"
            sx={{
              ml: 2,
              bgcolor: `${getStatusColor(selectedAccount.status)}20`,
              color: getStatusColor(selectedAccount.status),
              textTransform: "capitalize",
            }}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.background.default }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Resources
                </Typography>
                <Typography variant="h4">
                  {selectedAccount.resources || "0"}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  AWS resources monitored
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.background.default }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Security Findings
                </Typography>
                <Typography variant="h4">
                  {selectedAccount.findings || "0"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Chip
                    label={`${Math.round(
                      (selectedAccount.findings || 0) * 0.2
                    )} Critical`}
                    size="small"
                    color="error"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${Math.round(
                      (selectedAccount.findings || 0) * 0.5
                    )} High`}
                    size="small"
                    color="warning"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.background.default }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Last Activity
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <HistoryIcon
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  <Typography>
                    {selectedAccount.lastSyncTime
                      ? format(
                          new Date(selectedAccount.lastSyncTime),
                          "MMM d, HH:mm"
                        )
                      : "Never"}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                >
                  <Button
                    size="small"
                    disabled={isSyncLoading}
                    onClick={() => handleSyncAccount(selectedAccount.accountId)}
                  >
                    {isSyncLoading ? <CircularProgress size={16} /> : "Refresh"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.background.default }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Account ID
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                  {selectedAccount.accountId}
                </Typography>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                >
                  <Button size="small">Manage</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Security Features Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="AWS security tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<ShieldIcon />}
            iconPosition="start"
            label="CloudTrail Events"
          />
          <Tab
            icon={<StorageIcon />}
            iconPosition="start"
            label="S3 Bucket Security"
          />
          <Tab
            icon={<KeyIcon />}
            iconPosition="start"
            label="IAM Policy Analyzer"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <CloudTrailEvents accountId={selectedAccount.accountId} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <S3BucketSecurity accountId={selectedAccount.accountId} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <IAMPolicyAnalyzer accountId={selectedAccount.accountId} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AWSSecurityDashboard;
