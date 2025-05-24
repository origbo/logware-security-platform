import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
  Alert,
  Paper,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import SecurityIcon from "@mui/icons-material/Security";
import { login, verify2FA } from "../../store/auth/authSlice";
import { AppDispatch, RootState } from "../../store/store";
import TwoFactorVerification from "../../components/auth/TwoFactorVerification";

// Define form validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  rememberMe: yup.boolean(),
});

// Types for form data
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Get auth state from Redux
  const { loading, error, require2FA, userId2FA } = useSelector(
    (state: RootState) => state.auth
  );

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle login form submission
  const onSubmit = async (data: LoginFormData) => {
    await dispatch(
      login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      })
    );
  };

  // Handle 2FA verification
  const handle2FASubmit = async () => {
    if (userId2FA && twoFactorCode) {
      await dispatch(
        verify2FA({
          userId: userId2FA,
          verificationCode: twoFactorCode,
        })
      );

      // After successful 2FA verification, redirect to dashboard
      navigate("/dashboard");
    }
  };

  // Render 2FA verification form if required
  if (require2FA) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 2,
          backgroundColor: "background.default",
        }}
      >
        <TwoFactorVerification
          code={twoFactorCode}
          onChange={setTwoFactorCode}
          onSubmit={handle2FASubmit}
          loading={loading}
          error={error}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 2,
        background: "linear-gradient(45deg, #1a237e 30%, #3949ab 90%)",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          maxWidth: 900,
          width: "100%",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        {/* Left side - Brand/Info */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: { xs: "100%", md: "45%" },
            textAlign: "center",
          }}
        >
          <SecurityIcon sx={{ fontSize: 60, mb: 3 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Logware Security
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            Comprehensive Security Operations Platform
          </Typography>
          <Divider
            sx={{ width: "80%", mb: 3, bgcolor: "rgba(255,255,255,0.2)" }}
          />
          <Typography variant="body2">
            Advanced threat detection, monitoring, and compliance management all
            in one place.
          </Typography>
        </Box>

        {/* Right side - Login Form */}
        <Box
          sx={{
            p: 4,
            width: { xs: "100%", md: "55%" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={loading}
                  type={showPassword ? "text" : "password"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
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
              )}
            />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", my: 2 }}
            >
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        disabled={loading}
                      />
                    }
                    label="Remember me"
                  />
                )}
              />
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                mt: 2,
                mb: 2,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="textSecondary">
              OR
            </Typography>
          </Divider>

          <Typography align="center" variant="body2">
            Don't have an account?{" "}
            <Link component={RouterLink} to="/register" variant="body2">
              Sign up now
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
