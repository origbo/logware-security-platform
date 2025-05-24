import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Slider,
  TextField,
  Button,
  Alert,
  FormControl,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  InputLabel,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import StorageIcon from "@mui/icons-material/Storage";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ArchiveIcon from "@mui/icons-material/Archive";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import HelpIcon from "@mui/icons-material/Help";

interface RetentionPolicy {
  dataType: string;
  displayName: string;
  description: string;
  retention: number;
  archiving: boolean;
  archiveAfter: number;
  automaticDeletion: boolean;
}

const DataRetentionSettings: React.FC = () => {
  // State for data retention settings
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>(
    [
      {
        dataType: "security_logs",
        displayName: "Security Logs",
        description: "System security events and audit logs",
        retention: 365, // days
        archiving: true,
        archiveAfter: 90, // days
        automaticDeletion: true,
      },
      {
        dataType: "network_logs",
        displayName: "Network Logs",
        description: "Network traffic and monitoring data",
        retention: 180, // days
        archiving: true,
        archiveAfter: 60, // days
        automaticDeletion: true,
      },
      {
        dataType: "user_activity",
        displayName: "User Activity",
        description: "User login, actions and behavior data",
        retention: 90, // days
        archiving: false,
        archiveAfter: 30, // days
        automaticDeletion: true,
      },
      {
        dataType: "alerts",
        displayName: "Security Alerts",
        description: "Detected security incidents and alerts",
        retention: 730, // days
        archiving: true,
        archiveAfter: 365, // days
        automaticDeletion: false,
      },
      {
        dataType: "reports",
        displayName: "Generated Reports",
        description: "Security assessment and compliance reports",
        retention: 1095, // days (3 years)
        archiving: true,
        archiveAfter: 365, // days
        automaticDeletion: false,
      },
    ]
  );

  // State for global settings
  const [globalSettings, setGlobalSettings] = useState({
    archiveLocation: "cold_storage", // cold_storage, s3, azure_blob
    compressionEnabled: true,
    encryptionEnabled: true,
    retentionReminderDays: 14, // notify X days before data deletion
  });

  // State for storage usage
  const [storageUsage, setStorageUsage] = useState({
    primary: {
      used: 1.27, // TB
      total: 2.0, // TB
      byDataType: {
        security_logs: 0.38,
        network_logs: 0.52,
        user_activity: 0.09,
        alerts: 0.05,
        reports: 0.23,
      },
    },
    archive: {
      used: 3.8, // TB
      total: 10.0, // TB
    },
  });

  // UI states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  // Handle policy change
  const handlePolicyChange = (
    index: number,
    field: keyof RetentionPolicy,
    value: any
  ) => {
    const updatedPolicies = [...retentionPolicies];
    updatedPolicies[index] = {
      ...updatedPolicies[index],
      [field]: value,
    };

    // If archiving is turned off, reset archive days
    if (field === "archiving" && value === false) {
      updatedPolicies[index].archiveAfter = 0;
    }

    setRetentionPolicies(updatedPolicies);
  };

  // Handle global settings change
  const handleGlobalSettingChange = (
    field: keyof typeof globalSettings,
    value: any
  ) => {
    setGlobalSettings({
      ...globalSettings,
      [field]: value,
    });
  };

  // Toggle expanded info
  const toggleExpandedInfo = (dataType: string) => {
    if (expandedInfo === dataType) {
      setExpandedInfo(null);
    } else {
      setExpandedInfo(dataType);
    }
  };

  // Handle save button click
  const handleSave = () => {
    // In a real app, this would save to backend
    console.log("Saving data retention settings:", {
      retentionPolicies,
      globalSettings,
    });

    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Format GB as user-friendly string
  const formatStorage = (tb: number) => {
    if (tb >= 1) {
      return `${tb.toFixed(2)} TB`;
    } else {
      const gb = tb * 1000;
      return `${gb.toFixed(2)} GB`;
    }
  };

  // Calculate percentage
  const calcPercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  return (
    <Box>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Data retention settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Storage Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <StorageIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Storage Usage</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Primary Storage
                    <Tooltip title="Fast storage for active data">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                      <Box
                        sx={{
                          height: 12,
                          borderRadius: 1,
                          bgcolor: "grey.200",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            width: `${calcPercentage(
                              storageUsage.primary.used,
                              storageUsage.primary.total
                            )}%`,
                            bgcolor:
                              calcPercentage(
                                storageUsage.primary.used,
                                storageUsage.primary.total
                              ) > 90
                                ? "error.main"
                                : "primary.main",
                            position: "absolute",
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2">
                      {formatStorage(storageUsage.primary.used)} /{" "}
                      {formatStorage(storageUsage.primary.total)}
                    </Typography>
                  </Box>

                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ mt: 2 }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Data Type</TableCell>
                          <TableCell align="right">Usage</TableCell>
                          <TableCell align="right">%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(storageUsage.primary.byDataType).map(
                          ([key, value]) => (
                            <TableRow key={key}>
                              <TableCell>
                                {retentionPolicies.find(
                                  (p) => p.dataType === key
                                )?.displayName || key}
                              </TableCell>
                              <TableCell align="right">
                                {formatStorage(value)}
                              </TableCell>
                              <TableCell align="right">
                                {Math.round(
                                  (value / storageUsage.primary.used) * 100
                                )}
                                %
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Archive Storage
                    <Tooltip title="Cost-effective storage for archived data">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                      <Box
                        sx={{
                          height: 12,
                          borderRadius: 1,
                          bgcolor: "grey.200",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            width: `${calcPercentage(
                              storageUsage.archive.used,
                              storageUsage.archive.total
                            )}%`,
                            bgcolor: "secondary.main",
                            position: "absolute",
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2">
                      {formatStorage(storageUsage.archive.used)} /{" "}
                      {formatStorage(storageUsage.archive.total)}
                    </Typography>
                  </Box>

                  <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Archive Location
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={globalSettings.archiveLocation}
                        onChange={(e) =>
                          handleGlobalSettingChange(
                            "archiveLocation",
                            e.target.value
                          )
                        }
                      >
                        <MenuItem value="cold_storage">
                          Local Cold Storage
                        </MenuItem>
                        <MenuItem value="s3">Amazon S3</MenuItem>
                        <MenuItem value="azure_blob">
                          Azure Blob Storage
                        </MenuItem>
                        <MenuItem value="google_cloud">
                          Google Cloud Storage
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <Box sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={globalSettings.compressionEnabled}
                            onChange={(e) =>
                              handleGlobalSettingChange(
                                "compressionEnabled",
                                e.target.checked
                              )
                            }
                            color="primary"
                          />
                        }
                        label="Enable Compression"
                      />
                    </Box>

                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={globalSettings.encryptionEnabled}
                            onChange={(e) =>
                              handleGlobalSettingChange(
                                "encryptionEnabled",
                                e.target.checked
                              )
                            }
                            color="primary"
                          />
                        }
                        label="Enable Encryption"
                      />
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Retention Policies */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Retention Policies
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {retentionPolicies.map((policy, index) => (
                <Box key={policy.dataType} sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1">
                      {policy.displayName}
                      <IconButton
                        size="small"
                        onClick={() => toggleExpandedInfo(policy.dataType)}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={policy.automaticDeletion}
                          onChange={(e) =>
                            handlePolicyChange(
                              index,
                              "automaticDeletion",
                              e.target.checked
                            )
                          }
                          color="primary"
                        />
                      }
                      label="Auto Delete"
                    />
                  </Box>

                  {expandedInfo === policy.dataType && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {policy.description}
                      </Typography>
                    </Alert>
                  )}

                  <Box sx={{ px: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography gutterBottom>
                          Retention Period: {policy.retention} days
                        </Typography>
                        <Slider
                          value={policy.retention}
                          onChange={(_, value) =>
                            handlePolicyChange(index, "retention", value)
                          }
                          min={1}
                          max={1825} // 5 years
                          step={1}
                          marks={[
                            { value: 30, label: "30d" },
                            { value: 365, label: "1y" },
                            { value: 730, label: "2y" },
                            { value: 1825, label: "5y" },
                          ]}
                        />
                        <Typography variant="caption" color="textSecondary">
                          Data older than this will be{" "}
                          {policy.automaticDeletion
                            ? "permanently deleted"
                            : "flagged for review"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography gutterBottom>Archive Settings</Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={policy.archiving}
                                onChange={(e) =>
                                  handlePolicyChange(
                                    index,
                                    "archiving",
                                    e.target.checked
                                  )
                                }
                                color="secondary"
                                size="small"
                              />
                            }
                            label="Enable Archiving"
                          />
                        </Box>

                        {policy.archiving && (
                          <>
                            <Typography gutterBottom>
                              Archive after: {policy.archiveAfter} days
                            </Typography>
                            <Slider
                              value={policy.archiveAfter}
                              onChange={(_, value) =>
                                handlePolicyChange(index, "archiveAfter", value)
                              }
                              min={1}
                              max={policy.retention}
                              step={1}
                              disabled={!policy.archiving}
                              marks={[
                                { value: 30, label: "30d" },
                                {
                                  value: Math.min(365, policy.retention),
                                  label: "1y",
                                },
                              ]}
                            />
                            <Typography variant="caption" color="textSecondary">
                              Data will move to archive storage after this
                              period
                            </Typography>
                          </>
                        )}
                      </Grid>
                    </Grid>
                  </Box>

                  {index < retentionPolicies.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  Send notifications before data deletion:{" "}
                  {globalSettings.retentionReminderDays} days
                </Typography>
                <Slider
                  value={globalSettings.retentionReminderDays}
                  onChange={(_, value) =>
                    handleGlobalSettingChange("retentionReminderDays", value)
                  }
                  min={0}
                  max={30}
                  step={1}
                  marks={[
                    { value: 0, label: "Off" },
                    { value: 7, label: "7d" },
                    { value: 14, label: "14d" },
                    { value: 30, label: "30d" },
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Management Actions
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    fullWidth
                    color="error"
                  >
                    Run Manual Cleanup
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<ArchiveIcon />}
                    fullWidth
                  >
                    Force Archive
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    startIcon={<SettingsBackupRestoreIcon />}
                    fullWidth
                  >
                    Restore from Archive
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button variant="outlined" startIcon={<HelpIcon />} fullWidth>
                    Storage Analyzer
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataRetentionSettings;
