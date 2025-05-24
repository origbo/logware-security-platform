/**
 * Threat Actors List
 *
 * Component for managing threat intelligence actors
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
  CardMedia,
  Avatar,
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
  Language as LanguageIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Public as PublicIcon,
  Group as GroupIcon,
  Stars as StarsIcon,
} from "@mui/icons-material";

import {
  useGetThreatActorsQuery,
  useCreateThreatActorMutation,
  useUpdateThreatActorMutation,
  useDeleteThreatActorMutation,
} from "../../services/threatIntelligenceService";
import {
  ThreatActor,
  ActorType,
  ActorMotivation,
  ThreatCategory,
} from "../../types/threatIntelTypes";

// Grid/Card view component
const ThreatActorsGrid: React.FC<{
  actors: ThreatActor[];
  onEdit: (actor: ThreatActor) => void;
  onDelete: (actor: ThreatActor) => void;
  isLoading: boolean;
}> = ({ actors, onEdit, onDelete, isLoading }) => {
  const theme = useTheme();

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

  if (actors.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body1" color="textSecondary">
          No threat actors found
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
      {actors.map((actor) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={actor.id}>
          <Card variant="outlined">
            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor:
                      actor.type === "STATE_SPONSORED"
                        ? theme.palette.error.main
                        : actor.type === "CRIMINAL"
                        ? theme.palette.warning.main
                        : actor.type === "HACKTIVIST"
                        ? theme.palette.info.main
                        : theme.palette.grey[500],
                    mr: 2,
                  }}
                >
                  {actor.name[0]}
                </Avatar>
                <Typography variant="h6" component="div" noWrap>
                  {actor.name}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
                <Chip
                  label={actor.type}
                  size="small"
                  color={
                    actor.type === "STATE_SPONSORED"
                      ? "error"
                      : actor.type === "CRIMINAL"
                      ? "warning"
                      : actor.type === "HACKTIVIST"
                      ? "info"
                      : "default"
                  }
                />
                {actor.isActive && (
                  <Chip label="Active" size="small" color="error" />
                )}
              </Box>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                <strong>Region:</strong> {actor.region}
              </Typography>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                <strong>Motivation:</strong> {actor.motivation.join(", ")}
              </Typography>

              <Typography variant="body2" color="textSecondary" noWrap>
                <strong>Targets:</strong> {actor.targets.join(", ")}
              </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: "flex-end" }}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(actor)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(actor)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

const ThreatActorsList: React.FC = () => {
  const theme = useTheme();

  // State for search
  const [search, setSearch] = useState("");

  // State for filters
  const [filters, setFilters] = useState({
    type: [] as ActorType[],
    motivation: [] as ActorMotivation[],
    isActive: null as boolean | null,
    region: [] as string[],
  });

  // State for showing filters
  const [showFilters, setShowFilters] = useState(false);

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentActor, setCurrentActor] = useState<ThreatActor | null>(null);

  // Form state
  const [actorForm, setActorForm] = useState({
    name: "",
    description: "",
    type: "" as ActorType,
    isActive: true,
    region: "",
    motivation: [] as ActorMotivation[],
    targets: [] as string[],
    associatedGroups: [] as string[],
    tactics: [] as string[],
    indicators: [] as string[],
  });

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actorToDelete, setActorToDelete] = useState<ThreatActor | null>(null);

  // Query for fetching actors
  const {
    data: actors = [],
    isLoading,
    error,
    refetch,
  } = useGetThreatActorsQuery();

  // Mutations
  const [createActor, { isLoading: isCreating }] =
    useCreateThreatActorMutation();
  const [updateActor, { isLoading: isUpdating }] =
    useUpdateThreatActorMutation();
  const [deleteActor, { isLoading: isDeleting }] =
    useDeleteThreatActorMutation();

  // Filtered actors
  const filteredActors = actors.filter((actor) => {
    // Search filter
    if (
      search &&
      !actor.name.toLowerCase().includes(search.toLowerCase()) &&
      !actor.description.toLowerCase().includes(search.toLowerCase()) &&
      !actor.region.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    // Type filter
    if (filters.type.length > 0 && !filters.type.includes(actor.type)) {
      return false;
    }

    // Motivation filter
    if (
      filters.motivation.length > 0 &&
      !actor.motivation.some((m) => filters.motivation.includes(m))
    ) {
      return false;
    }

    // Active filter
    if (filters.isActive !== null && actor.isActive !== filters.isActive) {
      return false;
    }

    // Region filter
    if (filters.region.length > 0 && !filters.region.includes(actor.region)) {
      return false;
    }

    return true;
  });

  // Handle open dialog
  const handleOpenDialog = (actor?: ThreatActor) => {
    if (actor) {
      // Edit mode
      setEditMode(true);
      setCurrentActor(actor);
      setActorForm({
        name: actor.name,
        description: actor.description,
        type: actor.type,
        isActive: actor.isActive,
        region: actor.region,
        motivation: actor.motivation,
        targets: actor.targets,
        associatedGroups: actor.associatedGroups || [],
        tactics: actor.tactics || [],
        indicators: actor.indicators || [],
      });
    } else {
      // Create mode
      setEditMode(false);
      setCurrentActor(null);
      setActorForm({
        name: "",
        description: "",
        type: "" as ActorType,
        isActive: true,
        region: "",
        motivation: [],
        targets: [],
        associatedGroups: [],
        tactics: [],
        indicators: [],
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
    setActorForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save actor
  const handleSaveActor = async () => {
    try {
      if (editMode && currentActor) {
        // Update existing actor
        await updateActor({
          id: currentActor.id,
          ...actorForm,
        }).unwrap();
      } else {
        // Create new actor
        await createActor(actorForm).unwrap();
      }

      // Close dialog and refetch
      setDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to save actor:", error);
    }
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = (actor: ThreatActor) => {
    setActorToDelete(actor);
    setDeleteDialogOpen(true);
  };

  // Handle delete actor
  const handleDeleteActor = async () => {
    if (actorToDelete) {
      try {
        await deleteActor(actorToDelete.id).unwrap();

        // Close dialog and refetch
        setDeleteDialogOpen(false);
        setActorToDelete(null);
        refetch();
      } catch (error) {
        console.error("Failed to delete actor:", error);
      }
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    setFilters({
      type: [],
      motivation: [],
      isActive: null,
      region: [],
    });
  };

  // Array of unique regions for filtering
  const regionOptions = Array.from(
    new Set(actors.map((actor) => actor.region))
  );

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
          Threat Actors
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Threat Actor
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search actors..."
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
                filters.type.length === 0 &&
                filters.motivation.length === 0 &&
                filters.isActive === null &&
                filters.region.length === 0
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
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        type: e.target.value as ActorType[],
                      }))
                    }
                    label="Type"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as ActorType[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(ActorType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Motivation Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Motivation</InputLabel>
                  <Select
                    multiple
                    value={filters.motivation}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        motivation: e.target.value as ActorMotivation[],
                      }))
                    }
                    label="Motivation"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as ActorMotivation[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(ActorMotivation).map((motivation) => (
                      <MenuItem key={motivation} value={motivation}>
                        {motivation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Region Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Region</InputLabel>
                  <Select
                    multiple
                    value={filters.region}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        region: e.target.value as string[],
                      }))
                    }
                    label="Region"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {regionOptions.map((region) => (
                      <MenuItem key={region} value={region}>
                        {region}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Active Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={
                      filters.isActive === null
                        ? ""
                        : filters.isActive
                        ? "active"
                        : "inactive"
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters((prev) => ({
                        ...prev,
                        isActive: value === "" ? null : value === "active",
                      }));
                    }}
                    label="Status"
                  >
                    <MenuItem value="">
                      <em>All</em>
                    </MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Actors Grid */}
      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading threat actors. Please try again.
        </Alert>
      ) : (
        <ThreatActorsGrid
          actors={filteredActors}
          onEdit={handleOpenDialog}
          onDelete={handleOpenDeleteDialog}
          isLoading={isLoading}
        />
      )}

      {/* Actor Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Threat Actor" : "Add Threat Actor"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={actorForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  value={actorForm.type}
                  onChange={(e) => handleFormChange("type", e.target.value)}
                  label="Type"
                  required
                >
                  <MenuItem value="">
                    <em>Select type</em>
                  </MenuItem>
                  {Object.values(ActorType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={actorForm.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Region"
                value={actorForm.region}
                onChange={(e) => handleFormChange("region", e.target.value)}
                margin="normal"
                placeholder="e.g., North America, Eastern Europe, Asia"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={actorForm.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    handleFormChange("isActive", e.target.value === "active")
                  }
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Motivation</InputLabel>
                <Select
                  multiple
                  value={actorForm.motivation}
                  onChange={(e) =>
                    handleFormChange("motivation", e.target.value)
                  }
                  label="Motivation"
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as ActorMotivation[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {Object.values(ActorMotivation).map((motivation) => (
                    <MenuItem key={motivation} value={motivation}>
                      {motivation}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Targets (comma separated)"
                value={actorForm.targets.join(", ")}
                onChange={(e) =>
                  handleFormChange(
                    "targets",
                    e.target.value.split(",").map((t) => t.trim())
                  )
                }
                margin="normal"
                placeholder="e.g., Financial Sector, Healthcare, Government"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Associated Groups (comma separated)"
                value={actorForm.associatedGroups.join(", ")}
                onChange={(e) =>
                  handleFormChange(
                    "associatedGroups",
                    e.target.value.split(",").map((t) => t.trim())
                  )
                }
                margin="normal"
                placeholder="e.g., APT29, FIN7"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tactics (comma separated)"
                value={actorForm.tactics.join(", ")}
                onChange={(e) =>
                  handleFormChange(
                    "tactics",
                    e.target.value.split(",").map((t) => t.trim())
                  )
                }
                margin="normal"
                placeholder="e.g., Phishing, Ransomware, Supply Chain"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveActor}
            disabled={
              isCreating || isUpdating || !actorForm.name || !actorForm.type
            }
          >
            {editMode ? "Update" : "Add"} Actor
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Threat Actor</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the threat actor "
            {actorToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteActor}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { ThreatActorsList };
