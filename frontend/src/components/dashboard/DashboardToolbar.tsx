import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  FileCopy as DuplicateIcon,
  Delete as DeleteIcon,
  GridView as GridViewIcon,
  FormatListBulleted as ListViewIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  ArrowDownward as ArrowDownwardIcon,
  Public as PublicIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { DashboardLayout } from "../../services/dashboard/dashboardService";
import DashboardShareDialog from "./DashboardShareDialog";
import { ExtendedDashboardLayout } from "../../features/dashboard/types";

// Add userId property to make the type compatible with the existing code
interface EnhancedDashboardLayout extends ExtendedDashboardLayout {
  userId: string;
}

interface DashboardToolbarProps {
  currentDashboard: EnhancedDashboardLayout | null;
  dashboards: EnhancedDashboardLayout[];
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  onToggleEditMode: () => void;
  onSaveLayout: () => void;
  onCreateNewDashboard: (name: string) => Promise<void>;
  onSelectDashboard: (dashboard: EnhancedDashboardLayout) => void;
  onCloneDashboard: (dashboardId: string, newName: string) => Promise<void>;
  onDeleteDashboard: (dashboardId: string) => Promise<void>;
  onSetDefaultDashboard: (dashboardId: string) => Promise<void>;
  onAddWidget: () => void;
}

/**
 * Dashboard Toolbar Component
 *
 * Provides UI controls for dashboard management, including:
 * - Switching between dashboards
 * - Creating/editing/deleting dashboards
 * - Toggling edit mode
 * - Sharing dashboards
 * - Adding widgets
 */
const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  currentDashboard,
  dashboards,
  isEditMode,
  hasUnsavedChanges,
  onToggleEditMode,
  onSaveLayout,
  onCreateNewDashboard,
  onSelectDashboard,
  onCloneDashboard,
  onDeleteDashboard,
  onSetDefaultDashboard,
  onAddWidget,
}) => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  // Ensure user has an id property
  const userId = user?.id || "";
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Local state for menus and dialogs
  const [dashboardMenuAnchor, setDashboardMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [optionsMenuAnchor, setOptionsMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [isNewDashboardDialogOpen, setIsNewDashboardDialogOpen] =
    useState(false);
  const [isCloneDashboardDialogOpen, setIsCloneDashboardDialogOpen] =
    useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState("");

  // Handle dashboard menu opening
  const handleDashboardMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setDashboardMenuAnchor(event.currentTarget);
  };

  // Handle dashboard menu closing
  const handleDashboardMenuClose = () => {
    setDashboardMenuAnchor(null);
  };

  // Handle options menu opening
  const handleOptionsMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setOptionsMenuAnchor(event.currentTarget);
  };

  // Handle options menu closing
  const handleOptionsMenuClose = () => {
    setOptionsMenuAnchor(null);
  };

  // Handle view mode change
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: "grid" | "list" | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Handle new dashboard dialog
  const handleNewDashboardDialogOpen = () => {
    setNewDashboardName("");
    setIsNewDashboardDialogOpen(true);
    handleDashboardMenuClose();
  };

  // Handle clone dashboard dialog
  const handleCloneDashboardDialogOpen = () => {
    setNewDashboardName(
      currentDashboard ? `${currentDashboard.name} (Copy)` : ""
    );
    setIsCloneDashboardDialogOpen(true);
    handleOptionsMenuClose();
  };

  // Handle delete confirmation dialog
  const handleDeleteConfirmationOpen = () => {
    setIsDeleteConfirmationOpen(true);
    handleOptionsMenuClose();
  };

  // Handle setting dashboard as default
  const handleSetAsDefault = async () => {
    if (currentDashboard) {
      await onSetDefaultDashboard(currentDashboard.id);
    }
    handleOptionsMenuClose();
  };

  // Handle creating a new dashboard
  const handleCreateNewDashboard = async () => {
    if (newDashboardName) {
      await onCreateNewDashboard(newDashboardName);
      setIsNewDashboardDialogOpen(false);
    }
  };

  // Handle cloning a dashboard
  const handleCloneDashboard = async () => {
    if (currentDashboard && newDashboardName) {
      await onCloneDashboard(currentDashboard.id, newDashboardName);
      setIsCloneDashboardDialogOpen(false);
    }
  };

  // Handle deleting a dashboard
  const handleDeleteDashboard = async () => {
    if (currentDashboard) {
      await onDeleteDashboard(currentDashboard.id);
      setIsDeleteConfirmationOpen(false);
    }
  };

  // Handle opening share dialog
  const handleShareDialogOpen = () => {
    setIsShareDialogOpen(true);
    handleOptionsMenuClose();
  };

  // Check if current dashboard is default
  const isCurrentDashboardDefault = currentDashboard?.isDefault;

  // Check if current user is the dashboard owner
  const isDashboardOwner =
    currentDashboard && currentDashboard.userId === userId;

  // Check if current dashboard is shared
  const isSharedDashboard = currentDashboard?.isShared;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      {/* Left section - Dashboard selector and actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            variant="outlined"
            onClick={handleDashboardMenuOpen}
            startIcon={<DashboardIcon />}
            endIcon={<ArrowDownwardIcon />}
            size="small"
            sx={{ mr: 1 }}
          >
            {currentDashboard?.name || "Select Dashboard"}
          </Button>

          <Menu
            anchorEl={dashboardMenuAnchor}
            open={Boolean(dashboardMenuAnchor)}
            onClose={handleDashboardMenuClose}
          >
            {dashboards.map((dashboard) => (
              <MenuItem
                key={dashboard.id}
                onClick={() => {
                  onSelectDashboard(dashboard);
                  handleDashboardMenuClose();
                }}
                selected={currentDashboard?.id === dashboard.id}
                sx={{
                  "& .MuiListItemIcon-root": {
                    color: dashboard.isDefault ? "primary.main" : "inherit",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {dashboard.isDefault && (
                    <DashboardIcon
                      fontSize="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                  )}
                  {dashboard.isShared && (
                    <ShareIcon
                      fontSize="small"
                      color="action"
                      sx={{ mr: 1, opacity: 0.7 }}
                    />
                  )}
                  {dashboard.name}
                </Box>
              </MenuItem>
            ))}

            <Divider />
            <MenuItem onClick={handleNewDashboardDialogOpen}>
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              Create New Dashboard
            </MenuItem>
          </Menu>
        </Box>

        {isEditMode ? (
          // Edit mode actions
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={onSaveLayout}
              disabled={!hasUnsavedChanges}
              size="small"
            >
              Save Layout
            </Button>
            <Button variant="outlined" onClick={onToggleEditMode} size="small">
              Cancel
            </Button>
          </>
        ) : (
          // Normal mode actions
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAddWidget}
              size="small"
            >
              Add Widget
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onToggleEditMode}
              size="small"
            >
              Edit Layout
            </Button>
          </>
        )}

        {/* View mode toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={{ ml: 1, display: { xs: "none", sm: "flex" } }}
        >
          <ToggleButton value="grid" aria-label="grid view">
            <Tooltip title="Grid View">
              <GridViewIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <Tooltip title="List View">
              <ListViewIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Right section - Options and Share */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {currentDashboard && (
          <>
            <Tooltip title="Share Dashboard">
              <Button
                startIcon={
                  <Badge
                    color="secondary"
                    variant="dot"
                    invisible={!isSharedDashboard}
                  >
                    <ShareIcon />
                  </Badge>
                }
                onClick={handleShareDialogOpen}
                size="small"
              >
                Share
              </Button>
            </Tooltip>

            <Tooltip title="Dashboard Options">
              <IconButton onClick={handleOptionsMenuOpen} size="small">
                <MoreVertIcon />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={optionsMenuAnchor}
              open={Boolean(optionsMenuAnchor)}
              onClose={handleOptionsMenuClose}
            >
              <MenuItem onClick={handleCloneDashboardDialogOpen}>
                <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
                Duplicate Dashboard
              </MenuItem>

              {isDashboardOwner && !isCurrentDashboardDefault && (
                <MenuItem onClick={handleSetAsDefault}>
                  <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                  Set as Default
                </MenuItem>
              )}

              <MenuItem onClick={handleShareDialogOpen}>
                <ShareIcon fontSize="small" sx={{ mr: 1 }} />
                Share Dashboard
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={handleDeleteConfirmationOpen}
                disabled={dashboards.length < 2}
              >
                <DeleteIcon
                  fontSize="small"
                  sx={{ mr: 1, color: theme.palette.error.main }}
                />
                <Typography color="error">Delete Dashboard</Typography>
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* Create New Dashboard Dialog */}
      <Dialog
        open={isNewDashboardDialogOpen}
        onClose={() => setIsNewDashboardDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Create New Dashboard</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Dashboard Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newDashboardName}
            onChange={(e) => setNewDashboardName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewDashboardDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateNewDashboard}
            variant="contained"
            color="primary"
            disabled={!newDashboardName}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clone Dashboard Dialog */}
      <Dialog
        open={isCloneDashboardDialogOpen}
        onClose={() => setIsCloneDashboardDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Duplicate Dashboard</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="clone-name"
            label="New Dashboard Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newDashboardName}
            onChange={(e) => setNewDashboardName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCloneDashboardDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCloneDashboard}
            variant="contained"
            color="primary"
            disabled={!newDashboardName}
          >
            Duplicate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Dashboard</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the dashboard "
            {currentDashboard?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteConfirmationOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteDashboard}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dashboard Dialog */}
      <DashboardShareDialog
        dashboard={currentDashboard}
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </Box>
  );
};

export default DashboardToolbar;
