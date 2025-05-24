/**
 * Data Mapping Inventory Component
 *
 * Main component for tracking personal data storage and processing activities
 * to comply with GDPR Article 30 (Records of Processing Activities)
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
// Replace DataGridPro with a custom table implementation using standard MUI components
// import {
//   DataGridPro,
//   GridColDef,
//   GridToolbar,
//   GridRenderCellParams,
//   GridRowSelectionModel,
//   GridValueGetterParams,
// } from "@mui/x-data-grid-pro";

// Custom type definitions to replace the missing imports
type GridColDef = {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  renderCell?: (params: any) => React.ReactNode;
  valueGetter?: (params: any) => any;
  sortable?: boolean;
  filterable?: boolean;
  align?: 'left' | 'right' | 'center';
  headerAlign?: 'left' | 'right' | 'center';
};

type GridRenderCellParams = {
  value: any;
  row: any;
  field: string;
  id: string | number;
};

type GridValueGetterParams = {
  value: any;
  row: any;
};

type GridRowSelectionModel = (string | number)[];

// Import standard MUI Table components
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FileDownload as ExportIcon,
  Storage as StorageIcon,
  Apps as AppsIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  FilterAlt as FilterIcon,
} from "@mui/icons-material";

// Import types
import {
  DataProcessingActivity,
  DataCategory,
  ProcessingLegalBasis,
  DataSystemReference,
  DataRecipient,
} from "../../types/gdprTypes";

// Sample data - replace with API call in production
const sampleProcessingActivities: DataProcessingActivity[] = [
  {
    id: "1",
    name: "Customer Account Management",
    description:
      "Processing of customer account information for service provision",
    dataCategories: [DataCategory.BASIC_IDENTIFIERS, DataCategory.CONTACT_INFO],
    purpose: "Service Provision",
    legalBasis: ProcessingLegalBasis.CONTRACT,
    dataSubjects: ["Customers"],
    retentionPolicy: "customer-data-retention",
    internalSystems: [
      {
        id: "sys1",
        name: "CRM System",
        type: "APPLICATION",
        location: "Cloud (AWS)",
        securityMeasures: ["Encryption", "Access Control", "Audit Logging"],
        dataSubjectAccessCapable: true,
        dataDeletionCapable: true,
        dataExportCapable: true,
        businessOwner: "Sales Department",
        technicalOwner: "IT Department",
      },
    ],
    externalRecipients: [],
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-04-20T14:30:00Z",
    assessmentStatus: "COMPLETED",
    riskLevel: "LOW",
  },
  {
    id: "2",
    name: "Marketing Email Campaigns",
    description: "Processing of customer data for marketing purposes",
    dataCategories: [
      DataCategory.BASIC_IDENTIFIERS,
      DataCategory.CONTACT_INFO,
      DataCategory.BEHAVIORAL,
    ],
    purpose: "Marketing",
    legalBasis: ProcessingLegalBasis.CONSENT,
    dataSubjects: ["Customers", "Prospects"],
    retentionPolicy: "marketing-data-retention",
    internalSystems: [
      {
        id: "sys2",
        name: "Marketing Automation Platform",
        type: "THIRD_PARTY",
        location: "Cloud (Azure)",
        securityMeasures: [
          "Encryption",
          "Access Control",
          "Data Processing Agreement",
        ],
        dataSubjectAccessCapable: true,
        dataDeletionCapable: true,
        dataExportCapable: true,
        businessOwner: "Marketing Department",
        technicalOwner: "Marketing Ops",
      },
    ],
    externalRecipients: [
      {
        id: "rec1",
        name: "Email Service Provider",
        type: "PROCESSOR",
        location: "United States",
        contractInPlace: true,
        dataProtectionAgreement: true,
        contacts: [
          {
            name: "John Smith",
            role: "Account Manager",
            email: "john.smith@example.com",
            phone: "+1 555 123 4567",
          },
        ],
      },
    ],
    crossBorderTransfers: [
      {
        id: "xfer1",
        destination: "United States",
        transferMechanism: "SCCs",
        details: "Standard Contractual Clauses signed on 2024-12-01",
        documentationLink: "https://example.com/documents/sccs",
      },
    ],
    createdAt: "2025-01-20T11:00:00Z",
    updatedAt: "2025-04-22T09:15:00Z",
    assessmentStatus: "COMPLETED",
    riskLevel: "MEDIUM",
  },
  {
    id: "3",
    name: "Employee Records Processing",
    description: "Processing of employee personal data for HR purposes",
    dataCategories: [
      DataCategory.BASIC_IDENTIFIERS,
      DataCategory.CONTACT_INFO,
      DataCategory.FINANCIAL,
      DataCategory.HEALTH,
    ],
    purpose: "HR Management",
    legalBasis: ProcessingLegalBasis.LEGAL_OBLIGATION,
    dataSubjects: ["Employees"],
    retentionPolicy: "employee-data-retention",
    internalSystems: [
      {
        id: "sys3",
        name: "HR Management System",
        type: "APPLICATION",
        location: "On-premises",
        securityMeasures: ["Encryption", "Access Control", "Audit Logging"],
        dataSubjectAccessCapable: true,
        dataDeletionCapable: true,
        dataExportCapable: true,
        businessOwner: "HR Department",
        technicalOwner: "IT Department",
      },
    ],
    externalRecipients: [
      {
        id: "rec2",
        name: "Payroll Provider",
        type: "PROCESSOR",
        location: "United Kingdom",
        contractInPlace: true,
        dataProtectionAgreement: true,
        contacts: [
          {
            name: "Jane Doe",
            role: "Support",
            email: "jane.doe@example.com",
          },
        ],
      },
    ],
    createdAt: "2025-02-01T09:00:00Z",
    updatedAt: "2025-04-18T16:45:00Z",
    assessmentStatus: "COMPLETED",
    riskLevel: "HIGH",
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
      id={`data-mapping-tabpanel-${index}`}
      aria-labelledby={`data-mapping-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Helper function for a11y props
function a11yProps(index: number) {
  return {
    id: `data-mapping-tab-${index}`,
    "aria-controls": `data-mapping-tabpanel-${index}`,
  };
}

// DataMappingInventory component
const DataMappingInventory: React.FC = () => {
  const theme = useTheme();

  // State for tabs
  const [tabValue, setTabValue] = useState(0);

  // State for data
  const [processingActivities, setProcessingActivities] = useState<
    DataProcessingActivity[]
  >([]);
  // Cast the empty array to any to fix the type error
  const [selectedActivities, setSelectedActivities] =
    useState<GridRowSelectionModel>([] as any);
  const [loading, setLoading] = useState(true);

  // Helper function to safely get the length of GridRowSelectionModel
  const getSelectionLength = (selection: GridRowSelectionModel): number => {
    if (Array.isArray(selection)) {
      return selection.length;
    }
    return 0;
  };

  // Load data
  useEffect(() => {
    // In a real app, this would be an API call
    setProcessingActivities(sampleProcessingActivities);
    setLoading(false);
  }, []);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle selection
  const handleSelectionChange = (selectionModel: GridRowSelectionModel) => {
    setSelectedActivities(selectionModel);
  };

  // Format data category badges
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

  // Format legal basis
  const formatLegalBasis = (basis: ProcessingLegalBasis) => {
    if (!basis) return null;

    const color =
      basis === ProcessingLegalBasis.CONSENT
        ? "primary"
        : basis === ProcessingLegalBasis.CONTRACT
        ? "success"
        : basis === ProcessingLegalBasis.LEGAL_OBLIGATION
        ? "info"
        : basis === ProcessingLegalBasis.LEGITIMATE_INTERESTS
        ? "warning"
        : "default";

    return <Chip label={basis.replace("_", " ")} size="small" color={color} />;
  };

  // Format risk level
  const formatRiskLevel = (
    riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"
  ) => {
    if (!riskLevel) return null;

    const color =
      riskLevel === "LOW"
        ? "success"
        : riskLevel === "MEDIUM"
        ? "warning"
        : riskLevel === "HIGH"
        ? "error"
        : riskLevel === "VERY_HIGH"
        ? "error"
        : "default";

    return <Chip label={riskLevel} size="small" color={color} />;
  };

  // Define columns for data grid
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Processing Activity",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "dataCategories",
      headerName: "Data Categories",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<DataCategory[]>) =>
        formatDataCategories(params.value || []),
    },
    {
      field: "purpose",
      headerName: "Purpose",
      flex: 0.7,
      minWidth: 150,
    },
    {
      field: "legalBasis",
      headerName: "Legal Basis",
      flex: 0.7,
      minWidth: 150,
      valueGetter: (params: GridValueGetterParams) => {
        // Cast to any to avoid type constraint issues
        return params.value as any;
      },
      renderCell: (params: GridRenderCellParams) =>
        formatLegalBasis(params.value as ProcessingLegalBasis),
    },
    {
      field: "dataSubjects",
      headerName: "Data Subjects",
      flex: 0.7,
      minWidth: 150,
      valueGetter: (params: GridValueGetterParams) => {
        return Array.isArray(params.value) ? params.value.join(", ") : "";
      },
    },
    {
      field: "riskLevel",
      headerName: "Risk Level",
      flex: 0.5,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) =>
        formatRiskLevel(
          params.value as "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"
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
            <IconButton size="small">
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
            <StorageIcon fontSize="large" color="primary" />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              Data Mapping Inventory
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Track and manage personal data processing activities to comply
              with GDPR Article 30
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ mr: 1 }}
            >
              New Processing Activity
            </Button>
            <Button variant="outlined" startIcon={<ExportIcon />}>
              Export ROPA
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="data mapping inventory tabs"
        >
          <Tab
            icon={<AppsIcon />}
            label="Processing Activities"
            {...a11yProps(0)}
          />
          <Tab
            icon={<StorageIcon />}
            label="Systems & Applications"
            {...a11yProps(1)}
          />
          <Tab
            icon={<BusinessIcon />}
            label="Third Parties"
            {...a11yProps(2)}
          />
          <Tab icon={<PeopleIcon />} label="Data Subjects" {...a11yProps(3)} />
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
                {selectedActivities &&
                  getSelectionLength(selectedActivities) > 0 && (
                    <Box
                      sx={{
                        mb: 2,
                        p: 1,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {getSelectionLength(selectedActivities)} item(s)
                        selected
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        color="error"
                        sx={{ mr: 1 }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        disabled={
                          !selectedActivities ||
                          getSelectionLength(selectedActivities) === 0
                        }
                        startIcon={<FilterIcon />}
                      >
                        Bulk Edit
                      </Button>
                    </Box>
                  )}
                <Box sx={{ height: 600, width: "100%" }}>
                  <DataGridPro
                    rows={processingActivities}
                    columns={columns as any}
                    loading={loading}
                    autoHeight
                    checkboxSelection
                    disableRowSelectionOnClick
                    onRowSelectionModelChange={(newSelection) => {
                      setSelectedActivities(newSelection);
                    }}
                    rowSelectionModel={selectedActivities}
                    components={{
                      Toolbar: GridToolbar,
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="subtitle1">
            Systems & Applications that process personal data
          </Typography>
          {/* Systems & Applications content would go here */}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            This tab will show all systems, applications, and databases that
            store or process personal data.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="subtitle1">Third Party Recipients</Typography>
          {/* Third Parties content would go here */}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            This tab will show all third parties that receive personal data,
            including processors and controllers.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="subtitle1">Data Subjects</Typography>
          {/* Data Subjects content would go here */}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            This tab will show categories of data subjects and related
            processing activities.
          </Typography>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default DataMappingInventory;
