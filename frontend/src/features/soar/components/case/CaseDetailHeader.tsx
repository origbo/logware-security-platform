/**
 * CaseDetailHeader Component
 *
 * Displays the header section of a security case detail view, including
 * basic information, status, and primary actions.
 */

import React from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  PlayArrow as PlayIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Import types
import { SecurityCase, CaseStatus, CasePriority } from "../../types/soarTypes";

// Props interface
interface CaseDetailHeaderProps {
  caseData: SecurityCase;
  editMode: boolean;
  onEditModeToggle: () => void;
  onCaseUpdate: (updatedCase: SecurityCase) => void;
  onCaseStatusChange: (status: CaseStatus) => void;
  onCaseDelete: () => void;
}

/**
 * Returns color for case status
 */
const getStatusColor = (status: CaseStatus) => {
  switch (status) {
    case "open":
      return "error";
    case "in_progress":
      return "warning";
    case "pending":
      return "info";
    case "resolved":
      return "success";
    case "closed":
      return "default";
    default:
      return "default";
  }
};

/**
 * Returns color for case priority
 */
const getPriorityColor = (priority: CasePriority) => {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "default";
  }
};

/**
 * CaseDetailHeader Component
 */
const CaseDetailHeader: React.FC<CaseDetailHeaderProps> = ({
  caseData,
  editMode,
  onEditModeToggle,
  onCaseUpdate,
  onCaseStatusChange,
  onCaseDelete,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [statusAnchorEl, setStatusAnchorEl] =
    React.useState<null | HTMLElement>(null);

  // Handle update of case fields
  const handleFieldChange = (field: keyof SecurityCase, value: any) => {
    onCaseUpdate({
      ...caseData,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  // Handle opening status menu
  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };

  // Handle closing status menu
  const handleStatusMenuClose = () => {
    setStatusAnchorEl(null);
  };

  // Handle selecting a new status
  const handleStatusSelect = (status: CaseStatus) => {
    onCaseStatusChange(status);
    handleStatusMenuClose();
  };

  // Handle opening actions menu
  const handleActionsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing actions menu
  const handleActionsMenuClose = () => {
    setAnchorEl(null);
  };

  // Navigate back to case list
  const handleBack = () => {
    navigate("/soar/cases");
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* Top Bar with Back Button, Title and Actions */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          {editMode ? (
            <TextField
              fullWidth
              variant="standard"
              value={caseData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              inputProps={{ style: { fontSize: "1.25rem", fontWeight: 500 } }}
            />
          ) : (
            <Typography variant="h5" component="h1">
              {caseData.title}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* Current Status */}
          <Chip
            label={caseData.status.replace("_", " ")}
            color={getStatusColor(caseData.status)}
            sx={{ mr: 1, textTransform: "capitalize" }}
            onClick={handleStatusMenuOpen}
          />

          {/* Priority */}
          <Chip
            icon={<FlagIcon />}
            label={`${caseData.priority}`}
            color={getPriorityColor(caseData.priority)}
            sx={{ mr: 1, textTransform: "capitalize" }}
          />

          {/* Edit/Save Buttons */}
          {editMode ? (
            <>
              <Tooltip title="Save changes">
                <IconButton
                  color="primary"
                  onClick={onEditModeToggle}
                  sx={{ mr: 0.5 }}
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel editing">
                <IconButton color="default" onClick={onEditModeToggle}>
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Edit case">
                <IconButton
                  color="primary"
                  onClick={onEditModeToggle}
                  sx={{ mr: 0.5 }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="More actions">
                <IconButton onClick={handleActionsMenuOpen}>
                  <ArchiveIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>

        {/* Status Menu */}
        <Menu
          anchorEl={statusAnchorEl}
          open={Boolean(statusAnchorEl)}
          onClose={handleStatusMenuClose}
        >
          <MenuItem
            onClick={() => handleStatusSelect("open")}
            disabled={caseData.status === "open"}
          >
            <Chip size="small" label="Open" color="error" sx={{ mr: 1 }} />
            New case
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusSelect("in_progress")}
            disabled={caseData.status === "in_progress"}
          >
            <Chip
              size="small"
              label="In Progress"
              color="warning"
              sx={{ mr: 1 }}
            />
            Working on case
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusSelect("pending")}
            disabled={caseData.status === "pending"}
          >
            <Chip size="small" label="Pending" color="info" sx={{ mr: 1 }} />
            Awaiting action
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusSelect("resolved")}
            disabled={caseData.status === "resolved"}
          >
            <Chip
              size="small"
              label="Resolved"
              color="success"
              sx={{ mr: 1 }}
            />
            Issue fixed
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusSelect("closed")}
            disabled={caseData.status === "closed"}
          >
            <Chip size="small" label="Closed" color="default" sx={{ mr: 1 }} />
            Case completed
          </MenuItem>
        </Menu>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleActionsMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleActionsMenuClose();
              navigate(`/soar/playbooks/run?caseId=${caseData.id}`);
            }}
          >
            <PlayIcon sx={{ mr: 1 }} />
            Run Playbook
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleActionsMenuClose();
              onCaseStatusChange("closed");
            }}
          >
            <ArchiveIcon sx={{ mr: 1 }} />
            Archive Case
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleActionsMenuClose();
              if (
                window.confirm(
                  "Are you sure you want to delete this case? This action cannot be undone."
                )
              ) {
                onCaseDelete();
              }
            }}
          >
            <DeleteIcon sx={{ mr: 1 }} color="error" />
            Delete Case
          </MenuItem>
        </Menu>
      </Box>

      {/* Case Metadata */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 2 }}>
        {/* Created Date */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body2">
              {new Date(caseData.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Last Updated */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TimeIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body2">
              {new Date(caseData.updatedAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Created By */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PersonIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Created By
            </Typography>
            <Typography variant="body2">{caseData.createdBy}</Typography>
          </Box>
        </Box>

        {/* Assigned To */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PersonIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Assigned To
            </Typography>
            {editMode ? (
              <TextField
                variant="standard"
                size="small"
                value={caseData.assignedTo || ""}
                onChange={(e) =>
                  handleFieldChange("assignedTo", e.target.value)
                }
              />
            ) : (
              <Typography variant="body2">
                {caseData.assignedTo || "Unassigned"}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Action Buttons - Show based on case status */}
      {!editMode && (
        <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
          {caseData.status === "open" && (
            <Button
              variant="contained"
              color="warning"
              startIcon={<PlayIcon />}
              onClick={() => onCaseStatusChange("in_progress")}
            >
              Start Investigation
            </Button>
          )}

          {caseData.status === "in_progress" && (
            <Button
              variant="contained"
              color="success"
              onClick={() => onCaseStatusChange("resolved")}
            >
              Mark Resolved
            </Button>
          )}

          {caseData.status === "resolved" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => onCaseStatusChange("closed")}
            >
              Close Case
            </Button>
          )}

          {(caseData.status === "open" ||
            caseData.status === "in_progress") && (
            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              onClick={() =>
                navigate(`/soar/playbooks/run?caseId=${caseData.id}`)
              }
            >
              Run Playbook
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default CaseDetailHeader;
