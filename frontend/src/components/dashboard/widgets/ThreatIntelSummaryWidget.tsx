import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Radar as RadarIcon,
  BugReport as BugReportIcon,
  Public as PublicIcon,
  Language as LanguageIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as AccessTimeIcon,
  VerifiedUser as VerifiedUserIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";
import useAuth from "../../../features/auth/hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

interface ThreatIntelSummaryWidgetProps {
  data: any;
  widget: DashboardWidget;
}

enum ThreatType {
  MALWARE = "malware",
  RANSOMWARE = "ransomware",
  PHISHING = "phishing",
  VULNERABILITY = "vulnerability",
  APT = "apt",
  BOTNET = "botnet",
}

enum ThreatSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
  INFO = "info",
}

interface ThreatIndicator {
  id: string;
  type: ThreatType;
  value: string;
  firstSeen: string;
  lastSeen: string;
  severity: ThreatSeverity;
  confidence: number; // 0-100
  tags: string[];
  source: string;
  relevance: "confirmed" | "suspected" | "potential";
}

interface ThreatIntelData {
  activeThreatCount: number;
  newThreatCount: number;
  relevantVulnerabilities: number;
  directMentions: number;
  recentIndicators: ThreatIndicator[];
  lastUpdated: string;
}

/**
 * ThreatIntelSummaryWidget Component
 *
 * Displays a summary of threat intelligence data,
 * including recent IOCs and relevant threats to the organization
 */
const ThreatIntelSummaryWidget: React.FC<ThreatIntelSummaryWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threatStats, setThreatStats] = useState({
    activeThreatCount: 0,
    newThreatCount: 0,
    relevantVulnerabilities: 0,
    directMentions: 0,
  });

  // Fetch real data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchThreatIntelData();
    }
  }, [isAuthenticated]);

  // Fetch threat intelligence data
  const fetchThreatIntelData = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would be an API call
      // For now, we'll just simulate a delay and use mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulating data from API
      setThreatStats({
        activeThreatCount: 48,
        newThreatCount: 12,
        relevantVulnerabilities: 7,
        directMentions: 3,
      });
    } catch (err) {
      console.error("Error fetching threat intelligence data:", err);
      setError(
        "Failed to load threat intelligence data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const mockData: ThreatIntelData = {
    activeThreatCount: threatStats.activeThreatCount,
    newThreatCount: threatStats.newThreatCount,
    relevantVulnerabilities: threatStats.relevantVulnerabilities,
    directMentions: threatStats.directMentions,
    lastUpdated: "2025-05-15T14:30:00Z",
    recentIndicators: [
      {
        id: "ioc-001",
        type: ThreatType.MALWARE,
        value: "evil-loader.exe",
        firstSeen: "2025-05-14T08:15:00Z",
        lastSeen: "2025-05-15T12:45:00Z",
        severity: ThreatSeverity.HIGH,
        confidence: 85,
        tags: ["trojan", "downloader", "financial"],
        source: "AlienVault OTX",
        relevance: "confirmed",
      },
      {
        id: "ioc-002",
        type: ThreatType.PHISHING,
        value: "secure-login-verify.com",
        firstSeen: "2025-05-13T19:22:00Z",
        lastSeen: "2025-05-15T11:10:00Z",
        severity: ThreatSeverity.MEDIUM,
        confidence: 92,
        tags: ["phishing", "credential-theft"],
        source: "PhishTank",
        relevance: "suspected",
      },
      {
        id: "ioc-003",
        type: ThreatType.VULNERABILITY,
        value: "CVE-2025-1234",
        firstSeen: "2025-05-10T14:20:00Z",
        lastSeen: "2025-05-15T09:35:00Z",
        severity: ThreatSeverity.CRITICAL,
        confidence: 100,
        tags: ["remote-code-execution", "privilege-escalation", "in-the-wild"],
        source: "NVD",
        relevance: "confirmed",
      },
      {
        id: "ioc-004",
        type: ThreatType.RANSOMWARE,
        value: "192.168.1.254",
        firstSeen: "2025-05-12T05:45:00Z",
        lastSeen: "2025-05-14T22:30:00Z",
        severity: ThreatSeverity.HIGH,
        confidence: 78,
        tags: ["c2", "ransomware", "data-exfiltration"],
        source: "Mandiant",
        relevance: "suspected",
      },
      {
        id: "ioc-005",
        type: ThreatType.APT,
        value: "APT-41",
        firstSeen: "2025-05-08T11:15:00Z",
        lastSeen: "2025-05-15T07:20:00Z",
        severity: ThreatSeverity.HIGH,
        confidence: 95,
        tags: ["nation-state", "targeted", "persistent"],
        source: "CrowdStrike",
        relevance: "potential",
      },
    ],
  };

  // Use provided data or fallback to mock data
  const threatData = data?.threatIntel || mockData;

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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Format relative time
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: ThreatSeverity) => {
    switch (severity) {
      case ThreatSeverity.CRITICAL:
        return theme.palette.error.dark;
      case ThreatSeverity.HIGH:
        return theme.palette.error.main;
      case ThreatSeverity.MEDIUM:
        return theme.palette.warning.main;
      case ThreatSeverity.LOW:
        return theme.palette.info.main;
      case ThreatSeverity.INFO:
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  // Get threat type icon
  const getThreatIcon = (type: ThreatType) => {
    switch (type) {
      case ThreatType.MALWARE:
        return <BugReportIcon fontSize="small" />;
      case ThreatType.RANSOMWARE:
        return <BugReportIcon fontSize="small" />;
      case ThreatType.PHISHING:
        return <LanguageIcon fontSize="small" />;
      case ThreatType.VULNERABILITY:
        return <VerifiedUserIcon fontSize="small" />;
      case ThreatType.APT:
        return <RadarIcon fontSize="small" />;
      case ThreatType.BOTNET:
        return <PublicIcon fontSize="small" />;
      default:
        return <RadarIcon fontSize="small" />;
    }
  };

  // Get confidence level background
  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return alpha(theme.palette.success.main, 0.1);
    if (confidence >= 50) return alpha(theme.palette.warning.main, 0.1);
    return alpha(theme.palette.error.main, 0.1);
  };

  // Get confidence level color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return theme.palette.success.main;
    if (confidence >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
          <RadarIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6">Threat Intelligence</Typography>
        </Box>
        <Chip
          label={`${threatData.newThreatCount} New`}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            color: theme.palette.warning.main,
            fontWeight: "medium",
          }}
        />
      </Box>

      {/* Summary Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" color="text.secondary">
              Active Threats
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {threatData.activeThreatCount}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" color="text.secondary">
              Vulnerabilities
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {threatData.relevantVulnerabilities}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" color="text.secondary">
              Direct Mentions
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {threatData.directMentions}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 36,
            "& .MuiTab-root": {
              minHeight: 36,
              py: 0.5,
            },
          }}
        >
          <Tab label="Recent Indicators" />
          <Tab label="Relevant Threats" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ flex: 1, overflow: "auto", mt: 1 }}>
        {/* Recent Indicators Tab */}
        {tabValue === 0 && (
          <List
            sx={{
              py: 0,
              "& .MuiListItem-root": {
                px: 1,
                py: 1,
                mb: 1,
                borderRadius: 1,
                bgcolor: theme.palette.background.paper,
                boxShadow: `0 1px 2px ${alpha(
                  theme.palette.common.black,
                  0.05
                )}`,
              },
            }}
          >
            {threatData.recentIndicators.map((indicator: ThreatIndicator) => (
              <ListItem key={indicator.id} alignItems="flex-start" dense>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {getThreatIcon(indicator.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        noWrap
                        sx={{ mr: 1 }}
                      >
                        {indicator.value}
                      </Typography>
                      <Chip
                        label={indicator.type}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.6rem",
                          textTransform: "capitalize",
                        }}
                      />
                      <Chip
                        label={indicator.severity}
                        size="small"
                        sx={{
                          ml: 0.5,
                          height: 20,
                          fontSize: "0.6rem",
                          bgcolor: alpha(
                            getSeverityColor(indicator.severity),
                            0.1
                          ),
                          color: getSeverityColor(indicator.severity),
                          textTransform: "uppercase",
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            color: "text.secondary",
                            mr: 1,
                          }}
                        >
                          <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                          {formatTimeAgo(indicator.lastSeen)}
                        </Typography>
                        <Chip
                          label={`${indicator.confidence}% confidence`}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: "0.6rem",
                            bgcolor: getConfidenceBg(indicator.confidence),
                            color: getConfidenceColor(indicator.confidence),
                          }}
                        />
                      </Box>

                      <Box sx={{ mt: 0.5 }}>
                        {indicator.tags
                          .slice(0, 3)
                          .map((tag: string, index: number) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{
                                mr: 0.5,
                                mb: 0.5,
                                height: 20,
                                fontSize: "0.65rem",
                                bgcolor: alpha(theme.palette.grey[500], 0.1),
                              }}
                            />
                          ))}
                        {indicator.tags.length > 3 && (
                          <Chip
                            label={`+${indicator.tags.length - 3}`}
                            size="small"
                            sx={{
                              mb: 0.5,
                              height: 20,
                              fontSize: "0.65rem",
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Relevant Threats Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.error.main, 0.05),
              }}
            >
              <BugReportIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  Active Ransomware Campaign
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Targeting finance sector with phishing emails
                </Typography>
              </Box>
              <Chip
                label="High"
                size="small"
                sx={{
                  ml: "auto",
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  fontWeight: "bold",
                  height: 24,
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.error.main, 0.05),
              }}
            >
              <VerifiedUserIcon
                sx={{ color: theme.palette.error.main, mr: 1 }}
              />
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  CVE-2025-1234 Exploitation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Critical vulnerability in web application framework
                </Typography>
              </Box>
              <Chip
                label="Critical"
                size="small"
                sx={{
                  ml: "auto",
                  bgcolor: alpha(theme.palette.error.dark, 0.1),
                  color: theme.palette.error.dark,
                  fontWeight: "bold",
                  height: 24,
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.warning.main, 0.05),
              }}
            >
              <PublicIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  DDoS Attack Patterns
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Increased activity targeting cloud service providers
                </Typography>
              </Box>
              <Chip
                label="Medium"
                size="small"
                sx={{
                  ml: "auto",
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main,
                  fontWeight: "bold",
                  height: 24,
                }}
              />
            </Box>
          </Box>
        )}
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
          Last updated: {formatDate(threatData.lastUpdated)}
        </Typography>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => (window.location.href = "/threat-intel")}
          size="small"
        >
          View All Threats
        </Button>
      </Box>
    </Box>
  );
};

export default ThreatIntelSummaryWidget;
