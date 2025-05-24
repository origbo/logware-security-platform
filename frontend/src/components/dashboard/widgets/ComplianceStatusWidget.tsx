import React, { useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
  IconButton,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";

// Define props interface
interface ComplianceStatusWidgetProps {
  data: any;
  widget: DashboardWidget;
}

// Define compliance status
enum ComplianceStatus {
  COMPLIANT = "compliant",
  NON_COMPLIANT = "non_compliant",
  PARTIALLY_COMPLIANT = "partially_compliant",
  NOT_APPLICABLE = "not_applicable",
  PENDING = "pending",
}

// Define framework
interface ComplianceFramework {
  id: string;
  name: string;
  controls: {
    id: string;
    name: string;
    status: ComplianceStatus;
    score: number; // 0-100
  }[];
  status: ComplianceStatus;
  score: number; // 0-100
  lastAssessment: string;
}

/**
 * ComplianceStatusWidget Component
 *
 * Displays compliance status for selected security frameworks
 * with visual indicators of control implementation levels
 */
const ComplianceStatusWidget: React.FC<ComplianceStatusWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedFramework, setSelectedFramework] = useState<string>("");

  // Mock data for development
  const mockData = {
    frameworks: [
      {
        id: "iso27001",
        name: "ISO 27001",
        controls: [
          {
            id: "A.5",
            name: "Information Security Policies",
            status: ComplianceStatus.COMPLIANT,
            score: 100,
          },
          {
            id: "A.6",
            name: "Organization of Information Security",
            status: ComplianceStatus.COMPLIANT,
            score: 95,
          },
          {
            id: "A.7",
            name: "Human Resource Security",
            status: ComplianceStatus.PARTIALLY_COMPLIANT,
            score: 82,
          },
          {
            id: "A.8",
            name: "Asset Management",
            status: ComplianceStatus.PARTIALLY_COMPLIANT,
            score: 78,
          },
          {
            id: "A.9",
            name: "Access Control",
            status: ComplianceStatus.COMPLIANT,
            score: 93,
          },
        ],
        status: ComplianceStatus.PARTIALLY_COMPLIANT,
        score: 89,
        lastAssessment: "2025-05-01T10:30:00Z",
      },
      {
        id: "pci-dss",
        name: "PCI DSS",
        controls: [
          {
            id: "Req-1",
            name: "Install and maintain a firewall",
            status: ComplianceStatus.COMPLIANT,
            score: 100,
          },
          {
            id: "Req-2",
            name: "Do not use vendor-supplied defaults",
            status: ComplianceStatus.COMPLIANT,
            score: 100,
          },
          {
            id: "Req-3",
            name: "Protect stored cardholder data",
            status: ComplianceStatus.PARTIALLY_COMPLIANT,
            score: 85,
          },
          {
            id: "Req-4",
            name: "Encrypt transmission of data",
            status: ComplianceStatus.COMPLIANT,
            score: 95,
          },
          {
            id: "Req-5",
            name: "Use and update anti-virus",
            status: ComplianceStatus.NON_COMPLIANT,
            score: 60,
          },
        ],
        status: ComplianceStatus.PARTIALLY_COMPLIANT,
        score: 82,
        lastAssessment: "2025-04-28T14:15:00Z",
      },
      {
        id: "nist-csf",
        name: "NIST CSF",
        controls: [
          {
            id: "ID",
            name: "Identify",
            status: ComplianceStatus.PARTIALLY_COMPLIANT,
            score: 80,
          },
          {
            id: "PR",
            name: "Protect",
            status: ComplianceStatus.PARTIALLY_COMPLIANT,
            score: 75,
          },
          {
            id: "DE",
            name: "Detect",
            status: ComplianceStatus.COMPLIANT,
            score: 90,
          },
          {
            id: "RS",
            name: "Respond",
            status: ComplianceStatus.PARTIALLY_COMPLIANT,
            score: 85,
          },
          {
            id: "RC",
            name: "Recover",
            status: ComplianceStatus.NON_COMPLIANT,
            score: 65,
          },
        ],
        status: ComplianceStatus.PARTIALLY_COMPLIANT,
        score: 79,
        lastAssessment: "2025-05-10T09:20:00Z",
      },
      {
        id: "hipaa",
        name: "HIPAA",
        controls: [
          {
            id: "Privacy",
            name: "Privacy Rule",
            status: ComplianceStatus.COMPLIANT,
            score: 95,
          },
          {
            id: "Security",
            name: "Security Rule",
            status: ComplianceStatus.PARTIALLY_COMPLIANT,
            score: 88,
          },
          {
            id: "Breach",
            name: "Breach Notification",
            status: ComplianceStatus.COMPLIANT,
            score: 92,
          },
          {
            id: "Enforcement",
            name: "Enforcement Rule",
            status: ComplianceStatus.PARTIALLY_COMPLIANT,
            score: 87,
          },
        ],
        status: ComplianceStatus.PARTIALLY_COMPLIANT,
        score: 90,
        lastAssessment: "2025-05-05T11:45:00Z",
      },
    ],
  };

  // Use real data if available, otherwise use mock data
  const complianceData = data || mockData;

  // Set default selected framework if not set and data is available
  React.useEffect(() => {
    if (complianceData.frameworks.length > 0 && !selectedFramework) {
      setSelectedFramework(complianceData.frameworks[0].id);
    }
  }, [complianceData, selectedFramework]);

  // Get selected framework data
  const getSelectedFramework = (): ComplianceFramework | undefined => {
    return complianceData.frameworks.find((f) => f.id === selectedFramework);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Get status icon and color
  const getStatusInfo = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.COMPLIANT:
        return {
          icon: <CheckIcon fontSize="small" />,
          color: theme.palette.success.main,
          label: "Compliant",
        };
      case ComplianceStatus.PARTIALLY_COMPLIANT:
        return {
          icon: <WarningIcon fontSize="small" />,
          color: theme.palette.warning.main,
          label: "Partially Compliant",
        };
      case ComplianceStatus.NON_COMPLIANT:
        return {
          icon: <CloseIcon fontSize="small" />,
          color: theme.palette.error.main,
          label: "Non-Compliant",
        };
      case ComplianceStatus.PENDING:
        return {
          icon: <InfoIcon fontSize="small" />,
          color: theme.palette.info.main,
          label: "Pending",
        };
      case ComplianceStatus.NOT_APPLICABLE:
      default:
        return {
          icon: <InfoIcon fontSize="small" />,
          color: theme.palette.grey[500],
          label: "Not Applicable",
        };
    }
  };

  // Get color for score
  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get background color for score
  const getScoreBackgroundColor = (score: number) => {
    if (score >= 90) return alpha(theme.palette.success.main, 0.1);
    if (score >= 70) return alpha(theme.palette.warning.main, 0.1);
    return alpha(theme.palette.error.main, 0.1);
  };

  // Calculate overall compliance score
  const calculateOverallScore = (): number => {
    if (complianceData.frameworks.length === 0) return 0;

    const totalScore = complianceData.frameworks.reduce(
      (sum, framework) => sum + framework.score,
      0
    );

    return Math.round(totalScore / complianceData.frameworks.length);
  };

  // Handle framework change
  const handleFrameworkChange = (event: any) => {
    setSelectedFramework(event.target.value);
  };

  // Handle refresh compliance
  const handleRefreshCompliance = () => {
    // In a real implementation, this would refresh compliance data
    console.log("Refreshing compliance data");
  };

  // Handle view all compliance
  const handleViewAllCompliance = () => {
    navigate("/compliance");
  };

  // Get the selected framework
  const framework = getSelectedFramework();

  // Calculate overall compliance score
  const overallScore = calculateOverallScore();

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with overall compliance score */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SecurityIcon sx={{ color: "text.secondary", mr: 1 }} />
          <Typography variant="subtitle2">Overall Compliance</Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            position: "relative",
            bgcolor: getScoreBackgroundColor(overallScore),
          }}
        >
          <CircularProgress
            variant="determinate"
            value={overallScore}
            size={58}
            thickness={4}
            sx={{
              color: getScoreColor(overallScore),
              position: "absolute",
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <Typography
              variant="h6"
              component="div"
              fontWeight="bold"
              lineHeight={1}
            >
              {overallScore}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Framework selector */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="compliance-framework-label">Framework</InputLabel>
        <Select
          labelId="compliance-framework-label"
          id="compliance-framework"
          value={selectedFramework}
          label="Framework"
          onChange={handleFrameworkChange}
          endAdornment={
            <IconButton
              size="small"
              onClick={handleRefreshCompliance}
              sx={{ mr: 1 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          }
        >
          {complianceData.frameworks.map((framework) => (
            <MenuItem key={framework.id} value={framework.id}>
              {framework.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Selected framework details */}
      {framework ? (
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          {/* Framework header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body2" fontWeight="medium">
                {framework.name}
              </Typography>

              <Tooltip title={getStatusInfo(framework.status).label}>
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    ml: 1,
                    color: getStatusInfo(framework.status).color,
                  }}
                >
                  {getStatusInfo(framework.status).icon}
                </Box>
              </Tooltip>
            </Box>

            <Chip
              label={`${framework.score}%`}
              size="small"
              sx={{
                bgcolor: getScoreBackgroundColor(framework.score),
                color: getScoreColor(framework.score),
                fontWeight: "medium",
              }}
            />
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 2 }}
          >
            Last assessment: {formatTimestamp(framework.lastAssessment)}
          </Typography>

          {/* Control details */}
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Controls
          </Typography>

          {framework.controls.map((control) => {
            const { color } = getStatusInfo(control.status);

            return (
              <Box key={control.id} sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "inline-block",
                        minWidth: 40,
                        fontWeight: "bold",
                        color: "text.secondary",
                      }}
                    >
                      {control.id}
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {control.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="medium">
                    {control.score}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={control.score}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    bgcolor: alpha(color, 0.1),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: color,
                    },
                  }}
                />
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No compliance frameworks available
          </Typography>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ mt: "auto", pt: 1, textAlign: "right" }}>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAllCompliance}
          size="small"
        >
          View All Compliance
        </Button>
      </Box>
    </Box>
  );
};

export default ComplianceStatusWidget;
