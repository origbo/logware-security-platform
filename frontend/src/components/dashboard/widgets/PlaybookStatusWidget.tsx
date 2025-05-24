import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  AutoFixHigh as AutoFixHighIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Autorenew as AutorenewIcon,
  MoreVert as MoreVertIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";
import useAuth from "../../../features/auth/hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

interface PlaybookStatusWidgetProps {
  data: any;
  widget: DashboardWidget;
}

enum PlaybookStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  FAILED = "failed",
}

interface Playbook {
  id: string;
  name: string;
  status: PlaybookStatus;
  progress: number;
  lastRun: string;
  triggerCount: number;
  type: "automated" | "manual" | "scheduled";
  priority: "high" | "medium" | "low";
}

interface PlaybookSummary {
  total: number;
  active: number;
  paused: number;
  automated: number;
  manual: number;
  scheduled: number;
  lastUpdated: string;
  playbooks: Playbook[];
}

/**
 * PlaybookStatusWidget Component
 *
 * Displays the status of security playbooks and automation workflows
 * Shows recent playbook executions and their status
 */
const PlaybookStatusWidget: React.FC<PlaybookStatusWidgetProps> = ({
  data,
  widget,
}) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbookStats, setPlaybookStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    automated: 0,
    manual: 0,
    scheduled: 0,
  });

  // Fetch real data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaybooksData();
    }
  }, [isAuthenticated]);

  // Fetch playbooks data
  const fetchPlaybooksData = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would be an API call
      // For now, we'll just simulate a delay and use mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulating data from API
      setPlaybookStats({
        total: 32,
        active: 18,
        paused: 6,
        automated: 22,
        manual: 7,
        scheduled: 3,
      });
    } catch (err) {
      console.error("Error fetching playbooks data:", err);
      setError("Failed to load playbooks data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const mockData: PlaybookSummary = {
    total: playbookStats.total,
    active: playbookStats.active,
    paused: playbookStats.paused,
    automated: playbookStats.automated,
    manual: playbookStats.manual,
    scheduled: playbookStats.scheduled,
    lastUpdated: "2025-05-15T08:45:22Z",
    playbooks: [
      {
        id: "pb-001",
        name: "Ransomware Containment",
        status: PlaybookStatus.ACTIVE,
        progress: 75,
        lastRun: "2025-05-15T06:32:14Z",
        triggerCount: 3,
        type: "automated",
        priority: "high",
      },
      {
        id: "pb-002",
        name: "Data Exfiltration Response",
        status: PlaybookStatus.COMPLETED,
        progress: 100,
        lastRun: "2025-05-14T19:15:08Z",
        triggerCount: 1,
        type: "manual",
        priority: "high",
      },
      {
        id: "pb-003",
        name: "Suspicious Login Investigation",
        status: PlaybookStatus.PAUSED,
        progress: 45,
        lastRun: "2025-05-14T22:10:51Z",
        triggerCount: 12,
        type: "automated",
        priority: "medium",
      },
      {
        id: "pb-004",
        name: "Vulnerability Scanner",
        status: PlaybookStatus.ACTIVE,
        progress: 30,
        lastRun: "2025-05-15T07:05:30Z",
        triggerCount: 1,
        type: "scheduled",
        priority: "medium",
      },
      {
        id: "pb-005",
        name: "Phishing Email Analysis",
        status: PlaybookStatus.FAILED,
        progress: 68,
        lastRun: "2025-05-15T02:45:11Z",
        triggerCount: 8,
        type: "automated",
        priority: "high",
      },
    ],
  };

  // Use provided data or fallback to mock data
  const playbookData = data?.playbookStatus || mockData;

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

  // Format timestamp
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
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

  // Get status icon
  const getStatusIcon = (status: PlaybookStatus) => {
    switch (status) {
      case PlaybookStatus.ACTIVE:
        return (
          <PlayArrowIcon
            fontSize="small"
            sx={{ color: theme.palette.success.main }}
          />
        );
      case PlaybookStatus.PAUSED:
        return (
          <PauseIcon
            fontSize="small"
            sx={{ color: theme.palette.warning.main }}
          />
        );
      case PlaybookStatus.COMPLETED:
        return (
          <CheckCircleIcon
            fontSize="small"
            sx={{ color: theme.palette.success.main }}
          />
        );
      case PlaybookStatus.FAILED:
        return (
          <ErrorIcon
            fontSize="small"
            sx={{ color: theme.palette.error.main }}
          />
        );
      default:
        return <AutorenewIcon fontSize="small" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Handle menu click
  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    id: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlaybook(id);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlaybook(null);
  };

  // Handle resume playbook
  const handleResumePlaybook = () => {
    console.log(`Resume playbook ${selectedPlaybook}`);
    handleMenuClose();
  };

  // Handle pause playbook
  const handlePausePlaybook = () => {
    console.log(`Pause playbook ${selectedPlaybook}`);
    handleMenuClose();
  };

  // Handle view details
  const handleViewDetails = () => {
    console.log(`View details for playbook ${selectedPlaybook}`);
    handleMenuClose();
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
          <AutoFixHighIcon sx={{ color: "primary.main", mr: 1 }} />
          <Typography variant="h6">Playbook Status</Typography>
        </Box>
        <Chip
          label={`${playbookData.active} Active`}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.main,
          }}
        />
      </Box>

      {/* Stats row */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 1,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Total
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {playbookData.total}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 1,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.success.main, 0.1),
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Automated
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {playbookData.automated}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 1,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Manual
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {playbookData.manual}
          </Typography>
        </Box>
      </Box>

      {/* Playbooks list */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Recent Playbook Executions
      </Typography>

      <List
        sx={{
          flex: 1,
          overflow: "auto",
          "& .MuiListItem-root": {
            px: 1.5,
            py: 1,
            mb: 1,
            borderRadius: 1,
            bgcolor: theme.palette.background.paper,
            boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
          },
        }}
      >
        {playbookData.playbooks.map((playbook: Playbook) => (
          <ListItem
            key={playbook.id}
            secondaryAction={
              <IconButton
                edge="end"
                size="small"
                aria-label="playbook options"
                onClick={(e) => handleMenuClick(e, playbook.id)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {getStatusIcon(playbook.status)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" fontWeight="medium" noWrap>
                    {playbook.name}
                  </Typography>
                  <Chip
                    label={playbook.type}
                    size="small"
                    sx={{
                      ml: 1,
                      fontSize: "0.65rem",
                      height: 20,
                      textTransform: "capitalize",
                    }}
                  />
                </Box>
              }
              secondary={
                <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: getPriorityColor(playbook.priority),
                      mr: 0.5,
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mr: 1 }}
                  >
                    {playbook.priority} priority
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last run: {formatTimeAgo(playbook.lastRun)}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Playbook options menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleResumePlaybook}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
          Resume
        </MenuItem>
        <MenuItem onClick={handlePausePlaybook}>
          <PauseIcon fontSize="small" sx={{ mr: 1 }} />
          Pause
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleViewDetails}>
          <ArrowForwardIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
      </Menu>

      {/* Footer */}
      <Box sx={{ mt: "auto", pt: 1, textAlign: "right" }}>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => (window.location.href = "/automation/playbooks")}
          size="small"
        >
          Manage Playbooks
        </Button>
      </Box>
    </Box>
  );
};

export default PlaybookStatusWidget;
