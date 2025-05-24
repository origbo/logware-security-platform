/**
 * NetworkMonitoringPage
 *
 * Main page for network monitoring and visualization in the Logware Security Platform.
 * Integrates network topology visualization and network alerts.
 */
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Router as RouterIcon,
  Shield as ShieldIcon,
  Timeline as TimelineIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";

import NetworkVisualization from "../features/network/components/NetworkVisualization";
import NetworkAlerts from "../components/network/NetworkAlerts";

// Mock data
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

export interface NetworkAlert {
  id: string;
  timestamp: Date;
  deviceId: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  sourceIp: string;
  destinationIp: string;
  protocol: string;
  status: "active" | "investigating" | "resolved" | "false_positive";
  details: string;
  title: string;
  description: string;
  affectedDevices: string[];
  relatedAlerts: string[];
  recommendedAction?: string;
}

// Mock devices for demo
const mockDevices: NetworkDevice[] = [
  {
    id: "fw1",
    name: "Main Firewall",
    type: "firewall",
    ip: "192.168.1.1",
    mac: "00:1A:2B:3C:4D:5E",
    status: "online",
    os: "OPNsense 23.1",
    lastSeen: new Date(),
    location: "HQ",
    owner: "IT Department",
    services: ["HTTPS", "SSH", "DNS"],
    trafficIn: 867,
    trafficOut: 432,
    riskScore: 15,
    tags: ["critical", "security"]
  },
  {
    id: "router1",
    name: "Core Router",
    type: "router",
    ip: "192.168.1.2",
    mac: "00:2C:3D:4E:5F:6G",
    status: "online",
    os: "Cisco IOS 15.7",
    lastSeen: new Date(),
    location: "HQ",
    owner: "IT Department",
    services: ["HTTPS", "SSH", "SNMP"],
    trafficIn: 1045,
    trafficOut: 876,
    riskScore: 20,
    tags: ["critical", "network"]
  },
  {
    id: "switch1",
    name: "Switch 1",
    type: "switch",
    ip: "192.168.1.3",
    mac: "00:3D:4E:5F:6G:7H",
    status: "online",
    lastSeen: new Date(),
    location: "HQ",
    services: ["SSH", "SNMP"],
    trafficIn: 765,
    trafficOut: 523,
    riskScore: 12,
    tags: ["network"]
  },
  {
    id: "switch2",
    name: "Switch 2",
    type: "switch",
    ip: "192.168.1.4",
    mac: "00:4E:5F:6G:7H:8I",
    status: "warning",
    lastSeen: new Date(),
    services: ["SSH", "SNMP"],
    trafficIn: 432,
    trafficOut: 345,
    riskScore: 35,
    tags: ["network"]
  },
  {
    id: "server1",
    name: "Web Server",
    type: "server",
    ip: "192.168.2.10",
    mac: "00:5F:6G:7H:8I:9J",
    status: "online",
    os: "Ubuntu 22.04 LTS",
    lastSeen: new Date(),
    location: "Data Center",
    owner: "Web Team",
    services: ["HTTP", "HTTPS", "SSH"],
    trafficIn: 978,
    trafficOut: 865,
    riskScore: 18,
    tags: ["production", "web"]
  },
  {
    id: "server2",
    name: "Database Server",
    type: "server",
    ip: "192.168.2.11",
    mac: "00:6G:7H:8I:9J:0K",
    status: "online",
    os: "CentOS 8",
    lastSeen: new Date(),
    location: "Data Center",
    owner: "Database Team",
    services: ["SSH", "MySQL", "PostgreSQL"],
    trafficIn: 567,
    trafficOut: 432,
    riskScore: 25,
    tags: ["critical", "database"]
  },
];

// Mock alerts for demo
const mockAlerts: NetworkAlert[] = [
  {
    id: "na-001",
    deviceId: "server1",
    type: "Unauthorized access attempt",
    severity: "high",
    timestamp: new Date(Date.now() - 3600000),
    sourceIp: "198.51.100.34",
    destinationIp: "192.168.2.10",
    protocol: "TCP",
    status: "active",
    details: "Failed login attempts from 198.51.100.34 to SSH service on 192.168.2.10. 5 attempts detected.",
    title: "SSH Brute Force Attempt",
    description: "Multiple failed SSH login attempts detected from external IP address.",
    affectedDevices: ["server1"],
    relatedAlerts: [],
    recommendedAction: "Block source IP and investigate SSH configuration"
  },
  {
    id: "na-002",
    deviceId: "server2",
    type: "Data exfiltration attempt",
    severity: "medium",
    timestamp: new Date(Date.now() - 7200000),
    sourceIp: "192.168.2.11",
    destinationIp: "203.0.113.45",
    protocol: "TCP",
    status: "investigating",
    details: "Large data transfer (450MB) to external IP detected from Database Server. Unusual destination for this server.",
    recommendedAction: "Investigate data transfer and verify authorization"
  },
  {
    id: "na-003",
    deviceId: "fw1",
    type: "Port scanning detected",
    severity: "medium",
    timestamp: new Date(Date.now() - 10800000),
    sourceIp: "198.51.100.67",
    destinationIp: "192.168.1.1",
    protocol: "TCP",
    status: "active",
    details: "Sequential port scan from external IP targeting Main Firewall. 45 ports scanned in 2 minutes.",
    recommendedAction: "Block source IP and verify firewall rules"
  },
  {
    id: "na-004",
    deviceId: "server1",
    type: "Malware communication",
    severity: "critical",
    timestamp: new Date(Date.now() - 1800000),
    sourceIp: "192.168.3.12",
    destinationIp: "198.51.100.89",
    protocol: "TCP",
    status: "active",
    details: "Communication to known malware C2 server detected from internal IP. Matches signature for ransomware communication pattern.",
    recommendedAction: "Isolate device immediately and initiate incident response"
  },
  {
    id: "na-005",
    deviceId: "router1",
    type: "Suspicious DNS activity",
    severity: "low",
    timestamp: new Date(Date.now() - 86400000),
    sourceIp: "192.168.3.10",
    destinationIp: "192.168.1.1",
    protocol: "UDP",
    status: "resolved",
    details: "Multiple DNS requests to recently registered domain with low reputation score. 23 requests in 5 minutes.",
    recommendedAction: "Monitor for additional suspicious DNS activity"
  },
];

// Use mockDataUtils from utils to generate additional data if needed
// import mockDataUtils from "../utils/mockData";
// const generatedDevices = mockDataUtils.generateNetworkDevices();
// const generatedAlerts = mockDataUtils.generateNetworkAlerts(generatedDevices);

// Tab panel interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`network-tabpanel-${index}`}
      aria-labelledby={`network-tab-${index}`}
      {...other}
      style={{ height: "100%" }}
    >
      {value === index && <Box sx={{ height: "100%" }}>{children}</Box>}
    </div>
  );
};

// TabProps for accessibility
function a11yProps(index: number) {
  return {
    id: `network-tab-${index}`,
    "aria-controls": `network-tabpanel-${index}`,
  };
}

const NetworkMonitoringPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Helmet>
        <title>Network Monitoring | Logware Security Platform</title>
      </Helmet>

      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Container
          maxWidth={false}
          sx={{ flexGrow: 1, py: 3, display: "flex", flexDirection: "column" }}
        >
          {/* Header */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <RouterIcon fontSize="large" color="primary" />
              </Grid>
              <Grid item xs>
                <Typography variant="h5" component="h1" gutterBottom>
                  Network Monitoring
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Visualize network topology, monitor traffic patterns, and
                  detect security threats in real-time.
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ShieldIcon />}
                >
                  Run Network Scan
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="network monitoring tabs"
            >
              <Tab
                icon={<TimelineIcon />}
                label="Network Topology"
                {...a11yProps(0)}
              />
              <Tab
                icon={<ViewListIcon />}
                label="Network Alerts"
                {...a11yProps(1)}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ height: "100%", pt: 2 }}>
                <NetworkVisualization />
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ height: "100%", pt: 2 }}>
                <NetworkAlerts alerts={mockAlerts} devices={mockDevices} />
              </Box>
            </TabPanel>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default NetworkMonitoringPage;
