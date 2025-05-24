import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  QrCode2 as QrCodeIcon,
  Check as CheckIcon,
  ContentCopy as CopyIcon,
  DeleteOutline as DeleteIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import {
  useSetupMFAMethodMutation,
  useVerifyMFASetupMutation,
  useDisableMFAMethodMutation,
  useGenerateRecoveryCodesMutation,
  useGetMFAMethodsQuery,
  MFAMethodType,
  MFAMethodStatus,
} from "../../../services/auth/mfaService";
import { useNotification } from "../../../components/common/NotificationProvider";

/**
 * MFA Setup Component
 *
 * Allows users to set up and manage MFA methods
 */
const MFASetup: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState<MFAMethodType | null>(
    null
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const { showNotification } = useNotification();

  // API Hooks
  const { data: mfaMethods = [], refetch: refetchMethods } =
    useGetMFAMethodsQuery();
  const [setupMFA, { isLoading: isSettingUp }] = useSetupMFAMethodMutation();
  const [verifySetup, { isLoading: isVerifying }] = useVerifyMFASetupMutation();
  const [disableMethod, { isLoading: isDisabling }] =
    useDisableMFAMethodMutation();
  const [generateCodes, { isLoading: isGenerating }] =
    useGenerateRecoveryCodesMutation();

  // Step labels for the stepper
  const steps = ["Select Method", "Setup Method", "Verify Method"];

  // Handle method selection
  const handleMethodSelection = (method: MFAMethodType) => {
    setSelectedMethod(method);
    setActiveStep(1);
  };

  // Handle MFA setup
  const handleSetup = async () => {
    if (!selectedMethod) return;

    try {
      // Create setup request based on selected method
      const setupRequest = {
        method: selectedMethod,
        ...(selectedMethod === MFAMethodType.SMS ? { phoneNumber } : {}),
        ...(selectedMethod === MFAMethodType.EMAIL ? { email } : {}),
      };

      // Setup the MFA method
      const response = await setupMFA(setupRequest).unwrap();

      // Store setup data
      if (response.qrCode) {
        setQrCode(response.qrCode);
      }

      if (response.secret) {
        setSecret(response.secret);
      }

      if (response.recoveryBackupCodes) {
        setRecoveryCodes(response.recoveryBackupCodes);
      }

      if (response.verificationId) {
        setVerificationId(response.verificationId);
      }

      // Move to verification step if required
      if (response.verificationRequired) {
        setActiveStep(2);
      } else {
        // If no verification required, show success and refresh methods
        showNotification("MFA method added successfully", "success");
        refetchMethods();
        resetSetup();
      }
    } catch (error) {
      console.error("Error setting up MFA:", error);
      showNotification("Failed to set up MFA method", "error");
    }
  };

  // Handle verification code submission
  const handleVerify = async () => {
    if (!selectedMethod || !verificationId) return;

    try {
      // Get user ID from auth state or local storage
      const userId = localStorage.getItem("user_id") || ""; // Fallback to empty string

      // Verify the setup
      const response = await verifySetup({
        method: selectedMethod,
        code: verificationCode,
        verificationId,
        userId,
      }).unwrap();

      if (response.success) {
        showNotification("MFA method verified and activated", "success");
        refetchMethods();
        resetSetup();
      }
    } catch (error) {
      console.error("Error verifying MFA:", error);
      showNotification("Failed to verify MFA method", "error");
    }
  };

  // Handle method deletion
  const handleDeleteMethod = async (methodId: string) => {
    try {
      await disableMethod(methodId).unwrap();
      showNotification("MFA method removed successfully", "success");
      refetchMethods();
    } catch (error) {
      console.error("Error removing MFA method:", error);
      showNotification("Failed to remove MFA method", "error");
    }
  };

  // Handle generation of new recovery codes
  const handleGenerateRecoveryCodes = async () => {
    try {
      const response = await generateCodes().unwrap();
      setRecoveryCodes(response.codes);
      showNotification("New recovery codes generated", "success");
    } catch (error) {
      console.error("Error generating recovery codes:", error);
      showNotification("Failed to generate recovery codes", "error");
    }
  };

  // Reset the setup process
  const resetSetup = () => {
    setActiveStep(0);
    setSelectedMethod(null);
    setVerificationCode("");
    setQrCode(null);
    setSecret(null);
    setVerificationId(null);
    setPhoneNumber("");
    setEmail("");
    setRecoveryCodes([]);
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification("Copied to clipboard", "success");
  };

  // Download recovery codes as a text file
  const downloadRecoveryCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([recoveryCodes.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "logware-recovery-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Render method selection step
  const renderMethodSelection = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Choose a Two-Factor Authentication Method
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SecurityIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">Authenticator App</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Use an authenticator app like Google Authenticator, Authy, or
                Microsoft Authenticator.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleMethodSelection(MFAMethodType.APP)}
                disabled={mfaMethods.some(
                  (m) =>
                    m.type === MFAMethodType.APP &&
                    m.status === MFAMethodStatus.ACTIVE
                )}
              >
                Set Up
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PhoneIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">SMS Verification</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Receive a verification code via SMS on your mobile phone.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleMethodSelection(MFAMethodType.SMS)}
                disabled={mfaMethods.some(
                  (m) =>
                    m.type === MFAMethodType.SMS &&
                    m.status === MFAMethodStatus.ACTIVE
                )}
              >
                Set Up
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EmailIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">Email Verification</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Receive a verification code via email.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleMethodSelection(MFAMethodType.EMAIL)}
                disabled={mfaMethods.some(
                  (m) =>
                    m.type === MFAMethodType.EMAIL &&
                    m.status === MFAMethodStatus.ACTIVE
                )}
              >
                Set Up
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <KeyIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h6">Recovery Codes</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Generate a set of recovery codes to use when you can't access
                your other methods.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateRecoveryCodes}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <CircularProgress size={24} />
                ) : (
                  "Generate Codes"
                )}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render setup step
  const renderSetupStep = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod) {
      case MFAMethodType.APP:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Set Up Authenticator App
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Scan the QR code with your authenticator app or enter the secret
              key manually.
            </Alert>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{ border: "1px solid #ccc", p: 2, borderRadius: 1, mb: 2 }}
              >
                <QrCodeIcon sx={{ fontSize: 150, color: "text.secondary" }} />
              </Box>

              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Secret Key
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: "monospace", letterSpacing: 1 }}
                >
                  {secret || "ABCDEFGHIJKLMNOP"}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => secret && copyToClipboard(secret)}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handleSetup}
              disabled={isSettingUp}
            >
              {isSettingUp ? <CircularProgress size={24} /> : "Continue"}
            </Button>
          </Box>
        );

      case MFAMethodType.SMS:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Set Up SMS Verification
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Add your phone number to receive verification codes via SMS.
            </Alert>

            <TextField
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="+1 (555) 123-4567"
              type="tel"
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSetup}
              disabled={isSettingUp || !phoneNumber}
              sx={{ mt: 2 }}
            >
              {isSettingUp ? <CircularProgress size={24} /> : "Continue"}
            </Button>
          </Box>
        );

      case MFAMethodType.EMAIL:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Set Up Email Verification
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              Add an email address to receive verification codes.
            </Alert>

            <TextField
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="yourname@example.com"
              type="email"
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSetup}
              disabled={isSettingUp || !email}
              sx={{ mt: 2 }}
            >
              {isSettingUp ? <CircularProgress size={24} /> : "Continue"}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  // Render verification step
  const renderVerificationStep = () => {
    if (!selectedMethod) return null;

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Verify Your{" "}
          {selectedMethod === MFAMethodType.APP
            ? "Authenticator App"
            : selectedMethod === MFAMethodType.SMS
            ? "Phone Number"
            : "Email Address"}
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          {selectedMethod === MFAMethodType.APP
            ? "Enter the 6-digit code from your authenticator app."
            : `We've sent a verification code to your ${
                selectedMethod === MFAMethodType.SMS ? "phone" : "email"
              }. Enter it below to verify.`}
        </Alert>

        <TextField
          label="Verification Code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="Enter code"
          autoComplete="one-time-code"
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
            maxLength: 6,
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button variant="outlined" onClick={resetSetup}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleVerify}
            disabled={isVerifying || verificationCode.length < 6}
          >
            {isVerifying ? <CircularProgress size={24} /> : "Verify"}
          </Button>
        </Box>
      </Box>
    );
  };

  // Render recovery codes
  const renderRecoveryCodes = () => {
    if (recoveryCodes.length === 0) return null;

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recovery Codes
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          Save these recovery codes in a safe place. You can use them to access
          your account if you lose access to your other authentication methods.
          Each code can only be used once.
        </Alert>

        <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1,
            }}
          >
            {recoveryCodes.map((code, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ fontFamily: "monospace", letterSpacing: 1 }}
              >
                {code}
              </Typography>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CopyIcon />}
            onClick={() => copyToClipboard(recoveryCodes.join("\n"))}
          >
            Copy All
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadRecoveryCodes}
          >
            Download
          </Button>
        </Box>
      </Box>
    );
  };

  // Render active MFA methods
  const renderActiveMethods = () => {
    if (mfaMethods.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 4 }}>
          You haven't set up any two-factor authentication methods yet. Setting
          up 2FA will add an extra layer of security to your account.
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Your Active 2FA Methods
        </Typography>

        <Grid container spacing={2}>
          {mfaMethods.map((method) => (
            <Grid item xs={12} key={method.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {method.type === MFAMethodType.APP && (
                        <SecurityIcon color="primary" sx={{ mr: 1 }} />
                      )}
                      {method.type === MFAMethodType.SMS && (
                        <PhoneIcon color="primary" sx={{ mr: 1 }} />
                      )}
                      {method.type === MFAMethodType.EMAIL && (
                        <EmailIcon color="primary" sx={{ mr: 1 }} />
                      )}
                      {method.type === MFAMethodType.RECOVERY && (
                        <KeyIcon color="primary" sx={{ mr: 1 }} />
                      )}

                      <Box>
                        <Typography variant="subtitle1">
                          {method.type === MFAMethodType.APP &&
                            "Authenticator App"}
                          {method.type === MFAMethodType.SMS &&
                            "SMS Verification"}
                          {method.type === MFAMethodType.EMAIL &&
                            "Email Verification"}
                          {method.type === MFAMethodType.RECOVERY &&
                            "Recovery Codes"}
                        </Typography>

                        {method.identifier && (
                          <Typography variant="body2" color="text.secondary">
                            {method.identifier}
                          </Typography>
                        )}

                        {method.lastUsedAt && (
                          <Typography variant="caption" color="text.secondary">
                            Last used:{" "}
                            {new Date(method.lastUsedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Box>
                      {method.status === MFAMethodStatus.ACTIVE && (
                        <Typography
                          variant="caption"
                          color="success.main"
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <CheckIcon fontSize="small" sx={{ mr: 0.5 }} /> Active
                        </Typography>
                      )}

                      {method.status === MFAMethodStatus.PENDING && (
                        <Typography variant="caption" color="warning.main">
                          Pending Verification
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Box sx={{ ml: "auto" }}>
                    <Tooltip title="Remove">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteMethod(method.id)}
                        disabled={isDisabling}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Main render
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SecurityIcon color="primary" fontSize="large" sx={{ mr: 2 }} />
        <Typography variant="h5">Two-Factor Authentication</Typography>
      </Box>

      {/* Stepper */}
      {activeStep > 0 && (
        <Stepper activeStep={activeStep - 1} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {/* Setup Flow */}
      {activeStep === 0 && renderMethodSelection()}
      {activeStep === 1 && renderSetupStep()}
      {activeStep === 2 && renderVerificationStep()}

      {/* Recovery Codes */}
      {renderRecoveryCodes()}

      {/* Active Methods */}
      {renderActiveMethods()}
    </Paper>
  );
};

export default MFASetup;
