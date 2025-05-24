import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  useTheme,
  Link,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import useAuth from "../../hooks/auth/useAuth";

/**
 * UnauthorizedPage component for displaying access denied message
 */
const UnauthorizedPage: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated, logout } = useAuth();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            textAlign: "center",
            borderTop: `4px solid ${theme.palette.error.main}`,
          }}
        >
          <SecurityIcon
            sx={{
              fontSize: 80,
              color: theme.palette.error.main,
              mb: 2,
            }}
          />

          <Typography variant="h4" component="h1" gutterBottom>
            Access Denied
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            You do not have permission to access this page.
            {isAuthenticated
              ? " Your account does not have the required permissions or roles to view this resource."
              : " Please log in to access this resource."}
          </Typography>

          <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
            {isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  variant="contained"
                  color="primary"
                  startIcon={<HomeIcon />}
                  fullWidth
                >
                  Return to Dashboard
                </Button>

                <Button
                  component={RouterLink}
                  to="/"
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  fullWidth
                >
                  Go to Home Page
                </Button>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    If you believe you should have access to this page, please
                    contact your administrator or{" "}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={logout}
                      sx={{ textDecoration: "none" }}
                    >
                      log out
                    </Link>{" "}
                    and try again with a different account.
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Log In
                </Button>

                <Button
                  component={RouterLink}
                  to="/"
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  fullWidth
                >
                  Go to Home Page
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
