/**
 * Threat Reports List
 *
 * Component for managing threat intelligence reports
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Alert,
  Tab,
  Tabs,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  Share as ShareIcon,
  GetApp as DownloadIcon,
  DateRange as DateRangeIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

import {
  useGetThreatReportsQuery,
  useCreateThreatReportMutation,
  useUpdateThreatReportMutation,
  useDeleteThreatReportMutation,
} from "../../services/threatIntelligenceService";
import {
  ThreatReport,
  ReportSeverity,
  ThreatCategory,
} from "../../types/threatIntelTypes";

const ThreatReportsList: React.FC = () => {
  const theme = useTheme();

  // State for search
  const [search, setSearch] = useState("");

  // State for filters
  const [filters, setFilters] = useState({
    severity: [] as ReportSeverity[],
    category: [] as ThreatCategory[],
    dateRange: { start: "", end: "" },
  });

  // State for showing filters
  const [showFilters, setShowFilters] = useState(false);

  // State for view mode
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedReport, setSelectedReport] = useState<ThreatReport | null>(
    null
  );

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentReport, setCurrentReport] = useState<ThreatReport | null>(null);

  // Form state
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    content: "",
    category: [] as ThreatCategory[],
    severity: "" as ReportSeverity,
    publishedDate: "",
    author: "",
    tags: [] as string[],
    relatedIndicators: [] as string[],
    relatedActors: [] as string[],
  });

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ThreatReport | null>(
    null
  );

  // Query for fetching reports
  const {
    data: reports = [],
    isLoading,
    error,
    refetch,
  } = useGetThreatReportsQuery();

  // Mutations
  const [createReport, { isLoading: isCreating }] =
    useCreateThreatReportMutation();
  const [updateReport, { isLoading: isUpdating }] =
    useUpdateThreatReportMutation();
  const [deleteReport, { isLoading: isDeleting }] =
    useDeleteThreatReportMutation();

  // Filtered reports
  const filteredReports = reports.filter((report) => {
    // Search filter
    if (
      search &&
      !report.title.toLowerCase().includes(search.toLowerCase()) &&
      !report.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    // Severity filter
    if (
      filters.severity.length > 0 &&
      !filters.severity.includes(report.severity)
    ) {
      return false;
    }

    // Category filter
    if (
      filters.category.length > 0 &&
      !report.category.some((c) => filters.category.includes(c))
    ) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      const reportDate = new Date(report.publishedDate);
      if (reportDate < startDate) {
        return false;
      }
    }

    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      const reportDate = new Date(report.publishedDate);
      if (reportDate > endDate) {
        return false;
      }
    }

    return true;
  });

  // Handle view report
  const handleViewReport = (report: ThreatReport) => {
    setSelectedReport(report);
    setViewMode("detail");
  };

  // Handle back to list
  const handleBackToList = () => {
    setViewMode("list");
    setSelectedReport(null);
  };

  // Handle open dialog
  const handleOpenDialog = (report?: ThreatReport) => {
    if (report) {
      // Edit mode
      setEditMode(true);
      setCurrentReport(report);
      setReportForm({
        title: report.title,
        description: report.description,
        content: report.content,
        category: report.category,
        severity: report.severity,
        publishedDate: report.publishedDate,
        author: report.author,
        tags: report.tags || [],
        relatedIndicators: report.relatedIndicators || [],
        relatedActors: report.relatedActors || [],
      });
    } else {
      // Create mode
      setEditMode(false);
      setCurrentReport(null);
      setReportForm({
        title: "",
        description: "",
        content: "",
        category: [],
        severity: "" as ReportSeverity,
        publishedDate: new Date().toISOString().split("T")[0],
        author: "",
        tags: [],
        relatedIndicators: [],
        relatedActors: [],
      });
    }

    setDialogOpen(true);
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle form changes
  const handleFormChange = (name: string, value: any) => {
    setReportForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save report
  const handleSaveReport = async () => {
    try {
      if (editMode && currentReport) {
        // Update existing report
        await updateReport({
          id: currentReport.id,
          ...reportForm,
        }).unwrap();
      } else {
        // Create new report
        await createReport(reportForm).unwrap();
      }

      // Close dialog and refetch
      setDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to save report:", error);
    }
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = (report: ThreatReport) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  // Handle delete report
  const handleDeleteReport = async () => {
    if (reportToDelete) {
      try {
        await deleteReport(reportToDelete.id).unwrap();

        // Close dialog and refetch
        setDeleteDialogOpen(false);
        setReportToDelete(null);
        refetch();
      } catch (error) {
        console.error("Failed to delete report:", error);
      }
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    setFilters({
      severity: [],
      category: [],
      dateRange: { start: "", end: "" },
    });
  };

  // Severity to color mapping
  const getSeverityColor = (severity: ReportSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return theme.palette.error.main;
      case "HIGH":
        return theme.palette.warning.main;
      case "MEDIUM":
        return theme.palette.info.main;
      case "LOW":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Render report list view
  const renderReportList = () => {
    if (isLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 4,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading threat intelligence reports. Please try again.
        </Alert>
      );
    }

    if (filteredReports.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="textSecondary">
            No threat intelligence reports found
          </Typography>
        </Paper>
      );
    }

    return (
      <Grid container spacing={3}>
        {filteredReports.map((report) => (
          <Grid item xs={12} key={report.id}>
            <Card variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {report.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Chip
                        label={report.severity}
                        size="small"
                        sx={{
                          bgcolor: getSeverityColor(report.severity),
                          color: "white",
                          mr: 1,
                        }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Published:{" "}
                        {new Date(report.publishedDate).toLocaleDateString()}
                      </Typography>
                      {report.author && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ ml: 1 }}
                        >
                          by {report.author}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {report.description}
                </Typography>

                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 2 }}
                >
                  {report.category.map((cat) => (
                    <Chip key={cat} label={cat} size="small" />
                  ))}
                  {report.tags &&
                    report.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  startIcon={<DescriptionIcon />}
                  onClick={() => handleViewReport(report)}
                >
                  View
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenDialog(report)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleOpenDeleteDialog(report)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render report detail view
  const renderReportDetail = () => {
    if (!selectedReport) return null;

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
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
          >
            Back to Reports
          </Button>
          <Box>
            <Button variant="outlined" startIcon={<ShareIcon />} sx={{ mr: 1 }}>
              Share
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Download
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedReport.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Chip
                  label={selectedReport.severity}
                  size="small"
                  sx={{
                    bgcolor: getSeverityColor(selectedReport.severity),
                    color: "white",
                    mr: 1,
                  }}
                />
                <Typography variant="caption" color="textSecondary">
                  Published:{" "}
                  {new Date(selectedReport.publishedDate).toLocaleDateString()}
                </Typography>
                {selectedReport.author && (
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ ml: 1 }}
                  >
                    by {selectedReport.author}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => handleOpenDialog(selectedReport)}
              >
                Edit
              </Button>
            </Box>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            {selectedReport.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ whiteSpace: "pre-wrap" }}>{selectedReport.content}</Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 2 }}>
            {selectedReport.category.map((cat) => (
              <Chip key={cat} label={cat} size="small" />
            ))}
            {selectedReport.tags &&
              selectedReport.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
          </Box>
        </Paper>

        {/* Related Indicators and Actors */}
        <Grid container spacing={3}>
          {selectedReport.relatedIndicators &&
            selectedReport.relatedIndicators.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Related Indicators
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {selectedReport.relatedIndicators.map(
                      (indicator, index) => (
                        <Chip
                          key={index}
                          label={indicator}
                          variant="outlined"
                          size="small"
                          icon={<SecurityIcon />}
                        />
                      )
                    )}
                  </Box>
                </Paper>
              </Grid>
            )}

          {selectedReport.relatedActors &&
            selectedReport.relatedActors.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Related Threat Actors
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {selectedReport.relatedActors.map((actor, index) => (
                      <Chip
                        key={index}
                        label={actor}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      {viewMode === "list" ? (
        <>
          {/* Header and Controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" component="h1">
              Threat Intelligence Reports
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create Report
            </Button>
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search reports..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant={showFilters ? "contained" : "outlined"}
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => refetch()}
                >
                  Refresh
                </Button>
              </Grid>
              <Grid item xs={6} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  onClick={handleResetFilters}
                  disabled={
                    !search &&
                    filters.severity.length === 0 &&
                    filters.category.length === 0 &&
                    !filters.dateRange.start &&
                    !filters.dateRange.end
                  }
                >
                  Reset
                </Button>
              </Grid>
            </Grid>

            {/* Advanced Filters */}
            {showFilters && (
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Grid container spacing={2}>
                  {/* Severity Filter */}
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Severity</InputLabel>
                      <Select
                        multiple
                        value={filters.severity}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            severity: e.target.value as ReportSeverity[],
                          }))
                        }
                        label="Severity"
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {(selected as ReportSeverity[]).map((value) => (
                              <Chip
                                key={value}
                                label={value}
                                size="small"
                                sx={{
                                  bgcolor: getSeverityColor(value),
                                  color: "white",
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {Object.values(ReportSeverity).map((severity) => (
                          <MenuItem key={severity} value={severity}>
                            <Chip
                              label={severity}
                              size="small"
                              sx={{
                                bgcolor: getSeverityColor(severity),
                                color: "white",
                                mr: 1,
                              }}
                            />
                            {severity}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Category Filter */}
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        multiple
                        value={filters.category}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            category: e.target.value as ThreatCategory[],
                          }))
                        }
                        label="Category"
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {(selected as ThreatCategory[]).map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {Object.values(ThreatCategory).map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Date Range Filter */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="From"
                          type="date"
                          value={filters.dateRange.start}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                start: e.target.value,
                              },
                            }))
                          }
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="To"
                          type="date"
                          value={filters.dateRange.end}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                end: e.target.value,
                              },
                            }))
                          }
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>

          {/* Reports List */}
          {renderReportList()}
        </>
      ) : (
        /* Report Detail View */
        renderReportDetail()
      )}

      {/* Report Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode
            ? "Edit Threat Intelligence Report"
            : "Create Threat Intelligence Report"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={reportForm.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={reportForm.severity}
                  onChange={(e) => handleFormChange("severity", e.target.value)}
                  label="Severity"
                  required
                >
                  <MenuItem value="">
                    <em>Select severity</em>
                  </MenuItem>
                  {Object.values(ReportSeverity).map((severity) => (
                    <MenuItem key={severity} value={severity}>
                      <Chip
                        label={severity}
                        size="small"
                        sx={{
                          bgcolor: getSeverityColor(severity),
                          color: "white",
                          mr: 1,
                        }}
                      />
                      {severity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Publication Date"
                type="date"
                value={reportForm.publishedDate}
                onChange={(e) =>
                  handleFormChange("publishedDate", e.target.value)
                }
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Author"
                value={reportForm.author}
                onChange={(e) => handleFormChange("author", e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={reportForm.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={reportForm.category}
                  onChange={(e) => handleFormChange("category", e.target.value)}
                  label="Categories"
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as ThreatCategory[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(ThreatCategory).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                value={reportForm.content}
                onChange={(e) => handleFormChange("content", e.target.value)}
                multiline
                rows={10}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={reportForm.tags.join(", ")}
                onChange={(e) =>
                  handleFormChange(
                    "tags",
                    e.target.value.split(",").map((t) => t.trim())
                  )
                }
                margin="normal"
                placeholder="e.g., ransomware, zero-day, critical-advisory"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Related Indicators (comma separated)"
                value={reportForm.relatedIndicators.join(", ")}
                onChange={(e) =>
                  handleFormChange(
                    "relatedIndicators",
                    e.target.value.split(",").map((t) => t.trim())
                  )
                }
                margin="normal"
                placeholder="e.g., indicator-123, indicator-456"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Related Actors (comma separated)"
                value={reportForm.relatedActors.join(", ")}
                onChange={(e) =>
                  handleFormChange(
                    "relatedActors",
                    e.target.value.split(",").map((t) => t.trim())
                  )
                }
                margin="normal"
                placeholder="e.g., actor-123, actor-456"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveReport}
            disabled={
              isCreating ||
              isUpdating ||
              !reportForm.title ||
              !reportForm.severity ||
              reportForm.category.length === 0
            }
          >
            {editMode ? "Update" : "Create"} Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Threat Intelligence Report</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the report "{reportToDelete?.title}
            "? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteReport}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { ThreatReportsList };
