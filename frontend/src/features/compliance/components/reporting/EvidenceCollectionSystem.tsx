/**
 * Evidence Collection System
 *
 * Basic implementation focusing on evidence listing and filtering
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Upload as UploadIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  FindInPage as FindIcon,
  CheckCircle as ApprovedIcon,
  Warning as PendingIcon,
  Error as RejectedIcon,
} from "@mui/icons-material";

// Import evidence types
import {
  EvidenceItem,
  EvidenceStatus,
  EvidenceType,
  EvidenceFilters,
} from "../../types/evidenceTypes";

// Props interface
interface EvidenceCollectionSystemProps {
  framework: string;
}

/**
 * Evidence Collection System Component
 */
const EvidenceCollectionSystem: React.FC<EvidenceCollectionSystemProps> = ({
  framework,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EvidenceItem[]>([]);

  // Filters
  const [filters, setFilters] = useState<EvidenceFilters>({
    status: "all",
    type: "all",
    searchQuery: "",
  });

  // Sample data - would be replaced with API calls in production
  const sampleEvidence: EvidenceItem[] = [
    {
      id: "ev-1",
      name: "GDPR Data Processing Agreement",
      description: "Signed DPA with third-party data processor",
      type: EvidenceType.DOCUMENT,
      format: "pdf",
      framework: "GDPR",
      requirement: "Article 28",
      uploadedBy: "John Smith",
      uploadedAt: "2025-05-01T10:30:00Z",
      expiresAt: "2026-05-01T10:30:00Z",
      status: EvidenceStatus.APPROVED,
      tags: ["dpa", "processor", "legal"],
      fileName: "third_party_dpa.pdf",
      fileSize: 1245678,
      verifiedBy: "Jane Doe",
      verifiedAt: "2025-05-02T14:20:00Z",
    },
    {
      id: "ev-2",
      name: "Network Diagram",
      description: "Current network diagram showing CDE segmentation",
      type: EvidenceType.DOCUMENT,
      format: "image",
      framework: "PCI-DSS",
      requirement: "Requirement 1.2.1",
      uploadedBy: "Mike Johnson",
      uploadedAt: "2025-05-05T09:15:00Z",
      status: EvidenceStatus.PENDING,
      tags: ["network", "cde", "segmentation"],
      fileName: "network_diagram_2025.png",
      fileSize: 2567890,
    },
    {
      id: "ev-3",
      name: "Access Control Policy",
      description: "Current access control policy document",
      type: EvidenceType.DOCUMENT,
      format: "pdf",
      framework: "HIPAA",
      requirement: "§ 164.312(a)(1)",
      uploadedBy: "Sarah Wilson",
      uploadedAt: "2025-05-07T14:30:00Z",
      status: EvidenceStatus.APPROVED,
      tags: ["policy", "access-control", "security"],
      fileName: "access_control_policy.pdf",
      fileSize: 1567890,
      verifiedBy: "Robert Chen",
      verifiedAt: "2025-05-08T10:45:00Z",
    },
    {
      id: "ev-4",
      name: "Risk Assessment",
      description: "Annual risk assessment document",
      type: EvidenceType.REPORT,
      format: "pdf",
      framework: "ISO 27001",
      requirement: "Clause 6.1.2",
      uploadedBy: "David Kim",
      uploadedAt: "2025-05-10T11:20:00Z",
      expiresAt: "2026-05-10T11:20:00Z",
      status: EvidenceStatus.APPROVED,
      tags: ["risk", "assessment", "annual"],
      fileName: "annual_risk_assessment_2025.pdf",
      fileSize: 3456789,
      verifiedBy: "Emily Chen",
      verifiedAt: "2025-05-11T09:30:00Z",
    },
    {
      id: "ev-5",
      name: "Security Awareness Training Records",
      description: "Employee security awareness training completion records",
      type: EvidenceType.REPORT,
      format: "excel",
      framework: "ALL",
      requirement: "Various",
      uploadedBy: "Lisa Johnson",
      uploadedAt: "2025-05-15T13:45:00Z",
      status: EvidenceStatus.APPROVED,
      tags: ["training", "awareness", "employees"],
      fileName: "security_training_q2_2025.xlsx",
      fileSize: 875432,
      verifiedBy: "John Smith",
      verifiedAt: "2025-05-16T10:20:00Z",
    },
    {
      id: "ev-6",
      name: "Vulnerability Scan Results",
      description: "Quarterly vulnerability scan results",
      type: EvidenceType.REPORT,
      format: "pdf",
      framework: "PCI-DSS",
      requirement: "Requirement 11.2",
      uploadedBy: "Robert Chen",
      uploadedAt: "2025-05-18T15:30:00Z",
      expiresAt: "2025-08-18T15:30:00Z",
      status: EvidenceStatus.REJECTED,
      tags: ["vulnerability", "scan", "security"],
      fileName: "q2_vulnerability_scan.pdf",
      fileSize: 4567890,
      rejectionReason: "Scan does not include all in-scope systems",
    },
  ];

  // Load evidence items
  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Filter evidence by framework if specified
        const frameworkEvidence =
          framework === "ALL"
            ? sampleEvidence
            : sampleEvidence.filter(
                (e) => e.framework === framework || e.framework === "ALL"
              );

        setEvidenceItems(frameworkEvidence);
        setFilteredItems(frameworkEvidence);
        setError(null);
      } catch (err) {
        console.error("Error fetching evidence:", err);
        setError("Failed to load evidence items");
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, [framework]);

  // Apply filters when filters or evidence items change
  useEffect(() => {
    let result = [...evidenceItems];

    // Apply status filter
    if (filters.status !== "all") {
      result = result.filter((e) => e.status === filters.status);
    }

    // Apply type filter
    if (filters.type !== "all") {
      result = result.filter((e) => e.type === filters.type);
    }

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          (e.description && e.description.toLowerCase().includes(query)) ||
          e.requirement.toLowerCase().includes(query) ||
          e.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredItems(result);
  }, [evidenceItems, filters]);

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "N/A";

    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case EvidenceStatus.APPROVED:
        return "success";
      case EvidenceStatus.PENDING:
        return "warning";
      case EvidenceStatus.REJECTED:
        return "error";
      case EvidenceStatus.EXPIRED:
        return "error";
      default:
        return "default";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case EvidenceStatus.APPROVED:
        return <ApprovedIcon color="success" />;
      case EvidenceStatus.PENDING:
        return <PendingIcon color="warning" />;
      case EvidenceStatus.REJECTED:
        return <RejectedIcon color="error" />;
      case EvidenceStatus.EXPIRED:
        return <RejectedIcon color="error" />;
      default:
        return null;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">
          Evidence Collection {framework !== "ALL" && `(${framework})`}
        </Typography>
        <Button variant="contained" startIcon={<UploadIcon />}>
          Upload Evidence
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              placeholder="Search evidence..."
              value={filters.searchQuery}
              onChange={(e) =>
                handleFilterChange("searchQuery", e.target.value)
              }
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    fontSize="small"
                    sx={{ mr: 1, color: theme.palette.text.secondary }}
                  />
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value={EvidenceStatus.PENDING}>Pending</MenuItem>
                <MenuItem value={EvidenceStatus.APPROVED}>Approved</MenuItem>
                <MenuItem value={EvidenceStatus.REJECTED}>Rejected</MenuItem>
                <MenuItem value={EvidenceStatus.EXPIRED}>Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value={EvidenceType.DOCUMENT}>Document</MenuItem>
                <MenuItem value={EvidenceType.SCREENSHOT}>Screenshot</MenuItem>
                <MenuItem value={EvidenceType.LOG}>Log</MenuItem>
                <MenuItem value={EvidenceType.CONFIG}>Configuration</MenuItem>
                <MenuItem value={EvidenceType.REPORT}>Report</MenuItem>
                <MenuItem value={EvidenceType.ATTESTATION}>
                  Attestation
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            md={1}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              size="small"
              onClick={() =>
                setFilters({
                  status: "all",
                  type: "all",
                  searchQuery: "",
                })
              }
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Evidence List */}
      {filteredItems.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <FindIcon
            sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            No evidence found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {filters.searchQuery ||
            filters.status !== "all" ||
            filters.type !== "all"
              ? "No evidence matches your search criteria. Try adjusting your filters."
              : "No evidence has been uploaded yet. Click the Upload Evidence button to add new evidence."}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Evidence</TableCell>
                <TableCell>Framework</TableCell>
                <TableCell>Requirement</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {item.name}
                      </Typography>
                      {item.description && (
                        <Typography variant="caption" color="textSecondary">
                          {item.description}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        {item.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.625rem" }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{item.framework}</TableCell>
                  <TableCell>{item.requirement}</TableCell>
                  <TableCell>
                    {new Date(item.uploadedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {getStatusIcon(item.status as string)}
                      <Chip
                        label={item.status.toString().replace("_", " ")}
                        size="small"
                        color={getStatusColor(item.status as string) as any}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" title="View Evidence">
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      title="Delete Evidence"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EvidenceCollectionSystem;
