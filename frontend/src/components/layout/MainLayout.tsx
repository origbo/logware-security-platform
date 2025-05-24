import React, { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Description as ReportIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ViewList as ListIcon,
  Help as HelpIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

import useAuth from "../../hooks/auth/useAuth";

// Define the navigation items
const navigationItems = [
  { name: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { name: "Alerts", icon: <SecurityIcon />, path: "/alerts" },
  { name: "Logs", icon: <StorageIcon />, path: "/logs" },
  { name: "Reports", icon: <ReportIcon />, path: "/reports" },
  { name: "Compliance", icon: <ListIcon />, path: "/compliance" },
  { name: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

// Define sidebar width
const DRAWER_WIDTH = 240;

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout Component
 *
 * Provides a consistent layout structure for protected pages with
 * navigation drawer, app bar, and main content area
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Local state for drawer, user menu, and notifications
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [notificationsAnchorEl, setNotificationsAnchorEl] =
    useState<null | HTMLElement>(null);

  // Drawer handlers
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // User menu handlers
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  // Notifications handlers
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  // Handle profile navigation
  const handleProfile = () => {
    navigate("/profile");
    handleUserMenuClose();
  };

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Check if route is active
  const isRouteActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          width: { md: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%" },
          ml: { md: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Logware Security Platform
          </Typography>

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationsOpen}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
          >
            {user?.avatarUrl ? (
              <Avatar src={user.avatarUrl} alt={user.name} />
            ) : (
              <Avatar>
                {user?.name ? getInitials(user.name) : <AccountCircleIcon />}
              </Avatar>
            )}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            overflow: "auto",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <List component="nav">
            {navigationItems.map((item) => (
              <ListItem
                button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                selected={isRouteActive(item.path)}
                sx={{
                  borderLeft: isRouteActive(item.path)
                    ? `4px solid ${theme.palette.primary.main}`
                    : "4px solid transparent",
                  pl: isRouteActive(item.path) ? 1.75 : 2,
                  my: 0.5,
                  borderRadius: "0 4px 4px 0",
                  "&.Mui-selected": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isRouteActive(item.path)
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontWeight: isRouteActive(item.path) ? "medium" : "regular",
                    color: isRouteActive(item.path) ? "primary" : "textPrimary",
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ mt: "auto" }} />

          <List>
            <ListItem button onClick={() => handleNavigation("/help")}>
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="Help & Support" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { md: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%" },
          ml: { md: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Spacer for fixed app bar */}
        {children}
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleUserMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1">{user?.name || "User"}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || "user@example.com"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleNavigation("/preferences");
            handleUserMenuClose();
          }}
        >
          <ListItemIcon>
            <TuneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Preferences</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleNotificationsClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 300,
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1">Notifications</Typography>
          <Typography
            variant="caption"
            color="primary"
            sx={{ cursor: "pointer" }}
            onClick={() => {
              handleNavigation("/notifications");
              handleNotificationsClose();
            }}
          >
            View All
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 350, overflow: "auto" }}>
          <MenuItem onClick={handleNotificationsClose}>
            <ListItemIcon>
              <SecurityIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Critical Security Alert"
              secondary="Multiple failed login attempts detected"
            />
          </MenuItem>
          <MenuItem onClick={handleNotificationsClose}>
            <ListItemIcon>
              <StorageIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Disk Space Warning"
              secondary="Server storage is at 85% capacity"
            />
          </MenuItem>
          <MenuItem onClick={handleNotificationsClose}>
            <ListItemIcon>
              <ListIcon fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Compliance Update"
              secondary="Weekly compliance report is available"
            />
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
};

export default MainLayout;
