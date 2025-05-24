import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  TextField,
  Slider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const NotificationSettings: React.FC = () => {
  // State for notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [teamsNotifications, setTeamsNotifications] = useState(false);

  // State for notification frequency
  const [notificationFrequency, setNotificationFrequency] =
    useState("realtime");

  // State for notification thresholds
  const [severityThreshold, setSeverityThreshold] = useState("info");

  // State for email addresses
  const [emailAddresses, setEmailAddresses] = useState([
    "admin@example.com",
    "security@example.com",
  ]);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // State for phone numbers
  const [phoneNumbers, setPhoneNumbers] = useState(["+1 (555) 123-4567"]);
  const [newPhone, setNewPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // State for notification categories
  const [notificationCategories, setNotificationCategories] = useState({
    securityAlerts: true,
    complianceAlerts: true,
    systemAlerts: true,
    userActivity: false,
    auditLogs: false,
    performanceAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
  });

  // State for daily digest time
  const [digestTime, setDigestTime] = useState("09:00");

  // State for quiet hours
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");

  // Success alert state
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle adding a new email
  const handleAddEmail = () => {
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (emailAddresses.includes(newEmail)) {
      setEmailError("This email address is already in the list");
      return;
    }

    setEmailAddresses([...emailAddresses, newEmail]);
    setNewEmail("");
    setEmailError("");
  };

  // Handle removing an email
  const handleRemoveEmail = (email: string) => {
    setEmailAddresses(emailAddresses.filter((e) => e !== email));
  };

  // Handle adding a new phone number
  const handleAddPhone = () => {
    // Simple phone validation (this could be improved)
    const phoneRegex = /^\+?[0-9\s\-()]{10,20}$/;

    if (!phoneRegex.test(newPhone)) {
      setPhoneError("Please enter a valid phone number");
      return;
    }

    if (phoneNumbers.includes(newPhone)) {
      setPhoneError("This phone number is already in the list");
      return;
    }

    setPhoneNumbers([...phoneNumbers, newPhone]);
    setNewPhone("");
    setPhoneError("");
  };

  // Handle removing a phone number
  const handleRemovePhone = (phone: string) => {
    setPhoneNumbers(phoneNumbers.filter((p) => p !== phone));
  };

  // Handle notification category change
  const handleCategoryChange = (
    category: keyof typeof notificationCategories
  ) => {
    setNotificationCategories({
      ...notificationCategories,
      [category]: !notificationCategories[category],
    });
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <ErrorIcon color="error" />;
      case "medium":
      case "warning":
        return <WarningIcon color="warning" />;
      case "low":
      case "info":
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Handle save button click
  const handleSave = () => {
    // In a real app, this would save to backend
    console.log("Saving notification settings:", {
      emailNotifications,
      browserNotifications,
      smsNotifications,
      pushNotifications,
      slackNotifications,
      teamsNotifications,
      notificationFrequency,
      severityThreshold,
      emailAddresses,
      phoneNumbers,
      notificationCategories,
      digestTime,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
    });

    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Box>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Notification settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Notification Methods */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Methods
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailNotifications}
                        onChange={(e) =>
                          setEmailNotifications(e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={browserNotifications}
                        onChange={(e) =>
                          setBrowserNotifications(e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label="Browser Notifications"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="SMS Notifications"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Mobile Push Notifications"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={slackNotifications}
                        onChange={(e) =>
                          setSlackNotifications(e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label="Slack Notifications"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={teamsNotifications}
                        onChange={(e) =>
                          setTeamsNotifications(e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label="Microsoft Teams Notifications"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                Email Recipients
              </Typography>

              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
                <TextField
                  size="small"
                  label="Add Email Address"
                  variant="outlined"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  error={!!emailError}
                  helperText={emailError}
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddEmail}
                  startIcon={<AddIcon />}
                  disabled={!newEmail}
                >
                  Add
                </Button>
              </Box>

              <Box sx={{ mb: 3 }}>
                {emailAddresses.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    onDelete={() => handleRemoveEmail(email)}
                    color="primary"
                    variant="outlined"
                    icon={<EmailIcon />}
                    sx={{ m: 0.5 }}
                  />
                ))}
                {emailAddresses.length === 0 && (
                  <Typography variant="body2" color="textSecondary">
                    No email recipients added
                  </Typography>
                )}
              </Box>

              {smsNotifications && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                    SMS Recipients
                  </Typography>

                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}
                  >
                    <TextField
                      size="small"
                      label="Add Phone Number"
                      variant="outlined"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      error={!!phoneError}
                      helperText={phoneError}
                      placeholder="+1 (555) 123-4567"
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleAddPhone}
                      startIcon={<AddIcon />}
                      disabled={!newPhone}
                    >
                      Add
                    </Button>
                  </Box>

                  <Box>
                    {phoneNumbers.map((phone) => (
                      <Chip
                        key={phone}
                        label={phone}
                        onDelete={() => handleRemovePhone(phone)}
                        color="secondary"
                        variant="outlined"
                        icon={<PhoneIcon />}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                    {phoneNumbers.length === 0 && (
                      <Typography variant="body2" color="textSecondary">
                        No phone numbers added
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="notification-frequency-label">
                  Notification Frequency
                </InputLabel>
                <Select
                  labelId="notification-frequency-label"
                  value={notificationFrequency}
                  onChange={(e) => setNotificationFrequency(e.target.value)}
                  label="Notification Frequency"
                >
                  <MenuItem value="realtime">Real-time (Immediate)</MenuItem>
                  <MenuItem value="hourly">Hourly Digest</MenuItem>
                  <MenuItem value="daily">Daily Digest</MenuItem>
                  <MenuItem value="weekly">Weekly Digest</MenuItem>
                </Select>
              </FormControl>

              {(notificationFrequency === "daily" ||
                notificationFrequency === "hourly") && (
                <TextField
                  fullWidth
                  label="Digest Time"
                  type="time"
                  value={digestTime}
                  onChange={(e) => setDigestTime(e.target.value)}
                  margin="normal"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ mt: 2 }}
                />
              )}

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="severity-threshold-label">
                  Minimum Severity
                </InputLabel>
                <Select
                  labelId="severity-threshold-label"
                  value={severityThreshold}
                  onChange={(e) => setSeverityThreshold(e.target.value)}
                  label="Minimum Severity"
                >
                  <MenuItem value="critical">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ErrorIcon color="error" sx={{ mr: 1 }} />
                      Critical Only
                    </Box>
                  </MenuItem>
                  <MenuItem value="high">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ErrorIcon color="error" sx={{ mr: 1 }} />
                      High and above
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <WarningIcon color="warning" sx={{ mr: 1 }} />
                      Medium and above
                    </Box>
                  </MenuItem>
                  <MenuItem value="low">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <InfoIcon color="info" sx={{ mr: 1 }} />
                      Low and above
                    </Box>
                  </MenuItem>
                  <MenuItem value="info">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <InfoIcon color="info" sx={{ mr: 1 }} />
                      All Severities (including Info)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={quietHoursEnabled}
                      onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable Quiet Hours"
                />

                {quietHoursEnabled && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Start Time"
                        type="time"
                        value={quietHoursStart}
                        onChange={(e) => setQuietHoursStart(e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="End Time"
                        type="time"
                        value={quietHoursEnd}
                        onChange={(e) => setQuietHoursEnd(e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Categories */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Categories
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationCategories.securityAlerts}
                        onChange={() => handleCategoryChange("securityAlerts")}
                        color="primary"
                      />
                    }
                    label="Security Alerts"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationCategories.complianceAlerts}
                        onChange={() =>
                          handleCategoryChange("complianceAlerts")
                        }
                        color="primary"
                      />
                    }
                    label="Compliance Alerts"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationCategories.systemAlerts}
                        onChange={() => handleCategoryChange("systemAlerts")}
                        color="primary"
                      />
                    }
                    label="System Alerts"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationCategories.userActivity}
                        onChange={() => handleCategoryChange("userActivity")}
                        color="primary"
                      />
                    }
                    label="User Activity"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationCategories.auditLogs}
                        onChange={() => handleCategoryChange("auditLogs")}
                        color="primary"
                      />
                    }
                    label="Audit Logs"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationCategories.performanceAlerts}
                        onChange={() =>
                          handleCategoryChange("performanceAlerts")
                        }
                        color="primary"
                      />
                    }
                    label="Performance Alerts"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationCategories.weeklyReports}
                        onChange={() => handleCategoryChange("weeklyReports")}
                        color="primary"
                      />
                    }
                    label="Weekly Reports"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationCategories.monthlyReports}
                        onChange={() => handleCategoryChange("monthlyReports")}
                        color="primary"
                      />
                    }
                    label="Monthly Reports"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NotificationSettings;
