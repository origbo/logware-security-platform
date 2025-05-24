import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import {
  PersonOutline as PersonIcon,
  LockOutlined as LockIcon,
  SecurityOutlined as SecurityIcon,
  SaveOutlined as SaveIcon,
} from "@mui/icons-material";
import useAuth from "../features/auth/hooks/useAuth";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Tab Panel component for the profile page tabs
 */
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

/**
 * Profile Page Component
 *
 * Allows users to view and update their profile information,
 * change their password, and manage security settings like 2FA
 */
const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const {
    user,
    updateProfile,
    changePassword,
    toggle2FA,
    loading,
    error,
    success,
  } = useAuth();

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({
    profile: {
      firstName: "",
      lastName: "",
      email: "",
    },
    password: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });

    // Clear field-specific error
    setFormErrors({
      ...formErrors,
      profile: {
        ...formErrors.profile,
        [name]: "",
      },
    });
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });

    // Clear field-specific error
    setFormErrors({
      ...formErrors,
      password: {
        ...formErrors.password,
        [name]: "",
      },
    });
  };

  // Validate profile form
  const validateProfileForm = (): boolean => {
    const errors = {
      firstName: "",
      lastName: "",
      email: "",
    };

    // Validate first name
    if (!profileData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    // Validate last name
    if (!profileData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    // Validate email
    if (!profileData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = "Email is invalid";
    }

    setFormErrors({
      ...formErrors,
      profile: errors,
    });

    // Form is valid if no error messages
    return !Object.values(errors).some((error) => !!error);
  };

  // Validate password form
  const validatePasswordForm = (): boolean => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Validate current password
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    // Validate new password
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    // Validate confirm password
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors({
      ...formErrors,
      password: errors,
    });

    // Form is valid if no error messages
    return !Object.values(errors).some((error) => !!error);
  };

  // Handle profile save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    await updateProfile(profileData);
  };

  // Handle password save
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    const success = await changePassword(passwordData);

    if (success) {
      // Clear password fields after successful change
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  // Handle 2FA toggle
  const handle2FAToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await toggle2FA(e.target.checked);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              icon={<PersonIcon />}
              label="Personal Info"
              id="profile-tab-0"
              aria-controls="profile-tabpanel-0"
            />
            <Tab
              icon={<LockIcon />}
              label="Password"
              id="profile-tab-1"
              aria-controls="profile-tabpanel-1"
            />
            <Tab
              icon={<SecurityIcon />}
              label="Security"
              id="profile-tab-2"
              aria-controls="profile-tabpanel-2"
            />
          </Tabs>
        </Box>

        {/* Success and Error Alerts */}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Personal Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleProfileSave}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  error={!!formErrors.profile.firstName}
                  helperText={formErrors.profile.firstName}
                  disabled={loading}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  error={!!formErrors.profile.lastName}
                  helperText={formErrors.profile.lastName}
                  disabled={loading}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  error={!!formErrors.profile.email}
                  helperText={formErrors.profile.email}
                  disabled={loading}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Password Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handlePasswordSave}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  error={!!formErrors.password.currentPassword}
                  helperText={formErrors.password.currentPassword}
                  disabled={loading}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={!!formErrors.password.newPassword}
                  helperText={
                    formErrors.password.newPassword ||
                    "Minimum 8 characters with letters, numbers & symbols"
                  }
                  disabled={loading}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={!!formErrors.password.confirmPassword}
                  helperText={formErrors.password.confirmPassword}
                  disabled={loading}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <SaveIcon />
                  }
                >
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                        Two-Factor Authentication (2FA)
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Add an extra layer of security to your account by
                        requiring both your password and a verification code
                        from your phone.
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user?.twoFactorEnabled || false}
                          onChange={handle2FAToggle}
                          disabled={loading}
                          color="primary"
                        />
                      }
                      label={user?.twoFactorEnabled ? "Enabled" : "Disabled"}
                      labelPlacement="start"
                    />
                  </Box>
                </CardContent>
              </Card>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Active Sessions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage devices and locations where you're currently logged in.
              </Typography>

              <Card variant="outlined">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        Current Session
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : "Unknown"}{" "}
                        • Current device
                      </Typography>
                    </Box>
                    <Box>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {}}
                        size="small"
                      >
                        End Session
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
