import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  Tooltip,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Shield as ShieldIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";

interface SecurityScoreWidgetProps {
  data: any;
  widget: DashboardWidget;
}

interface SecurityCategory {
  name: string;
  score: number;
  previousScore: number;
  weight: number;
}

interface SecurityScoreData {
  overallScore: number;
  previousScore: number;
  lastUpdated: string;
  industryAverage: number;
  categories: SecurityCategory[];
}

/**
 * SecurityScoreWidget Component
 *
 * Displays an overall security score and detailed breakdown by category
 * with trend indicators compared to previous period
 */
const SecurityScoreWidget: React.FC<SecurityScoreWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();

  // Mock data for development
  const mockData: SecurityScoreData = {
    overallScore: 82,
    previousScore: 78,
    lastUpdated: "2025-05-10T14:30:00Z",
    industryAverage: 74,
    categories: [
      { name: "Network Security", score: 85, previousScore: 82, weight: 25 },
      {
        name: "Application Security",
        score: 77,
        previousScore: 79,
        weight: 20,
      },
      { name: "Data Protection", score: 90, previousScore: 85, weight: 20 },
      { name: "Endpoint Security", score: 72, previousScore: 70, weight: 15 },
      { name: "Identity & Access", score: 86, previousScore: 79, weight: 20 },
    ],
  };

  // Use provided data or fallback to mock data
  const scoreData = data?.securityScore || mockData;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get difference between current and previous score
  const getScoreDifference = (current: number, previous: number) => {
    const diff = current - previous;
    return {
      value: Math.abs(diff).toFixed(1),
      isPositive: diff >= 0,
      color: diff >= 0 ? theme.palette.success.main : theme.palette.error.main,
    };
  };

  // Calculate overall difference
  const overallDiff = getScoreDifference(
    scoreData.overallScore,
    scoreData.previousScore
  );

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      {/* Widget Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ShieldIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6">Security Score</Typography>
        </Box>
      </Box>

      {/* Overall score */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            mr: { xs: 0, sm: 4 },
            mb: { xs: 2, sm: 0 },
          }}
        >
          <CircularProgress
            variant="determinate"
            value={100}
            size={100}
            thickness={4}
            sx={{ color: alpha(theme.palette.grey[500], 0.2) }}
          />
          <CircularProgress
            variant="determinate"
            value={scoreData.overallScore}
            size={100}
            thickness={4}
            sx={{
              color: getScoreColor(scoreData.overallScore),
              position: "absolute",
              left: 0,
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="h4" component="div" fontWeight="bold">
              {scoreData.overallScore}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              of 100
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body1" fontWeight="medium">
              Your Overall Security Score
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                ml: 1,
                color: overallDiff.color,
              }}
            >
              {overallDiff.isPositive ? (
                <ArrowUpwardIcon fontSize="small" />
              ) : (
                <ArrowDownwardIcon fontSize="small" />
              )}
              <Typography variant="body2" fontWeight="medium">
                {overallDiff.value}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Industry Average: {scoreData.industryAverage}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={scoreData.industryAverage}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: alpha(theme.palette.grey[500], 0.1),
              "& .MuiLinearProgress-bar": {
                bgcolor: alpha(theme.palette.info.main, 0.8),
                borderRadius: 5,
              },
            }}
          />
        </Box>
      </Box>

      {/* Categories breakdown */}
      <Typography variant="subtitle1" gutterBottom>
        Score Breakdown
      </Typography>

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {scoreData.categories.map((category) => {
          const diff = getScoreDifference(
            category.score,
            category.previousScore
          );

          return (
            <Box key={category.name} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2">{category.name}</Typography>
                  <Tooltip title={`Weight: ${category.weight}%`}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({category.weight}%)
                    </Typography>
                  </Tooltip>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" fontWeight="medium">
                    {category.score}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      ml: 1,
                      color: diff.color,
                    }}
                  >
                    {diff.isPositive ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                    <Typography variant="caption" fontWeight="medium">
                      {diff.value}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <LinearProgress
                variant="determinate"
                value={category.score}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                  "& .MuiLinearProgress-bar": {
                    bgcolor: getScoreColor(category.score),
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          mt: "auto",
          pt: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Last updated: {formatDate(scoreData.lastUpdated)}
        </Typography>

        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => (window.location.href = "/security/score")}
          size="small"
        >
          View Details
        </Button>
      </Box>
    </Box>
  );
};

export default SecurityScoreWidget;
