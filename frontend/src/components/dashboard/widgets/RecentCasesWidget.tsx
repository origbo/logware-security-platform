import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Divider,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  SupportAgent as SupportAgentIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  BugReport as BugReportIcon,
  VerifiedUser as VerifiedUserIcon,
  PhishingOutlined as PhishingIcon,
  Computer as ComputerIcon,
} from "@mui/icons-material";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";
import useAuth from "../../../features/auth/hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import axios from "axios";
import { TOKEN_KEY } from "../../../config/constants";

interface RecentCasesWidgetProps {
  data: any;
  widget: DashboardWidget;
}

enum CasePriority {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

enum CaseStatus {
  NEW = "new",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  ON_HOLD = "on_hold",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

enum CaseType {
  INCIDENT = "incident",
  ALERT = "alert",
  VULNERABILITY = "vulnerability",
  PHISHING = "phishing",
  MALWARE = "malware",
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  POLICY_VIOLATION = "policy_violation",
}

interface SecurityCase {
  id: string;
  title: string;
  description: string;
  priority: CasePriority;
  status: CaseStatus;
  type: CaseType;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  source: string;
  relatedAssets?: string[];
}

interface RecentCasesData {
  totalOpen: number;
  criticalCount: number;
  highCount: number;
  lastUpdated: string;
  cases: SecurityCase[];
}

/**
 * RecentCasesWidget Component
 *
 * Displays recent security cases and incidents with their status,
 * priority, and assignment information
 */
const RecentCasesWidget: React.FC<RecentCasesWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseStats, setCaseStats] = useState({
    totalOpen: 0,
    criticalCount: 0,
    highCount: 0,
  });
  const [recentCases, setRecentCases] = useState<SecurityCase[]>([]);

  // Fetch real data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCasesData();
    }
  }, [isAuthenticated]);

  // Fetch cases data from the API
  const fetchCasesData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      // API endpoint for security cases
      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:3001"
        }/api/cases/recent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update state with fetched data
      if (response.data && response.data.data) {
        const casesData = response.data.data;
        setCaseStats({
          totalOpen: casesData.totalOpen || 0,
          criticalCount: casesData.criticalCount || 0,
          highCount: casesData.highCount || 0,
        });
        setRecentCases(casesData.cases || []);
      }
    } catch (err) {
      console.error("Error fetching cases data:", err);
      setError("Failed to load security cases. Please try again later.");

      // Fall back to mock data in case of error
      setRecentCases(mockData.cases);
      setCaseStats({
        totalOpen: mockData.totalOpen,
        criticalCount: mockData.criticalCount,
        highCount: mockData.highCount,
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data as fallback
  const mockData: RecentCasesData = {
    totalOpen: 18,
    criticalCount: 2,
    highCount: 6,
    lastUpdated: "2025-05-15T15:45:00Z",
    cases: [
      {
        id: "case-001",
        title: "Suspicious login attempts from unknown location",
        description:
          "Multiple failed login attempts for admin user from IP 203.0.113.42",
        priority: CasePriority.HIGH,
        status: CaseStatus.IN_PROGRESS,
        type: CaseType.UNAUTHORIZED_ACCESS,
        createdAt: "2025-05-15T09:23:15Z",
        updatedAt: "2025-05-15T14:10:00Z",
        assignedTo: {
          id: "user-001",
          name: "John Smith",
          avatarUrl: "https://i.pravatar.cc/150?img=1",
        },
        source: "SIEM Alert",
        relatedAssets: ["auth-server", "admin-portal"],
      },
      {
        id: "case-002",
        title: "Potential data exfiltration detected",
        description:
          "Unusual outbound data transfer from finance department workstation",
        priority: CasePriority.CRITICAL,
        status: CaseStatus.ASSIGNED,
        type: CaseType.INCIDENT,
        createdAt: "2025-05-15T07:45:30Z",
        updatedAt: "2025-05-15T13:20:00Z",
        assignedTo: {
          id: "user-002",
          name: "Sarah Johnson",
          avatarUrl: "https://i.pravatar.cc/150?img=5",
        },
        source: "DLP System",
        relatedAssets: ["fin-ws-042", "data-storage-east"],
      },
      {
        id: "case-003",
        title: "Phishing campaign targeting engineering team",
        description:
          "Multiple users received emails with malicious attachments claiming to be from IT department",
        priority: CasePriority.HIGH,
        status: CaseStatus.IN_PROGRESS,
        type: CaseType.PHISHING,
        createdAt: "2025-05-14T15:12:00Z",
        updatedAt: "2025-05-15T12:05:00Z",
        assignedTo: {
          id: "user-003",
          name: "David Chen",
          avatarUrl: "https://i.pravatar.cc/150?img=11",
        },
        source: "Email Security Gateway",
        relatedAssets: ["mail-gateway", "eng-department"],
      },
      {
        id: "case-004",
        title: "Critical vulnerability in web application",
        description:
          "CVE-2025-1234 affects customer portal application with CVSS score of 9.8",
        priority: CasePriority.CRITICAL,
        status: CaseStatus.ON_HOLD,
        type: CaseType.VULNERABILITY,
        createdAt: "2025-05-13T11:30:00Z",
        updatedAt: "2025-05-15T10:45:00Z",
        assignedTo: {
          id: "user-004",
          name: "Jessica Lee",
          avatarUrl: "https://i.pravatar.cc/150?img=20",
        },
        source: "Vulnerability Scanner",
        relatedAssets: ["web-app-server", "customer-portal"],
      },
      {
        id: "case-005",
        title: "Malware detected on developer workstation",
        description:
          "Trojan malware detected but quarantined on engineering workstation",
        priority: CasePriority.MEDIUM,
        status: CaseStatus.RESOLVED,
        type: CaseType.MALWARE,
        createdAt: "2025-05-12T14:20:00Z",
        updatedAt: "2025-05-15T09:10:00Z",
        assignedTo: {
          id: "user-001",
          name: "John Smith",
          avatarUrl: "https://i.pravatar.cc/150?img=1",
        },
        source: "Endpoint Protection",
        relatedAssets: ["eng-ws-107"],
      },
    ],
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

  // Use provided data, fetched data, or fallback to mock data
  const casesData = data?.recentCases || {
    totalOpen: caseStats.totalOpen || mockData.totalOpen,
    criticalCount: caseStats.criticalCount || mockData.criticalCount,
    highCount: caseStats.highCount || mockData.highCount,
    lastUpdated: new Date().toISOString(),
    cases: recentCases.length > 0 ? recentCases : mockData.cases,
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Get priority color
  const getPriorityColor = (priority: CasePriority) => {
    switch (priority) {
      case CasePriority.CRITICAL:
        return theme.palette.error.dark;
      case CasePriority.HIGH:
        return theme.palette.error.main;
      case CasePriority.MEDIUM:
        return theme.palette.warning.main;
      case CasePriority.LOW:
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status color
  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.NEW:
        return theme.palette.info.main;
      case CaseStatus.ASSIGNED:
        return theme.palette.info.dark;
      case CaseStatus.IN_PROGRESS:
        return theme.palette.warning.main;
      case CaseStatus.ON_HOLD:
        return theme.palette.grey[500];
      case CaseStatus.RESOLVED:
        return theme.palette.success.main;
      case CaseStatus.CLOSED:
        return theme.palette.success.dark;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get case type icon
  const getCaseTypeIcon = (type: CaseType) => {
    switch (type) {
      case CaseType.INCIDENT:
        return <WarningIcon fontSize="small" />;
      case CaseType.ALERT:
        return <WarningIcon fontSize="small" />;
      case CaseType.VULNERABILITY:
        return <VerifiedUserIcon fontSize="small" />;
      case CaseType.PHISHING:
        return <PhishingIcon fontSize="small" />;
      case CaseType.MALWARE:
        return <BugReportIcon fontSize="small" />;
      case CaseType.UNAUTHORIZED_ACCESS:
        return <ComputerIcon fontSize="small" />;
      case CaseType.POLICY_VIOLATION:
        return <AssignmentIcon fontSize="small" />;
      default:
        return <AssignmentIcon fontSize="small" />;
    }
  };

  // Real-time data refresh - poll every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchCasesData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
          <SupportAgentIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6">Recent Cases</Typography>
        </Box>
        <Chip
          label={`${casesData.totalOpen} Open`}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            color: theme.palette.warning.main,
          }}
        />
      </Box>

      {/* Cases summary */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Box
          sx={{
            flex: 1,
            p: 1,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.error.dark, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Critical
          </Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: theme.palette.error.dark }}
          >
            {casesData.criticalCount}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 1,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.error.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            High
          </Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: theme.palette.error.main }}
          >
            {casesData.highCount}
          </Typography>
        </Box>
      </Box>

      {/* Cases list */}
      <List
        sx={{
          flex: 1,
          overflow: "auto",
          "& .MuiListItem-root": {
            px: 1.5,
            py: 1.5,
            mb: 1,
            borderLeft: "4px solid",
            borderRadius: "4px",
          },
        }}
      >
        {casesData.cases.map((caseItem: SecurityCase) => (
          <ListItem
            key={caseItem.id}
            sx={{
              borderLeftColor: getPriorityColor(caseItem.priority),
              bgcolor: alpha(getPriorityColor(caseItem.priority), 0.05),
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {getCaseTypeIcon(caseItem.type)}
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
                    sx={{ mr: 1 }}
                  >
                    {caseItem.title}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <Chip
                      label={caseItem.status.replace("_", " ")}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        bgcolor: alpha(getStatusColor(caseItem.status), 0.1),
                        color: getStatusColor(caseItem.status),
                        textTransform: "capitalize",
                      }}
                    />
                    <Chip
                      label={caseItem.priority}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        bgcolor: alpha(
                          getPriorityColor(caseItem.priority),
                          0.1
                        ),
                        color: getPriorityColor(caseItem.priority),
                        textTransform: "uppercase",
                      }}
                    />
                    <Chip
                      label={caseItem.type.replace("_", " ")}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    {caseItem.assignedTo ? (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={caseItem.assignedTo.avatarUrl}
                          alt={caseItem.assignedTo.name}
                          sx={{ width: 24, height: 24, mr: 0.5 }}
                        />
                        <Typography variant="caption">
                          {caseItem.assignedTo.name}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                      {formatTimeAgo(caseItem.updatedAt)}
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ mt: "auto", pt: 1, textAlign: "right" }}>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => (window.location.href = "/cases")}
          size="small"
        >
          View All Cases
        </Button>
      </Box>
    </Box>
  );
};

export default RecentCasesWidget;
