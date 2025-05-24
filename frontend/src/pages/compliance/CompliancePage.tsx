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
  Snackbar,
  Badge,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ComplianceDashboard from "../../components/compliance/ComplianceDashboard";
import ComplianceFrameworks from "../../components/compliance/ComplianceFrameworks";
import ComplianceReports from "../../components/compliance/ComplianceReports";
import ComplianceAudits from "../../components/compliance/ComplianceAudits";
import ComplianceAssessment from "../../components/compliance/ComplianceAssessment";
import { generateMockComplianceData } from "../../utils/mockData";
import {
  generateComplianceAlerts,
  sendComplianceAlerts,
  ComplianceAlert,
} from "../../services/integrations/complianceAlertService";
import {
  generateComplianceHealthMetrics,
  generateComplianceHealthAlerts,
  sendComplianceHealthMetrics,
  sendComplianceHealthAlerts,
} from "../../services/integrations/complianceHealthService";

// Compliance data interfaces
export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  controls: ComplianceControl[];
  overallScore: number;
  lastUpdated: Date;
  nextAuditDate?: Date;
  status: "compliant" | "non-compliant" | "partially-compliant" | "pending";
}

export interface ComplianceControl {
  id: string;
  frameworkId: string;
  category: string;
  controlId: string;
  title: string;
  description: string;
  requirement: string;
  status: "compliant" | "non-compliant" | "partially-compliant" | "pending";
  evidence?: string[];
  score: number;
  lastAssessed: Date;
  remediationPlan?: string;
  owner?: string;
  dueDate?: Date;
  priority: "critical" | "high" | "medium" | "low";
}

export interface ComplianceAudit {
  id: string;
  frameworkId: string;
  title: string;
  status: "scheduled" | "in-progress" | "completed" | "archived";
  startDate: Date;
  endDate: Date;
  auditor: string;
  findings: string[];
  score: number;
  reportUrl?: string;
}

export interface AssessmentResult {
  frameworkId: string;
  frameworkName: string;
  date: Date;
  answers: any[];
  score: number;
  completedControls: number;
  totalControls: number;
  status: "compliant" | "non-compliant" | "partially-compliant";
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
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CompliancePage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState<
    AssessmentResult[]
  >([]);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    try {
      const data = generateMockComplianceData();
      setFrameworks(data.frameworks);
      setAudits(data.audits);

      // Generate initial alerts based on compliance data
      const initialAlerts = generateComplianceAlerts(data.frameworks);
      setAlerts(initialAlerts);

      // Send health metrics on initial load
      const healthMetrics = generateComplianceHealthMetrics(data.frameworks);
      const healthAlerts = generateComplianceHealthAlerts(data.frameworks);

      // Send metrics and alerts to health monitoring system
      sendComplianceHealthMetrics(healthMetrics);
      sendComplianceHealthAlerts(healthAlerts);

      setLoading(false);
    } catch (err) {
      setError("Failed to load compliance data. Please try again later.");
      setLoading(false);
    }
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = generateMockComplianceData();
      setFrameworks(data.frameworks);
      setAudits(data.audits);

      // Generate new alerts based on refreshed data
      const newAlerts = generateComplianceAlerts(data.frameworks);
      await sendComplianceAlerts(newAlerts);
      setAlerts(newAlerts);

      // Update health metrics and alerts
      const healthMetrics = generateComplianceHealthMetrics(data.frameworks);
      const healthAlerts = generateComplianceHealthAlerts(data.frameworks);

      // Send updated metrics and alerts to health monitoring system
      await Promise.all([
        sendComplianceHealthMetrics(healthMetrics),
        sendComplianceHealthAlerts(healthAlerts),
      ]);

      setLoading(false);
    } catch (err) {
      setError("Failed to refresh compliance data. Please try again later.");
      setLoading(false);
    }
  };

  // Handle assessment completion
  const handleAssessmentComplete = async (result: AssessmentResult) => {
    // Update the framework with assessment results
    const updatedFrameworks = frameworks.map((framework) => {
      if (framework.id === result.frameworkId) {
        return {
          ...framework,
          overallScore: result.score,
          status: result.status,
          lastUpdated: result.date,
        };
      }
      return framework;
    });

    setFrameworks(updatedFrameworks);

    // Add assessment to history
    setAssessmentHistory((prev) => [...prev, result]);

    // Generate and send compliance alerts
    const newAlerts = generateComplianceAlerts(updatedFrameworks, result);
    await sendComplianceAlerts(newAlerts);

    // Update local alerts state
    setAlerts((prev) => [...prev, ...newAlerts]);

    // Update health metrics and alerts
    const healthMetrics = generateComplianceHealthMetrics(updatedFrameworks);
    const healthAlerts = generateComplianceHealthAlerts(updatedFrameworks);

    // Send updated metrics and alerts to health monitoring system
    await Promise.all([
      sendComplianceHealthMetrics(healthMetrics),
      sendComplianceHealthAlerts(healthAlerts),
    ]);

    // Show success message
    setSuccessMessage(
      `Assessment for ${result.frameworkName} completed successfully with a score of ${result.score}%`
    );

    // Switch to dashboard tab to see results
    setActiveTab(0);
  };

  // Handle closing success message
  const handleCloseSuccessMessage = () => {
    setSuccessMessage(null);
  };

  // Toggle alerts panel display
  const toggleAlerts = () => {
    setShowAlerts(!showAlerts);
  };

  // Clear all alerts
  const clearAlerts = () => {
    setAlerts([]);
    setShowAlerts(false);
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
            Compliance Management
          </Typography>
        </Grid>
        <Grid item>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Badge badgeContent={alerts.length} color="error" sx={{ mr: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<NotificationsIcon />}
                onClick={toggleAlerts}
              >
                Alerts
              </Button>
            </Badge>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh Data
            </Button>
          </Box>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Alerts Panel */}
      {showAlerts && alerts.length > 0 && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Compliance Alerts</Typography>
            <Button variant="outlined" size="small" onClick={clearAlerts}>
              Clear All
            </Button>
          </Box>
          <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
            {alerts.map((alert, index) => (
              <Alert
                key={alert.id}
                severity={
                  alert.severity === "critical"
                    ? "error"
                    : alert.severity === "high"
                    ? "warning"
                    : alert.severity === "medium"
                    ? "info"
                    : "success"
                }
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2">{alert.title}</Typography>
                <Typography variant="body2">{alert.description}</Typography>
                <Typography variant="caption">
                  {new Date(alert.timestamp).toLocaleString()}
                </Typography>
              </Alert>
            ))}
          </Box>
        </Paper>
      )}

      {showAlerts && alerts.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No compliance alerts at this time.
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="compliance tabs"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              label="Dashboard"
              id="compliance-tab-0"
              aria-controls="compliance-tabpanel-0"
            />
            <Tab
              label="Frameworks"
              id="compliance-tab-1"
              aria-controls="compliance-tabpanel-1"
            />
            <Tab
              label="Assessment"
              id="compliance-tab-2"
              aria-controls="compliance-tabpanel-2"
            />
            <Tab
              label="Reports"
              id="compliance-tab-3"
              aria-controls="compliance-tabpanel-3"
            />
            <Tab
              label="Audits"
              id="compliance-tab-4"
              aria-controls="compliance-tabpanel-4"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <ComplianceDashboard frameworks={frameworks} audits={audits} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ComplianceFrameworks frameworks={frameworks} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ComplianceAssessment
            frameworks={frameworks}
            onAssessmentComplete={handleAssessmentComplete}
            assessmentHistory={assessmentHistory}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <ComplianceReports frameworks={frameworks} audits={audits} />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <ComplianceAudits audits={audits} frameworks={frameworks} />
        </TabPanel>
      </Paper>

      {/* Success message snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccessMessage}
        message={successMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default CompliancePage;
