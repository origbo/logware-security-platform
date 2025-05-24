/**
 * Cloud Security Reporting Engine
 *
 * Main component for generating comprehensive security reports across AWS, Azure, and GCP
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Snackbar,
  useTheme,
} from "@mui/material";
import {
  Description as ReportIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Settings as TemplateIcon,
} from "@mui/icons-material";

// Import subcomponents
import ReportTemplateSelector from "./ReportTemplateSelector";
import ReportConfiguration from "./ReportConfiguration";
import ReportScheduleManager from "./ReportScheduleManager";
import ReportHistory from "./ReportHistory";

// Import service
import { useGenerateReportMutation } from "../../services/reportingService";

// Interface for tab panel props
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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
function a11yProps(index: number) {
  return {
    id: `report-tab-${index}`,
    "aria-controls": `report-tabpanel-${index}`,
  };
}

interface CloudSecurityReportingEngineProps {
  accountId?: string;
}

/**
 * Cloud Security Reporting Engine
 */
const CloudSecurityReportingEngine: React.FC<
  CloudSecurityReportingEngineProps
> = ({ accountId }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Generate report mutation
  const [
    generateReport,
    { isLoading: isGenerating, isSuccess, isError, error: apiError },
  ] = useGenerateReportMutation();

  // State for selected report template
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // State for report configuration
  const [reportConfig, setReportConfig] = useState({
    name: "",
    description: "",
    cloudProviders: [] as string[],
    timeRange: "30",
    format: "pdf",
    includeExecutiveSummary: true,
    includeDetailedFindings: true,
    includeRemediation: true,
    includeComplianceMapping: false,
    includeResourceDetails: true,
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);

    // Auto switch to configuration tab when template is selected
    setTabValue(1);
  };

  // Handle config change
  const handleConfigChange = (config: Partial<typeof reportConfig>) => {
    setReportConfig({
      ...reportConfig,
      ...config,
    });
  };

  // Handle success and error feedback
  useEffect(() => {
    if (isSuccess) {
      setSuccessMessage("Report generated successfully!");
      setTabValue(3); // Switch to history tab
    } else if (isError && apiError) {
      setError(
        typeof apiError === "string"
          ? apiError
          : "Failed to generate report. Please try again."
      );
    }
  }, [isSuccess, isError, apiError]);

  // Handle closing success message
  const handleCloseSuccessMessage = () => {
    setSuccessMessage(null);
  };

  // Handle generate report action
  const handleGenerateReport = async () => {
    if (!selectedTemplate) {
      setError("Please select a report template first");
      return;
    }

    setError(null);

    try {
      // Send the request to the API
      await generateReport({
        templateId: selectedTemplate,
        config: reportConfig,
      }).unwrap();
    } catch (err) {
      console.error("Error generating report:", err);
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <ReportIcon fontSize="large" color="primary" />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              Cloud Security Reporting Engine
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Generate comprehensive security reports across AWS, Azure, and
              Google Cloud Platform
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedTemplate || isGenerating}
              onClick={handleGenerateReport}
              startIcon={
                isGenerating ? <CircularProgress size={20} /> : <ReportIcon />
              }
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="report engine tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<TemplateIcon />} label="Templates" {...a11yProps(0)} />
          <Tab icon={<ReportIcon />} label="Configuration" {...a11yProps(1)} />
          <Tab icon={<ScheduleIcon />} label="Schedule" {...a11yProps(2)} />
          <Tab icon={<HistoryIcon />} label="History" {...a11yProps(3)} />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <TabPanel value={tabValue} index={0}>
          <ReportTemplateSelector
            onSelect={handleTemplateSelect}
            selectedTemplateId={selectedTemplate}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ReportConfiguration
            config={reportConfig}
            onChange={handleConfigChange}
            accountId={accountId}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ReportScheduleManager
            selectedTemplate={selectedTemplate}
            reportConfig={reportConfig}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <ReportHistory accountId={accountId} />
        </TabPanel>
      </Box>

      {/* Success message */}
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

export default CloudSecurityReportingEngine;
