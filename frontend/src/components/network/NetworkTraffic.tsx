import React, { useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import BlockIcon from "@mui/icons-material/Block";
import TimelineIcon from "@mui/icons-material/Timeline";
import {
  NetworkDevice,
  TrafficData,
} from "../../pages/network/NetworkMonitoringPage";

// Interface for component props
interface NetworkTrafficProps {
  trafficData: TrafficData[];
  devices: NetworkDevice[];
}

const NetworkTraffic: React.FC<NetworkTrafficProps> = ({
  trafficData,
  devices,
}) => {
  const theme = useTheme();

  // State for time range filter
  const [timeRange, setTimeRange] = useState("24h");

  // State for protocol filter
  const [protocolFilter, setProtocolFilter] = useState<string>("all");

  // State for status filter
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // State for device filter
  const [deviceFilter, setDeviceFilter] = useState<string>("all");

  // State for search
  const [searchQuery, setSearchQuery] = useState("");

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter traffic data based on filters
  const filteredTrafficData = trafficData.filter((traffic) => {
    // Apply time range filter
    const now = new Date();
    let rangeStart: Date;

    switch (timeRange) {
      case "1h":
        rangeStart = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "6h":
        rangeStart = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case "24h":
        rangeStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        rangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        rangeStart = new Date(0); // All time
    }

    if (traffic.timestamp < rangeStart) {
      return false;
    }

    // Apply protocol filter
    if (protocolFilter !== "all" && traffic.protocol !== protocolFilter) {
      return false;
    }

    // Apply status filter
    if (statusFilter !== "all" && traffic.status !== statusFilter) {
      return false;
    }

    // Apply device filter
    if (deviceFilter !== "all" && traffic.deviceId !== deviceFilter) {
      return false;
    }

    // Apply search filter
    if (
      searchQuery &&
      !(
        traffic.sourceIp.includes(searchQuery) ||
        traffic.destinationIp.includes(searchQuery) ||
        traffic.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (traffic.serviceName &&
          traffic.serviceName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    ) {
      return false;
    }

    return true;
  });

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

  // Filter rows for current page
  const paginatedTrafficData = filteredTrafficData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate traffic statistics
  // Total traffic volume
  const totalBytes = filteredTrafficData.reduce(
    (sum, traffic) => sum + traffic.bytesTransferred,
    0
  );
  const totalMB = totalBytes / (1024 * 1024);

  // Traffic by protocol
  const trafficByProtocol = filteredTrafficData.reduce((acc, traffic) => {
    const protocol = traffic.protocol;
    if (!acc[protocol]) {
      acc[protocol] = 0;
    }
    acc[protocol] += traffic.bytesTransferred;
    return acc;
  }, {} as Record<string, number>);

  const protocolChartData = Object.entries(trafficByProtocol).map(
    ([protocol, bytes]) => ({
      name: protocol,
      value: bytes / (1024 * 1024), // Convert to MB
    })
  );

  // Traffic by status
  const trafficByStatus = filteredTrafficData.reduce((acc, traffic) => {
    const status = traffic.status;
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status] += traffic.bytesTransferred;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(trafficByStatus).map(
    ([status, bytes]) => ({
      name: status,
      value: bytes / (1024 * 1024), // Convert to MB
    })
  );

  // Traffic over time
  const getTimeIntervals = () => {
    const now = new Date();
    let intervalCount: number;
    let intervalMillis: number;

    switch (timeRange) {
      case "1h":
        intervalCount = 12;
        intervalMillis = 5 * 60 * 1000; // 5 minutes
        break;
      case "6h":
        intervalCount = 12;
        intervalMillis = 30 * 60 * 1000; // 30 minutes
        break;
      case "24h":
        intervalCount = 24;
        intervalMillis = 60 * 60 * 1000; // 1 hour
        break;
      case "7d":
        intervalCount = 7;
        intervalMillis = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "30d":
        intervalCount = 10;
        intervalMillis = 3 * 24 * 60 * 60 * 1000; // 3 days
        break;
      default:
        intervalCount = 24;
        intervalMillis = 60 * 60 * 1000; // 1 hour
    }

    return Array.from({ length: intervalCount }, (_, i) => {
      const endTime = new Date(now.getTime() - i * intervalMillis);
      const startTime = new Date(endTime.getTime() - intervalMillis);

      const intervalTraffic = filteredTrafficData.filter(
        (traffic) =>
          traffic.timestamp >= startTime && traffic.timestamp < endTime
      );

      const totalBytes = intervalTraffic.reduce(
        (sum, traffic) => sum + traffic.bytesTransferred,
        0
      );
      const totalMB = totalBytes / (1024 * 1024);

      let label: string;
      if (timeRange === "7d" || timeRange === "30d") {
        label = format(startTime, "MM/dd");
      } else if (timeRange === "24h" || timeRange === "6h") {
        label = format(startTime, "HH:mm");
      } else {
        label = format(startTime, "HH:mm:ss");
      }

      return {
        name: label,
        traffic: totalMB.toFixed(2),
      };
    }).reverse();
  };

  const timeChartData = getTimeIntervals();

  // Traffic by top source IPs
  const getTopSourceIPs = () => {
    const ipTraffic = filteredTrafficData.reduce((acc, traffic) => {
      const ip = traffic.sourceIp;
      if (!acc[ip]) {
        acc[ip] = 0;
      }
      acc[ip] += traffic.bytesTransferred;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(ipTraffic)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ip, bytes]) => ({
        name: ip,
        value: bytes / (1024 * 1024), // Convert to MB
      }));
  };

  const topSourceIPsData = getTopSourceIPs();

  // Traffic by top destination IPs
  const getTopDestinationIPs = () => {
    const ipTraffic = filteredTrafficData.reduce((acc, traffic) => {
      const ip = traffic.destinationIp;
      if (!acc[ip]) {
        acc[ip] = 0;
      }
      acc[ip] += traffic.bytesTransferred;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(ipTraffic)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ip, bytes]) => ({
        name: ip,
        value: bytes / (1024 * 1024), // Convert to MB
      }));
  };

  const topDestinationIPsData = getTopDestinationIPs();

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "allowed":
        return theme.palette.success.main;
      case "blocked":
        return theme.palette.error.main;
      case "suspicious":
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Pie chart colors
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.grey[500],
  ];

  return (
    <Box>
      {/* Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="6h">Last 6 Hours</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="all">All Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="protocol-label">Protocol</InputLabel>
              <Select
                labelId="protocol-label"
                value={protocolFilter}
                label="Protocol"
                onChange={(e) => setProtocolFilter(e.target.value)}
              >
                <MenuItem value="all">All Protocols</MenuItem>
                <MenuItem value="TCP">TCP</MenuItem>
                <MenuItem value="UDP">UDP</MenuItem>
                <MenuItem value="HTTP">HTTP</MenuItem>
                <MenuItem value="HTTPS">HTTPS</MenuItem>
                <MenuItem value="DNS">DNS</MenuItem>
                <MenuItem value="ICMP">ICMP</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="allowed">Allowed</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="suspicious">Suspicious</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="device-label">Device</InputLabel>
              <Select
                labelId="device-label"
                value={deviceFilter}
                label="Device"
                onChange={(e) => setDeviceFilter(e.target.value)}
              >
                <MenuItem value="all">All Devices</MenuItem>
                {devices.map((device) => (
                  <MenuItem key={device.id} value={device.id}>
                    {device.name} ({device.ip})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search by IP, protocol, or service..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Traffic Overview */}
      <Grid container spacing={3}>
        {/* Traffic Stats */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Traffic Over Time
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    label={{
                      value: "Traffic (MB)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <RechartsTooltip formatter={(value) => [`${value} MB`]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="traffic"
                    stroke={theme.palette.primary.main}
                    activeDot={{ r: 8 }}
                    name="Traffic Volume"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Traffic Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Traffic Summary
            </Typography>
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Total Traffic Volume
              </Typography>
              <Typography variant="h4" color="primary">
                {totalMB.toFixed(2)} MB
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Traffic by Status
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {Object.entries(trafficByStatus).map(([status, bytes]) => (
                  <Grid item xs={4} key={status}>
                    <Box sx={{ textAlign: "center" }}>
                      <Chip
                        label={status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(status),
                          color: "#fff",
                          mb: 1,
                        }}
                      />
                      <Typography variant="body2">
                        {(bytes / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Traffic by Protocol (Top 5)
              </Typography>
              {Object.entries(trafficByProtocol)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([protocol, bytes]) => (
                  <Box
                    key={protocol}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 1,
                    }}
                  >
                    <Typography variant="body2">{protocol}</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {(bytes / (1024 * 1024)).toFixed(2)} MB
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Paper>
        </Grid>

        {/* Protocol and Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribution by Protocol
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={protocolChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {protocolChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [`${value.toFixed(2)} MB`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Top Source and Destination IPs */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Source and Destination IPs
            </Typography>
            <Box sx={{ height: 300 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" align="center" gutterBottom>
                    Top Source IPs
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={topSourceIPsData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <RechartsTooltip formatter={(value) => [`${value} MB`]} />
                      <Bar
                        dataKey="value"
                        fill={theme.palette.primary.main}
                        name="Traffic (MB)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" align="center" gutterBottom>
                    Top Destination IPs
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={topDestinationIPsData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <RechartsTooltip formatter={(value) => [`${value} MB`]} />
                      <Bar
                        dataKey="value"
                        fill={theme.palette.secondary.main}
                        name="Traffic (MB)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Traffic Details Table */}
        <Grid item xs={12}>
          <Paper>
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Traffic Details</Typography>
              <Box>
                <Tooltip title="Export Data">
                  <IconButton>
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Timeline">
                  <IconButton>
                    <TimelineIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Protocol</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTrafficData.map((traffic) => (
                    <TableRow key={traffic.id} hover>
                      <TableCell>
                        {format(new Date(traffic.timestamp), "HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {traffic.sourceIp}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Port: {traffic.sourcePort}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {traffic.destinationIp}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Port: {traffic.destinationPort}
                        </Typography>
                      </TableCell>
                      <TableCell>{traffic.protocol}</TableCell>
                      <TableCell>{traffic.serviceName || "-"}</TableCell>
                      <TableCell>
                        {(traffic.bytesTransferred / 1024).toFixed(2)} KB
                      </TableCell>
                      <TableCell>{traffic.duration} ms</TableCell>
                      <TableCell>
                        <Chip
                          label={traffic.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(traffic.status),
                            color: "#fff",
                            textTransform: "capitalize",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {traffic.status !== "blocked" && (
                          <Tooltip title="Block Traffic">
                            <IconButton size="small">
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedTrafficData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          No traffic data matches your criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredTrafficData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NetworkTraffic;
