import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  RemoveCircle as RemoveCircleIcon,
  Check as CheckIcon,
  Mail as MailIcon,
  Link as LinkIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { DashboardLayout } from "../../services/dashboard/dashboardService";
import {
  useShareDashboardMutation,
} from "../../services/api/dashboardApiService";
import { User } from "../../services/auth/authService";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { ExtendedDashboardLayout } from "../../features/dashboard/types";

// Sharing permission levels
export enum SharingPermission {
  VIEW = "view",
  EDIT = "edit",
  ADMIN = "admin",
}

// User sharing info interface
interface SharedUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  permission: SharingPermission;
  acceptedAt?: string;
}

// Sharing info interface
interface SharingInfo {
  isPublic: boolean;
  publicLink?: string;
  sharedWith: SharedUser[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

interface DashboardShareDialogProps {
  dashboard: ExtendedDashboardLayout | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Dashboard Share Dialog Component
 *
 * Allows users to share dashboards with team members and manage permissions
 */
const DashboardShareDialog: React.FC<DashboardShareDialogProps> = ({
  dashboard,
  open,
  onClose,
}) => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);

  // Local state
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharingPermission>(
    SharingPermission.VIEW
  );
  const [isPublicEnabled, setIsPublicEnabled] = useState(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  // Mock sharing info data
  const mockSharingInfo: SharingInfo = {
    isPublic: false,
    publicLink: '',
    sharedWith: [],
    createdBy: user || { id: '', name: '', email: '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // RTK Query hooks
  // Using a typed mock implementation for the query hook
  const {
    data: sharingInfo,
    isLoading: isSharingInfoLoading,
    error: sharingInfoError,
    refetch: refetchSharingInfo
  }: { 
    data: SharingInfo, 
    isLoading: boolean, 
    error: any,
    refetch: () => Promise<any> 
  } = { 
    data: mockSharingInfo, 
    isLoading: false, 
    error: null,
    refetch: () => Promise.resolve() 
  }; 
  
  // Mock data since the API endpoint doesn't exist
  // Original API call would have been something like:
  // useGetDashboardSharingInfoQuery(dashboard?.id || "", {
  //   skip: !dashboard || !open
  // });

  const [shareDashboard, { isLoading: isSharing }] =
    useShareDashboardMutation();
  // Define the type for the remove shared user function
  type RemoveSharedUserFn = (params: { dashboardId: string; userId: string }) => Promise<void>;
  
  // Properly typed mock implementation with a tuple type assertion
  const [removeSharedUser, { isLoading: isRemoving }]: [RemoveSharedUserFn, { isLoading: boolean }] = [
    async (params: { dashboardId: string; userId: string }) => {
      console.log('Mock implementation of removeSharedUser', params);
      return Promise.resolve();
    },
    { isLoading: false }
  ];
  // Define the type for the update sharing permissions function
  type UpdateSharingPermissionsFn = (params: { dashboardId: string; userId: string; permission: SharingPermission }) => Promise<void>;
  
  // Properly typed mock implementation with tuple type assertion
  const [updateSharingPermissions, { isLoading: isUpdating }] = [
    async (params: { dashboardId: string; userId: string; permission: SharingPermission }) => {
      console.log('Mock implementation of updateSharingPermissions', params);
      return Promise.resolve();
    },
    { isLoading: false }
  ] as [UpdateSharingPermissionsFn, { isLoading: boolean }];

  useEffect(() => {
    if (dashboard) {
      const baseUrl = window.location.origin;
      const mockShareLink = `${baseUrl}/share/dashboard/${dashboard.id}`;
      setShareLink(mockShareLink);

      // Set public status from mock data
      if (sharingInfo) {
        setIsPublicEnabled(sharingInfo.isPublic);
      }
    }
  }, [dashboard, sharingInfo]);

  // Update state when sharing info loads
  useEffect(() => {
    if (sharingInfo) {
      setIsPublicEnabled(sharingInfo.isPublic);
      setShareLink(sharingInfo.publicLink || "");
    }
  }, [sharingInfo]);

  // Reset copy success state after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // Reset form on close
  const handleClose = () => {
    setEmail("");
    setPermission(SharingPermission.VIEW);
    setEmailError("");
    onClose();
  };

  // Copy share link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopySuccess(true);
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Share dashboard with user
  const handleShareWithUser = async () => {
    if (!dashboard || !email) return;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");

    try {
      // Call API to share dashboard
      await shareDashboard({
        dashboardId: dashboard.id,
        users: [email]
        // permission is not in the expected parameter type
      });

      // Clear form and refresh data
      setEmail("");
      refetchSharingInfo();
    } catch (error) {
      console.error("Error sharing dashboard:", error);
      setEmailError("Failed to share dashboard with this user");
    }
  };

  // Remove user from sharing
  const handleRemoveUser = async (userId: string) => {
    if (!dashboard) return;

    try {
      await removeSharedUser({
        dashboardId: dashboard.id,
        userId,
      });

      // Update local state optimistically
      if (sharingInfo && sharingInfo.sharedWith) {
        const updatedSharedWith = sharingInfo.sharedWith.filter(
          (user) => user.id !== userId
        );
        // This would be unnecessary with real API, just for demo
        refetchSharingInfo();
      }
    } catch (error) {
      console.error("Failed to remove user:", error);
    }
  };

  // Handle updating permissions
  const handleUpdatePermission = async (
    userId: string,
    newPermission: SharingPermission
  ) => {
    if (!dashboard) return;

    try {
      await updateSharingPermissions({
        dashboardId: dashboard.id,
        userId,
        permission: newPermission,
      });

      // Update local state optimistically
      if (sharingInfo && sharingInfo.sharedWith) {
        const updatedSharedWith = sharingInfo.sharedWith.map((user) =>
          user.id === userId
            ? { ...user, permission: newPermission }
            : user
        );
        // This would be unnecessary with real API, just for demo
        refetchSharingInfo();
      }
    } catch (error) {
      console.error("Failed to update permission:", error);
    }
  };

  // Toggle public visibility
  const handleTogglePublic = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!dashboard) return;

    const isPublic = event.target.checked;
    setIsPublicEnabled(isPublic);

    try {
      // In a real app, this would be an API call
      // await updateDashboardPublicAccess({ dashboardId: dashboard.id, isPublic });

      // Generate or remove public link
      if (isPublic) {
        const baseUrl = window.location.origin;
        const publicLink = `${baseUrl}/public/dashboard/${dashboard.id}?token=` + 
          Math.random().toString(36).substring(2, 15) + 
          Math.random().toString(36).substring(2, 15);
        
        setShareLink(publicLink);
        setCopySuccess(false);
      } else {
        // Reset public link
        const baseUrl = window.location.origin;
        setShareLink(`${baseUrl}/share/dashboard/${dashboard.id}`);
      }
    } catch (error) {
      console.error("Failed to update public access:", error);
      setIsPublicEnabled(!isPublic); // Reset to previous state on error
    }
  };

  // Get permission label for display
  const getPermissionLabel = (permission: SharingPermission): string => {
    switch (permission) {
      case SharingPermission.VIEW:
        return "Can view";
      case SharingPermission.EDIT:
        return "Can edit";
      case SharingPermission.ADMIN:
        return "Admin";
      default:
        return "Unknown";
    }
  };

  // Check if current user is the dashboard owner
  const isOwner = user?.id === sharingInfo?.createdBy.id;

  // Check if loading
  const isLoading =
    isSharingInfoLoading || isSharing || isRemoving || isUpdating;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center">
          <ShareIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6">Share Dashboard</Typography>
        </Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
          {dashboard?.name || "Dashboard"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            {/* Share with new user */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Invite a team member
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  error={!!emailError}
                  helperText={emailError}
                  InputProps={{
                    startAdornment: (
                      <MailIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "action.active" }}
                      />
                    ),
                  }}
                />

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <Select
                    value={permission}
                    onChange={(e) =>
                      setPermission(e.target.value as SharingPermission)
                    }
                  >
                    <MenuItem value={SharingPermission.VIEW}>Can view</MenuItem>
                    <MenuItem value={SharingPermission.EDIT}>Can edit</MenuItem>
                    <MenuItem value={SharingPermission.ADMIN}>Admin</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  onClick={handleShareWithUser}
                  disabled={isSharing}
                >
                  Share
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Public sharing options */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Share with anyone
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublicEnabled}
                      onChange={handleTogglePublic}
                      color="primary"
                      disabled={!isOwner}
                    />
                  }
                  label="Anyone with the link can view"
                />
                {isOwner ? null : (
                  <Chip
                    label="Only owner can change"
                    variant="outlined"
                    size="small"
                    icon={<InfoIcon />}
                  />
                )}
              </Box>

              {isPublicEnabled && shareLink && (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={shareLink}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <LinkIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "action.active" }}
                        />
                      ),
                    }}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={
                      copySuccess ? <CheckIcon /> : <ContentCopyIcon />
                    }
                    onClick={handleCopyLink}
                  >
                    {copySuccess ? "Copied" : "Copy"}
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Shared user list */}
            <Box>
              <Typography variant="h6" gutterBottom>
                <PeopleIcon sx={{ mr: 1, fontSize: 18 }} />
                People with access
              </Typography>

              <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                {/* Owner */}
                {sharingInfo && sharingInfo.createdBy && (
                  <ListItem>
                    <ListItemIcon>
                      <Avatar
                        alt={sharingInfo.createdBy.name}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 32,
                          height: 32,
                        }}
                      >
                        {sharingInfo.createdBy.name[0]}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <>
                          {sharingInfo.createdBy.name}{" "}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {sharingInfo.createdBy.email}
                          </Typography>
                        </>
                      }
                      secondary={"Owner"}
                    />
                  </ListItem>
                )}

                {/* Shared users */}
                {sharingInfo && sharingInfo.sharedWith && sharingInfo.sharedWith.map((sharedUser: SharedUser) => (
                  <ListItem key={sharedUser.id}>
                    <ListItemIcon>
                      <Avatar
                        alt={sharedUser.name}
                        src={sharedUser.avatarUrl}
                        sx={{ bgcolor: theme.palette.secondary.main }}
                      >
                        {sharedUser.name.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={sharedUser.name}
                      secondary={sharedUser.email}
                    />
                    <ListItemSecondaryAction
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      {isOwner ? (
                        <>
                          <FormControl
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 100 }}
                          >
                            <Select
                              value={sharedUser.permission}
                              onChange={(e) =>
                                handleUpdatePermission(
                                  sharedUser.id,
                                  e.target.value as SharingPermission
                                )
                              }
                              size="small"
                            >
                              <MenuItem value={SharingPermission.VIEW}>
                                Can view
                              </MenuItem>
                              <MenuItem value={SharingPermission.EDIT}>
                                Can edit
                              </MenuItem>
                              <MenuItem value={SharingPermission.ADMIN}>
                                Admin
                              </MenuItem>
                            </Select>
                          </FormControl>
                          <IconButton
                            edge="end"
                            aria-label="remove"
                            onClick={() => handleRemoveUser(sharedUser.id)}
                            color="error"
                            size="small"
                          >
                            <RemoveCircleIcon />
                          </IconButton>
                        </>
                      ) : (
                        <Chip
                          label={getPermissionLabel(sharedUser.permission)}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}

                {/* Empty state */}
                {(!sharingInfo?.sharedWith || sharingInfo.sharedWith.length === 0) && (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography
                          color="text.secondary"
                          align="center"
                          sx={{ py: 2 }}
                        >
                          This dashboard hasn't been shared with anyone yet
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Box>

            {/* Sharing tips */}
            <Box mt={2} bgcolor="action.hover" borderRadius={1} p={2}>
              <Typography variant="subtitle2" gutterBottom>
                <InfoIcon
                  sx={{ mr: 1, fontSize: 18, verticalAlign: "text-bottom" }}
                />
                Sharing permissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>View:</strong> Users can view the dashboard but cannot
                make changes.
                <br />
                <strong>Edit:</strong> Users can modify widgets and layouts but
                cannot change sharing settings.
                <br />
                <strong>Admin:</strong> Users have full access except
                transferring ownership.
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Close</Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowForwardIcon />}
          onClick={handleClose}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardShareDialog;
