/**
 * CaseManagement Component
 *
 * Main component for the security case management system.
 * Provides an interface for viewing and managing security incidents.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Menu,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  SortByAlpha as SortIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCases } from "../hooks/useCases";
import { usePlaybooks } from "../hooks/usePlaybooks";
import {
  Case,
  CaseStatus,
  CaseSeverity,
  CasePriority,
  CaseFilters,
} from "../types/soarTypes";

interface CaseManagementProps {
  onSelectCase?: (caseId: string) => void;
  standalone?: boolean;
}

/**
 * CaseManagement Component
 */
const CaseManagement: React.FC<CaseManagementProps> = ({
  onSelectCase,
  standalone = true,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    cases,
    filteredCases,
    loading,
    error,
    filters,
    setFilters,
    clearFilters,
    createCase,
    updateCase,
    changeStatus,
    getStatusColor,
    getSeverityColor,
    getPriorityLabel,
  } = useCases();

  const [tabValue, setTabValue] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Case>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [newCaseDialogOpen, setNewCaseDialogOpen] = useState(false);
  const [newCase, setNewCase] = useState<Partial<Case>>({
    title: "",
    description: "",
    severity: "medium",
    priority: "p2",
    tags: [],
  });

  // Apply search term to filters when changed
  useEffect(() => {
    setFilters({ searchTerm });
  }, [searchTerm, setFilters]);

  // Change filters based on tab value
  useEffect(() => {
    switch (tabValue) {
      case 0: // All active
        setFilters({
          status: [
            "open",
            "investigating",
            "containment",
            "eradication",
            "recovery",
          ],
        });
        break;
      case 1: // High priority
        setFilters({
          priority: ["p0", "p1"],
          status: [
            "open",
            "investigating",
            "containment",
            "eradication",
            "recovery",
          ],
        });
        break;
      case 2: // My cases
        setFilters({
          assignedTo: ["current-user"],
          status: [
            "open",
            "investigating",
            "containment",
            "eradication",
            "recovery",
          ],
        });
        break;
      case 3: // Closed
        setFilters({ status: ["closed"] });
        break;
    }
  }, [tabValue, setFilters]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle opening filter menu
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Handle closing filter menu
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Handle changing filter values
  const handleFilterChange = (filterKey: keyof CaseFilters, value: any) => {
    setFilters({ [filterKey]: value });
  };

  // Handle sort change
  const handleSortChange = (field: keyof Case) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Handle creating a new case
  const handleCreateCase = async () => {
    try {
      const createdCase = await createCase({
        ...newCase,
        status: "open",
        createdBy: "current-user",
        tags: newCase.tags || [],
      });

      setNewCaseDialogOpen(false);
      setNewCase({
        title: "",
        description: "",
        severity: "medium",
        priority: "p2",
        tags: [],
      });

      // Navigate to the new case if standalone
      if (standalone) {
        navigate(`/soar/cases/${createdCase.id}`);
      } else if (onSelectCase) {
        onSelectCase(createdCase.id);
      }
    } catch (error) {
      console.error("Failed to create case:", error);
    }
  };

  // Handle clicking on a case
  const handleCaseClick = (caseId: string) => {
    if (standalone) {
      navigate(`/soar/cases/${caseId}`);
    } else if (onSelectCase) {
      onSelectCase(caseId);
    }
  };

  // Handle changing case status
  const handleStatusChange = (caseId: string, status: CaseStatus) => {
    changeStatus(caseId, status);
  };

  // Sort cases
  const sortedCases = [...filteredCases].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle special cases for sorting
    if (sortField === "severity") {
      const severityOrder = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
        info: 4,
      };
      aValue = severityOrder[a.severity];
      bValue = severityOrder[b.severity];
    } else if (sortField === "priority") {
      const priorityOrder = { p0: 0, p1: 1, p2: 2, p3: 3, p4: 4 };
      aValue = priorityOrder[a.priority];
      bValue = priorityOrder[b.priority];
    } else if (sortField === "status") {
      const statusOrder = {
        open: 0,
        investigating: 1,
        containment: 2,
        eradication: 3,
        recovery: 4,
        closed: 5,
      };
      aValue = statusOrder[a.status];
      bValue = statusOrder[b.status];
    }

    // Compare values
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Security Cases
          </Typography>

          <Tooltip title="Refresh">
            <IconButton onClick={() => {}}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Filter">
            <IconButton onClick={handleFilterClick}>
              <FilterIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewCaseDialogOpen(true)}
            sx={{ ml: 1 }}
          >
            New Case
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={`${sortField}-${sortDirection}`}
                label="Sort By"
                onChange={(e) => {
                  const [field, direction] = e.target.value.split("-");
                  setSortField(field as keyof Case);
                  setSortDirection(direction as "asc" | "desc");
                }}
              >
                <MenuItem value="createdAt-desc">Newest First</MenuItem>
                <MenuItem value="createdAt-asc">Oldest First</MenuItem>
                <MenuItem value="severity-asc">Severity (Low to High)</MenuItem>
                <MenuItem value="severity-desc">
                  Severity (High to Low)
                </MenuItem>
                <MenuItem value="status-asc">Status</MenuItem>
                <MenuItem value="title-asc">Title (A-Z)</MenuItem>
                <MenuItem value="title-desc">Title (Z-A)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={
              <Badge
                badgeContent={
                  filteredCases.filter((c) => c.status !== "closed").length
                }
                color="primary"
              >
                <Typography>All Active</Typography>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge
                badgeContent={
                  filteredCases.filter((c) => ["p0", "p1"].includes(c.priority))
                    .length
                }
                color="error"
              >
                <Typography>High Priority</Typography>
              </Badge>
            }
          />
          <Tab label="My Cases" />
          <Tab label="Closed" />
        </Tabs>
      </Box>

      {/* Case List */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : sortedCases.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary" paragraph>
              No cases found matching your criteria
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setNewCaseDialogOpen(true)}
            >
              Create New Case
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {sortedCases.map((caseItem) => (
              <Grid item xs={12} key={caseItem.id}>
                <Card
                  elevation={1}
                  onClick={() => handleCaseClick(caseItem.id)}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[3],
                    },
                    position: "relative",
                    overflow: "visible",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 5,
                      backgroundColor: getSeverityColor(caseItem.severity),
                      borderTopLeftRadius: theme.shape.borderRadius,
                      borderBottomLeftRadius: theme.shape.borderRadius,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={7}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {caseItem.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {caseItem.description?.substring(0, 150)}
                          {caseItem.description &&
                          caseItem.description.length > 150
                            ? "..."
                            : ""}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          {caseItem.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{
                                height: 24,
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.1)"
                                    : "rgba(0, 0, 0, 0.08)",
                              }}
                            />
                          ))}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Chip
                            label={caseItem.status}
                            size="small"
                            sx={{
                              bgcolor: alpha(
                                getStatusColor(caseItem.status),
                                0.2
                              ),
                              color: getStatusColor(caseItem.status),
                              textTransform: "capitalize",
                            }}
                          />
                          <Chip
                            label={caseItem.severity}
                            size="small"
                            sx={{
                              bgcolor: alpha(
                                getSeverityColor(caseItem.severity),
                                0.2
                              ),
                              color: getSeverityColor(caseItem.severity),
                              textTransform: "capitalize",
                            }}
                          />
                          <Chip
                            label={getPriorityLabel(caseItem.priority)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 2,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Created:{" "}
                            {new Date(caseItem.createdAt).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {caseItem.assignedTo
                              ? `Assigned to: ${caseItem.assignedTo}`
                              : "Unassigned"}
                          </Typography>
                        </Box>
                        {caseItem.artifacts && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Artifacts: {caseItem.artifacts.length}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCaseClick(caseItem.id);
                              }}
                            >
                              <TimelineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Filter Cases
        </Typography>
        <Divider />
        <Box sx={{ p: 2, width: 250 }}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              value={filters.status || []}
              label="Status"
              onChange={(e) => handleFilterChange("status", e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as CaseStatus[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="investigating">Investigating</MenuItem>
              <MenuItem value="containment">Containment</MenuItem>
              <MenuItem value="eradication">Eradication</MenuItem>
              <MenuItem value="recovery">Recovery</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              multiple
              value={filters.severity || []}
              label="Severity"
              onChange={(e) => handleFilterChange("severity", e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as CaseSeverity[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="info">Info</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              multiple
              value={filters.priority || []}
              label="Priority"
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as CasePriority[]).map((value) => (
                    <Chip
                      key={value}
                      label={getPriorityLabel(value)}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="p0">Critical (P0)</MenuItem>
              <MenuItem value="p1">High (P1)</MenuItem>
              <MenuItem value="p2">Medium (P2)</MenuItem>
              <MenuItem value="p3">Low (P3)</MenuItem>
              <MenuItem value="p4">Planning (P4)</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button onClick={clearFilters} size="small">
              Clear Filters
            </Button>
            <Button
              onClick={handleFilterClose}
              size="small"
              variant="contained"
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Menu>

      {/* New Case Dialog */}
      <Dialog
        open={newCaseDialogOpen}
        onClose={() => setNewCaseDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Security Case</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Case Title"
                value={newCase.title}
                onChange={(e) =>
                  setNewCase({ ...newCase, title: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={newCase.severity}
                  label="Severity"
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      severity: e.target.value as CaseSeverity,
                    })
                  }
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newCase.priority}
                  label="Priority"
                  onChange={(e) =>
                    setNewCase({
                      ...newCase,
                      priority: e.target.value as CasePriority,
                    })
                  }
                >
                  <MenuItem value="p0">Critical (P0)</MenuItem>
                  <MenuItem value="p1">High (P1)</MenuItem>
                  <MenuItem value="p2">Medium (P2)</MenuItem>
                  <MenuItem value="p3">Low (P3)</MenuItem>
                  <MenuItem value="p4">Planning (P4)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newCase.description}
                onChange={(e) =>
                  setNewCase({ ...newCase, description: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                placeholder="e.g., phishing, malware, ransomware"
                value={newCase.tags?.join(", ") || ""}
                onChange={(e) =>
                  setNewCase({
                    ...newCase,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCaseDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateCase}
            disabled={!newCase.title || !newCase.description}
          >
            Create Case
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseManagement;
