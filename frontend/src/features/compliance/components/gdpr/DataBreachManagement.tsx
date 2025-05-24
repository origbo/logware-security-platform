/**
 * Data Breach Management Component
 *
 * Handles the management of data breaches to comply with GDPR Articles 33-34
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridRenderCellParams,
  GridSelectionModel,
} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Error as ErrorIcon,
  FileDownload as ExportIcon,
} from "@mui/icons-material";

// Import types
import { DataBreach, BreachSeverity, BreachStatus, DataCategory } from '../../types/gdprTypes';

// Sample data - replace with API call in production
const sampleBreaches: DataBreach[] = [
  {
    id: "BR-2025-001",
    title: "Customer Database Unauthorized Access",
    description:
      "Unauthorized access detected to customer database containing personal information",
    detectedDate: "2025-04-15T08:30:00Z",
    detectedBy: "Security Monitoring System",
    severity: BreachSeverity.HIGH,
    status: BreachStatus.REMEDIATED,
    affectedDataCategories: [
      DataCategory.BASIC_IDENTIFIERS,
      DataCategory.CONTACT_INFO,
      DataCategory.FINANCIAL,
    ],
    affectedDataSubjects: "Customers",
    estimatedSubjectsCount: 1200,
    affectedSystems: [
      {
        id: "sys1",
        name: "CRM System",
        type: "APPLICATION",
        location: "Cloud (AWS)",
        securityMeasures: ["Encryption", "Access Control"],
        dataSubjectAccessCapable: true,
        dataDeletionCapable: true,
        dataExportCapable: true,
        businessOwner: "Sales Department",
        technicalOwner: "IT Department",
      },
    ],
    natureOfBreach: "Unauthorized access through compromised admin credentials",
    potentialConsequences: "Identity theft, financial fraud, spam emails",
    containmentMeasures:
      "Credentials revoked, IP addresses blocked, enhanced monitoring enabled",
    remedialActions:
      "Password reset for all users, MFA enforced, security audit performed",
    dpaNotificationRequired: true,
    dpaNotificationDate: "2025-04-17T10:15:00Z",
    dpaNotificationDetails: "Notification submitted to ICO via online portal",
    dataSubjectNotificationRequired: true,
    dataSubjectNotificationDate: "2025-04-18T09:00:00Z",
    dataSubjectNotificationMethod:
      "Email notification with details of breach and recommended actions",
    rootCause: "Phishing attack leading to compromised admin credentials",
    timeline: [
      {
        timestamp: "2025-04-15T08:30:00Z",
        event: "Unusual database activity detected by monitoring system",
        performedBy: "Automated Security Monitoring",
      },
      {
        timestamp: "2025-04-15T09:15:00Z",
        event: "Security team alerted and investigation started",
        performedBy: "Alex Chen",
      },
      {
        timestamp: "2025-04-15T11:30:00Z",
        event: "Breach confirmed - unauthorized access through admin account",
        performedBy: "Security Team",
      },
      {
        timestamp: "2025-04-15T12:00:00Z",
        event: "Admin credentials revoked and suspicious IP addresses blocked",
        performedBy: "Alex Chen",
      },
      {
        timestamp: "2025-04-16T09:00:00Z",
        event: "Detailed forensic analysis initiated",
        performedBy: "Security Team",
      },
      {
        timestamp: "2025-04-17T10:15:00Z",
        event: "DPA notification submitted",
        performedBy: "Privacy Officer",
      },
      {
        timestamp: "2025-04-18T09:00:00Z",
        event: "Customer notification emails sent",
        performedBy: "Marketing Team",
      },
    ],
    assignedTo: "Sarah Johnson",
  },
  {
    id: "BR-2025-002",
    title: "Lost Employee Laptop",
    description: "Unencrypted laptop with employee data lost by HR manager",
    detectedDate: "2025-04-20T16:45:00Z",
    detectedBy: "HR Manager (self-reported)",
    severity: BreachSeverity.MEDIUM,
    status: BreachStatus.INVESTIGATING,
    affectedDataCategories: [
      DataCategory.BASIC_IDENTIFIERS,
      DataCategory.CONTACT_INFO,
      DataCategory.DEMOGRAPHIC,
    ],
    affectedDataSubjects: "Employees",
    estimatedSubjectsCount: 75,
    affectedSystems: [
      {
        id: "sys3",
        name: "HR System",
        type: "APPLICATION",
        location: "Local",
        securityMeasures: ["Access Control"],
        dataSubjectAccessCapable: true,
        dataDeletionCapable: true,
        dataExportCapable: true,
        businessOwner: "HR Department",
        technicalOwner: "IT Department",
      },
    ],
    natureOfBreach: "Physical loss of device containing personal data",
    potentialConsequences: "Identity theft, privacy violation",
    containmentMeasures: "Attempted remote wipe, reported to police",
    remedialActions: "Investigation ongoing",
    dpaNotificationRequired: true,
    dataSubjectNotificationRequired: false,
    timeline: [
      {
        timestamp: "2025-04-20T16:45:00Z",
        event: "HR Manager reported lost laptop",
        performedBy: "Jane Doe (HR)",
      },
      {
        timestamp: "2025-04-20T17:00:00Z",
        event: "IT attempted remote wipe",
        performedBy: "IT Helpdesk",
      },
      {
        timestamp: "2025-04-20T17:30:00Z",
        event: "Incident logged in breach management system",
        performedBy: "Security Team",
      },
      {
        timestamp: "2025-04-21T09:15:00Z",
        event: "Police report filed",
        performedBy: "Legal Department",
      },
    ],
    assignedTo: "Michael Brown",
  },
  {
    id: "BR-2025-003",
    title: "Email Address List Leaked",
    description:
      "Marketing email sent with all recipients in CC instead of BCC",
    detectedDate: "2025-04-25T10:20:00Z",
    detectedBy: "Customer Service (customer complaint)",
    severity: BreachSeverity.LOW,
    status: BreachStatus.CLOSED,
    affectedDataCategories: [DataCategory.CONTACT_INFO],
    affectedDataSubjects: "Newsletter subscribers",
    estimatedSubjectsCount: 350,
    affectedSystems: [
      {
        id: "sys4",
        name: "Email Marketing System",
        type: "THIRD_PARTY",
        location: "Cloud",
        securityMeasures: ["Access Control"],
        dataSubjectAccessCapable: false,
        dataDeletionCapable: true,
        dataExportCapable: true,
        businessOwner: "Marketing Department",
        technicalOwner: "Marketing Ops",
      },
    ],
    natureOfBreach: "Accidental disclosure of email addresses",
    potentialConsequences: "Minor privacy concern, potential for spam",
    containmentMeasures: "Recall attempted (unsuccessful), apology sent",
    remedialActions:
      "Staff training on email protocols, improved approval process",
    dpaNotificationRequired: false,
    dataSubjectNotificationRequired: true,
    dataSubjectNotificationDate: "2025-04-25T15:45:00Z",
    dataSubjectNotificationMethod: "Apology email",
    rootCause: "Human error, insufficient validation process",
    timeline: [
      {
        timestamp: "2025-04-25T10:20:00Z",
        event: "Customer complaint received about email privacy",
        performedBy: "Customer Service",
      },
      {
        timestamp: "2025-04-25T10:35:00Z",
        event: "Marketing team notified and email verified",
        performedBy: "Customer Service Manager",
      },
      {
        timestamp: "2025-04-25T11:00:00Z",
        event: "Breach logged and assessment begun",
        performedBy: "Privacy Team",
      },
      {
        timestamp: "2025-04-25T13:30:00Z",
        event: "Risk assessment completed - low severity",
        performedBy: "Privacy Team",
      },
      {
        timestamp: "2025-04-25T15:45:00Z",
        event: "Apology email sent to all affected subscribers",
        performedBy: "Marketing Manager",
      },
    ],
    assignedTo: "Lisa Wong",
  },
];

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
      id={`breach-tabpanel-${index}`}
      aria-labelledby={`breach-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
function a11yProps(index: number) {
  return {
    id: `breach-tab-${index}`,
    "aria-controls": `breach-tabpanel-${index}`,
  };
}

// DataBreachManagement component
const DataBreachManagement: React.FC = () => {
  const theme = useTheme();

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for data
  const [breaches, setBreaches] = useState<DataBreach[]>([]);
  const [filteredBreaches, setFilteredBreaches] = useState<DataBreach[]>([]);
  const [selectedBreaches, setSelectedBreaches] = useState<GridSelectionModel>(
    []
  );
  const [loading, setLoading] = useState(true);

  // State for detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBreach, setSelectedBreach] = useState<DataBreach | null>(null);

  // Load data
  useEffect(() => {
    // In a real app, this would be an API call
    setBreaches(sampleBreaches);
    setLoading(false);
  }, []);

  // Filter breaches based on tab
  useEffect(() => {
    if (breaches.length === 0) return;

    let filtered: DataBreach[];

    switch (tabValue) {
      case 0: // All
        filtered = breaches;
        break;
      case 1: // Active
        filtered = breaches.filter(
          (breach) => breach.status !== BreachStatus.CLOSED
        );
        break;
      case 2: // High Severity
        filtered = breaches.filter(
          (breach) =>
            breach.severity === BreachSeverity.HIGH ||
            breach.severity === BreachSeverity.CRITICAL
        );
        break;
      case 3: // Reportable
        filtered = breaches.filter((breach) => breach.dpaNotificationRequired);
        break;
      case 4: // Closed
        filtered = breaches.filter(
          (breach) => breach.status === BreachStatus.CLOSED
        );
        break;
      default:
        filtered = breaches;
    }

    setFilteredBreaches(filtered);
  }, [tabValue, breaches]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle breach selection
  const handleBreachSelection = (newSelection: GridSelectionModel) => {
    setSelectedBreaches(newSelection);
  };

  // Open breach detail
  const handleOpenDetail = (breach: DataBreach) => {
    setSelectedBreach(breach);
    setDetailOpen(true);
  };

  // Close breach detail
  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedBreach(null);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format severity
  const formatSeverity = (severity: BreachSeverity) => {
    const color =
      severity === BreachSeverity.LOW
        ? "success"
        : severity === BreachSeverity.MEDIUM
        ? "warning"
        : severity === BreachSeverity.HIGH
        ? "error"
        : severity === BreachSeverity.CRITICAL
        ? "error"
        : "default";

    return <Chip label={severity} size="small" color={color} />;
  };

  // Format status
  const formatStatus = (status: BreachStatus) => {
    const color =
      status === BreachStatus.DETECTED
        ? "info"
        : status === BreachStatus.INVESTIGATING
        ? "warning"
        : status === BreachStatus.CONTAINED
        ? "warning"
        : status === BreachStatus.REMEDIATED
        ? "success"
        : status === BreachStatus.REPORTED
        ? "info"
        : status === BreachStatus.CLOSED
        ? "default"
        : "default";

    return <Chip label={status.replace("_", " ")} size="small" color={color} />;
  };

  // Format data categories
  const formatDataCategories = (categories: DataCategory[]) => {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {categories.slice(0, 2).map((category) => (
          <Chip
            key={category}
            label={category.replace("_", " ")}
            size="small"
            color={
              category === DataCategory.SPECIAL_CATEGORY ||
              category === DataCategory.HEALTH
                ? "error"
                : "default"
            }
            variant="outlined"
          />
        ))}
        {categories.length > 2 && (
          <Chip
            label={`+${categories.length - 2} more`}
            size="small"
            color="default"
          />
        )}
      </Box>
    );
  };

  // Format number of affected subjects
  const formatAffectedCount = (count: number) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  // Define columns for data grid
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Breach ID",
      width: 120,
    },
    {
      field: "title",
      headerName: "Title",
      width: 250,
      flex: 1,
    },
    {
      field: "severity",
      headerName: "Severity",
      width: 120,
      renderCell: (params: GridRenderCellParams<BreachSeverity>) =>
        formatSeverity(params.value as BreachSeverity),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params: GridRenderCellParams<BreachStatus>) =>
        formatStatus(params.value as BreachStatus),
    },
    {
      field: "affectedDataCategories",
      headerName: "Data Categories",
      width: 200,
      flex: 1,
      renderCell: (params: GridRenderCellParams<DataCategory[]>) =>
        formatDataCategories(params.value || []),
    },
    {
      field: "estimatedSubjectsCount",
      headerName: "Affected Count",
      width: 120,
      valueFormatter: (params) => formatAffectedCount(params.value as number),
    },
    {
      field: "detectedDate",
      headerName: "Detected",
      width: 120,
      valueFormatter: (params) => formatDate(params.value as string),
    },
    {
      field: "dpaNotificationRequired",
      headerName: "DPA Notif.",
      width: 100,
      renderCell: (params: GridRenderCellParams<boolean>) =>
        params.value ? (
          <Chip label="Required" size="small" color="warning" />
        ) : (
          <Chip label="Not Required" size="small" variant="outlined" />
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleOpenDetail(params.row as DataBreach)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <ErrorIcon fontSize="large" color="error" />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              Data Breach Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Track, manage, and report data breaches to comply with GDPR
              Articles 33-34
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ mr: 1 }}
            >
              New Breach Report
            </Button>
            <Button variant="outlined" startIcon={<ExportIcon />}>
              Export Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="data breach management tabs"
        >
          <Tab label="All Breaches" {...a11yProps(0)} />
          <Tab
            label={`Active (${
              breaches.filter((b) => b.status !== BreachStatus.CLOSED).length
            })`}
            {...a11yProps(1)}
          />
          <Tab
            label={`High Severity (${
              breaches.filter(
                (b) =>
                  b.severity === BreachSeverity.HIGH ||
                  b.severity === BreachSeverity.CRITICAL
              ).length
            })`}
            {...a11yProps(2)}
          />
          <Tab
            label={`Reportable (${
              breaches.filter((b) => b.dpaNotificationRequired).length
            })`}
            {...a11yProps(3)}
          />
          <Tab
            label={`Closed (${
              breaches.filter((b) => b.status === BreachStatus.CLOSED).length
            })`}
            {...a11yProps(4)}
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {selectedBreaches.length > 0 && (
                  <Box
                    sx={{
                      mb: 2,
                      p: 1,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {selectedBreaches.length} breach(es) selected
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      color="error"
                      sx={{ mr: 1 }}
                    >
                      Delete
                    </Button>
                  </Box>
                )}

                <DataGrid
                  rows={filteredBreaches}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  checkboxSelection
                  disableSelectionOnClick
                  autoHeight
                  onSelectionModelChange={handleBreachSelection}
                  selectionModel={selectedBreaches}
                  components={{
                    Toolbar: GridToolbar,
                  }}
                  sx={{
                    "& .MuiDataGrid-row:hover": {
                      cursor: "pointer",
                    },
                  }}
                />
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Other tabs share same content with different filtering */}
        {[1, 2, 3, 4].map((index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {selectedBreaches.length > 0 && (
                    <Box
                      sx={{
                        mb: 2,
                        p: 1,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {selectedBreaches.length} breach(es) selected
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        color="error"
                        sx={{ mr: 1 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}

                  <DataGrid
                    rows={filteredBreaches}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    checkboxSelection
                    disableSelectionOnClick
                    autoHeight
                    onSelectionModelChange={handleBreachSelection}
                    selectionModel={selectedBreaches}
                    components={{
                      Toolbar: GridToolbar,
                    }}
                    sx={{
                      "& .MuiDataGrid-row:hover": {
                        cursor: "pointer",
                      },
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </TabPanel>
        ))}
      </Box>

      {/* Detail Dialog would be implemented in a separate component */}
      {/* Similar to the DSRRequestDetail component */}
    </Box>
  );
};

export default DataBreachManagement;
