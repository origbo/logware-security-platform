/**
 * Report History Component
 *
 * Displays a history of generated compliance reports with download, sharing and viewing options
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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import {
  History as HistoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  RemoveRedEye as ViewIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  FileDownload as FileIcon,
} from "@mui/icons-material";

// Props interface
interface ReportHistoryProps {
  framework?: string;
}

// Generated report interface
interface GeneratedReport {
  id: string;
  name: string;
  framework: string;
  generatedDate: string;
  generatedBy: string;
  size: number;
  format: "pdf" | "xlsx" | "docx" | "html";
  status: "complete" | "failed" | "in-progress";
  downloadUrl?: string;
  viewUrl?: string;
  tags: string[];
}

// Sample generated reports
const sampleReports: GeneratedReport[] = [
  {
    id: "report-1",
    name: "GDPR Compliance Report - Q2 2025",
    framework: "GDPR",
    generatedDate: "2025-06-15T10:30:00Z",
    generatedBy: "John Smith",
    size: 2450000,
    format: "pdf",
    status: "complete",
    downloadUrl: "#",
    viewUrl: "#",
    tags: ["quarterly", "executive", "gdpr"],
  },
  {
    id: "report-2",
    name: "PCI-DSS Compliance Status Report",
    framework: "PCI-DSS",
    generatedDate: "2025-06-10T14:45:00Z",
    generatedBy: "Sarah Wilson",
    size: 3200000,
    format: "pdf",
    status: "complete",
    downloadUrl: "#",
    viewUrl: "#",
    tags: ["monthly", "pci-dss", "board-report"],
  },
  {
    id: "report-3",
    name: "ISO 27001 Evidence Collection Summary",
    framework: "ISO 27001",
    generatedDate: "2025-06-05T09:15:00Z",
    generatedBy: "Emily Chen",
    size: 1850000,
    format: "xlsx",
    status: "complete",
    downloadUrl: "#",
    viewUrl: "#",
    tags: ["monthly", "iso27001", "evidence"],
  },
  {
    id: "report-4",
    name: "HIPAA Compliance Gap Analysis",
    framework: "HIPAA",
    generatedDate: "2025-06-01T11:20:00Z",
    generatedBy: "David Kim",
    size: 4100000,
    format: "pdf",
    status: "complete",
    downloadUrl: "#",
    viewUrl: "#",
    tags: ["quarterly", "gap-analysis", "hipaa"],
  },
  {
    id: "report-5",
    name: "GDPR Control Assessment",
    framework: "GDPR",
    generatedDate: "2025-05-25T15:10:00Z",
    generatedBy: "John Smith",
    size: 1950000,
    format: "docx",
    status: "complete",
    downloadUrl: "#",
    viewUrl: "#",
    tags: ["monthly", "controls", "gdpr"],
  },
  {
    id: "report-6",
    name: "NIST SP 800-53 Compliance Report",
    framework: "NIST SP 800-53",
    generatedDate: "2025-06-18T08:45:00Z",
    generatedBy: "Robert Johnson",
    size: 3750000,
    format: "pdf",
    status: "in-progress",
    tags: ["quarterly", "nist", "government"],
  },
  {
    id: "report-7",
    name: "SOC 2 Evidence Collection Status",
    framework: "SOC 2",
    generatedDate: "2025-06-17T13:25:00Z",
    generatedBy: "Lisa Wong",
    size: 1250000,
    format: "xlsx",
    status: "failed",
    tags: ["monthly", "soc2", "evidence"],
  },
];

/**
 * Report History Component
 */
const ReportHistory: React.FC<ReportHistoryProps> = ({ framework = "ALL" }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<GeneratedReport[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  // Menu state
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Load reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Filter reports by framework if specified
        const filteredReports =
          framework === "ALL"
            ? sampleReports
            : sampleReports.filter((report) => report.framework === framework);

        setReports(filteredReports);
        setFilteredReports(filteredReports);
        setError(null);
      } catch (err) {
        console.error("Error fetching report history:", err);
        setError("Failed to load report history");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [framework]);

  // Filter reports based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReports(reports);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = reports.filter(
      (report) =>
        report.name.toLowerCase().includes(query) ||
        report.framework.toLowerCase().includes(query) ||
        report.generatedBy.toLowerCase().includes(query) ||
        report.tags.some((tag) => tag.toLowerCase().includes(query))
    );

    setFilteredReports(filtered);
    setPage(0); // Reset to first page when filtering
  }, [searchQuery, reports]);

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open filter menu
  const handleOpenFilterMenu = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Close filter menu
  const handleCloseFilterMenu = () => {
    setFilterAnchorEl(null);
  };

  // Open action menu
  const handleOpenActionMenu = (
    event: React.MouseEvent<HTMLElement>,
    reportId: string
  ) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedReportId(reportId);
  };

  // Close action menu
  const handleCloseActionMenu = () => {
    setActionAnchorEl(null);
    setSelectedReportId(null);
  };

  // Filter reports by framework
  const handleFilterByFramework = (selectedFramework: string) => {
    if (selectedFramework === "ALL") {
      setFilteredReports(reports);
    } else {
      const filtered = reports.filter(
        (report) => report.framework === selectedFramework
      );
      setFilteredReports(filtered);
    }

    setPage(0);
    handleCloseFilterMenu();
  };

  // Filter reports by status
  const handleFilterByStatus = (status: GeneratedReport["status"]) => {
    const filtered = reports.filter((report) => report.status === status);
    setFilteredReports(filtered);
    setPage(0);
    handleCloseFilterMenu();
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "success";
      case "in-progress":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  // Get file icon color
  const getFileIconColor = (format: string) => {
    switch (format) {
      case "pdf":
        return "#F40F02";
      case "xlsx":
        return "#1D6F42";
      case "docx":
        return "#2B579A";
      case "html":
        return "#E34C26";
      default:
        return theme.palette.text.primary;
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          Report History {framework !== "ALL" && `(${framework})`}
        </Typography>

        <Box sx={{ display: "flex" }}>
          <TextField
            size="small"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 1 }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleOpenFilterMenu}
          >
            Filter
          </Button>

          {/* Filter Menu */}
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleCloseFilterMenu}
          >
            <MenuItem onClick={() => handleFilterByFramework("ALL")}>
              All Frameworks
            </MenuItem>
            <MenuItem onClick={() => handleFilterByFramework("GDPR")}>
              GDPR
            </MenuItem>
            <MenuItem onClick={() => handleFilterByFramework("PCI-DSS")}>
              PCI-DSS
            </MenuItem>
            <MenuItem onClick={() => handleFilterByFramework("ISO 27001")}>
              ISO 27001
            </MenuItem>
            <MenuItem onClick={() => handleFilterByFramework("HIPAA")}>
              HIPAA
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleFilterByStatus("complete")}>
              Completed Reports
            </MenuItem>
            <MenuItem onClick={() => handleFilterByStatus("in-progress")}>
              In-Progress Reports
            </MenuItem>
            <MenuItem onClick={() => handleFilterByStatus("failed")}>
              Failed Reports
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {filteredReports.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <HistoryIcon
            sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            No Reports Found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {searchQuery
              ? `No reports matching "${searchQuery}" were found.`
              : "No reports have been generated yet."}
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Framework</TableCell>
                  <TableCell>Date Generated</TableCell>
                  <TableCell>Generated By</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <FileIcon
                            fontSize="small"
                            sx={{
                              mr: 1,
                              color: getFileIconColor(report.format),
                            }}
                          />
                          <Typography variant="body2">{report.name}</Typography>
                        </Box>
                        <Box sx={{ mt: 0.5 }}>
                          {report.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mt: 0.5 }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{report.framework}</TableCell>
                      <TableCell>{formatDate(report.generatedDate)}</TableCell>
                      <TableCell>{report.generatedBy}</TableCell>
                      <TableCell>{report.format.toUpperCase()}</TableCell>
                      <TableCell>{formatFileSize(report.size)}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          size="small"
                          color={getStatusColor(report.status) as any}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          disabled={report.status !== "complete"}
                          color="primary"
                          title="View Report"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={report.status !== "complete"}
                          color="primary"
                          title="Download Report"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="more actions"
                          aria-controls="action-menu"
                          aria-haspopup="true"
                          onClick={(e) => handleOpenActionMenu(e, report.id)}
                          title="More Actions"
                        >
                          <span>⋮</span>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredReports.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Action Menu */}
      <Menu
        id="action-menu"
        anchorEl={actionAnchorEl}
        keepMounted
        open={Boolean(actionAnchorEl)}
        onClose={handleCloseActionMenu}
      >
        <MenuItem onClick={handleCloseActionMenu}>
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />
          Share Report
        </MenuItem>
        <MenuItem onClick={handleCloseActionMenu}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Report
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ReportHistory;
