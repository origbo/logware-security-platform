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
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CloudDownload as ExportIcon,
  CloudUpload as ImportIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../features/auth/hooks/useAuth";
import soarApiService, { Playbook } from "../../../services/api/soarApiService";

/**
 * PlaybookList Component
 *
 * Displays a list of SOAR playbooks with options to create, edit, execute, and manage
 */
const PlaybookList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // State
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playbookToDelete, setPlaybookToDelete] = useState<Playbook | null>(
    null
  );
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [playbookToExecute, setPlaybookToExecute] = useState<Playbook | null>(
    null
  );
  const [executionParams, setExecutionParams] = useState<Record<string, any>>(
    {}
  );
  const [executionLoading, setExecutionLoading] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionSuccess, setExecutionSuccess] = useState<string | null>(null);

  // Fetch playbooks on component mount and when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaybooks();
    }
  }, [isAuthenticated]);

  // Function to fetch playbooks
  const fetchPlaybooks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await soarApiService.getPlaybooks();
      setPlaybooks(response.data);
    } catch (err) {
      console.error("Error fetching playbooks:", err);
      setError("Failed to load playbooks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter playbooks based on search term
  const filteredPlaybooks = playbooks.filter(
    (playbook) =>
      playbook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playbook.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (playbook.tags &&
        playbook.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

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

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Navigate to playbook editor
  const handleAddPlaybook = () => {
    navigate("/soar/playbooks/new");
  };

  // Navigate to edit playbook
  const handleEditPlaybook = (id: string) => {
    navigate(`/soar/playbooks/edit/${id}`);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (playbook: Playbook) => {
    setPlaybookToDelete(playbook);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPlaybookToDelete(null);
  };

  // Delete playbook
  const handleDeletePlaybook = async () => {
    if (!playbookToDelete) return;

    setLoading(true);

    try {
      await soarApiService.deletePlaybook(playbookToDelete.id);
      setPlaybooks(playbooks.filter((p) => p.id !== playbookToDelete.id));
      handleCloseDeleteDialog();
    } catch (err) {
      console.error("Error deleting playbook:", err);
      setError("Failed to delete playbook. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Open execute playbook dialog
  const handleOpenExecuteDialog = (playbook: Playbook) => {
    setPlaybookToExecute(playbook);
    setExecutionParams({});
    setExecutionError(null);
    setExecutionSuccess(null);
    setExecuteDialogOpen(true);
  };

  // Close execute playbook dialog
  const handleCloseExecuteDialog = () => {
    setExecuteDialogOpen(false);
    setPlaybookToExecute(null);
    setExecutionParams({});
    setExecutionError(null);
    setExecutionSuccess(null);
  };

  // Execute playbook
  const handleExecutePlaybook = async () => {
    if (!playbookToExecute) return;

    setExecutionLoading(true);
    setExecutionError(null);
    setExecutionSuccess(null);

    try {
      const response = await soarApiService.executePlaybook(
        playbookToExecute.id,
        executionParams
      );
      setExecutionSuccess(
        `Playbook execution started successfully. Execution ID: ${response.data.executionId}`
      );

      // Refresh playbooks list after execution to update counts and last run time
      fetchPlaybooks();
    } catch (err) {
      console.error("Error executing playbook:", err);
      setExecutionError(
        "Failed to execute playbook. Please check the parameters and try again."
      );
    } finally {
      setExecutionLoading(false);
    }
  };

  // View playbook execution history
  const handleViewHistory = (id: string) => {
    navigate(`/soar/playbooks/${id}/executions`);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return theme.palette.success.main;
      case "disabled":
        return theme.palette.warning.main;
      case "draft":
        return theme.palette.info.main;
      case "archived":
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1">
          SOAR Playbooks
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPlaybook}
            sx={{ ml: 1 }}
          >
            Create Playbook
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Box sx={{ display: "flex", mb: 2 }}>
        <TextField
          placeholder="Search playbooks..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mr: 1 }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          sx={{ minWidth: 100 }}
        >
          Filter
        </Button>
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          sx={{ ml: 1, minWidth: 100 }}
        >
          Export
        </Button>
        <Button
          variant="outlined"
          startIcon={<ImportIcon />}
          sx={{ ml: 1, minWidth: 100 }}
        >
          Import
        </Button>
      </Box>

      {/* Playbooks Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {loading && <LinearProgress />}
        <TableContainer sx={{ maxHeight: "calc(100vh - 280px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Trigger Type</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell>Success/Failure</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPlaybooks
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((playbook) => (
                  <TableRow hover key={playbook.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {playbook.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {playbook.description}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {playbook.tags &&
                            playbook.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{
                                  mr: 0.5,
                                  mt: 0.5,
                                  height: 20,
                                  fontSize: "0.7rem",
                                }}
                              />
                            ))}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={playbook.status}
                        size="small"
                        sx={{
                          color: getStatusColor(playbook.status),
                          bgcolor: `${getStatusColor(playbook.status)}15`,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={playbook.triggerType.replace("-", " ")}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>{playbook.owner}</TableCell>
                    <TableCell>
                      {playbook.lastRunAt
                        ? new Date(playbook.lastRunAt).toLocaleString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Chip
                          label={`${playbook.successCount}`}
                          size="small"
                          sx={{
                            mr: 1,
                            bgcolor: theme.palette.success.main,
                            color: "#fff",
                            minWidth: 40,
                          }}
                        />
                        <Chip
                          label={`${playbook.failureCount}`}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.error.main,
                            color: "#fff",
                            minWidth: 40,
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenExecuteDialog(playbook)}
                        disabled={playbook.status !== "active"}
                      >
                        <PlayIcon />
                      </IconButton>
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => handleEditPlaybook(playbook.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        size="small"
                        onClick={() => handleViewHistory(playbook.id)}
                      >
                        <HistoryIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleOpenDeleteDialog(playbook)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredPlaybooks.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      {searchTerm
                        ? "No playbooks match your search criteria"
                        : "No playbooks available. Create your first playbook!"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredPlaybooks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Playbook</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the playbook "
            {playbookToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDeletePlaybook}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Execute Playbook Dialog */}
      <Dialog
        open={executeDialogOpen}
        onClose={handleCloseExecuteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Execute Playbook</DialogTitle>
        <DialogContent>
          <Typography variant="h6">{playbookToExecute?.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {playbookToExecute?.description}
          </Typography>

          {executionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {executionError}
            </Alert>
          )}

          {executionSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {executionSuccess}
            </Alert>
          )}

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Execution Parameters (JSON)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="{}"
            value={JSON.stringify(executionParams, null, 2)}
            onChange={(e) => {
              try {
                if (e.target.value) {
                  setExecutionParams(JSON.parse(e.target.value));
                } else {
                  setExecutionParams({});
                }
              } catch (err) {
                // Allow invalid JSON while typing, will validate on submit
              }
            }}
            error={!!executionError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExecuteDialog}>Cancel</Button>
          <Button
            onClick={handleExecutePlaybook}
            color="primary"
            variant="contained"
            disabled={executionLoading}
          >
            Execute
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlaybookList;
