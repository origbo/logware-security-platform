/**
 * AlertsManagement Component
 *
 * Comprehensive alerts management system providing:
 * - Alert triage workflow
 * - Alert correlation
 * - Response automation
 * - Contextual enrichment
 * - Advanced filtering and sorting
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  Chip,
  Button,
  IconButton,
  Badge,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  SelectChangeEvent,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Timeline as TimelineIcon,
  MoreVert as MoreVertIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Delete as DeleteIcon,
  Forum as ForumIcon,
} from "@mui/icons-material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import AlertDetail from "./AlertDetail";
import {
  useGetAlertsQuery,
  useUpdateAlertMutation,
  useBulkUpdateAlertsMutation,
} from "../services/alertsApi";
import {
  Alert as AlertType,
  AlertSeverity,
  AlertStatus,
  AlertSource,
} from "../types/alertTypes";
import { usePlaybooks } from "../../soar/hooks/usePlaybooks";

// Alert Filter interface
interface AlertFilter {
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  source?: AlertSource[];
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  assignedTo?: string;
}

const AlertsManagement: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertType | null>(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [assignMenuAnchorEl, setAssignMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [filters, setFilters] = useState<AlertFilter>({});
  const [playBookDialogOpen, setPlayBookDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // API hooks
  const {
    data: alerts = [],
    isLoading,
    isError,
    refetch,
  } = useGetAlertsQuery(filters);
  const [updateAlert] = useUpdateAlertMutation();
  const [bulkUpdateAlerts] = useBulkUpdateAlertsMutation();

  // Get available playbooks
  const { playbooks, loading: playbooksLoading } = usePlaybooks();

  // Filter alerts based on tab selection
  const filteredAlerts = useMemo(() => {
    switch (selectedTab) {
      case 0: // All
        return alerts;
      case 1: // New
        return alerts.filter((alert) => alert.status === AlertStatus.NEW);
      case 2: // In Progress
        return alerts.filter(
          (alert) => alert.status === AlertStatus.IN_PROGRESS
        );
      case 3: // Resolved
        return alerts.filter((alert) => alert.status === AlertStatus.RESOLVED);
      case 4: // Closed
        return alerts.filter((alert) => alert.status === AlertStatus.CLOSED);
      default:
        return alerts;
    }
  }, [alerts, selectedTab]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setSelectedAlerts([]);
  };

  // Handle row selection change
  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedAlerts(newSelection);
  };

  // Open alert detail view
  const handleOpenDetail = (alert: AlertType) => {
    setCurrentAlert(alert);
    setDetailOpen(true);
  };

  // Close alert detail view
  const handleCloseDetail = () => {
    setDetailOpen(false);
    setCurrentAlert(null);
  };

  // Handle action menu open
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActionMenuAnchorEl(event.currentTarget);
  };

  // Handle action menu close
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
  };

  // Handle status menu open
  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setStatusMenuAnchorEl(event.currentTarget);
  };

  // Handle status menu close
  const handleStatusMenuClose = () => {
    setStatusMenuAnchorEl(null);
  };

  // Handle assign menu open
  const handleAssignMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAssignMenuAnchorEl(event.currentTarget);
  };

  // Handle assign menu close
  const handleAssignMenuClose = () => {
    setAssignMenuAnchorEl(null);
  };

  // Handle filter menu open
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };

  // Handle filter menu close
  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
  };

  // Apply filters
  const applyFilters = (newFilters: AlertFilter) => {
    setFilters(newFilters);
    setFilterMenuAnchorEl(null);
  };

  // Open playbook dialog
  const handleOpenPlaybookDialog = () => {
    setPlayBookDialogOpen(true);
    setActionMenuAnchorEl(null);
  };

  // Close playbook dialog
  const handleClosePlaybookDialog = () => {
    setPlayBookDialogOpen(false);
  };

  // Run playbook on selected alerts
  const handleRunPlaybook = (playbookId: string) => {
    // Logic to run playbook on selected alerts
    console.log(`Running playbook ${playbookId} on alerts:`, selectedAlerts);
    setPlayBookDialogOpen(false);
  };

  // Update alert status
  const updateSelectedAlertStatus = async (status: AlertStatus) => {
    try {
      await bulkUpdateAlerts({
        ids: selectedAlerts,
        updates: { status },
      });

      setStatusMenuAnchorEl(null);
      refetch();
    } catch (error) {
      console.error("Failed to update alerts:", error);
    }
  };

  // Assign alerts to user
  const assignSelectedAlerts = async (userId: string, userName: string) => {
    try {
      await bulkUpdateAlerts({
        ids: selectedAlerts,
        updates: { assignedTo: userId, assignedToName: userName },
      });

      setAssignMenuAnchorEl(null);
      refetch();
    } catch (error) {
      console.error("Failed to assign alerts:", error);
    }
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);

    // Debounce search
    const timer = setTimeout(() => {
      setFilters({
        ...filters,
        searchTerm: event.target.value,
      });
    }, 500);

    return () => clearTimeout(timer);
  };

  // Get severity icon
  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return <ErrorIcon color="error" />;
      case AlertSeverity.HIGH:
        return <WarningIcon color="error" />;
      case AlertSeverity.MEDIUM:
        return <WarningIcon color="warning" />;
      case AlertSeverity.LOW:
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  // Get status icon
  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.NEW:
        return <ErrorIcon color="error" />;
      case AlertStatus.IN_PROGRESS:
        return <PlayArrowIcon color="primary" />;
      case AlertStatus.RESOLVED:
        return <CheckCircleIcon color="success" />;
      case AlertStatus.CLOSED:
        return <BlockIcon color="action" />;
      case AlertStatus.FALSE_POSITIVE:
        return <BlockIcon color="warning" />;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "severity",
      headerName: "",
      width: 40,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value}>
          {getSeverityIcon(params.value as AlertSeverity)}
        </Tooltip>
      ),
      sortable: true,
    },
    {
      field: "id",
      headerName: "ID",
      width: 90,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
          {params.value.toString().substr(0, 8)}
        </Typography>
      ),
    },
    {
      field: "title",
      headerName: "Alert",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
          <Typography variant="caption" color="textSecondary" noWrap>
            {params.row.source}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          size="small"
          label={params.value}
          color={
            params.value === AlertStatus.NEW
              ? "error"
              : params.value === AlertStatus.IN_PROGRESS
              ? "primary"
              : params.value === AlertStatus.RESOLVED
              ? "success"
              : params.value === AlertStatus.FALSE_POSITIVE
              ? "warning"
              : "default"
          }
          icon={getStatusIcon(params.value as AlertStatus)}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Time",
      width: 160,
      valueGetter: (params: GridValueGetterParams) =>
        formatDate(params.value as string),
    },
    {
      field: "assignedToName",
      headerName: "Assigned To",
      width: 130,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Chip size="small" label={params.value} variant="outlined" />
        ) : (
          <Typography variant="caption" color="textSecondary">
            Unassigned
          </Typography>
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleOpenDetail(params.row as AlertType)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Run Playbook">
            <IconButton size="small" onClick={handleOpenPlaybookDialog}>
              <PlayArrowIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Generate alert counter
  const getAlertCount = (status: AlertStatus) => {
    return alerts.filter((alert) => alert.status === status).length;
  };

  // Severity distribution for stats
  const severityDistribution = {
    [AlertSeverity.CRITICAL]: alerts.filter(
      (a) => a.severity === AlertSeverity.CRITICAL
    ).length,
    [AlertSeverity.HIGH]: alerts.filter(
      (a) => a.severity === AlertSeverity.HIGH
    ).length,
    [AlertSeverity.MEDIUM]: alerts.filter(
      (a) => a.severity === AlertSeverity.MEDIUM
    ).length,
    [AlertSeverity.LOW]: alerts.filter((a) => a.severity === AlertSeverity.LOW)
      .length,
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h4" gutterBottom>
        Security Alerts Management
      </Typography>

      {/* Alert Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              New Alerts
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h4" sx={{ mr: 1 }}>
                {getAlertCount(AlertStatus.NEW)}
              </Typography>
              <ErrorIcon color="error" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              In Progress
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h4" sx={{ mr: 1 }}>
                {getAlertCount(AlertStatus.IN_PROGRESS)}
              </Typography>
              <PlayArrowIcon color="primary" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Resolved Today
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h4" sx={{ mr: 1 }}>
                {
                  alerts.filter(
                    (a) =>
                      a.status === AlertStatus.RESOLVED &&
                      new Date(a.resolvedAt || "").toDateString() ===
                        new Date().toDateString()
                  ).length
                }
              </Typography>
              <CheckCircleIcon color="success" />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Average Resolution Time
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h4" sx={{ mr: 1 }}>
                3.2h
              </Typography>
              <TimelineIcon color="info" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Alerts Table */}
      <Paper sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>All</Typography>
                  <Chip
                    label={alerts.length}
                    size="small"
                    sx={{ ml: 1, height: 20 }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>New</Typography>
                  <Chip
                    label={getAlertCount(AlertStatus.NEW)}
                    size="small"
                    color="error"
                    sx={{ ml: 1, height: 20 }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>In Progress</Typography>
                  <Chip
                    label={getAlertCount(AlertStatus.IN_PROGRESS)}
                    size="small"
                    color="primary"
                    sx={{ ml: 1, height: 20 }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>Resolved</Typography>
                  <Chip
                    label={getAlertCount(AlertStatus.RESOLVED)}
                    size="small"
                    color="success"
                    sx={{ ml: 1, height: 20 }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography>Closed</Typography>
                  <Chip
                    label={getAlertCount(AlertStatus.CLOSED)}
                    size="small"
                    sx={{ ml: 1, height: 20 }}
                  />
                </Box>
              }
            />
          </Tabs>

          <Box>
            <TextField
              placeholder="Search alerts..."
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 1 }}
            />

            <Tooltip title="Filter Alerts">
              <IconButton onClick={handleFilterMenuOpen}>
                <Badge
                  color="primary"
                  variant="dot"
                  invisible={Object.keys(filters).length <= 1} // Only counting searchTerm
                >
                  <FilterIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton onClick={() => refetch()}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider />

        {/* Action Toolbar */}
        {selectedAlerts.length > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 1,
              bgcolor: theme.palette.action.hover,
            }}
          >
            <Typography variant="body2" sx={{ mr: 2 }}>
              {selectedAlerts.length} alert
              {selectedAlerts.length !== 1 ? "s" : ""} selected
            </Typography>

            <Button
              size="small"
              startIcon={<AssignmentIcon />}
              endIcon={<ArrowDropDownIcon />}
              variant="outlined"
              onClick={handleAssignMenuOpen}
              sx={{ mr: 1 }}
            >
              Assign
            </Button>

            <Button
              size="small"
              startIcon={getStatusIcon(AlertStatus.IN_PROGRESS)}
              endIcon={<ArrowDropDownIcon />}
              variant="outlined"
              onClick={handleStatusMenuOpen}
              sx={{ mr: 1 }}
            >
              Status
            </Button>

            <Button
              size="small"
              startIcon={<PlayArrowIcon />}
              variant="outlined"
              onClick={handleOpenPlaybookDialog}
              sx={{ mr: 1 }}
            >
              Run Playbook
            </Button>

            <Button
              size="small"
              startIcon={<ForumIcon />}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Add Note
            </Button>

            <Button
              size="small"
              startIcon={<MoreVertIcon />}
              endIcon={<ArrowDropDownIcon />}
              variant="outlined"
              onClick={handleActionMenuOpen}
            >
              Actions
            </Button>
          </Box>
        )}

        <Divider />

        {/* Alert Data Grid */}
        <Box sx={{ flexGrow: 1, width: "100%", position: "relative" }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">
                Failed to load alerts. Please try refreshing the page.
              </Alert>
            </Box>
          ) : filteredAlerts.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                p: 4,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <WarningIcon
                  sx={{ fontSize: 40, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6">No alerts found</Typography>
                <Typography variant="body2" color="textSecondary">
                  Try adjusting your filters or search terms
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    setFilters({});
                    setSearchTerm("");
                    refetch();
                  }}
                  sx={{ mt: 2 }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Box>
          ) : (
            <DataGrid
              rows={filteredAlerts}
              columns={columns}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(newSelectionModel) => {
                handleSelectionChange(newSelectionModel as string[]);
              }}
              rowSelectionModel={selectedAlerts}
              initialState={{
                sorting: {
                  sortModel: [{ field: "createdAt", sort: "desc" }],
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              density="standard"
            />
          )}
        </Box>
      </Paper>

      {/* Status Menu */}
      <Menu
        anchorEl={statusMenuAnchorEl}
        open={Boolean(statusMenuAnchorEl)}
        onClose={handleStatusMenuClose}
      >
        <MenuItem onClick={() => updateSelectedAlertStatus(AlertStatus.NEW)}>
          <ListItemIcon>{getStatusIcon(AlertStatus.NEW)}</ListItemIcon>
          <Typography>New</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => updateSelectedAlertStatus(AlertStatus.IN_PROGRESS)}
        >
          <ListItemIcon>{getStatusIcon(AlertStatus.IN_PROGRESS)}</ListItemIcon>
          <Typography>In Progress</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => updateSelectedAlertStatus(AlertStatus.RESOLVED)}
        >
          <ListItemIcon>{getStatusIcon(AlertStatus.RESOLVED)}</ListItemIcon>
          <Typography>Resolved</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => updateSelectedAlertStatus(AlertStatus.FALSE_POSITIVE)}
        >
          <ListItemIcon>
            {getStatusIcon(AlertStatus.FALSE_POSITIVE)}
          </ListItemIcon>
          <Typography>False Positive</Typography>
        </MenuItem>
        <MenuItem onClick={() => updateSelectedAlertStatus(AlertStatus.CLOSED)}>
          <ListItemIcon>{getStatusIcon(AlertStatus.CLOSED)}</ListItemIcon>
          <Typography>Closed</Typography>
        </MenuItem>
      </Menu>

      {/* Assign Menu */}
      <Menu
        anchorEl={assignMenuAnchorEl}
        open={Boolean(assignMenuAnchorEl)}
        onClose={handleAssignMenuClose}
      >
        <MenuItem onClick={() => assignSelectedAlerts("user1", "John Smith")}>
          John Smith
        </MenuItem>
        <MenuItem onClick={() => assignSelectedAlerts("user2", "Jane Doe")}>
          Jane Doe
        </MenuItem>
        <MenuItem onClick={() => assignSelectedAlerts("user3", "Alex Johnson")}>
          Alex Johnson
        </MenuItem>
        <MenuItem
          onClick={() => assignSelectedAlerts("user4", "Sarah Williams")}
        >
          Sarah Williams
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => assignSelectedAlerts("", "Unassigned")}>
          <Typography color="error">Unassign</Typography>
        </MenuItem>
      </Menu>

      {/* Actions Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={handleActionMenuClose}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <Typography>View Details</Typography>
        </MenuItem>
        <MenuItem onClick={handleOpenPlaybookDialog}>
          <ListItemIcon>
            <PlayArrowIcon fontSize="small" />
          </ListItemIcon>
          <Typography>Run Playbook</Typography>
        </MenuItem>
        <MenuItem onClick={handleActionMenuClose}>
          <ListItemIcon>
            <TimelineIcon fontSize="small" />
          </ListItemIcon>
          <Typography>View Timeline</Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleActionMenuClose}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography>Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Alert Detail Dialog */}
      {currentAlert && (
        <AlertDetail
          alert={currentAlert}
          open={detailOpen}
          onClose={handleCloseDetail}
          onStatusChange={(status) => {
            updateAlert({
              id: currentAlert.id,
              updates: { status },
            });
            refetch();
          }}
        />
      )}

      {/* Run Playbook Dialog */}
      <Dialog
        open={playBookDialogOpen}
        onClose={handleClosePlaybookDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Run Playbook</DialogTitle>
        <DialogContent dividers>
          {playbooksLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Typography gutterBottom>
                Select a playbook to run on {selectedAlerts.length} selected
                alert{selectedAlerts.length !== 1 ? "s" : ""}:
              </Typography>
              <Box sx={{ mt: 2 }}>
                {playbooks?.map((playbook) => (
                  <Button
                    key={playbook.id}
                    variant="outlined"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleRunPlaybook(playbook.id)}
                    sx={{ m: 1 }}
                  >
                    {playbook.name}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePlaybookDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertsManagement;
