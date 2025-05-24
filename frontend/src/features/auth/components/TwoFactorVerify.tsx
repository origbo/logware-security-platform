import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  Link,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * Two-Factor Authentication verification component
 * Used when 2FA is required after successful login
 */
const TwoFactorVerify: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { verify2FA, tempUserId, loading, error, isAuthenticated, require2FA } =
    useAuth();

  const [verificationCode, setVerificationCode] = useState("");
  const [formError, setFormError] = useState("");

  // Redirect if user is already authenticated or 2FA is not required
  useEffect(() => {
    if (isAuthenticated && !require2FA) {
      navigate("/dashboard");
    } else if (!require2FA && !tempUserId) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, require2FA, tempUserId, navigate]);

  // Handle verification code input
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/[^0-9]/g, "");

    // Maximum length of 6 digits
    if (value.length <= 6) {
      setVerificationCode(value);
      setFormError("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      setFormError("Please enter the verification code");
      return;
    }

    if (verificationCode.length !== 6) {
      setFormError("Verification code must be 6 digits");
      return;
    }

    if (!tempUserId) {
      setFormError("Session expired. Please login again");
      return;
    }

    await verify2FA({
      userId: tempUserId,
      token: verificationCode,
    });
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
          Two-Factor Authentication
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 3 }}
        >
          Enter the 6-digit verification code from your authenticator app
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
            id="verificationCode"
            label="Verification Code"
            name="verificationCode"
            autoComplete="one-time-code"
            autoFocus
            inputMode="numeric"
            value={verificationCode}
            onChange={handleCodeChange}
            error={!!formError}
            helperText={formError}
            disabled={loading}
            inputProps={{
              maxLength: 6,
              pattern: "[0-9]*",
            }}
            sx={{
              "& input": {
                letterSpacing: "0.5em",
                textAlign: "center",
                fontSize: "1.2em",
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading || verificationCode.length !== 6}
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
            {!loading && "Verify"}
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

export default TwoFactorVerify;
