import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  FormGroup,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  PhoneAndroid as PhoneIcon,
  DesktopWindows as DesktopIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";

// Notification settings types
interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  channels: {
    email: boolean;
    sms: boolean;
    browser: boolean;
  };
}

interface NotificationSettingsState {
  settings: NotificationSetting[];
  emailDigestFrequency: "never" | "daily" | "weekly";
  alertSeverityThreshold: "low" | "medium" | "high" | "critical";
}

/**
 * NotificationSettings component for managing user notification preferences
 */
const NotificationSettings: React.FC = () => {
  // Initial notification settings state
  const [notificationState, setNotificationState] =
    useState<NotificationSettingsState>({
      settings: [
        {
          id: "security_alerts",
          label: "Security Alerts",
          description: "Critical security issues that require your attention",
          channels: { email: true, sms: true, browser: true },
        },
        {
          id: "system_notifications",
          label: "System Notifications",
          description: "System updates, maintenance, and status changes",
          channels: { email: true, sms: false, browser: true },
        },
        {
          id: "compliance_updates",
          label: "Compliance Updates",
          description:
            "Framework updates, assessment reminders, and reporting deadlines",
          channels: { email: true, sms: false, browser: true },
        },
        {
          id: "log_alerts",
          label: "Log Alerts",
          description: "Alerts generated from log analysis",
          channels: { email: true, sms: false, browser: true },
        },
        {
          id: "task_assignments",
          label: "Task Assignments",
          description: "New tasks assigned to you or your team",
          channels: { email: true, sms: false, browser: true },
        },
      ],
      emailDigestFrequency: "daily",
      alertSeverityThreshold: "medium",
    });

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle toggle changes for notification channels
  const handleChannelToggle = (
    settingId: string,
    channel: "email" | "sms" | "browser"
  ) => {
    setNotificationState((prevState) => {
      const newSettings = prevState.settings.map((setting) => {
        if (setting.id === settingId) {
          return {
            ...setting,
            channels: {
              ...setting.channels,
              [channel]: !setting.channels[channel],
            },
          };
        }
        return setting;
      });

      return {
        ...prevState,
        settings: newSettings,
      };
    });
  };

  // Handle email digest frequency change
  const handleDigestFrequencyChange = (event: SelectChangeEvent<string>) => {
    setNotificationState({
      ...notificationState,
      emailDigestFrequency: event.target.value as "never" | "daily" | "weekly",
    });
  };

  // Handle alert severity threshold change
  const handleSeverityThresholdChange = (event: SelectChangeEvent<string>) => {
    setNotificationState({
      ...notificationState,
      alertSeverityThreshold: event.target.value as
        | "low"
        | "medium"
        | "high"
        | "critical",
    });
  };

  // Save notification settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // In a real implementation, this would call an API endpoint
      // to save the user's notification preferences
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call

      setSuccess(true);
    } catch (err) {
      setError("Failed to save notification settings. Please try again.");
      console.error("Error saving notification settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Close success message
  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Notification Preferences
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        message="Notification settings saved successfully"
      />

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Notification Channels
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            Select how you want to be notified for different types of alerts and
            updates.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2} sx={{ mb: 1 }}>
              <Grid item xs={5}>
                <Typography variant="body2" fontWeight="bold">
                  Notification Type
                </Typography>
              </Grid>
              <Grid item xs={7}>
                <Grid container>
                  <Grid item xs={4} sx={{ textAlign: "center" }}>
                    <Chip
                      icon={<EmailIcon fontSize="small" />}
                      label="Email"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: "center" }}>
                    <Chip
                      icon={<PhoneIcon fontSize="small" />}
                      label="SMS"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: "center" }}>
                    <Chip
                      icon={<DesktopIcon fontSize="small" />}
                      label="Browser"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {notificationState.settings.map((setting) => (
              <Box key={setting.id}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={5}>
                    <Typography variant="body1">{setting.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {setting.description}
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Grid container>
                      <Grid item xs={4} sx={{ textAlign: "center" }}>
                        <Switch
                          checked={setting.channels.email}
                          onChange={() =>
                            handleChannelToggle(setting.id, "email")
                          }
                          color="primary"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: "center" }}>
                        <Switch
                          checked={setting.channels.sms}
                          onChange={() =>
                            handleChannelToggle(setting.id, "sms")
                          }
                          color="primary"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: "center" }}>
                        <Switch
                          checked={setting.channels.browser}
                          onChange={() =>
                            handleChannelToggle(setting.id, "browser")
                          }
                          color="primary"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Notification Delivery Settings
          </Typography>

          <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="digest-frequency-label">
                  Email Digest Frequency
                </InputLabel>
                <Select
                  labelId="digest-frequency-label"
                  id="digest-frequency"
                  value={notificationState.emailDigestFrequency}
                  label="Email Digest Frequency"
                  onChange={handleDigestFrequencyChange}
                >
                  <MenuItem value="never">
                    Never (receive individual emails)
                  </MenuItem>
                  <MenuItem value="daily">Daily summary</MenuItem>
                  <MenuItem value="weekly">Weekly summary</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {notificationState.emailDigestFrequency === "never"
                  ? "You will receive individual emails for each notification."
                  : `You will receive a ${notificationState.emailDigestFrequency} summary of all notifications.`}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="severity-threshold-label">
                  Alert Severity Threshold
                </InputLabel>
                <Select
                  labelId="severity-threshold-label"
                  id="severity-threshold"
                  value={notificationState.alertSeverityThreshold}
                  label="Alert Severity Threshold"
                  onChange={handleSeverityThresholdChange}
                >
                  <MenuItem value="low">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <FlagIcon
                        sx={{ mr: 1, color: "info.main" }}
                        fontSize="small"
                      />
                      Low (All alerts)
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <FlagIcon
                        sx={{ mr: 1, color: "warning.main" }}
                        fontSize="small"
                      />
                      Medium and above
                    </Box>
                  </MenuItem>
                  <MenuItem value="high">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <FlagIcon
                        sx={{ mr: 1, color: "error.light" }}
                        fontSize="small"
                      />
                      High and above
                    </Box>
                  </MenuItem>
                  <MenuItem value="critical">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <FlagIcon
                        sx={{ mr: 1, color: "error.dark" }}
                        fontSize="small"
                      />
                      Critical only
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You will only receive alerts at or above the selected severity
                level.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>

        <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={
              isSaving ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardActions>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Notification Schedule
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            Set your quiet hours to pause non-critical notifications.
          </Typography>

          <FormGroup>
            <FormControlLabel
              control={<Switch defaultChecked color="primary" />}
              label="Enable quiet hours"
            />
          </FormGroup>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Start time: <strong>10:00 PM</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                End time: <strong>7:00 AM</strong>
              </Typography>
            </Grid>
          </Grid>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 2 }}
          >
            Note: Critical security alerts will still be delivered during quiet
            hours.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationSettings;
