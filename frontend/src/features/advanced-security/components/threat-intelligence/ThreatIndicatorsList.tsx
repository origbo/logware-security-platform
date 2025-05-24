/**
 * Threat Indicators List
 *
 * Component for managing threat intelligence indicators
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
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
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Public as PublicIcon,
  Http as HttpIcon,
  Email as EmailIcon,
  Code as CodeIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import {
  useGetThreatIndicatorsQuery,
  useCreateThreatIndicatorMutation,
  useUpdateThreatIndicatorMutation,
  useDeleteThreatIndicatorMutation,
} from "../../services/threatIntelligenceService";
import {
  ThreatIndicator,
  IndicatorType,
  ThreatCategory,
  IndicatorStatus,
} from "../../types/threatIntelTypes";

const ThreatIndicatorsList: React.FC = () => {
  const theme = useTheme();

  // State for filters
  const [filters, setFilters] = useState({
    search: "",
    type: [] as IndicatorType[],
    category: [] as ThreatCategory[],
    status: [] as IndicatorStatus[],
    confidence: [0, 100],
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for showing filters
  const [showFilters, setShowFilters] = useState(false);

  // State for indicator dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentIndicator, setCurrentIndicator] =
    useState<ThreatIndicator | null>(null);

  // Form state
  const [indicatorForm, setIndicatorForm] = useState({
    type: "" as IndicatorType,
    value: "",
    category: "" as ThreatCategory,
    description: "",
    confidence: 75,
    status: "ACTIVE" as IndicatorStatus,
    source: "",
    tags: [] as string[],
  });

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] =
    useState<ThreatIndicator | null>(null);

  // Query for fetching indicators
  const {
    data: indicators = [],
    isLoading,
    error,
    refetch,
  } = useGetThreatIndicatorsQuery();

  // Mutations
  const [createIndicator, { isLoading: isCreating }] =
    useCreateThreatIndicatorMutation();
  const [updateIndicator, { isLoading: isUpdating }] =
    useUpdateThreatIndicatorMutation();
  const [deleteIndicator, { isLoading: isDeleting }] =
    useDeleteThreatIndicatorMutation();

  // Handle filter change
  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset to first page when filters change
    setPage(0);
  };

  // Handle pagination change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter indicators
  const filteredIndicators = indicators.filter((indicator) => {
    // Search filter
    if (
      filters.search &&
      !indicator.value.toLowerCase().includes(filters.search.toLowerCase()) &&
      !indicator.description
        .toLowerCase()
        .includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Type filter
    if (filters.type.length > 0 && !filters.type.includes(indicator.type)) {
      return false;
    }

    // Category filter
    if (
      filters.category.length > 0 &&
      !filters.category.includes(indicator.category)
    ) {
      return false;
    }

    // Status filter
    if (
      filters.status.length > 0 &&
      !filters.status.includes(indicator.status)
    ) {
      return false;
    }

    // Confidence filter
    if (
      indicator.confidence < filters.confidence[0] ||
      indicator.confidence > filters.confidence[1]
    ) {
      return false;
    }

    return true;
  });

  // Get indicators for current page
  const paginatedIndicators = filteredIndicators.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle open indicator dialog
  const handleOpenIndicatorDialog = (indicator?: ThreatIndicator) => {
    if (indicator) {
      // Edit mode
      setEditMode(true);
      setCurrentIndicator(indicator);
      setIndicatorForm({
        type: indicator.type,
        value: indicator.value,
        category: indicator.category,
        description: indicator.description,
        confidence: indicator.confidence,
        status: indicator.status,
        source: indicator.source,
        tags: indicator.tags || [],
      });
    } else {
      // Create mode
      setEditMode(false);
      setCurrentIndicator(null);
      setIndicatorForm({
        type: "" as IndicatorType,
        value: "",
        category: "" as ThreatCategory,
        description: "",
        confidence: 75,
        status: "ACTIVE" as IndicatorStatus,
        source: "",
        tags: [],
      });
    }

    setDialogOpen(true);
  };

  // Handle close indicator dialog
  const handleCloseIndicatorDialog = () => {
    setDialogOpen(false);
  };

  // Handle form changes
  const handleFormChange = (name: string, value: any) => {
    setIndicatorForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save indicator
  const handleSaveIndicator = async () => {
    try {
      if (editMode && currentIndicator) {
        // Update existing indicator
        await updateIndicator({
          id: currentIndicator.id,
          ...indicatorForm,
        }).unwrap();
      } else {
        // Create new indicator
        await createIndicator(indicatorForm).unwrap();
      }

      // Close dialog and refetch
      setDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to save indicator:", error);
    }
  };

  // Handle open delete dialog
  const handleOpenDeleteDialog = (indicator: ThreatIndicator) => {
    setIndicatorToDelete(indicator);
    setDeleteDialogOpen(true);
  };

  // Handle delete indicator
  const handleDeleteIndicator = async () => {
    if (indicatorToDelete) {
      try {
        await deleteIndicator(indicatorToDelete.id).unwrap();

        // Close dialog and refetch
        setDeleteDialogOpen(false);
        setIndicatorToDelete(null);
        refetch();
      } catch (error) {
        console.error("Failed to delete indicator:", error);
      }
    }
  };

  // Get icon for indicator type
  const getIndicatorTypeIcon = (type: IndicatorType) => {
    switch (type) {
      case "IP":
        return <PublicIcon fontSize="small" />;
      case "DOMAIN":
      case "URL":
        return <HttpIcon fontSize="small" />;
      case "EMAIL":
        return <EmailIcon fontSize="small" />;
      case "FILE_HASH":
        return <CodeIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      type: [],
      category: [],
      status: [],
      confidence: [0, 100],
    });
  };

  return (
    <Box>
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
          Threat Indicators
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenIndicatorDialog()}
        >
          Add Indicator
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search indicators..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
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
                !filters.search &&
                filters.type.length === 0 &&
                filters.category.length === 0 &&
                filters.status.length === 0 &&
                filters.confidence[0] === 0 &&
                filters.confidence[1] === 100
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
              {/* Type Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    multiple
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    label="Type"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as IndicatorType[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(IndicatorType).map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box sx={{ mr: 1 }}>{getIndicatorTypeIcon(type)}</Box>
                          {type}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Category Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    multiple
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    label="Category"
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

              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    label="Status"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as IndicatorStatus[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(IndicatorStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Indicators Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Source</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress sx={{ my: 3 }} />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Alert severity="error">
                    Error loading threat indicators. Please try again.
                  </Alert>
                </TableCell>
              </TableRow>
            ) : paginatedIndicators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ my: 3 }}
                  >
                    No threat indicators found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedIndicators.map((indicator) => (
                <TableRow key={indicator.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ mr: 1 }}>
                        {getIndicatorTypeIcon(indicator.type)}
                      </Box>
                      {indicator.type}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {indicator.value}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={indicator.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {indicator.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={indicator.status}
                      size="small"
                      color={
                        indicator.status === "ACTIVE"
                          ? "error"
                          : indicator.status === "EXPIRED"
                          ? "default"
                          : "success"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${indicator.confidence}%`}
                      size="small"
                      color={
                        indicator.confidence >= 80
                          ? "success"
                          : indicator.confidence >= 60
                          ? "warning"
                          : "error"
                      }
                    />
                  </TableCell>
                  <TableCell>{indicator.source}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenIndicatorDialog(indicator)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(indicator)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredIndicators.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Indicator Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseIndicatorDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Threat Indicator" : "Add Threat Indicator"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  value={indicatorForm.type}
                  onChange={(e) => handleFormChange("type", e.target.value)}
                  label="Type"
                  required
                >
                  <MenuItem value="">
                    <em>Select type</em>
                  </MenuItem>
                  {Object.values(IndicatorType).map((type) => (
                    <MenuItem key={type} value={type}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ mr: 1 }}>
                          {getIndicatorTypeIcon(type as IndicatorType)}
                        </Box>
                        {type}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={indicatorForm.category}
                  onChange={(e) => handleFormChange("category", e.target.value)}
                  label="Category"
                  required
                >
                  <MenuItem value="">
                    <em>Select category</em>
                  </MenuItem>
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
                label="Value"
                value={indicatorForm.value}
                onChange={(e) => handleFormChange("value", e.target.value)}
                required
                margin="normal"
                placeholder={
                  indicatorForm.type === "IP"
                    ? "192.168.1.1"
                    : indicatorForm.type === "DOMAIN"
                    ? "example.com"
                    : indicatorForm.type === "URL"
                    ? "https://example.com/path"
                    : indicatorForm.type === "EMAIL"
                    ? "user@example.com"
                    : indicatorForm.type === "FILE_HASH"
                    ? "44d88612fea8a8f36de82e1278abb02f"
                    : "Enter indicator value"
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={indicatorForm.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confidence (%)"
                type="number"
                value={indicatorForm.confidence}
                onChange={(e) =>
                  handleFormChange("confidence", parseInt(e.target.value))
                }
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={indicatorForm.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  label="Status"
                >
                  {Object.values(IndicatorStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Source"
                value={indicatorForm.source}
                onChange={(e) => handleFormChange("source", e.target.value)}
                margin="normal"
                placeholder="e.g., Internal Analysis, OSINT, Vendor Feed"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={indicatorForm.tags.join(", ")}
                onChange={(e) =>
                  handleFormChange(
                    "tags",
                    e.target.value.split(",").map((t) => t.trim())
                  )
                }
                margin="normal"
                placeholder="e.g., ransomware, botnet, campaign-2023"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIndicatorDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveIndicator}
            disabled={
              isCreating ||
              isUpdating ||
              !indicatorForm.type ||
              !indicatorForm.value ||
              !indicatorForm.category
            }
          >
            {editMode ? "Update" : "Add"} Indicator
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Threat Indicator</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the indicator "
            {indicatorToDelete?.value}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteIndicator}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { ThreatIndicatorsList };
