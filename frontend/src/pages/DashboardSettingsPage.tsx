import React from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  useTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useParams } from "react-router-dom";

import DashboardSettings from "../components/dashboard/DashboardSettings";

/**
 * DashboardSettingsPage Component
 *
 * Container page for the dashboard settings feature that incorporates
 * the DashboardSettings component and provides navigation context
 */
const DashboardSettingsPage: React.FC = () => {
  const theme = useTheme();
  const { dashboardId } = useParams<{ dashboardId: string }>();

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Link
          component={RouterLink}
          to="/dashboard"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <DashboardIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <SettingsIcon sx={{ mr: 0.5 }} fontSize="small" />
          Settings
        </Typography>
      </Breadcrumbs>

      {/* Main content */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          minHeight: "calc(100vh - 200px)",
          bgcolor: theme.palette.background.default,
        }}
      >
        <DashboardSettings dashboardId={dashboardId} />
      </Paper>
    </Container>
  );
};

export default DashboardSettingsPage;
