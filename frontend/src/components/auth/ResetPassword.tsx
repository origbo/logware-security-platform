import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  LinearProgress,
  useTheme,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import useAuth from "../../hooks/auth/useAuth";
import {
  validatePassword,
  PasswordRequirement,
  getPasswordStrength,
} from "../../utils/auth/passwordUtils";

// ResetPassword component
const ResetPassword: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useParams();
  // @ts-ignore - Auth context properties
  const { resetPassword, error, clearError, isLoading } = useAuth();

  // Form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordRequirements, setPasswordRequirements] = useState<
    PasswordRequirement[]
  >([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  // Check token presence
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  // Update password requirements and strength when password changes
  useEffect(() => {
    if (password) {
      const { requirements } = validatePassword(password);
      setPasswordRequirements(requirements);
      setPasswordStrength(getPasswordStrength(password));
    } else {
      setPasswordRequirements([]);
      setPasswordStrength(0);
    }
  }, [password]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError("");
    if (confirmPassword && e.target.value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else if (confirmPassword) {
      setConfirmPasswordError("");
    }
    if (error) clearError();
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    if (password && e.target.value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
    if (error) clearError();
  };

  // Get color for password strength indicator
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return theme.palette.error.main;
    if (passwordStrength < 60) return theme.palette.warning.main;
    if (passwordStrength < 80) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;

    // Check password
    const { isValid: isPasswordValid, error: passwordValidationError } =
      validatePassword(password);
    if (!isPasswordValid) {
      setPasswordError(passwordValidationError || "Invalid password");
      isValid = false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      if (token) {
        await resetPassword(token, password);
        setSubmitted(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setTokenValid(false);
      }
    } catch (err) {
      // Error handling is managed by the auth context
      console.error("Failed to reset password:", err);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {!tokenValid ? (
            // Invalid token message
            <Box sx={{ textAlign: "center" }}>
              <Typography component="h1" variant="h5" gutterBottom>
                Invalid or Expired Link
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                This password reset link is invalid or has expired. Please
                request a new password reset link.
              </Typography>

              <Button
                component={Link}
                to="/forgot-password"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Request New Link
              </Button>

              <Box sx={{ mt: 3 }}>
                <Link
                  to="/login"
                  style={{
                    textDecoration: "none",
                    color: theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Back to Login
                </Link>
              </Box>
            </Box>
          ) : submitted ? (
            // Success message after submission
            <Box sx={{ textAlign: "center" }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />

              <Typography component="h1" variant="h5" gutterBottom>
                Password Reset Successful
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                Your password has been successfully reset. You will be
                redirected to the login page shortly.
              </Typography>

              <Button
                component={Link}
                to="/login"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            // Password reset form
            <>
              <Typography component="h1" variant="h5" gutterBottom>
                Reset Your Password
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 3 }}
              >
                Please enter your new password below.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ width: "100%" }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={handlePasswordChange}
                  error={!!passwordError}
                  helperText={passwordError}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {password && (
                  <Box sx={{ mb: 2, mt: 1 }}>
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
                        backgroundColor: theme.palette.grey[300],
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: getPasswordStrengthColor(),
                        },
                      }}
                    />

                    <Box sx={{ mt: 2 }}>
                      {passwordRequirements.map((req) => (
                        <Typography
                          key={req.id}
                          variant="caption"
                          sx={{
                            display: "block",
                            color: req.valid
                              ? theme.palette.success.main
                              : theme.palette.text.secondary,
                            mb: 0.5,
                          }}
                        >
                          {req.valid ? "✓" : "○"} {req.text}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  error={!!confirmPasswordError}
                  helperText={confirmPasswordError}
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={toggleConfirmPasswordVisibility}
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Link
                    to="/login"
                    style={{
                      textDecoration: "none",
                      color: theme.palette.primary.main,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Back to Login
                  </Link>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;
