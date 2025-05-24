import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Link,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * Forgot Password component
 * Allows users to request a password reset email
 */
const ForgotPassword: React.FC = () => {
  const theme = useTheme();
  const { forgotPassword, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Clear any auth errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setFormError("");
    setSuccessMessage("");
  };

  // Validate email format
  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setFormError("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError("Email is invalid");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    const success = await forgotPassword(email);

    if (success) {
      setSuccessMessage(
        "Password reset instructions have been sent to your email"
      );
      setEmail("");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 450, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
          Forgot Password
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 3 }}
        >
          Enter your email address and we'll send you instructions to reset your
          password
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
            {successMessage}
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
            autoFocus
            value={email}
            onChange={handleEmailChange}
            error={!!formError}
            helperText={formError}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              mt: 3,
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
            {!loading && "Reset Password"}
          </Button>

          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <Grid item>
              <Link
                component={RouterLink}
                to="/auth/login"
                variant="body2"
                sx={{ color: theme.palette.primary.main }}
              >
                Back to login
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
};

export default ForgotPassword;
