import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import useAuth from "../features/auth/hooks/useAuth";

// Drawer width
const DRAWER_WIDTH = 240;

// Navigation items configuration
const NAV_ITEMS = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <DashboardIcon />,
    roles: ["user", "manager", "admin"],
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <SettingsIcon />,
    roles: ["manager", "admin"],
  },
  {
    title: "Admin Panel",
    path: "/admin",
    icon: <AdminIcon />,
    roles: ["admin"],
  },
];

/**
 * Main application layout for authenticated users
 * Includes responsive sidebar, header, and content area
 */
const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  // User menu state
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const isUserMenuOpen = Boolean(userMenuAnchor);

  // Notifications menu state
  const [notificationsAnchor, setNotificationsAnchor] =
    useState<null | HTMLElement>(null);
  const isNotificationsOpen = Boolean(notificationsAnchor);

  // Handle drawer open/close
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Handle user menu open
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  // Handle user menu close
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Handle notifications menu open
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  // Handle notifications menu close
  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate("/auth/login");
  };

  // Check if a nav item should be displayed based on user role
  const shouldShowNavItem = (requiredRoles: string[]) => {
    if (!user || !user.role) return false;
    return requiredRoles.includes(user.role);
  };

  // Get user initials for avatar
  const getUserInitials = (): string => {
    if (!user) return "?";

    const firstInitial = user.firstName ? user.firstName.charAt(0) : "";
    const lastInitial = user.lastName ? user.lastName.charAt(0) : "";

    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(drawerOpen && {
            marginLeft: DRAWER_WIDTH,
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            transition: theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ marginRight: 2 }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Logware Security Platform
          </Typography>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationsOpen}
              aria-controls={
                isNotificationsOpen ? "notifications-menu" : undefined
              }
              aria-haspopup="true"
              aria-expanded={isNotificationsOpen ? "true" : undefined}
              sx={{ ml: 1 }}
            >
              <NotificationsIcon />
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title={user?.firstName || "User"}>
            <IconButton
              onClick={handleUserMenuOpen}
              aria-controls={isUserMenuOpen ? "user-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={isUserMenuOpen ? "true" : undefined}
              sx={{ ml: 1 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
              >
                {getUserInitials()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Notifications Menu */}
      <Menu
        id="notifications-menu"
        anchorEl={notificationsAnchor}
        open={isNotificationsOpen}
        onClose={handleNotificationsClose}
        MenuListProps={{
          "aria-labelledby": "notifications-button",
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleNotificationsClose}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="No new notifications" />
        </MenuItem>
      </Menu>

      {/* User Menu */}
      <Menu
        id="user-menu"
        anchorEl={userMenuAnchor}
        open={isUserMenuOpen}
        onClose={handleUserMenuClose}
        MenuListProps={{
          "aria-labelledby": "user-button",
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            handleUserMenuClose();
            navigate("/profile");
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
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
        <Box sx={{ overflow: "auto", mt: 2 }}>
          <List>
            {NAV_ITEMS.filter((item) => shouldShowNavItem(item.roles)).map(
              (item) => (
                <ListItem
                  button
                  key={item.title}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    backgroundColor: location.pathname.startsWith(item.path)
                      ? theme.palette.action.selected
                      : "transparent",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname.startsWith(item.path)
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      color: location.pathname.startsWith(item.path)
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                      fontWeight: location.pathname.startsWith(item.path)
                        ? "bold"
                        : "normal",
                    }}
                  />
                </ListItem>
              )
            )}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          marginLeft: { sm: drawerOpen ? 0 : `-${DRAWER_WIDTH}px` },
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, pt: 2 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
