/**
 * ActiveCasesWidget Component
 *
 * Dashboard widget that displays active security cases by severity,
 * provides a list of recent cases, and quick access to high-priority items.
 */

import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  OpenInNew as OpenIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Import custom hooks
import { useCases } from "../../hooks/useCases";

// Import widget components
import SOARDashboardWidget from "./SOARDashboardWidget";

// Import types
import { SecurityCase, CasePriority } from "../../types/soarTypes";

/**
 * Helper to get the severity icon
 */
const getSeverityIcon = (priority: CasePriority) => {
  switch (priority) {
    case "high":
      return <ErrorIcon color="error" />;
    case "medium":
      return <WarningIcon color="warning" />;
    case "low":
      return <InfoIcon color="info" />;
    default:
      return <InfoIcon color="disabled" />;
  }
};

/**
 * ActiveCasesWidget Component
 */
const ActiveCasesWidget: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { cases, loading, error } = useCases();

  // Filter active cases (non-closed cases)
  const activeCases = useMemo(() => {
    return (
      cases?.filter((c) => c.status !== "closed" && c.status !== "resolved") ||
      []
    );
  }, [cases]);

  // Get cases by severity
  const casesBySeverity = useMemo(() => {
    const counts = {
      high: 0,
      medium: 0,
      low: 0,
    };

    activeCases.forEach((c) => {
      if (c.priority in counts) {
        counts[c.priority as keyof typeof counts]++;
      }
    });

    return counts;
  }, [activeCases]);

  // Get recent cases (last 5)
  const recentCases = useMemo(() => {
    return [...activeCases]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [activeCases]);

  // Get high priority cases
  const highPriorityCases = useMemo(() => {
    return activeCases.filter((c) => c.priority === "high");
  }, [activeCases]);

  // Calculate percentage of high priority cases
  const highPriorityPercentage = useMemo(() => {
    if (activeCases.length === 0) return 0;
    return Math.round((highPriorityCases.length / activeCases.length) * 100);
  }, [activeCases, highPriorityCases]);

  // Handle navigation to case detail
  const handleViewCase = (caseId: string) => {
    navigate(`/soar/cases/${caseId}`);
  };

  // Handle navigation to all cases
  const handleViewAllCases = () => {
    navigate("/soar/cases");
  };

  // Handle refresh
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // In a real implementation, this would trigger a data refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  // If loading
  if (loading) {
    return (
      <SOARDashboardWidget title="Active Cases">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      </SOARDashboardWidget>
    );
  }

  // If error
  if (error) {
    return (
      <SOARDashboardWidget title="Active Cases">
        <Typography color="error">
          Failed to load cases data. Please try again.
        </Typography>
      </SOARDashboardWidget>
    );
  }

  return (
    <SOARDashboardWidget
      title="Active Cases"
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {activeCases.length} open cases
        </Typography>
        <Button
          size="small"
          endIcon={<ArrowIcon />}
          onClick={handleViewAllCases}
        >
          View All
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Cases by Severity */}
        <Box sx={{ display: "flex", justifyContent: "space-around", p: 2 }}>
          <Box
            sx={{
              textAlign: "center",
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.error.main, 0.1),
            }}
          >
            <Typography variant="h4" color="error">
              {casesBySeverity.high}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Severity
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: "center",
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
            }}
          >
            <Typography variant="h4" color="warning.main">
              {casesBySeverity.medium}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Medium Severity
            </Typography>
          </Box>

          <Box
            sx={{
              textAlign: "center",
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.info.main, 0.1),
            }}
          >
            <Typography variant="h4" color="info.main">
              {casesBySeverity.low}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Low Severity
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Recent Cases List */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Recent Cases
          </Typography>

          <List disablePadding>
            {recentCases.length > 0 ? (
              recentCases.map((secCase) => (
                <ListItem
                  key={secCase.id}
                  divider
                  button
                  onClick={() => handleViewCase(secCase.id)}
                >
                  <ListItemIcon>
                    {getSeverityIcon(secCase.priority)}
                  </ListItemIcon>
                  <ListItemText
                    primary={secCase.title}
                    secondary={`Created: ${new Date(
                      secCase.createdAt
                    ).toLocaleDateString()}`}
                    primaryTypographyProps={{ noWrap: true }}
                  />
                  <Chip
                    label={secCase.status}
                    size="small"
                    color={
                      secCase.status === "open"
                        ? "error"
                        : secCase.status === "in_progress"
                        ? "warning"
                        : secCase.status === "pending"
                        ? "info"
                        : "default"
                    }
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No recent cases" />
              </ListItem>
            )}
          </List>
        </Box>

        {highPriorityCases.length > 0 && (
          <>
            <Divider />

            {/* High Priority Section */}
            <Box
              sx={{
                mt: "auto",
                p: 2,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                borderTop: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              <Typography
                variant="subtitle1"
                color="error"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <ErrorIcon sx={{ mr: 1, fontSize: 20 }} />
                {highPriorityCases.length} High Priority{" "}
                {highPriorityCases.length === 1 ? "Case" : "Cases"}(
                {highPriorityPercentage}% of total)
              </Typography>

              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<OpenIcon />}
                sx={{ mt: 1 }}
                onClick={() => navigate("/soar/cases?priority=high")}
              >
                View High Priority Cases
              </Button>
            </Box>
          </>
        )}
      </Box>
    </SOARDashboardWidget>
  );
};

export default ActiveCasesWidget;
