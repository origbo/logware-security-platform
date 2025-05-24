import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Container,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import useAuth from "../../hooks/auth/useAuth";
import { LoginCredentials } from "../../services/auth/authService";

// Define authentication response interface including MFA properties
interface AuthResponse {
  user?: any;
  token?: string;
  requiresMfa?: boolean;
  mfaToken?: string;
  mfaMethods?: string[];
}

// Login page component
const LoginPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const location = useLocation();
  // @ts-ignore - Auth context properties
  const { login, error, clearError, isLoading, verifyMfa: verify2FA } = useAuth();

  // Form state
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: "",
    password: "",
  });

  // MFA state (for when MFA is required)
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [mfaMethods, setMfaMethods] = useState<string[]>([]);

  // Redirect destination after login
  const from = location.state?.from?.pathname || "/dashboard";

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    // Update form state
    if (name === "rememberMe") {
      setCredentials({ ...credentials, [name]: checked });
    } else {
      setCredentials({ ...credentials, [name]: value });
    }

    // Clear specific field error
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }

    // Clear any auth context error
    if (error) {
      clearError();
    }
  };

  // Handle MFA code input
  const handleMfaCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMfaCode(e.target.value);
    // Clear any auth context error
    if (error) {
      clearError();
    }
  };

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors = {
      username: "",
      password: "",
    };
    let isValid = true;

    if (!credentials.username.trim()) {
      errors.username = "Username is required";
      isValid = false;
    }

    if (!credentials.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (credentials.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If MFA is required, don't validate the form again
    if (requiresMfa) {
      if (!mfaCode) {
        return;
      }

      try {
        await verifyMfa();
        // Navigate to intended destination after successful login
        navigate(from, { replace: true });
      } catch (err) {
        // Error handling is done by the auth context
        console.error("MFA verification failed:", err);
      }
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await login(credentials);

      // After login, check if we need to show MFA form
      // In a real implementation, this information would be in the auth state
      // For this example, we'll use the requiresMfa state
      if (requiresMfa) {
        // MFA token and methods would come from the auth state in a real implementation
        return;
      }

      // Navigate to intended destination after successful login
      navigate(from, { replace: true });
    } catch (err) {
      // Error handling is done by the auth context
      console.error("Login failed:", err);
    }
  };

  // Handle MFA verification
  const verifyMfa = async () => {
    try {
      // Use the auth context's verifyMfa function that we aliased as verify2FA
      await verify2FA(credentials.username, mfaCode, mfaToken);

      // Reset MFA state
      setRequiresMfa(false);
      setMfaCode("");
      setMfaToken("");
      setMfaMethods([]);

      return true;
    } catch (err) {
      console.error("MFA verification failed:", err);
      return false;
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Grid container component="div" sx={{ height: "100vh" }}>
        {/* Left side - Login Form */}
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: 4,
          }}
        >
          <Box
            sx={{
              my: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h4" gutterBottom>
              {requiresMfa ? "Two-Factor Authentication" : "Log In"}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {requiresMfa
                ? "Enter the verification code from your authenticator app"
                : "Sign in to your Logware account"}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 2, width: "100%" }}
            >
              {requiresMfa ? (
                // MFA Form
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="mfaCode"
                    label="Verification Code"
                    name="mfaCode"
                    autoComplete="one-time-code"
                    autoFocus
                    value={mfaCode}
                    onChange={handleMfaCodeChange}
                    inputProps={{ maxLength: 6 }}
                    placeholder="******"
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Enter the 6-digit code from your authenticator app
                  </Typography>
                </>
              ) : (
                // Login Form
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username or Email"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={credentials.username}
                    onChange={handleChange}
                    error={!!formErrors.username}
                    helperText={formErrors.username}
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
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

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          value="remember"
                          name="rememberMe"
                          color="primary"
                          checked={credentials.rememberMe}
                          onChange={handleChange}
                        />
                      }
                      label="Remember me"
                    />

                    <Link
                      to="/forgot-password"
                      style={{
                        textDecoration: "none",
                        color: theme.palette.primary.main,
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>
                </>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={requiresMfa ? <SecurityIcon /> : <LoginIcon />}
                disabled={isLoading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : requiresMfa ? (
                  "Verify"
                ) : (
                  "Sign In"
                )}
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Right side - Logo & Info */}
        {!isMobile && (
          <Grid
            item
            sm={4}
            md={7}
            sx={{
              backgroundImage: "url(/assets/images/login-background.jpg)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              color: "white",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1,
              }}
            />

            <Box
              sx={{
                zIndex: 2,
                p: 4,
                textAlign: "center",
                maxWidth: "80%",
              }}
            >
              <Typography
                component="h1"
                variant="h3"
                color="inherit"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                Logware Security Platform
              </Typography>

              <Typography variant="h6" color="inherit" paragraph>
                Comprehensive security operations and compliance management for
                modern enterprises
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default LoginPage;
