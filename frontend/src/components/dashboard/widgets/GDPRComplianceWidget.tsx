import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Button,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  WarningAmber as WarningIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import {
  getDSARRequests,
  getDataProcessingRecords,
} from "../../../services/api/complianceApiEndpoints.fixed";
import useAuth from "../../../features/auth/hooks/useAuth";

interface GDPRComplianceWidgetProps {
  data: any;
  widget: DashboardWidget;
}

// GDPR Article status
enum ComplianceStatus {
  COMPLIANT = "compliant",
  NON_COMPLIANT = "non_compliant",
  PARTIALLY_COMPLIANT = "partially_compliant",
  AT_RISK = "at_risk",
  PENDING = "pending",
}

interface GDPRArticle {
  id: string;
  title: string;
  status: ComplianceStatus;
  score: number;
  dueDate?: string;
}

interface GDPRComplianceData {
  overallScore: number;
  lastAssessment: string;
  nextAssessment: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  dsarCount: number;
  articlesAtRisk: GDPRArticle[];
  dpaCount: number;
}

/**
 * GDPRComplianceWidget Component
 *
 * Displays GDPR compliance statistics, highlighting key requirements
 * and data subjects access requests status
 */
const GDPRComplianceWidget: React.FC<GDPRComplianceWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dsarCount, setDsarCount] = useState(0);
  const [dpaCount, setDpaCount] = useState(0);

  // Mock data for development or fallback
  const mockData: GDPRComplianceData = {
    overallScore: 78,
    lastAssessment: "2025-04-20T10:30:00Z",
    nextAssessment: "2025-07-20T10:30:00Z",
    riskLevel: "medium",
    dsarCount,
    articlesAtRisk: [
      {
        id: "Art. 30",
        title: "Records of Processing Activities",
        status: ComplianceStatus.AT_RISK,
        score: 65,
        dueDate: "2025-06-15T00:00:00Z",
      },
      {
        id: "Art. 35",
        title: "Data Protection Impact Assessment",
        status: ComplianceStatus.AT_RISK,
        score: 60,
        dueDate: "2025-06-05T00:00:00Z",
      },
      {
        id: "Art. 33",
        title: "Notification of Data Breach",
        status: ComplianceStatus.PARTIALLY_COMPLIANT,
        score: 70,
      },
    ],
    dpaCount,
  };

  // Fetch real data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchGDPRData();
    }
  }, [isAuthenticated]);

  // Fetch GDPR Compliance data
  const fetchGDPRData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch DSAR requests
      const dsarRequests = await getDSARRequests();
      setDsarCount(dsarRequests.length);

      // Fetch data processing records
      const dpaRecords = await getDataProcessingRecords();
      setDpaCount(dpaRecords.length);
    } catch (err) {
      console.error("Error fetching GDPR data:", err);
      setError("Failed to load compliance data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Use provided data or our fetched/mock data
  const gdprData = data?.gdprCompliance || {
    ...mockData,
    dsarCount,
    dpaCount,
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Get color for status
  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.COMPLIANT:
        return theme.palette.success.main;
      case ComplianceStatus.PARTIALLY_COMPLIANT:
        return theme.palette.warning.main;
      case ComplianceStatus.NON_COMPLIANT:
        return theme.palette.error.main;
      case ComplianceStatus.AT_RISK:
        return theme.palette.error.main;
      case ComplianceStatus.PENDING:
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  // Get risk level color
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return theme.palette.success.main;
      case "medium":
        return theme.palette.warning.main;
      case "high":
      case "critical":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Handle loading state
  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      {/* Show error if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SecurityIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6">GDPR Compliance</Typography>
        </Box>
        <Chip
          label={`Score: ${gdprData.overallScore}%`}
          sx={{
            bgcolor: alpha(getScoreColor(gdprData.overallScore), 0.1),
            color: getScoreColor(gdprData.overallScore),
            fontWeight: "bold",
          }}
        />
      </Box>

      {/* Overall status */}
      <Box sx={{ display: "flex", mb: 2, gap: 2 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" color="text.secondary">
              Risk Level
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: getRiskLevelColor(gdprData.riskLevel),
                textTransform: "capitalize",
              }}
            >
              {gdprData.riskLevel}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" color="text.secondary">
              DSAR Requests
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {gdprData.dsarCount}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" color="text.secondary">
              DPAs
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {gdprData.dpaCount}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Articles at risk */}
      <Typography variant="subtitle1" gutterBottom>
        Articles Requiring Attention
      </Typography>

      <List sx={{ flex: 1, overflow: "auto", mb: 1 }}>
        {gdprData.articlesAtRisk.map((article) => (
          <ListItem
            key={article.id}
            divider
            sx={{
              px: 1.5,
              py: 1,
              borderLeft: `4px solid ${getStatusColor(article.status)}`,
              bgcolor: alpha(getStatusColor(article.status), 0.05),
              borderRadius: "4px",
              mb: 1,
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" fontWeight="bold">
                    {article.id}
                  </Typography>
                  <Typography variant="body2">{article.score}%</Typography>
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2">{article.title}</Typography>
                  {article.dueDate && (
                    <Typography variant="caption" color="error">
                      Due: {formatDate(article.dueDate)}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Assessments */}
      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ my: 1 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Last Assessment: {formatDate(gdprData.lastAssessment)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              Next Assessment: {formatDate(gdprData.nextAssessment)}
            </Typography>
          </Box>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => (window.location.href = "/compliance/gdpr")}
            size="small"
          >
            View Details
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default GDPRComplianceWidget;
