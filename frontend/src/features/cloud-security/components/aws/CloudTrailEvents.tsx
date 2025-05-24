import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Divider,
  Tooltip,
  useTheme,
  SelectChangeEvent,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  CloudDownload as DownloadIcon,
  Info as InfoIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import {
  useGetCloudTrailEventsQuery,
  useGetCloudTrailEventsByServiceQuery,
} from "../../services/awsSecurityService";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";

interface CloudTrailEventsProps {
  accountId: string;
}

/**
 * CloudTrail Events Component
 * Displays AWS CloudTrail events with filtering and search capabilities
 */
const CloudTrailEvents: React.FC<CloudTrailEventsProps> = ({ accountId }) => {
  const theme = useTheme();

  // Local state for filters and pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [service, setService] = useState<string>("");
  const [eventName, setEventName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("eventTime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Prepare filter parameters for API
  const filter = {
    service: service || undefined,
    eventName: eventName || undefined,
    username: username || undefined,
    sortBy,
    sortDirection,
  };

  // Fetch CloudTrail events
  const {
    data: events,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCloudTrailEventsQuery({
    accountId,
    startTime: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endTime: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    filter,
  });

  // Fetch event counts by service for chart
  const { data: serviceData } = useGetCloudTrailEventsByServiceQuery({
    accountId,
    startTime: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    endTime: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  // Handle sort column change
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  // Handle pagination changes
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle service filter change
  const handleServiceChange = (event: SelectChangeEvent) => {
    setService(event.target.value);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setPage(0);
    refetch();
  };

  // Reset filters
  const handleResetFilters = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setEndDate(new Date());
    setService("");
    setEventName("");
    setUsername("");
    setSortBy("eventTime");
    setSortDirection("desc");
    setPage(0);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!events) return;

    const csvHeader = "Event Time,Event Name,Source,Username,Resource,Region\n";
    const csvContent = events
      .map((event) => {
        const eventTime = event.eventTime
          ? new Date(event.eventTime).toLocaleString()
          : "";
        const resourceName =
          event.resources?.length > 0 ? event.resources[0].ARN : "";
        return `${eventTime},"${event.eventName}",${event.eventSource},${
          event.userIdentity?.userName || ""
        },"${resourceName}",${event.awsRegion}`;
      })
      .join("\n");

    const csvData = `${csvHeader}${csvContent}`;
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `cloudtrail-events-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format service name for display
  const formatServiceName = (service: string) => {
    if (!service) return "";
    return service.replace(".amazonaws.com", "");
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2">
          CloudTrail Events
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={() => refetch()} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to CSV">
            <IconButton
              onClick={handleExportCSV}
              disabled={isLoading || !events}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          <FilterIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Filters
        </Typography>

        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { size: "small", sx: { width: 200 } } }}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { size: "small", sx: { width: 200 } } }}
            />
          </LocalizationProvider>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="service-label">Service</InputLabel>
            <Select
              labelId="service-label"
              value={service}
              label="Service"
              onChange={handleServiceChange}
            >
              <MenuItem value="">All Services</MenuItem>
              {serviceData?.map((item, index) => (
                <MenuItem key={index} value={item.service}>
                  {formatServiceName(item.service)} ({item.count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Event Name"
            size="small"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          <TextField
            label="Username"
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleApplyFilters}
              startIcon={<SearchIcon />}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Service Distribution Chart */}
      {serviceData && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Event Distribution by Service
          </Typography>
          <Box sx={{ height: 300, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceData.slice(0, 10)}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="service"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatServiceName}
                />
                <YAxis />
                <ChartTooltip
                  formatter={(value, name, props) => [value, "Events"]}
                  labelFormatter={(label) => formatServiceName(label)}
                />
                <Bar
                  dataKey="count"
                  name="Events"
                  fill={theme.palette.primary.main}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {/* Events Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">
            Error loading CloudTrail events:{" "}
            {(error as any)?.data?.message || "Unknown error"}
          </Alert>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="CloudTrail events table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      onClick={() => handleSortChange("eventTime")}
                      sx={{ cursor: "pointer", fontWeight: "bold" }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Time
                        {sortBy === "eventTime" &&
                          (sortDirection === "asc" ? (
                            <ArrowUpwardIcon fontSize="small" />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell
                      onClick={() => handleSortChange("eventName")}
                      sx={{ cursor: "pointer", fontWeight: "bold" }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Event
                        {sortBy === "eventName" &&
                          (sortDirection === "asc" ? (
                            <ArrowUpwardIcon fontSize="small" />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell
                      onClick={() => handleSortChange("eventSource")}
                      sx={{ cursor: "pointer", fontWeight: "bold" }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        Service
                        {sortBy === "eventSource" &&
                          (sortDirection === "asc" ? (
                            <ArrowUpwardIcon fontSize="small" />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" />
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Region</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events &&
                    events
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((event, index) => (
                        <TableRow hover key={index}>
                          <TableCell>
                            {event.eventTime
                              ? new Date(event.eventTime).toLocaleString()
                              : ""}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View event details">
                              <Typography
                                sx={{
                                  cursor: "pointer",
                                  color: theme.palette.primary.main,
                                  "&:hover": { textDecoration: "underline" },
                                }}
                              >
                                {event.eventName}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {formatServiceName(event.eventSource)}
                          </TableCell>
                          <TableCell>
                            {event.userIdentity?.userName ||
                              event.userIdentity?.type ||
                              "System"}
                          </TableCell>
                          <TableCell>
                            {event.resources?.length > 0 ? (
                              <Tooltip title={event.resources[0].ARN}>
                                <Typography
                                  sx={{
                                    maxWidth: 300,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {event.resources[0].ARN}
                                </Typography>
                              </Tooltip>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{event.awsRegion}</TableCell>
                        </TableRow>
                      ))}

                  {(!events || events.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" sx={{ py: 2 }}>
                          No CloudTrail events found matching your filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={events?.length || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default CloudTrailEvents;
