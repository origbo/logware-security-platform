import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  IconButton,
  Card,
  CardContent,
  Collapse,
  Divider,
  Button,
  Tooltip,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RouterIcon from "@mui/icons-material/Router";
import ComputerIcon from "@mui/icons-material/Computer";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import StorageIcon from "@mui/icons-material/Storage";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SecurityIcon from "@mui/icons-material/Security";
import BuildIcon from "@mui/icons-material/Build";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { format } from "date-fns";
import { NetworkDevice } from "../../pages/network/NetworkMonitoringPage";

// Interface for component props
interface NetworkDevicesProps {
  devices: NetworkDevice[];
}

const NetworkDevices: React.FC<NetworkDevicesProps> = ({ devices }) => {
  const theme = useTheme();

  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filteredDevices, setFilteredDevices] = useState(devices);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for expanded device details
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredDevices(devices);
    } else {
      const filtered = devices.filter(
        (device) =>
          device.name.toLowerCase().includes(query) ||
          device.ip.toLowerCase().includes(query) ||
          device.mac.toLowerCase().includes(query) ||
          (device.os && device.os.toLowerCase().includes(query))
      );
      setFilteredDevices(filtered);
    }

    setPage(0);
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

  // Toggle device details
  const handleToggleExpand = (deviceId: string) => {
    setExpandedDevice(expandedDevice === deviceId ? null : deviceId);
  };

  // Get device type icon
  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case "router":
        return <RouterIcon />;
      case "server":
        return <StorageIcon />;
      case "workstation":
        return <ComputerIcon />;
      case "mobile":
        return <SmartphoneIcon />;
      default:
        return <DevicesOtherIcon />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return theme.palette.success.main;
      case "offline":
        return theme.palette.error.main;
      case "warning":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get risk score color
  const getRiskScoreColor = (score: number) => {
    if (score < 3) return theme.palette.success.main;
    if (score < 7) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Calculate pagination
  const paginatedDevices = filteredDevices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search devices by name, IP, MAC..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              startIcon={<FilterListIcon />}
              onClick={() => setFilterOpen(!filterOpen)}
              variant={filterOpen ? "contained" : "outlined"}
              color="primary"
            >
              Filter
            </Button>
          </Grid>

          {/* Filter options (simplified for this implementation) */}
          {filterOpen && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  mt: 1,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Quick Filters
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label="All Devices"
                    onClick={() => setFilteredDevices(devices)}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label="Online Only"
                    onClick={() =>
                      setFilteredDevices(
                        devices.filter((device) => device.status === "online")
                      )
                    }
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label="Warning Status"
                    onClick={() =>
                      setFilteredDevices(
                        devices.filter((device) => device.status === "warning")
                      )
                    }
                    color="warning"
                    variant="outlined"
                  />
                  <Chip
                    label="Offline"
                    onClick={() =>
                      setFilteredDevices(
                        devices.filter((device) => device.status === "offline")
                      )
                    }
                    color="error"
                    variant="outlined"
                  />
                  <Chip
                    label="High Risk (6+)"
                    onClick={() =>
                      setFilteredDevices(
                        devices.filter((device) => device.riskScore >= 6)
                      )
                    }
                    color="error"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Devices Table */}
      <Paper>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Device</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Seen</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDevices.map((device) => (
                <React.Fragment key={device.id}>
                  <TableRow hover>
                    <TableCell padding="checkbox">
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => handleToggleExpand(device.id)}
                      >
                        {expandedDevice === device.id ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ mr: 2 }}>
                          {getDeviceTypeIcon(device.type)}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {device.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {device.mac}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {device.type}
                      </Typography>
                    </TableCell>
                    <TableCell>{device.ip}</TableCell>
                    <TableCell>
                      <Chip
                        label={device.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(device.status),
                          color: "#fff",
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(device.lastSeen), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            color: getRiskScoreColor(device.riskScore),
                          }}
                        >
                          {device.riskScore}/10
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Security Scan">
                        <IconButton size="small">
                          <SecurityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Configure">
                        <IconButton size="small">
                          <BuildIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Actions">
                        <IconButton size="small">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Device Details */}
                  <TableRow>
                    <TableCell
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                      colSpan={8}
                    >
                      <Collapse
                        in={expandedDevice === device.id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ p: 3 }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="h6" gutterBottom>
                                    Device Information
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        OS/Firmware:
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                      <Typography variant="body2">
                                        {device.os || "Unknown"}
                                      </Typography>
                                    </Grid>

                                    <Grid item xs={4}>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        Location:
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                      <Typography variant="body2">
                                        {device.location || "Unknown"}
                                      </Typography>
                                    </Grid>

                                    <Grid item xs={4}>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        Owner:
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                      <Typography variant="body2">
                                        {device.owner || "Unknown"}
                                      </Typography>
                                    </Grid>

                                    <Grid item xs={4}>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        Services:
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexWrap: "wrap",
                                          gap: 0.5,
                                        }}
                                      >
                                        {device.services.map((service) => (
                                          <Chip
                                            key={service}
                                            label={service}
                                            size="small"
                                            variant="outlined"
                                          />
                                        ))}
                                        {device.services.length === 0 && (
                                          <Typography variant="body2">
                                            No active services
                                          </Typography>
                                        )}
                                      </Box>
                                    </Grid>

                                    <Grid item xs={4}>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        Tags:
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={8}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexWrap: "wrap",
                                          gap: 0.5,
                                        }}
                                      >
                                        {device.tags.map((tag) => (
                                          <Chip
                                            key={tag}
                                            label={tag}
                                            size="small"
                                          />
                                        ))}
                                        {device.tags.length === 0 && (
                                          <Typography variant="body2">
                                            No tags
                                          </Typography>
                                        )}
                                      </Box>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                              </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Typography variant="h6" gutterBottom>
                                    Network Statistics
                                  </Typography>
                                  <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                      <Box sx={{ textAlign: "center", p: 2 }}>
                                        <Typography
                                          variant="h5"
                                          color="primary.main"
                                        >
                                          {(
                                            device.trafficIn /
                                            (1024 * 1024)
                                          ).toFixed(2)}{" "}
                                          MB
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          color="textSecondary"
                                        >
                                          Traffic In
                                        </Typography>
                                      </Box>
                                    </Grid>

                                    <Grid item xs={6}>
                                      <Box sx={{ textAlign: "center", p: 2 }}>
                                        <Typography
                                          variant="h5"
                                          color="secondary.main"
                                        >
                                          {(
                                            device.trafficOut /
                                            (1024 * 1024)
                                          ).toFixed(2)}{" "}
                                          MB
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          color="textSecondary"
                                        >
                                          Traffic Out
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  </Grid>

                                  <Divider sx={{ my: 2 }} />

                                  <Typography variant="subtitle2" gutterBottom>
                                    Risk Assessment
                                  </Typography>
                                  <Box sx={{ mb: 2 }}>
                                    <Grid container alignItems="center">
                                      <Grid item xs={4}>
                                        <Typography
                                          variant="body2"
                                          color="textSecondary"
                                        >
                                          Risk Score:
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={8}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              width: 200,
                                              height: 10,
                                              bgcolor: theme.palette.grey[300],
                                              borderRadius: 5,
                                              mr: 1,
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                width: `${
                                                  device.riskScore * 10
                                                }%`,
                                                height: "100%",
                                                bgcolor: getRiskScoreColor(
                                                  device.riskScore
                                                ),
                                                borderRadius: 5,
                                              }}
                                            />
                                          </Box>
                                          <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                          >
                                            {device.riskScore}/10
                                          </Typography>
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Box>

                                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      size="small"
                                      startIcon={<SecurityIcon />}
                                    >
                                      Run Security Scan
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      size="small"
                                      startIcon={<BuildIcon />}
                                    >
                                      Configure
                                    </Button>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}

              {paginatedDevices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="textSecondary">
                      No devices match your search criteria
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
          count={filteredDevices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default NetworkDevices;
