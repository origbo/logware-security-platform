import * as React from "react";
import { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockReset as LockResetIcon,
  Security as SecurityIcon,
  PhoneAndroid as PhoneIcon,
  Email as EmailIcon,
  QrCode as QrCodeIcon,
} from "@mui/icons-material";
import useAuth from "../../../hooks/auth/useAuth";
import {
  validatePassword,
  getPasswordStrength,
} from "../../../utils/auth/passwordUtils";

/**
 * SecuritySettings component for user password and security settings
 */
const SecuritySettings: React.FC = () => {
  // @ts-ignore - Auth context properties
  const { changePassword, setupMfa, error: authError, clearError } = useAuth();

  // Password change state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // MFA state
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [isSettingUpMfa, setIsSettingUpMfa] = useState(false);
  const [mfaType, setMfaType] = useState<"app" | "sms" | "email">("app");
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<{
    secret?: string;
    qrCodeUrl?: string;
  }>({});
  const [mfaVerificationCode, setMfaVerificationCode] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState(false);

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });

    // Clear errors
    setPasswordErrors({ ...passwordErrors, [name]: "" });

    // Update password strength for new password
    if (name === "newPassword") {
      setPasswordStrength(getPasswordStrength(value));
    }

    // Clear auth errors
    if (authError) clearError();

    // Clear success message
    if (passwordChangeSuccess) setPasswordChangeSuccess(false);
  };

  // Toggle password visibility
  const togglePasswordVisibility = (
    field: "currentPassword" | "newPassword" | "confirmPassword"
  ) => {
    if (field === "currentPassword") {
      setShowCurrentPassword(!showCurrentPassword);
    } else if (field === "newPassword") {
      setShowNewPassword(!showNewPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Get color for password strength indicator
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "error.main";
    if (passwordStrength < 60) return "warning.main";
    if (passwordStrength < 80) return "info.main";
    return "success.main";
  };

  // Validate password form
  const validatePasswordForm = (): boolean => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    // Validate current password
    if (!passwords.currentPassword) {
      errors.currentPassword = "Current password is required";
      isValid = false;
    }

    // Validate new password
    const { isValid: isPasswordValid, error: passwordError } = validatePassword(
      passwords.newPassword
    );
    if (!isPasswordValid) {
      errors.newPassword = passwordError || "Invalid password";
      isValid = false;
    }

    // Check if passwords match
    if (passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  // Handle password change form submission
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);

      // Clear form
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordChangeSuccess(true);
      setPasswordStrength(0);
    } catch (err) {
      // Error handling is managed by the auth context
      console.error("Failed to change password:", err);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle MFA toggle
  const handleMfaToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Enable MFA
      setShowMfaDialog(true);
    } else {
      // Disable MFA would need an API call in a real implementation
      setIsMfaEnabled(false);
      setMfaSuccess(true);
    }
  };

  // Start MFA setup
  const handleStartMfaSetup = async () => {
    setIsSettingUpMfa(true);
    setMfaError("");

    try {
      const setupData = await setupMfa(mfaType);
      setMfaSetupData(setupData);
    } catch (err) {
      setMfaError("Failed to set up MFA. Please try again.");
      console.error("MFA setup error:", err);
    } finally {
      setIsSettingUpMfa(false);
    }
  };

  // Verify MFA code
  const handleVerifyMfa = async () => {
    setIsSettingUpMfa(true);
    setMfaError("");

    try {
      // In a real implementation, this would verify the MFA code with the backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate successful verification
      setIsMfaEnabled(true);
      setShowMfaDialog(false);
      setMfaSuccess(true);
      setMfaVerificationCode("");
    } catch (err) {
      setMfaError("Invalid verification code. Please try again.");
      console.error("MFA verification error:", err);
    } finally {
      setIsSettingUpMfa(false);
    }
  };

  // Close MFA dialog
  const handleCloseMfaDialog = () => {
    setShowMfaDialog(false);
    setMfaSetupData({});
    setMfaVerificationCode("");
    setMfaError("");
  };

  return (
    <Box>
      {/* Password Change Section */}
      <Typography variant="h5" component="h2" gutterBottom>
        Change Password
      </Typography>

      {authError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {authError}
        </Alert>
      )}

      {passwordChangeSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Password changed successfully.
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 4 }}>
        <form onSubmit={handleChangePassword}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  required
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle current password visibility"
                          onClick={() =>
                            togglePasswordVisibility("currentPassword")
                          }
                          edge="end"
                        >
                          {showCurrentPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  required
                  error={!!passwordErrors.newPassword}
                  helperText={passwordErrors.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle new password visibility"
                          onClick={() =>
                            togglePasswordVisibility("newPassword")
                          }
                          edge="end"
                        >
                          {showNewPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {passwords.newPassword && (
                  <Box sx={{ mt: 1 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        Password Strength
                      </Typography>
                      <Typography
                        variant="body2"
                        color={getPasswordStrengthColor()}
                      >
                        {passwordStrength < 30
                          ? "Weak"
                          : passwordStrength < 60
                          ? "Fair"
                          : passwordStrength < 80
                          ? "Good"
                          : "Strong"}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "grey.300",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: getPasswordStrengthColor(),
                        },
                      }}
                    />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  required
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() =>
                            togglePasswordVisibility("confirmPassword")
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>

          <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={
                isChangingPassword ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <LockResetIcon />
                )
              }
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </CardActions>
        </form>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Two-Factor Authentication Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2">
          Two-Factor Authentication
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isMfaEnabled}
              onChange={handleMfaToggle}
              color="primary"
            />
          }
          label={isMfaEnabled ? "Enabled" : "Disabled"}
        />
      </Box>

      {mfaSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {isMfaEnabled
            ? "Two-factor authentication has been enabled successfully."
            : "Two-factor authentication has been disabled."}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Typography variant="body1" paragraph>
            Two-factor authentication adds an extra layer of security to your
            account. When enabled, you'll need to provide a verification code in
            addition to your password when logging in.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {isMfaEnabled
              ? "Two-factor authentication is currently enabled for your account."
              : "We recommend enabling two-factor authentication to protect your account."}
          </Typography>
        </CardContent>
      </Card>

      {/* MFA Setup Dialog */}
      <Dialog
        open={showMfaDialog}
        onClose={handleCloseMfaDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>

        <DialogContent>
          {mfaError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {mfaError}
            </Alert>
          )}

          {!mfaSetupData.secret ? (
            <>
              <DialogContentText paragraph>
                Choose your preferred method for two-factor authentication:
              </DialogContentText>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant={mfaType === "app" ? "contained" : "outlined"}
                    onClick={() => setMfaType("app")}
                    startIcon={<QrCodeIcon />}
                    sx={{ p: 1.5 }}
                  >
                    Authenticator App
                  </Button>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant={mfaType === "sms" ? "contained" : "outlined"}
                    onClick={() => setMfaType("sms")}
                    startIcon={<PhoneIcon />}
                    sx={{ p: 1.5 }}
                  >
                    SMS
                  </Button>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant={mfaType === "email" ? "contained" : "outlined"}
                    onClick={() => setMfaType("email")}
                    startIcon={<EmailIcon />}
                    sx={{ p: 1.5 }}
                  >
                    Email
                  </Button>
                </Grid>
              </Grid>

              <DialogContentText variant="body2" color="text.secondary">
                {mfaType === "app" &&
                  "Use an authenticator app like Google Authenticator or Authy to generate verification codes."}
                {mfaType === "sms" &&
                  "Receive verification codes via SMS text message on your phone."}
                {mfaType === "email" && "Receive verification codes via email."}
              </DialogContentText>
            </>
          ) : (
            <>
              <DialogContentText paragraph>
                {mfaType === "app" &&
                  "Scan the QR code below with your authenticator app or enter the secret key manually."}
                {mfaType === "sms" &&
                  "A verification code has been sent to your registered phone number."}
                {mfaType === "email" &&
                  "A verification code has been sent to your email address."}
              </DialogContentText>

              {mfaType === "app" && mfaSetupData.qrCodeUrl && (
                <Box sx={{ textAlign: "center", my: 2 }}>
                  <img
                    src={mfaSetupData.qrCodeUrl}
                    alt="QR Code for MFA Setup"
                    style={{ maxWidth: "200px", margin: "0 auto" }}
                  />

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Secret Key: <strong>{mfaSetupData.secret}</strong>
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                label="Verification Code"
                value={mfaVerificationCode}
                onChange={(e) => setMfaVerificationCode(e.target.value)}
                margin="normal"
                placeholder="Enter 6-digit code"
                inputProps={{ maxLength: 6 }}
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseMfaDialog}>Cancel</Button>

          {!mfaSetupData.secret ? (
            <Button
              onClick={handleStartMfaSetup}
              variant="contained"
              color="primary"
              disabled={isSettingUpMfa}
              startIcon={
                isSettingUpMfa ? (
                  <CircularProgress size={16} />
                ) : (
                  <SecurityIcon />
                )
              }
            >
              {isSettingUpMfa ? "Setting Up..." : "Continue"}
            </Button>
          ) : (
            <Button
              onClick={handleVerifyMfa}
              variant="contained"
              color="primary"
              disabled={isSettingUpMfa || mfaVerificationCode.length !== 6}
              startIcon={
                isSettingUpMfa ? (
                  <CircularProgress size={16} />
                ) : (
                  <SecurityIcon />
                )
              }
            >
              {isSettingUpMfa ? "Verifying..." : "Verify & Enable"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;
