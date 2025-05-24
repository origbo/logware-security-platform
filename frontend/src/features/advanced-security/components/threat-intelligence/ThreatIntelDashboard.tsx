/**
 * Threat Intelligence Dashboard
 *
 * Main component for the threat intelligence platform
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tab,
  Tabs,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Description as DescriptionIcon,
  Public as PublicIcon,
} from "@mui/icons-material";

import { ThreatDashboard } from "./ThreatDashboard";
import { ThreatIndicatorsList } from "./ThreatIndicatorsList";
import { ThreatActorsList } from "./ThreatActorsList";
import { ThreatReportsList } from "./ThreatReportsList";
import { ThreatMap } from "./ThreatMap";

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`threat-intel-tabpanel-${index}`}
      aria-labelledby={`threat-intel-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
const a11yProps = (index: number) => {
  return {
    id: `threat-intel-tab-${index}`,
    "aria-controls": `threat-intel-tabpanel-${index}`,
  };
};

const ThreatIntelDashboard: React.FC = () => {
  const theme = useTheme();

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Threat Intelligence tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Dashboard"
              icon={<DashboardIcon />}
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              label="Threat Indicators"
              icon={<SecurityIcon />}
              iconPosition="start"
              {...a11yProps(1)}
            />
            <Tab
              label="Threat Actors"
              icon={<GroupIcon />}
              iconPosition="start"
              {...a11yProps(2)}
            />
            <Tab
              label="Threat Reports"
              icon={<DescriptionIcon />}
              iconPosition="start"
              {...a11yProps(3)}
            />
            <Tab
              label="Global Threat Map"
              icon={<PublicIcon />}
              iconPosition="start"
              {...a11yProps(4)}
            />
          </Tabs>
        </Box>

        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <ThreatDashboard />
        </TabPanel>

        {/* Threat Indicators Tab */}
        <TabPanel value={tabValue} index={1}>
          <ThreatIndicatorsList />
        </TabPanel>

        {/* Threat Actors Tab */}
        <TabPanel value={tabValue} index={2}>
          <ThreatActorsList />
        </TabPanel>

        {/* Threat Reports Tab */}
        <TabPanel value={tabValue} index={3}>
          <ThreatReportsList />
        </TabPanel>

        {/* Global Threat Map Tab */}
        <TabPanel value={tabValue} index={4}>
          <ThreatMap />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ThreatIntelDashboard;
