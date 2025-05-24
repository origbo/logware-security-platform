import * as React from "react";
import { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import useAuth from "../../hooks/auth/useAuth";
import ProfileInfo from "./profile/ProfileInfo";
import SecuritySettings from "./profile/SecuritySettings";
import NotificationSettings from "./profile/NotificationSettings";

// Profile tab options
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component for switching between profile tabs
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// UserProfile component
const UserProfile: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  // Handle tab changes
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate avatar text from user's name
  const getAvatarText = () => {
    if (!user) return "?";

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    if (user.username) {
      return user.username[0].toUpperCase();
    }

    return "?";
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        {/* Profile header */}
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            p: 3,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
            gap: 3,
          }}
        >
          <Avatar
            src={user?.profileImage}
            alt={user?.username || "User"}
            sx={{
              width: 80,
              height: 80,
              bgcolor: "secondary.main",
              fontSize: "2rem",
            }}
          >
            {getAvatarText()}
          </Avatar>

          <Box>
            <Typography variant="h4" gutterBottom>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username}
            </Typography>

            <Typography variant="body1">{user?.email}</Typography>

            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              {user?.roles?.length
                ? `Role${user.roles.length > 1 ? "s" : ""}: ${user.roles.join(
                    ", "
                  )}`
                : ""}
            </Typography>
          </Box>
        </Box>

        {/* Tabs navigation */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
            variant={isMobile ? "fullWidth" : "standard"}
          >
            <Tab
              icon={<AccountIcon />}
              label="Profile"
              id="profile-tab-0"
              aria-controls="profile-tabpanel-0"
            />
            <Tab
              icon={<SecurityIcon />}
              label="Security"
              id="profile-tab-1"
              aria-controls="profile-tabpanel-1"
            />
            <Tab
              icon={<NotificationsIcon />}
              label="Notifications"
              id="profile-tab-2"
              aria-controls="profile-tabpanel-2"
            />
          </Tabs>
        </Box>

        {/* Tab panels */}
        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <ProfileInfo user={user} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <SecuritySettings />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <NotificationSettings />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserProfile;
