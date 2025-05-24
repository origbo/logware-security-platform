import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Container, Box, Paper } from "@mui/material";
import { MFAVerification } from "../../features/auth/components";
import useAuth from "../../features/auth/hooks/useAuth";
import {
  selectIsAuthenticated,
  selectRequire2FA,
  selectUserId,
  selectVerificationId,
} from "../../features/auth/slice/authSlice";
import {
  logEvent,
  ErrorCategory,
} from "../../services/analytics/errorAnalyticsService";

/**
 * Two-Factor Authentication Page Component
 * Contains the 2FA verification form and handles redirects based on auth state
 */
const TwoFactorPage: React.FC = () => {
  const navigate = useNavigate();
  const { verify2FA } = useAuth();

  // Get authentication state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const require2FA = useSelector(selectRequire2FA);
  const userId = useSelector(selectUserId);
  const verificationId = useSelector(selectVerificationId);

  // Redirect authenticated users to dashboard
  // Redirect users to login if they don't need 2FA or have no verification data
  useEffect(() => {
    if (isAuthenticated && !require2FA) {
      navigate("/dashboard");
    } else if (!require2FA && (!userId || !verificationId)) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, require2FA, userId, verificationId, navigate]);

  // Handle successful MFA verification
  const handleMFAComplete = (result: {
    accessToken: string;
    refreshToken: string;
  }) => {
    // Log successful MFA verification
    logEvent({
      category: ErrorCategory.AUTH,
      action: "mfa_verification_success",
      label: "two_factor_page",
    });

    // Navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          {userId && verificationId && (
            <MFAVerification
              userId={userId}
              verificationId={verificationId}
              onComplete={handleMFAComplete}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default TwoFactorPage;
