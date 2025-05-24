import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  useTheme,
} from "@mui/material";
import GeneralSettings from "../../components/settings/GeneralSettings";
import SecuritySettings from "../../components/settings/SecuritySettings";
import NotificationSettings from "../../components/settings/NotificationSettings";
import IntegrationSettings from "../../components/settings/IntegrationSettings";
import DataRetentionSettings from "../../components/settings/DataRetentionSettings";
import AppearanceSettings from "../../components/settings/AppearanceSettings";

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Configure system settings and preferences to customize your Logware
          Security Platform experience.
        </Typography>

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="General" />
            <Tab label="Security" />
            <Tab label="Notifications" />
            <Tab label="Integrations" />
            <Tab label="Data Retention" />
            <Tab label="Appearance" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && <GeneralSettings />}
            {activeTab === 1 && <SecuritySettings />}
            {activeTab === 2 && <NotificationSettings />}
            {activeTab === 3 && <IntegrationSettings />}
            {activeTab === 4 && <DataRetentionSettings />}
            {activeTab === 5 && <AppearanceSettings />}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SettingsPage;
