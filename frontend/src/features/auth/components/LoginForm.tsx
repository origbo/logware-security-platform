import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Link,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import useAuth from "../hooks/useAuth";
import { LoginCredentials } from "../../../services/api/authService";
import {
  logEvent,
  ErrorCategory,
} from "../../../services/analytics/errorAnalyticsService";
import { useSelector } from "react-redux";
import {
  selectRequire2FA,
  selectUserId,
  selectVerificationId,
} from "../slice/authSlice";

/**
 * Login form component for user authentication
 * Provides email/password login functionality with validation
 */
const LoginForm: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { login, error, loading, clearError } = useAuth();

  // Get MFA state from Redux
  const require2FA = useSelector(selectRequire2FA);
  const userId = useSelector(selectUserId);
  const verificationId = useSelector(selectVerificationId);

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  // Clear any auth errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });

    // Clear field-specific error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Handle remember me checkbox
  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked);
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors = {
      email: "",
      password: "",
    };

    // Validate email
    if (!credentials.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = "Email is invalid";
    }

    // Validate password
    if (!credentials.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);

    // Form is valid if no error messages
    return !errors.email && !errors.password;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Log login attempt
    logEvent({
      category: ErrorCategory.AUTH,
      action: "login_attempt",
      data: { email: credentials.email },
    });

    if (rememberMe) {
      // Store email in localStorage for "remember me" functionality
      localStorage.setItem("logware_remembered_email", credentials.email);
    } else {
      localStorage.removeItem("logware_remembered_email");
    }

    try {
      const success = await login(credentials);

      if (success) {
        // Log successful login if MFA not required
        if (!require2FA) {
          logEvent({
            category: ErrorCategory.AUTH,
            action: "login_success",
            label: "direct_login",
          });
        }
      }
    } catch (err) {
      // Error will be handled by the auth slice
      logEvent({
        category: ErrorCategory.AUTH,
        action: "login_error",
        error: err,
      });
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("logware_remembered_email");
    if (rememberedEmail) {
      setCredentials((prev) => ({
        ...prev,
        email: rememberedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  // Redirect to MFA verification if needed
  useEffect(() => {
    if (require2FA && userId && verificationId) {
      // Log the MFA requirement event
      logEvent({
        category: ErrorCategory.AUTH,
        action: "mfa_required",
        label: "login_form",
      });

      // Navigate to MFA verification page
      navigate("/auth/two-factor");
    }
  }, [require2FA, userId, verificationId, navigate]);

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 450, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Sign in to Logware
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus={!credentials.email}
            value={credentials.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={loading}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Grid container sx={{ mt: 2, mb: 2 }}>
            <Grid item xs>
              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    color="primary"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    disabled={loading}
                  />
                }
                label="Remember me"
              />
            </Grid>
            <Grid item>
              <Link
                component={RouterLink}
                to="/auth/forgot-password"
                variant="body2"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  color: theme.palette.primary.main,
                }}
              >
                Forgot password?
              </Link>
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              mt: 2,
              mb: 2,
              py: 1.5,
              position: "relative",
            }}
          >
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: "absolute",
                  left: "50%",
                  marginLeft: "-12px",
                }}
              />
            )}
            {!loading && "Sign In"}
          </Button>

          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <Grid item>
              <Typography variant="body2" sx={{ display: "inline" }}>
                Don't have an account?{" "}
              </Typography>
              <Link
                component={RouterLink}
                to="/auth/register"
                variant="body2"
                sx={{ color: theme.palette.primary.main }}
              >
                Sign Up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;
