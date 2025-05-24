import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  DeveloperBoard as DeveloperBoardIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  CloudCircle as CloudCircleIcon,
} from "@mui/icons-material";
import { useGetComplianceFrameworksQuery } from "../../services/complianceService";
import { ComplianceStatus } from "../../types/cloudSecurityTypes";
import FrameworksList from "./FrameworksList";
import ComplianceAssessments from "./ComplianceAssessments";
import CreateFrameworkDialog from "./CreateFrameworkDialog";

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
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * Compliance Dashboard Component
 * Main dashboard for compliance management features
 */
const ComplianceDashboard: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch compliance frameworks
  const {
    data: frameworks,
    isLoading,
    isError,
    error,
  } = useGetComplianceFrameworksQuery();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate compliance statistics
  const getComplianceStats = () => {
    if (!frameworks)
      return { total: 0, compliant: 0, nonCompliant: 0, partial: 0 };

    const total = frameworks.length;
    const compliant = frameworks.filter((f) =>
      f.controls.every((c) => c.status === ComplianceStatus.COMPLIANT)
    ).length;
    const nonCompliant = frameworks.filter((f) =>
      f.controls.some((c) => c.status === ComplianceStatus.NON_COMPLIANT)
    ).length;
    const partial = total - compliant - nonCompliant;

    return { total, compliant, nonCompliant, partial };
  };

  const stats = getComplianceStats();

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Compliance Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Framework
        </Button>
      </Box>

      {/* Dashboard Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Frameworks
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <DeveloperBoardIcon
                  sx={{ mr: 1, color: theme.palette.primary.main }}
                />
                <Typography variant="h4">{stats.total}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Compliant
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <VerifiedUserIcon
                  sx={{ mr: 1, color: theme.palette.success.main }}
                />
                <Typography variant="h4">{stats.compliant}</Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                {stats.total > 0
                  ? Math.round((stats.compliant / stats.total) * 100)
                  : 0}
                % of frameworks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Non-Compliant
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <SecurityIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                <Typography variant="h4">{stats.nonCompliant}</Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                {stats.total > 0
                  ? Math.round((stats.nonCompliant / stats.total) * 100)
                  : 0}
                % of frameworks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Assessments
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <AssessmentIcon
                  sx={{ mr: 1, color: theme.palette.info.main }}
                />
                <Typography variant="h4">
                  {frameworks?.reduce(
                    (sum, f) => sum + (f.controls?.length || 0),
                    0
                  ) || 0}
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                Total controls across all frameworks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Tabs Content */}
      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="compliance tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<DeveloperBoardIcon />}
            iconPosition="start"
            label="Frameworks"
          />
          <Tab
            icon={<AssessmentIcon />}
            iconPosition="start"
            label="Assessments"
          />
        </Tabs>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              Error loading compliance frameworks:{" "}
              {(error as any)?.data?.message || "Unknown error"}
            </Alert>
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <FrameworksList frameworks={frameworks || []} />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <ComplianceAssessments />
            </TabPanel>
          </>
        )}
      </Paper>

      {/* Create Framework Dialog */}
      <CreateFrameworkDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Box>
  );
};

export default ComplianceDashboard;
