/**
 * Data Subject Rights Management Component
 *
 * Handles the management of data subject rights requests (access, erasure, etc.)
 * to comply with GDPR Articles 15-22.
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
  Divider,
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
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  FilterAlt as FilterIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

// Import types
import {
  DSRRequest,
  DSRRequestType,
  DSRRequestStatus,
} from "../../../../types/gdprTypes";

// Import request detail dialog
import DSRRequestDetail from "./DSRRequestDetail";

// Sample data - replace with API call in production
const sampleDSRRequests: DSRRequest[] = [
  {
    id: "DSR-2025-001",
    requestType: DSRRequestType.AccessRequest,
    status: DSRRequestStatus.Complete,
    dataSubject: {
      name: "John Smith",
      email: "john.smith@example.com",
      identityVerified: true,
      verificationMethod: "Email verification + ID document",
    },
    receivedDate: "2025-04-01T10:30:00Z",
    dueDate: "2025-05-01T10:30:00Z",
    completedDate: "2025-04-20T15:45:00Z",
    assignedTo: "Sarah Johnson",
    affectedSystems: [
      {
        id: "sys1",
        name: "CRM System",
        type: "application",
        location: "Cloud (AWS)",
        securityMeasures: ["Encryption", "Access Control"],
        dataSubjectAccessCapable: true,
        dataDeletionCapable: true,
        dataExportCapable: true,
        businessOwner: "Sales Department",
        technicalOwner: "IT Department",
      },
      {
        id: "sys4",
        name: "Marketing Platform",
        type: "thirdParty",
        location: "Cloud (Azure)",
        securityMeasures: ["Encryption", "Access Control"],
        dataSubjectAccessCapable: true,
        dataDeletionCapable: true,
        dataExportCapable: true,
        businessOwner: "Marketing Department",
        technicalOwner: "Marketing Ops",
      },
    ],
    actions: [
      {
        timestamp: "2025-04-01T10:30:00Z",
        action: "Request received",
        performedBy: "System",
      },
      {
        timestamp: "2025-04-02T09:15:00Z",
        action: "Identity verification initiated",
        performedBy: "Sarah Johnson",
      },
      {
        timestamp: "2025-04-03T14:20:00Z",
        action: "Identity verified",
        performedBy: "Sarah Johnson",
      },
      {
        timestamp: "2025-04-10T11:05:00Z",
        action: "Data retrieved from CRM",
        performedBy: "System",
      },
      {
        timestamp: "2025-04-15T16:30:00Z",
        action: "Data retrieved from Marketing Platform",
        performedBy: "System",
      },
      {
        timestamp: "2025-04-20T15:45:00Z",
        action: "Data packaged and provided to data subject",
        performedBy: "Sarah Johnson",
      },
    ],
    requestDetails:
      "Request for a copy of all personal data held by the company",
    responseDetails: "Provided via secure download link",
  },
  {
    id: "DSR-2025-002",
    requestType: DSRRequestType.Erasure,
    status: DSRRequestStatus.InProgress,
    dataSubject: {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      identityVerified: true,
      verificationMethod: "Email verification + security questions",
    },
    receivedDate: "2025-04-10T09:15:00Z",
    dueDate: "2025-05-10T09:15:00Z",
    assignedTo: "Michael Brown",
    affectedSystems: [
      {
        id: "sys1",
        name: "CRM System",
        type: "application",
        location: "Cloud (AWS)",
        securityMeasures: ["Encryption", "Access Control"],
        dataSubjectAccessCapable: true,
        dataDeletionCapable: true,
        dataExportCapable: true,
        businessOwner: "Sales Department",
        technicalOwner: "IT Department",
      },
      {
        id: "sys4",
        name: "Marketing Platform",
        type: "thirdParty",
        location: "Cloud (Azure)",
        securityMeasures: ["Encryption", "Access Control"],
        dataSubjectAccessCapable: true,
        dataDeletionCapable: true,
        dataExportCapable: true,
        businessOwner: "Marketing Department",
        technicalOwner: "Marketing Ops",
      },
      {
        id: "sys5",
        name: "Email System",
        type: "application",
        location: "Cloud (Google)",
        securityMeasures: ["Encryption", "Access Control"],
        dataSubjectAccessCapable: true,
        dataDeletionCapable: true,
        dataExportCapable: true,
        businessOwner: "IT Department",
        technicalOwner: "IT Department",
      },
    ],
    actions: [
      {
        timestamp: "2025-04-10T09:15:00Z",
        action: "Request received",
        performedBy: "System",
      },
      {
        timestamp: "2025-04-11T10:30:00Z",
        action: "Identity verification initiated",
        performedBy: "Michael Brown",
      },
      {
        timestamp: "2025-04-12T14:45:00Z",
        action: "Identity verified",
        performedBy: "Michael Brown",
      },
      {
        timestamp: "2025-04-15T09:30:00Z",
        action: "Data erasure initiated in CRM System",
        performedBy: "Michael Brown",
      },
      {
        timestamp: "2025-04-18T11:20:00Z",
        action: "Data erasure initiated in Marketing Platform",
        performedBy: "Michael Brown",
      },
    ],
    requestDetails:
      "Request for full erasure of all personal data from company systems",
    responseDetails:
      "In progress - waiting for confirmation from third-party systems",
  },
  {
    id: "DSR-2025-003",
    requestType: DSRRequestType.Rectification,
    status: DSRRequestStatus.New,
    dataSubject: {
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      identityVerified: false,
    },
    receivedDate: "2025-04-18T14:20:00Z",
    dueDate: "2025-05-18T14:20:00Z",
    affectedSystems: [],
    actions: [
      {
        timestamp: "2025-04-18T14:20:00Z",
        action: "Request received",
        performedBy: "System",
      },
    ],
    requestDetails:
      "Request to update address and phone number in company records",
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
      id={`dsr-tabpanel-${index}`}
      aria-labelledby={`dsr-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
function a11yProps(index: number) {
  return {
    id: `dsr-tab-${index}`,
    "aria-controls": `dsr-tabpanel-${index}`,
  };
}

// Data Subject Rights Management component
const DataSubjectRightsManagement: React.FC = () => {
  const theme = useTheme();

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for data
  const [dsrRequests, setDsrRequests] = useState<DSRRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DSRRequest[]>([]);
  // Define GridRowSelectionModel as string[] | number[] to match MUI's implementation
  const [selectedRequests, setSelectedRequests] = useState<string[] | number[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);

  // State for detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DSRRequest | null>(
    null
  );

  // Load data
  useEffect(() => {
    // In a real app, this would be an API call
    setDsrRequests(sampleDSRRequests);
    setLoading(false);
  }, []);

  // Filter requests based on tab
  useEffect(() => {
    if (dsrRequests.length === 0) return;

    let filtered: DSRRequest[];

    switch (tabValue) {
      case 0: // All
        filtered = dsrRequests;
        break;
      case 1: // Received
        filtered = dsrRequests.filter(
          (req) =>
            req.status === DSRRequestStatus.New ||
            req.status === DSRRequestStatus.PendingVerification
        );
        break;
      case 2: // In Progress
        filtered = dsrRequests.filter(
          (req) => req.status === DSRRequestStatus.InProgress
        );
        break;
      case 3: // Completed
        filtered = dsrRequests.filter(
          (req) => req.status === DSRRequestStatus.Complete
        );
        break;
      case 4: // Denied
        filtered = dsrRequests.filter(
          (req) =>
            req.status === DSRRequestStatus.Denied ||
            req.status === DSRRequestStatus.InProgress
        );
        break;
      default:
        filtered = dsrRequests;
    }

    setFilteredRequests(filtered);
  }, [tabValue, dsrRequests]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle request selection
  const handleRequestSelection = (newSelection: string[] | number[]) => {
    setSelectedRequests(newSelection);
  };

  // Open request detail
  const handleOpenDetail = (request: DSRRequest) => {
    setSelectedRequest(request);
    setDetailOpen(true);
  };

  // Close request detail
  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedRequest(null);
  };

  // Format request type
  const formatRequestType = (type: DSRRequestType) => {
    const color =
      type === DSRRequestType.AccessRequest
        ? "primary"
        : type === DSRRequestType.Erasure
        ? "error"
        : type === DSRRequestType.Rectification
        ? "info"
        : type === DSRRequestType.Restriction
        ? "warning"
        : type === DSRRequestType.Portability
        ? "success"
        : "default";

    return <Chip label={type.replace("_", " ")} size="small" color={color} />;
  };

  // Format request status
  const formatRequestStatus = (status: DSRRequestStatus) => {
    const color =
      status === DSRRequestStatus.New
        ? "info"
        : status === DSRRequestStatus.PendingVerification
        ? "warning"
        : status === DSRRequestStatus.InProgress
        ? "warning"
        : status === DSRRequestStatus.Complete
        ? "success"
        : status === DSRRequestStatus.Denied
        ? "error"
        : status === DSRRequestStatus.InProgress
        ? "warning"
        : "default";

    return <Chip label={status.replace("_", " ")} size="small" color={color} />;
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

  // Calculate days remaining or overdue
  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <Typography variant="body2" color="error">
          {Math.abs(diffDays)} days overdue
        </Typography>
      );
    } else if (diffDays === 0) {
      return (
        <Typography variant="body2" color="warning.main">
          Due today
        </Typography>
      );
    } else if (diffDays <= 5) {
      return (
        <Typography variant="body2" color="warning.main">
          {diffDays} days left
        </Typography>
      );
    } else {
      return <Typography variant="body2">{diffDays} days left</Typography>;
    }
  };

  // Define columns for data grid
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Request ID",
      width: 140,
    },
    {
      field: "requestType",
      headerName: "Request Type",
      width: 150,
      renderCell: (params: GridRenderCellParams<DSRRequestType>) =>
        formatRequestType(params.value as DSRRequestType),
    },
    {
      field: "dataSubject",
      headerName: "Data Subject",
      width: 200,
      valueGetter: (params: { row: DSRRequest }) => params.row.dataSubject.name,
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="body2">{params.row.dataSubject.name}</Typography>
          <Typography variant="caption" color="textSecondary">
            {params.row.dataSubject.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params: GridRenderCellParams<DSRRequestStatus>) =>
        formatRequestStatus(params.value as DSRRequestStatus),
    },
    {
      field: "receivedDate",
      headerName: "Received",
      width: 120,
      valueFormatter: (params) => formatDate(params.value as string),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 120,
      valueFormatter: (params) => formatDate(params.value as string),
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="body2">
            {formatDate(params.value as string)}
          </Typography>
          {calculateDaysRemaining(params.value as string)}
        </Box>
      ),
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      width: 150,
      valueFormatter: (params) => params.value || "Unassigned",
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
              onClick={() => handleOpenDetail(params.row as DSRRequest)}
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
            <PersonIcon fontSize="large" color="primary" />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              Data Subject Rights Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Handle and track data subject rights requests under GDPR Articles
              15-22
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ mr: 1 }}
            >
              New DSR Request
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
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
          aria-label="dsr request tabs"
        >
          <Tab label="All Requests" {...a11yProps(0)} />
          <Tab
            label={`New (${
              dsrRequests.filter(
                (r) =>
                  r.status === DSRRequestStatus.New ||
                  r.status === DSRRequestStatus.PendingVerification
              ).length
            })`}
            {...a11yProps(1)}
          />
          <Tab
            label={`In Progress (${
              dsrRequests.filter(
                (r) => r.status === DSRRequestStatus.InProgress
              ).length
            })`}
            {...a11yProps(2)}
          />
          <Tab
            label={`Completed (${
              dsrRequests.filter((r) => r.status === DSRRequestStatus.Complete)
                .length
            })`}
            {...a11yProps(3)}
          />
          <Tab
            label={`Denied/Partial (${
              dsrRequests.filter(
                (r) =>
                  r.status === DSRRequestStatus.Denied ||
                  r.status === DSRRequestStatus.InProgress
              ).length
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
                {selectedRequests.length > 0 && (
                  <Box
                    sx={{
                      mb: 2,
                      p: 1,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {selectedRequests.length} request(s) selected
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AssignmentIcon />}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      Assign
                    </Button>
                    <Button
                      size="small"
                      startIcon={<FilterIcon />}
                      sx={{ mr: 1 }}
                    >
                      Bulk Update Status
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      color="error"
                    >
                      Delete
                    </Button>
                  </Box>
                )}

                <DataGrid
                  rows={filteredRequests}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize, page: 0 }
                    }
                  }}
                  pageSizeOptions={[10, 25, 50]}
                  onPaginationModelChange={(model) => setPageSize(model.pageSize)}
                  checkboxSelection
                  disableRowSelectionOnClick
                  autoHeight
                  onRowSelectionModelChange={handleRequestSelection}
                  rowSelectionModel={selectedRequests}
                  slots={{
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
                  {selectedRequests.length > 0 && (
                    <Box
                      sx={{
                        mb: 2,
                        p: 1,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {selectedRequests.length} request(s) selected
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AssignmentIcon />}
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        Assign
                      </Button>
                      <Button
                        size="small"
                        startIcon={<FilterIcon />}
                        sx={{ mr: 1 }}
                      >
                        Bulk Update Status
                      </Button>
                    </Box>
                  )}

                  <DataGrid
                    rows={filteredRequests}
                    columns={columns}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize, page: 0 }
                      }
                    }}
                    pageSizeOptions={[10, 25, 50]}
                    onPaginationModelChange={(model) => setPageSize(model.pageSize)}
                    checkboxSelection
                    disableRowSelectionOnClick
                    autoHeight
                    onRowSelectionModelChange={handleRequestSelection}
                    rowSelectionModel={selectedRequests}
                    slots={{
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

      {/* Detail Dialog */}
      {selectedRequest && (
        <DSRRequestDetail
          open={detailOpen}
          request={selectedRequest}
          onClose={handleCloseDetail}
        />
      )}
    </Box>
  );
};

export default DataSubjectRightsManagement;
