import React, { useState } from "react";
import { Box, Paper, Tabs, Tab, Typography } from "@mui/material";
import ActiveExecutionsPanel from "./dashboard/ActiveExecutionsPanel";
import ExecutionHistorySection from "./dashboard/ExecutionHistorySection";
import PerformanceMetricsPanel from "./dashboard/PerformanceMetricsPanel";
import AuditLogsPanel from "./dashboard/AuditLogsPanel";

const AutomationExecutionDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Automation Execution Dashboard
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Active Executions" />
          <Tab label="Execution History" />
          <Tab label="Performance Metrics" />
          <Tab label="Audit Logs" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <ActiveExecutionsPanel />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ExecutionHistorySection />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <PerformanceMetricsPanel />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <AuditLogsPanel />
      </TabPanel>
    </Box>
  );
};

// TabPanel component
const TabPanel: React.FC<{
  children: React.ReactNode;
  value: number;
  index: number;
}> = (props) => {
  const { children, value, index } = props;
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export default AutomationExecutionDashboard;
