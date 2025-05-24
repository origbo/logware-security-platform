import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import useAuth from "../../hooks/auth/useAuth";

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ForgotPassword component
const ForgotPassword: React.FC = () => {
  const theme = useTheme();
  // @ts-ignore - Auth context properties
  const { requestPasswordReset, error, clearError, isLoading } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Handle email input changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);

    // Clear errors when user types
    if (emailError) setEmailError("");
    if (error) clearError();
  };

  // Validate email
  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }

    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validateEmail()) {
      return;
    }

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      // Error handling is managed by the auth context
      console.error("Failed to request password reset:", err);
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
          {submitted ? (
            // Success message after submission
            <Box sx={{ textAlign: "center" }}>
              <EmailIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />

              <Typography component="h1" variant="h5" gutterBottom>
                Check Your Email
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                We've sent instructions to reset your password to{" "}
                <strong>{email}</strong>. Please check your inbox and follow the
                instructions in the email.
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                If you don't receive an email within a few minutes, check your
                spam folder or try again with a different email address.
              </Typography>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
          ) : (
            // Password reset request form
            <>
              <Typography component="h1" variant="h5" gutterBottom>
                Forgot Password
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 3 }}
              >
                Enter your email address and we'll send you instructions to
                reset your password.
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
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={handleEmailChange}
                  error={!!emailError}
                  helperText={emailError}
                  disabled={isLoading}
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

export default ForgotPassword;
