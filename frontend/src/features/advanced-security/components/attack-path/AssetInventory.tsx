/**
 * Asset Inventory
 *
 * Component for managing assets in the attack path modeling system
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Computer as ComputerIcon,
  Router as RouterIcon,
  Storage as StorageIcon,
  ImportExport as ImportExportIcon,
  Cloud as CloudIcon,
  DevicesOther as DevicesOtherIcon,
} from "@mui/icons-material";

import {
  useGetAssetsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useBulkImportAssetsMutation,
} from "../../services/attackPathService";
import {
  Asset,
  AssetType,
  AssetCriticality,
} from "../../types/attackPathTypes";

export const AssetInventory: React.FC = () => {
  const theme = useTheme();

  // State for filters
  const [filters, setFilters] = useState({
    search: "",
    type: [] as AssetType[],
    criticality: [] as AssetCriticality[],
    tags: [] as string[],
  });

  // State for showing filters
  const [showFilters, setShowFilters] = useState(false);

  // Asset dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);

  // Import dialog state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form state
  const [assetForm, setAssetForm] = useState({
    name: "",
    hostname: "",
    ipAddress: "",
    type: "" as AssetType,
    criticality: "" as AssetCriticality,
    description: "",
    location: "",
    owner: "",
    tags: [] as string[],
    services: [] as string[],
    vulnerabilities: [] as string[],
  });

  // Query for fetching assets
  const { data: assets = [], isLoading, error, refetch } = useGetAssetsQuery();

  // Mutations
  const [createAsset, { isLoading: isCreating }] = useCreateAssetMutation();
  const [updateAsset, { isLoading: isUpdating }] = useUpdateAssetMutation();
  const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();
  const [bulkImportAssets, { isLoading: isImporting }] =
    useBulkImportAssetsMutation();

  // Filtered assets
  const filteredAssets = assets.filter((asset) => {
    // Search filter
    if (
      filters.search &&
      !asset.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !asset.hostname.toLowerCase().includes(filters.search.toLowerCase()) &&
      !asset.ipAddress.toLowerCase().includes(filters.search.toLowerCase()) &&
      !asset.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Type filter
    if (filters.type.length > 0 && !filters.type.includes(asset.type)) {
      return false;
    }

    // Criticality filter
    if (
      filters.criticality.length > 0 &&
      !filters.criticality.includes(asset.criticality)
    ) {
      return false;
    }

    // Tags filter
    if (
      filters.tags.length > 0 &&
      !filters.tags.some((tag) => asset.tags.includes(tag))
    ) {
      return false;
    }

    return true;
  });

  // Paginated assets
  const paginatedAssets = filteredAssets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  // Handle filter change
  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset to first page when filters change
    setPage(0);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      type: [],
      criticality: [],
      tags: [],
    });
  };

  // Get icon for asset type
  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case "SERVER":
        return <StorageIcon />;
      case "WORKSTATION":
        return <ComputerIcon />;
      case "ROUTER":
      case "NETWORK_DEVICE":
        return <RouterIcon />;
      case "IOT_DEVICE":
        return <DevicesOtherIcon />;
      case "CLOUD_RESOURCE":
        return <CloudIcon />;
      default:
        return <ComputerIcon />;
    }
  };

  // Get color for asset criticality
  const getCriticalityColor = (criticality: AssetCriticality) => {
    switch (criticality) {
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

  // Handle dialog open for creating/editing asset
  const handleOpenDialog = (asset?: Asset) => {
    if (asset) {
      // Edit mode
      setEditMode(true);
      setCurrentAsset(asset);
      setAssetForm({
        name: asset.name,
        hostname: asset.hostname,
        ipAddress: asset.ipAddress,
        type: asset.type,
        criticality: asset.criticality,
        description: asset.description || "",
        location: asset.location || "",
        owner: asset.owner || "",
        tags: asset.tags || [],
        services: asset.services || [],
        vulnerabilities: asset.vulnerabilities || [],
      });
    } else {
      // Create mode
      setEditMode(false);
      setCurrentAsset(null);
      setAssetForm({
        name: "",
        hostname: "",
        ipAddress: "",
        type: "" as AssetType,
        criticality: "" as AssetCriticality,
        description: "",
        location: "",
        owner: "",
        tags: [],
        services: [],
        vulnerabilities: [],
      });
    }

    setDialogOpen(true);
  };

  // Handle form change
  const handleFormChange = (name: string, value: any) => {
    setAssetForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save asset
  const handleSaveAsset = async () => {
    try {
      if (editMode && currentAsset) {
        // Update existing asset
        await updateAsset({
          id: currentAsset.id,
          ...assetForm,
        }).unwrap();
      } else {
        // Create new asset
        await createAsset(assetForm).unwrap();
      }

      // Close dialog and refetch
      setDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to save asset:", error);
    }
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  // Handle delete asset
  const handleDeleteAsset = async () => {
    if (assetToDelete) {
      try {
        await deleteAsset(assetToDelete.id).unwrap();

        // Close dialog and refetch
        setDeleteDialogOpen(false);
        setAssetToDelete(null);
        refetch();
      } catch (error) {
        console.error("Failed to delete asset:", error);
      }
    }
  };

  // Handle import dialog
  const handleOpenImportDialog = () => {
    setImportData("");
    setImportDialogOpen(true);
  };

  // Handle import assets
  const handleImportAssets = async () => {
    try {
      if (!importData.trim()) return;

      const parsedData = JSON.parse(importData);
      await bulkImportAssets(parsedData).unwrap();

      // Close dialog and refetch
      setImportDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to import assets:", error);
    }
  };

  // Get a list of all unique tags across assets
  const allTags = [...new Set(assets.flatMap((asset) => asset.tags || []))];

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
          Asset Inventory
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ImportExportIcon />}
            onClick={handleOpenImportDialog}
          >
            Import
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Asset
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search assets..."
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
                filters.criticality.length === 0 &&
                filters.tags.length === 0
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
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Asset Type</InputLabel>
                  <Select
                    multiple
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    label="Asset Type"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as AssetType[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(AssetType).map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box sx={{ mr: 1 }}>{getAssetIcon(type)}</Box>
                          {type}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Criticality Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Criticality</InputLabel>
                  <Select
                    multiple
                    value={filters.criticality}
                    onChange={(e) =>
                      handleFilterChange("criticality", e.target.value)
                    }
                    label="Criticality"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as AssetCriticality[]).map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            size="small"
                            sx={{
                              bgcolor: getCriticalityColor(value),
                              color: "white",
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(AssetCriticality).map((criticality) => (
                      <MenuItem key={criticality} value={criticality}>
                        <Chip
                          label={criticality}
                          size="small"
                          sx={{
                            bgcolor: getCriticalityColor(criticality),
                            color: "white",
                            mr: 1,
                          }}
                        />
                        {criticality}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Tags Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Tags</InputLabel>
                  <Select
                    multiple
                    value={filters.tags}
                    onChange={(e) => handleFilterChange("tags", e.target.value)}
                    label="Tags"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {allTags.map((tag) => (
                      <MenuItem key={tag} value={tag}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Assets Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Asset</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Criticality</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Tags</TableCell>
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
                    Error loading assets. Please try again.
                  </Alert>
                </TableCell>
              </TableRow>
            ) : paginatedAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ my: 3 }}
                  >
                    No assets found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedAssets.map((asset) => (
                <TableRow key={asset.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ mr: 1 }}>{getAssetIcon(asset.type)}</Box>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {asset.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {asset.hostname}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell>{asset.ipAddress}</TableCell>
                  <TableCell>
                    <Chip
                      label={asset.criticality}
                      size="small"
                      sx={{
                        bgcolor: getCriticalityColor(asset.criticality),
                        color: "white",
                      }}
                    />
                  </TableCell>
                  <TableCell>{asset.location || "-"}</TableCell>
                  <TableCell>{asset.owner || "-"}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {asset.tags?.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(asset)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(asset)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredAssets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Asset Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editMode ? "Edit Asset" : "Add Asset"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={assetForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hostname"
                value={assetForm.hostname}
                onChange={(e) => handleFormChange("hostname", e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IP Address"
                value={assetForm.ipAddress}
                onChange={(e) => handleFormChange("ipAddress", e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  value={assetForm.type}
                  onChange={(e) => handleFormChange("type", e.target.value)}
                  label="Type"
                  required
                >
                  <MenuItem value="">
                    <em>Select type</em>
                  </MenuItem>
                  {Object.values(AssetType).map((type) => (
                    <MenuItem key={type} value={type}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ mr: 1 }}>
                          {getAssetIcon(type as AssetType)}
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
                <InputLabel>Criticality</InputLabel>
                <Select
                  value={assetForm.criticality}
                  onChange={(e) =>
                    handleFormChange("criticality", e.target.value)
                  }
                  label="Criticality"
                  required
                >
                  <MenuItem value="">
                    <em>Select criticality</em>
                  </MenuItem>
                  {Object.values(AssetCriticality).map((criticality) => (
                    <MenuItem key={criticality} value={criticality}>
                      <Chip
                        label={criticality}
                        size="small"
                        sx={{
                          bgcolor: getCriticalityColor(
                            criticality as AssetCriticality
                          ),
                          color: "white",
                          mr: 1,
                        }}
                      />
                      {criticality}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={assetForm.description}
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
                label="Location"
                value={assetForm.location}
                onChange={(e) => handleFormChange("location", e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Owner"
                value={assetForm.owner}
                onChange={(e) => handleFormChange("owner", e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={assetForm.tags.join(", ")}
                onChange={(e) =>
                  handleFormChange(
                    "tags",
                    e.target.value.split(",").map((t) => t.trim())
                  )
                }
                margin="normal"
                placeholder="e.g., production, windows, dmz"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Services (comma separated)"
                value={assetForm.services.join(", ")}
                onChange={(e) =>
                  handleFormChange(
                    "services",
                    e.target.value.split(",").map((s) => s.trim())
                  )
                }
                margin="normal"
                placeholder="e.g., http, ssh, mysql"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveAsset}
            disabled={
              isCreating ||
              isUpdating ||
              !assetForm.name ||
              !assetForm.hostname ||
              !assetForm.ipAddress ||
              !assetForm.type ||
              !assetForm.criticality
            }
          >
            {editMode ? "Update" : "Add"} Asset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Assets</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" gutterBottom>
            Paste JSON data for bulk importing assets. The format should be an
            array of asset objects.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            margin="normal"
            placeholder='[{ "name": "Web Server", "hostname": "web-01", "ipAddress": "192.168.1.10", "type": "SERVER", "criticality": "HIGH" }, ...]'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleImportAssets}
            disabled={isImporting || !importData.trim()}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Asset</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the asset "{assetToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAsset}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
