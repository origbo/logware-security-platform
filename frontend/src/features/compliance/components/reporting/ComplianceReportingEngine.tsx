/**
 * Compliance Reporting Engine
 *
 * Main container component for the compliance reporting engine
 * Manages overall reporting functionality and integration with
 * all compliance frameworks (GDPR, PCI-DSS, HIPAA, ISO 27001)
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Description as ReportIcon,
  FileDownload as DownloadIcon,
  Schedule as ScheduleIcon,
  BarChart as ChartIcon,
  Assignment as TemplateIcon,
  FindInPage as EvidenceIcon,
  ShowChart as GapAnalysisIcon,
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";

// Import subcomponents
import ReportTemplateManager from "./ReportTemplateManager";
import EvidenceCollectionSystem from "./EvidenceCollectionSystem";
import EvidenceUpload from "./EvidenceUpload";
import EvidenceDetails from "./EvidenceDetails";
import EvidenceCampaigns from "./EvidenceCampaigns";
import GapAnalysisVisualization from "./GapAnalysisVisualization";
import ReportScheduling from "./ReportScheduling";

// Import types
import { EvidenceItem } from "../../types/evidenceTypes";

// Props interface
interface ComplianceReportingEngineProps {
  framework?: string;
}

// Tab panel interface
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
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

/**
 * Compliance Reporting Engine Component
 */
const ComplianceReportingEngine: React.FC<ComplianceReportingEngineProps> = ({
  framework = "ALL",
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Report stats
  const [reportStats, setReportStats] = useState({
    totalReports: 0,
    completedReports: 0,
    pendingReports: 0,
    upcomingReports: 0,
  });

  // Evidence dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(
    null
  );
  const [evidenceDetailsOpen, setEvidenceDetailsOpen] = useState(false);

  // Evidence subtabs
  const [evidenceSubtab, setEvidenceSubtab] = useState(0);

  // Load report stats
  useEffect(() => {
    const fetchReportStats = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Sample data
        setReportStats({
          totalReports: 24,
          completedReports: 18,
          pendingReports: 3,
          upcomingReports: 3,
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching report stats:", err);
        setError("Failed to load report statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchReportStats();
  }, [framework]);

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    // Reset evidence subtab when switching away from evidence tab
    if (newValue !== 1) {
      setEvidenceSubtab(0);
    }
  };

  // Handle evidence subtab change
  const handleEvidenceSubtabChange = (
    _: React.SyntheticEvent,
    newValue: number
  ) => {
    setEvidenceSubtab(newValue);
  };

  // Handle evidence upload
  const handleEvidenceUpload = async (formData: FormData) => {
    // In a real application, you would call the API here
    console.log("Uploading evidence:", Object.fromEntries(formData.entries()));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Close dialog
    setUploadDialogOpen(false);
  };

  // Handle evidence view
  const handleEvidenceView = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence);
    setEvidenceDetailsOpen(true);
  };

  // Render stats card
  const renderStatsCard = (title: string, value: number, color: string) => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h3" color={color}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render evidence tab content
  const renderEvidenceTabContent = () => {
    return (
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={evidenceSubtab}
            onChange={handleEvidenceSubtabChange}
            aria-label="evidence tabs"
          >
            <Tab label="Evidence Library" />
            <Tab label="Evidence Campaigns" />
          </Tabs>
        </Box>

        {evidenceSubtab === 0 && (
          <>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                onClick={() => setUploadDialogOpen(true)}
                startIcon={<EvidenceIcon />}
              >
                Upload Evidence
              </Button>
            </Box>

            <EvidenceCollectionSystem framework={framework} />

            {/* Evidence Upload Dialog */}
            <EvidenceUpload
              open={uploadDialogOpen}
              onClose={() => setUploadDialogOpen(false)}
              onUpload={handleEvidenceUpload}
              framework={framework !== "ALL" ? framework : undefined}
            />

            {/* Evidence Details Dialog */}
            <EvidenceDetails
              evidence={selectedEvidence}
              open={evidenceDetailsOpen}
              onClose={() => setEvidenceDetailsOpen(false)}
              onApprove={async (id: string, notes: string) => {
                console.log("Approving evidence:", id, notes);
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }}
              onReject={async (id: string, reason: string) => {
                console.log("Rejecting evidence:", id, reason);
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }}
              onDelete={async (id: string) => {
                console.log("Deleting evidence:", id);
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }}
            />
          </>
        )}

        {evidenceSubtab === 1 && (
          <EvidenceCampaigns
            framework={framework !== "ALL" ? framework : undefined}
          />
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Compliance Reporting Engine
        {framework !== "ALL" && ` - ${framework}`}
      </Typography>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Report stats overview */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Report Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              "Total Reports",
              reportStats.totalReports,
              theme.palette.text.primary
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              "Completed",
              reportStats.completedReports,
              theme.palette.success.main
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              "In Progress",
              reportStats.pendingReports,
              theme.palette.warning.main
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderStatsCard(
              "Upcoming",
              reportStats.upcomingReports,
              theme.palette.info.main
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Main tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<TemplateIcon />} label="Templates" />
          <Tab icon={<EvidenceIcon />} label="Evidence" />
          <Tab icon={<GapAnalysisIcon />} label="Gap Analysis" />
          <Tab icon={<ScheduleIcon />} label="Scheduling" />
          <Tab icon={<DashboardIcon />} label="Executive Dashboard" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ minHeight: 500 }}>
        <TabPanel value={activeTab} index={0}>
          <ReportTemplateManager framework={framework} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {renderEvidenceTabContent()}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <GapAnalysisVisualization framework={framework} />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <ReportScheduling framework={framework} />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h5" gutterBottom>
              Executive Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              The Executive Dashboard is currently under development.
            </Typography>
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default ComplianceReportingEngine;
