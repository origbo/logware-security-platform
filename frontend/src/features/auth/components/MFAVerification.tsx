import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  useVerifyMFALoginMutation,
  useSendVerificationCodeMutation,
  MFAMethodType,
} from "../../../services/auth/mfaService";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, mfaVerificationComplete } from "../slice/authSlice";
import {
  logEvent,
  ErrorCategory,
} from "../../../services/analytics/errorAnalyticsService";
import { mapUserDataToUser } from "../utils/userMapper";

interface MFAVerificationProps {
  userId: string;
  verificationId: string;
  onComplete: (tokens: { accessToken: string; refreshToken: string }) => void;
  onCancel: () => void;
}

/**
 * MFA Verification Component
 *
 * Handles verification of MFA codes during login process.
 * Supports app, SMS, email, and recovery methods.
 */
const MFAVerification: React.FC<MFAVerificationProps> = ({
  userId,
  verificationId,
  onComplete,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<MFAMethodType>(MFAMethodType.APP);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [verifyMFA, { isLoading: isVerifying }] = useVerifyMFALoginMutation();
  const [sendCode, { isLoading: isSending }] =
    useSendVerificationCodeMutation();

  // Format and validate code based on active method
  useEffect(() => {
    // Reset code when changing tabs
    setCode("");
    setError(null);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: MFAMethodType
  ) => {
    setActiveTab(newValue);
  };

  // Handle code input change
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Only allow digits for app and SMS
    if (
      (activeTab === MFAMethodType.APP || activeTab === MFAMethodType.SMS) &&
      !/^\d*$/.test(input) &&
      input !== ""
    ) {
      return;
    }

    // Limit length based on method
    if (
      (activeTab === MFAMethodType.APP && input.length <= 6) ||
      (activeTab === MFAMethodType.SMS && input.length <= 6) ||
      (activeTab === MFAMethodType.EMAIL && input.length <= 8) ||
      (activeTab === MFAMethodType.RECOVERY && input.length <= 20)
    ) {
      setCode(input);
    }
  };

  // Send verification code via SMS or email
  const handleSendCode = async () => {
    try {
      setError(null);

      const method =
        activeTab === MFAMethodType.EMAIL
          ? MFAMethodType.EMAIL
          : MFAMethodType.SMS;

      const result = await sendCode({ method }).unwrap();

      if (result.success) {
        // Update verification ID if returned
        // verificationId = result.verificationId || verificationId;
      }
    } catch (error) {
      setError("Failed to send verification code. Please try again.");
      console.error("Error sending code:", error);
    }
  };

  // Verify MFA code
  const handleVerify = async () => {
    if (!code) {
      setError("Please enter a verification code");
      logEvent({
        category: ErrorCategory.AUTH,
        action: "mfa_verify_empty_code",
        label: activeTab,
      });
      return;
    }

    try {
      setError(null);

      // Log MFA verification attempt
      logEvent({
        category: ErrorCategory.AUTH,
        action: "mfa_verification_attempt",
        label: activeTab,
      });

      const result = await verifyMFA({
        code,
        method: activeTab,
        verificationId,
        userId,
      }).unwrap();

      // Success, call the onComplete callback with tokens
      if (result && result.accessToken && result.refreshToken) {
        // Log successful verification
        logEvent({
          category: ErrorCategory.AUTH,
          action: "mfa_verification_success",
          label: activeTab,
        });

        // Dispatch success action to update Redux state
        dispatch(
          mfaVerificationComplete({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user ? mapUserDataToUser(result.user) : null,
          })
        );

        // Call the component callback
        onComplete({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
      } else {
        const errorMsg = "Invalid response from server. Please try again.";
        setError(errorMsg);

        // Log error for analytics
        logEvent({
          category: ErrorCategory.AUTH,
          action: "mfa_verification_invalid_response",
          label: activeTab,
          value: 1,
          error: new Error(errorMsg),
        });
      }
    } catch (error: any) {
      let errorMessage = "Invalid verification code. Please try again.";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      setError(errorMessage);

      // Log the verification error for analytics
      logEvent({
        category: ErrorCategory.AUTH,
        action: "mfa_verification_error",
        label: activeTab,
        value: 1,
        error: error,
      });

      console.error("MFA verification error:", error);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 4, maxWidth: 400, width: "100%", mx: "auto" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SecurityIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
        <Typography variant="h5" component="h1">
          Two-Factor Authentication
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please enter the verification code to continue.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab
          icon={<SecurityIcon fontSize="small" />}
          label="Authenticator"
          value={MFAMethodType.APP}
        />
        <Tab
          icon={<PhoneIcon fontSize="small" />}
          label="SMS"
          value={MFAMethodType.SMS}
        />
        <Tab
          icon={<EmailIcon fontSize="small" />}
          label="Email"
          value={MFAMethodType.EMAIL}
        />
        <Tab
          icon={<KeyIcon fontSize="small" />}
          label="Recovery"
          value={MFAMethodType.RECOVERY}
        />
      </Tabs>

      {/* App Authenticator */}
      {activeTab === MFAMethodType.APP && (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the 6-digit code from your authenticator app.
          </Typography>

          <TextField
            label="Authentication Code"
            placeholder="6-digit code"
            value={code}
            onChange={handleCodeChange}
            fullWidth
            margin="normal"
            autoComplete="one-time-code"
            autoFocus
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 6,
            }}
          />
        </>
      )}

      {/* SMS Verification */}
      {activeTab === MFAMethodType.SMS && (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the verification code sent to your registered phone number.
          </Typography>

          <TextField
            label="SMS Code"
            placeholder="6-digit code"
            value={code}
            onChange={handleCodeChange}
            fullWidth
            margin="normal"
            autoComplete="one-time-code"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 6,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={handleSendCode}
                    disabled={isSending}
                    size="small"
                  >
                    {isSending ? <CircularProgress size={20} /> : "Send Code"}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </>
      )}

      {/* Email Verification */}
      {activeTab === MFAMethodType.EMAIL && (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the verification code sent to your email address.
          </Typography>

          <TextField
            label="Email Code"
            placeholder="Verification code"
            value={code}
            onChange={handleCodeChange}
            fullWidth
            margin="normal"
            autoComplete="one-time-code"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={handleSendCode}
                    disabled={isSending}
                    size="small"
                  >
                    {isSending ? <CircularProgress size={20} /> : "Send Code"}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </>
      )}

      {/* Recovery Code */}
      {activeTab === MFAMethodType.RECOVERY && (
        <>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter one of your recovery codes. Each code can only be used once.
          </Typography>

          <TextField
            label="Recovery Code"
            placeholder="xxxx-xxxx-xxxx-xxxx"
            value={code}
            onChange={handleCodeChange}
            fullWidth
            margin="normal"
          />
        </>
      )}

      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
        <Button variant="outlined" onClick={onCancel} disabled={isVerifying}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleVerify}
          disabled={!code || isVerifying}
          startIcon={
            isVerifying ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isVerifying ? "Verifying..." : "Verify"}
        </Button>
      </Box>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/auth/mfa-help");
          }}
          underline="hover"
        >
          Need help with two-factor authentication?
        </Link>
      </Box>
    </Paper>
  );
};

export default MFAVerification;
