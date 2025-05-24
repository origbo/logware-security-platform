import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Speed as SpeedIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

/**
 * Landing Page Component
 *
 * Serves as the entry point for unauthenticated users
 * Provides overview of the platform features and login/register options
 */
const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Feature list for the platform
  const features = [
    {
      title: "Comprehensive Security",
      description:
        "End-to-end security monitoring and management with real-time alerts and incident response.",
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: "Complete Visibility",
      description:
        "Unified dashboard with visibility across your entire organization's security posture.",
      icon: <VisibilityIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: "Fast Response",
      description:
        "Automated security playbooks and workflows for rapid incident response and remediation.",
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: "Compliance Ready",
      description:
        "Built-in compliance frameworks and reporting to meet regulatory requirements.",
      icon: <LockIcon sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Hero section */}
      <Box
        sx={{
          backgroundImage:
            "linear-gradient(135deg, #0d47a1 0%, #1976d2, #42a5f5 100%)",
          color: "#fff",
          pt: { xs: 10, md: 15 },
          pb: { xs: 10, md: 15 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                fontWeight="bold"
              >
                Logware Security Platform
              </Typography>
              <Typography variant="h5" paragraph>
                Comprehensive security management for modern organizations
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                Centralize security monitoring, threat detection, incident
                response, and compliance management in a single, powerful
                platform designed for security teams of all sizes.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/auth/login")}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontWeight: "bold",
                    backgroundColor: "#fff",
                    color: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.grey[100],
                    },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/auth/register")}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontWeight: "bold",
                    borderColor: "#fff",
                    color: "#fff",
                    "&:hover": {
                      borderColor: "#fff",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Create Account
                </Button>
              </Box>
            </Grid>
            {!isMobile && (
              <Grid item xs={12} md={6} sx={{ textAlign: "center" }}>
                <Box
                  component="img"
                  src="/assets/images/dashboard-preview.png"
                  alt="Logware Dashboard Preview"
                  sx={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: 2,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Features section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            fontWeight="bold"
            sx={{ mb: 6 }}
          >
            Platform Features
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    borderRadius: 2,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: theme.palette.primary.main,
                      mb: 2,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.primary.light + "20",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    fontWeight="bold"
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to action */}
      <Box
        sx={{
          backgroundColor: theme.palette.grey[100],
          py: { xs: 6, md: 10 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            fontWeight="bold"
          >
            Ready to secure your organization?
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            Get started with Logware Security Platform today and experience
            comprehensive security management.
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={() => navigate("/auth/register")}
            sx={{ py: 1.5, px: 4, fontWeight: "bold" }}
          >
            Start Free Trial
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          backgroundColor: theme.palette.primary.dark,
          color: "#fff",
          mt: "auto",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="space-between">
            <Grid item>
              <Typography variant="body2">
                © {new Date().getFullYear()} Logware Security Platform. All
                rights reserved.
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{ color: "#fff", textDecoration: "none" }}
                >
                  Privacy Policy
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{ color: "#fff", textDecoration: "none" }}
                >
                  Terms of Service
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{ color: "#fff", textDecoration: "none" }}
                >
                  Contact Us
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
