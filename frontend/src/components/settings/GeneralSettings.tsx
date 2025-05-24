import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
} from "@mui/material";

const GeneralSettings: React.FC = () => {
  // State for general settings
  const [organizationName, setOrganizationName] = useState(
    "Logware Security, Inc."
  );
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState("12-hour");
  const [language, setLanguage] = useState("en-US");
  const [dashboardRefreshRate, setDashboardRefreshRate] = useState(5);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Available timezones (simplified list)
  const timezones = [
    "UTC",
    "America/New_York", // EST/EDT
    "America/Chicago", // CST/CDT
    "America/Denver", // MST/MDT
    "America/Los_Angeles", // PST/PDT
    "Europe/London", // GMT/BST
    "Europe/Paris", // CET/CEST
    "Asia/Tokyo",
    "Asia/Singapore",
    "Australia/Sydney",
  ];

  // Available date formats
  const dateFormats = [
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "YYYY-MM-DD",
    "YYYY/MM/DD",
    "MMM D, YYYY",
  ];

  // Available languages
  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "ja-JP", name: "Japanese" },
    { code: "ko-KR", name: "Korean" },
  ];

  // Handle save button click
  const handleSave = () => {
    // In a real app, this would save to backend/localstorage
    console.log("Saving general settings:", {
      organizationName,
      timezone,
      dateFormat,
      timeFormat,
      language,
      dashboardRefreshRate,
      autoRefresh,
    });

    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Box>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Organization Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Organization Name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="timezone-label">Timezone</InputLabel>
                    <Select
                      labelId="timezone-label"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      label="Timezone"
                    >
                      {timezones.map((tz) => (
                        <MenuItem key={tz} value={tz}>
                          {tz.replace("_", " ")}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="language-label">Language</InputLabel>
                    <Select
                      labelId="language-label"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      label="Language"
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Display Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="date-format-label">Date Format</InputLabel>
                    <Select
                      labelId="date-format-label"
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      label="Date Format"
                    >
                      {dateFormats.map((format) => (
                        <MenuItem key={format} value={format}>
                          {format}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="time-format-label">Time Format</InputLabel>
                    <Select
                      labelId="time-format-label"
                      value={timeFormat}
                      onChange={(e) => setTimeFormat(e.target.value)}
                      label="Time Format"
                    >
                      <MenuItem value="12-hour">12-hour (AM/PM)</MenuItem>
                      <MenuItem value="24-hour">24-hour</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Dashboard Refresh Rate (minutes)"
                    value={dashboardRefreshRate}
                    onChange={(e) =>
                      setDashboardRefreshRate(Number(e.target.value))
                    }
                    margin="normal"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 1, max: 60 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Enable Auto-Refresh"
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

export default GeneralSettings;
