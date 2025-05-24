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
  InputAdornment,
  IconButton,
  useTheme,
  Link,
} from "@mui/material";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import useAuth from "../hooks/useAuth";
import { PasswordResetData } from "../../../services/api/authService";

// Password requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  specialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
};

/**
 * Reset Password component
 * Allows users to set a new password using a reset token
 */
const ResetPassword: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const token = params.token as string;
  const { resetPassword, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<PasswordResetData>({
    password: "",
    passwordConfirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    password: "",
    passwordConfirm: "",
  });

  // Clear any auth errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field-specific error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }

    // Real-time password match validation
    if (name === "password" && formData.passwordConfirm) {
      if (value !== formData.passwordConfirm) {
        setFormErrors((prev) => ({
          ...prev,
          passwordConfirm: "Passwords do not match",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          passwordConfirm: "",
        }));
      }
    }

    if (name === "passwordConfirm") {
      if (value !== formData.password) {
        setFormErrors((prev) => ({
          ...prev,
          passwordConfirm: "Passwords do not match",
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          passwordConfirm: "",
        }));
      }
    }
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors = {
      password: "",
      passwordConfirm: "",
    };

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    } else {
      if (formData.password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
      } else if (!PASSWORD_REGEX.uppercase.test(formData.password)) {
        errors.password = "Password must contain at least one uppercase letter";
      } else if (!PASSWORD_REGEX.lowercase.test(formData.password)) {
        errors.password = "Password must contain at least one lowercase letter";
      } else if (!PASSWORD_REGEX.number.test(formData.password)) {
        errors.password = "Password must contain at least one number";
      } else if (!PASSWORD_REGEX.specialChar.test(formData.password)) {
        errors.password =
          "Password must contain at least one special character";
      }
    }

    // Validate password confirmation
    if (!formData.passwordConfirm) {
      errors.passwordConfirm = "Please confirm your password";
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = "Passwords do not match";
    }

    setFormErrors(errors);

    // Form is valid if no error messages
    return !Object.values(errors).some((error) => !!error);
  };

  // Calculate password strength (0-100)
  const calculatePasswordStrength = (): number => {
    if (!formData.password) return 0;

    let strength = 0;

    // Length contribution (max 25)
    strength += Math.min(
      25,
      (formData.password.length / PASSWORD_MIN_LENGTH) * 25
    );

    // Character variety contribution (max 75)
    if (PASSWORD_REGEX.lowercase.test(formData.password)) strength += 15;
    if (PASSWORD_REGEX.uppercase.test(formData.password)) strength += 15;
    if (PASSWORD_REGEX.number.test(formData.password)) strength += 15;
    if (PASSWORD_REGEX.specialChar.test(formData.password)) strength += 15;

    // Additional entropy for password length beyond minimum
    if (formData.password.length > PASSWORD_MIN_LENGTH) {
      strength += Math.min(
        15,
        (formData.password.length - PASSWORD_MIN_LENGTH) * 2
      );
    }

    return Math.min(100, Math.round(strength));
  };

  // Get password strength color
  const getPasswordStrengthColor = (): string => {
    const strength = calculatePasswordStrength();
    if (strength < 30) return theme.palette.error.main;
    if (strength < 60) return theme.palette.warning.main;
    if (strength < 80) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) {
      return;
    }

    const success = await resetPassword(token, formData);

    if (success) {
      navigate("/dashboard");
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
          Reset Password
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 3 }}
        >
          Enter your new password
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        {!token && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            Invalid or missing reset token. Please request a new password reset.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="new-password"
            autoFocus
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={
              formErrors.password ||
              `Min ${PASSWORD_MIN_LENGTH} characters with letters, numbers & symbols`
            }
            disabled={loading || !token}
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

          {/* Password strength indicator */}
          {formData.password && (
            <Box sx={{ mt: 1, mb: 1 }}>
              <Typography variant="caption" sx={{ mb: 0.5 }}>
                Password Strength: {calculatePasswordStrength()}%
              </Typography>
              <Box
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.palette.grey[300],
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${calculatePasswordStrength()}%`,
                    backgroundColor: getPasswordStrengthColor(),
                    transition: "width 0.3s ease-in-out",
                  }}
                />
              </Box>
            </Box>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            name="passwordConfirm"
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            id="passwordConfirm"
            autoComplete="new-password"
            value={formData.passwordConfirm}
            onChange={handleChange}
            error={!!formErrors.passwordConfirm}
            helperText={formErrors.passwordConfirm}
            disabled={loading || !token}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleConfirmPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading || !token}
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

export default ResetPassword;
