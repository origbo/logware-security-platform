import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Typography,
  Grid,
  Divider,
  Button,
  Tooltip,
  CircularProgress,
  TablePagination,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

// Icons
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";
import HistoryIcon from "@mui/icons-material/History";
import ReportIcon from "@mui/icons-material/Report";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import TuneIcon from "@mui/icons-material/Tune";

// Types
import { Alert } from "../../types/alerts";

// Styled components
const SeverityChip = styled(Chip)(({ theme }) => ({
  minWidth: 90,
  "&.critical": {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  "&.high": {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  "&.medium": {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  "&.low": {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
  },
  "&.info": {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  minWidth: 90,
  "&.open": {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
    borderColor: theme.palette.warning.main,
  },
  "&.in_progress": {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark,
    borderColor: theme.palette.info.main,
  },
  "&.resolved": {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
    borderColor: theme.palette.success.main,
  },
  "&.closed": {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[800],
    borderColor: theme.palette.grey[500],
  },
  "&.false_positive": {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.grey[700],
    borderColor: theme.palette.grey[400],
  },
}));

// Helper functions
const formatSeverityLabel = (severity: string): string => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

const formatStatusLabel = (status: string): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Types for table sorting
type SortDirection = "asc" | "desc";

interface HeadCell {
  id: keyof Alert | "actions";
  label: string;
  sortable: boolean;
  align?: "left" | "right" | "center";
  width?: string | number;
}

// Define table headers
const headCells: HeadCell[] = [
  { id: "id", label: "Alert ID", sortable: true, width: "120px" },
  { id: "severity", label: "Severity", sortable: true, width: "120px" },
  { id: "title", label: "Title", sortable: true },
  { id: "source", label: "Source", sortable: true, width: "150px" },
  { id: "status", label: "Status", sortable: true, width: "120px" },
  { id: "createdAt", label: "Created", sortable: true, width: "180px" },
  {
    id: "actions",
    label: "Actions",
    sortable: false,
    align: "center",
    width: "100px",
  },
];

// Props interface
interface AlertsTableProps {
  alerts: Alert[];
  loading: boolean;
}

const AlertsTable: React.FC<AlertsTableProps> = ({ alerts, loading }) => {
  const theme = useTheme();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [order, setOrder] = useState<SortDirection>("desc");
  const [orderBy, setOrderBy] = useState<keyof Alert>("createdAt");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  // Toggle row expansion
  const handleRowToggle = (alertId: string) => {
    setExpandedRow(expandedRow === alertId ? null : alertId);
  };

  // Handle sort request
  const handleRequestSort = (property: keyof Alert) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle actions menu
  const handleActionsClick = (
    event: React.MouseEvent<HTMLElement>,
    alertId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedAlertId(alertId);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
    setSelectedAlertId(null);
  };

  // Compare function for sorting
  const descendingComparator = <T extends object>(
    a: T,
    b: T,
    orderBy: keyof T
  ) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const getComparator = (order: SortDirection, orderBy: keyof Alert) => {
    return order === "desc"
      ? (a: Alert, b: Alert) => descendingComparator(a, b, orderBy)
      : (a: Alert, b: Alert) => -descendingComparator(a, b, orderBy);
  };

  // Apply sorting and pagination
  const visibleRows = alerts
    .slice()
    .sort(getComparator(order, orderBy))
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Render empty state
  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={headCells.length} sx={{ textAlign: "center", py: 4 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={40} sx={{ mr: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading alerts...
            </Typography>
          </Box>
        ) : (
          <Box>
            <ReportIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No alerts found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or refresh to check for new alerts
            </Typography>
          </Box>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <Paper elevation={1}>
      <TableContainer>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || "left"}
                  sortDirection={orderBy === headCell.id ? order : false}
                  style={{ width: headCell.width }}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() =>
                        handleRequestSort(headCell.id as keyof Alert)
                      }
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length > 0
              ? visibleRows.map((alert) => (
                  <React.Fragment key={alert.id}>
                    <TableRow
                      hover
                      sx={{
                        "& > *": { borderBottom: "unset" },
                        cursor: "pointer",
                        backgroundColor:
                          expandedRow === alert.id
                            ? "rgba(0, 0, 0, 0.04)"
                            : "inherit",
                      }}
                      onClick={() => handleRowToggle(alert.id)}
                    >
                      <TableCell padding="checkbox">
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowToggle(alert.id);
                          }}
                        >
                          {expandedRow === alert.id ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {alert.id}
                      </TableCell>
                      <TableCell>
                        <SeverityChip
                          label={formatSeverityLabel(alert.severity)}
                          className={alert.severity}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{alert.title}</TableCell>
                      <TableCell>{alert.source}</TableCell>
                      <TableCell>
                        <StatusChip
                          label={formatStatusLabel(alert.status)}
                          className={alert.status}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatTimestamp(alert.createdAt)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionsClick(e, alert.id);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={headCells.length + 1}
                      >
                        <Collapse
                          in={expandedRow === alert.id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ m: 2 }}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              component="div"
                            >
                              Alert Details
                            </Typography>
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={8}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                >
                                  Description
                                </Typography>
                                <Typography variant="body1" paragraph>
                                  {alert.description}
                                </Typography>

                                {alert.tags && alert.tags.length > 0 && (
                                  <Box sx={{ mb: 2 }}>
                                    <Typography
                                      variant="subtitle2"
                                      color="text.secondary"
                                      gutterBottom
                                    >
                                      Tags
                                    </Typography>
                                    <Box>
                                      {alert.tags.map((tag) => (
                                        <Chip
                                          key={tag}
                                          label={tag}
                                          size="small"
                                          variant="outlined"
                                          sx={{ mr: 1, mb: 1 }}
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                )}

                                <Box sx={{ display: "flex", mt: 3 }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<VisibilityIcon />}
                                    sx={{ mr: 1 }}
                                  >
                                    View Details
                                  </Button>
                                  {alert.status === "open" && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<PlayArrowIcon />}
                                      sx={{ mr: 1 }}
                                    >
                                      Start Investigation
                                    </Button>
                                  )}
                                  {alert.status === "in_progress" && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<CheckCircleIcon />}
                                      color="success"
                                      sx={{ mr: 1 }}
                                    >
                                      Mark as Resolved
                                    </Button>
                                  )}
                                  {["open", "in_progress"].includes(
                                    alert.status
                                  ) && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<BlockIcon />}
                                      color="error"
                                    >
                                      Mark as False Positive
                                    </Button>
                                  )}
                                </Box>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Additional Information
                                  </Typography>
                                  <Grid container spacing={1}>
                                    {alert.sourceIp && (
                                      <>
                                        <Grid item xs={5}>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Source IP:
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={7}>
                                          <Typography variant="body2">
                                            {alert.sourceIp}
                                          </Typography>
                                        </Grid>
                                      </>
                                    )}

                                    {alert.destinationIp && (
                                      <>
                                        <Grid item xs={5}>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Destination IP:
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={7}>
                                          <Typography variant="body2">
                                            {alert.destinationIp}
                                          </Typography>
                                        </Grid>
                                      </>
                                    )}

                                    <Grid item xs={5}>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Alert Type:
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                      <Typography variant="body2">
                                        {alert.type}
                                      </Typography>
                                    </Grid>

                                    <Grid item xs={5}>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Created:
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                      <Typography variant="body2">
                                        {formatTimestamp(alert.createdAt)}
                                      </Typography>
                                    </Grid>

                                    {alert.updatedAt && (
                                      <>
                                        <Grid item xs={5}>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Last Updated:
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={7}>
                                          <Typography variant="body2">
                                            {formatTimestamp(alert.updatedAt)}
                                          </Typography>
                                        </Grid>
                                      </>
                                    )}

                                    {alert.assignedTo && (
                                      <>
                                        <Grid item xs={5}>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Assigned To:
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={7}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                            }}
                                          >
                                            <PersonIcon
                                              fontSize="small"
                                              sx={{
                                                mr: 0.5,
                                                color: "primary.main",
                                              }}
                                            />
                                            <Typography variant="body2">
                                              {alert.assignedTo}
                                            </Typography>
                                          </Box>
                                        </Grid>
                                      </>
                                    )}
                                  </Grid>
                                </Paper>
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              : renderEmptyState()}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={alerts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionsClose}
      >
        <MenuItem onClick={handleActionsClose}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleActionsClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Alert</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleActionsClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Assign Alert</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleActionsClose}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View History</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleActionsClose}>
          <ListItemIcon>
            <AccountTreeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Related Alerts</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleActionsClose}>
          <ListItemIcon>
            <TuneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Configure Rule</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleActionsClose} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Alert</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default AlertsTable;
