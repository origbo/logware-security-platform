import React from "react";
import {
  Box,
  Container,
  Paper,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  SvgIcon,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

/**
 * Authentication Layout Component
 *
 * Serves as a container for authentication-related pages
 * Provides consistent styling and branding across auth screens
 */
const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ flexGrow: 1, display: "flex", alignItems: "center", py: 4 }}
      >
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          {/* Branding Side */}
          {!isMobile && (
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 5,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    borderRadius: 2,
                  }}
                >
                  <SvgIcon
                    component={LockOutlinedIcon}
                    sx={{ fontSize: 60, mb: 3 }}
                  />
                  <Typography
                    variant="h3"
                    gutterBottom
                    align="center"
                    sx={{ fontWeight: 700 }}
                  >
                    Logware Security Platform
                  </Typography>
                  <Typography variant="h6" align="center" sx={{ mb: 3 }}>
                    Comprehensive security management for your organization
                  </Typography>
                  <Typography variant="body1" align="center">
                    Centralized threat monitoring, incident response, and
                    compliance management in a single platform.
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          )}

          {/* Auth Form Side */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: { xs: 2, sm: 4 },
              }}
            >
              {/* Logo on mobile */}
              {isMobile && (
                <Box sx={{ mb: 4, textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                  >
                    Logware Security
                  </Typography>
                </Box>
              )}

              {/* Outlet for the nested auth routes (login, register, etc.) */}
              <Outlet />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Logware Security Platform. All rights
            reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthLayout;
