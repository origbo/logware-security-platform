/**
 * Attack Path Dashboard
 *
 * Main component for the attack path modeling and simulation feature
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tab,
  Tabs,
  useTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  DeviceHub as DeviceHubIcon,
  Security as SecurityIcon,
  BugReport as BugReportIcon,
  Build as BuildIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";

import { AttackPathOverview } from "./AttackPathOverview";
import { AssetInventory } from "./AssetInventory";
import { VulnerabilityManagement } from "./VulnerabilityManagement";
import { AttackPathVisualizer } from "./AttackPathVisualizer";
import { AttackSimulation } from "./AttackSimulation";

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
      id={`attack-path-tabpanel-${index}`}
      aria-labelledby={`attack-path-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
const a11yProps = (index: number) => {
  return {
    id: `attack-path-tab-${index}`,
    "aria-controls": `attack-path-tabpanel-${index}`,
  };
};

const AttackPathDashboard: React.FC = () => {
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
            aria-label="Attack Path Modeling tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Overview"
              icon={<DashboardIcon />}
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              label="Asset Inventory"
              icon={<DeviceHubIcon />}
              iconPosition="start"
              {...a11yProps(1)}
            />
            <Tab
              label="Vulnerabilities"
              icon={<BugReportIcon />}
              iconPosition="start"
              {...a11yProps(2)}
            />
            <Tab
              label="Attack Paths"
              icon={<SecurityIcon />}
              iconPosition="start"
              {...a11yProps(3)}
            />
            <Tab
              label="Simulation"
              icon={<PlayArrowIcon />}
              iconPosition="start"
              {...a11yProps(4)}
            />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <AttackPathOverview />
        </TabPanel>

        {/* Asset Inventory Tab */}
        <TabPanel value={tabValue} index={1}>
          <AssetInventory />
        </TabPanel>

        {/* Vulnerabilities Tab */}
        <TabPanel value={tabValue} index={2}>
          <VulnerabilityManagement />
        </TabPanel>

        {/* Attack Paths Tab */}
        <TabPanel value={tabValue} index={3}>
          <AttackPathVisualizer />
        </TabPanel>

        {/* Simulation Tab */}
        <TabPanel value={tabValue} index={4}>
          <AttackSimulation />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AttackPathDashboard;
