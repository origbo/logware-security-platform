import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
} from "@mui/material";
import NetworkDashboard from "../../components/network/NetworkDashboard";
import NetworkDevices from "../../components/network/NetworkDevices";
import NetworkTraffic from "../../components/network/NetworkTraffic";
import NetworkAlerts from "../../components/network/NetworkAlerts";
import {
  generateNetworkDevices,
  generateNetworkTraffic,
  generateNetworkAlerts,
} from "../../utils/mockData";

// Define interfaces for network monitoring data
export interface NetworkDevice {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: string;
  status: "online" | "offline" | "warning";
  lastSeen: Date;
  os?: string;
  location?: string;
  owner?: string;
  services: string[];
  trafficIn: number;
  trafficOut: number;
  riskScore: number;
  tags: string[];
}

export interface TrafficData {
  id: string;
  timestamp: Date;
  sourceIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
  protocol: string;
  bytesTransferred: number;
  packetsTransferred: number;
  duration: number;
  status: "allowed" | "blocked" | "suspicious";
  deviceId: string;
  serviceName?: string;
}

export interface NetworkAlert {
  id: string;
  timestamp: Date;
  type: "intrusion" | "malware" | "data_loss" | "policy_violation" | "anomaly";
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  sourceIp: string;
  destinationIp: string;
  deviceId: string;
  status: "new" | "investigating" | "resolved" | "false_positive";
  affectedDevices: string[];
  relatedAlerts: string[];
  mitigationSteps?: string;
  assignedTo?: string;
}

const NetworkMonitoringPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Generate mock data
  const devices = generateNetworkDevices();
  const trafficData = generateNetworkTraffic(devices);
  const alerts = generateNetworkAlerts(devices);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Network Monitoring
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Monitor network devices, traffic patterns, and security alerts to
          detect and respond to threats in real-time.
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
            <Tab label="Dashboard" />
            <Tab label="Devices" />
            <Tab label="Traffic Analysis" />
            <Tab label="Alerts" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <NetworkDashboard
                devices={devices}
                trafficData={trafficData}
                alerts={alerts}
              />
            )}
            {activeTab === 1 && <NetworkDevices devices={devices} />}
            {activeTab === 2 && (
              <NetworkTraffic trafficData={trafficData} devices={devices} />
            )}
            {activeTab === 3 && (
              <NetworkAlerts alerts={alerts} devices={devices} />
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NetworkMonitoringPage;
