/**
 * SoarModule Component
 *
 * Main entry point for the SOAR (Security Orchestration, Automation and Response) module.
 * Integrates all SOAR components including dashboard, playbooks, cases, and automation.
 */
import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Grid,
  Typography,
  Tabs,
  Tab,
  IconButton,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Assignment as CasesIcon,
  Code as PlaybookIcon,
  AutoFixHigh as AutomationIcon,
  Search as HuntingIcon,
  Insights as InsightsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
} from "@mui/icons-material";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Import SOAR components
import SOARDashboard from "./SoarDashboard";
import CaseManagement from "./CaseManagement";
import PlaybookDesignerV2 from "./PlaybookDesignerV2";
import PlaybookEditor from "./PlaybookEditor";

// Module state
const SoarModule: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // State for navigation and tabs
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [activeAutomationTab, setActiveAutomationTab] = useState(0);
  const [activeAnomalyTab, setActiveAnomalyTab] = useState(0);

  // Current path determines active section
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes("/dashboard")) {
      setActiveTab(0);
    } else if (path.includes("/cases")) {
      setActiveTab(1);
    } else if (path.includes("/playbooks")) {
      setActiveTab(2);
    } else if (path.includes("/automation")) {
      setActiveTab(3);
    } else if (path.includes("/hunting")) {
      setActiveTab(4);
    } else if (path.includes("/analytics")) {
      setActiveTab(5);
    }
  }, [location]);

  // Navigation links
  const navigationItems = [
    { icon: <DashboardIcon />, text: "Dashboard", path: "/soar/dashboard" },
    { icon: <CasesIcon />, text: "Security Cases", path: "/soar/cases" },
    { icon: <PlaybookIcon />, text: "Playbooks", path: "/soar/playbooks" },
    { icon: <AutomationIcon />, text: "Automation", path: "/soar/automation" },
    { icon: <HuntingIcon />, text: "Threat Hunting", path: "/soar/hunting" },
    { icon: <InsightsIcon />, text: "Analytics", path: "/soar/analytics" },
    { icon: <SettingsIcon />, text: "Settings", path: "/soar/settings" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Render main content based on current route
  const renderContent = () => {
    return (
      <Routes>
        <Route
          path="/dashboard"
          element={
            <SOARDashboard
              activeTab={activeTab}
              onTabChange={setActiveTab}
              activeAutomationTab={activeAutomationTab}
              onAutomationTabChange={setActiveAutomationTab}
              activeAnomalyTab={activeAnomalyTab}
              onAnomalyTabChange={setActiveAnomalyTab}
            />
          }
        />
        <Route path="/cases" element={<CaseManagement />} />
        <Route path="/playbooks" element={<PlaybookDesignerV2 />} />
        <Route path="/playbooks/new" element={<PlaybookEditor />} />
        <Route path="/playbooks/edit/:id" element={<PlaybookEditor />} />
        <Route
          path="*"
          element={
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography variant="h4">
                Select a module from the navigation menu
              </Typography>
            </Box>
          }
        />
      </Routes>
    );
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Navigation Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Typography variant="h6" noWrap component="div">
            SOAR Module
          </Typography>
        </Box>
        <Divider />
        <List>
          {navigationItems.map((item, index) => (
            <ListItem
              button
              key={index}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? theme.palette.primary.contrastText
                      : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          ml: drawerOpen ? "240px" : 0,
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* App Bar */}
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {navigationItems.find((item) => item.path === location.pathname)
                ?.text || "SOAR"}
            </Typography>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton color="inherit">
              <AccountIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: 3,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Container maxWidth={false}>{renderContent()}</Container>
        </Box>
      </Box>
    </Box>
  );
};

export default SoarModule;
