import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import RefreshIcon from "@mui/icons-material/Refresh";

interface TwoFactorVerificationProps {
  code: string;
  onChange: (code: string) => void;
  onSubmit: () => void;
  onResend?: () => void;
  loading: boolean;
  error?: string | null;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  code,
  onChange,
  onSubmit,
  onResend,
  loading,
  error,
}) => {
  const [countdown, setCountdown] = useState(60);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input field
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onSubmit();
    }
  };

  const handleResend = () => {
    if (onResend) {
      onResend();
      setCountdown(60); // Reset countdown
    }
  };

  // Handle code input - only allow numbers and limit to 6 digits
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    onChange(value);
  };

  return (
    <Paper
      elevation={5}
      sx={{
        maxWidth: 500,
        width: "100%",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <SecurityIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Two-Factor Authentication
        </Typography>
        <Typography variant="body2">
          For added security, please enter the verification code sent to your
          device
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Enter verification code
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              A 6-digit code has been sent to your authentication app or device
            </Typography>

            <TextField
              inputRef={inputRef}
              fullWidth
              variant="outlined"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              inputProps={{
                maxLength: 6,
                pattern: "[0-9]*",
                inputMode: "numeric",
                style: {
                  textAlign: "center",
                  letterSpacing: "0.5em",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                },
              }}
              disabled={loading}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VerifiedUserIcon color="primary" />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: inputFocused ? "rgba(0, 0, 0, 0.05)" : "transparent",
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading || code.length !== 6}
            sx={{ py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Verify"
            )}
          </Button>
        </form>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Didn't receive a code?
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            variant="text"
            disabled={countdown > 0 || loading || !onResend}
            onClick={handleResend}
            sx={{ textTransform: "none" }}
          >
            {countdown > 0
              ? `Resend code in ${countdown}s`
              : "Resend verification code"}
          </Button>
        </Box>
      </CardContent>
    </Paper>
  );
};

export default TwoFactorVerification;
