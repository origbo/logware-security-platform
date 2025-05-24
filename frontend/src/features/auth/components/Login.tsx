/**
 * Login Component
 *
 * Provides user authentication interface with support for
 * password-based login and multi-factor authentication.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  FormControlLabel,
  Checkbox,
  Link,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  SecurityOutlined as SecurityIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Import authentication APIs and state
import {
  useLoginMutation,
  useVerifyMfaMutation,
} from "../services/authService";
import {
  setCredentials,
  setMfaRequired,
  setError,
  clearError,
  selectAuthError,
  selectRequiresMfa,
  selectIsAuthenticated,
  selectAuthLoading,
} from "../authSlice";

const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get authentication state from Redux
  const error = useSelector(selectAuthError);
  const requiresMfa = useSelector(selectRequiresMfa);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);

  // Local state for form values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);

  // API mutations
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [verifyMfa, { isLoading: isVerifyingMfa }] = useVerifyMfaMutation();

  // Get return URL from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && !requiresMfa) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, requiresMfa, navigate, from]);

  // Handle login form submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      dispatch(setError("Username and password are required"));
      return;
    }

    try {
      dispatch(clearError());
      const result = await login({ username, password }).unwrap();

      if (result.requiresMfa) {
        // MFA required, store token and prompt for OTP
        dispatch(
          setMfaRequired({
            requiresMfa: true,
            mfaToken: result.mfaToken,
          })
        );
        setMfaToken(result.mfaToken || null);
      } else {
        // No MFA, login successful
        dispatch(
          setCredentials({
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          })
        );

        // Redirect to original location
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      dispatch(
        setError(err.data?.message || "Failed to log in. Please try again.")
      );
    }
  };

  // Handle MFA verification submission
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || !mfaToken) {
      dispatch(setError("Verification code is required"));
      return;
    }

    try {
      dispatch(clearError());
      const result = await verifyMfa({
        mfaToken: mfaToken,
        otp: otpCode,
      }).unwrap();

      // MFA successful, store credentials
      dispatch(
        setCredentials({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        })
      );

      // Reset MFA state
      dispatch(setMfaRequired({ requiresMfa: false }));

      // Redirect to original location
      navigate(from, { replace: true });
    } catch (err: any) {
      dispatch(
        setError(
          err.data?.message || "Invalid verification code. Please try again."
        )
      );
    }
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        padding: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 450,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Logware Security
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {requiresMfa
              ? "Two-Factor Authentication"
              : "Sign in to your account"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!requiresMfa ? (
          // Login Form
          <Box component="form" onSubmit={handleLoginSubmit}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoggingIn}
              autoFocus
              required
            />

            <TextField
              label="Password"
              fullWidth
              margin="normal"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoggingIn}
              required
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

            <Box
              sx={{
                mt: 2,
                mb: 3,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                  />
                }
                label="Remember me"
              />

              <Link href="/forgot-password" underline="hover">
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoggingIn}
              sx={{ mb: 2 }}
            >
              {isLoggingIn ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </Box>
        ) : (
          // MFA Form
          <Box component="form" onSubmit={handleMfaSubmit}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <SecurityIcon color="primary" sx={{ fontSize: 48 }} />
              <Typography variant="h6" gutterBottom>
                Verification Required
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter the 6-digit code from your authenticator app
              </Typography>
            </Box>

            <TextField
              label="Verification Code"
              fullWidth
              margin="normal"
              variant="outlined"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={isVerifyingMfa}
              autoFocus
              placeholder="000000"
              inputProps={{
                maxLength: 6,
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isVerifyingMfa}
              sx={{ mt: 3, mb: 2 }}
            >
              {isVerifyingMfa ? <CircularProgress size={24} /> : "Verify"}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => dispatch(setMfaRequired({ requiresMfa: false }))}
              disabled={isVerifyingMfa}
            >
              Back to Login
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          Don't have an account? Contact your administrator.
        </Typography>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        © {new Date().getFullYear()} Logware Security Platform
      </Typography>
    </Box>
  );
};

export default Login;
