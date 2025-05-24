/**
 * Report History Component
 *
 * Displays a history of generated reports with download options
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Description as PdfIcon,
  GridOn as ExcelIcon,
  Code as JsonIcon,
  List as CsvIcon,
  Web as HtmlIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import {
  useGetReportHistoryQuery,
  useDownloadReportQuery,
} from "../../services/reportingService";

// Mock reports as fallback data
const mockReports = [
  {
    id: "report-1",
    name: "AWS Security Assessment",
    template: "security-findings",
    generatedAt: "2025-05-19T14:30:00Z",
    generatedBy: "John Smith",
    cloudProviders: ["AWS"],
    size: "1.2 MB",
    format: "pdf",
    downloads: 5,
  },
  {
    id: "report-2",
    name: "Multi-Cloud Executive Summary",
    template: "executive-summary",
    generatedAt: "2025-05-15T09:45:00Z",
    generatedBy: "Jane Doe",
    cloudProviders: ["AWS", "Azure", "GCP"],
    size: "850 KB",
    format: "pdf",
    downloads: 12,
  },
  {
    id: "report-3",
    name: "Azure Compliance Status",
    template: "compliance-posture",
    generatedAt: "2025-05-10T16:20:00Z",
    generatedBy: "John Smith",
    cloudProviders: ["Azure"],
    size: "3.1 MB",
    format: "excel",
    downloads: 3,
  },
];

interface ReportHistoryProps {
  accountId?: string;
}

/**
 * Report History Component
 */
const ReportHistory: React.FC<ReportHistoryProps> = ({ accountId }) => {
  const theme = useTheme();

  // Fetch reports from API
  const {
    data: apiReports,
    isLoading,
    isError,
    refetch,
  } = useGetReportHistoryQuery({ accountId, limit: 50 });

  // State for reports
  const [reports, setReports] = useState(mockReports);
  const [loading, setLoading] = useState(false);

  // Update reports when API data changes
  useEffect(() => {
    if (apiReports) {
      setReports(apiReports);
    }
  }, [apiReports]);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State for search
  const [searchQuery, setSearchQuery] = useState("");

  // State for action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Handle menu open
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    reportId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedReportId(reportId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReportId(null);
  };

  // Download functionality
  const [currentDownloadId, setCurrentDownloadId] = useState<string | null>(
    null
  );
  const { data: downloadData, isSuccess: isDownloadSuccess } =
    useDownloadReportQuery(currentDownloadId || "", {
      skip: !currentDownloadId,
    });

  // Handle download success
  useEffect(() => {
    if (isDownloadSuccess && downloadData && currentDownloadId) {
      // Create URL for the blob
      const url = URL.createObjectURL(downloadData);

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;

      // Get report name and format for filename
      const report = reports.find((r) => r.id === currentDownloadId);
      const format = report?.format || "pdf";
      const filename = report
        ? `${report.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${format}`
        : `report_${currentDownloadId}.${format}`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setCurrentDownloadId(null);
      handleMenuClose();
    }
  }, [isDownloadSuccess, downloadData, currentDownloadId, reports]);

  // Handle download
  const handleDownload = (reportId: string) => {
    setCurrentDownloadId(reportId);
  };

  // Handle delete
  const handleDelete = (reportId: string) => {
    setReports((prev) => prev.filter((report) => report.id !== reportId));
    handleMenuClose();
  };

  // Handle share
  const handleShare = (reportId: string) => {
    console.log(`Sharing report ${reportId}`);
    // In a real app, this would open a sharing dialog
    handleMenuClose();
  };

  // Handle pagination changes
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    refetch().finally(() => {
      setLoading(false);
    });
  };

  // Filter reports based on search query
  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.generatedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.cloudProviders.some((provider) =>
        provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Get format icon
  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <PdfIcon fontSize="small" />;
      case "excel":
        return <ExcelIcon fontSize="small" />;
      case "csv":
        return <CsvIcon fontSize="small" />;
      case "json":
        return <JsonIcon fontSize="small" />;
      case "html":
        return <HtmlIcon fontSize="small" />;
      default:
        return <DownloadIcon fontSize="small" />;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Report History
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        View and download previously generated reports.
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load reports. Using sample data instead.
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField
          placeholder="Search reports..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />

        <Box>
          <Button startIcon={<FilterIcon />} sx={{ mr: 1 }}>
            Filter
          </Button>
          <Button
            startIcon={
              isLoading || loading ? (
                <CircularProgress size={16} />
              ) : (
                <RefreshIcon />
              )
            }
            onClick={handleRefresh}
            disabled={isLoading || loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Generated</TableCell>
                <TableCell>Cloud Providers</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Size</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {report.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        By: {report.generatedBy}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {format(new Date(report.generatedAt), "MMM d, yyyy")}
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        {format(new Date(report.generatedAt), "h:mm a")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {report.cloudProviders.map((provider) => (
                          <Chip
                            key={provider}
                            label={provider}
                            size="small"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getFormatIcon(report.format)}
                        label={report.format.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{report.size}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(report.id)}
                          sx={{ mr: 1 }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, report.id)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

              {filteredReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      No reports found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredReports.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => selectedReportId && handleDownload(selectedReportId)}
        >
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem
          onClick={() => selectedReportId && handleShare(selectedReportId)}
        >
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem
          onClick={() => selectedReportId && handleDelete(selectedReportId)}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ReportHistory;
