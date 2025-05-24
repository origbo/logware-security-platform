import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import VulnerabilityDashboard from "../../components/vulnerabilities/VulnerabilityDashboard";
import VulnerabilityList from "../../components/vulnerabilities/VulnerabilityList";
import VulnerabilityScanner from "../../components/vulnerabilities/VulnerabilityScanner";
import VulnerabilityReports from "../../components/vulnerabilities/VulnerabilityReports";
import { generateMockVulnerabilityData } from "../../utils/mockData";

// Vulnerability data interfaces
export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  status: "open" | "in-progress" | "resolved" | "accepted" | "false-positive";
  cvssScore: number;
  cveId?: string;
  affected: string[];
  discoveredDate: Date;
  lastUpdated: Date;
  dueDate?: Date;
  remediation?: string;
  assignedTo?: string;
  category: string;
  tags: string[];
  systemsAffected: number;
  exploitAvailable: boolean;
  patchAvailable: boolean;
  reportedBy: string;
}

export interface ScanResult {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  status: "completed" | "failed" | "in-progress";
  targets: string[];
  vulnerabilitiesFound: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vulnerability-tabpanel-${index}`}
      aria-labelledby={`vulnerability-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VulnerabilitiesPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    try {
      const data = generateMockVulnerabilityData();
      setVulnerabilities(data.vulnerabilities);
      setScanResults(data.scanResults);
      setLoading(false);
    } catch (err) {
      setError("Failed to load vulnerability data. Please try again later.");
      setLoading(false);
    }
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    setLoading(true);
    try {
      const data = generateMockVulnerabilityData();
      setVulnerabilities(data.vulnerabilities);
      setScanResults(data.scanResults);
      setLoading(false);
    } catch (err) {
      setError("Failed to refresh vulnerability data. Please try again later.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4" component="h1">
            Vulnerability Management
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="vulnerability tabs"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              label="Dashboard"
              id="vulnerability-tab-0"
              aria-controls="vulnerability-tabpanel-0"
            />
            <Tab
              label="Vulnerabilities"
              id="vulnerability-tab-1"
              aria-controls="vulnerability-tabpanel-1"
            />
            <Tab
              label="Scanner"
              id="vulnerability-tab-2"
              aria-controls="vulnerability-tabpanel-2"
            />
            <Tab
              label="Reports"
              id="vulnerability-tab-3"
              aria-controls="vulnerability-tabpanel-3"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <VulnerabilityDashboard
            vulnerabilities={vulnerabilities}
            scanResults={scanResults}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <VulnerabilityList vulnerabilities={vulnerabilities} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <VulnerabilityScanner scanResults={scanResults} />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <VulnerabilityReports
            vulnerabilities={vulnerabilities}
            scanResults={scanResults}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default VulnerabilitiesPage;
